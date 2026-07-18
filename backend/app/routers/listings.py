from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Booking, Listing, User
from ..schemas import DateRangeOut, ListingCreate, ListingOut
from ..security import get_current_user

router = APIRouter(prefix="/listings", tags=["Listings"])


def serialize_listing(listing: Listing) -> ListingOut:
    review_count = len(listing.reviews)
    rating = sum(review.rating for review in listing.reviews) / review_count if review_count else 0
    return ListingOut(
        id=listing.id,
        host_id=listing.host_id,
        title=listing.title,
        description=listing.description,
        city=listing.city,
        country=listing.country,
        category=listing.category,
        price_per_night=listing.price_per_night,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        image_url=listing.image_url,
        amenities=listing.amenities,
        rating=round(rating, 1),
        review_count=review_count,
    )


@router.get("", response_model=list[ListingOut])
def list_listings(
    city: str | None = None,
    category: str | None = None,
    guests: int | None = Query(default=None, ge=1),
    query: str | None = None,
    limit: int = Query(default=20, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    listings_query = db.query(Listing).options(joinedload(Listing.reviews))
    if city:
        listings_query = listings_query.filter(Listing.city.ilike(f"%{city}%"))
    if category:
        listings_query = listings_query.filter(Listing.category == category)
    if guests:
        listings_query = listings_query.filter(Listing.max_guests >= guests)
    if query:
        pattern = f"%{query}%"
        listings_query = listings_query.filter(or_(
            Listing.title.ilike(pattern),
            Listing.city.ilike(pattern),
            Listing.country.ilike(pattern),
        ))
    listings = listings_query.order_by(Listing.created_at.desc()).offset(offset).limit(limit).all()
    return [serialize_listing(listing) for listing in listings]


# Authenticated GET listings for host
@router.get("/host", response_model=list[ListingOut])
def get_current_host_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listings = (
        db.query(Listing)
        .options(joinedload(Listing.reviews))
        .filter(Listing.host_id == current_user.id)
        .all()
    )
    return [serialize_listing(listing) for listing in listings]


# Legacy GET listings by host_id
@router.get("/host/{host_id}", response_model=list[ListingOut])
def get_host_listings(host_id: int, db: Session = Depends(get_db)):
    listings = (
        db.query(Listing)
        .options(joinedload(Listing.reviews))
        .filter(Listing.host_id == host_id)
        .all()
    )

    return [serialize_listing(listing) for listing in listings]


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).options(joinedload(Listing.reviews)).filter(Listing.id == listing_id).first()
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return serialize_listing(listing)


@router.get("/{listing_id}/unavailable-dates", response_model=list[DateRangeOut])
def unavailable_dates(listing_id: int, db: Session = Depends(get_db)):
    if db.get(Listing, listing_id) is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed",
    ).all()
    return [DateRangeOut(check_in=str(booking.check_in), check_out=str(booking.check_out)) for booking in bookings]


# ----------------------------
# Host - Create Listing
# ----------------------------


# Authenticated POST create listing
@router.post("/host", response_model=ListingOut)
def create_host_listing(
    listing: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only hosts can create listings",
        )

    new_listing = Listing(
        host_id=current_user.id,
        title=listing.title,
        description=listing.description,
        city=listing.city,
        country=listing.country,
        category=listing.category,
        price_per_night=listing.price_per_night,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        image_url=listing.image_url,
        amenities=listing.amenities,
    )

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    return serialize_listing(new_listing)


# Legacy POST create listing by host_id
@router.post("/host/{host_id}", response_model=ListingOut)
def create_listing(
    host_id: int,
    listing: ListingCreate,
    db: Session = Depends(get_db),
):
    new_listing = Listing(
        host_id=host_id,
        title=listing.title,
        description=listing.description,
        city=listing.city,
        country=listing.country,
        category=listing.category,
        price_per_night=listing.price_per_night,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        image_url=listing.image_url,
        amenities=listing.amenities,
    )

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    return serialize_listing(new_listing)


@router.put("/host/{listing_id}", response_model=ListingOut)
def update_listing(
    listing_id: int,
    data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.get(Listing, listing_id)

    if listing is None:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    if listing.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this listing",
        )

    listing.title = data.title
    listing.description = data.description
    listing.city = data.city
    listing.country = data.country
    listing.category = data.category
    listing.price_per_night = data.price_per_night
    listing.max_guests = data.max_guests
    listing.bedrooms = data.bedrooms
    listing.beds = data.beds
    listing.bathrooms = data.bathrooms
    listing.image_url = data.image_url
    listing.amenities = data.amenities

    db.commit()
    db.refresh(listing)

    return serialize_listing(listing)


@router.delete("/host/{listing_id}")
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.get(Listing, listing_id)

    if listing is None:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    if listing.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing",
        )

    db.delete(listing)
    db.commit()

    return {"message": "Listing deleted successfully"}