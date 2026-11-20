from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ─── AUTH SCHEMAS ───
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)
    phone_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone_number: Optional[str] = None
    role: Optional[str] = "Entrepreneur"
    is_active: bool = True
    preferences: Dict[str, Any] = {}

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    token: str
    new_password: str = Field(min_length=8)

# ─── PROJECT SCHEMAS ───
class ProjectCreate(BaseModel):
    name: str = Field(min_length=2)
    domain: str = "Information Technology"
    preferred_structure: Optional[str] = "Private Limited Company"
    accent_color: Optional[str] = "emerald"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    preferred_structure: Optional[str] = None
    status: Optional[str] = None
    completion_percentage: Optional[int] = None
    current_step: Optional[str] = None
    accent_color: Optional[str] = None
    is_archived: Optional[bool] = None

class FounderSchema(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    citizenship: str = "Indian"
    is_resident_of_india: bool = True
    has_din: bool = False
    din_number: Optional[str] = None
    pan_number: Optional[str] = None
    proposed_shareholding_percentage: float = 0.0
    is_director: bool = True
    executive_role: Optional[str] = "Director"

class BusinessProfileUpdate(BaseModel):
    business_description: Optional[str] = None
    products_and_services: Optional[str] = None
    target_audience: Optional[str] = None
    problem_solved: Optional[str] = None
    business_stage: Optional[str] = None
    business_model: Optional[str] = None
    revenue_models: Optional[List[str]] = None
    sales_channels: Optional[List[str]] = None
    country: Optional[str] = "India"
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    registered_office_address: Optional[str] = None
    postal_code: Optional[str] = None
    premise_type: Optional[str] = None
    operation_mode: Optional[str] = None
    multi_state_operations: Optional[bool] = False
    initial_investment_range: Optional[str] = None
    proposed_authorized_capital: Optional[float] = 100000.0
    proposed_paid_up_capital: Optional[float] = 100000.0
    funding_sources: Optional[List[str]] = None
    has_investor_participation: Optional[bool] = False
    expected_employee_count: Optional[str] = None
    departments: Optional[List[str]] = None
    collects_personal_data: Optional[bool] = False
    imports_or_exports: Optional[bool] = False

class ProjectResponse(BaseModel):
    id: str
    name: str
    domain: str
    preferred_structure: Optional[str] = None
    status: str
    completion_percentage: int
    current_step: Optional[str] = None
    accent_color: Optional[str] = "emerald"
    is_archived: bool = False
    created_at: Any
    updated_at: Any
    business_profile: Optional[Dict[str, Any]] = None
    founders: List[Dict[str, Any]] = []
    directors: List[Dict[str, Any]] = []
    structure_assessment: Optional[Dict[str, Any]] = None

# ─── VALIDATION SCHEMAS ───
class NameValidationRequest(BaseModel):
    name: str
    legal_structure: Optional[str] = "Private Limited Company"

class NameValidationResponse(BaseModel):
    is_valid: bool
    score: int
    name_assessed: str
    legal_structure: str
    checks: List[Dict[str, Any]]
    warnings: List[str]
    errors: List[str]
    recommendations: List[str]
    mca_portal_url: str
    disclaimer: str

# ─── QUESTIONNAIRE SCHEMAS ───
class QuestionnaireSubmit(BaseModel):
    step_id: str
    answers: Dict[str, Any]

# ─── COMPLIANCE SCHEMAS ───
class TaskCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    obligation: Optional[str] = "mandatory"
    status: Optional[str] = "Not Started"
    due_date: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    obligation: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None

# ─── DOCUMENT SCHEMAS ───
class DocumentGenerateRequest(BaseModel):
    document_type: str  # formation_blueprint, mca_compliance, founder_director, document_requirements, org_structure, industry_compliance, financial_planning, establishment_roadmap
    file_format: str = "pdf"  # pdf or docx

class DocumentResponse(BaseModel):
    id: str
    project_id: str
    document_type: str
    title: str
    file_format: str
    file_size_bytes: int
    checksum_sha256: Optional[str] = None
    version: int
    status: str
    generated_at: Any
    download_url: str
