from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.user import User
from app.models.project import StartupProject, BusinessProfile, Founder, Director, OwnershipRecord
from app.models.audit import AuditLog
from app.schemas.all_schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.api.deps import get_current_user, get_user_project
from app.rules_engine.structure_evaluator import evaluate_legal_structure

router = APIRouter(prefix="/projects", tags=["Projects"])

def model_to_dict(obj) -> Optional[Dict[str, Any]]:
    if not obj:
        return None
    return {k: v for k, v in obj.__dict__.items() if not k.startswith("_")}

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    sort_by: str = "updated_at",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(StartupProject).filter(StartupProject.user_id == current_user.id)
    
    if status_filter and status_filter.lower() != "all":
        if status_filter.lower() == "archived":
            query = query.filter(StartupProject.is_archived == True)
        else:
            query = query.filter(StartupProject.status.ilike(status_filter), StartupProject.is_archived == False)
    else:
        query = query.filter(StartupProject.is_archived == False)

    if search:
        query = query.filter(StartupProject.name.ilike(f"%{search}%"))

    if sort_by == "created_at":
        query = query.order_by(desc(StartupProject.created_at))
    elif sort_by == "name":
        query = query.order_by(StartupProject.name.asc())
    elif sort_by == "progress":
        query = query.order_by(desc(StartupProject.completion_percentage))
    else:
        query = query.order_by(desc(StartupProject.updated_at))

    projects = query.all()
    
    results = []
    for p in projects:
        results.append({
            "id": p.id,
            "name": p.name,
            "domain": p.domain,
            "preferred_structure": p.preferred_structure,
            "status": p.status,
            "completion_percentage": p.completion_percentage,
            "current_step": p.current_step,
            "accent_color": p.accent_color,
            "is_archived": p.is_archived,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "business_profile": model_to_dict(p.business_profile),
            "founders": [model_to_dict(f) for f in p.founders],
            "directors": [model_to_dict(d) for d in p.directors],
            "structure_assessment": model_to_dict(p.structure_assessment)
        })
    return results

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = StartupProject(
        user_id=current_user.id,
        name=project_in.name,
        domain=project_in.domain,
        preferred_structure=project_in.preferred_structure,
        accent_color=project_in.accent_color or "emerald",
        status="draft",
        completion_percentage=15
    )
    db.add(project)
    db.flush()

    # Create associated default business profile
    profile = BusinessProfile(
        project_id=project.id,
        country="India",
        business_stage="Idea",
        proposed_authorized_capital=100000.0,
        proposed_paid_up_capital=100000.0
    )
    db.add(profile)

    # Initial default founder (the authenticated user)
    founder = Founder(
        project_id=project.id,
        full_name=current_user.full_name,
        email=current_user.email,
        proposed_shareholding_percentage=100.0,
        is_director=True,
        executive_role="Managing Director / CEO"
    )
    db.add(founder)

    audit = AuditLog(
        user_id=current_user.id,
        action="PROJECT_CREATED",
        entity_type="startup_project",
        entity_id=project.id,
        details={"name": project.name, "domain": project.domain}
    )
    db.add(audit)
    db.commit()
    db.refresh(project)

    return {
        "id": project.id,
        "name": project.name,
        "domain": project.domain,
        "preferred_structure": project.preferred_structure,
        "status": project.status,
        "completion_percentage": project.completion_percentage,
        "current_step": project.current_step,
        "accent_color": project.accent_color,
        "is_archived": project.is_archived,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "business_profile": model_to_dict(profile),
        "founders": [model_to_dict(founder)],
        "directors": [],
        "structure_assessment": None
    }

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project: StartupProject = Depends(get_user_project)):
    return {
        "id": project.id,
        "name": project.name,
        "domain": project.domain,
        "preferred_structure": project.preferred_structure,
        "status": project.status,
        "completion_percentage": project.completion_percentage,
        "current_step": project.current_step,
        "accent_color": project.accent_color,
        "is_archived": project.is_archived,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "business_profile": model_to_dict(project.business_profile),
        "founders": [model_to_dict(f) for f in project.founders],
        "directors": [model_to_dict(d) for d in project.directors],
        "structure_assessment": model_to_dict(project.structure_assessment)
    }

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    update_in: ProjectUpdate,
    project: StartupProject = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    update_data = update_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return get_project(project)

@router.post("/{project_id}/duplicate", response_model=ProjectResponse)
def duplicate_project(
    project: StartupProject = Depends(get_user_project),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_project = StartupProject(
        user_id=current_user.id,
        name=f"{project.name} (Copy)",
        domain=project.domain,
        preferred_structure=project.preferred_structure,
        accent_color=project.accent_color,
        status="draft",
        completion_percentage=project.completion_percentage
    )
    db.add(new_project)
    db.flush()

    if project.business_profile:
        bp_data = {k: v for k, v in project.business_profile.__dict__.items() if not k.startswith("_") and k not in ["id", "project_id", "created_at", "updated_at"]}
        new_bp = BusinessProfile(project_id=new_project.id, **bp_data)
        db.add(new_bp)

    for f in project.founders:
        f_data = {k: v for k, v in f.__dict__.items() if not k.startswith("_") and k not in ["id", "project_id", "created_at"]}
        new_f = Founder(project_id=new_project.id, **f_data)
        db.add(new_f)

    db.commit()
    db.refresh(new_project)
    return get_project(new_project)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project: StartupProject = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    db.delete(project)
    db.commit()
    return None
