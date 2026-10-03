"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Layers3,
  Mail,
  Plus,
  UserRound,
} from "lucide-react";

const navigation = [
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

export default function MobileNav() {
  const pathname = usePathname();

  const leftItems =
    navigation.slice(0, 2);

  const rightItems =
    navigation.slice(2);

  return (
    <nav
      className="aio-mobile-nav"
      aria-label="Mobile navigation"
    >
      {leftItems.map((item) => {
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
            className={`aio-mobile-nav-item${
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
            <Icon
              size={21}
              strokeWidth={
                active ? 2.3 : 1.9
              }
            />

            <span>
              {item.label}
            </span>
          </Link>
        );
      })}

      <Link
        href="/stream?create=1"
        className="aio-mobile-create"
        aria-label="Create"
      >
        <Plus
          size={25}
          strokeWidth={2}
        />
      </Link>

      {rightItems.map((item) => {
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
            className={`aio-mobile-nav-item${
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
            <Icon
              size={21}
              strokeWidth={
                active ? 2.3 : 1.9
              }
            />

            <span>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}