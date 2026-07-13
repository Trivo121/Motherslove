from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from typing import List

from core.database import get_db
from models.order import Order, OrderItem, OrderStatus
from models.product import Product
from schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter()

FREE_SHIPPING_THRESHOLD = 999
SHIPPING_COST = 0

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
    
    # 5. Create Razorpay Order
    import razorpay
    from core.config import settings
    
    # Only initialize if credentials are set (to avoid crashing if empty)
    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            # Amount in paise
            razorpay_order = client.order.create(dict(
                amount=new_order.total_amount * 100,
                currency="INR",
                receipt=str(new_order.id)
            ))
            
            new_order.razorpay_order_id = razorpay_order["id"]
            db.commit()
            db.refresh(new_order)
        except Exception as e:
            # If Razorpay fails, we can either rollback or keep it as pending.
            # Usually better to return a 500 error and rollback so user can retry.
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to initialize payment gateway: {str(e)}")
    
    return new_order


from schemas.order import PaymentVerification
from core.email_utils import send_order_confirmation_email, send_order_status_email

@router.post("/verify-payment", status_code=status.HTTP_200_OK)
def verify_payment(payload: PaymentVerification, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Verifies the Razorpay payment signature and updates the order status.
    """
    import razorpay
    from core.config import settings

    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    try:
        # Verify the signature
        client.utility.verify_payment_signature({
            'razorpay_order_id': payload.razorpay_order_id,
            'razorpay_payment_id': payload.razorpay_payment_id,
            'razorpay_signature': payload.razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Update order in DB
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Ensure it matches the razorpay order id we saved
    if order.razorpay_order_id != payload.razorpay_order_id:
        raise HTTPException(status_code=400, detail="Mismatched order ID")

    order.status = OrderStatus.PROCESSING
    order.payment_method = "RAZORPAY"
    order.razorpay_payment_id = payload.razorpay_payment_id
    order.razorpay_signature = payload.razorpay_signature

    db.commit()
    db.refresh(order)

    # Queue confirmation email
    background_tasks.add_task(send_order_confirmation_email, order)

    return {"status": "success", "message": "Payment verified successfully", "order_id": order.id}


@router.get("/", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    """
    Retrieve all orders (admin functionality).
    """
    orders = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).order_by(Order.created_at.desc()).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(order_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve a specific order by ID.
    """
    order = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: UUID, status_update: OrderStatusUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Update the status of a specific order.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    try:
        new_status = OrderStatus(status_update.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order status")
        
    order.status = new_status
    db.commit()
    
    # Refresh with joined items
    order = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order_id).first()
    
    # Queue status update email
    background_tasks.add_task(send_order_status_email, order)
    
    return order
