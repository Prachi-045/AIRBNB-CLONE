export type Listing = {
  id: number;
  host_id: number;
  title: string;
  description: string;
  city: string;
  country: string;
  category: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  image_url: string;
  amenities: string;
  rating: number;
  review_count: number;
};
