"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Film,
  Home,
  UserRound,
  Workflow,
} from "lucide-react";

const navigation = [
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

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="aio-mobile-nav"
      aria-label="Mobile navigation"
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
            className={`aio-mobile-nav-item${
              active ? " is-active" : ""
            }`}
            aria-current={
              active ? "page" : undefined
            }
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.3 : 2}
            />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}