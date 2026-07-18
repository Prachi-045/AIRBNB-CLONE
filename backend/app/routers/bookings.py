from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Listing, User
from ..schemas import BookingCreate, BookingOut, TripOut, HostBookingOut
from ..security import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingOut)
def create_booking(
    booking: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # ----------------------------
    # Check listing exists
    # ----------------------------
    listing = db.get(Listing, booking.listing_id)

    if listing is None:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    # ----------------------------
    # Validate dates
    # ----------------------------
    if booking.check_in >= booking.check_out:
        raise HTTPException(
            status_code=400,
            detail="Check-out must be after check-in",
        )

    if booking.check_in < date.today():
        raise HTTPException(
            status_code=400,
            detail="Check-in cannot be in the past",
        )

    # ----------------------------
    # Check overlapping bookings
    # ----------------------------
    overlap = (
        db.query(Booking)
        .filter(
            Booking.listing_id == booking.listing_id,
            Booking.status == "confirmed",
            Booking.check_in < booking.check_out,
            Booking.check_out > booking.check_in,
        )
        .first()
    )

    if overlap:
        raise HTTPException(
            status_code=400,
            detail="Selected dates are unavailable",
        )

    # ----------------------------
    # Calculate total price
    # ----------------------------
    nights = (booking.check_out - booking.check_in).days
    total = nights * listing.price_per_night

    new_booking = Booking(
        listing_id=booking.listing_id,
        guest_id=current_user.id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests=booking.guests,
        total_price=total,
        status="confirmed",
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking


@router.get("/my-trips", response_model=list[TripOut])
def my_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .filter(Booking.guest_id == current_user.id)
        .order_by(Booking.check_in.desc())
        .all()
    )

    trips = []

    for booking in bookings:
        listing = db.get(Listing, booking.listing_id)

        if listing is None:
            continue

        trips.append(
            {
                "id": booking.id,
                "check_in": booking.check_in,
                "check_out": booking.check_out,
                "guests": booking.guests,
                "total_price": booking.total_price,
                "status": booking.status,
                "listing": listing,
            }
        )

    return trips


@router.get("/host", response_model=list[HostBookingOut])
def get_host_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only hosts can view host bookings",
        )

    bookings = (
        db.query(Booking)
        .join(Listing)
        .filter(Listing.host_id == current_user.id)
        .order_by(Booking.check_in.desc())
        .all()
    )

    return bookings


@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    status: str = Query(..., pattern="^(confirmed|cancelled)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    listing = db.get(Listing, booking.listing_id)

    # Allow guest or listing owner/host to cancel/update status
    if current_user.id != booking.guest_id and current_user.id != listing.host_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this booking status",
        )

    booking.status = status
    db.commit()
    db.refresh(booking)

    return booking