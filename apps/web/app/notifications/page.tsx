"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  UserPlus,
  Loader2,
} from "lucide-react";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/api";

function formatNotificationTime(
  dateString: string,
): string {
  const date = new Date(dateString);
  const now = new Date();
  const difference =
    now.getTime() - date.getTime();

  const seconds = Math.floor(
    difference / 1000,
  );

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d`;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
    },
  );
}

function getNotificationText(
  notification: NotificationItem,
): string {
  const actorName =
    notification.actor?.displayName ??
    "Someone";

  switch (notification.type) {
    case "follow":
      return `${actorName} started following you`;

    case "like":
      return `${actorName} liked your post`;

    case "comment":
      return `${actorName} commented on your post`;

    default:
      return `${actorName} interacted with you`;
  }
}

function NotificationIcon({
  type,
}: {
  type: NotificationItem["type"];
}) {
  if (type === "follow") {
    return (
      <div className="notification-type-icon notification-type-follow">
        <UserPlus size={18} />
      </div>
    );
  }

  if (type === "like") {
    return (
      <div className="notification-type-icon notification-type-like">
        <Heart size={18} />
      </div>
    );
  }

  return (
    <div className="notification-type-icon notification-type-comment">
      <MessageCircle size={18} />
    </div>
  );
}

function NotificationAvatar({
  notification,
}: {
  notification: NotificationItem;
}) {
  const actor = notification.actor;

  if (!actor) {
    return (
      <div className="notification-avatar">
        <Bell size={20} />
      </div>
    );
  }

  if (actor.avatarUrl) {
    return (
      <img
        src={actor.avatarUrl}
        alt={actor.displayName}
        className="notification-avatar"
      />
    );
  }

  return (
    <div className="notification-avatar">
      {actor.displayName
        .charAt(0)
        .toUpperCase()}
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] =
    useState(0);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] =
    useState(false);
  const [markingId, setMarkingId] =
    useState<string | null>(null);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getNotifications();

      setNotifications(
        result.notifications,
      );

      setUnreadCount(
        result.unreadCount,
      );
    } catch (err) {
      console.error(
        "Notifications error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function handleMarkAsRead(
    notification: NotificationItem,
  ) {
    if (notification.read) {
      return;
    }

    try {
      setMarkingId(notification.id);

      await markNotificationAsRead(
        notification.id,
      );

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (currentNotification) =>
              currentNotification.id ===
              notification.id
                ? {
                    ...currentNotification,
                    read: true,
                  }
                : currentNotification,
          ),
      );

      setUnreadCount((current) =>
        Math.max(current - 1, 0),
      );
    } catch (err) {
      console.error(
        "Mark notification error:",
        err,
      );
    } finally {
      setMarkingId(null);
    }
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);

      await markAllNotificationsAsRead();

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              read: true,
            }),
          ),
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        "Mark all notifications error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <main className="notifications-page">
      <div className="notifications-header">
        <div className="notifications-heading">
          <div className="notifications-heading-icon">
            <Bell size={24} />
          </div>

          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated with everything
              happening around you.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="notifications-mark-all"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2
                size={17}
                className="notification-spinner"
              />
            ) : (
              <CheckCheck size={17} />
            )}

            {markingAll
              ? "Marking..."
              : "Mark all as read"}
          </button>
        )}
      </div>

      {unreadCount > 0 && (
        <div className="notifications-summary">
          <span className="notifications-unread-dot" />

          <strong>
            {unreadCount}
          </strong>

          <span>
            unread{" "}
            {unreadCount === 1
              ? "notification"
              : "notifications"}
          </span>
        </div>
      )}

      {loading ? (
        <div className="notifications-state">
          <Loader2
            size={28}
            className="notification-spinner"
          />

          <span>
            Loading notifications...
          </span>
        </div>
      ) : error ? (
        <div className="notifications-state notifications-state-error">
          <Bell size={30} />

          <strong>
            Unable to load notifications
          </strong>

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              void loadNotifications()
            }
          >
            Try again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <Bell size={34} />
          </div>

          <h2>
            You're all caught up
          </h2>

          <p>
            When people interact with you,
            you'll see their activity here.
          </p>

          <Link href="/discover">
            Discover people
          </Link>
        </div>
      ) : (
        <section className="notifications-list">
          {notifications.map(
            (notification) => {
              const actor =
                notification.actor;

              const actorProfile =
                actor
                  ? `/profile/${encodeURIComponent(
                      actor.username,
                    )}`
                  : null;

              const isMarking =
                markingId ===
                notification.id;

              return (
                <article
                  key={notification.id}
                  className={`notification-card ${
                    notification.read
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                >
                  {actorProfile ? (
                    <Link
                      href={actorProfile}
                      className="notification-avatar-link"
                    >
                      <NotificationAvatar
                        notification={
                          notification
                        }
                      />
                    </Link>
                  ) : (
                    <NotificationAvatar
                      notification={
                        notification
                      }
                    />
                  )}

                  <div className="notification-content">
                    <div className="notification-main">
                      <div className="notification-text">
                        {actorProfile ? (
                          <Link
                            href={
                              actorProfile
                            }
                            className="notification-actor"
                          >
                            {actor?.displayName ??
                              "Someone"}
                          </Link>
                        ) : (
                          <strong>
                            Someone
                          </strong>
                        )}

                        <span>
                          {notification.type ===
                          "follow"
                            ? " started following you"
                            : notification.type ===
                              "like"
                            ? " liked your post"
                            : " commented on your post"}
                        </span>
                      </div>

                      <span className="notification-time">
                        {formatNotificationTime(
                          notification.createdAt,
                        )}
                      </span>
                    </div>

                    <div className="notification-bottom">
                      <NotificationIcon
                        type={
                          notification.type
                        }
                      />

                      {!notification.read && (
                        <button
                          type="button"
                          className="notification-read-button"
                          onClick={() =>
                            void handleMarkAsRead(
                              notification,
                            )
                          }
                          disabled={isMarking}
                        >
                          {isMarking ? (
                            <Loader2
                              size={14}
                              className="notification-spinner"
                            />
                          ) : (
                            "Mark as read"
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {!notification.read && (
                    <span className="notification-unread-indicator" />
                  )}
                </article>
              );
            },
          )}
        </section>
      )}
    </main>
  );
}