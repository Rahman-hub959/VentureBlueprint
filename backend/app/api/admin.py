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
    active_rules = db.query(RegulatoryRule).filter(RegulatoryRule.status == "Published").count()
    draft_rules = db.query(RegulatoryRule).filter(RegulatoryRule.status != "Published").count()

    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_documents": total_documents,
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
            "role": u.role.name if u.role else "Entrepreneur",
            "is_active": u.is_active,
            "created_at": u.created_at,
            "project_count": len(u.projects)
        }
        for u in users
    ]

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
