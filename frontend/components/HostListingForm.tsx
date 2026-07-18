"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/services/api";
import { Listing } from "@/types";
import { useToast } from "@/context/ToastContext";

type Props = {
  listing: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function HostListingForm({
  listing,
  onClose,
  onSuccess,
}: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    country: "",
    category: "",
    price_per_night: 1000,
    max_guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    image_url: "",
    amenities: "",
  });

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title,
        description: listing.description,
        city: listing.city,
        country: listing.country,
        category: listing.category,
        price_per_night: listing.price_per_night,
        max_guests: listing.max_guests,
        bedrooms: listing.bedrooms,
        beds: listing.beds,
        bathrooms: listing.bathrooms,
        image_url: listing.image_url,
        amenities: listing.amenities,
      });
    }
  }, [listing]);

  const change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price_per_night" ||
        name === "max_guests" ||
        name === "bedrooms" ||
        name === "beds" ||
        name === "bathrooms"
          ? Number(value)
          : value,
    }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (listing) {
        await api.put(`/listings/host/${listing.id}`, form);
        showToast("Listing updated successfully!", "success");
      } else {
        await api.post("/listings/host", form);
        showToast("Listing created successfully!", "success");
      }
      onSuccess();
    } catch (error) {
      showToast("Operation failed: " + getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 12,
        marginBottom: 30,
      }}
    >
      <h2>
        {listing ? "Edit Listing" : "Add Listing"}
      </h2>

      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 12,
        }}
      >
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={change}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={change}
          required
        />

        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={change}
          required
        />

        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={change}
          required
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={change}
          required
        />

        <input
          type="number"
          name="price_per_night"
          placeholder="Price"
          value={form.price_per_night}
          onChange={change}
        />

        <input
          type="number"
          name="max_guests"
          placeholder="Guests"
          value={form.max_guests}
          onChange={change}
        />

        <input
          type="number"
          name="bedrooms"
          placeholder="Bedrooms"
          value={form.bedrooms}
          onChange={change}
        />

        <input
          type="number"
          name="beds"
          placeholder="Beds"
          value={form.beds}
          onChange={change}
        />

        <input
          type="number"
          name="bathrooms"
          placeholder="Bathrooms"
          value={form.bathrooms}
          onChange={change}
        />

        <input
          name="image_url"
          placeholder="Image URL"
          value={form.image_url}
          onChange={change}
        />

        <input
          name="amenities"
          placeholder="Amenities"
          value={form.amenities}
          onChange={change}
        />

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <button
            className="button"
            type="submit"
          >
            {listing ? "Update" : "Create"}
          </button>

          <button
            type="button"
            className="button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}