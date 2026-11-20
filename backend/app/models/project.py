import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class StartupProject(Base):
    __tablename__ = "startup_projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    alternative_names = Column(JSON, default=list)
    domain = Column(String(100), nullable=False)
    preferred_structure = Column(String(100), nullable=True)
    status = Column(String(50), default="draft")  # draft, validating, blueprint_ready, archived
    completion_percentage = Column(Integer, default=10)
    current_step = Column(String(100), default="company_info")
    accent_color = Column(String(50), default="emerald")
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="projects")
    business_profile = relationship("BusinessProfile", back_populates="project", uselist=False, cascade="all, delete-orphan")
    founders = relationship("Founder", back_populates="project", cascade="all, delete-orphan")
    directors = relationship("Director", back_populates="project", cascade="all, delete-orphan")
    ownership_records = relationship("OwnershipRecord", back_populates="project", cascade="all, delete-orphan")
    structure_assessment = relationship("LegalStructureAssessment", back_populates="project", uselist=False, cascade="all, delete-orphan")
    validation_results = relationship("ValidationResult", back_populates="project", cascade="all, delete-orphan")
    compliance_assessments = relationship("ComplianceAssessment", back_populates="project", cascade="all, delete-orphan")
    generated_documents = relationship("GeneratedDocument", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("ComplianceTask", back_populates="project", cascade="all, delete-orphan")
    questionnaire_responses = relationship("QuestionnaireResponse", back_populates="project", cascade="all, delete-orphan")

class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), unique=True, nullable=False)
    business_description = Column(Text, nullable=True)
    products_and_services = Column(Text, nullable=True)
    target_audience = Column(String(255), nullable=True)
    problem_solved = Column(Text, nullable=True)
    business_stage = Column(String(50), default="Idea")  # Idea, Prototype, Planning, Operating
    business_model = Column(String(100), nullable=True)  # B2B, B2C, Marketplace, D2C, Subscription
    revenue_models = Column(JSON, default=list)
    sales_channels = Column(JSON, default=list)
    proposed_establishment_date = Column(String(50), nullable=True)
    
    # Location
    country = Column(String(100), default="India")
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    registered_office_address = Column(Text, nullable=True)
    postal_code = Column(String(20), nullable=True)
    premise_type = Column(String(50), nullable=True)  # Owned, Rented, Leased, Shared Workspace
    operation_mode = Column(String(50), default="Physical")  # Physical, Online, Hybrid
    multi_state_operations = Column(Boolean, default=False)
    
    # Financials
    initial_investment_range = Column(String(100), nullable=True)
    proposed_authorized_capital = Column(Float, default=100000.0)  # INR
    proposed_paid_up_capital = Column(Float, default=100000.0)      # INR
    funding_sources = Column(JSON, default=list)
    has_investor_participation = Column(Boolean, default=False)
    expected_first_year_revenue = Column(String(100), nullable=True)
    estimated_operating_expenses = Column(String(100), nullable=True)

    # Operations & Team
    expected_employee_count = Column(String(50), nullable=True)
    departments = Column(JSON, default=list)
    required_infrastructure = Column(JSON, default=list)
    outsourced_services = Column(JSON, default=list)
    
    # Regulatory flags
    collects_personal_data = Column(Boolean, default=False)
    imports_or_exports = Column(Boolean, default=False)
    manufacturing_involved = Column(Boolean, default=False)
    specific_licenses_needed = Column(JSON, default=list)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="business_profile")

class Founder(Base):
    __tablename__ = "founders"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)
    citizenship = Column(String(100), default="Indian")
    is_resident_of_india = Column(Boolean, default=True)
    has_din = Column(Boolean, default=False)
    din_number = Column(String(20), nullable=True)
    pan_number = Column(String(20), nullable=True)
    proposed_shareholding_percentage = Column(Float, default=0.0)
    is_director = Column(Boolean, default=True)
    executive_role = Column(String(100), nullable=True)  # CEO, CTO, COO, Director
    qualifications = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="founders")

class Director(Base):
    __tablename__ = "directors"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), nullable=False)
    full_name = Column(String(255), nullable=False)
    din = Column(String(20), nullable=True)
    is_resident_director = Column(Boolean, default=True)
    director_type = Column(String(50), default="Executive")  # Executive, Non-Executive, Independent
    pan_available = Column(Boolean, default=True)
    dsc_available = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="directors")

class OwnershipRecord(Base):
    __tablename__ = "ownership_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), nullable=False)
    entity_or_person_name = Column(String(255), nullable=False)
    stakeholder_type = Column(String(50), default="Founder")  # Founder, Angel Investor, ESOP Pool, Partner
    percentage = Column(Float, nullable=False)
    number_of_shares = Column(Integer, default=0)
    share_class = Column(String(50), default="Equity")
    voting_rights_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="ownership_records")

class LegalStructureAssessment(Base):
    __tablename__ = "legal_structure_assessments"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("startup_projects.id"), unique=True, nullable=False)
    recommended_structure = Column(String(100), nullable=False)  # Private Limited Company, LLP, OPC, Partnership, Sole Proprietorship
    suitability_score = Column(Float, default=0.0)  # 0 to 100
    rationale = Column(Text, nullable=False)
    alternative_options = Column(JSON, default=list)
    advantages = Column(JSON, default=list)
    disadvantages_and_limitations = Column(JSON, default=list)
    statutory_requirements_summary = Column(JSON, default=list)
    estimated_incorporation_timeline = Column(String(100), nullable=True)
    estimated_government_fee_range = Column(String(100), nullable=True)
    assessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("StartupProject", back_populates="structure_assessment")
