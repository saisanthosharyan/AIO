"use client";

import {
  ArrowUpRight,
  CalendarDays,
  Hash,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const trends = [
  {
    tag: "#BuildInPublic",
    posts: "2.4K posts",
  },
  {
    tag: "#ArtificialIntelligence",
    posts: "1.8K posts",
  },
  {
    tag: "#WebDevelopment",
    posts: "1.2K posts",
  },
];

const spaces = [
  {
    name: "AI Builders",
    members: "12.8K members",
    initials: "AI",
  },
  {
    name: "Developers",
    members: "8.4K members",
    initials: "DV",
  },
];

export default function RightPanel() {
  return (
    <aside
      className="aio-v2-right-panel"
      aria-label="Discover on AIO"
    >
      <div className="aio-v2-right-panel-inner">
        <section className="aio-v2-side-card">
          <div className="aio-v2-side-card-heading">
            <div>
              <span className="aio-v2-side-eyebrow">
                Happening soon
              </span>

              <h3>Upcoming</h3>
            </div>

            <CalendarDays size={18} />
          </div>

          <div className="aio-v2-event">
            <div className="aio-v2-event-date">
              <strong>08</strong>
              <span>OCT</span>
            </div>

            <div className="aio-v2-event-copy">
              <strong>AI Builders Meetup</strong>
              <span>7:00 PM · AIO Spaces</span>
            </div>
          </div>
        </section>

        <section className="aio-v2-side-card">
          <div className="aio-v2-side-card-heading">
            <div>
              <span className="aio-v2-side-eyebrow">
                What&apos;s moving
              </span>

              <h3>Trending Signals</h3>
            </div>

            <Hash size={18} />
          </div>

          <div className="aio-v2-trend-list">
            {trends.map((trend, index) => (
              <Link
                key={trend.tag}
                href="/discover"
                className="aio-v2-trend"
              >
                <span className="aio-v2-trend-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="aio-v2-trend-copy">
                  <strong>{trend.tag}</strong>
                  <small>{trend.posts}</small>
                </span>

                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>

          <Link
            href="/discover"
            className="aio-v2-side-link"
          >
            Explore signals
            <ArrowUpRight size={14} />
          </Link>
        </section>

        <section className="aio-v2-side-card">
          <div className="aio-v2-side-card-heading">
            <div>
              <span className="aio-v2-side-eyebrow">
                Find your community
              </span>

              <h3>Spaces for you</h3>
            </div>

            <UsersRound size={18} />
          </div>

          <div className="aio-v2-space-list">
            {spaces.map((space) => (
              <Link
                key={space.name}
                href="/spaces"
                className="aio-v2-space"
              >
                <span className="aio-v2-space-avatar">
                  {space.initials}
                </span>

                <span className="aio-v2-space-copy">
                  <strong>{space.name}</strong>
                  <small>{space.members}</small>
                </span>

                <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
        </section>

        <section className="aio-v2-intelligence-card">
          <div className="aio-v2-intelligence-icon">
            <Sparkles size={18} />
          </div>

          <div className="aio-v2-intelligence-copy">
            <span>AIO Intelligence</span>

            <strong>
              Understand what matters to you.
            </strong>

            <p>
              AI-powered summaries, discovery and
              recommendations are coming to AIO.
            </p>

            <button type="button" disabled>
              Coming soon
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}