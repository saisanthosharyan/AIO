
"use client";

import {
  Image as ImageIcon,
  Plus,
  UserRound,
} from "lucide-react";

interface CreatePanelProps {
  onOpenCreate: () => void;
}

export default function CreatePanel({
  onOpenCreate,
}: CreatePanelProps) {
  return (
    <section
      className="aio-canvas-composer"
      aria-label="Create a post"
    >
      <div
        className="aio-canvas-composer-avatar"
        aria-hidden="true"
      >
        <UserRound size={19} strokeWidth={1.8} />
      </div>

      <button
        type="button"
        className="aio-canvas-composer-prompt"
        onClick={onOpenCreate}
      >
        What's happening?
      </button>

      <button
        type="button"
        className="aio-canvas-composer-icon"
        onClick={onOpenCreate}
        aria-label="Create an image post"
        title="Add image"
      >
        <ImageIcon size={18} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        className="aio-canvas-composer-submit"
        onClick={onOpenCreate}
        aria-label="Create post"
      >
        <Plus size={16} strokeWidth={2} />
        <span>Post</span>
      </button>
    </section>
  );
}
