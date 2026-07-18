from datetime import date
from pydantic import BaseModel, ConfigDict

# ----------------------------
# Listing
# ----------------------------

class ListingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    host_id: int
    title: str
    description: str
    city: str
    country: str
    category: str
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    image_url: str
    amenities: str
    rating: float = 0
    review_count: int = 0


class ListingSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    city: str
    country: str
    image_url: str
    price_per_night: float


class ListingCreate(BaseModel):
    title: str
    description: str
    city: str
    country: str
    category: str
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    image_url: str
    amenities: str


# ----------------------------
# Booking
# ----------------------------

class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    total_price: float
    status: str


class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    check_in: date
    check_out: date
    guests: int
    total_price: float
    status: str
    listing: ListingSummary


# ----------------------------
# Date Range
# ----------------------------

class DateRangeOut(BaseModel):
    check_in: str
    check_out: str


# ----------------------------
# Review
# ----------------------------

class ReviewCreate(BaseModel):
    listing_id: int
    rating: int
    comment: str


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    rating: int
    comment: str
    author: UserSummary | None = None


# ----------------------------
# Wishlist
# ----------------------------

class WishlistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing: ListingSummary




class HostBookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    check_in: date
    check_out: date
    guests: int
    total_price: float
    status: str
    listing: ListingSummary
    guest: UserSummary