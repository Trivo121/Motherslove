import os
from fastapi import APIRouter, HTTPException
from imagekitio import ImageKit

router = APIRouter()

# Initialize ImageKit with environment variables.
# We will read them safely from os.environ since they'll be loaded via python-dotenv.
imagekit = ImageKit(
    private_key=os.environ.get("IMAGEKIT_PRIVATE_KEY", "dummy"),
    public_key=os.environ.get("IMAGEKIT_PUBLIC_KEY", "dummy"),
    url_endpoint=os.environ.get("IMAGEKIT_URL_ENDPOINT", "dummy")
)

@router.get("/auth")
def get_imagekit_auth():
    try:
        # Generates a dict containing: token, expire, and signature
        auth_params = imagekit.get_authentication_parameters()
        return auth_params
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate upload token: {str(e)}")
