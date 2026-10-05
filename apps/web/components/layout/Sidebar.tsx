"use client";

import {
  Bell,
  Compass,
  Film,
  Home,
  Layers3,
  Mail,
  Plus,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const navigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/stream",
    icon: Home,
  },
  {
    label: "Discover",
    href: "/discover",
    icon: Compass,
  },
  {
    label: "Flow",
    href: "/flow",
    icon: Workflow,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: Mail,
  },
  {
    label: "Spaces",
    href: "/spaces",
    icon: Layers3,
  },
  {
    label: "Clips",
    href: "/clips",
    icon: Film,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: UserRound,
  },
];

function isActivePath(
  pathname: string,
  href: string,
): boolean {
  if (href === "/stream") {
    return (
      pathname === "/" ||
      pathname === "/stream"
    );
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="aio-sidebar"
      aria-label="AIO navigation"
    >
      <div className="aio-sidebar-inner">
        {/* Brand */}
        <div className="aio-sidebar-brand-row">
          <Link
            href="/stream"
            className="aio-wordmark"
            aria-label="AIO home"
          >
            <span className="aio-wordmark-text">
              AIO
            </span>
          </Link>

          <span
            className="aio-sidebar-brand-spark"
            aria-hidden="true"
          >
            <Sparkles
              size={20}
              strokeWidth={1.9}
            />
          </span>
        </div>

        {/* Primary navigation */}
        <nav
          className="aio-sidebar-nav"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              isActivePath(
                pathname,
                item.href,
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`aio-nav-item${
                  active
                    ? " is-active"
                    : ""
                }`}
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
              >
                <span
                  className="aio-nav-icon"
                  aria-hidden="true"
                >
                  <Icon
                    size={22}
                    strokeWidth={
                      active
                        ? 2.1
                        : 1.8
                    }
                  />
                </span>

                <span className="aio-nav-label">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom area */}
        <div className="aio-sidebar-bottom">
          <Link
            href="/stream?create=1"
            className="aio-create-button"
          >
            <Plus
              size={19}
              strokeWidth={2}
            />

            <span>
              Create
            </span>
          </Link>

          <Link
            href="/profile"
            className="aio-sidebar-user"
            aria-label="View profile"
          >
            <span
              className="aio-sidebar-user-avatar"
              aria-hidden="true"
            >
              <UserRound
                size={18}
                strokeWidth={1.9}
              />
            </span>

            <span className="aio-sidebar-user-copy">
              <strong>
                Your profile
              </strong>

              <small>
                View profile
              </small>
            </span>
          </Link>

          <div className="aio-premium-card">
            <span
              className="aio-premium-icon"
              aria-hidden="true"
            >
              <Sparkles
                size={16}
                strokeWidth={1.9}
              />
            </span>

            <span className="aio-premium-copy">
              <strong>
                AIO Premium
              </strong>

              <small>
                Explore Premium Benefits
              </small>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}