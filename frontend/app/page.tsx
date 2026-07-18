"use client";

import { useEffect, useState, useCallback } from "react";
import { CategoryRail } from "@/components/CategoryRail";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { api } from "@/services/api";
import { Listing } from "@/types";

const PAGE_SIZE = 8;

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("");
  const [guests, setGuests] = useState("");
  
  // Search inputs
  const [searchCity, setSearchCity] = useState("");
  const [searchGuests, setSearchGuests] = useState("");
  
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const fetchListings = useCallback(async (currentOffset: number, append: boolean = false) => {
    if (currentOffset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError("");

    try {
      const params: any = {
        limit: PAGE_SIZE,
        offset: currentOffset,
      };

      if (category !== "All") {
        params.category = category;
      }
      if (city.trim()) {
        params.city = city.trim();
      }
      if (guests && Number(guests) > 0) {
        params.guests = Number(guests);
      }

      const response = await api.get<Listing[]>("/listings", { params });
      const newListings = response.data;

      if (append) {
        setListings((prev) => [...prev, ...newListings]);
      } else {
        setListings(newListings);
      }

      setHasMore(newListings.length === PAGE_SIZE);
    } catch (err) {
      setError("We couldn’t load homes right now. Make sure the local API is running.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, city, guests]);

  // Refetch when filters change
  useEffect(() => {
    setOffset(0);
    fetchListings(0, false);
  }, [category, city, guests, fetchListings]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCity(searchCity);
    setGuests(searchGuests);
  };

  const handleClearFilters = () => {
    setSearchCity("");
    setSearchGuests("");
    setCity("");
    setGuests("");
    setCategory("All");
  };

  const handleLoadMore = () => {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
    fetchListings(nextOffset, true);
  };

  return (
    <>
      <Header />
      <CategoryRail active={category} onChange={setCategory} />

      <main className="container content" id="homes">
        {/* Search Panel */}
        <section className="search-panel">
          <form onSubmit={handleSearchSubmit} className="search-filter-form">
            <div className="search-input-group">
              <span className="search-icon-label">📍</span>
              <input
                type="text"
                placeholder="Where are you going?"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="search-input-field"
              />
            </div>

            <div className="search-input-group">
              <span className="search-icon-label">👤</span>
              <select
                value={searchGuests}
                onChange={(e) => setSearchGuests(e.target.value)}
                className="search-input-select"
              >
                <option value="">Add guests</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>

            <div className="search-actions">
              <button type="submit" className="search-submit-btn">
                Search
              </button>
              {(city || guests || category !== "All") && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="search-clear-btn"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>

        {error && <p className="error">{error}</p>}

        {loading && (
          <div className="loading-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="skeleton" key={index} />
            ))}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="empty">
            <h2>No homes found</h2>
            <p>Try clearing your search filters to explore more stays.</p>
            <button onClick={handleClearFilters} className="button mt-4">
              Reset All Filters
            </button>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <>
            <div className="listing-grid">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {hasMore && (
              <div className="load-more-container">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="button load-more-btn"
                >
                  {loadingMore ? "Loading more homes..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

