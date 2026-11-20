from typing import Dict, Any, List

def recommend_roles(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    domain = data.get("domain") or data.get("business_domain") or "Information Technology"
    structure = data.get("preferred_structure") or data.get("legal_structure") or "Private Limited Company"
    team_size = data.get("expected_employee_count", "1-5")
    
    roles = []

    # 1. Statutory Positions (Mandatory by Law)
    if structure == "Private Limited Company":
        roles.append({
            "title": "Resident Director",
            "category": "Statutory Position",
            "type": "Mandatory by Law",
            "staffing_type": "Founder / Full-time",
            "legal_basis": "Section 149(3), Companies Act, 2013",
            "description": "At least one director who stays in India for a total period of not less than 182 days during the financial year.",
            "responsibilities": [
                "Ensure compliance with Indian regulatory filings and ROC submissions",
                "Sign statutory notices, board resolutions, and financial statements",
                "Represent the company before statutory authorities and tax tribunals"
            ],
            "qualifications": "Must possess a valid DIN, PAN, and Digital Signature Certificate (Class 3 DSC)."
        })
        roles.append({
            "title": "Managing Director / CEO",
            "category": "Management Role",
            "type": "Essential",
            "staffing_type": "Full-time",
            "legal_basis": "Section 2(54), Companies Act, 2013",
            "description": "Executive responsible for daily management, corporate strategy, operations, and leadership.",
            "responsibilities": [
                "Execute board decisions and strategic roadmaps",
                "Oversee budget allocations and commercial contracts",
                "Maintain investor relations and governance standards"
            ],
            "qualifications": "Strong executive leadership and domain competency."
        })
    elif structure == "LLP":
        roles.append({
            "title": "Designated Resident Partner",
            "category": "Statutory Position",
            "type": "Mandatory by Law",
            "staffing_type": "Partner",
            "legal_basis": "Section 7, Limited Liability Partnership Act, 2008",
            "description": "At least two designated partners, at least one of whom must be resident in India.",
            "responsibilities": [
                "Accountable for statutory filings with the Registrar (Form 8 & Form 11)",
                "Sign legal notices and financial statements of the LLP"
            ],
            "qualifications": "Must possess valid DPIN (Designated Partner Identification Number) and DSC."
        })

    # 2. External Professional Services (Statutory & Advisory)
    roles.append({
        "title": "Statutory Auditor (Chartered Accountant)",
        "category": "External Professional Service",
        "type": "Mandatory by Law" if structure in ["Private Limited Company", "OPC"] else "Conditional",
        "staffing_type": "Outsourced CA Firm",
        "legal_basis": "Section 139, Companies Act, 2013",
        "description": "Independent Chartered Accountant appointed to audit books of account and issue statutory audit report.",
        "responsibilities": [
            "Conduct annual statutory audit under Companies Act and Income Tax Act",
            "Issue Independent Auditor's Report (Form ADT-1 / AOC-4 attachment)",
            "Verify internal financial controls and tax compliance"
        ],
        "qualifications": "Practicing Chartered Accountant holding valid Certificate of Practice from ICAI."
    })

    roles.append({
        "title": "Corporate Secretarial (CS) / Legal Advisor",
        "category": "External Professional Service",
        "type": "Recommended",
        "staffing_type": "Retainer / Outsourced",
        "legal_basis": "Companies (Appointment and Remuneration of Managerial Personnel) Rules, 2014",
        "description": "Advises on MCA e-filings, annual secretarial compliance, and share issue documentations.",
        "responsibilities": [
            "Draft board minutes, shareholder resolutions, and statutory registers",
            "Assist in filing annual returns (MGT-7/7A) and director KYC (DIR-3 KYC)",
            "Advise on share allotment and stamp duty adjudication"
        ],
        "qualifications": "Practicing Company Secretary (ICSI member) or corporate legal counsel."
    })

    # 3. Domain-Specific Operational & Management Roles
    lower_domain = domain.lower()
    if any(k in lower_domain for k in ["tech", "software", "information"]):
        roles.append({
            "title": "Chief Technology Officer / Tech Lead",
            "category": "Management Role",
            "type": "High Priority",
            "staffing_type": "Co-founder / In-house",
            "legal_basis": "Operational Requirement",
            "description": "Architects technology stack, software infrastructure, and data security policies.",
            "responsibilities": [
                "Design scalable system architecture and software roadmap",
                "Ensure compliance with the Digital Personal Data Protection (DPDP) Act, 2023",
                "Oversee code quality, testing pipelines, and data encryption"
            ],
            "qualifications": "Computer Science / Software engineering background."
        })
        roles.append({
            "title": "Full-Stack Software Engineer",
            "category": "Operational Role",
            "type": "Core Staffing",
            "staffing_type": "Full-time / In-house",
            "legal_basis": "Operational Requirement",
            "description": "Develops core user-facing and backend application modules.",
            "responsibilities": [
                "Build API services, databases, and responsive interfaces",
                "Implement unit and integration testing"
            ],
            "qualifications": "Experience in modern web frameworks (React, Python/FastAPI, PostgreSQL)."
        })
    elif any(k in lower_domain for k in ["food", "beverage", "hospitality"]):
        roles.append({
            "title": "Food Safety & Quality Supervisor",
            "category": "Statutory Position",
            "type": "Mandatory by Law",
            "staffing_type": "In-house / Designated Staff",
            "legal_basis": "Section 31, Food Safety and Standards Act, 2006 (FSSAI Regulations)",
            "description": "Designated person trained under FoSTaC responsible for food safety and hygiene protocols.",
            "responsibilities": [
                "Maintain daily hygiene, pest control, and sanitary logbooks",
                "Ensure compliance with FSSAI state/central licensing terms",
                "Oversee safe food storage, handling, and expiration tracking"
            ],
            "qualifications": "FSSAI FoSTaC certified supervisor / Food Tech degree."
        })
    elif any(k in lower_domain for k in ["manufacturing", "hardware", "construction"]):
        roles.append({
            "title": "Plant / Production Manager",
            "category": "Management Role",
            "type": "High Priority",
            "staffing_type": "Full-time",
            "legal_basis": "Factories Act, 1948",
            "description": "Manages manufacturing operations, machinery maintenance, and shop floor throughput.",
            "responsibilities": [
                "Ensure workplace safety, machine guarding, and hazardous waste compliance",
                "Coordinate raw material supply chains and inventory cycles",
                "Maintain statutory registers under state Factories Rules"
            ],
            "qualifications": "Industrial/Mechanical Engineering or Production management."
        })
    else:
        roles.append({
            "title": "Operations & Quality Manager",
            "category": "Management Role",
            "type": "Recommended",
            "staffing_type": "Full-time / Co-founder",
            "legal_basis": "Operational Requirement",
            "description": "Oversees standard operating procedures, client onboarding, and vendor contracts.",
            "responsibilities": [
                "Standardize operational workflows and deliverables",
                "Supervise team execution and customer feedback loops"
            ],
            "qualifications": "Operations management experience."
        })

    # 4. Universal Commercial & Accounting Roles
    roles.append({
        "title": "Finance & Tax Accountant",
        "category": "Operational Role",
        "type": "Core Staffing",
        "staffing_type": "In-house or Outsourced Accounting Agency",
        "legal_basis": "Goods and Services Tax (GST) Act, 2017 & Income Tax Act, 1961",
        "description": "Maintains day-to-day bookkeeping, monthly GST filings, and payroll deductions.",
        "responsibilities": [
            "File monthly GSTR-1 and GSTR-3B tax returns",
            "Deduct and remit TDS (Tax Deducted at Source) and file quarterly 24Q/26Q returns",
            "Process payroll, PF/ESI contributions, and bank reconciliations"
        ],
        "qualifications": "B.Com / M.Com / Inter CA with Tally / Zoho Books expertise."
    })

    return roles
