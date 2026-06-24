from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProfileBase(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: UUID
    email: EmailStr
    approved: bool
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
