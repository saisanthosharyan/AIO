
"use client";

import {
  Bell,
  Menu,
  Moon,
  Palette,
  Plus,
  Search,
  Sun,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import MobileNav from "./MobileNav";
import RightPanel from "./RightPanel";
import Sidebar from "./Sidebar";
import { useTheme } from "@/components/theme/ThemeProvider";

interface AppShellProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );
}

export default function AppShell({
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const { resolvedAppearance, setAppearance } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const darkMode = resolvedAppearance === "dark";

  const isMessagesRoute =
    pathname === "/messages" ||
    pathname.startsWith("/messages/");

  const toggleTheme = () => {
    setAppearance(darkMode ? "light" : "dark");
  };

  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="aio-app aio-canvas-app">
      <div className="aio-canvas-shell">
        <Sidebar />

        <div className="aio-canvas-workspace">
          <header className="aio-canvas-header">
            <button
              type="button"
              className="aio-canvas-icon-button aio-mobile-menu-trigger"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              title="Menu"
            >
              <Menu size={21} />
            </button>

            <Link
              href="/stream"
              className="aio-canvas-mobile-brand"
              aria-label="AIO home"
            >
              AIO
            </Link>

            <Link
              href="/discover"
              className="aio-canvas-search"
              aria-label="Search AIO"
            >
              <Search size={18} aria-hidden="true" />
              <span>Search people, spaces or topics...</span>
            </Link>

            <div className="aio-canvas-header-actions">
              <Link
                href="/stream?create=1"
                className="aio-canvas-icon-button aio-canvas-header-create"
                aria-label="Create post"
                title="Create post"
              >
                <Plus size={19} />
              </Link>

              <Link
                href="/settings#appearance"
                className="aio-canvas-icon-button aio-canvas-header-palette"
                aria-label="Customize appearance"
                title="Customize appearance"
              >
                <Palette size={18} />
              </Link>

              <button
                type="button"
                className="aio-canvas-icon-button"
                onClick={toggleTheme}
                aria-label={
                  darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? (
                  <Sun size={19} />
                ) : (
                  <Moon size={19} />
                )}
              </button>

              <Link
                href="/notifications"
                className="aio-canvas-icon-button"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={19} />
              </Link>

              <Link
                href="/profile"
                className="aio-canvas-header-profile"
                aria-label="Your profile"
                title="Profile"
              >
                <UserRound size={19} />
              </Link>
            </div>
          </header>

          <main className="aio-canvas-main">
            <div
              className={`aio-canvas-content-grid${
                isMessagesRoute
                  ? " aio-canvas-content-grid--messages"
                  : ""
              }`}
            >
              <div className="aio-canvas-page-content">
                {children}
              </div>

              {!isMessagesRoute && (
                <div className="aio-canvas-right">
                  <RightPanel />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <MobileNav
        menuOpen={mobileMenuOpen}
        onMenuChange={setMobileMenuOpen}
      />
    </div>
  );
}
