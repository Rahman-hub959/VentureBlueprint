from typing import Dict, Any, List

def evaluate_project_compliance(project_data: Dict[str, Any], rules: List[Dict[str, Any]]) -> Dict[str, Any]:
    structure = project_data.get("preferred_structure") or project_data.get("legal_structure") or "Private Limited Company"
    domain = project_data.get("domain") or project_data.get("business_domain") or "Information Technology"
    founders = project_data.get("founders", [])
    profile = project_data.get("profile", {})
    
    # Extract operational parameters
    has_physical_loc = bool(profile.get("registered_office_address") or profile.get("has_physical_location"))
    collects_data = bool(profile.get("collects_personal_data"))
    multi_state = bool(profile.get("multi_state_operations"))
    employee_count_str = str(profile.get("expected_employee_count", "0"))
    
    # Parse approximate employee count
    emp_count = 0
    if "50" in employee_count_str:
        emp_count = 50
    elif "20" in employee_count_str or "16" in employee_count_str:
        emp_count = 20
    elif "10" in employee_count_str or "6" in employee_count_str:
        emp_count = 10
    elif "2" in employee_count_str:
        emp_count = 3
    else:
        emp_count = 1

    results = []
    passed = 0
    warnings = 0
    failed = 0
    missing = 0
    prof_review = 0
    unverified = 0

    for rule in rules:
        rule_code = rule["rule_code"]
        category = rule["category"]
        title = rule["title"]
        provision = rule.get("legal_provision", "")
        source_url = rule.get("official_source_url", "")
        app_struct = rule.get("applicable_structure", "All")
        app_domain = rule.get("applicable_domain", "All")

        # Check structural applicability
        if app_struct != "All" and app_struct != structure:
            continue

        # Check domain applicability
        if app_domain != "All" and app_domain.lower() not in domain.lower() and domain.lower() not in app_domain.lower():
            continue

        # Rule evaluation logic
        status = "Passed"
        finding = ""
        action = ""

        if rule_code == "MCA-INC-001":  # SPICe+ Incorporation
            if len(founders) < 2 and structure == "Private Limited Company":
                status = "Failed"
                finding = "Private Limited Company requires at least 2 shareholders/directors under Section 3(1) Companies Act 2013."
                action = "Add a second founder/director or convert to One Person Company (OPC)."
                failed += 1
            else:
                status = "Passed"
                finding = "Founder count meets statutory incorporation requirements."
                action = "Prepare SPICe+ Part A and Part B submission with Digital Signature Certificates."
                passed += 1

        elif rule_code == "MCA-DIR-002":  # Resident Director
            has_resident = any(f.get("is_resident_of_india", True) for f in founders) if founders else True
            if not has_resident:
                status = "Failed"
                finding = "None of the proposed directors are indicated as resident in India (>182 days in fiscal year)."
                action = "Appoint at least one Indian resident director to comply with Section 149(3)."
                failed += 1
            else:
                status = "Passed"
                finding = "Resident director requirement is satisfied."
                action = "Maintain passport/visa travel records in corporate secretarial file."
                passed += 1

        elif rule_code == "MCA-OFF-003":  # Registered Office
            if not profile.get("registered_office_address"):
                status = "Needs Additional Information"
                finding = "Registered office address has not yet been specified."
                action = "Provide full registered office address, electricity/utility bill (<2 months old), and landlord NOC."
                missing += 1
            else:
                status = "Passed"
                finding = f"Proposed registered office: {profile.get('registered_office_address')}."
                action = "Obtain recent utility bill and executed NOC from premises owner."
                passed += 1

        elif rule_code == "MCA-AUD-004":  # First Statutory Auditor
            status = "Professional Review Required"
            finding = "Statutory auditor must be appointed within 30 days of registration via Form ADT-1."
            action = "Engage an independent practicing Chartered Accountant and pass inaugural board resolution."
            prof_review += 1

        elif rule_code == "MCA-COM-005":  # Form INC-20A Commencement of Business
            status = "Warning"
            finding = "Mandatory 180-day deadline from incorporation to deposit share capital and file INC-20A."
            action = "Open corporate bank account immediately post-incorporation; deposit subscription money before business launch."
            warnings += 1

        elif rule_code == "LLP-FIL-001":  # LLP Agreement Form 3
            if structure == "LLP":
                status = "Warning"
                finding = "LLP Agreement must be executed and filed in Form 3 within 30 days of registration."
                action = "Draft LLP agreement on appropriate state non-judicial stamp paper with legal counsel."
                warnings += 1

        elif rule_code == "GST-REG-001":  # GST
            if multi_state or "e-commerce" in domain.lower() or "retail" in domain.lower():
                status = "Warning"
                finding = "Inter-state supply or e-commerce operations mandate compulsory GST registration regardless of turnover."
                action = "Apply for GSTIN on www.gst.gov.in using incorporation certificate and registered office proof."
                warnings += 1
            else:
                status = "Not Verified"
                finding = "Applicable once annual aggregate turnover exceeds ₹20 Lakhs (services) or ₹40 Lakhs (goods)."
                action = "Monitor cumulative billings and obtain GSTIN before crossing threshold."
                unverified += 1

        elif rule_code == "MSME-UDY-001":  # Udyam
            status = "Passed"
            finding = "Eligible for central MSME registration and benefits."
            action = "Complete self-declaration on udyamregistration.gov.in after receiving entity PAN."
            passed += 1

        elif rule_code == "DPIIT-STP-001":  # Startup India
            status = "Professional Review Required"
            finding = "Innovation write-up and DPIIT application required for tax exemption certification."
            action = "Submit pitch deck and incorporate entity details on startupindia.gov.in for Section 80-IAC evaluation."
            prof_review += 1

        elif rule_code == "LAB-SHP-001":  # Shop & Establishment
            if has_physical_loc:
                status = "Warning"
                finding = "Physical office requires state municipal Shop & Establishment registration within 30 days."
                action = "Submit local municipal application with photo of commercial signboard and rental deed."
                warnings += 1
            else:
                status = "Needs Additional Information"
                finding = "Physical operating premises to be confirmed."
                action = "Confirm premises location to determine state municipal labour applicability."
                missing += 1

        elif rule_code == "LAB-EPF-002":  # EPFO
            if emp_count >= 20:
                status = "Failed"
                finding = f"Anticipated team size ({emp_count}) triggers mandatory EPFO coverage under EPF Act 1952."
                action = "Activate SPICe+ EPFO registration code on Shram Suvidha portal and enroll employees."
                failed += 1
            else:
                status = "Passed"
                finding = f"Team size ({emp_count}) is below the mandatory 20-employee EPFO threshold."
                action = "Voluntary registration possible; mandatory compliance applies once headcount reaches 20."
                passed += 1

        elif rule_code == "LAB-ESI-003":  # ESIC
            if emp_count >= 10:
                status = "Warning"
                finding = f"Headcount ({emp_count}) meets the 10-employee threshold for ESIC applicability."
                action = "Register eligible employees earning up to ₹21,000/month on the ESIC employer portal."
                warnings += 1
            else:
                status = "Passed"
                finding = f"Headcount ({emp_count}) is below the 10-employee ESIC threshold."
                action = "Keep monthly wage records; register if employee count crosses 10."
                passed += 1

        elif rule_code == "DAT-DPD-001":  # DPDP Act
            if collects_data:
                status = "Warning"
                finding = "Business collects customer personal data and is subject to the Digital Personal Data Protection Act, 2023."
                action = "Publish comprehensive Privacy Policy, implement user consent banner, and data encryption protocols."
                warnings += 1
            else:
                status = "Passed"
                finding = "No extensive customer personal data processing declared."
                action = "Maintain internal privacy standard operating procedures."
                passed += 1

        elif rule_code == "SEC-FSS-001":  # FSSAI
            status = "Warning"
            finding = "Food business operations require statutory FSSAI licence before trading."
            action = "Apply for FSSAI registration/state licence via FoSCoS portal with kitchen floor plan."
            warnings += 1

        else:
            status = "Passed"
            finding = "Statutory rule assessed."
            action = "Follow regular statutory filing schedules."
            passed += 1

        results.append({
            "rule_code": rule_code,
            "rule_title": title,
            "category": category,
            "obligation_type": rule.get("obligation_type", "mandatory"),
            "status": status,
            "finding_summary": finding,
            "action_required": action,
            "legal_provision": provision,
            "official_source_url": source_url
        })

    return {
        "structure_evaluated": structure,
        "total_rules_assessed": len(results),
        "passed_count": passed,
        "warning_count": warnings,
        "failed_count": failed,
        "missing_info_count": missing,
        "professional_review_count": prof_review,
        "unverified_count": unverified,
        "rule_results": results
    }
