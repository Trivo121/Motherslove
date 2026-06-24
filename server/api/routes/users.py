from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List
from uuid import UUID

from core.database import get_db
from models.user import Profile
from models.address import Address
from models.order import Order
from schemas.user import ProfileResponse, ProfileUpdate
from schemas.address import AddressCreate, AddressUpdate, AddressResponse
from schemas.order import OrderResponse
from api.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=ProfileResponse)
def read_user_me(
    current_user: Profile = Depends(get_current_user),
) -> Any:
    """
    Get current user profile.
    """
    return current_user

@router.put("/me", response_model=ProfileResponse)
def update_user_me(
    profile_in: ProfileUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Update current user profile.
    """
    if profile_in.name is not None:
        current_user.name = profile_in.name
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/addresses", response_model=List[AddressResponse])
def get_user_addresses(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get user addresses."""
    addresses = db.query(Address).filter(Address.user_id == current_user.id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()
    return addresses

@router.post("/me/addresses", response_model=AddressResponse)
def create_user_address(
    address_in: AddressCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Create new address."""
    existing_addresses = db.query(Address).filter(Address.user_id == current_user.id).count()
    if existing_addresses == 0:
        address_in.is_default = True
        
    if address_in.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
        
    new_addr = Address(**address_in.model_dump(), user_id=current_user.id)
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)
    return new_addr

@router.patch("/me/addresses/{address_id}", response_model=AddressResponse)
def update_user_address(
    address_id: UUID,
    address_in: AddressUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update address."""
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
        
    update_data = address_in.model_dump(exclude_unset=True)
    if update_data.get("is_default"):
        db.query(Address).filter(Address.user_id == current_user.id, Address.id != address_id).update({"is_default": False})
        
    for field, value in update_data.items():
        setattr(address, field, value)
        
    db.add(address)
    db.commit()
    db.refresh(address)
    return address

@router.delete("/me/addresses/{address_id}")
def delete_user_address(
    address_id: UUID,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Delete address."""
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
        
    was_default = address.is_default
    db.delete(address)
    db.commit()
    
    if was_default:
        new_default = db.query(Address).filter(Address.user_id == current_user.id).first()
        if new_default:
            new_default.is_default = True
            db.add(new_default)
            db.commit()
            
    return {"success": True}

@router.get("/me/orders", response_model=List[OrderResponse])
def get_user_orders(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get user orders."""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders
