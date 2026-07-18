from datetime import date, timedelta

from passlib.context import CryptContext

from .database import Base, SessionLocal, engine
from .models import Booking, Listing, Review, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

IMAGES = [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
]

LOCATIONS = [
    ("Goa", "India", "Beach"),
    ("Manali", "India", "Mountains"),
    ("Jaipur", "India", "Design"),
    ("Udaipur", "India", "Lakes"),
]


def seed_database():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        if db.query(User).count() > 0:
            print("Database already seeded.")
            return

        hosts = [
            User(
                name=f"Host {number}",
                email=f"host{number}@example.com",
                hashed_password=pwd_context.hash("password123"),
                is_host=True,
            )
            for number in range(1, 6)
        ]

        guests = [
            User(
                name=f"Guest {number}",
                email=f"guest{number}@example.com",
                hashed_password=pwd_context.hash("password123"),
            )
            for number in range(1, 11)
        ]

        db.add_all(hosts + guests)
        db.flush()

        listings = []

        for index in range(20):
            city, country, category = LOCATIONS[index % len(LOCATIONS)]

            listings.append(
                Listing(
                    host_id=hosts[index % len(hosts)].id,
                    title=f"{category} retreat in {city}",
                    description=f"A comfortable, thoughtfully designed stay near the best of {city}.",
                    city=city,
                    country=country,
                    category=category,
                    price_per_night=2800 + (index % 6) * 650,
                    max_guests=2 + index % 6,
                    bedrooms=1 + index % 3,
                    beds=1 + index % 4,
                    bathrooms=1 + (index % 2) * 0.5,
                    image_url=IMAGES[index % len(IMAGES)],
                    amenities="Wifi,Kitchen,Free parking,Air conditioning",
                )
            )

        db.add_all(listings)
        db.flush()

        for index in range(15):
            db.add(
                Booking(
                    listing_id=listings[index].id,
                    guest_id=guests[index % len(guests)].id,
                    check_in=date.today() + timedelta(days=30 + index * 4),
                    check_out=date.today() + timedelta(days=33 + index * 4),
                    guests=2,
                    total_price=listings[index].price_per_night * 3,
                )
            )

        for index in range(25):
            db.add(
                Review(
                    listing_id=listings[index % len(listings)].id,
                    author_id=guests[index % len(guests)].id,
                    rating=4 + index % 2,
                    comment="Lovely stay, exactly as described. I would happily return.",
                )
            )

        db.commit()
        print("Database seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()