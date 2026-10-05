"use client";

import {
  Home,
  Layers3,
  Mail,
  Plus,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavigationItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const leftNavigation: MobileNavigationItem[] = [
  {
    label: "Home",
    href: "/stream",
    icon: Home,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: Mail,
  },
];

const rightNavigation: MobileNavigationItem[] = [
  {
    label: "Spaces",
    href: "/spaces",
    icon: Layers3,
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

function NavigationLink({
  item,
  pathname,
}: {
  item: MobileNavigationItem;
  pathname: string;
}) {
  const Icon = item.icon;

  const active = isActivePath(
    pathname,
    item.href,
  );

  return (
    <Link
      href={item.href}
      className={`aio-mobile-nav-item${
        active ? " is-active" : ""
      }`}
      aria-current={
        active ? "page" : undefined
      }
    >
      <Icon
        size={22}
        strokeWidth={
          active ? 2.2 : 1.8
        }
        aria-hidden="true"
      />

      <span>
        {item.label}
      </span>
    </Link>
  );
}

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="aio-mobile-nav"
      aria-label="Mobile navigation"
    >
      {leftNavigation.map((item) => (
        <NavigationLink
          key={item.href}
          item={item}
          pathname={pathname}
        />
      ))}

      <Link
        href="/stream?create=1"
        className="aio-mobile-create"
        aria-label="Create"
        title="Create"
      >
        <Plus
          size={27}
          strokeWidth={2.1}
          aria-hidden="true"
        />
      </Link>

      {rightNavigation.map((item) => (
        <NavigationLink
          key={item.href}
          item={item}
          pathname={pathname}
        />
      ))}
    </nav>
  );
}