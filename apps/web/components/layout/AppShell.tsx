"use client";

import {
  Bell,
  Palette,
  Plus,
  Search,
  Sun,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

import MobileNav from "./MobileNav";
import RightPanel from "./RightPanel";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
];

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "aio-theme";
const THEME_EVENT = "aio-theme-change";

function isAuthRoute(
  pathname: string,
): boolean {
  return AUTH_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTheme =
    window.localStorage.getItem(
      THEME_STORAGE_KEY,
    );

  if (
    storedTheme === "light" ||
    storedTheme === "dark"
  ) {
    return storedTheme;
  }

  return null;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  const documentTheme =
    document.documentElement.dataset.theme;

  if (
    documentTheme === "light" ||
    documentTheme === "dark"
  ) {
    return documentTheme;
  }

  return (
    getStoredTheme() ??
    getSystemTheme()
  );
}

function getServerTheme(): Theme {
  return "light";
}

function subscribeToTheme(
  callback: () => void,
) {
  window.addEventListener(
    THEME_EVENT,
    callback,
  );

  return () => {
    window.removeEventListener(
      THEME_EVENT,
      callback,
    );
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme =
    theme;

  document.documentElement.style.colorScheme =
    theme;
}

function notifyThemeChange() {
  window.dispatchEvent(
    new Event(THEME_EVENT),
  );
}

export default function AppShell({
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const isMessagesRoute =
    pathname === "/messages" ||
    pathname.startsWith("/messages/");

  const theme = useSyncExternalStore(
    subscribeToTheme,
    getCurrentTheme,
    getServerTheme,
  );

  const darkMode =
    theme === "dark";

  useEffect(() => {
    const storedTheme =
      getStoredTheme();

    const initialTheme =
      storedTheme ??
      getSystemTheme();

    applyTheme(initialTheme);
    notifyThemeChange();

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    function handleSystemThemeChange(
      event: MediaQueryListEvent,
    ) {
      if (getStoredTheme()) {
        return;
      }

      const nextTheme: Theme =
        event.matches
          ? "dark"
          : "light";

      applyTheme(nextTheme);
      notifyThemeChange();
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange,
      );
    };
  }, []);

  const toggleTheme =
    useCallback(() => {
      const currentTheme =
        getCurrentTheme();

      const nextTheme: Theme =
        currentTheme === "dark"
          ? "light"
          : "dark";

      applyTheme(nextTheme);

      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextTheme,
      );

      notifyThemeChange();
    }, []);

  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="aio-app">
      <div className="aio-template-shell">
        {/* Desktop / tablet sidebar */}
        <Sidebar />

        {/* Main application area */}
        <div className="aio-workspace">
          {/* Mobile header */}
          <header className="aio-mobile-topbar">
            <Link
              href="/stream"
              className="aio-mobile-logo"
              aria-label="AIO home"
            >
              AIO
            </Link>

            <div className="aio-mobile-topbar-actions">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                title={
                  darkMode
                    ? "Light mode"
                    : "Dark mode"
                }
              >
                {darkMode ? (
                  <Sun size={20} />
                ) : (
                  <Palette size={20} />
                )}
              </button>

              <Link
                href="/discover"
                aria-label="Search"
                title="Search"
              >
                <Search size={20} />
              </Link>

              <Link
                href="/notifications"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={20} />
              </Link>
            </div>
          </header>

          {/* Desktop header */}
          <header className="aio-topbar">
            <div className="aio-topbar-inner">
              <Link
                href="/discover"
                className="aio-global-search"
                aria-label="Search AIO"
              >
                <Search
                  size={20}
                  aria-hidden="true"
                />

                <span>
                  Search people, spaces,
                  moments...
                </span>
              </Link>

              <Link
                href="/stream?create=1"
                className="aio-topbar-action"
                aria-label="Create"
                title="Create"
              >
                <Plus
                  size={23}
                  strokeWidth={2}
                />
              </Link>

              <button
                type="button"
                className="aio-topbar-action"
                onClick={toggleTheme}
                aria-label={
                  darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                title={
                  darkMode
                    ? "Light mode"
                    : "Dark mode"
                }
              >
                {darkMode ? (
                  <Sun size={20} />
                ) : (
                  <Palette size={20} />
                )}
              </button>

              <Link
                href="/notifications"
                className="aio-topbar-action aio-topbar-notifications"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell
                  size={20}
                  strokeWidth={1.9}
                />
              </Link>

              <Link
                href="/profile"
                className="aio-topbar-avatar"
                aria-label="Profile"
                title="Profile"
              >
                <span className="aio-topbar-avatar-inner">
                  <span className="aio-topbar-avatar-dot" />
                </span>
              </Link>
            </div>
          </header>

          {/* Main desktop/tablet content */}
          <main className="aio-workspace-main">
            <div
            className={`aio-workspace-inner${
              isMessagesRoute
                ? " aio-workspace-inner--messages"
                : ""
            }`}
          >
            <div className="aio-workspace-content">
              {children}
            </div>

            {!isMessagesRoute && <RightPanel />}
          </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}