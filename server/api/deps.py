from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID

from core.database import get_db
from core.security import verify_supabase_jwt
from models.user import Profile

security = HTTPBearer()

def get_current_user_payload(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Validates the JWT token and returns the payload.
    """
    token = credentials.credentials
    return verify_supabase_jwt(token)

def get_current_user(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> Profile:
    """
    Fetches the user profile from the database based on the JWT payload.
    """
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID format")

    user = db.query(Profile).filter(Profile.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    
    if not user.approved:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not approved")
        
    return user

def get_current_admin(current_user: Profile = Depends(get_current_user)) -> Profile:
    """
    Ensures the current user has the 'admin' role.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
