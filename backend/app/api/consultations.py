from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.consultation import Consultation
from app.models.user import User, Notification
from app.schemas.consultation import ConsultationCreate, ConsultationResponse
from app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/consultations", tags=["consultations"])

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
    Can be called by authenticated users or public prospective clients.
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
        # Check if an existing registered user matches this email
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
        company_name=payload.company_name,
        pillar=pillar_key,
        topic=payload.topic,
        preferred_date=payload.preferred_date or "Within 24 Hours",
        preferred_time_slot=payload.preferred_time_slot or "Morning (10:00 AM - 1:00 PM)",
        status="Requested",
        assigned_expert=expert_info["name"],
        expert_role=expert_info["role"],
        notes=payload.notes,
        meeting_platform="Google Meet / Encrypted Video",
    )

    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # Attach meeting link using the assigned ID
    consultation.meeting_link = f"https://meet.google.com/setu-{consultation.id.lower().replace('_', '-')}"
    db.commit()
    db.refresh(consultation)

    # If linked to a registered user, record an in-app notification
    if user_id:
        notif = Notification(
            user_id=user_id,
            title=f"Consultation Request Confirmed ({consultation.id})",
            message=f"Your consultation request for {consultation.topic} has been registered with {consultation.assigned_expert}. In a short period of time our team will contact you with meeting coordinates.",
            category="success",
            link="/consultations"
        )
        db.add(notif)
        db.commit()

    return consultation

@router.get("", response_model=List[ConsultationResponse])
def list_user_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all consultations booked by the authenticated user.
    """
    consultations = db.query(Consultation).filter(
        (Consultation.user_id == current_user.id) | (Consultation.email == current_user.email)
    ).order_by(Consultation.created_at.desc()).all()

    return consultations

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
