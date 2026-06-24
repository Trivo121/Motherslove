from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int
    size: Optional[str] = None
    color: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: Optional[UUID]
    quantity: int
    size: Optional[str]
    color: Optional[str]
    price_at_purchase: int
    
    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    shipping_name: str
    shipping_email: str
    shipping_phone: str
    shipping_flat: Optional[str] = None
    shipping_street: Optional[str] = None
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    notes: Optional[str] = None
    items: List[OrderItemCreate]

class OrderResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    subtotal: int
    shipping_cost: int
    total_amount: int
    status: str
    razorpay_order_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

class PaymentVerification(BaseModel):
    order_id: UUID
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

    model_config = ConfigDict(from_attributes=True)
