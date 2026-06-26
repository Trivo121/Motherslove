# Mother's Love 🌸

Welcome to the **Mother's Love** repository! This is the core codebase for our e-commerce platform (live at [motherslove.site](https://www.motherslove.site)). 

I've put this README together to give you a solid lay of the land, especially if you're diving into the backend infrastructure where a lot of the heavy lifting happens.

---

## What are we building here?

Mother's Love is a full-stack e-commerce application. The goal is to provide a seamless, snappy, and beautiful shopping experience on the frontend, powered by a robust, secure, and easily extensible backend API. 

## The Stack at a Glance

- **Frontend**: React (with Vite), TailwindCSS, React Router.
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (hosted on Supabase)
- **Payments**: Razorpay
- **Image CDN**: ImageKit

---

## 🛠️ Deep Dive: The Backend Infrastructure

Let's talk about the backend. I wanted something fast, strictly typed, and easy to maintain, which is why the server is built entirely on **FastAPI**. 

Here is how the infrastructure is wired up:

### 1. The Core Application (`/server`)
FastAPI serves as the backbone. It’s running on an ASGI server (`uvicorn`) which handles all incoming traffic. We make heavy use of Pydantic for data validation (via the `schemas` folder) to ensure that whatever comes into our endpoints is exactly what we expect. 

### 2. Database & ORM
We are using **PostgreSQL** as our database, hosted on Supabase. 
Instead of writing raw SQL, we interact with the database using **SQLAlchemy** (our ORM), paired with the `pg8000` driver.
- **Models (`/server/models`)**: This is where our SQLAlchemy database models live (Users, Products, Orders, etc.).
- **Database Core (`/server/core/database.py`)**: Handles the connection pooling and session management.

### 3. Authentication & Security
Security is handled natively via **PyJWT**. When a user logs in, we generate a JSON Web Token that gets passed back to the client. Every protected route in the API uses FastAPI dependencies (`deps.py`) to intercept the request, validate the JWT, and attach the current user context to the request before it even reaches the route handler. 

### 4. Third-Party Integrations
We rely on a couple of key external services:
- **Payments (Razorpay)**: All order processing and checkout logic goes through Razorpay. The backend verifies payment signatures and manages order states.
- **Media (ImageKit)**: Instead of serving images from our own database or local storage, we offload image delivery to ImageKit to ensure fast load times and optimized caching.

### 5. API Routing (`/server/api/routes`)
To keep `main.py` clean, the API is heavily modularized:
- `/users`: Registration, login, profile updates, and admin management.
- `/products`: Inventory management, product fetching, and filtering.
- `/orders`: Cart checkouts, Razorpay webhooks, and order history.
- `/images`: Image uploads and ImageKit integration.

---

## Folder Structure

```text
.
├── client/                 # The React/Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Footers, Cards)
│   │   └── pages/          # Full page views (Home, Shop, Admin Dashboard)
│   └── package.json        
├── server/                 # The FastAPI Backend
│   ├── api/                # API Routers and Dependencies
│   ├── core/               # Database connection and config
│   ├── models/             # SQLAlchemy ORM Models
│   ├── schemas/            # Pydantic validation schemas
│   ├── main.py             # FastAPI application entry point
│   └── requirements.txt    # Python dependencies
└── README.md               # You are here!
```

---

## Running it Locally 💻

If you want to spin this up on your own machine, here is the quick-start guide.

### 1. The Frontend
Open a terminal in the root folder and cd into `client`:
```bash
cd client
npm install
npm run dev
```
The app will be running at `http://localhost:5173`.

### 2. The Backend
Open a second terminal, cd into `server`, and set up your Python environment:
```bash
cd server
python -m venv venv
# Activate the virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```

You'll need a `.env` file in the `server` directory (you can use `.env.example` as a template) with your Supabase DB URL, JWT secrets, and Razorpay keys.

Once your `.env` is set up:
```bash
uvicorn main:app --reload
```
The API will be live at `http://127.0.0.1:8000`. You can also check out the auto-generated Swagger documentation by heading to `http://127.0.0.1:8000/docs`.

---

*If you find any bugs or have ideas for improvements, feel free to open a PR! Happy coding!* ☕
