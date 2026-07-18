// 

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { HeartIcon } from "@/components/icons";
import { BookingCard } from "@/components/BookingCard";
import { api } from "@/services/api";
import { Listing } from "@/types";

import { ReviewsSection } from "@/components/ReviewsSection";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();

  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Listing>(`/listings/${id}`)
      .then((response) => setListing(response.data))
      .catch(() => setError("This home is unavailable."));
  }, [id]);

  if (error) {
    return (
      <>
        <Header />
        <main className="container">
          <p className="error">{error}</p>
          <Link href="/">Back to homes</Link>
        </main>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Header />
        <main className="container detail-loading">
          Loading your stay…
        </main>
      </>
    );
  }

  const amenities = listing.amenities
    .split(",")
    .filter(Boolean);

  return (
    <>
      <Header />

      <main className="container detail-page">
        <a href="/" className="back">
          ← Homes
        </a>

        <div className="detail-title-row">
          <div>
            <h1>{listing.title}</h1>

            <p>
              <u>
                ★ {listing.rating || "New"} ·{" "}
                {listing.review_count} reviews
              </u>{" "}
              ·{" "}
              <u>
                {listing.city}, {listing.country}
              </u>
            </p>
          </div>

          <button className="share">
            ↗ Share&nbsp;&nbsp;
            <HeartIcon size={18} /> Save
          </button>
        </div>

        <section className="gallery">
          <img
            className="gallery-main"
            src={listing.image_url}
            alt={listing.title}
          />

          <div className="gallery-side">
            <img
              src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80"
              alt="Home interior"
            />

            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80"
              alt="Home interior"
            />
          </div>
        </section>

        <section className="detail-layout">
          <article className="description">
            <h2>
              Entire home in {listing.city}, {listing.country}
            </h2>

            <p>
              {listing.max_guests} guests ·{" "}
              {listing.bedrooms} bedrooms ·{" "}
              {listing.beds} beds ·{" "}
              {listing.bathrooms} baths
            </p>

            <div className="host-row">
              <span className="host-avatar">H</span>

              <div>
                <strong>Hosted by a local host</strong>
                <br />
                <span>
                  Superhost · 5 years hosting
                </span>
              </div>
            </div>

            <hr />

            <p className="intro">
              {listing.description}
            </p>

            <hr />

            <h2>What this place offers</h2>

            <div className="amenities">
              {amenities.map((amenity) => (
                <span key={amenity}>
                  ✓ {amenity.trim()}
                </span>
              ))}
            </div>
          </article>

          {/* Booking Card */}
          <BookingCard listing={listing} />
        </section>

        <ReviewsSection listingId={listing.id} />
      </main>
    </>
  );

}