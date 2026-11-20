from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.regulation import RegulatorySource, RegulatoryRule
from app.models.domain import BusinessDomain

router = APIRouter(prefix="/regulations", tags=["Regulatory Knowledge Base"])

@router.get("/sources")
def list_regulatory_sources(db: Session = Depends(get_db)):
    sources = db.query(RegulatorySource).filter(RegulatorySource.is_active == True).all()
    return [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "authority_type": s.authority_type,
            "jurisdiction": s.jurisdiction,
            "official_portal_url": s.official_portal_url,
            "description": s.description,
            "last_verified_at": s.last_verified_at
        }
        for s in sources
    ]

@router.get("/rules")
def list_regulatory_rules(
    category: Optional[str] = None,
    structure: Optional[str] = None,
    domain: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RegulatoryRule).filter(RegulatoryRule.status == "Published")
    
    if category:
        query = query.filter(RegulatoryRule.category.ilike(category))
    if structure and structure != "All":
        query = query.filter((RegulatoryRule.applicable_structure == "All") | (RegulatoryRule.applicable_structure == structure))
    if domain and domain != "All":
        query = query.filter((RegulatoryRule.applicable_domain == "All") | (RegulatoryRule.applicable_domain.ilike(f"%{domain}%")))

    rules = query.all()
    return [
        {
            "id": r.id,
            "rule_code": r.rule_code,
            "title": r.title,
            "category": r.category,
            "applicable_structure": r.applicable_structure,
            "applicable_domain": r.applicable_domain,
            "requirement_description": r.requirement_description,
            "obligation_type": r.obligation_type,
            "legal_provision": r.legal_provision,
            "official_source_url": r.official_source_url,
            "official_portal_link": r.official_portal_link,
            "verification_steps": r.verification_steps,
            "version": r.version,
            "status": r.status,
            "last_reviewed_at": r.last_reviewed_at
        }
        for r in rules
    ]

@router.get("/domains")
def list_business_domains(db: Session = Depends(get_db)):
    domains = db.query(BusinessDomain).filter(BusinessDomain.is_active == True).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "slug": d.slug,
            "description": d.description,
            "common_activities": d.common_activities or []
        }
        for d in domains
    ]
