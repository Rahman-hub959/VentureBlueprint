from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.complaint import Complaint
from app.models.user import User, Notification
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/complaints", tags=["complaints"])

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
        "name": "CorpSetu Senior Grievance Lead",
        "role": "Multi-Disciplinary Redressal Officer",
    },
}

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Log a new grievance ticket in the database.
    Can be logged by authenticated clients or public users.
    """
    user_id = current_user.id if current_user else None
    email = payload.email or (current_user.email if current_user else None)
    company_name = payload.company_name or "Client Company"

    pillar_key = payload.pillar.upper() if payload.pillar else "CS"
    if pillar_key not in EXPERT_MAP:
        pillar_key = "CS"

    expert_info = EXPERT_MAP[pillar_key]

    complaint = Complaint(
        user_id=user_id,
        company_name=company_name,
        email=email,
        phone_number=payload.phone_number,
        pillar=pillar_key,
        category=payload.category,
        priority=payload.priority or "Standard",
        status="Registered",
        assigned_expert=expert_info["name"],
        expert_role=expert_info["role"],
        description=payload.description,
        resolution_note="Assigned to specialist desk. Initial assessment underway."
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    if user_id:
        notif = Notification(
            user_id=user_id,
            title=f"Grievance Ticket Registered ({complaint.id})",
            message=f"Your grievance regarding '{complaint.category}' has been assigned to {complaint.assigned_expert}. Our team will review and contact you.",
            category="info",
            link="/complaints"
        )
        db.add(notif)
        db.commit()

    return complaint

@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    List complaints for current user, or return all active grievance records.
    """
    if current_user:
        return db.query(Complaint).filter(
            (Complaint.user_id == current_user.id) | (Complaint.email == current_user.email)
        ).order_by(Complaint.created_at.desc()).all()
    else:
        return db.query(Complaint).order_by(Complaint.created_at.desc()).limit(30).all()

@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint(
    id: str,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grievance ticket not found")
    return complaint
