"use client";

import {
  Bell,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

import Link from "next/link";

export default function TopBar() {
  return (
    <header className="aio-topbar">
      <div className="topbar-brand">
        <Link href="/stream" className="aio-wordmark">
          <span className="aio-mark">
            <Sparkles size={15} strokeWidth={2} />
          </span>

          <span>AIO</span>
        </Link>
      </div>

      <div className="search-box">
        <Search size={18} strokeWidth={1.8} />

        <input
          type="search"
          placeholder="Search people, ideas, spaces..."
          aria-label="Search AIO"
        />

        <kbd>⌘ K</kbd>
      </div>

      <div className="top-actions">
        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={1.8} />

          <span className="top-notification-dot" />
        </button>

        <button
          type="button"
          className="create-button"
        >
          <Plus size={18} strokeWidth={2} />
          <span>Create</span>
        </button>

        <div className="top-avatar">
          SA
        </div>
      </div>
    </header>
  );
}