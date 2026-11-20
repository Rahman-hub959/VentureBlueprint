# VentureBlueprint
### AI-Independent Company Formation, Regulatory Validation & Professional Documentation Platform
**Primary Jurisdiction:** Republic of India (Companies Act 2013, LLP Act 2008, Partnership Act 1932, CGST Act 2017, MSME Act 2006, DPDP Act 2023)  
**Execution Architecture:** 100% Local / Zero Cloud AI Dependencies / Deterministic Statutory Logic

---

## 1. Executive Summary

VentureBlueprint is a production-grade software platform engineered to guide entrepreneurs and founders through every phase of establishing a legally compliant business entity in India.

Unlike modern systems that rely on opaque cloud AI APIs (such as OpenAI, Anthropic, or Gemini) which pose confidentiality risks and produce hallucinated legal citations, VentureBlueprint operates on **100% deterministic, local Python business logic and structured statutory knowledge bases**. Every legal citation, compliance checklist item, role recommendation, and generated document is directly grounded in Indian legislation, Gazette notifications, and statutory rules.

---

## 2. Key Capabilities

- **MCA Rule 8 Name Pre-screening:** Instant automated analysis of proposed company names under Rule 8 and 8A/8B of the Companies (Incorporation) Rules, 2014. Identifies prohibited terms under the *Emblems and Names (Prevention of Improper Use) Act, 1950*, sectoral regulatory triggers (RBI, SEBI, IRDAI), distinctiveness, and required statutory suffixes (`Private Limited`, `LLP`, `(OPC) Private Limited`).
- **Legal Structure Recommendation Engine:** Evaluates founder headcount, institutional investor participation, equity distribution, liability exposure, and initial authorized capital to empirically recommend the optimal business vehicle (Private Limited Company, LLP, One Person Company, Partnership Firm, or Sole Proprietorship).
- **7-Section Questionnaire Wizard:** Step-by-step data collection covering Company Identity, Ownership & Legal Structure, Registered Office & Operating Locations, Financial Planning, Operations & Headcount, Professional Services, and Review. Supports partial save, draft persistence, and step-by-step progress tracking.
- **Regulatory Compliance Evaluator:** Maps project attributes against statutory thresholds:
  - GST registration thresholds (Section 22 & 24 CGST Act: ₹40L/₹20L turnover and inter-state supply triggers).
  - MSME / Udyam classification (Micro, Small, Medium investment and turnover criteria).
  - DPDP Act 2023 consent notice obligations.
  - EPFO / ESIC statutory headcount thresholds.
- **Interactive Compliance Task Manager:** Synthesizes actionable pre-incorporation and post-incorporation tasks with direct deep-links to official government portals (MCA, GSTN, Udyam, Income Tax).
- **Statutory & Operational Role Recommender:** Maps corporate governance needs into Statutory Roles (MD, Designated Partner, Resident Director), Management Roles (CEO, CTO, COO), Operational Staff, and Mandatory External Professionals (Statutory Auditor under Section 139, Company Secretary).
- **Local Professional Document Generation Engine:** Produces 8 distinct, comprehensive, multi-page business documents locally in both **PDF (ReportLab)** and **DOCX (python-docx)** formats, complete with SHA-256 cryptographic tamper verification.
- **Administrative Regulatory Portal:** Secure portal for system administrators to inspect platform metrics, manage user accounts, review and approve new statutory rules, and audit system activities.
- **Enterprise Liquid-Glass Spatial UI:** Built with React 19, TypeScript, Tailwind CSS, and custom glassmorphism styling tokens, supporting both Dark and Light themes.

---

## 3. Technology Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Router v7, React Hook Form, Zod |
| **Backend** | Python 3.14, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn |
| **Security & Auth** | Argon2id (`argon2-cffi`), Stateless JSON Web Tokens (`PyJWT`), Scoped RBAC |
| **Document Engine**| ReportLab (Platypus PDF engine), `python-docx` (Word engine) |
| **Persistence** | PostgreSQL (Production Docker) / SQLite 3 (Offline Development) |
| **Storage** | Sandboxed local filesystem (`storage/users/{uid}/projects/{pid}/`) with SHA-256 checksums |
| **Deployment** | Docker, Docker Compose, Nginx Reverse Proxy |

---

## 4. Default Seed Credentials

Upon initial database seeding, two administrative and demonstration accounts are provisioned:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **System Administrator** | `admin@ventureblueprint.in` | `Admin@Venture2026!` | Access to Admin Portal, Rule Approvals, User Status, Audit Logs |
| **Lead Founder (Demo)** | `founder@ventureblueprint.in` | `Founder@Venture2026!` | Full project management, questionnaire wizard, document generation |

---

## 5. Quick-Start Guide (Windows Local Machine)

### Prerequisites:
- Python 3.11+ (installed and on PATH).
- Node.js 20+ and npm (installed and on PATH).

### One-Click Launch:
Simply execute the provided Windows batch script from the repository root:
```cmd
start_local.bat
```
This script automatically:
1. Creates the Python virtual environment in `backend/.venv` (if not present).
2. Installs all required Python backend dependencies.
3. Seeds the local database with regulatory rules, authorities, domains, and accounts.
4. Starts the FastAPI backend server on `http://127.0.0.1:8000`.
5. Installs frontend npm packages and starts the Vite development server on `http://localhost:5173`.

### Accessing the Platform:
- **Frontend Web Application:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **FastAPI Redoc Interface:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 6. Directory Structure

```text
VentureBlueprint/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (auth, projects, validation, etc.)
│   │   ├── document_engine/ # ReportLab PDF & python-docx builders
│   │   ├── models/          # SQLAlchemy 2.0 database entities
│   │   ├── regulatory/      # Seed rules and statutory sources
│   │   ├── rules_engine/    # Deterministic MCA Rule 8, structure & compliance evaluators
│   │   ├── schemas/         # Pydantic v2 data transfer schemas
│   │   ├── storage/         # Sandboxed filesystem manager with SHA-256 digests
│   │   ├── config.py        # Centralized settings & environment variables
│   │   ├── database.py      # SQLAlchemy session factory & database engine
│   │   └── security.py      # Argon2id password hashing and JWT token handlers
│   ├── tests/               # Pytest automated test suite
│   ├── main.py              # Application entry point
│   └── requirements.txt     # Locked Python dependencies
├── src/
│   ├── api/                 # Axios-based API client with automatic token injection
│   ├── components/          # Reusable liquid-glass UI components
│   ├── context/             # AuthContext and ThemeContext state providers
│   ├── layouts/             # Public and Dashboard layout wrappers
│   ├── pages/               # Public and authenticated page views
│   ├── styles/              # Glassmorphic CSS tokens and Tailwind styling
│   └── App.tsx              # React Router route registry
├── deployment/              # Dockerfiles and Nginx production configuration
├── storage/                 # Sandboxed local storage for generated documents
├── docker-compose.yml       # Production multi-container orchestration
├── start_local.bat          # Windows one-click local launcher
├── start_local.sh           # Unix/Linux one-click local launcher
└── pytest.ini               # Pytest configuration
```

---

## 7. Statutory Legal Disclaimer

> [!IMPORTANT]
> **VentureBlueprint is a software planning and documentation assistance platform.** It is designed to assist entrepreneurs in preparing their corporate documentation, understanding statutory requirements, and structuring company formation data under Indian law. VentureBlueprint is not a government agency, not affiliated with the Ministry of Corporate Affairs (MCA), and does not provide formal legal representation. All company registrations, SPICe+ filings, and official approvals must be formally submitted through official Government of India portals or finalized by qualified legal and accounting professionals (Advocates, Chartered Accountants, or Company Secretaries).
