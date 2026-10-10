
"use client";

import {
  Bell,
  Bookmark,
  Compass,
  Film,
  Home,
  Layers3,
  Mail,
  Plus,
  Settings2,
  UserRound,
  Workflow,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface MobileNavProps {
  menuOpen: boolean;
  onMenuChange: (open: boolean) => void;
}

const bottomNavigation = [
  { label: "Home", href: "/stream", icon: Home },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Messages", href: "/messages", icon: Mail },
  { label: "Profile", href: "/profile", icon: UserRound },
];

const drawerNavigation = [
  { label: "Home", href: "/stream", icon: Home },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Flow", href: "/flow", icon: Workflow },
  { label: "Messages", href: "/messages", icon: Mail },
  { label: "Spaces", href: "/spaces", icon: Layers3 },
  { label: "Clips", href: "/clips", icon: Film },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/settings", icon: Settings2 },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/stream") {
    return pathname === "/" || pathname === "/stream";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileNav({
  menuOpen,
  onMenuChange,
}: MobileNavProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMenuChange(false);
      }
    };

    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen, onMenuChange]);

  useEffect(() => {
    if (menuOpen) {
      onMenuChange(false);
    }
    // Close the drawer when navigating to another route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <nav
        className="aio-mobile-nav aio-canvas-bottom-nav"
        aria-label="Mobile bottom navigation"
      >
        {bottomNavigation.slice(0, 2).map(
          ({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`aio-mobile-nav-item${
                isActivePath(pathname, href) ? " is-active" : ""
              }`}
              aria-current={
                isActivePath(pathname, href) ? "page" : undefined
              }
            >
              <Icon size={21} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ),
        )}

        <Link
          href="/stream?create=1"
          className="aio-mobile-create"
          aria-label="Create post"
          onClick={() => onMenuChange(false)}
        >
          <Plus size={25} aria-hidden="true" />
        </Link>

        {bottomNavigation.slice(2).map(
          ({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`aio-mobile-nav-item${
                isActivePath(pathname, href) ? " is-active" : ""
              }`}
              aria-current={
                isActivePath(pathname, href) ? "page" : undefined
              }
            >
              <Icon size={21} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ),
        )}
      </nav>

      {menuOpen && (
        <div className="aio-mobile-drawer-layer">
          <button
            type="button"
            className="aio-mobile-drawer-backdrop"
            aria-label="Close navigation menu"
            onClick={() => onMenuChange(false)}
          />

          <aside
            className="aio-mobile-drawer"
            aria-label="Mobile navigation drawer"
          >
            <div className="aio-mobile-drawer-header">
              <Link
                href="/stream"
                onClick={() => onMenuChange(false)}
                className="aio-mobile-drawer-brand"
              >
                AIO<span>.</span>
              </Link>

              <button
                type="button"
                className="aio-mobile-drawer-close"
                onClick={() => onMenuChange(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav
              className="aio-mobile-drawer-links"
              aria-label="All AIO pages"
            >
              {drawerNavigation.map(
                ({ label, href, icon: Icon }) => {
                  const active = isActivePath(pathname, href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`aio-mobile-drawer-link${
                        active ? " is-active" : ""
                      }`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => onMenuChange(false)}
                    >
                      <Icon size={19} aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  );
                },
              )}
            </nav>

            <Link
              href="/stream?create=1"
              className="aio-mobile-drawer-create"
              onClick={() => onMenuChange(false)}
            >
              <Plus size={19} />
              Create post
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
