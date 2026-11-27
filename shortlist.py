from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/shortlist", tags=["shortlist"])


@router.get("", response_model=list[schemas.PropertyOut])
def get_shortlist(session_id: str = Header(alias="X-Session-Id"), db: Session = Depends(get_db)):
    return (
        db.query(models.Property)
        .join(models.Shortlist, models.Shortlist.property_id == models.Property.id)
        .options(selectinload(models.Property.photos), selectinload(models.Property.contacts))
        .filter(models.Shortlist.session_id == session_id)
        .order_by(models.Shortlist.created_at.desc())
        .all()
    )


@router.post("/{property_id}", status_code=201)
def add_to_shortlist(property_id: int, session_id: str = Header(alias="X-Session-Id"), db: Session = Depends(get_db)):
    if not db.get(models.Property, property_id):
        raise HTTPException(404, "Property not found")
    exists = db.query(models.Shortlist).filter_by(session_id=session_id, property_id=property_id).first()
    if not exists:
        db.add(models.Shortlist(session_id=session_id, property_id=property_id))
        db.commit()
    return {"shortlisted": True}


@router.delete("/{property_id}", status_code=204)
def remove_from_shortlist(property_id: int, session_id: str = Header(alias="X-Session-Id"), db: Session = Depends(get_db)):
    db.query(models.Shortlist).filter_by(session_id=session_id, property_id=property_id).delete()
    db.commit()
