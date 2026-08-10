"use client";

import { ChevronDown } from "lucide-react";

interface ProfileButtonProps {
  name?: string;
  username?: string;
  initials?: string;
}

export default function ProfileButton({
  name = "Santhosh",
  username = "@santhosh",
  initials = "SA",
}: ProfileButtonProps) {
  return (
    <button
      type="button"
      className="profile-button"
      aria-label="Open profile menu"
    >
      <span className="avatar">
        {initials}
      </span>

      <span className="profile-button-text">
        <strong>{name}</strong>
        <small>{username}</small>
      </span>

      <ChevronDown
        size={16}
        strokeWidth={1.8}
      />
    </button>
  );
}