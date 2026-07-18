"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Listing } from "@/types";
import { HeartIcon } from "./icons";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AuthModal } from "./AuthModal";

export function ListingCard({ listing }: { listing: Listing }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Dynamically check if this listing is saved when component mounts or user changes
  useEffect(() => {
    if (user) {
      api.get<any[]>("/wishlist")
        .then((res) => {
          const isSaved = res.data.some((item) => item.listing.id === listing.id);
          setSaved(isSaved);
        })
        .catch(() => {});
    } else {
      setSaved(false);
    }
  }, [user, listing.id]);

  const toggleWishlist = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      showToast("Please log in to save properties.", "info");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      if (saved) {
        await api.delete(`/wishlist/${listing.id}`);
        setSaved(false);
        showToast("Removed from wishlist.", "success");
      } else {
        await api.post(`/wishlist/${listing.id}`, {});
        setSaved(true);
        showToast("Added to wishlist!", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Could not update wishlist.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <article className="listing-card">
        <Link
          href={`/listings/${listing.id}`}
          className="listing-image-wrap"
        >
          <img
            className="listing-image"
            src={listing.image_url}
            alt={listing.title}
          />

          <button
            className="heart-button"
            type="button"
            aria-label={`Save ${listing.title}`}
            onClick={toggleWishlist}
          >
            <HeartIcon
              size={25}
              filled={saved}
            />
          </button>
        </Link>

        <div className="card-info">
          <div className="card-place">
            <span>
              {listing.city}, {listing.country}
            </span>

            <span>
              ★ {listing.rating || "New"}
            </span>
          </div>

          <div className="card-detail">
            {listing.category}
          </div>

          <div className="card-detail">
            {listing.bedrooms} bedrooms · {listing.beds} beds
          </div>

          <div className="card-price">
            <strong>
              ₹{listing.price_per_night.toLocaleString("en-IN")}
            </strong>{" "}
            night
          </div>
        </div>
      </article>

      {showAuthModal && (
        <AuthModal
          initialMode="login"
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}