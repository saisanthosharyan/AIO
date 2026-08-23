"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { FormEvent, useState } from "react";

const benefits = [
  "One identity across every AIO device",
  "Private conversations and communities",
  "Your content, your controls",
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password,
            displayName:
              `${firstName.trim()} ${lastName.trim()}`.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed",
        );
      }

      localStorage.setItem(
        "aio_token",
        data.token,
      );

      localStorage.setItem(
        "aio_user",
        JSON.stringify(data.user),
      );

      window.location.href = "/stream";
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background">
        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />
        <div className="auth-glow" />
      </div>

      <section className="auth-card signup-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <Sparkles size={18} />
          </div>

          <span>AIO</span>
        </div>

        <div className="auth-heading">
          <span className="eyebrow">
            CREATE YOUR IDENTITY
          </span>

          <h1>
            Your world.
            <br />
            <span>One space.</span>
          </h1>

          <p>
            Create your AIO identity and bring your
            conversations, people and interests together.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSignup}
        >
          <div className="signup-name-row">
            <div className="field">
              <label htmlFor="firstName">
                First name
              </label>

              <input
                id="firstName"
                type="text"
                placeholder="Santhosh"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                required
              />
            </div>

            <div className="field">
              <label htmlFor="lastName">
                Last name
              </label>

              <input
                id="lastName"
                type="text"
                placeholder="Aryan"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="username">
              Username
            </label>

            <div className="username-field">
              <span>@</span>

              <input
                id="username"
                type="text"
                placeholder="chooseyourname"
                autoComplete="username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-field">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create a strong password"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value,
                  )
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

          <div className="field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <div className="password-field">
              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password again"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value,
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              style={{
                color: "var(--aio-danger)",
                fontSize: "14px",
                margin: "0",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            <span>
              {loading
                ? "Creating account..."
                : "Create my AIO"}
            </span>

            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-benefits">
          {benefits.map((benefit) => (
            <div
              className="auth-benefit"
              key={benefit}
            >
              <span>
                <Check size={12} />
              </span>

              {benefit}
            </div>
          ))}
        </div>

        <p className="auth-footer">
          Already part of AIO?{" "}
          <Link href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}