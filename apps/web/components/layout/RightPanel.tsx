
"use client";

import {
  ArrowUpRight,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const upcomingEvents = [
  {
    title: "Designers Hub Meetup",
    time: "Today, 6:00 PM",
  },
  {
    title: "AI in Everyday Life",
    time: "Tomorrow, 11:00 AM",
  },
  {
    title: "Photography Walk",
    time: "Sunday, 7:00 AM",
  },
];

const trends = [
  { title: "#AIOCreator", posts: "12.5K posts" },
  { title: "The Future of AI", posts: "8.7K posts" },
  { title: "#SundayVibes", posts: "6.1K posts" },
];

export default function RightPanel() {
  return (
    <aside
      className="aio-canvas-discovery"
      aria-label="Discover on AIO"
    >
      <section className="aio-canvas-discovery-section">
        <div className="aio-canvas-discovery-heading">
          <h2>Upcoming</h2>
          <Link href="/spaces">Explore</Link>
        </div>

        <div className="aio-canvas-discovery-list">
          {upcomingEvents.map((event) => (
            <Link
              href="/spaces"
              key={event.title}
              className="aio-canvas-event"
            >
              <span className="aio-canvas-event-icon">
                <CalendarDays size={16} />
              </span>

              <span className="aio-canvas-event-info">
                <strong>{event.title}</strong>
                <small>{event.time}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="aio-canvas-discovery-section">
        <div className="aio-canvas-discovery-heading">
          <h2>
            <TrendingUp size={16} />
            Trending
          </h2>

          <Link href="/discover">See all</Link>
        </div>

        <div className="aio-canvas-discovery-list">
          {trends.map((trend, index) => (
            <Link
              href="/discover"
              key={trend.title}
              className="aio-canvas-trend"
            >
              <span className="aio-canvas-trend-index">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="aio-canvas-trend-info">
                <strong>{trend.title}</strong>
                <small>{trend.posts}</small>
              </span>

              <ArrowUpRight size={15} />
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}
