from sqlalchemy import text
from core.database import engine

with engine.connect() as conn:
    try:
        conn.execute(text("UPDATE profiles SET role = 'admin' WHERE email IN ('viswa225574@gmail.com', 'sunnusunnu649@gmail.com')"))
        conn.commit()
        result = conn.execute(text("SELECT email, role FROM profiles WHERE email IN ('viswa225574@gmail.com', 'sunnusunnu649@gmail.com')")).fetchall()
        print('Updated users:', result)
    except Exception as e:
        print('Error:', e)
