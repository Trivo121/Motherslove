from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class ProductBase(BaseModel):
    sku: Optional[str] = None
    name: str
    description: Optional[str] = None
    price: int
    category: Optional[str] = None
    stock: int = 0
    published: bool = False
    sizes: List[str] = []
    tags: List[str] = []

class ProductCreate(ProductBase):
    image_url: Optional[str] = None
    image_urls: List[str] = []

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    published: Optional[bool] = None
    image_url: Optional[str] = None
    image_urls: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    tags: Optional[List[str]] = None

class ProductOut(ProductBase):
    id: UUID
    image_url: Optional[str] = None
    image_urls: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
