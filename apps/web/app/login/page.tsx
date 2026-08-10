"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="auth-page">
      <div className="auth-background">
        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />
        <div className="auth-glow" />
      </div>

      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <Sparkles size={18} />
          </div>

          <span>AIO</span>
        </div>

        <div className="auth-heading">
          <span className="eyebrow">WELCOME BACK</span>

          <h1>
            Everything starts
            <br />
            <span>with you.</span>
          </h1>

          <p>
            Connect, create, discover and communicate
            in one intelligent space.
          </p>
        </div>

        <form className="auth-form">
          <div className="field">
            <label htmlFor="email">
              Email or username
            </label>

            <input
              id="email"
              type="text"
              placeholder="you@example.com"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="password">
                Password
              </label>

              <Link href="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit">
            <span>Enter AIO</span>

            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button type="button">
            Google
          </button>

          <button type="button">
            Apple
          </button>
        </div>

        <p className="auth-footer">
          New to AIO?{" "}
          <Link href="/signup">
            Create your space
          </Link>
        </p>
      </section>
    </main>
  );
}