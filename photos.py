import os
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["photos"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_BYTES = 5 * 1024 * 1024


@router.post("/properties/{property_id}/photos", response_model=schemas.PhotoOut, status_code=201)
async def upload_photo(property_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    prop = db.get(models.Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found")
    if file.content_type not in ALLOWED:
        raise HTTPException(400, "Only JPEG, PNG or WebP images are allowed")
    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(400, "Image must be 5 MB or smaller")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ALLOWED[file.content_type]}"
    with open(os.path.join(UPLOAD_DIR, name), "wb") as f:
        f.write(content)

    photo = models.Photo(property_id=property_id, url=f"/uploads/{name}", is_primary=not prop.photos)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/photos/{photo_id}", status_code=204)
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.get(models.Photo, photo_id)
    if not photo:
        raise HTTPException(404, "Photo not found")
    if photo.url.startswith("/uploads/"):
        path = os.path.join(UPLOAD_DIR, os.path.basename(photo.url))
        if os.path.exists(path):
            os.remove(path)
    db.delete(photo)
    db.commit()
