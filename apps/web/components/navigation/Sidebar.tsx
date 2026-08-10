"use client";

import Link from "next/link";
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
    href: "#",
    icon: Bookmark,
  },
  {
    label: "Activity",
    href: "/notifications",
    icon: Activity,
  },
];

export default function Sidebar() {
  return (
    <aside className="aio-sidebar">
      <div className="sidebar-content">
        <nav className="main-nav" aria-label="Primary navigation">
          {primaryNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-item ${
                  item.label === "Stream" ? "active" : ""
                }`}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        <nav
          className="secondary-nav"
          aria-label="Secondary navigation"
        >
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="nav-item"
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

        <Link href="#" className="nav-item settings-item">
          <Settings size={19} strokeWidth={1.8} />
          <span>Settings</span>
        </Link>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="profile-mini"
            aria-label="Open profile menu"
          >
            <div className="avatar avatar-small">SA</div>

            <div className="profile-mini-info">
              <strong>Santhosh</strong>
              <span>@santhosh</span>
            </div>

            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}