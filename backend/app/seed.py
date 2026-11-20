from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.user import Role, User
from app.models.domain import BusinessDomain
from app.models.regulation import RegulatorySource, RegulatoryRule
from app.regulatory.seed_rules import (
    REGULATORY_SOURCES_DATA,
    REGULATORY_RULES_DATA,
    SUPPORTED_DOMAINS_DATA
)
from app.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Roles
        roles_map = {}
        for r_name, r_desc in [
            ("Entrepreneur", "Default business founder user with access to projects and reports"),
            ("Administrator", "Full system administrator with user, rule, and template controls"),
            ("Compliance Reviewer", "Legal and regulatory compliance officer with rule approval rights"),
            ("Support Staff", "Customer support and assistance staff")
        ]:
            role = db.query(Role).filter(Role.name == r_name).first()
            if not role:
                role = Role(name=r_name, description=r_desc)
                db.add(role)
                db.flush()
            roles_map[r_name] = role

        # 2. Seed Default Admin User
        admin_email = "admin@ventureblueprint.in"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("Admin@Venture2026!"),
                full_name="System Administrator",
                role_id=roles_map["Administrator"].id,
                is_active=True
            )
            db.add(admin)

        # 3. Seed Default Demo Founder User
        founder_email = "founder@ventureblueprint.in"
        founder = db.query(User).filter(User.email == founder_email).first()
        if not founder:
            founder = User(
                email=founder_email,
                hashed_password=get_password_hash("Founder@Venture2026!"),
                full_name="Aarav Sharma",
                phone_number="+91 9876543210",
                role_id=roles_map["Entrepreneur"].id,
                is_active=True
            )
            db.add(founder)

        # 4. Seed Supported Business Domains
        for d_data in SUPPORTED_DOMAINS_DATA:
            existing_d = db.query(BusinessDomain).filter(BusinessDomain.slug == d_data["slug"]).first()
            if not existing_d:
                bd = BusinessDomain(
                    name=d_data["name"],
                    slug=d_data["slug"],
                    description=d_data["description"]
                )
                db.add(bd)

        # 5. Seed Regulatory Sources
        sources_map = {}
        for s_data in REGULATORY_SOURCES_DATA:
            src = db.query(RegulatorySource).filter(RegulatorySource.code == s_data["code"]).first()
            if not src:
                src = RegulatorySource(
                    code=s_data["code"],
                    name=s_data["name"],
                    authority_type=s_data["authority_type"],
                    jurisdiction=s_data["jurisdiction"],
                    official_portal_url=s_data["official_portal_url"],
                    description=s_data["description"]
                )
                db.add(src)
                db.flush()
            sources_map[s_data["code"]] = src

        # 6. Seed Regulatory Rules
        for r_data in REGULATORY_RULES_DATA:
            existing_rule = db.query(RegulatoryRule).filter(RegulatoryRule.rule_code == r_data["rule_code"]).first()
            if not existing_rule:
                src_code = r_data["source_code"]
                src_obj = sources_map.get(src_code)
                if src_obj:
                    rule = RegulatoryRule(
                        source_id=src_obj.id,
                        rule_code=r_data["rule_code"],
                        title=r_data["title"],
                        category=r_data["category"],
                        applicable_structure=r_data["applicable_structure"],
                        applicable_domain=r_data["applicable_domain"],
                        applicability_condition=r_data.get("applicability_condition", {}),
                        requirement_description=r_data["requirement_description"],
                        obligation_type=r_data.get("obligation_type", "mandatory"),
                        legal_provision=r_data["legal_provision"],
                        official_source_url=r_data.get("official_source_url"),
                        official_portal_link=r_data.get("official_portal_link"),
                        verification_steps=r_data.get("verification_steps"),
                        status="Published",
                        version=1
                    )
                    db.add(rule)

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
