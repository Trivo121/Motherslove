from fastapi import APIRouter
from api.routes import users, images, products

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
