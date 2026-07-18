import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000",
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return String(
      error.response?.data?.detail ??
        "Something went wrong. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
}