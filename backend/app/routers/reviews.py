from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Review, Listing, User
from ..schemas import ReviewCreate, ReviewOut
from ..security import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewOut)
def create_review(
    review: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.get(Listing, review.listing_id)

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    new_review = Review(
        listing_id=review.listing_id,
        author_id=current_user.id,
        rating=review.rating,
        comment=review.comment,
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review


@router.get("/{listing_id}", response_model=list[ReviewOut])
def get_reviews(
    listing_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Review)
        .options(joinedload(Review.author))
        .filter(Review.listing_id == listing_id)
        .order_by(Review.created_at.desc())
        .all()
    )


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    review = db.get(Review, review_id)

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    if review.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this review",
        )

    db.delete(review)
    db.commit()

    return {
        "message": "Review deleted"
    }