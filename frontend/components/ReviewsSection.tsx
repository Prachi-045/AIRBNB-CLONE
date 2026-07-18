"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AuthModal } from "./AuthModal";

type Review = {
  id: number;
  author_id: number;
  rating: number;
  comment: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
};

export function ReviewsSection({ listingId }: { listingId: number }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadReviews = () => {
    api
      .get<Review[]>(`/reviews/${listingId}`)
      .then((res) => setReviews(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadReviews();
  }, [listingId]);

  const submitReview = async () => {
    if (!comment.trim()) return;

    if (!user) {
      setShowAuthModal(true);
      showToast("Please log in to write a review.", "info");
      return;
    }

    try {
      await api.post("/reviews", {
        listing_id: listingId,
        rating,
        comment,
      });

      setComment("");
      setRating(5);
      showToast("Review submitted successfully!", "success");
      loadReviews();
    } catch (error) {
      showToast("Could not submit review.", "error");
    }
  };

  return (
    <section style={{ marginTop: 60 }}>
      <h2>⭐ Reviews</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
          marginBottom: 35,
        }}
      >
        <h3>Write a Review</h3>

        {!user ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <p style={{ color: "var(--subtle)", marginBottom: 15 }}>
              Share your thoughts about this home with other travelers.
            </p>
            <button className="button" onClick={() => setShowAuthModal(true)}>
              Log In to Write a Review
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submitReview(); }}>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
            >
              <option value={5}>★★★★★</option>
              <option value={4}>★★★★☆</option>
              <option value={3}>★★★☆☆</option>
              <option value={2}>★★☆☆☆</option>
              <option value={1}>★☆☆☆☆</option>
            </select>

            <br />
            <br />

            <textarea
              rows={4}
              style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", font: "inherit" }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              required
            />

            <br />
            <br />

            <button
              type="submit"
              className="reserve"
              style={{ margin: 0 }}
            >
              Submit Review
            </button>
          </form>
        )}
      </div>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            style={{
              borderBottom: "1px solid #eee",
              padding: "18px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{
                background: "#eee",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "grid",
                placeItems: "center",
                fontWeight: 650,
                fontSize: 14,
                color: "#555"
              }}>
                {(review.author?.name || "U").charAt(0).toUpperCase()}
              </span>
              <h4 style={{ margin: 0 }}>
                {review.author?.name || `User #${review.author_id}`}
              </h4>
            </div>

            <p style={{ margin: "4px 0", color: "#f5a623" }}>
              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            </p>

            <p style={{ margin: "8px 0 0", color: "var(--ink)", lineHeight: 1.4 }}>
              {review.comment}
            </p>
          </div>
        ))
      )}

      {showAuthModal && (
        <AuthModal
          initialMode="login"
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </section>
  );
}