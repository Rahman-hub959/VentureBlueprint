import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class ComplianceAssessment(Base):
    __tablename__ = "compliance_assessments"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), nullable=False)
    structure_evaluated = Column(String(100), nullable=False)
    total_rules_assessed = Column(Integer, default=0)
    passed_count = Column(Integer, default=0)
    warning_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    missing_info_count = Column(Integer, default=0)
    professional_review_count = Column(Integer, default=0)
    unverified_count = Column(Integer, default=0)
    assessment_notes = Column(Text, nullable=True)
    assessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="compliance_assessments")
    rule_results = relationship("AssessmentRuleResult", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentRuleResult(Base):
    __tablename__ = "assessment_rule_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    assessment_id = Column(String, ForeignKey("compliance_assessments.id"), nullable=False)
    rule_code = Column(String(100), nullable=False)
    rule_title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    obligation_type = Column(String(50), default="mandatory")
    status = Column(String(50), nullable=False)  # Passed, Warning, Failed, Needs Additional Information, Professional Review Required, Not Verified
    finding_summary = Column(Text, nullable=False)
    action_required = Column(Text, nullable=False)
    legal_provision = Column(String(255), nullable=True)
    official_source_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assessment = relationship("ComplianceAssessment", back_populates="rule_results")

class ComplianceTask(Base):
    __tablename__ = "compliance_tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), nullable=False)
    rule_code = Column(String(100), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # registration, taxation, licences, legal, data, employment, ip
    description = Column(Text, nullable=True)
    obligation = Column(String(50), default="mandatory")  # mandatory, conditional, recommended
    status = Column(String(50), default="Not Started")    # Not Started, In Progress, Pending Documents, Awaiting Professional Review, Awaiting Official Approval, Completed, Not Applicable
    due_date = Column(String(50), nullable=True)
    assigned_to = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    official_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="tasks")
    attachments = relationship("UploadedFile", back_populates="task", cascade="all, delete-orphan")

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), nullable=False)
    task_id = Column(String, ForeignKey("compliance_tasks.id"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    checksum_sha256 = Column(String(64), nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    task = relationship("ComplianceTask", back_populates="attachments")
