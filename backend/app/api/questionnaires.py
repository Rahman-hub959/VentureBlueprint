from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import StartupProject, BusinessProfile, Founder
from app.models.questionnaire import QuestionnaireResponse
from app.api.deps import get_user_project
from app.schemas.all_schemas import QuestionnaireSubmit

router = APIRouter(prefix="/questionnaires", tags=["Questionnaire Engine"])

@router.get("/schema")
def get_questionnaire_schema():
    """
    Returns the comprehensive 7-section questionnaire schema with conditional logic rules.
    """
    return {
        "sections": [
            {
                "id": "section_1_company",
                "title": "Section 1: Company Information",
                "description": "Establish the foundational identity, brand naming, industry domain, and core activities.",
                "fields": [
                    {"name": "company_name", "label": "Proposed Company Name", "type": "text", "required": True},
                    {"name": "alternative_names", "label": "Alternative Names (for MCA reservation)", "type": "tags"},
                    {"name": "business_domain", "label": "Business Domain", "type": "select", "required": True},
                    {"name": "business_description", "label": "Business Overview & Activities", "type": "textarea", "required": True},
                    {"name": "products_and_services", "label": "Products and Services", "type": "textarea"},
                    {"name": "target_audience", "label": "Target Audience", "type": "text"},
                    {"name": "business_stage", "label": "Current Business Stage", "type": "select", "options": ["Idea", "Prototype", "Planning", "Already Operating"]}
                ]
            },
            {
                "id": "section_2_structure",
                "title": "Section 2: Ownership and Legal Structure",
                "description": "Specify the founding team, equity distribution, director appointments, and preferred entity form.",
                "fields": [
                    {"name": "founder_count", "label": "Number of Founders", "type": "number", "required": True},
                    {"name": "founders_list", "label": "Founder Profiles & Proposed Shareholding", "type": "founders_array"},
                    {"name": "preferred_structure", "label": "Preferred Legal Structure", "type": "select", "options": ["Private Limited Company", "LLP", "OPC", "Partnership Firm", "Sole Proprietorship", "Not Sure - Recommend For Me"]},
                    {"name": "has_foreign_founders", "label": "Are any founders foreign nationals / non-residents?", "type": "boolean"},
                    {"name": "has_investor_participation", "label": "Do you plan to raise institutional angel or venture capital funding?", "type": "boolean"}
                ]
            },
            {
                "id": "section_3_location",
                "title": "Section 3: Location and Registered Office",
                "description": "Determine the state ROC jurisdiction, physical office documentation, and multi-state presence.",
                "fields": [
                    {"name": "country", "label": "Country of Registration", "type": "text", "default": "India"},
                    {"name": "state", "label": "State of Registered Office", "type": "select", "required": True},
                    {"name": "city", "label": "City", "type": "text", "required": True},
                    {"name": "registered_office_address", "label": "Complete Proposed Registered Office Address", "type": "textarea", "required": True},
                    {"name": "postal_code", "label": "Postal PIN Code", "type": "text", "required": True},
                    {"name": "premise_type", "label": "Premises Type", "type": "select", "options": ["Owned", "Rented", "Leased", "Co-working / Virtual Office"]},
                    {"name": "operation_mode", "label": "Operation Model", "type": "select", "options": ["Physical Location", "Online Only", "Hybrid"]},
                    {"name": "multi_state_operations", "label": "Do you plan to operate or have branches in multiple states?", "type": "boolean"}
                ]
            },
            {
                "id": "section_4_financial",
                "title": "Section 4: Financial Planning & Capitalization",
                "description": "Define authorized and paid-up share capital, expected startup investments, and revenue expectations.",
                "fields": [
                    {"name": "initial_investment_range", "label": "Initial Investment Budget", "type": "select", "options": ["Below ₹1 Lakh", "₹1L – ₹5L", "₹5L – ₹10L", "₹10L – ₹25L", "₹25L – ₹50L", "Above ₹50 Lakhs"]},
                    {"name": "proposed_authorized_capital", "label": "Proposed Authorized Capital (INR)", "type": "number", "default": 100000},
                    {"name": "proposed_paid_up_capital", "label": "Proposed Paid-up Capital (INR)", "type": "number", "default": 100000},
                    {"name": "revenue_models", "label": "Revenue Models", "type": "multiselect", "options": ["Direct Product Sales", "Subscription / SaaS", "Service Fees", "Marketplace Commission", "Licensing", "Advertising"]},
                    {"name": "sales_channels", "label": "Sales Channels", "type": "multiselect", "options": ["Own Website", "E-commerce Marketplaces", "Direct B2B Sales", "Retail Stores", "Distributors"]}
                ]
            },
            {
                "id": "section_5_operational",
                "title": "Section 5: Operational Requirements & Staffing",
                "description": "Outline employee headcount, key operational roles, infrastructure needs, and manufacturing facilities.",
                "fields": [
                    {"name": "expected_employee_count", "label": "Expected Employee Headcount", "type": "select", "options": ["1-5 people", "6-15 people", "16-50 people", "More than 50"]},
                    {"name": "departments", "label": "Planned Departments", "type": "multiselect", "options": ["Engineering/Tech", "Product", "Sales & Marketing", "Customer Support", "Operations", "Finance & HR"]},
                    {"name": "manufacturing_involved", "label": "Does this venture involve physical product manufacturing?", "type": "boolean"}
                ]
            },
            {
                "id": "section_6_compliance",
                "title": "Section 6: Professional Services & Regulatory Requirements",
                "description": "Evaluate CA/CS assistance, statutory auditing, customer data collection, and industry permits.",
                "fields": [
                    {"name": "collects_personal_data", "label": "Does the business collect or process personal customer data?", "type": "boolean"},
                    {"name": "imports_or_exports", "label": "Will the venture engage in import or export of goods or cross-border services?", "type": "boolean"},
                    {"name": "requires_ca_cs_support", "label": "Do you require external CA/CS professional retainer assistance?", "type": "boolean"}
                ]
            },
            {
                "id": "section_7_review",
                "title": "Section 7: Final Review & Synthesis",
                "description": "Synthesizes all submitted parameters for business validation, MCA pre-screening, and document generation."
            }
        ]
    }

@router.get("/projects/{project_id}")
def get_project_answers(project: StartupProject = Depends(get_user_project), db: Session = Depends(get_db)):
    profile = project.business_profile
    founders = project.founders
    
    return {
        "project_id": project.id,
        "name": project.name,
        "domain": project.domain,
        "preferred_structure": project.preferred_structure,
        "current_step": project.current_step,
        "profile": {
            "business_description": profile.business_description if profile else "",
            "products_and_services": profile.products_and_services if profile else "",
            "target_audience": profile.target_audience if profile else "",
            "business_stage": profile.business_stage if profile else "Idea",
            "country": profile.country if profile else "India",
            "state": profile.state if profile else "",
            "city": profile.city if profile else "",
            "registered_office_address": profile.registered_office_address if profile else "",
            "postal_code": profile.postal_code if profile else "",
            "premise_type": profile.premise_type if profile else "",
            "operation_mode": profile.operation_mode if profile else "Physical",
            "multi_state_operations": profile.multi_state_operations if profile else False,
            "initial_investment_range": profile.initial_investment_range if profile else "",
            "proposed_authorized_capital": profile.proposed_authorized_capital if profile else 100000.0,
            "proposed_paid_up_capital": profile.proposed_paid_up_capital if profile else 100000.0,
            "revenue_models": profile.revenue_models if profile else [],
            "sales_channels": profile.sales_channels if profile else [],
            "expected_employee_count": profile.expected_employee_count if profile else "1-5",
            "departments": profile.departments if profile else [],
            "collects_personal_data": profile.collects_personal_data if profile else False,
            "imports_or_exports": profile.imports_or_exports if profile else False,
            "has_investor_participation": profile.has_investor_participation if profile else False
        },
        "founders": [
            {
                "id": f.id,
                "full_name": f.full_name,
                "email": f.email,
                "proposed_shareholding_percentage": f.proposed_shareholding_percentage,
                "is_resident_of_india": f.is_resident_of_india,
                "executive_role": f.executive_role
            }
            for f in founders
        ]
    }

@router.post("/projects/{project_id}")
def save_project_answers(
    data: QuestionnaireSubmit,
    project: StartupProject = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    """
    Saves questionnaire answers, maps them to project entities, and persists changes.
    """
    answers = data.answers
    profile = project.business_profile
    if not profile:
        profile = BusinessProfile(project_id=project.id)
        db.add(profile)

    # Map core project fields
    if "company_name" in answers and answers["company_name"]:
        project.name = answers["company_name"]
    if "business_domain" in answers and answers["business_domain"]:
        project.domain = answers["business_domain"]
    if "preferred_structure" in answers and answers["preferred_structure"]:
        project.preferred_structure = answers["preferred_structure"]

    # Map profile fields
    for field in [
        "business_description", "products_and_services", "target_audience", "business_stage",
        "country", "state", "city", "registered_office_address", "postal_code", "premise_type",
        "operation_mode", "multi_state_operations", "initial_investment_range",
        "proposed_authorized_capital", "proposed_paid_up_capital", "revenue_models",
        "sales_channels", "expected_employee_count", "departments", "collects_personal_data",
        "imports_or_exports", "has_investor_participation"
    ]:
        if field in answers:
            setattr(profile, field, answers[field])

    # Map founders array if supplied
    if "founders_list" in answers and isinstance(answers["founders_list"], list):
        # Clear existing founders and re-populate
        db.query(Founder).filter(Founder.project_id == project.id).delete()
        for f_data in answers["founders_list"]:
            f = Founder(
                project_id=project.id,
                full_name=f_data.get("full_name", "Founder"),
                email=f_data.get("email"),
                proposed_shareholding_percentage=float(f_data.get("proposed_shareholding_percentage", 50.0)),
                is_resident_of_india=bool(f_data.get("is_resident_of_india", True)),
                executive_role=f_data.get("executive_role", "Director")
            )
            db.add(f)

    project.current_step = data.step_id
    project.completion_percentage = min(100, project.completion_percentage + 15)

    # Record QuestionnaireResponse snapshot
    qr = QuestionnaireResponse(
        project_id=project.id,
        step_id=data.step_id,
        answers=answers
    )
    db.add(qr)
    db.commit()

    return {"message": "Answers saved successfully", "project_id": project.id, "step": data.step_id}
