from sqlalchemy import text
from core.database import engine

with engine.connect() as conn:
    try:
        result = conn.execute(text("SELECT email, role FROM profiles")).fetchall()
        for row in result:
            print(f"User: {row[0]}, Role: {row[1]}")
    except Exception as e:
        print('Error:', e)
