import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), nullable=False)
    category = Column(String(100), nullable=False)  # name_validation, structure_compatibility, founder_requirements, location, financial
    rule_id = Column(String(100), nullable=False)
    field_name = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False)  # Passed, Warning, Failed, Needs Additional Information, Professional Review Required, Not Applicable
    severity = Column(String(30), default="medium")  # info, low, medium, high, critical
    explanation = Column(Text, nullable=False)
    corrective_action = Column(Text, nullable=False)
    legal_reference = Column(String(255), nullable=True)
    assessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="validation_results")
