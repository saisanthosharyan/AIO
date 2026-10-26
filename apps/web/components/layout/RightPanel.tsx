
"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  Layers3,
  MessageCircle,
  UsersRound,
} from "lucide-react";

const destinations = [
  {
    title: "Discover",
    description: "Explore people and conversations",
    href: "/discover",
    icon: Compass,
  },
  {
    title: "Spaces",
    description: "Find communities and discussions",
    href: "/spaces",
    icon: UsersRound,
  },
  {
    title: "Flow",
    description: "Explore another side of AIO",
    href: "/flow",
    icon: Layers3,
  },
  {
    title: "Messages",
    description: "Continue your conversations",
    href: "/messages",
    icon: MessageCircle,
  },
];

export default function RightPanel() {
  return (
    <aside
      className="aio-volt-discovery"
      aria-label="Explore AIO"
    >
      <div className="aio-volt-discovery-header">
        <span className="aio-volt-discovery-label">
          EXPLORE AIO
        </span>
        <h2>Find your next connection.</h2>
        <p>
          Discover communities, people and conversations
          across AIO.
        </p>
      </div>

      <nav
        className="aio-volt-discovery-links"
        aria-label="Explore sections"
      >
        {destinations.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="aio-volt-discovery-link"
            >
              <span className="aio-volt-discovery-icon">
                <Icon size={19} strokeWidth={1.8} />
              </span>

              <span className="aio-volt-discovery-link-copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>

              <ArrowUpRight
                size={16}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </nav>

      <div className="aio-volt-discovery-footer">
        <span className="aio-volt-discovery-brand">
          AIO<span>.</span>
        </span>
        <span>One place. More connections.</span>
      </div>
    </aside>
  );
}
