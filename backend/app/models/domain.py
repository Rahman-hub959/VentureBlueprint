import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class BusinessDomain(Base):
    __tablename__ = "business_domains"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    common_activities = Column(JSON, default=list)
    potential_licences = Column(JSON, default=list)
    potential_registrations = Column(JSON, default=list)
    relevant_regulations = Column(JSON, default=list)
    operational_roles = Column(JSON, default=list)
    required_documentation = Column(JSON, default=list)
    common_risks = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    activities = relationship("BusinessActivity", back_populates="domain", cascade="all, delete-orphan")

class BusinessActivity(Base):
    __tablename__ = "business_activities"

    id = Column(String, primary_key=True, default=generate_uuid)
    domain_id = Column(String, ForeignKey("business_domains.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    nic_code = Column(String(20), nullable=True)  # National Industrial Classification
    requires_special_license = Column(Boolean, default=False)
    special_regulatory_body = Column(String(100), nullable=True)  # e.g., RBI, IRDAI, FSSAI, CDSCO
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    domain = relationship("BusinessDomain", back_populates="activities")
