import os
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.project import StartupProject
from app.models.document import GeneratedDocument, DocumentVersion
from app.models.questionnaire import QuestionnaireResponse
from app.api.deps import get_current_user, get_user_project, get_current_user_from_token
from app.schemas.all_schemas import DocumentGenerateRequest, DocumentResponse
from app.storage.file_manager import get_project_storage_dir
from app.document_engine.report_builders import build_report_data
from app.document_engine.pdf_generator import build_pdf_document
from app.document_engine.docx_generator import build_docx_document

router = APIRouter(prefix="/documents", tags=["Document Generation Engine"])

DOC_TITLES = {
    "formation_blueprint": "Company Startup Blueprint",
    "mca_compliance": "MCA Compliance Assessment Report",
    "founder_director": "Founder and Director Report",
    "document_requirements": "Document Requirement Report",
    "org_structure": "Organizational Structure Report",
    "industry_compliance": "Industry Compliance Report",
    "financial_planning": "Financial Planning Report",
    "establishment_roadmap": "Company Establishment Roadmap"
}

@router.get("/projects/{project_id}")
def list_project_documents(
    project: StartupProject = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    docs = db.query(GeneratedDocument).filter(
        GeneratedDocument.project_id == project.id
    ).order_by(GeneratedDocument.generated_at.desc()).all()

    results = []
    for d in docs:
        results.append({
            "id": d.id,
            "project_id": d.project_id,
            "document_type": d.document_type,
            "title": d.title,
            "file_format": d.file_format,
            "file_size_bytes": d.file_size_bytes,
            "checksum_sha256": d.checksum_sha256,
            "version": d.version,
            "status": d.status,
            "generated_at": d.generated_at,
            "download_url": f"/api/v1/documents/download/{d.id}",
            "versions": [
                {
                    "id": v.id,
                    "version_number": v.version_number,
                    "file_format": v.file_format,
                    "file_size_bytes": v.file_size_bytes,
                    "checksum_sha256": v.checksum_sha256,
                    "created_at": v.created_at
                }
                for v in d.versions
            ]
        })
    return results

@router.post("/projects/{project_id}/generate", response_model=DocumentResponse)
def generate_document(
    req: DocumentGenerateRequest,
    project: StartupProject = Depends(get_user_project),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Renders actual professional PDF or DOCX reports locally.
    Never overwrites historical reports silently; increments version and preserves version history.
    """
    doc_type = req.document_type
    doc_format = req.file_format.lower()
    if doc_format not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Supported formats are 'pdf' and 'docx'")

    doc_title = DOC_TITLES.get(doc_type, "Company Assessment Dossier")

    # Check existing document for version management
    existing_doc = db.query(GeneratedDocument).filter(
        GeneratedDocument.project_id == project.id,
        GeneratedDocument.document_type == doc_type,
        GeneratedDocument.file_format == doc_format
    ).first()

    next_version = (existing_doc.version + 1) if existing_doc else 1

    # Storage destination
    storage_dir = get_project_storage_dir(current_user.id, project.id, doc_format)
    filename = f"{doc_type}_v{next_version}.{doc_format}"
    file_path = storage_dir / filename

    # Assemble report structured data with complete user and project details
    profile_dict = {}
    if project.business_profile:
        profile_dict.update({
            c.name: getattr(project.business_profile, c.name)
            for c in project.business_profile.__table__.columns
        })

    # Also merge answers from questionnaire responses if available
    responses = db.query(QuestionnaireResponse).filter(QuestionnaireResponse.project_id == project.id).all()
    for resp in responses:
        if resp.answers and isinstance(resp.answers, dict):
            for k, v in resp.answers.items():
                if v is not None and v != "":
                    profile_dict[k] = v

    founders_dict = [
        {c.name: getattr(f, c.name) for c in f.__table__.columns}
        for f in project.founders
    ]
    # If founders_list is in profile_dict but not in founders table, supplement it
    if not founders_dict and "founders_list" in profile_dict and isinstance(profile_dict["founders_list"], list):
        founders_dict = profile_dict["founders_list"]

    directors_dict = [
        {c.name: getattr(d, c.name) for c in d.__table__.columns}
        for d in project.directors
    ]

    report_data = build_report_data(doc_type, {
        "name": profile_dict.get("company_name") or project.name,
        "domain": profile_dict.get("business_domain") or project.domain,
        "preferred_structure": profile_dict.get("preferred_structure") or project.preferred_structure or "Private Limited Company",
        "business_profile": profile_dict,
        "founders": founders_dict,
        "directors": directors_dict,
        "current_user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone_number": current_user.phone_number
        },
        "version": next_version
    })

    # Render Document
    if doc_format == "pdf":
        checksum = build_pdf_document(file_path, report_data)
    else:
        checksum = build_docx_document(file_path, report_data)

    file_size = os.path.getsize(file_path)

    if existing_doc:
        # Preserve previous version in DocumentVersion history
        archived_version = DocumentVersion(
            document_id=existing_doc.id,
            version_number=existing_doc.version,
            file_path=existing_doc.file_path,
            file_format=existing_doc.file_format,
            file_size_bytes=existing_doc.file_size_bytes,
            checksum_sha256=existing_doc.checksum_sha256,
            change_summary=f"Automated regeneration at {datetime.now(timezone.utc).isoformat()}"
        )
        db.add(archived_version)

        # Update existing document pointer
        existing_doc.version = next_version
        existing_doc.file_path = str(file_path)
        existing_doc.file_size_bytes = file_size
        existing_doc.checksum_sha256 = checksum
        existing_doc.generated_at = datetime.now(timezone.utc)
        target_doc = existing_doc
    else:
        target_doc = GeneratedDocument(
            project_id=project.id,
            user_id=current_user.id,
            document_type=doc_type,
            title=doc_title,
            file_path=str(file_path),
            file_format=doc_format,
            file_size_bytes=file_size,
            checksum_sha256=checksum,
            version=next_version,
            status="completed"
        )
        db.add(target_doc)

    project.completion_percentage = 100
    project.status = "blueprint_ready"
    db.commit()
    db.refresh(target_doc)

    return {
        "id": target_doc.id,
        "project_id": target_doc.project_id,
        "document_type": target_doc.document_type,
        "title": target_doc.title,
        "file_format": target_doc.file_format,
        "file_size_bytes": target_doc.file_size_bytes,
        "checksum_sha256": target_doc.checksum_sha256,
        "version": target_doc.version,
        "status": target_doc.status,
        "generated_at": target_doc.generated_at,
        "download_url": f"/api/v1/documents/download/{target_doc.id}"
    }

@router.get("/download/{doc_id}")
def download_document(
    doc_id: str,
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Authenticated file download with dual auth (Bearer Header or Query Token).
    Streams directly without exposing local storage filesystem structure.
    """
    resolved_token = None
    if authorization and authorization.startswith("Bearer "):
        resolved_token = authorization.split(" ", 1)[1].strip()
    elif token:
        resolved_token = token.strip()

    if not resolved_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to download document"
        )

    current_user = get_current_user_from_token(resolved_token, db)

    doc = db.query(GeneratedDocument).filter(GeneratedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    is_admin = current_user.role and current_user.role.name == "Administrator"
    if doc.user_id != current_user.id and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this document")

    file_path = Path(doc.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical document file missing on server")

    media_type = "application/pdf" if doc.file_format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    download_filename = f"{doc.title.replace(' ', '_')}_v{doc.version}.{doc.file_format}"

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=download_filename
    )
