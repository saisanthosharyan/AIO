
"use client";

import {
  Bell,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  Film,
  Home,
  Layers3,
  Mail,
  Plus,
  Settings2,
  UserRound,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
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

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(
        window.sessionStorage.getItem("aio-sidebar-collapsed") === "true",
      );
    } catch {
      // Session storage may be unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "aio-sidebar-collapsed",
      collapsed,
    );

    try {
      window.sessionStorage.setItem(
        "aio-sidebar-collapsed",
        String(collapsed),
      );
    } catch {
      // Session storage may be unavailable.
    }

    return () => {
      document.documentElement.classList.remove(
        "aio-sidebar-collapsed",
      );
    };
  }, [collapsed]);

  return (
    <aside
      className={`aio-canvas-sidebar${
        collapsed ? " is-collapsed" : ""
      }`}
      aria-label="AIO navigation"
    >
      <div className="aio-canvas-sidebar-inner">
        <div className="aio-sidebar-brand-row">
          <Link
            href="/stream"
            className="aio-canvas-brand"
            aria-label="AIO home"
            title="AIO home"
          >
            <span className="aio-sidebar-brand-text">AIO</span>
            <span className="aio-canvas-brand-dot" />
          </Link>

          <button
            type="button"
            className="aio-sidebar-collapse-button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={
              collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={17} />
            ) : (
              <ChevronLeft size={17} />
            )}
          </button>
        </div>

        <nav
          className="aio-canvas-nav"
          aria-label="Primary navigation"
        >
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                className={`aio-canvas-nav-link${
                  active ? " is-active" : ""
                }`}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
                title={collapsed ? label : undefined}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                <span className="aio-sidebar-link-label">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/stream?create=1"
          className="aio-canvas-create"
          aria-label={collapsed ? "Create post" : undefined}
          title={collapsed ? "Create post" : undefined}
        >
          <Plus
            size={19}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="aio-sidebar-create-label">
            Create
          </span>
        </Link>
      </div>
    </aside>
  );
}
