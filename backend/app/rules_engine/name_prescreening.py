import re
from typing import Dict, Any, List

# Rule 8 of Companies (Incorporation) Rules, 2014 & Emblems and Names Act, 1950
GOVERNMENT_APPROVAL_TERMS = [
    "national", "central", "union", "federal", "republic", "president", 
    "rashtrapati", "governor", "prime minister", "cabinet", "court", "judiciary",
    "parliament", "statutory", "authority", "commission", "bureau", "board of india"
]

FINANCIAL_SECTOR_TERMS = [
    "bank", "banking", "banker", "insurance", "reinsurance", "venture capital",
    "mutual fund", "stock exchange", "asset management", "micro finance", "nidhi",
    "chit fund", "securitization", "credit rating"
]

EDUCATIONAL_RESTRICTED_TERMS = [
    "university", "board of education", "iit", "iim", "aiims", "ugc", "aicte"
]

EMBLEMS_PROHIBITED_TERMS = [
    "ashoka", "mahatma gandhi", "chhatrapati shivaji", "nehru", "united nations",
    "who", "unesco", "olympic", "state emblem", "president of india", "bharat sarkar"
]

STRUCTURE_SUFFIXES = {
    "Private Limited Company": ["private limited", "pvt ltd", "pvt. ltd.", "p. ltd."],
    "Public Limited Company": ["limited", "ltd", "ltd."],
    "LLP": ["llp", "limited liability partnership"],
    "OPC": ["opc private limited", "(opc) private limited", "opc pvt ltd"],
    "Partnership Firm": [],
    "Sole Proprietorship": []
}

class NamePreScreeningResult:
    def __init__(self):
        self.is_valid: bool = True
        self.score: int = 100
        self.checks: List[Dict[str, Any]] = []
        self.warnings: List[str] = []
        self.errors: List[str] = []
        self.recommendations: List[str] = []
        self.mca_portal_url: str = "https://www.mca.gov.in/content/mca/global/en/home.html"
        self.disclaimer: str = (
            "This pre-screening is an automated preliminary assessment based on MCA Rule 8 guidelines. "
            "It does not constitute official MCA approval or trademark clearance. Final reservation must be "
            "obtained via MCA SPICe+ Part A / RUN services."
        )

def assess_company_name(name: str, legal_structure: str = "Private Limited Company") -> Dict[str, Any]:
    result = NamePreScreeningResult()
    cleaned = (name or "").strip()

    if not cleaned:
        result.is_valid = False
        result.score = 0
        result.errors.append("Proposed company name cannot be empty.")
        return result.__dict__

    # 1. Length check
    if len(cleaned) < 3:
        result.is_valid = False
        result.score -= 40
        result.errors.append("Name is too short. MCA guidelines require a distinctive noun or coined word (at least 3 characters).")
    else:
        result.checks.append({"check": "Length Requirement", "status": "Passed", "detail": f"{len(cleaned)} characters."})

    # 2. Emblems and Names Act prohibition
    lower_name = cleaned.lower()
    for term in EMBLEMS_PROHIBITED_TERMS:
        if term in lower_name:
            result.is_valid = False
            result.score -= 50
            result.errors.append(f"Name contains '{term}', which is prohibited under the Emblems and Names (Prevention of Improper Use) Act, 1950.")
            break

    # 3. Government / Sovereign suggestion check
    for term in GOVERNMENT_APPROVAL_TERMS:
        pattern = r"\b" + re.escape(term) + r"\b"
        if re.search(pattern, lower_name):
            result.warnings.append(
                f"Contains '{term}'. Using terms implying government patronage requires prior Central Government approval under Rule 8B."
            )
            result.score -= 20
            break

    # 4. Sector-specific regulator terms check
    for term in FINANCIAL_SECTOR_TERMS:
        pattern = r"\b" + re.escape(term) + r"\b"
        if re.search(pattern, lower_name):
            result.warnings.append(
                f"Contains financial sector keyword '{term}'. MCA requires prior No-Objection Certificate (NOC) from relevant regulator (e.g. RBI/IRDAI/SEBI)."
            )
            result.score -= 25
            break

    # 5. Educational protected terms
    for term in EDUCATIONAL_RESTRICTED_TERMS:
        pattern = r"\b" + re.escape(term) + r"\b"
        if re.search(pattern, lower_name):
            result.warnings.append(
                f"Contains educational keyword '{term}'. Requires approval/accreditation from UGC, AICTE, or appropriate statutory council."
            )
            result.score -= 25
            break

    # 6. Legal structure suffix compatibility
    expected_suffixes = STRUCTURE_SUFFIXES.get(legal_structure, [])
    if expected_suffixes:
        has_suffix = any(lower_name.endswith(suf) for suf in expected_suffixes)
        if not has_suffix:
            result.warnings.append(
                f"For a {legal_structure}, the proposed name should formally conclude with '{expected_suffixes[0].title()}'. "
                f"VentureBlueprint will append this suffix during official incorporation drafting."
            )
            result.recommendations.append(f"Suggested legal name: '{cleaned} {expected_suffixes[0].title()}'")
        else:
            result.checks.append({"check": "Structure Suffix Compatibility", "status": "Passed", "detail": "Correct suffix present."})

    # 7. Distinctiveness / Special Character check
    special_char_match = re.findall(r"[^a-zA-Z0-9\s\.\,\-\&]", cleaned)
    if special_char_match:
        result.warnings.append(f"Name contains non-standard symbols: {' '.join(set(special_char_match))}. MCA generally restricts special characters other than '&' or hyphens.")
        result.score -= 10

    result.score = max(0, min(100, result.score))
    if result.errors:
        result.is_valid = False

    return {
        "is_valid": result.is_valid,
        "score": result.score,
        "name_assessed": cleaned,
        "legal_structure": legal_structure,
        "checks": result.checks,
        "warnings": result.warnings,
        "errors": result.errors,
        "recommendations": result.recommendations,
        "mca_portal_url": result.mca_portal_url,
        "disclaimer": result.disclaimer
    }
