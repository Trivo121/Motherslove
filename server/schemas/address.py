from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class AddressBase(BaseModel):
    label: str
    flat: str
    street: str
    city: str
    state: str
    pincode: str = Field(..., pattern=r'^\d{6}$')
    is_default: Optional[bool] = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    label: Optional[str] = None
    flat: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = Field(None, pattern=r'^\d{6}$')
    is_default: Optional[bool] = None

class AddressResponse(AddressBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
