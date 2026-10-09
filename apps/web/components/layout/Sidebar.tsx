
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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="aio-canvas-sidebar" aria-label="AIO navigation">
      <div className="aio-canvas-sidebar-inner">
        <Link
          href="/stream"
          className="aio-canvas-brand"
          aria-label="AIO home"
        >
          AIO
          <span className="aio-canvas-brand-dot" />
        </Link>

        <nav className="aio-canvas-nav" aria-label="Primary navigation">
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
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/stream?create=1"
          className="aio-canvas-create"
        >
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
          <span>Create</span>
        </Link>
      </div>
    </aside>
  );
}
