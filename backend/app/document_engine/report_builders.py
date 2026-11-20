from datetime import datetime, timezone
from typing import Dict, Any, List

def build_report_data(doc_type: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Builds the complete 18-Section Company Startup Blueprint dossier payload
    modeled exactly after the reference corporate specification:
    1 Summary · 2 Inputs · 3 Validation · 4 Glossary · 5 Structure comparison · 6 Recommendation
    7 Registration roadmap · 8 Planning sequence · 9 Checklist · 10 Roles · 11 Costs · 12 Branding
    13 Funding notes · 14 Risks · 15 Missing information · 16 CA/CS questions · 17 Review flags · 18 Sources
    """
    p_name = project_data.get("name") or "Venture Enterprise"
    domain = project_data.get("domain") or "Information Technology & Services"
    structure = project_data.get("preferred_structure") or "Private Limited Company"
    profile = project_data.get("business_profile") or {}
    founders = project_data.get("founders") or []
    directors = project_data.get("directors") or []
    current_user = project_data.get("current_user") or {}
    compliance = project_data.get("compliance_results") or []
    version = project_data.get("version", 1)
    now_str = datetime.now(timezone.utc).strftime("%d %B %Y")

    # Resolve primary promoter & founders
    founder_count = len(founders) if founders and isinstance(founders, list) else 1
    if founders and isinstance(founders, list) and len(founders) > 0 and founders[0].get("full_name"):
        promoter_name = founders[0].get("full_name")
        promoter_email = founders[0].get("email") or current_user.get("email", "")
    elif current_user.get("full_name"):
        promoter_name = current_user.get("full_name")
        promoter_email = current_user.get("email", "")
    else:
        promoter_name = "Lead Promoter"
        promoter_email = "promoter@ventureblueprint.in"

    # Address & location
    reg_office = profile.get("registered_office_address")
    city = profile.get("city", "Hyderabad")
    state = profile.get("state", "Telangana")
    pincode = profile.get("postal_code", "500081")

    if reg_office and len(reg_office.strip()) > 5:
        full_address = reg_office.strip()
    elif city or state:
        full_address = f"{city}, {state}".strip()
    else:
        full_address = f"Hyderabad, Telangana"

    auth_cap_num = float(profile.get("proposed_authorized_capital") or 100000.0)
    paid_cap_num = float(profile.get("proposed_paid_up_capital") or 100000.0)
    auth_capital_str = f"₹{auth_cap_num:,.0f}"
    paid_capital_str = f"₹{paid_cap_num:,.0f}"

    biz_desc = profile.get("business_description") or f"Software development and subscription SaaS for small businesses (B2B) in {domain}"
    premise_type = profile.get("premise_type") or "Founder's rented residential flat"
    headcount = profile.get("expected_employee_count") or "1 to 5 people"
    funding_plan = profile.get("funding_plan") or "Seed round within 12 months"
    biz_stage = profile.get("business_stage") or "Idea"

    # Ownership breakdown
    if founders and isinstance(founders, list) and len(founders) > 0:
        ownership_parts = []
        for f in founders:
            pct = f.get("ownership_percentage") or (100 // len(founders))
            ownership_parts.append(f"{f.get('full_name', 'Founder')} {pct}%")
        ownership_str = ", ".join(ownership_parts)
    else:
        ownership_str = f"{promoter_name} 100%"

    # Dynamic Single-Founder vs Multi-Founder logic
    is_single_founder = (founder_count <= 1)
    is_pvt_ltd_preferred = ("private limited" in structure.lower())

    if is_single_founder and is_pvt_ltd_preferred:
        pref_status = "Excluded for now"
        pref_note = (
            f"Private Limited (your preferred option) is excluded for now. You listed one founder ({promoter_name}) "
            "and no second director or member. A private company needs more than one of each (Not verified, rule R-IN-STR-001). "
            "Your preference cannot override an eligibility failure."
        )
        rec_shortlist = [
            ("1. One Person Company (OPC)", "Limited liability and a separate legal entity with one founder. Conditional on confirming residency and appointing a nominee."),
            ("2. Sole Proprietorship", "Fastest and cheapest to start, but unlimited personal liability and little credibility with investors.")
        ]
        rec_alternative = "Add a co-founder and use Private Limited. This matches your stated preference and your funding plan. Practitioners generally treat it as the usual route for outside investment (guidance, not a legal rule)."
        ref_output_desc = "single founder who prefers a Private Limited company (India)"
    elif is_single_founder:
        pref_status = "Provisionally eligible"
        pref_note = f"Single founder entity compliant with {structure} statutory thresholds."
        rec_shortlist = [
            ("1. One Person Company (OPC)", "Optimal corporate shield with 100% single-shareholder governance under Section 2(62)."),
            ("2. Sole Proprietorship", "Informal single-proprietor framework with zero statutory registration overhead.")
        ]
        rec_alternative = "Onboard a co-director to unlock Private Limited Company status if equity fundraising is anticipated."
        ref_output_desc = f"single founder ({structure})"
    else:
        pref_status = "Eligible"
        pref_note = f"Multi-founder quorum ({founder_count} founders) satisfies the minimum statutory requirement for {structure}."
        rec_shortlist = [
            ("1. Private Limited Company", "Limited liability, institutional credibility, distinct legal personality, and multi-shareholder cap table."),
            ("2. Limited Liability Partnership (LLP)", "Pass-through partnership model with capped liability and lower compliance requirements.")
        ]
        rec_alternative = "Evaluate an LLP agreement if no institutional equity fundraising is planned in the first 24 months."
        ref_output_desc = f"multi-founder team ({founder_count} members) establishing {structure} (India)"

    # Build the 18 Structured Sections
    sections: List[Dict[str, Any]] = [
        # ─────────────────────────────────────────────────────────────
        # SECTION 1: EXECUTIVE SUMMARY
        # ─────────────────────────────────────────────────────────────
        {
            "num": 1,
            "title": "1. Executive Summary",
            "box_title": "Outcome: Provisional shortlist. This is not a definitive recommendation.",
            "box_content": "Two facts are missing and block a definitive answer: founder residency status and expected first-year turnover.",
            "subsections": [
                {
                    "side_heading": "Eligibility & Preferred Structure Status",
                    "paragraphs": [
                        pref_note,
                        f"<b>Shortlist:</b> {rec_shortlist[0][0]} first, {rec_shortlist[1][0]} second.",
                        f"<b>Path to your preferred structure:</b> If a second director and member join before incorporation, Private Limited becomes eligible. Re-run the assessment.",
                        f"<b>Why it matters here:</b> You plan to raise seed funding within 12 months, so decide the structure now, not later (see Sections 6 and 13).",
                        f"<b>Your next three moves:</b> Confirm residency, estimate first-year turnover, and decide whether a co-founder is realistic (Section 8)."
                    ]
                }
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 2: YOUR INPUTS
        # ─────────────────────────────────────────────────────────────
        {
            "num": 2,
            "title": "2. Your Inputs",
            "intro": "Facts, assumptions and missing items are kept apart. No assumptions were made for legal outcomes.",
            "table_headers": ["Item", "Value", "Basis"],
            "table_rows": [
                ["Business name (proposed)", p_name, "Provided; availability not guaranteed"],
                ["Activity", biz_desc, "Provided"],
                ["Founders", f"{founder_count} ({promoter_name})", "Provided"],
                ["Ownership", f"{ownership_str}", "Provided; totals 100%"],
                ["Preferred structure", structure, "Provided"],
                ["Location", f"{city}, {state}", "Provided"],
                ["Premises", premise_type, "Provided"],
                ["Proposed capital", auth_capital_str, "Provided; not a fee or legal minimum"],
                ["Team size (year 1)", headcount, "Provided"],
                ["Funding plan", funding_plan, "Provided"],
                ["Stage", biz_stage, "Provided"],
                ["Founder residency status", "Not provided", "MISSING. Required for OPC"],
                ["Expected first-year turnover", "Not provided", "MISSING. Affects GST and other registrations"]
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 3: VALIDATION RESULTS
        # ─────────────────────────────────────────────────────────────
        {
            "num": 3,
            "title": "3. Validation Results",
            "intro": "Evaluation of submitted project facts against deterministic statutory rules:",
            "table_headers": ["Severity", "Check", "Result and action"],
            "table_rows": [
                ["Error" if (is_single_founder and is_pvt_ltd_preferred) else "Info",
                 "Private Limited with one founder (FR-VALID-002/003)",
                 "Blocks. Only one director and one member listed. Cites R-IN-STR-001. Add a second director and member, or choose another structure." if (is_single_founder and is_pvt_ltd_preferred) else f"Passed. Quorum of {founder_count} satisfies statutory minimum."],
                ["Warning", "Residential rented premises as registered office", "Allowed with acknowledgement. Owner's no-objection and address proof are likely needed (Not verified, R-IN-OFF-001)."],
                ["Warning", "Seed funding planned within 12 months", "Allowed with acknowledgement. An OPC may not suit outside investors. Plan a restructure or conversion."],
                ["Warning", "Turnover not provided", "Registration applicability for tax and similar items cannot be decided. Question raised."],
                ["Info", "Ownership percentages", f"Total 100% ({ownership_str}). Passed."],
                ["Info", "Name check", "Preliminary only. No availability or registrability is guaranteed."]
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 4: PLAIN-LANGUAGE GLOSSARY
        # ─────────────────────────────────────────────────────────────
        {
            "num": 4,
            "title": "4. Plain-Language Glossary",
            "intro": "Terms used in this report (FR-LEGAL-004). Explanations are general, not legal advice.",
            "table_headers": ["Term", "What it means for you"],
            "table_rows": [
                ["Company", "A separate legal entity. It owns assets and signs contracts in its own name; you own shares in it."],
                ["Director", "A person who runs the company and carries legal duties. A founder can also be a director."],
                ["Member / shareholder", "A person who owns shares. Ownership and management are separate roles even if one person holds both."],
                ["Nominee (OPC)", "A person named to step in as the member if the sole member dies or cannot act. Consent is required."],
                ["Partner / LLP", "Partners own and run a partnership or LLP. Designated partners carry the LLP's statutory duties."],
                ["Investor", "An outside party putting in money for equity. Not a legal structure and not a role you must appoint."],
                ["DSC", "Digital Signature Certificate, used to sign MCA e-forms."],
                ["MOA / AOA", "Memorandum and Articles of Association: the company's constitution documents."],
                ["SPICe+", "MCA's integrated web form for incorporation."]
            ],
            "footnote": "\"Stakeholder\" is not a legal structure and is never offered as one (FR-LEGAL-004)."
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 5: LEGAL-STRUCTURE COMPARISON
        # ─────────────────────────────────────────────────────────────
        {
            "num": 5,
            "title": "5. Legal-Structure Comparison",
            "intro": "Cost columns are not filled because fees must come from reviewed rule data (BR-02). All entries are Not verified until published in the KB.",
            "table_headers": ["Structure", "Liability", "Ownership and governance", "Compliance burden", "Incorporation effort", "Fit for this case"],
            "table_rows": [
                ["Sole Proprietorship", "Unlimited. Owner and business are the same person", "One owner, no separate entity", "Lowest", "No company registration", "Eligible. Weak for investors"],
                ["Partnership Firm", "Partners liable, jointly and severally", "At least 2 partners, deed required", "Low", "Deed plus optional registration", "Excluded: one founder" if is_single_founder else "Eligible"],
                ["LLP", "Limited to contribution", "At least 2 partners, designated partners", "Medium", "Registration with MCA", "Excluded: one founder" if is_single_founder else "Eligible"],
                ["OPC", "Limited", "One member plus a nominee; one director minimum", "Medium", "Registration with MCA", "Provisionally eligible, needs residency confirmation" if is_single_founder else "Excluded: >1 founder"],
                ["Private Limited", "Limited", "At least 2 members and 2 directors", "Higher", "Registration with MCA", "Excluded now. Eligible with a second director and member" if is_single_founder else "Eligible & Recommended"],
                ["Public Limited", "Limited", "At least 3 directors and 7 members", "Highest", "Registration with MCA", "Excluded"]
            ],
            "footnote": "Indicative cost for every option: TBD. Pending reviewed fee rules."
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 6: RECOMMENDATION
        # ─────────────────────────────────────────────────────────────
        {
            "num": 6,
            "title": "6. Recommendation",
            "intro": "Status: Provisional shortlist. Rules unverified, so review is required (decision table, row 2).",
            "subsections": [
                {
                    "side_heading": "Shortlist",
                    "paragraphs": [
                        f"<b>1. {rec_shortlist[0][0]}:</b> {rec_shortlist[0][1]}",
                        f"<b>2. {rec_shortlist[1][0]}:</b> {rec_shortlist[1][1]}"
                    ]
                },
                {
                    "side_heading": "Alternative worth weighing",
                    "paragraphs": [rec_alternative]
                },
                {
                    "side_heading": "What would change this answer",
                    "table_headers": ["If this turns out to be true", "Then the assessment becomes"],
                    "table_rows": [
                        ["Founder is not a resident of India", "OPC excluded (if the residency rule is confirmed). Sole Proprietorship or a second founder remain."],
                        ["A second director and member will join", "Private Limited becomes eligible and matches your funding plan."],
                        ["Seed round is unlikely or beyond 12 months", "OPC ranks higher; plan a later conversion."],
                        ["Turnover is expected to be high in year 1", "Tax registration items move from conditional to mandatory; review compliance load with a CA."]
                    ]
                },
                {
                    "side_heading": "Reasons",
                    "paragraphs": [
                        "• Your preferred option fails an eligibility rule, so it is excluded and the reason is shown." if (is_single_founder and is_pvt_ltd_preferred) else "• Statutory quorum and founder governance align with recommended structure.",
                        "• The shortlist is ranked on liability protection first, then investor suitability, then compliance effort.",
                        "• A later OPC-to-company change adds cost and time. If you expect to raise money soon, decide before registering."
                    ]
                }
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 7: REGISTRATION ROADMAP
        # ─────────────────────────────────────────────────────────────
        {
            "num": 7,
            "title": "7. Registration Roadmap",
            "intro": f"Shown for the first-ranked option ({'OPC' if is_single_founder else 'Private Limited'}). Timelines and fees are not estimated until KB values exist. All steps are Not verified.",
            "table_headers": ["#", "Action", "Class", "Authority", "Timeline and fee"],
            "table_rows": [
                ["1", "Obtain Class 3 Digital Signature Certificate for the director", "Mandatory", "Licensed certifying agency", "TBD (KB)"],
                ["2", "Propose and reserve company name", "Mandatory", "MCA", "TBD (KB)"],
                ["3", "Prepare e-MOA and e-AOA drafts (professional review required)", "Mandatory", "MCA", "TBD (KB)"],
                ["4", "Nominee consent (Form INC-3)" if is_single_founder else "Director Consent (Form DIR-2)", "Mandatory", "MCA", "TBD (KB)"],
                ["5", "File integrated incorporation application (SPICe+, INC-32)", "Mandatory", "MCA", "TBD (KB)"],
                ["6", "Receive Certificate of Incorporation, PAN and TAN", "Mandatory", "MCA, Income Tax Dept", "TBD (KB)"],
                ["7", "Open current bank account and bring in subscribed capital", "Mandatory", "Bank", "TBD"],
                ["8", "Declaration of commencement of business (INC-20A)", "Conditional", "MCA", "Deadline TBD (KB)"],
                ["9", "GST registration", "Conditional on turnover and supply type", "GST portal", "Needs turnover input"],
                ["10", f"Shops and Establishment, professional tax, PF/ESIC ({state})", "Conditional on headcount and premises", "State and central labour authorities", "Needs headcount confirmation"],
                ["11", "Udyam (MSME) registration", "Optional", "MSME", "TBD"],
                ["12", "DPIIT startup recognition", "Optional", "DPIIT / Startup India", "TBD"]
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 8: YOUR PLANNING SEQUENCE
        # ─────────────────────────────────────────────────────────────
        {
            "num": 8,
            "title": "8. Your Planning Sequence",
            "intro": "A suggested order of work for you, not an official timeline. Durations are deliberately omitted until reviewed rule data exists.",
            "table_headers": ["Phase", "Do this", "Done when"],
            "table_rows": [
                ["A. Decide", "Confirm residency. Estimate year-1 turnover. Decide on a co-founder. Re-run the assessment.", "Report moves from provisional shortlist to a firmer recommendation"],
                ["B. Prepare", "Choose 3 name options. Request a DSC. Get landlord NOC and address proof. Pick a nominee if OPC.", "Checklist items for the incorporation stage are Provided"],
                ["C. Review", "Send draft MOA/AOA, structure choice and this report to a CA/CS (Section 16).", "Professional review recorded"],
                ["D. File", "CA/CS or you file SPICe+ with associated forms.", "Certificate of Incorporation received"],
                ["E. Set up", "Bank account, capital, PAN/TAN follow-through, conditional registrations as thresholds apply.", "Conditional items marked Provided or Not required"]
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 9: DOCUMENT CHECKLIST
        # ─────────────────────────────────────────────────────────────
        {
            "num": 9,
            "title": "9. Document Checklist",
            "intro": "No uploads are required in this release. This list is for tracking only, and ticking an item does not prove a document is genuine.",
            "table_headers": ["Item", "Purpose", "Provider", "Flag", "Stage", "Status", "Owner"],
            "table_rows": [
                ["Director identity and address proof", "Incorporation application", "Founder", "Mandatory", "Incorporation", "pending", promoter_name],
                ["Digital Signature Certificate", "Sign e-forms", "Certifying agency", "Mandatory", "Incorporation", "pending", promoter_name],
                ["Registered office proof and owner NOC", "Show office address", "Landlord", "Conditional", "Incorporation", "pending", promoter_name],
                ["Nominee consent (INC-3)" if is_single_founder else "DIR-2 Director Consents", "Statutory appointment", "Nominee / Director", "Mandatory", "Incorporation", "pending", promoter_name],
                ["Draft MOA and AOA (needs CA/CS review)", "Constitution of the company", "CA/CS", "Mandatory", "Incorporation", "pending", promoter_name],
                ["Bank account opening documents", "Receive capital", "Bank", "Mandatory", "Post-incorporation", "pending", promoter_name],
                ["GST application data", "Tax registration", "Founder", "Conditional", "Post-incorporation", "pending", promoter_name],
                ["Udyam details", "MSME benefits", "Founder", "Optional", "Post-incorporation", "pending", promoter_name]
            ],
            "footnote": "The companion Excel planner carries this checklist with status dropdowns."
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 10: ROLE PLAN
        # ─────────────────────────────────────────────────────────────
        {
            "num": 10,
            "title": "10. Role Plan",
            "intro": "Statutory positions (kept separate from operational roles)",
            "subsections": [
                {
                    "side_heading": "Statutory positions",
                    "table_headers": ["Position", "Status", "Note"],
                    "table_rows": [
                        ["Director", "Essential", "Minimum number depends on the structure (Not verified)"],
                        ["Nominee (OPC only)", "Essential if OPC" if is_single_founder else "Not applicable", "Consent required under Form INC-3"],
                        ["Statutory auditor", "Conditional", "Appointment and exemptions per KB rules under Section 139"],
                        ["Company-secretarial duties", "Outsourced", "A full-time CS is not required for a company of this size"]
                    ]
                },
                {
                    "side_heading": "Operational roles",
                    "table_headers": ["Role", "Purpose", "Status", "Priority", "Rationale"],
                    "table_rows": [
                        ["Founder / product lead", "Build and sell the product", "Essential", "1", "Single founder runs product and sales"],
                        ["Backend / AI engineer", "Core product development", "Conditional", "2", "Add when development outgrows the founder's capacity"],
                        ["Sales / customer success", "Win and keep B2B customers", "Conditional", "3", "Needed once pilots convert"],
                        ["Bookkeeping and tax filing", "Accounts and returns", "Outsourced", "2", "Cheaper than hiring at 1 to 5 people"],
                        ["UI designer", "Product polish", "Optional", "4", "Freelance as needed"]
                    ]
                }
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 11: COST ESTIMATE
        # ─────────────────────────────────────────────────────────────
        {
            "num": 11,
            "title": "11. Cost Estimate",
            "intro": "No amounts are shown because fees come from reviewed, versioned rule data and none has been published yet. Use the planner's Costs sheet to record quotes you collect.",
            "table_headers": ["Cost type", "Amount", "Basis", "Status"],
            "table_rows": [
                ["Government incorporation fees", "TBD", "Fee rule, MCA", "Pending KB"],
                [f"Stamp duty ({state})", "TBD", "State rule", "Pending KB"],
                ["Digital Signature Certificate", "TBD", "Provider price list", "Pending"],
                ["Professional fees (CA/CS)", "TBD", "Quotes", "Estimate, not official"],
                ["Annual compliance", "TBD", "Annual filing rules", "Pending KB"],
                ["Proposed capital", auth_capital_str, "Your input", "Not a fee"]
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 12: BRANDING AND LOGO BRIEF
        # ─────────────────────────────────────────────────────────────
        {
            "num": 12,
            "title": "12. Branding and Logo Brief",
            "intro": "Brand inputs for the logo stage (FR-LOGO-001). The directions below are design concepts, not legal advice, and carry no availability or trademark guarantee.",
            "subsections": [
                {
                    "side_heading": "Brand Parameters",
                    "table_headers": ["Input", "Value"],
                    "table_rows": [
                        ["Name", f"{p_name} (provided)"],
                        ["Audience", f"Small-business owners and enterprise clients in {domain}"],
                        ["Personality, colours, tagline, domain", "Additional information required"]
                    ]
                },
                {
                    "side_heading": "Concept Directions",
                    "table_headers": ["Concept", "Direction"],
                    "table_rows": [
                        ["Minimalist", f"A simple geometric mark combining a modern monogram with the initial letter of {p_name}; one colour plus neutral."],
                        ["Symbolic", "A stylised emblem or icon suggesting precision, stability and clarity for high-growth operations."],
                        ["Typographic", f"Wordmark '{p_name}' with balanced executive letter-spacing; clean modern sans-serif."]
                    ]
                }
            ],
            "footnote": "Name and trademark check: preliminary only, time-stamped at generation. No availability or registrability is guaranteed. SVG output only from genuine vector generation (FR-LOGO-003)."
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 13: FUNDING READINESS NOTES
        # ─────────────────────────────────────────────────────────────
        {
            "num": 13,
            "title": "13. Funding Readiness Notes",
            "intro": "General guidance for founders planning a seed round. This is not a legal rule and is not verified.",
            "subsections": [
                {
                    "side_heading": "Institutional Investor Criteria",
                    "paragraphs": [
                        "• Investors usually expect a company with several shareholders and a clean cap table; ask your CA/CS how an OPC would be handled in a round.",
                        "• Keep founder capital, bank flows and agreements in the company's name from day one.",
                        "• Record IP assignment from the founder to the company in writing, reviewed by a lawyer.",
                        "• If you plan an ESOP or founder vesting, raise it with your CA/CS before choosing the structure."
                    ]
                }
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 14: RISKS
        # ─────────────────────────────────────────────────────────────
        {
            "num": 14,
            "title": "14. Risks",
            "intro": "Identified operational and statutory risk factors:",
            "table_headers": ["ID", "Risk", "Mitigation"],
            "table_rows": [
                ["R-01", "Structure choice conflicts with seed funding plans", "Decide before registering; consider a co-founder and Private Limited"],
                ["R-02", "Rented residential premises not accepted as registered office", "Get owner NOC and check the rule early"],
                ["R-03", "Unverified rules are out of date", "Reviewed KB, verification dates, professional review"],
                ["R-04", "Name is rejected or conflicts with a trademark", "Preliminary checks only; check again before filing"],
                ["R-05", "Output mistaken for certified advice", "Disclaimers, draft labels, no certificates or approvals"]
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 15: MISSING INFORMATION
        # ─────────────────────────────────────────────────────────────
        {
            "num": 15,
            "title": "15. Missing Information",
            "intro": "Critical facts required to transition from provisional planning to final filing:",
            "table_headers": ["Needed fact", "Why it matters", "Blocks"],
            "table_rows": [
                ["Founder is a resident of India?", "OPC eligibility", "Definitive OPC recommendation"],
                ["Expected first-year turnover", "GST and other thresholds", "Registration applicability"],
                ["Will a second director or member join?", "Opens the Private Limited option", "Final structure choice"],
                ["Brand personality, colours, tagline", "Logo concepts", "Logo generation quality"]
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 16: QUESTIONS FOR YOUR CA/CS
        # ─────────────────────────────────────────────────────────────
        {
            "num": 16,
            "title": "16. Questions for Your CA/CS",
            "intro": "Take these exact questions to your formal consultation:",
            "subsections": [
                {
                    "side_heading": "Statutory Consultation Checklist",
                    "paragraphs": [
                        "1. Given my residency status, am I eligible for an OPC, and what are the nominee requirements?",
                        "2. If I raise seed funding within 12 months, what is the cleanest route: Private Limited now with a co-founder, or OPC then conversion?",
                        "3. Will my rented residential flat work as the registered office, and what NOC and proofs do you need?",
                        f"4. Which registrations apply to me at my expected turnover and headcount in {state}?",
                        "5. Please review my draft MOA and AOA before I file.",
                        "6. What are your fees for incorporation and for the first year of compliance?"
                    ]
                }
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 17: PROFESSIONAL REVIEW FLAGS
        # ─────────────────────────────────────────────────────────────
        {
            "num": 17,
            "title": "17. Professional Review Flags",
            "intro": "Mandatory disclosure flags under SRS specifications BR-03 and BR-04:",
            "subsections": [
                {
                    "side_heading": "Mandatory Regulatory Flags",
                    "paragraphs": [
                        "• Rules used in this report are not yet reviewed, so the whole report is flagged (BR-03/BR-04).",
                        "• The OPC versus Private Limited choice is an unresolved interpretation tied to your funding plan.",
                        "• Draft MOA and AOA text must be reviewed by a CA, CS or lawyer before use."
                    ]
                }
            ]
        },

        # ─────────────────────────────────────────────────────────────
        # SECTION 18: SOURCES AND RULE VERSIONS USED
        # ─────────────────────────────────────────────────────────────
        {
            "num": 18,
            "title": "18. Sources and Rule Versions Used",
            "intro": "Every legal statement above traces to one of these records (FR-RULES-003). IDs and versions are illustrative.",
            "table_headers": ["Rule ID", "Statement", "Authority", "Official source", "Version", "Status"],
            "table_rows": [
                ["R-IN-STR-001", "Private company needs 2+ members and 2+ directors", "MCA, Companies Act 2013", "mca.gov.in", "0.1", "Not verified"],
                ["R-IN-STR-002", "OPC: one member, one nominee, residency condition", "MCA", "mca.gov.in", "0.1", "Not verified"],
                ["R-IN-OFF-001", "Registered office proof and owner NOC", "MCA", "mca.gov.in", "0.1", "Not verified"],
                ["R-IN-TAX-001", "GST registration depends on turnover and supply type", "GST portal", "gst.gov.in", "0.1", "Not verified"],
                ["R-IN-MSME-001", "Udyam registration is optional", "MSME", "udyamregistration.gov.in", "0.1", "Not verified"],
                ["R-IN-DPIIT-001", "DPIIT recognition is optional", "DPIIT", "startupindia.gov.in", "0.1", "Not verified"]
            ],
            "subsections": [
                {
                    "side_heading": "How this report separates its content (FR-DOC-002)",
                    "table_headers": ["Separation", "Where"],
                    "table_rows": [
                        ["Legal requirements vs recommendations", "Sections 5 and 7 (requirements) vs Section 6 (recommendation)"],
                        ["Verified facts vs assumptions", "Section 2 (provided vs missing); no legal assumptions made"],
                        ["Estimated vs official figures", "Section 11; all amounts TBD until KB publishes official values"],
                        ["Mandatory vs conditional actions", "Section 7 Class column; Section 9 Flag column"]
                    ]
                },
                {
                    "side_heading": "Version history",
                    "table_headers": ["Version", "Date", "Change", "Rules used"],
                    "table_rows": [
                        ["v1.0", now_str, "First generation", "SAMPLE-KB-0.1"],
                        ["v1.1", now_str, "Added glossary, scenarios, planning sequence, branding brief, funding notes, CA/CS questions", "SAMPLE-KB-0.1"]
                    ]
                }
            ],
            "footnote": "Last-verified date: none. Fallback content is shown with this label until a reviewer publishes the rule."
        }
    ]

    # Status labels table
    status_labels_table = [
        ["Verified", "Checked against a recorded official source; may be stated as fact with a link."],
        ["Provisional", "Applies on current data; confirmation needed."],
        ["Not verified", "Shown only as unverified guidance."],
        ["Additional information required", "Cannot be decided; a question is raised."],
        ["Professional review required", "Complex or ambiguous; flagged prominently."]
    ]

    # Metadata table (field | value)
    metadata_table = [
        ["Project", f"{p_name}, {biz_desc}"],
        ["Jurisdiction", f"India ({state}, {city})"],
        ["Report version", f"v1.1 (published versions are immutable; edits create v1.2)"],
        ["Generated on", now_str],
        ["Rule-set used", "SAMPLE-KB-0.1 (illustrative, not reviewed)"],
        ["Overall status", "PROVISIONAL. Professional CA/CS review required before any filing"],
        ["Conforms to", "SRS v0.1: FR-LEGAL, FR-VALID, FR-RULES, FR-DOC, FR-CHK, FR-ROLE, FR-LOGO, BR-01 to BR-07"]
    ]

    # Contents items list
    contents_list = [
        "1 Summary", "2 Inputs", "3 Validation", "4 Glossary", "5 Structure comparison", "6 Recommendation",
        "7 Registration roadmap", "8 Planning sequence", "9 Checklist", "10 Roles", "11 Costs", "12 Branding",
        "13 Funding notes", "14 Risks", "15 Missing information", "16 CA/CS questions", "17 Review flags", "18 Sources"
    ]

    return {
        "title": "COMPANY STARTUP BLUEPRINT",
        "company_name": p_name,
        "ref_output_desc": ref_output_desc,
        "metadata_table": metadata_table,
        "disclaimer_banner": (
            "Planning assistance only. This platform does not register companies, certify documents, "
            "or replace a CA, CS or lawyer. This is a SAMPLE showing how the SRS expects the output to behave. "
            "Rule IDs, versions and source links are illustrative. Every legal statement is labelled Not verified "
            "until a compliance reviewer publishes it in the Regulatory Knowledge Base."
        ),
        "status_labels_table": status_labels_table,
        "contents_list": contents_list,
        "sections": sections,
        "domain": domain,
        "structure": structure,
        "version": version,
        "generated_at": now_str,
        "promoter_name": promoter_name,
        "promoter_email": promoter_email,
        "location": full_address,
        "state": state,
        "city": city,
        "authorized_capital": auth_capital_str,
        "paid_up_capital": paid_capital_str,
        "founder_count": founder_count,
        "business_stage": biz_stage,
        "headcount": headcount,
        "business_description": biz_desc
    }
