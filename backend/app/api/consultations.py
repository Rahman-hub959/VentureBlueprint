from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.consultation import Consultation
from app.models.user import User, Notification
from app.schemas.consultation import (
    ConsultationCreate,
    ConsultationResponse,
    ConsultationStatusUpdate,
    SendQuestionnaireRequest,
    ShareExpertRequest,
    SendDocumentRequest,
)
from app.api.deps import get_current_user, get_optional_current_user, get_current_admin_user
from app.services.notification_service import notify_admin, notify_user
from app.document_engine.pdf_generator import build_consultation_summary_pdf

router = APIRouter(prefix="/consultations", tags=["consultations"])

# Persistent directory for structured consultation PDF files
STORAGE_CONSULTATION_DOCS = Path(__file__).resolve().parent.parent.parent / "storage" / "consultation_docs"
STORAGE_CONSULTATION_DOCS.mkdir(parents=True, exist_ok=True)

EXPERT_MAP = {
    "CS": {
        "name": "CS Priyanjali Sen",
        "role": "FCS #11428 · Senior Secretarial Lead",
    },
    "CA": {
        "name": "CA Aniket Kulkarni",
        "role": "FCA #418290 · Chartered Accountant & Tax Partner",
    },
    "LAW": {
        "name": "Adv. Rajesh Varma",
        "role": "Bar Council KAR/2012/842 · High Court Advocate",
    },
    "GENERAL": {
        "name": "CorpSetu Senior Partner Desk",
        "role": "Multi-Disciplinary Corporate Advisory Lead",
    },
}

@router.post("", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_consultation(
    payload: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Register a new consultation request in the database.
    Can be called by authenticated users or prospective clients.
    Automatically compiles an official structured PDF table summary and dispatches confirmation email.
    """
    user_id = current_user.id if current_user else None
    email = payload.email
    full_name = payload.full_name

    # If authenticated, inherit user metadata if not explicitly provided
    if current_user:
        if not full_name:
            full_name = current_user.full_name
        if not email:
            email = current_user.email
    elif email:
        matched_user = db.query(User).filter(User.email == email).first()
        if matched_user:
            user_id = matched_user.id

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid contact email is required to register a consultation"
        )
    if not full_name:
        full_name = "Client"

    # Normalize pillar
    pillar_key = payload.pillar.upper() if payload.pillar else "GENERAL"
    if pillar_key not in EXPERT_MAP:
        pillar_key = "GENERAL"

    expert_info = EXPERT_MAP[pillar_key]

    consultation = Consultation(
        user_id=user_id,
        full_name=full_name,
        email=email,
        phone_number=payload.phone_number,
        alternate_phone=payload.alternate_phone,
        company_name=payload.company_name,
        pillar=pillar_key,
        service_category=payload.service_category or payload.topic,
        preferred_entity_type=payload.preferred_entity_type,
        topic=payload.topic,
        preferred_date=payload.preferred_date or "Within 24 to 48 Hours",
        preferred_time_slot=payload.preferred_time_slot or "Within 24 to 48 Hours",
        status="Requested",
        assigned_expert=expert_info["name"],
        expert_role=expert_info["role"],
        notes=payload.notes,
        meeting_platform="Direct Phone & Verified Advisory",
    )

    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # 1. Generate Structured Table PDF Summary
    pdf_filename = f"consultation_summary_{consultation.id}.pdf"
    pdf_path = STORAGE_CONSULTATION_DOCS / pdf_filename
    try:
        build_consultation_summary_pdf(
            output_path=pdf_path,
            data={
                "id": consultation.id,
                "pillar": consultation.pillar,
                "full_name": consultation.full_name,
                "email": consultation.email,
                "phone_number": consultation.phone_number,
                "alternate_phone": consultation.alternate_phone,
                "company_name": consultation.company_name,
                "service_category": consultation.service_category,
                "preferred_entity_type": consultation.preferred_entity_type,
                "topic": consultation.topic,
                "notes": consultation.notes,
                "assigned_expert": consultation.assigned_expert,
                "expert_role": consultation.expert_role,
                "preferred_time_slot": consultation.preferred_time_slot,
            }
        )
        consultation.pdf_summary_url = f"/api/v1/consultations/{consultation.id}/pdf"
        db.commit()
    except Exception as pdf_err:
        import logging
        logging.getLogger("ventureblueprint.consultations").error(f"Failed to generate structured PDF: {pdf_err}")

    # 2. Dispatch Confirmation Email with mandatory 24-48 hr notice & PDF link
    try:
        from app.services.email_service import send_consultation_confirmation_email
        send_consultation_confirmation_email(
            recipient_email=consultation.email,
            recipient_name=consultation.full_name,
            reference_id=consultation.id,
            pillar=consultation.pillar,
            assigned_expert=consultation.assigned_expert,
            expert_role=consultation.expert_role,
            topic=consultation.topic,
            phone_number=consultation.phone_number,
            alternate_phone=consultation.alternate_phone,
            preferred_date=consultation.preferred_date,
            preferred_time_slot=consultation.preferred_time_slot,
            company_name=consultation.company_name,
            service_category=consultation.service_category,
            preferred_entity_type=consultation.preferred_entity_type,
            pdf_download_url=consultation.pdf_summary_url
        )
    except Exception:
        pass

    # 3. Record in-app notification if user is logged in
    if user_id:
        notif = Notification(
            user_id=user_id,
            title=f"Consultation Confirmed: {consultation.id}",
            message=f"Your request has been assigned and sent the details about your consultation to {consultation.email}. Our team will contact you within 24 to 48 hours.",
            category="success",
            link="/consultations"
        )
        db.add(notif)
        db.commit()

    # 4. Alert administrators in real-time
    alt_info = f", Alt: {consultation.alternate_phone}" if consultation.alternate_phone else ""
    notify_admin(
        db=db,
        title=f"New {consultation.pillar} Request: {consultation.topic}",
        message=f"Client {consultation.full_name} ({consultation.phone_number}{alt_info}, {consultation.email}) requested {consultation.pillar} advisory for '{consultation.service_category or consultation.topic}'.",
        category="admin_alert",
        link="/admin/consultations"
    )

    return consultation

@router.get("/{id}/pdf")
def download_consultation_pdf(id: str, db: Session = Depends(get_db)):
    """
    Download the official structured table PDF summary for a consultation request.
    If not yet on disk, it is generated dynamically.
    """
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation {id} not found"
        )

    pdf_filename = f"consultation_summary_{consultation.id}.pdf"
    pdf_path = STORAGE_CONSULTATION_DOCS / pdf_filename

    if not pdf_path.exists():
        build_consultation_summary_pdf(
            output_path=pdf_path,
            data={
                "id": consultation.id,
                "pillar": consultation.pillar,
                "full_name": consultation.full_name,
                "email": consultation.email,
                "phone_number": consultation.phone_number,
                "alternate_phone": consultation.alternate_phone,
                "company_name": consultation.company_name,
                "service_category": consultation.service_category,
                "preferred_entity_type": consultation.preferred_entity_type,
                "topic": consultation.topic,
                "notes": consultation.notes,
                "assigned_expert": consultation.assigned_expert,
                "expert_role": consultation.expert_role,
                "preferred_time_slot": consultation.preferred_time_slot,
            }
        )

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"CorpSetu_Consultation_{consultation.id}.pdf"
    )

@router.post("/{id}/send-questionnaire", response_model=ConsultationResponse)
def admin_send_questionnaire(
    id: str,
    payload: SendQuestionnaireRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    Admin action: Send questionnaire link to client email once payment/consultation is confirmed.
    """
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    from app.services.email_service import send_questionnaire_link_email
    send_questionnaire_link_email(
        recipient_email=consultation.email,
        recipient_name=consultation.full_name,
        reference_id=consultation.id,
        pillar=payload.pillar or consultation.pillar,
        custom_message=payload.custom_message
    )

    consultation.questionnaire_sent_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consultation)
    return consultation

@router.post("/{id}/share-expert", response_model=ConsultationResponse)
def admin_share_expert(
    id: str,
    payload: ShareExpertRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    Admin action: Share empanelled CA or Advocate credentials & contact details with client.
    """
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    from app.services.email_service import send_expert_details_email
    send_expert_details_email(
        recipient_email=consultation.email,
        recipient_name=consultation.full_name,
        reference_id=consultation.id,
        pillar=consultation.pillar,
        expert_name=payload.expert_name,
        expert_role=payload.expert_role,
        expert_email=payload.expert_email,
        expert_phone=payload.expert_phone,
        custom_note=payload.custom_note
    )

    consultation.assigned_expert = payload.expert_name
    consultation.expert_role = payload.expert_role
    consultation.expert_shared_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consultation)
    return consultation

@router.post("/{id}/send-document", response_model=ConsultationResponse)
def admin_send_document(
    id: str,
    payload: SendDocumentRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    Admin action: Email the compiled statutory document / blueprint directly to client's registered email.
    """
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    doc_title = payload.document_title or "Company Setup Blueprint & Statutory Dossier"
    download_url = f"/api/v1/consultations/{consultation.id}/pdf"

    from app.services.email_service import send_generated_document_email
    send_generated_document_email(
        recipient_email=consultation.email,
        recipient_name=consultation.full_name,
        reference_id=consultation.id,
        doc_title=doc_title,
        download_url=download_url,
        custom_message=payload.custom_message
    )

    consultation.document_sent_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consultation)
    return consultation

@router.get("", response_model=List[ConsultationResponse])
def list_user_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all consultations:
    - If Administrator: returns ALL client consultation requests across the platform.
    - If Client: returns only consultations associated with current user.
    """
    is_admin = current_user.role and current_user.role.name == "Administrator"
    if is_admin:
        return db.query(Consultation).order_by(Consultation.created_at.desc()).all()

    return db.query(Consultation).filter(
        (Consultation.user_id == current_user.id) | (Consultation.email == current_user.email)
    ).order_by(Consultation.created_at.desc()).all()

@router.get("/{id}", response_model=ConsultationResponse)
def get_consultation(
    id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Retrieve details for a single consultation record.
    """
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation {id} not found"
        )
    return consultation

@router.patch("/{id}/cancel", response_model=ConsultationResponse)
def cancel_consultation(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a pending or requested consultation.
    """
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation {id} not found"
        )

    # Ensure user owns the consultation
    if consultation.user_id != current_user.id and consultation.email != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this consultation"
        )

    consultation.status = "Cancelled"
    consultation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consultation)
    return consultation

@router.patch("/{id}/status", response_model=ConsultationResponse)
def update_consultation_status(
    id: str,
    payload: ConsultationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Admin endpoint to update consultation workflow status, assigned partner, or resolution summary.
    """
    consultation = db.query(Consultation).filter(Consultation.id == id).first()
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation {id} not found"
        )

    if payload.status:
        consultation.status = payload.status
    if payload.assigned_expert:
        consultation.assigned_expert = payload.assigned_expert
    if payload.expert_role:
        consultation.expert_role = payload.expert_role
    if payload.notes:
        consultation.notes = payload.notes
    if payload.resolution_summary:
        consultation.resolution_summary = payload.resolution_summary
    if payload.meeting_platform:
        consultation.meeting_platform = payload.meeting_platform
    if payload.alternate_phone:
        consultation.alternate_phone = payload.alternate_phone
    if payload.service_category:
        consultation.service_category = payload.service_category

    consultation.updated_at = datetime.now(timezone.utc)

    # Notify client if linked to a user
    target_user_id = consultation.user_id
    if not target_user_id and consultation.email:
        user_match = db.query(User).filter(User.email == consultation.email).first()
        if user_match:
            target_user_id = user_match.id

    if target_user_id:
        if consultation.status in ["Consulted", "Consulted & Accepted"]:
            msg = f"Your consultation regarding '{consultation.topic}' has been marked as Consulted by our advisory team."
            cat = "success"
        elif consultation.status in ["Not Accepted", "Consulted & Not Accepted"]:
            msg = f"Your consultation regarding '{consultation.topic}' has concluded and the request is marked as Not Accepted / Closed."
            cat = "warning"
        else:
            msg = f"Your consultation status has been updated to '{consultation.status}'."
            cat = "info"

        notif = Notification(
            user_id=target_user_id,
            title=f"Consultation Status: {consultation.status}",
            message=msg,
            category=cat,
            link="/consultations"
        )
        db.add(notif)

    # Dispatch email update to client's registered email
    if consultation.email:
        try:
            from app.services.email_service import send_consultation_status_update_email
            send_consultation_status_update_email(
                recipient_email=consultation.email,
                recipient_name=consultation.full_name,
                reference_id=consultation.id,
                status=consultation.status,
                topic=consultation.topic,
                expert_name=consultation.assigned_expert
            )
        except Exception:
            pass

    db.commit()
    db.refresh(consultation)
    return consultation
