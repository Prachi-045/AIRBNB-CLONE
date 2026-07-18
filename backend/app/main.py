import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.bookings import router as bookings_router
from .database import Base, engine
from .routers.listings import router as listings_router
from .routers.wishlist import router as wishlist_router
from .routers.reviews import router as reviews_router
from .auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Airbnb Clone API", version="0.1.0")

# Allow origins from env var (comma-separated) or fallback to localhost
_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(listings_router)
app.include_router(bookings_router)
app.include_router(wishlist_router)
app.include_router(reviews_router)
app.include_router(auth_router)
@app.get("/health")
def health_check():
    return {"status": "ok"}
