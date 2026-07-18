"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getErrorMessage } from "@/services/api";

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  is_host: boolean;
};

interface AuthContextProps {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, isHost: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (authToken: string) => {
    try {
      const response = await api.get<UserProfile>("/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // If token is invalid or expired, clear it
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      await fetchUserProfile(storedToken);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post<{ access_token: string }>("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const newToken = response.data.access_token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      await fetchUserProfile(newToken);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, isHost: boolean) => {
    setLoading(true);
    try {
      const response = await api.post<{ access_token: string }>("/auth/signup", {
        name,
        email,
        password,
        is_host: isHost,
      });

      const newToken = response.data.access_token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      await fetchUserProfile(newToken);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
