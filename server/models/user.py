import enum
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, ENUM
from core.database import Base

class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"

class Profile(Base):
    __tablename__ = "profiles"

    # In Supabase, the profiles ID is a foreign key to auth.users.id
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False)
    name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    approved = Column(Boolean, nullable=False, server_default=text("true"))
    
    # Supabase uses a custom ENUM type called 'user_role'
    role = Column(ENUM(UserRole, name="user_role", create_type=False), nullable=False, server_default=text("'customer'::user_role"))
    
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
