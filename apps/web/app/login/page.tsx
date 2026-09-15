"use client";

import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed",
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

      router.push("/stream");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration">
        <div className="auth-decoration-circle auth-decoration-circle-one" />
        <div className="auth-decoration-circle auth-decoration-circle-two" />
      </div>

      <section className="auth-card">
        <Link
          href="/"
          className="auth-brand"
          aria-label="AIO home"
        >
          <span className="auth-brand-mark">
            <Sparkles size={17} />
          </span>

          <span>AIO</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-eyebrow">
            WELCOME BACK
          </span>

          <h1>
            Everything starts
            <br />
            <span>with you.</span>
          </h1>

          <p>
            Connect, create, discover and
            communicate in one intelligent
            space.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >
          <div className="auth-field">
            <label htmlFor="email">
              Email or username
            </label>

            <input
              id="email"
              type="text"
              placeholder="you@example.com"
              autoComplete="username"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-label">
              <label htmlFor="password">
                Password
              </label>

              <Link href="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <div className="auth-password">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
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

          {error && (
            <div className="aio-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            <span>
              {loading
                ? "Signing in..."
                : "Enter AIO"}
            </span>

            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="auth-social">
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
