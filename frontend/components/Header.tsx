"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AuthModal } from "./AuthModal";
import { api } from "@/services/api";
import {
  GlobeIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./icons";

export function Header() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { showToast } = useToast();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBecomeHost = async () => {
    if (!user) {
      setAuthMode("signup");
      setShowAuthModal(true);
      showToast("Please sign up to become a host!", "info");
      return;
    }

    if (user.is_host) {
      router.push("/host");
      return;
    }

    try {
      await api.post("/auth/become-host");
      await refreshUser();
      showToast("Congratulations! You are now a host.", "success");
      router.push("/host");
    } catch (error) {
      showToast("Could not activate host mode.", "error");
    }
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully.", "success");
    setShowDropdown(false);
    router.push("/");
  };

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="topbar">
            <Link href="/" className="brand">
              <span className="brand-mark">⌂</span>
              <span>airbnb</span>
            </Link>

            <div className="searchbar" role="search" onClick={() => router.push("/#homes")} style={{ cursor: "pointer" }}>
              <div>Anywhere</div>
              <div>Any week</div>
              <div>Add guests</div>

              <button
                className="search-button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/#homes");
                }}
                aria-label="Search"
              >
                <SearchIcon size={15} />
              </button>
            </div>

            <nav className="profile-links" ref={dropdownRef}>
              <button 
                className="host-link" 
                onClick={handleBecomeHost}
              >
                {user?.is_host ? "Host Dashboard" : "Airbnb your home"}
              </button>

              <GlobeIcon size={18} />

              <div className="profile-menu-container">
                <button
                  className="profile-menu"
                  aria-label="User menu"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <MenuIcon size={17} />

                  <span className="avatar">
                    {user ? (
                      <span className="avatar-initials">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <UserIcon size={17} />
                    )}
                  </span>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    {user ? (
                      <>
                        <div className="dropdown-welcome">
                          Hello, <strong>{user.name}</strong>
                        </div>
                        <hr />
                        <button
                          onClick={() => {
                            router.push("/trips");
                            setShowDropdown(false);
                          }}
                        >
                          My Trips
                        </button>
                        <button
                          onClick={() => {
                            router.push("/wishlist");
                            setShowDropdown(false);
                          }}
                        >
                          Wishlist
                        </button>
                        <button
                          onClick={() => {
                            handleBecomeHost();
                            setShowDropdown(false);
                          }}
                        >
                          {user.is_host ? "Host Listings" : "Become a Host"}
                        </button>
                        <hr />
                        <button onClick={handleLogout} className="logout-btn">
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="font-semibold"
                          onClick={() => {
                            setAuthMode("signup");
                            setShowAuthModal(true);
                            setShowDropdown(false);
                          }}
                        >
                          Sign Up
                        </button>
                        <button
                          onClick={() => {
                            setAuthMode("login");
                            setShowAuthModal(true);
                            setShowDropdown(false);
                          }}
                        >
                          Log In
                        </button>
                        <hr />
                        <button onClick={handleBecomeHost}>
                          Airbnb your home
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}