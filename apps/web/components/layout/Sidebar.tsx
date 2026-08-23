"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Stream", href: "/stream", icon: "⌂" },
  { label: "Discover", href: "/discover", icon: "⌕" },
  { label: "Clips", href: "/clips", icon: "▶" },
  { label: "Flow", href: "/flow", icon: "✦" },
  { label: "Spaces", href: "/spaces", icon: "◎" },
  { label: "Notifications", href: "/notifications", icon: "♢" },
  { label: "Profile", href: "/profile", icon: "○" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="aio-sidebar">
      <div className="aio-logo">
        <span className="aio-logo-mark">A</span>
        <span className="aio-logo-text">AIO</span>
      </div>

      <nav className="aio-navigation">
        {navigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`aio-nav-item ${active ? "active" : ""}`}
            >
              <span className="aio-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="aio-sidebar-bottom">
        <button className="aio-create-button">
          <span>＋</span>
          Create
        </button>
      </div>
    </aside>
  );
}