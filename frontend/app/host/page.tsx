"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { HostListingForm } from "@/components/HostListingForm";
import { api, getErrorMessage } from "@/services/api";
import { Listing } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

type GuestSummary = {
  id: number;
  name: string;
  email: string;
};

type ListingSummary = {
  id: number;
  title: string;
  city: string;
  country: string;
  image_url: string;
  price_per_night: number;
};

type HostBooking = {
  id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  listing: ListingSummary;
  guest: GuestSummary;
};

export default function HostPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const loadListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const response = await api.get<Listing[]>("/listings/host");
      setListings(response.data);
    } catch (error) {
      console.error(error);
      showToast("Could not load host listings.", "error");
    } finally {
      setLoadingListings(false);
    }
  }, [showToast]);

  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const response = await api.get<HostBooking[]>("/bookings/host");
      setBookings(response.data);
    } catch (error) {
      console.error(error);
      showToast("Could not load listing reservations.", "error");
    } finally {
      setLoadingBookings(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user && user.is_host) {
      loadListings();
      loadBookings();
    }
  }, [user, loadListings, loadBookings]);

  async function deleteListing(id: number) {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await api.delete(`/listings/host/${id}`);
      showToast("Listing deleted successfully.", "success");
      loadListings();
    } catch (error) {
      showToast("Failed to delete listing: " + getErrorMessage(error), "error");
    }
  }

  async function cancelBooking(bookingId: number) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.patch(`/bookings/${bookingId}/status`, null, {
        params: { status: "cancelled" }
      });
      showToast("Booking cancelled successfully.", "success");
      loadBookings();
    } catch (error) {
      showToast("Could not cancel booking: " + getErrorMessage(error), "error");
    }
  }

  const handleBecomeHost = async () => {
    try {
      await api.post("/auth/become-host");
      await refreshUser();
      showToast("Congratulations! You are now an Airbnb host.", "success");
    } catch (error) {
      showToast("Could not register as host.", "error");
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <main className="container content text-center" style={{ padding: "100px 0" }}>
          <h2>Host Dashboard</h2>
          <p style={{ color: "var(--subtle)", marginBottom: 20 }}>
            Please log in or sign up to access your hosting dashboard.
          </p>
        </main>
      </>
    );
  }

  if (!user.is_host) {
    return (
      <>
        <Header />
        <main className="container content text-center" style={{ padding: "100px 0" }}>
          <h2>Become a Host</h2>
          <p style={{ color: "var(--subtle)", marginBottom: 25, maxWidth: "500px", marginInline: "auto" }}>
            Earn money by sharing your spare space with travelers from around the world. Host your home on Airbnb!
          </p>
          <button className="button" onClick={handleBecomeHost} style={{ fontSize: "16px", padding: "12px 24px" }}>
            Airbnb your home
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="container content">
        {/* Listings Section */}
        <section style={{ marginBottom: 60 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <h1>Host Dashboard</h1>

            <button
              className="button"
              onClick={() => {
                setEditingListing(null);
                setShowForm(true);
              }}
            >
              + Add Listing
            </button>
          </div>

          {showForm && (
            <HostListingForm
              listing={editingListing}
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                loadListings();
              }}
            />
          )}

          {loadingListings && <p>Loading listings...</p>}

          {!loadingListings && listings.length === 0 && (
            <div className="empty">
              <h2>No properties listed yet</h2>
              <p>Get started by listing your first stay!</p>
            </div>
          )}

          <div className="listing-grid">
            {listings.map((listing) => (
              <div key={listing.id} className="host-listing-wrapper">
                <ListingCard listing={listing} />

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <button
                    className="button"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setEditingListing(listing);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="button"
                    style={{ flex: 1, backgroundColor: "#fff", color: "#e61e4d", border: "1px solid #e61e4d" }}
                    onClick={() => deleteListing(listing.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reservations Section */}
        <section style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 20 }}>Stays Booked on your Properties</h2>

          {loadingBookings && <p>Loading bookings...</p>}

          {!loadingBookings && bookings.length === 0 && (
            <p style={{ color: "var(--subtle)" }}>No bookings recorded yet for your properties.</p>
          )}

          {!loadingBookings && bookings.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="reservations-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Guest</th>
                    <th>Dates</th>
                    <th>Guests</th>
                    <th>Earnings</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.listing.title}</strong>
                        <br />
                        <span style={{ fontSize: "12px", color: "var(--subtle)" }}>
                          {booking.listing.city}, {booking.listing.country}
                        </span>
                      </td>
                      <td>
                        <strong>{booking.guest.name}</strong>
                        <br />
                        <span style={{ fontSize: "12px", color: "var(--subtle)" }}>
                          {booking.guest.email}
                        </span>
                      </td>
                      <td>
                        {booking.check_in} to {booking.check_out}
                      </td>
                      <td>{booking.guests} guest{booking.guests > 1 ? "s" : ""}</td>
                      <td>₹{booking.total_price.toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="cancel-booking-btn"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
