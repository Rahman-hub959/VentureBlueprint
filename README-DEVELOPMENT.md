# VentureBlueprint: Developer & Engineering Guide

This guide provides instructions for setting up, running, testing, and extending the VentureBlueprint codebase on a local developer workstation.

---

## 1. Local Workstation Requirements

- **Operating System:** Windows 10/11, macOS, or Linux.
- **Python:** Python 3.11 or higher (Python 3.14 verified).
- **Node.js:** Node.js v20+ with `npm` v10+.
- **Git:** Git for source control.

---

## 2. Setting Up the Development Environment

### 2.1 Backend Environment Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd "e:\VentureBlueprint Design System\backend"
   ```

2. Create a dedicated Python virtual environment:
   ```bash
   # On Windows
   python -m venv .venv

   # Activate virtual environment
   .\.venv\Scripts\activate
   ```

3. Upgrade `pip` and install all required dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. Initialize and seed the regulatory knowledge base and default user accounts:
   ```bash
   python -m app.seed
   ```
   *This command creates the SQLite database `backend/ventureblueprint.db`, sets up tables, seeds 17 business domains, loads statutory sources (MCA, CBIC, DPIIT, MSME, MeitY), populates regulatory rules, and provisions the default administrator and founder accounts.*

5. Start the FastAPI ASGI server with auto-reload:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API will be live at `http://127.0.0.1:8000`.  
   Interactive OpenAPI documentation is accessible at `http://127.0.0.1:8000/docs`.

---

### 2.2 Frontend Environment Setup

1. Open a second terminal and navigate to the project root:
   ```bash
   cd "e:\VentureBlueprint Design System"
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will be live at `http://localhost:5173`.

4. To verify production compilation:
   ```bash
   npm run build
   ```
   The compiled bundle will be emitted to `dist/`.

---

## 3. Running the Automated Test Suite

VentureBlueprint includes end-to-end integration and unit tests covering authentication, deterministic statutory rules, project validation, document compilation, and administrative privileges.

### Running Pytest:
From the workspace root directory:
```bash
# Using the backend virtual environment
.\backend\.venv\Scripts\pytest -v
```

The configuration is managed via `pytest.ini`:
```ini
[pytest]
pythonpath = backend
testpaths = backend/tests
asyncio_mode = strict
asyncio_default_fixture_loop_scope = function
```

All 6 test suites execute in under 2 seconds and verify that all REST endpoints, statutory rule calculations, and physical document compilations succeed without errors.

---

## 4. Coding Standards & Architectural Conventions

### 4.1 Strict Zero External AI Constraint
- **Rule:** Never introduce imports, API keys, or network clients for OpenAI, Gemini, Claude, Ollama, or third-party AI document services.
- **Reasoning:** VentureBlueprint guarantees deterministic, verifiable regulatory compliance without hallucination or confidential founder data leakage.
- **Implementation:** All recommendations must use rule-based algorithmic decision matrices, regex analyzers, and database-driven regulatory models.

### 4.2 Backend Conventions
- **Schemas:** All request and response models must be defined with Pydantic v2 in `app/schemas/all_schemas.py`.
- **Database Access:** Use SQLAlchemy 2.0 ORM sessions injected via FastAPI's `Depends(get_db)`. Always wrap multi-entity modifications in database transactions (`db.commit()`).
- **File System Operations:** Never write files directly to arbitrary paths. Always invoke `app/storage/file_manager.py` which enforces sandboxed isolation under `storage/users/{uid}/projects/{pid}/` and calculates SHA-256 integrity checksums.
- **Passwords & Auth:** Passwords must be hashed using Argon2id via `app/security.py`. Never store or log plaintext passwords.

### 4.3 Frontend Conventions
- **Components:** Modular, functional React 19 components with TypeScript typing.
- **Styling Tokens:** Leverage the custom glassmorphism design system in `src/styles/glassmorphism.css`:
  - `glass-panel`: Standard frosted panel.
  - `glass-panel-elevated`: Raised card with depth and ambient drop shadow.
  - `glass-input`: Consistent dark translucent input field.
  - `glass-button-primary`: Emerald accented action button with hover glow.
- **Forms & Validation:** Forms must use `react-hook-form` coupled with `@hookform/resolvers/zod` for immediate client-side validation prior to sending payloads to the backend API.

---

## 5. Adding New Statutory Rules

To add a new regulatory rule or statutory threshold to the knowledge base:
1. Log in to the application as Administrator (`admin@ventureblueprint.in` / `Admin@Venture2026!`).
2. Navigate to the **Admin Portal** (`/admin`).
3. Click **Add New Regulatory Rule**.
4. Complete the required statutory metadata:
   - Rule Code (e.g., `RULE-MCA-012`).
   - Regulatory Source (MCA, CBIC, DPIIT, MSME, MeitY).
   - Category (`corporate_law`, `taxation`, `labour`, `industry_specific`).
   - Obligation Type (`mandatory`, `conditional`, `recommended`).
   - Applicable Legal Structure and Business Domain.
   - Exact Act, Section, and Rule citations.
   - Official Gazette or Ministry URL.
5. Save the rule. The rule enters `Draft` state and can be reviewed and approved to `Published` status directly through the administrative UI.
