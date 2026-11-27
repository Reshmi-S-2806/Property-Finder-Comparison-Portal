import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import properties, photos, contacts, shortlist

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Property Finder Comparison Portal")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(properties.router)
app.include_router(photos.router)
app.include_router(contacts.router)
app.include_router(shortlist.router)


@app.get("/")
def health():
    return {"status": "ok"}
