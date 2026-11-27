from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field

PropertyType = Literal["office", "shop", "warehouse"]


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    role: Literal["owner", "broker"]
    phone: str | None = None
    email: EmailStr | None = None


class ContactOut(ContactIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class PhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str
    is_primary: bool


class PropertyBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    property_type: PropertyType
    city: str
    locality: str | None = None
    address: str | None = None
    size_sqft: int = Field(gt=0)
    monthly_rent: float = Field(gt=0)
    deposit: float = Field(ge=0)
    available_from: date | None = None
    is_active: bool = True


class PropertyCreate(PropertyBase):
    contacts: list[ContactIn] = []


class PropertyUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    property_type: PropertyType | None = None
    city: str | None = None
    locality: str | None = None
    address: str | None = None
    size_sqft: int | None = Field(default=None, gt=0)
    monthly_rent: float | None = Field(default=None, gt=0)
    deposit: float | None = Field(default=None, ge=0)
    available_from: date | None = None
    is_active: bool | None = None


class PropertyOut(PropertyBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    photos: list[PhotoOut] = []
    contacts: list[ContactOut] = []


class PropertyPage(BaseModel):
    items: list[PropertyOut]
    total: int
    page: int
    limit: int
