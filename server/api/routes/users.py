from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from core.database import get_db
from models.user import Profile
from schemas.user import ProfileResponse, ProfileUpdate
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
