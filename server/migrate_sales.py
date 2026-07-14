import sys
import os
from sqlalchemy import text
from core.database import SessionLocal, engine

def migrate():
    with engine.begin() as conn:
        try:
            # Check if columns exist
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='on_sale'"))
            if result.fetchone():
                print("Column 'on_sale' already exists.")
            else:
                conn.execute(text("ALTER TABLE products ADD COLUMN on_sale BOOLEAN NOT NULL DEFAULT FALSE;"))
                print("Added column 'on_sale'")
                
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='sale_price'"))
            if result.fetchone():
                print("Column 'sale_price' already exists.")
            else:
                conn.execute(text("ALTER TABLE products ADD COLUMN sale_price INTEGER;"))
                print("Added column 'sale_price'")
        except Exception as e:
            print(f"Migration failed: {e}")
            sys.exit(1)
            
    print("Migration successful!")

if __name__ == "__main__":
    migrate()
