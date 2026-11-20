import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class RegulatorySource(Base):
    __tablename__ = "regulatory_sources"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False)  # Ministry of Corporate Affairs, Income Tax Department, GST Council, etc.
    code = Column(String(50), unique=True, nullable=False)
    authority_type = Column(String(100), default="Central Government")
    jurisdiction = Column(String(100), default="India")
    official_portal_url = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    last_verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

    rules = relationship("RegulatoryRule", back_populates="source")

class RegulatoryRule(Base):
    __tablename__ = "regulatory_rules"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_id = Column(String, ForeignKey("regulatory_sources.id"), nullable=False)
    rule_code = Column(String(100), unique=True, nullable=False)  # e.g. MCA-CO-DIR-001
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # Incorporation, Taxation, Licensing, Employment, Data Protection
    applicable_structure = Column(String(100), nullable=True)  # All, Private Limited Company, LLP, OPC, etc.
    applicable_domain = Column(String(100), nullable=True)     # All or specific domain
    applicability_condition = Column(JSON, default=dict)       # conditions e.g. {"founders_min": 2, "requires_residence": True}
    requirement_description = Column(Text, nullable=False)
    obligation_type = Column(String(50), default="mandatory")  # mandatory, conditional, recommended
    legal_provision = Column(String(255), nullable=False)      # e.g., Section 149(3), Companies Act 2013
    official_source_url = Column(String(255), nullable=True)
    official_portal_link = Column(String(255), nullable=True)
    verification_steps = Column(Text, nullable=True)
    status = Column(String(50), default="Published")          # Draft, Review, Approved, Published, Superseded
    version = Column(Integer, default=1)
    last_reviewed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reviewer_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    source = relationship("RegulatorySource", back_populates="rules")
    rule_versions = relationship("RegulatoryRuleVersion", back_populates="rule", cascade="all, delete-orphan")
    reviews = relationship("RegulatoryReview", back_populates="rule", cascade="all, delete-orphan")

class RegulatoryRuleVersion(Base):
    __tablename__ = "regulatory_rule_versions"

    id = Column(String, primary_key=True, default=generate_uuid)
    rule_id = Column(String, ForeignKey("regulatory_rules.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    requirement_description = Column(Text, nullable=False)
    legal_provision = Column(String(255), nullable=False)
    applicability_condition = Column(JSON, default=dict)
    change_summary = Column(Text, nullable=True)
    changed_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    rule = relationship("RegulatoryRule", back_populates="rule_versions")

class RegulatoryReview(Base):
    __tablename__ = "regulatory_reviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    rule_id = Column(String, ForeignKey("regulatory_rules.id"), nullable=False)
    reviewer_id = Column(String, ForeignKey("users.id"), nullable=False)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    rule = relationship("RegulatoryRule", back_populates="reviews")
    reviewer = relationship("User")
