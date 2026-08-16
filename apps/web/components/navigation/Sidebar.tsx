"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bookmark,
  Compass,
  Home,
  MessageCircle,
  MoreHorizontal,
  Settings,
  Users,
  Video,
} from "lucide-react";

const primaryNavigation = [
  {
    label: "Stream",
    href: "/stream",
    icon: Home,
  },
  {
    label: "Flow",
    href: "/flow",
    icon: MessageCircle,
  },
  {
    label: "Discover",
    href: "/discover",
    icon: Compass,
  },
  {
    label: "Spaces",
    href: "/spaces",
    icon: Users,
  },
  {
    label: "Clips",
    href: "/clips",
    icon: Video,
  },
];

const secondaryNavigation = [
  {
    label: "Saved",
    href: "/saved",
    icon: Bookmark,
  },
  {
    label: "Activity",
    href: "/notifications",
    icon: Activity,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/stream") {
      return pathname === "/stream" || pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <aside className="aio-sidebar">
      <div className="sidebar-content">
        {/* PRIMARY NAVIGATION */}
        <nav className="main-nav" aria-label="Primary navigation">
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={1.8} />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        {/* SECONDARY NAVIGATION */}
        <nav className="secondary-nav" aria-label="Secondary navigation">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={19} strokeWidth={1.8} />

                <span>{item.label}</span>

                {item.label === "Activity" && (
                  <span
                    className="notification-dot"
                    aria-label="New activity"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        {/* SETTINGS */}
        <Link
          href="/settings"
          className={`nav-item settings-item ${
            isActive("/settings") ? "active" : ""
          }`}
          aria-current={isActive("/settings") ? "page" : undefined}
        >
          <Settings size={19} strokeWidth={1.8} />

          <span>Settings</span>
        </Link>

        {/* PROFILE */}
        <div className="sidebar-bottom">
          <Link
            href="/profile"
            className="profile-mini"
            aria-label="Open profile"
          >
            <div className="avatar avatar-small">SA</div>

            <div className="profile-mini-info">
              <strong>Santhosh</strong>
              <span>@santhosh</span>
            </div>

            <MoreHorizontal size={18} />
          </Link>
        </div>
      </div>
    </aside>
  );
}