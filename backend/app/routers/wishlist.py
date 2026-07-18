from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Listing, User, Wishlist
from ..schemas import WishlistOut
from ..security import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.post("/{listing_id}")
def add_to_wishlist(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.get(Listing, listing_id)

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.listing_id == listing_id,
        )
        .first()
    )

    if existing:
        return {"message": "Already in wishlist"}

    item = Wishlist(
        user_id=current_user.id,
        listing_id=listing_id,
    )

    db.add(item)
    db.commit()

    return {"message": "Added to wishlist"}


@router.delete("/{listing_id}")
def remove_from_wishlist(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.listing_id == listing_id,
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()

    return {"message": "Removed from wishlist"}


@router.get("", response_model=list[WishlistOut])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id)
        .all()
    )

    response = []

    for item in items:
        listing = db.get(Listing, item.listing_id)

        if listing is None:
            continue

        response.append(
            {
                "id": item.id,
                "listing": {
                    "id": listing.id,
                    "title": listing.title,
                    "city": listing.city,
                    "country": listing.country,
                    "image_url": listing.image_url,
                    "price_per_night": listing.price_per_night,
                },
            }
        )

    return response