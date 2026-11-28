import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User, Role
from app.models.project import StartupProject
from app.models.document import GeneratedDocument
from app.models.regulation import RegulatoryRule, RegulatoryRuleVersion, RegulatoryReview
from app.models.consultation import Consultation
from app.models.complaint import Complaint
from app.models.audit import AuditLog
from app.api.deps import get_current_admin_user
from app.config import settings

router = APIRouter(prefix="/admin", tags=["Administrator Portal"])

@router.get("/stats")
def get_admin_stats(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_projects = db.query(StartupProject).count()
    total_documents = db.query(GeneratedDocument).count()
    
    total_consultations = db.query(Consultation).count()
    pending_consultations = db.query(Consultation).filter(Consultation.status == "Requested").count()
    consulted_count = db.query(Consultation).filter(
        Consultation.status.in_(["Consulted", "Consulted & Accepted"])
    ).count()
    not_accepted_count = db.query(Consultation).filter(
        Consultation.status.in_(["Not Accepted", "Consulted & Not Accepted"])
    ).count()
    
    total_complaints = db.query(Complaint).count()
    active_rules = db.query(RegulatoryRule).filter(RegulatoryRule.status == "Published").count()
    draft_rules = db.query(RegulatoryRule).filter(RegulatoryRule.status != "Published").count()

    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_documents": total_documents,
        "total_consultations": total_consultations,
        "pending_consultations": pending_consultations,
        "consulted_count": consulted_count,
        "not_accepted_count": not_accepted_count,
        "total_complaints": total_complaints,
        "active_regulatory_rules": active_rules,
        "pending_review_rules": draft_rules,
        "storage_directory": str(settings.STORAGE_DIR),
        "system_status": "Operational"
    }

@router.get("/users")
def list_all_users(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(desc(User.created_at)).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone_number": u.phone_number,
            "role": u.role.name if u.role else "Entrepreneur",
            "is_active": u.is_active,
            "created_at": u.created_at,
            "project_count": len(u.projects)
        }
        for u in users
    ]

@router.get("/service-tracker")
def get_client_service_tracker(
    search: Optional[str] = None,
    service_filter: Optional[str] = None,  # ALL, CS, CA, LAW
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(desc(User.created_at)).all()
    tracker_list = []

    for u in users:
        # Exclude administrative system users from client service tracker
        if u.role and u.role.name == "Administrator":
            continue

        # CS Projects
        projects = db.query(StartupProject).filter(StartupProject.user_id == u.id).all()
        
        # User Generated Documents
        docs = db.query(GeneratedDocument).filter(GeneratedDocument.user_id == u.id).order_by(desc(GeneratedDocument.generated_at)).all()
        
        # Consultations
        consults = db.query(Consultation).filter(
            (Consultation.user_id == u.id) | (Consultation.email == u.email)
        ).order_by(desc(Consultation.created_at)).all()
        
        cs_consults = [c for c in consults if c.pillar == "CS"]
        ca_consults = [c for c in consults if c.pillar == "CA"]
        law_consults = [c for c in consults if c.pillar == "LAW"]
        general_consults = [c for c in consults if c.pillar == "GENERAL"]

        # Audit Logs / Timeline
        audit_logs = db.query(AuditLog).filter(
            (AuditLog.user_id == u.id) | (AuditLog.details.like(f"%{u.email}%"))
        ).order_by(desc(AuditLog.timestamp)).limit(10).all()

        # Compute active services
        active_pillars = []
        if len(projects) > 0 or len(cs_consults) > 0:
            active_pillars.append("CS")
        if len(ca_consults) > 0:
            active_pillars.append("CA")
        if len(law_consults) > 0:
            active_pillars.append("LAW")
        if not active_pillars and len(general_consults) > 0:
            active_pillars.append("GENERAL")
        if not active_pillars:
            active_pillars.append("CS")

        company_names = [p.name for p in projects]
        preferred_structures = list(set([p.preferred_structure for p in projects if p.preferred_structure]))

        doc_items = [
            {
                "id": d.id,
                "title": d.title,
                "document_type": d.document_type,
                "file_format": d.file_format,
                "project_id": d.project_id,
                "status": d.status,
                "generated_at": d.generated_at.isoformat() if d.generated_at else None
            }
            for d in docs
        ]

        item = {
            "user_id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone_number": u.phone_number or "Not Provided",
            "is_active": u.is_active,
            "joined_at": u.created_at.isoformat() if u.created_at else None,
            "active_pillars": active_pillars,
            
            # CS Services Dossier
            "primary_company_name": company_names[0] if company_names else None,
            "company_names": company_names,
            "preferred_structures": preferred_structures,
            "projects_count": len(projects),
            "projects": [
                {
                    "id": p.id,
                    "name": p.name,
                    "domain": p.domain,
                    "structure": p.preferred_structure,
                    "completion_percentage": p.completion_percentage,
                    "status": p.status,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in projects
            ],
            
            # Document Generation Status
            "has_generated_documents": len(docs) > 0,
            "generated_documents_count": len(docs),
            "generated_documents": doc_items,

            # CA Services Dossier
            "ca_inquiries_count": len(ca_consults),
            "ca_consultations": [
                {
                    "id": c.id,
                    "topic": c.topic,
                    "status": c.status,
                    "preferred_time_slot": c.preferred_time_slot,
                    "preferred_date": c.preferred_date,
                    "assigned_expert": c.assigned_expert,
                    "created_at": c.created_at.isoformat() if c.created_at else None
                }
                for c in ca_consults
            ],

            # LAW Services Dossier
            "law_inquiries_count": len(law_consults),
            "law_consultations": [
                {
                    "id": c.id,
                    "topic": c.topic,
                    "status": c.status,
                    "preferred_time_slot": c.preferred_time_slot,
                    "preferred_date": c.preferred_date,
                    "assigned_expert": c.assigned_expert,
                    "created_at": c.created_at.isoformat() if c.created_at else None
                }
                for c in law_consults
            ],

            # Activity Log
            "activity_timeline": [
                {
                    "id": l.id,
                    "action": l.action,
                    "entity_type": l.entity_type,
                    "details": l.details,
                    "timestamp": l.timestamp.isoformat() if l.timestamp else None
                }
                for l in audit_logs
            ]
        }

        if search:
            q = search.lower()
            match_name = q in u.full_name.lower()
            match_email = q in u.email.lower()
            match_phone = q in (u.phone_number or "")
            match_company = any(q in c.lower() for c in company_names)
            if not (match_name or match_email or match_phone or match_company):
                continue

        if service_filter and service_filter != "ALL":
            if service_filter not in active_pillars:
                continue

        tracker_list.append(item)

    return tracker_list

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "user_email": l.user.email if l.user else "System",
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "timestamp": l.timestamp
        }
        for l in logs
    ]

@router.post("/rules/{rule_id}/transition")
def transition_rule_status(
    rule_id: str,
    action: str,  # "submit_for_review", "approve", "publish", "supersede"
    comments: Optional[str] = None,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    rule = db.query(RegulatoryRule).filter(RegulatoryRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")

    workflow_transitions = {
        "submit_for_review": ("Draft", "Review"),
        "approve": ("Review", "Approved"),
        "publish": ("Approved", "Published"),
        "supersede": ("Published", "Superseded")
    }

    if action not in workflow_transitions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Options: {list(workflow_transitions.keys())}")

    expected_prev, next_status = workflow_transitions[action]
    if rule.status != expected_prev and action != "publish":
        raise HTTPException(
            status_code=400, 
            detail=f"Rule currently in '{rule.status}', expected '{expected_prev}' for action '{action}'"
        )

    prev_status = rule.status
    rule.status = next_status
    rule.last_reviewed_at = datetime.now(timezone.utc)
    rule.reviewer_id = admin.id

    review = RegulatoryReview(
        rule_id=rule.id,
        reviewer_id=admin.id,
        previous_status=prev_status,
        new_status=next_status,
        comments=comments or f"Transitioned via Admin API action: {action}"
    )
    db.add(review)

    audit = AuditLog(
        user_id=admin.id,
        action="RULE_STATUS_TRANSITION",
        entity_type="regulatory_rule",
        entity_id=rule.id,
        details={"from": prev_status, "to": next_status, "rule_code": rule.rule_code}
    )
    db.add(audit)
    db.commit()

    return {"rule_id": rule.id, "new_status": next_status, "message": f"Rule successfully transitioned to {next_status}"}

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Test DB connectivity
    try:
        user_count = db.query(User).count()
        db_status = "Connected"
    except Exception as e:
        db_status = f"Error: {str(e)}"

    storage_writable = os.access(settings.STORAGE_DIR, os.W_OK)

    return {
        "status": "healthy" if db_status == "Connected" and storage_writable else "degraded",
        "database": db_status,
        "storage": {
            "path": str(settings.STORAGE_DIR),
            "writable": storage_writable
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
