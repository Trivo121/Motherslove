from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: Optional[UUID]
    quantity: int
    size: Optional[str]
    color: Optional[str]
    price_at_purchase: int
    
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    subtotal: int
    shipping_cost: int
    total_amount: int
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
