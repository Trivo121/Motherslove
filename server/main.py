from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from core.database import Base, engine

# Ensure tables are created (useful if running locally against a fresh DB, 
# though Supabase tables are already created by the SQL script)
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mother's Love API")

# Configure CORS for the frontend
origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "https://www.motherslove.site" # Production URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI server for Mother's Love!"}
