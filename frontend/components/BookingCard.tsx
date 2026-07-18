"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/services/api";
import { Listing } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AuthModal } from "./AuthModal";

type Props = {
  listing: Listing;
};

type DateRange = {
  check_in: string;
  check_out: string;
};

export function BookingCard({ listing }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [blockedDates, setBlockedDates] = useState<DateRange[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Card details
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    api
      .get<DateRange[]>(`/listings/${listing.id}/unavailable-dates`)
      .then((res) => setBlockedDates(res.data))
      .catch(() => {});
  }, [listing.id]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    return Math.max(
      0,
      Math.ceil(
        (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }, [checkIn, checkOut]);

  const serviceFee = 1250;
  const total = nights * listing.price_per_night;
  const grandTotal = total + serviceFee;

  function isUnavailable() {
    if (!checkIn || !checkOut) return false;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    return blockedDates.some((booking) => {
      const bookedStart = new Date(booking.check_in);
      const bookedEnd = new Date(booking.check_out);

      return start < bookedEnd && end > bookedStart;
    });
  }

  const handleReserveClick = () => {
    setError("");

    if (!user) {
      setShowAuthModal(true);
      showToast("Please log in to continue booking.", "info");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select both dates.");
      return;
    }

    if (guests > listing.max_guests) {
      setError(`Maximum ${listing.max_guests} guests allowed.`);
      return;
    }

    if (nights <= 0) {
      setError("Invalid stay duration.");
      return;
    }

    if (isUnavailable()) {
      setError("Selected dates are unavailable.");
      return;
    }

    // Prefill mock card name
    setCardName(user.name);
    setShowCheckoutModal(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/bookings", {
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });

      showToast("🎉 Booking confirmed! Have a great trip.", "success");
      setShowCheckoutModal(false);
      setCheckIn("");
      setCheckOut("");
      setGuests(1);
      
      // Navigate to trips page
      router.push("/trips");
    } catch (err) {
      setError(getErrorMessage(err));
      showToast("Booking failed: " + getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside className="reservation">
        <div className="rate">
          <strong>
            ₹{listing.price_per_night.toLocaleString("en-IN")}
          </strong>{" "}
          night
          <span>
            ★ {listing.rating || "New"}
          </span>
        </div>

        <div className="date-box">
          <div>
            <b>CHECK-IN</b>
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div>
            <b>CHECK-OUT</b>
            <input
              type="date"
              value={checkOut}
              min={checkIn || new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div className="guests">
            <b>GUESTS</b>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            >
              {Array.from(
                { length: listing.max_guests },
                (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? "guest" : "guests"}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <button
          className="reserve"
          onClick={handleReserveClick}
          disabled={loading}
        >
          {!user ? "Log In to Reserve" : "Reserve"}
        </button>

        {error && (
          <p className="booking-error-text" style={{ color: "red", marginTop: 10, fontSize: "14px" }}>
            {error}
          </p>
        )}

        {nights > 0 && (
          <div className="estimate">
            <span>
              ₹{listing.price_per_night.toLocaleString("en-IN")} × {nights} nights
            </span>
            <span>
              ₹{total.toLocaleString("en-IN")}
            </span>

            <span>Service fee</span>
            <span>₹{serviceFee.toLocaleString("en-IN")}</span>

            <strong>Total</strong>
            <strong>
              ₹{grandTotal.toLocaleString("en-IN")}
            </strong>
          </div>
        )}
      </aside>

      {/* Auth Modal Trigger */}
      {showAuthModal && (
        <AuthModal
          initialMode="login"
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Mock Checkout Modal */}
      {showCheckoutModal && (
        <div className="auth-overlay" onClick={() => setShowCheckoutModal(false)} role="dialog" aria-modal="true">
          <div className="auth-modal checkout-modal" onClick={(e) => e.stopPropagation()}>
            <header className="auth-modal-header">
              <button className="auth-close-button" onClick={() => setShowCheckoutModal(false)}>
                ✕
              </button>
              <h2>Confirm and Pay</h2>
            </header>

            <div className="checkout-summary">
              <h3>Booking Summary</h3>
              <div className="summary-row">
                <span>Property:</span>
                <strong>{listing.title}</strong>
              </div>
              <div className="summary-row">
                <span>Location:</span>
                <span>{listing.city}, {listing.country}</span>
              </div>
              <div className="summary-row">
                <span>Dates:</span>
                <span>{checkIn} to {checkOut}</span>
              </div>
              <div className="summary-row">
                <span>Nights:</span>
                <span>{nights}</span>
              </div>
              <div className="summary-row">
                <span>Guests:</span>
                <span>{guests} guest{guests > 1 ? "s" : ""}</span>
              </div>
              <hr />
              <div className="summary-row">
                <span>Accommodation:</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="summary-row">
                <span>Service Fee:</span>
                <span>₹{serviceFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="summary-row total-row">
                <strong>Grand Total:</strong>
                <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="checkout-form">
              <h3>Payment Details (Mock)</h3>
              
              <div className="auth-field">
                <label>Name on Card</label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 1234 5678"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  required
                />
              </div>

              <div className="checkout-row">
                <div className="auth-field">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label>CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="reserve mt-4"
                disabled={loading}
                style={{ margin: "16px 0 0" }}
              >
                {loading ? "Processing..." : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}