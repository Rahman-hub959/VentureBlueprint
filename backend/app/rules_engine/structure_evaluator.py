from typing import Dict, Any, List

def evaluate_legal_structure(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministic rule-based legal structure recommendation for Indian jurisdiction.
    Evaluates Private Limited Company, LLP, One Person Company (OPC), Partnership Firm, and Sole Proprietorship.
    """
    founder_count = int(data.get("founder_count") or 1)
    has_investors = bool(data.get("has_investor_participation") or False)
    needs_funding = bool(data.get("needs_equity_funding") or has_investors)
    capital = float(data.get("proposed_authorized_capital") or 100000.0)
    has_foreign_founders = bool(data.get("has_foreign_founders") or False)
    preferred_choice = data.get("preferred_structure")
    business_domain = data.get("business_domain", "")

    # Scoring matrix for each structure (0 to 100)
    scores = {
        "Private Limited Company": 50,
        "LLP": 40,
        "OPC": 30,
        "Partnership Firm": 20,
        "Sole Proprietorship": 20
    }

    # Rules evaluation
    if founder_count == 1:
        scores["OPC"] += 45
        scores["Sole Proprietorship"] += 40
        scores["Private Limited Company"] -= 20  # Requires at least 2 directors/shareholders
        scores["LLP"] -= 30                     # Requires at least 2 partners
        scores["Partnership Firm"] -= 30
    else:
        scores["Private Limited Company"] += 25
        scores["LLP"] += 30
        scores["OPC"] = 0  # Invalid for multiple founders

    if needs_funding or has_investors:
        scores["Private Limited Company"] += 35
        scores["LLP"] -= 15
        scores["OPC"] -= 25
        scores["Partnership Firm"] -= 30
        scores["Sole Proprietorship"] -= 40

    if has_foreign_founders:
        scores["Private Limited Company"] += 20
        scores["LLP"] += 10
        scores["Sole Proprietorship"] = 0

    if capital > 1000000:  # > 10 Lakhs
        scores["Private Limited Company"] += 15
        scores["LLP"] += 10

    # Best structure determination
    recommended = max(scores, key=scores.get)
    # If user selected a preference and it's legally valid, consider it
    if preferred_choice and preferred_choice in scores and scores[preferred_choice] > 40:
        if founder_count == 1 and preferred_choice in ["Private Limited Company", "LLP"]:
            # Contradiction: Single founder cannot directly incorporate Pvt Ltd without adding another shareholder
            pass
        else:
            recommended = preferred_choice

    # Metadata dictionaries
    rationales = {
        "Private Limited Company": (
            "Recommended for high-growth ventures planning institutional fundraising, angel investment, or ESOP pools. "
            "Offers limited liability, separate legal personality, and universal investor preference under the Companies Act 2013."
        ),
        "LLP": (
            "Recommended for professional services, consultancies, or boot-strapped businesses with multiple partners. "
            "Combines limited liability with lower statutory compliance overhead and no mandatory dividend distribution tax."
        ),
        "OPC": (
            "Recommended for a solo entrepreneur desiring limited liability and separate corporate status without partners. "
            "Governed under Section 2(62) of the Companies Act 2013 with nominee director provisions."
        ),
        "Partnership Firm": (
            "Suitable only for small, traditional family or localized businesses not seeking external funding. "
            "Carries unlimited personal liability and no separate corporate entity under the Indian Partnership Act 1932."
        ),
        "Sole Proprietorship": (
            "Simplest setup with minimal compliance for local individual trading. "
            "Carries unlimited liability and ceases upon the demise of the proprietor."
        )
    }

    advantages = {
        "Private Limited Company": [
            "Limited liability protection for shareholders",
            "Eligible for DPIIT Startup India tax exemptions (Section 80-IAC, Angel Tax exemption)",
            "Ability to issue equity shares, preference shares, and employee stock options (ESOPs)",
            "High credibility with banks, corporate clients, and international vendors"
        ],
        "LLP": [
            "Partners have limited liability capped to agreed contribution",
            "Significantly lower annual compliance costs compared to companies",
            "No requirement for mandatory statutory audit if turnover is under ₹40 Lakhs and capital is under ₹25 Lakhs",
            "Flexible internal governance via the LLP Agreement"
        ],
        "OPC": [
            "Single individual can own 100% equity with limited liability",
            "Fewer compliance requirements than a multi-member Private Limited Company",
            "Can seamlessly convert to Private Limited when turnover or capital crosses statutory thresholds"
        ],
        "Partnership Firm": [
            "Minimal formation formalities with local Registrar of Firms",
            "Low initial registration fees",
            "Direct taxation of partner shares"
        ],
        "Sole Proprietorship": [
            "No formal charter capital requirement",
            "Complete individual control",
            "Easiest to dissolve"
        ]
    }

    limitations = {
        "Private Limited Company": [
            "Requires at least 2 directors and 2 shareholders",
            "Mandatory annual statutory audit by an independent Chartered Accountant",
            "Higher annual ROC filing compliance (AOC-4, MGT-7, DIR-3 KYC)",
            "Strict penalties for non-filing of ROC returns"
        ],
        "LLP": [
            "Cannot issue equity shares or create ESOP pools for employees",
            "Venture capital firms and angel networks typically cannot invest in LLPs",
            "Requires at least 2 designated partners, one of whom must be an Indian resident"
        ],
        "OPC": [
            "Requires appointment of a Nominee Director in the Memorandum",
            "Restricted to Indian citizens and resident natural persons",
            "Cannot carry out Non-Banking Financial Investment activities"
        ],
        "Partnership Firm": [
            "Unlimited personal liability for all partners",
            "Partners are mutually liable for actions of other partners",
            "Cannot raise venture capital equity"
        ],
        "Sole Proprietorship": [
            "Unlimited personal liability putting personal assets at risk",
            "No perpetual succession",
            "High difficulty in obtaining bank corporate financing"
        ]
    }

    timelines = {
        "Private Limited Company": "7 to 14 business days via SPICe+ (INC-32) on MCA portal",
        "LLP": "10 to 18 business days via FiLLiP on MCA portal",
        "OPC": "7 to 12 business days via SPICe+ on MCA portal",
        "Partnership Firm": "5 to 10 business days with State Registrar of Firms",
        "Sole Proprietorship": "3 to 5 business days via Udyam / Shop & Establishment"
    }

    gov_fees = {
        "Private Limited Company": "₹1,000 – ₹5,000 (Central MCA zero-fee up to ₹15 Lakhs capital; state stamp duty applies)",
        "LLP": "₹500 – ₹2,500 based on contribution slab + state stamp duty on LLP Agreement",
        "OPC": "₹1,000 – ₹3,000 based on authorized capital slab + state stamp duty",
        "Partnership Firm": "₹500 – ₹1,500 depending on state stamp duty rules",
        "Sole Proprietorship": "₹0 for Udyam registration; ₹500 – ₹2,000 for local Municipal Shop & Establishment licence"
    }

    return {
        "recommended_structure": recommended,
        "suitability_score": min(98, max(50, scores[recommended])),
        "all_scores": scores,
        "rationale": rationales.get(recommended, ""),
        "advantages": advantages.get(recommended, []),
        "disadvantages_and_limitations": limitations.get(recommended, []),
        "estimated_incorporation_timeline": timelines.get(recommended, "7-14 days"),
        "estimated_government_fee_range": gov_fees.get(recommended, "Varies by state stamp duty"),
        "statutory_requirements_summary": [
            "Digital Signature Certificate (DSC) for all directors/designated partners",
            "Director Identification Number (DIN / DPIN) allocation via incorporation form",
            "Name reservation via RUN / SPICe+ Part A / FiLLiP",
            "Preparation of MOA and AOA (for companies) or LLP Agreement (for LLPs)",
            "Registered office proof (Utility bill not older than 2 months + Rent Agreement & Landlord NOC)",
            "Mandatory PAN, TAN, EPFO, ESIC, and Profession Tax registration integrated into SPICe+"
        ]
    }
