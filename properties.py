from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/properties", tags=["properties"])

SORTS = {
    "rent_asc": models.Property.monthly_rent.asc(),
    "rent_desc": models.Property.monthly_rent.desc(),
    "size_asc": models.Property.size_sqft.asc(),
    "size_desc": models.Property.size_sqft.desc(),
    "newest": models.Property.created_at.desc(),
}


def with_children(q):
    return q.options(selectinload(models.Property.photos), selectinload(models.Property.contacts))


@router.get("", response_model=schemas.PropertyPage)
def search_properties(
    city: str | None = None,
    locality: str | None = None,
    property_type: str | None = None,
    min_size: int | None = None,
    max_size: int | None = None,
    min_rent: float | None = None,
    max_rent: float | None = None,
    max_deposit: float | None = None,
    budget: float | None = Query(None, description="Monthly budget; deposit assumed <= 6x budget"),
    sort: str = "rent_asc",
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    P = models.Property
    q = db.query(P).filter(P.is_active.is_(True))
    if city:
        q = q.filter(P.city.ilike(f"%{city}%"))
    if locality:
        q = q.filter(P.locality.ilike(f"%{locality}%"))
    if property_type:
        q = q.filter(P.property_type == property_type)
    if min_size is not None:
        q = q.filter(P.size_sqft >= min_size)
    if max_size is not None:
        q = q.filter(P.size_sqft <= max_size)
    if min_rent is not None:
        q = q.filter(P.monthly_rent >= min_rent)
    if max_rent is not None:
        q = q.filter(P.monthly_rent <= max_rent)
    if max_deposit is not None:
        q = q.filter(P.deposit <= max_deposit)
    if budget is not None:
        q = q.filter(P.monthly_rent <= budget, P.deposit <= budget * 6)

    total = q.count()
    items = (
        with_children(q)
        .order_by(SORTS.get(sort, SORTS["rent_asc"]), P.id)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return {"items": items, "total": total, "page": page, "limit": limit}


# Must be declared before "/{property_id}" so "compare" isn't parsed as an id
@router.get("/compare", response_model=list[schemas.PropertyOut])
def compare_properties(ids: str = Query(..., description="Comma separated ids, e.g. 1,2,3"), db: Session = Depends(get_db)):
    try:
        id_list = [int(i) for i in ids.split(",") if i.strip()]
    except ValueError:
        raise HTTPException(400, "ids must be integers")
    if not 2 <= len(id_list) <= 3:
        raise HTTPException(400, "Provide 2 or 3 property ids")
    rows = with_children(db.query(models.Property)).filter(models.Property.id.in_(id_list)).all()
    order = {pid: i for i, pid in enumerate(id_list)}
    return sorted(rows, key=lambda p: order[p.id])


@router.get("/{property_id}", response_model=schemas.PropertyOut)
def get_property(property_id: int, db: Session = Depends(get_db)):
    prop = with_children(db.query(models.Property)).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(404, "Property not found")
    return prop


@router.post("", response_model=schemas.PropertyOut, status_code=201)
def create_property(payload: schemas.PropertyCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"contacts"})
    prop = models.Property(**data)
    prop.contacts = [models.Contact(**c.model_dump()) for c in payload.contacts]
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@router.put("/{property_id}", response_model=schemas.PropertyOut)
def update_property(property_id: int, payload: schemas.PropertyUpdate, db: Session = Depends(get_db)):
    prop = db.get(models.Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(prop, key, value)
    db.commit()
    db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=204)
def delete_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.get(models.Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found")
    db.delete(prop)
    db.commit()
