from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ComplaintCreate(BaseModel):
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    pillar: str = "CS"  # CS, CA, LAW, GENERAL
    category: str
    priority: str = "Standard"  # Low, Standard, High, Critical
    description: str

class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    pillar: str
    category: str
    priority: str
    status: str
    assigned_expert: Optional[str] = None
    expert_role: Optional[str] = None
    description: str
    resolution_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime
