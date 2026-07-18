"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { api } from "@/services/api";

type Trip = {
  id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  listing: {
    id: number;
    title: string;
    city: string;
    country: string;
    image_url: string;
    price_per_night: number;
  };
};

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    api
      .get<Trip[]>("/bookings/my-trips", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setTrips(response.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load your trips.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />

      <main className="container content">
        <h1 style={{ marginBottom: 30 }}>My Trips</h1>

        {loading && <p>Loading...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && trips.length === 0 && (
          <div className="empty">
            <h2>No trips yet</h2>
            <p>Your bookings will appear here.</p>
          </div>
        )}

        {!loading &&
          !error &&
          trips.map((trip) => (
            <div className="trip-card" key={trip.id}>
              <img
                src={trip.listing.image_url}
                alt={trip.listing.title}
                className="trip-image"
              />

              <div className="trip-info">
                <h2>{trip.listing.title}</h2>

                <p>
                  📍 {trip.listing.city}, {trip.listing.country}
                </p>

                <p>
                  <strong>Check-in:</strong> {trip.check_in}
                </p>

                <p>
                  <strong>Check-out:</strong> {trip.check_out}
                </p>

                <p>
                  <strong>Guests:</strong> {trip.guests}
                </p>

                <p>
                  <strong>Total Paid:</strong> ₹
                  {trip.total_price.toLocaleString("en-IN")}
                </p>

                <span className="trip-status">{trip.status}</span>
              </div>
            </div>
          ))}
      </main>
    </>
  );
}