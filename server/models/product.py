from sqlalchemy import Column, String, Boolean, DateTime, Integer, text
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
import uuid
from core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Integer, nullable=False, default=0)
    category = Column(String, nullable=True)
    stock = Column(Integer, nullable=False, default=0)
    published = Column(Boolean, nullable=False, server_default=text("false"))
    on_sale = Column(Boolean, nullable=False, server_default=text("false"))
    sale_price = Column(Integer, nullable=True)
    image_url = Column(String, nullable=True)
    image_urls = Column(ARRAY(String), nullable=False, server_default=text("'{}'::text[]"))
    sizes = Column(ARRAY(String), nullable=False, server_default=text("'{}'::text[]"))
    tags = Column(ARRAY(String), nullable=False, server_default=text("'{}'::text[]"))
    
    # Use metadata_ to avoid conflict with Base.metadata
    metadata_ = Column("metadata", JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
