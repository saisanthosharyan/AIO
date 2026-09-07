"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Compass,
  Film,
  Home,
  Layers3,
  Plus,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const navigation: NavigationItem[] = [
  {
    label: "Stream",
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
    label: "Clips",
    href: "/clips",
    icon: Film,
  },
  {
    label: "Spaces",
    href: "/spaces",
    icon: Layers3,
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
        <Link
          href="/stream"
          className="aio-wordmark"
          aria-label="AIO home"
        >
          <span
            className="aio-mark"
            aria-hidden="true"
          >
            <Sparkles size={18} />
          </span>

          <span className="aio-wordmark-text">
            AIO
          </span>
        </Link>

        <nav
          className="aio-sidebar-nav"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(
              pathname,
              item.href,
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`aio-nav-item${
                  active ? " is-active" : ""
                }`}
                aria-current={
                  active ? "page" : undefined
                }
              >
                <span
                  className="aio-nav-icon"
                  aria-hidden="true"
                >
                  <Icon
                    size={20}
                    strokeWidth={
                      active ? 2.3 : 2
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

        <div className="aio-sidebar-bottom">
          <Link
            href="/stream?create=1"
            className="aio-create-button"
          >
            <Plus size={19} />

            <span>Create</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}