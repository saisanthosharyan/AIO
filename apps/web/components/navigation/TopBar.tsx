"use client";

import Link from "next/link";
import {
  Bell,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

export default function TopBar() {
  return (
    <header className="aio-topbar">
      {/* BRAND */}
      <div className="topbar-brand">
        <Link href="/stream" className="aio-wordmark">
          <span className="aio-mark" aria-hidden="true">
            <Sparkles size={15} strokeWidth={2} />
          </span>

          <span>AIO</span>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="search-box">
        <Search size={18} strokeWidth={1.8} />

        <input
          type="search"
          placeholder="Search people, ideas, spaces..."
          aria-label="Search AIO"
        />

        <kbd>⌘ K</kbd>
      </div>

      {/* ACTIONS */}
      <div className="top-actions">
        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={1.8} />

          <span
            className="top-notification-dot"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          className="create-button"
          aria-label="Create"
        >
          <Plus size={18} strokeWidth={2} />

          <span>Create</span>
        </button>

        <Link
          href="/profile"
          className="top-avatar"
          aria-label="Open profile"
        >
          SA
        </Link>
      </div>
    </header>
  );
}