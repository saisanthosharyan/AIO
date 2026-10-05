"use client";

import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const upcomingEvents = [
  {
    title: "Designers Hub Meetup",
    time: "Today, 6:00 PM",
    attendees: "+128",
    initials: ["D", "E", "A"],
  },
  {
    title: "AI in Everyday Life",
    time: "Tomorrow, 11:00 AM",
    attendees: "+64",
    initials: ["D", "E", "A"],
  },
  {
    title: "Photography Walk",
    time: "Sun, 7:00 AM",
    attendees: "+32",
    initials: ["D", "E", "A"],
  },
];

const trends = [
  {
    title: "#AIOCreator",
    posts: "12.5K posts",
  },
  {
    title: "The Future of AI",
    posts: "8.7K posts",
  },
  {
    title: "#SundayVibes",
    posts: "6.1K posts",
  },
];

export default function RightPanel() {
  return (
    <aside
      className="aio-v2-right-panel"
      aria-label="Discover on AIO"
    >
      <div className="aio-v2-right-panel-inner">
        {/* Upcoming */}
        <section className="aio-v2-side-card aio-template-upcoming">
          <div className="aio-template-side-heading">
            <h3>Upcoming</h3>

            <Link href="/spaces">
              See all
            </Link>
          </div>

          <div className="aio-template-event-list">
            {upcomingEvents.map(
              (event, index) => (
                <Link
                  key={event.title}
                  href="/spaces"
                  className="aio-template-event"
                >
                  <span
                    className={`aio-template-event-thumbnail aio-template-event-thumbnail-${index + 1}`}
                    aria-hidden="true"
                  />

                  <span className="aio-template-event-content">
                    <strong>
                      {event.title}
                    </strong>

                    <small>
                      {event.time}
                    </small>

                    <span className="aio-template-event-attendees">
                      <span className="aio-template-faces">
                        {event.initials.map(
                          (
                            initial,
                            avatarIndex,
                          ) => (
                            <span
                              key={`${event.title}-${avatarIndex}`}
                              className={`aio-template-face aio-template-face-${avatarIndex + 1}`}
                            >
                              {initial}
                            </span>
                          ),
                        )}
                      </span>

                      <span className="aio-template-attendee-count">
                        {event.attendees}
                      </span>
                    </span>
                  </span>
                </Link>
              ),
            )}
          </div>
        </section>

        {/* Trending */}
        <section className="aio-v2-side-card aio-template-trending">
          <div className="aio-template-side-heading">
            <h3>
              Trending Signals
            </h3>
          </div>

          <div className="aio-template-trend-list">
            {trends.map(
              (trend, index) => (
                <Link
                  key={trend.title}
                  href="/discover"
                  className="aio-template-trend"
                >
                  <span className="aio-template-trend-number">
                    {index + 1}
                  </span>

                  <span className="aio-template-trend-content">
                    <strong>
                      {trend.title}
                    </strong>

                    <small>
                      {trend.posts}
                    </small>
                  </span>

                  <ArrowUpRight
                    className="aio-template-trend-arrow"
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
          </div>
        </section>

        {/* AIO Intelligence */}
        <section className="aio-v2-side-card aio-template-intelligence">
          <div
            className="aio-template-intelligence-orb"
            aria-hidden="true"
          >
            <Sparkles
              size={18}
              strokeWidth={1.8}
            />
          </div>

          <div className="aio-template-intelligence-content">
            <strong>
              Intelligence
            </strong>

            <span>
              Summarize this space
            </span>

            <span>
              What are people talking
              about?
            </span>
          </div>
        </section>
      </div>
    </aside>
  );
}