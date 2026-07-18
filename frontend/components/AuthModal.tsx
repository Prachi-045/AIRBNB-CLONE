"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface AuthModalProps {
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ onClose, initialMode = "login" }: AuthModalProps) {
  const { login, signup } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isHost, setIsHost] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        showToast("Logged in successfully!", "success");
      } else {
        await signup(name, email, password, isHost);
        showToast("Registered and logged in successfully!", "success");
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      showToast(err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <header className="auth-modal-header">
          <button className="auth-close-button" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
          <h2>{mode === "login" ? "Log In" : "Sign Up"}</h2>
        </header>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log In
          </button>
          <button
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {mode === "signup" && (
            <div className="auth-field">
              <label htmlFor="name-input">Full Name</label>
              <input
                id="name-input"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "signup" && (
            <div className="auth-checkbox">
              <input
                id="host-checkbox"
                type="checkbox"
                checked={isHost}
                onChange={(e) => setIsHost(e.target.checked)}
              />
              <label htmlFor="host-checkbox">I want to host my home on Airbnb</label>
            </div>
          )}

          <button type="submit" className="auth-submit-button" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          {mode === "login" ? (
            <p>
              New to Airbnb?{" "}
              <button className="auth-toggle-link" onClick={() => setMode("signup")}>
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button className="auth-toggle-link" onClick={() => setMode("login")}>
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
