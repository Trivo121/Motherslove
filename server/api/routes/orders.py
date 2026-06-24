from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from core.database import get_db
from models.order import Order, OrderItem, OrderStatus
from models.product import Product
from schemas.order import OrderCreate, OrderResponse

router = APIRouter()

FREE_SHIPPING_THRESHOLD = 999
SHIPPING_COST = 99

@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout_cart(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Validates a cart checkout request and creates a PENDING order.
    - Re-calculates totals from the database to prevent tampering.
    - Verifies stock is available and decrements it.
    """
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = 0
    db_items = []
    
    # 1. Validation & Calculation loop
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
            
        if not product.published:
            raise HTTPException(status_code=400, detail=f"Product {product.name} is not available")
            
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}. Available: {product.stock}")
            
        # Add to true subtotal using DB price
        subtotal += product.price * item.quantity
        
        # Save reference for item creation
        db_items.append({
            "product": product,
            "quantity": item.quantity,
            "size": item.size,
            "color": item.color,
            "price_at_purchase": product.price
        })

    # 2. Compute final totals
    shipping_cost = 0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_COST
    total_amount = subtotal + shipping_cost

    # 3. Create Order
    new_order = Order(
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        total_amount=total_amount,
        status=OrderStatus.PENDING,
        shipping_name=order_data.shipping_name,
        shipping_email=order_data.shipping_email,
        shipping_phone=order_data.shipping_phone,
        shipping_flat=order_data.shipping_flat,
        shipping_street=order_data.shipping_street,
        shipping_city=order_data.shipping_city,
        shipping_state=order_data.shipping_state,
        shipping_pincode=order_data.shipping_pincode,
        notes=order_data.notes
    )
    
    db.add(new_order)
    db.flush() # flush to generate new_order.id

    # 4. Create Order Items & Decrement Stock
    for item_data in db_items:
        product = item_data["product"]
        
        # Decrement stock (reserving it)
        product.stock -= item_data["quantity"]
        
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=item_data["quantity"],
            size=item_data["size"],
            color=item_data["color"],
            price_at_purchase=item_data["price_at_purchase"]
        )
        db.add(order_item)
        
    db.commit()
    db.refresh(new_order)
    
    return new_order
