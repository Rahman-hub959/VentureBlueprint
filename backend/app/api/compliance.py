from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import StartupProject
from app.models.regulation import RegulatoryRule
from app.models.compliance import ComplianceAssessment, AssessmentRuleResult, ComplianceTask
from app.api.deps import get_user_project, get_current_user
from app.schemas.all_schemas import TaskCreate, TaskUpdate
from app.rules_engine.compliance_evaluator import evaluate_project_compliance
from app.rules_engine.role_recommender import recommend_roles

router = APIRouter(prefix="/compliance", tags=["Compliance & Tasks Engine"])

@router.post("/projects/{project_id}/assess")
def assess_project(
    project: StartupProject = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    """
    Evaluates regulatory compliance for the project based on official rules in the database.
    Populates ComplianceAssessment and initializes interactive ComplianceTasks.
    """
    rules = db.query(RegulatoryRule).filter(RegulatoryRule.status == "Published").all()
    rules_dict = [
        {
            "rule_code": r.rule_code,
            "title": r.title,
            "category": r.category,
            "obligation_type": r.obligation_type,
            "applicable_structure": r.applicable_structure,
            "applicable_domain": r.applicable_domain,
            "legal_provision": r.legal_provision,
            "official_source_url": r.official_source_url
        }
        for r in rules
    ]

    profile_dict = project.business_profile.__dict__ if project.business_profile else {}
    founders_dict = [f.__dict__ for f in project.founders]

    evaluation = evaluate_project_compliance(
        project_data={
            "preferred_structure": project.preferred_structure or "Private Limited Company",
            "domain": project.domain,
            "founders": founders_dict,
            "profile": profile_dict
        },
        rules=rules_dict
    )

    # Persist ComplianceAssessment record
    assessment = ComplianceAssessment(
        project_id=project.id,
        structure_evaluated=evaluation["structure_evaluated"],
        total_rules_assessed=evaluation["total_rules_assessed"],
        passed_count=evaluation["passed_count"],
        warning_count=evaluation["warning_count"],
        failed_count=evaluation["failed_count"],
        missing_info_count=evaluation["missing_info_count"],
        professional_review_count=evaluation["professional_review_count"],
        unverified_count=evaluation["unverified_count"]
    )
    db.add(assessment)
    db.flush()

    for r_res in evaluation["rule_results"]:
        arr = AssessmentRuleResult(
            assessment_id=assessment.id,
            rule_code=r_res["rule_code"],
            rule_title=r_res["rule_title"],
            category=r_res["category"],
            obligation_type=r_res["obligation_type"],
            status=r_res["status"],
            finding_summary=r_res["finding_summary"],
            action_required=r_res["action_required"],
            legal_provision=r_res.get("legal_provision"),
            official_source_url=r_res.get("official_source_url")
        )
        db.add(arr)

        # Sync/Create corresponding interactive ComplianceTask if not already present
        existing_task = db.query(ComplianceTask).filter(
            ComplianceTask.project_id == project.id,
            ComplianceTask.rule_code == r_res["rule_code"]
        ).first()

        if not existing_task:
            task_status = "Completed" if r_res["status"] == "Passed" else "Not Started"
            ct = ComplianceTask(
                project_id=project.id,
                rule_code=r_res["rule_code"],
                title=r_res["rule_title"],
                category=r_res["category"].lower(),
                description=f"{r_res['finding_summary']} — Action: {r_res['action_required']}",
                obligation=r_res["obligation_type"],
                status=task_status,
                official_url=r_res.get("official_source_url")
            )
            db.add(ct)

    project.completion_percentage = max(project.completion_percentage, 80)
    db.commit()

    return evaluation

@router.get("/projects/{project_id}/assessment")
def get_latest_assessment(
    project: StartupProject = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    latest = db.query(ComplianceAssessment).filter(
        ComplianceAssessment.project_id == project.id
    ).order_by(ComplianceAssessment.assessed_at.desc()).first()

    if not latest:
        # Trigger on-demand assessment if none exists
        return assess_project(project, db)

    return {
        "assessment_id": latest.id,
        "structure_evaluated": latest.structure_evaluated,
        "total_rules_assessed": latest.total_rules_assessed,
        "passed_count": latest.passed_count,
        "warning_count": latest.warning_count,
        "failed_count": latest.failed_count,
        "missing_info_count": latest.missing_info_count,
        "professional_review_count": latest.professional_review_count,
        "unverified_count": latest.unverified_count,
        "assessed_at": latest.assessed_at,
        "rule_results": [
            {
                "id": r.id,
                "rule_code": r.rule_code,
                "rule_title": r.rule_title,
                "category": r.category,
                "obligation_type": r.obligation_type,
                "status": r.status,
                "finding_summary": r.finding_summary,
                "action_required": r.action_required,
                "legal_provision": r.legal_provision,
                "official_source_url": r.official_source_url
            }
            for r in latest.rule_results
        ]
    }

@router.get("/projects/{project_id}/tasks")
def list_tasks(
    project: StartupProject = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    tasks = db.query(ComplianceTask).filter(ComplianceTask.project_id == project.id).all()
    if not tasks:
        # If no tasks yet, run assessment to initialize them
        assess_project(project, db)
        tasks = db.query(ComplianceTask).filter(ComplianceTask.project_id == project.id).all()

    return [
        {
            "id": t.id,
            "rule_code": t.rule_code,
            "title": t.title,
            "category": t.category,
            "description": t.description,
            "obligation": t.obligation,
            "status": t.status,
            "due_date": t.due_date,
            "assigned_to": t.assigned_to,
            "notes": t.notes,
            "official_url": t.official_url,
            "created_at": t.created_at,
            "updated_at": t.updated_at
        }
        for t in tasks
    ]

@router.post("/projects/{project_id}/tasks")
def create_custom_task(
    task_in: TaskCreate,
    project: StartupProject = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    task = ComplianceTask(
        project_id=project.id,
        title=task_in.title,
        category=task_in.category,
        description=task_in.description,
        obligation=task_in.obligation or "recommended",
        status=task_in.status or "Not Started",
        due_date=task_in.due_date,
        assigned_to=task_in.assigned_to,
        notes=task_in.notes
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"id": task.id, "message": "Task created successfully"}

@router.put("/tasks/{task_id}")
def update_task(
    task_id: str,
    update_in: TaskUpdate,
    db: Session = Depends(get_db)
):
    task = db.query(ComplianceTask).filter(ComplianceTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    update_data = update_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(task, field, val)
    
    db.commit()
    db.refresh(task)
    return {"id": task.id, "status": task.status, "message": "Task updated"}

@router.get("/projects/{project_id}/roles")
def get_recommended_roles(project: StartupProject = Depends(get_user_project)):
    profile = project.business_profile.__dict__ if project.business_profile else {}
    return recommend_roles({
        "domain": project.domain,
        "preferred_structure": project.preferred_structure,
        "expected_employee_count": profile.get("expected_employee_count", "1-5")
    })
