"""
Comprehensive Indian Regulatory Knowledge Base Seed Data.
Covers MCA, Companies Act 2013, LLP Act 2008, Income Tax, GST, MSME, DPIIT, Shops & Establishments, DPDP Act 2023.
All rules cite official legal sections and portals.
"""

REGULATORY_SOURCES_DATA = [
    {
        "code": "MCA",
        "name": "Ministry of Corporate Affairs",
        "authority_type": "Central Government",
        "jurisdiction": "India",
        "official_portal_url": "https://www.mca.gov.in",
        "description": "Primary corporate regulator administering the Companies Act 2013 and Limited Liability Partnership Act 2008."
    },
    {
        "code": "GST",
        "name": "Goods and Services Tax Network (GSTN)",
        "authority_type": "Central & State Statutory Council",
        "jurisdiction": "India",
        "official_portal_url": "https://www.gst.gov.in",
        "description": "Administers indirect taxation, registrations, and returns under the Central Goods and Services Tax (CGST) Act 2017."
    },
    {
        "code": "ITD",
        "name": "Income Tax Department (CBDT)",
        "authority_type": "Central Government",
        "jurisdiction": "India",
        "official_portal_url": "https://www.incometax.gov.in",
        "description": "Administers direct taxes, Permanent Account Number (PAN), and Tax Deduction Account Number (TAN) under the Income Tax Act 1961."
    },
    {
        "code": "MSME",
        "name": "Ministry of Micro, Small and Medium Enterprises",
        "authority_type": "Central Government",
        "jurisdiction": "India",
        "official_portal_url": "https://udyamregistration.gov.in",
        "description": "Administers MSME classification, Udyam registration, subsidies, and public procurement preferences."
    },
    {
        "code": "DPIIT",
        "name": "Department for Promotion of Industry and Internal Trade",
        "authority_type": "Central Government",
        "jurisdiction": "India",
        "official_portal_url": "https://www.startupindia.gov.in",
        "description": "Administers Startup India initiative, Section 80-IAC income tax exemptions, and angel tax clearances."
    },
    {
        "code": "LABOUR",
        "name": "Ministry of Labour & Employment / State Labour Departments",
        "authority_type": "Central & State Joint",
        "jurisdiction": "India",
        "official_portal_url": "https://shramsuvidha.gov.in",
        "description": "Regulates EPF, ESI, Profession Tax, and State Shops and Establishments Act enactments."
    },
    {
        "code": "MEITY",
        "name": "Ministry of Electronics & Information Technology",
        "authority_type": "Central Government",
        "jurisdiction": "India",
        "official_portal_url": "https://www.meity.gov.in",
        "description": "Administers Digital Personal Data Protection (DPDP) Act 2023 and Information Technology Act 2000."
    },
    {
        "code": "FSSAI",
        "name": "Food Safety and Standards Authority of India",
        "authority_type": "Statutory Authority",
        "jurisdiction": "India",
        "official_portal_url": "https://foscos.fssai.gov.in",
        "description": "Regulates manufacture, storage, distribution, sale, and import of food products under Food Safety and Standards Act 2006."
    }
]

REGULATORY_RULES_DATA = [
    # MCA / Companies Act Incorporation Rules
    {
        "source_code": "MCA",
        "rule_code": "MCA-INC-001",
        "title": "Integrated SPICe+ (INC-32) Company Incorporation",
        "category": "Incorporation",
        "applicable_structure": "Private Limited Company",
        "applicable_domain": "All",
        "applicability_condition": {"structures": ["Private Limited Company", "OPC", "Public Limited Company"]},
        "requirement_description": (
            "Incorporation of companies in India must be carried out through the web-based SPICe+ form (INC-32) "
            "on the MCA portal. It provides 10 integrated services: Name reservation, Incorporation, DIN allocation, "
            "mandatory PAN, TAN, EPFO, ESIC, Profession Tax (Maharashtra/Karnataka/others), Bank Account opening, and GSTIN."
        ),
        "obligation_type": "mandatory",
        "legal_provision": "Rule 38, Companies (Incorporation) Rules, 2014 & Section 7, Companies Act, 2013",
        "official_source_url": "https://www.mca.gov.in/content/mca/global/en/services/company-services/spice-plus.html",
        "official_portal_link": "https://www.mca.gov.in/mcafoportal/showSpicePlus.do",
        "verification_steps": "Submit SPICe+ Part A for name reservation and Part B with e-MOA (INC-33) and e-AOA (INC-34)."
    },
    {
        "source_code": "MCA",
        "rule_code": "MCA-DIR-002",
        "title": "Resident Director Mandate",
        "category": "Corporate Governance",
        "applicable_structure": "Private Limited Company",
        "applicable_domain": "All",
        "applicability_condition": {"structures": ["Private Limited Company", "Public Limited Company", "OPC"]},
        "requirement_description": (
            "Every company must have at least one director who stays in India for a total period of not less than "
            "one hundred and eighty-two (182) days during the financial year. For foreign-owned companies, an Indian resident "
            "director must be appointed to satisfy this statutory threshold."
        ),
        "obligation_type": "mandatory",
        "legal_provision": "Section 149(3), Companies Act, 2013",
        "official_source_url": "https://www.mca.gov.in/Ministry/pdf/CompaniesAct2013.pdf",
        "verification_steps": "Verify passport travel dates / residential utility proof of at least one proposed director."
    },
    {
        "source_code": "MCA",
        "rule_code": "MCA-OFF-003",
        "title": "Registered Office Verification & Utility Proof",
        "category": "Incorporation",
        "applicable_structure": "All",
        "applicable_domain": "All",
        "applicability_condition": {"structures": ["Private Limited Company", "LLP", "OPC"]},
        "requirement_description": (
            "The company must verify its registered office within thirty days of incorporation or directly with SPICe+ (INC-22). "
            "Required documents: Title deed or registered rent/lease agreement, utility bill (electricity, telephone, gas, or water bill "
            "not older than two months in the name of the premises owner), and written No Objection Certificate (NOC) from the property owner."
        ),
        "obligation_type": "mandatory",
        "legal_provision": "Section 12, Companies Act, 2013 & Rule 25, Companies (Incorporation) Rules, 2014",
        "official_source_url": "https://www.mca.gov.in",
        "verification_steps": "Check utility bill date (must be within last 60 days) and ensure landlord NOC matches title ownership."
    },
    {
        "source_code": "MCA",
        "rule_code": "MCA-AUD-004",
        "title": "Appointment of First Statutory Auditor (Form ADT-1)",
        "category": "Statutory Compliance",
        "applicable_structure": "Private Limited Company",
        "applicable_domain": "All",
        "applicability_condition": {"structures": ["Private Limited Company", "OPC"]},
        "requirement_description": (
            "The Board of Directors must appoint the first statutory auditor (an independent practicing Chartered Accountant or "
            "CA firm) within thirty (30) days from the date of company registration. Form ADT-1 must be filed with the ROC."
        ),
        "obligation_type": "mandatory",
        "legal_provision": "Section 139(6), Companies Act, 2013",
        "official_source_url": "https://www.mca.gov.in",
        "verification_steps": "Obtain written consent and eligibility certificate from the auditor under Section 141 before board meeting."
    },
    {
        "source_code": "MCA",
        "rule_code": "MCA-COM-005",
        "title": "Commencement of Business Declaration (Form INC-20A)",
        "category": "Post-Incorporation",
        "applicable_structure": "Private Limited Company",
        "applicable_domain": "All",
        "applicability_condition": {"structures": ["Private Limited Company", "OPC"]},
        "requirement_description": (
            "Every company incorporated after 2nd November 2018 having a share capital cannot commence business or exercise "
            "borrowing powers unless a director files Form INC-20A within one hundred and eighty (180) days from incorporation, "
            "verifying that every subscriber has deposited the agreed value of shares into the company's bank account."
        ),
        "obligation_type": "mandatory",
        "legal_provision": "Section 10A, Companies Act, 2013 & Rule 23A, Companies (Incorporation) Rules, 2014",
        "official_source_url": "https://www.mca.gov.in",
        "verification_steps": "Open corporate bank account, receive subscriber funds via NEFT/RTGS, and attach bank statement certified by a CA/CS."
    },

    # LLP Incorporation Rules
    {
        "source_code": "MCA",
        "rule_code": "LLP-FIL-001",
        "title": "LLP Agreement Filing (Form 3)",
        "category": "Incorporation",
        "applicable_structure": "LLP",
        "applicable_domain": "All",
        "applicability_condition": {"structures": ["LLP"]},
        "requirement_description": (
            "Every Limited Liability Partnership must execute and file the LLP Agreement with the Registrar in Form 3 "
            "within thirty (30) days of incorporation. The agreement must be printed on non-judicial stamp paper as prescribed "
            "by the relevant State Stamp Act and notarized."
        ),
        "obligation_type": "mandatory",
        "legal_provision": "Section 23, Limited Liability Partnership Act, 2008 & Rule 21(1), LLP Rules, 2009",
        "official_source_url": "https://www.mca.gov.in",
        "verification_steps": "Pay required state stamp duty, execute signatures of all partners, and upload Form 3 on MCA."
    },

    # GST Rules
    {
        "source_code": "GST",
        "rule_code": "GST-REG-001",
        "title": "Goods and Services Tax (GST) Registration",
        "category": "Taxation",
        "applicable_structure": "All",
        "applicable_domain": "All",
        "applicability_condition": {"mandatory_if": ["inter_state", "e_commerce", "turnover_above_threshold"]},
        "requirement_description": (
            "GST registration is mandatory if annual aggregate turnover exceeds ₹40 Lakhs (for goods) or ₹20 Lakhs (for services) "
            "in normal category states (₹20L/₹10L in special category states). Registration is compulsory regardless of turnover if: "
            "(i) Selling goods/services inter-state, (ii) Operating through an e-commerce operator, (iii) Liable to pay reverse charge."
        ),
        "obligation_type": "conditional",
        "legal_provision": "Sections 22 & 24, Central Goods and Services Tax (CGST) Act, 2017",
        "official_source_url": "https://www.gst.gov.in",
        "official_portal_link": "https://services.gst.gov.in/services/quicklinks/registration",
        "verification_steps": "Apply via GST Portal using PAN, Aadhaar OTP auth, registered office proof, and bank cancelled cheque."
    },

    # MSME / Udyam Registration
    {
        "source_code": "MSME",
        "rule_code": "MSME-UDY-001",
        "title": "Udyam Registration for MSME Benefits",
        "category": "Registrations",
        "applicable_structure": "All",
        "applicable_domain": "All",
        "applicability_condition": {"always_recommended": True},
        "requirement_description": (
            "Self-declaration based online registration for Micro, Small, and Medium Enterprises. Entities classified as Micro "
            "(Investment < ₹1 Cr, Turnover < ₹5 Cr) or Small (Investment < ₹10 Cr, Turnover < ₹50 Cr) receive priority sector bank lending, "
            "protection against delayed payments under Section 15 of MSMED Act, and government tender fee exemptions."
        ),
        "obligation_type": "recommended",
        "legal_provision": "Micro, Small and Medium Enterprises Development (MSMED) Act, 2006",
        "official_source_url": "https://udyamregistration.gov.in",
        "official_portal_link": "https://udyamregistration.gov.in/Government-India/Ministry-MSME-registration.htm",
        "verification_steps": "Free online registration on Udyam portal using entity PAN, GSTIN, and founder Aadhaar."
    },

    # DPIIT Startup India Recognition
    {
        "source_code": "DPIIT",
        "rule_code": "DPIIT-STP-001",
        "title": "Startup India Recognition & Tax Benefits",
        "category": "Incentives & Registrations",
        "applicable_structure": "Private Limited Company",
        "applicable_domain": "All",
        "applicability_condition": {"structures": ["Private Limited Company", "LLP", "Partnership Firm"]},
        "requirement_description": (
            "DPIIT recognition is available to entities incorporated for less than 10 years with annual turnover not exceeding "
            "₹100 Crores, working towards innovation, development or commercialization of new products, processes, or services. "
            "Recognized startups can apply for 3-year consecutive income tax exemption under Section 80-IAC and fast-track patent processing (up to 80% rebate)."
        ),
        "obligation_type": "recommended",
        "legal_provision": "Notification No. G.S.R. 127(E) issued by DPIIT, Ministry of Commerce and Industry",
        "official_source_url": "https://www.startupindia.gov.in",
        "official_portal_link": "https://www.startupindia.gov.in/content/sih/en/startupgov/startup_recognition_page.html",
        "verification_steps": "Submit pitch deck, website URL, incorporation certificate, and brief write-up on innovation on Startup India portal."
    },

    # Labour & Employment Compliance
    {
        "source_code": "LABOUR",
        "rule_code": "LAB-SHP-001",
        "title": "Shops and Commercial Establishments Registration (Gumasta)",
        "category": "Local Licensing",
        "applicable_structure": "All",
        "applicable_domain": "All",
        "applicability_condition": {"has_physical_location": True},
        "requirement_description": (
            "State-specific statutory licence required for any shop, office, or commercial establishment within 30 days of "
            "commencing business. Regulates working hours, weekly holidays, overtime, leave policies, and health/safety conditions."
        ),
        "obligation_type": "mandatory",
        "legal_provision": "State-specific Shops and Commercial Establishments Act (e.g. Delhi, Maharashtra, Karnataka, Telangana)",
        "official_source_url": "https://shramsuvidha.gov.in",
        "verification_steps": "Apply via State Labour Department portal with rent agreement, photo of office board, and director KYC."
    },
    {
        "source_code": "LABOUR",
        "rule_code": "LAB-EPF-002",
        "title": "Employees' Provident Fund (EPFO) Compliance",
        "category": "Employment Compliance",
        "applicable_structure": "All",
        "applicable_domain": "All",
        "applicability_condition": {"employees_min": 20},
        "requirement_description": (
            "Mandatory for every commercial establishment employing twenty (20) or more persons. Employers must contribute 12% "
            "of basic wages towards EPF and EPS, matched by an equal deduction from employee salary for employees earning up to ₹15,000/month."
        ),
        "obligation_type": "conditional",
        "legal_provision": "Employees' Provident Funds and Miscellaneous Provisions Act, 1952",
        "official_source_url": "https://www.epfindia.gov.in",
        "verification_steps": "SPICe+ automatically allocates an EPFO registration code upon incorporation; activate and file monthly ECR."
    },
    {
        "source_code": "LABOUR",
        "rule_code": "LAB-ESI-003",
        "title": "Employees' State Insurance (ESIC) Scheme",
        "category": "Employment Compliance",
        "applicable_structure": "All",
        "applicable_domain": "All",
        "applicability_condition": {"employees_min": 10},
        "requirement_description": (
            "Applies to non-seasonal factories and establishments employing ten (10) or more persons. Provides medical care, "
            "sickness benefit, and maternity benefits to employees with gross monthly wages up to ₹21,000 (3.25% employer + 0.75% employee contribution)."
        ),
        "obligation_type": "conditional",
        "legal_provision": "Employees' State Insurance Act, 1948",
        "official_source_url": "https://www.esic.gov.in",
        "verification_steps": "SPICe+ auto-allots ESIC number. File monthly contributions via ESIC portal."
    },

    # Data Protection
    {
        "source_code": "MEITY",
        "rule_code": "DAT-DPD-001",
        "title": "Digital Personal Data Protection (DPDP) Act Compliance",
        "category": "Data Privacy",
        "applicable_structure": "All",
        "applicable_domain": "All",
        "applicability_condition": {"collects_personal_data": True},
        "requirement_description": (
            "Applies to any entity processing digital personal data within India or processing digital personal data outside India "
            "in connection with offering goods or services to data principals in India. Requires itemized notice before consent, "
            "consent withdrawal mechanism, appointment of Data Protection Officer (for Significant Data Fiduciaries), and reasonable security safeguards."
        ),
        "obligation_type": "mandatory",
        "legal_provision": "Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)",
        "official_source_url": "https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf",
        "verification_steps": "Publish comprehensive Privacy Policy, implement user consent banner, and data breach notification protocol."
    },

    # Sectoral - Food and Beverage
    {
        "source_code": "FSSAI",
        "rule_code": "SEC-FSS-001",
        "title": "FSSAI Food Business Operator (FBO) Licence / Registration",
        "category": "Sectoral Licence",
        "applicable_structure": "All",
        "applicable_domain": "Food and Hospitality",
        "applicability_condition": {"domains": ["Food and Hospitality", "Food/Beverage", "Food & Beverage"]},
        "requirement_description": (
            "Any business involved in manufacturing, processing, packaging, storage, transportation, or sale of food items must "
            "obtain an FSSAI Basic Registration (turnover up to ₹12 Lakhs/year), State Licence (turnover ₹12L to ₹20 Cr), or "
            "Central Licence (turnover > ₹20 Cr or operating in multiple states) before commencing commercial operations."
        ),
        "obligation_type": "mandatory",
        "legal_provision": "Section 31, Food Safety and Standards Act, 2006",
        "official_source_url": "https://foscos.fssai.gov.in",
        "official_portal_link": "https://foscos.fssai.gov.in/apply-for-licence-and-registration",
        "verification_steps": "Apply via FoSCoS portal with kitchen blueprint, water test report, and food handler medical fitness certificate."
    }
]

SUPPORTED_DOMAINS_DATA = [
    {"name": "Information Technology", "slug": "information-technology", "description": "Software development, IT consulting, SaaS, and cloud infrastructure."},
    {"name": "Software Development", "slug": "software-development", "description": "Application software, enterprise solutions, mobile apps, and systems engineering."},
    {"name": "Hardware and Electronics", "slug": "hardware-electronics", "description": "Electronic components, IoT devices, embedded systems, and consumer tech."},
    {"name": "Manufacturing", "slug": "manufacturing", "description": "Industrial production, fabrication, consumer goods, and engineering manufacturing."},
    {"name": "Digital Marketing", "slug": "digital-marketing", "description": "SEO, content marketing, performance advertising, and social media agencies."},
    {"name": "Business Consulting", "slug": "business-consulting", "description": "Management advisory, strategy consulting, operational restructuring, and HR advisory."},
    {"name": "Retail", "slug": "retail", "description": "Physical stores, supermarkets, consumer goods retail, and franchise outlets."},
    {"name": "Wholesale and Distribution", "slug": "wholesale-distribution", "description": "B2B trading, bulk supply chain, distributor networks, and inventory warehousing."},
    {"name": "Education and Training", "slug": "education-training", "description": "Edtech, coaching institutes, corporate upskilling, and vocational academies."},
    {"name": "Healthcare", "slug": "healthcare", "description": "Clinics, diagnostic centers, health-tech, medical equipment, and telemedicine."},
    {"name": "Finance and Accounting", "slug": "finance-accounting", "description": "Fintech, bookkeeping agencies, tax advisory, and financial intermediation."},
    {"name": "E-commerce", "slug": "e-commerce", "description": "Online storefronts, direct-to-consumer (D2C) brands, and multi-vendor marketplaces."},
    {"name": "Construction", "slug": "construction", "description": "Civil engineering, commercial and residential construction, and infrastructure contractors."},
    {"name": "Logistics", "slug": "logistics", "description": "Freight forwarding, warehousing, 3PL logistics, and last-mile delivery services."},
    {"name": "Food and Hospitality", "slug": "food-hospitality", "description": "Restaurants, cafes, cloud kitchens, food processing, and catering services."},
    {"name": "Professional Services", "slug": "professional-services", "description": "Architecture, design, translation, specialized technical, and legal services."},
    {"name": "Other", "slug": "other", "description": "Diverse emerging industries and niche business activities."}
]
