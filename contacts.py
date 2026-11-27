from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["contacts"])


@router.post("/properties/{property_id}/contacts", response_model=schemas.ContactOut, status_code=201)
def add_contact(property_id: int, payload: schemas.ContactIn, db: Session = Depends(get_db)):
    if not db.get(models.Property, property_id):
        raise HTTPException(404, "Property not found")
    contact = models.Contact(property_id=property_id, **payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/contacts/{contact_id}", status_code=204)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.get(models.Contact, contact_id)
    if not contact:
        raise HTTPException(404, "Contact not found")
    db.delete(contact)
    db.commit()
