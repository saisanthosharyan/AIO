"use client";

import {
  Moon,
  Sun,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

import MobileNav from "./MobileNav";
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
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const storedTheme =
    window.localStorage.getItem(
      THEME_STORAGE_KEY,
    );

  if (
    storedTheme === "dark" ||
    storedTheme === "light"
  ) {
    return storedTheme;
  }

  return null;
}

function getSystemTheme(): Theme {
  if (
    typeof window === "undefined"
  ) {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

function getCurrentTheme(): Theme {
  if (
    typeof document === "undefined"
  ) {
    return "light";
  }

  const documentTheme =
    document.documentElement
      .dataset.theme;

  if (
    documentTheme === "dark" ||
    documentTheme === "light"
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

function applyTheme(
  theme: Theme,
) {
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

  const theme = useSyncExternalStore(
    subscribeToTheme,
    getCurrentTheme,
    getServerTheme,
  );

  const darkMode = theme === "dark";

  useEffect(() => {
    const storedTheme =
      getStoredTheme();

    const initialTheme =
      storedTheme ??
      getSystemTheme();

    applyTheme(initialTheme);

    notifyThemeChange();

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

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

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
      <Sidebar />

      <div className="aio-workspace">
        <header className="aio-topbar">
          <div className="aio-topbar-inner">
            <div className="aio-topbar-title">
              <span className="aio-topbar-mobile-logo">
                AIO
              </span>
            </div>

            <button
              type="button"
              className="aio-theme-toggle"
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
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </div>
        </header>

        <main className="aio-workspace-main">
          <div className="aio-workspace-inner">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}