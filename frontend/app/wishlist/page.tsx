"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { api } from "@/services/api";

type WishlistItem = {
  id: number;
  listing: {
    id: number;
    title: string;
    city: string;
    country: string;
    image_url: string;
    price_per_night: number;
  };
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<WishlistItem[]>("/wishlist")
      .then((res) => setItems(res.data))
      .catch((err) => {
        console.error(err);
        setError("Unable to load wishlist.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />

      <main className="container content">
        <h1 style={{ marginBottom: 30 }}>Wishlist</h1>

        {loading && <p>Loading...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="empty">
            <h2>No saved listings</h2>
            <p>Click the ❤️ icon to save properties.</p>
          </div>
        )}

        <div className="listing-grid">
          {items.map((item) => (
            <article className="listing-card" key={item.id}>
              <Link href={`/listings/${item.listing.id}`}>
                <div className="listing-image-wrap">
                  <img
                    src={item.listing.image_url}
                    className="listing-image"
                    alt={item.listing.title}
                  />
                </div>

                <div className="card-info">
                  <div className="card-place">
                    <span>
                      {item.listing.city}, {item.listing.country}
                    </span>
                  </div>

                  <div className="card-detail">
                    {item.listing.title}
                  </div>

                  <div className="card-price">
                    <strong>
                      ₹
                      {item.listing.price_per_night.toLocaleString("en-IN")}
                    </strong>{" "}
                    night
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}