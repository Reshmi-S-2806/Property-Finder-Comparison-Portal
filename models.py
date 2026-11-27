from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean, ForeignKey, Text,
    DateTime, Date, UniqueConstraint, func,
)
from sqlalchemy.orm import relationship
from .database import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    property_type = Column(String(50), index=True)  # office / shop / warehouse
    city = Column(String(100), index=True)
    locality = Column(String(100), index=True)
    address = Column(String(300))
    size_sqft = Column(Integer, index=True)
    monthly_rent = Column(Numeric(12, 2, asdecimal=False), index=True)
    deposit = Column(Numeric(12, 2, asdecimal=False))
    available_from = Column(Date)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    photos = relationship("Photo", cascade="all, delete-orphan", order_by="Photo.id")
    contacts = relationship("Contact", cascade="all, delete-orphan", order_by="Contact.id")


class Photo(Base):
    __tablename__ = "property_photos"

    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), index=True)
    url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), index=True)
    name = Column(String(120), nullable=False)
    role = Column(String(20), nullable=False)  # owner / broker
    phone = Column(String(30))
    email = Column(String(150))


class Shortlist(Base):
    __tablename__ = "shortlists"
    __table_args__ = (UniqueConstraint("session_id", "property_id", name="uq_session_property"),)

    id = Column(Integer, primary_key=True)
    session_id = Column(String(64), index=True, nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
