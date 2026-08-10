"use client";

import { Search, Sparkles } from "lucide-react";

interface CommandBarProps {
  placeholder?: string;
}

export default function CommandBar({
  placeholder = "Search people, ideas, spaces...",
}: CommandBarProps) {
  return (
    <div className="command-bar">
      <div className="command-icon">
        <Sparkles size={16} />
      </div>

      <input
        type="search"
        placeholder={placeholder}
        aria-label="AIO command search"
      />

      <div className="command-hint">
        <Search size={14} />
        <kbd>⌘</kbd>
        <kbd>K</kbd>
      </div>
    </div>
  );
}