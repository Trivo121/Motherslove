from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Supabase JWT Secret to verify tokens from the frontend
    SUPABASE_JWT_SECRET: str = "your-supabase-jwt-secret-here"
    
    # PostgreSQL connection string from Supabase
    # E.g., postgresql+pg8000://postgres.xxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
    DATABASE_URL: str = "postgresql+pg8000://user:password@localhost:5432/dbname"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
