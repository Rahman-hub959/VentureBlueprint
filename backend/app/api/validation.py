from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import StartupProject, LegalStructureAssessment
from app.models.validation import ValidationResult
from app.schemas.all_schemas import NameValidationRequest, NameValidationResponse
from app.api.deps import get_current_user, get_user_project
from app.rules_engine.name_prescreening import assess_company_name
from app.rules_engine.structure_evaluator import evaluate_legal_structure

router = APIRouter(prefix="/validation", tags=["Validation Engine"])

@router.post("/name-prescreen", response_model=NameValidationResponse)
def prescreen_name(req: NameValidationRequest):
    result = assess_company_name(req.name, req.legal_structure or "Private Limited Company")
    return result

@router.post("/structure-recommendation")
def recommend_structure(data: Dict[str, Any]):
    return evaluate_legal_structure(data)

@router.post("/project/{project_id}/run")
def run_project_validation(
    project: StartupProject = Depends(get_user_project),
    db: Session = Depends(get_db)
):
    """
    Executes cross-field validation on the company project:
    1. Name pre-screening
    2. Director and founder count compatibility with structure
    3. Shareholding percentages consistency (must sum to 100% if provided)
    4. Registered office address completeness
    5. Statutory capital thresholds
    """
    # Clear prior validation results for clean state
    db.query(ValidationResult).filter(ValidationResult.project_id == project.id).delete()

    results = []
    profile = project.business_profile
    founders = project.founders
    structure = project.preferred_structure or "Private Limited Company"

    # 1. Name Check
    name_check = assess_company_name(project.name, structure)
    if not name_check["is_valid"]:
        vr = ValidationResult(
            project_id=project.id,
            category="name_validation",
            rule_id="RULE-NAM-001",
            field_name="name",
            status="Failed",
            severity="high",
            explanation="; ".join(name_check["errors"]),
            corrective_action="Revise proposed company name to conform with MCA Rule 8 guidelines.",
            legal_reference="Rule 8, Companies (Incorporation) Rules, 2014"
        )
        db.add(vr)
        results.append(vr)
    elif name_check["warnings"]:
        vr = ValidationResult(
            project_id=project.id,
            category="name_validation",
            rule_id="RULE-NAM-002",
            field_name="name",
            status="Warning",
            severity="medium",
            explanation="; ".join(name_check["warnings"]),
            corrective_action="; ".join(name_check["recommendations"]) or "Verify availability on MCA RUN service.",
            legal_reference="Rule 8B, Companies (Incorporation) Rules, 2014"
        )
        db.add(vr)
        results.append(vr)
    else:
        vr = ValidationResult(
            project_id=project.id,
            category="name_validation",
            rule_id="RULE-NAM-000",
            field_name="name",
            status="Passed",
            severity="info",
            explanation=f"Name '{project.name}' passed preliminary automated MCA Rule 8 pre-screening.",
            corrective_action="Proceed to formal name reservation on SPICe+ Part A.",
            legal_reference="Section 4(2), Companies Act, 2013"
        )
        db.add(vr)
        results.append(vr)

    # 2. Structure & Founder Consistency
    if structure == "Private Limited Company":
        if len(founders) < 2:
            vr = ValidationResult(
                project_id=project.id,
                category="structure_compatibility",
                rule_id="RULE-STR-001",
                field_name="founders",
                status="Failed",
                severity="critical",
                explanation="A Private Limited Company mandates a minimum of two (2) directors and two (2) subscribers.",
                corrective_action="Add at least one additional founder/director or select One Person Company (OPC).",
                legal_reference="Section 3(1)(b) & Section 149(1), Companies Act, 2013"
            )
            db.add(vr)
            results.append(vr)
        else:
            vr = ValidationResult(
                project_id=project.id,
                category="structure_compatibility",
                rule_id="RULE-STR-000",
                field_name="founders",
                status="Passed",
                severity="info",
                explanation=f"{len(founders)} founders provided, satisfying the minimum threshold of 2.",
                corrective_action="Ensure all founders have active PAN cards and obtain Class 3 DSC.",
                legal_reference="Section 149(1), Companies Act, 2013"
            )
            db.add(vr)
            results.append(vr)

    elif structure == "LLP":
        if len(founders) < 2:
            vr = ValidationResult(
                project_id=project.id,
                category="structure_compatibility",
                rule_id="RULE-STR-002",
                field_name="founders",
                status="Failed",
                severity="critical",
                explanation="A Limited Liability Partnership requires at least two (2) designated partners.",
                corrective_action="Add an additional partner or choose Sole Proprietorship.",
                legal_reference="Section 6(1), Limited Liability Partnership Act, 2008"
            )
            db.add(vr)
            results.append(vr)

    elif structure == "OPC":
        if len(founders) > 1:
            vr = ValidationResult(
                project_id=project.id,
                category="structure_compatibility",
                rule_id="RULE-STR-003",
                field_name="founders",
                status="Warning",
                severity="medium",
                explanation="One Person Company (OPC) is strictly limited to a single member/shareholder.",
                corrective_action="Switch legal structure to Private Limited Company or designate only one founder as equity member.",
                legal_reference="Section 2(62), Companies Act, 2013"
            )
            db.add(vr)
            results.append(vr)

    # 3. Shareholding Percentages Consistency
    total_pct = sum(f.proposed_shareholding_percentage for f in founders)
    if founders and abs(total_pct - 100.0) > 0.1:
        vr = ValidationResult(
            project_id=project.id,
            category="ownership_consistency",
            rule_id="RULE-OWN-001",
            field_name="proposed_shareholding_percentage",
            status="Warning",
            severity="medium",
            explanation=f"Cumulative proposed ownership equals {total_pct:.1f}%, which does not equal 100%.",
            corrective_action="Adjust founder equity percentages to total exactly 100.0%.",
            legal_reference="Section 56, Companies Act, 2013"
        )
        db.add(vr)
        results.append(vr)

    # 4. Registered Office Verification
    if not profile or not profile.registered_office_address:
        vr = ValidationResult(
            project_id=project.id,
            category="location",
            rule_id="RULE-LOC-001",
            field_name="registered_office_address",
            status="Needs Additional Information",
            severity="medium",
            explanation="A physical registered office address within India is required for official ROC incorporation notice.",
            corrective_action="Enter complete proposed office address and prepare recent utility bill with owner NOC.",
            legal_reference="Section 12, Companies Act, 2013"
        )
        db.add(vr)
        results.append(vr)

    # Evaluate & Store Legal Structure Assessment
    struct_eval = evaluate_legal_structure({
        "founder_count": len(founders),
        "has_investor_participation": profile.has_investor_participation if profile else False,
        "proposed_authorized_capital": profile.proposed_authorized_capital if profile else 100000.0,
        "preferred_structure": structure,
        "business_domain": project.domain
    })

    if not project.structure_assessment:
        assessment_record = LegalStructureAssessment(project_id=project.id, **{
            "recommended_structure": struct_eval["recommended_structure"],
            "suitability_score": struct_eval["suitability_score"],
            "rationale": struct_eval["rationale"],
            "advantages": struct_eval["advantages"],
            "disadvantages_and_limitations": struct_eval["disadvantages_and_limitations"],
            "statutory_requirements_summary": struct_eval["statutory_requirements_summary"],
            "estimated_incorporation_timeline": struct_eval["estimated_incorporation_timeline"],
            "estimated_government_fee_range": struct_eval["estimated_government_fee_range"]
        })
        db.add(assessment_record)
    else:
        for k, v in struct_eval.items():
            if hasattr(project.structure_assessment, k):
                setattr(project.structure_assessment, k, v)

    # Update completion percentage
    project.completion_percentage = max(project.completion_percentage, 60)
    db.commit()

    return {
        "project_id": project.id,
        "total_checks": len(results),
        "validation_results": [
            {
                "id": r.id,
                "category": r.category,
                "rule_id": r.rule_id,
                "field_name": r.field_name,
                "status": r.status,
                "severity": r.severity,
                "explanation": r.explanation,
                "corrective_action": r.corrective_action,
                "legal_reference": r.legal_reference
            }
            for r in results
        ],
        "structure_recommendation": struct_eval
    }
