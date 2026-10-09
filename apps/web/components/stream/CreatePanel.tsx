
"use client";

import {
  Image as ImageIcon,
  PenLine,
  Plus,
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
      <div className="aio-canvas-composer-avatar" aria-hidden="true">
        AI
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
        aria-label="Create image post"
        title="Add image"
      >
        <ImageIcon size={18} />
      </button>

      <button
        type="button"
        className="aio-canvas-composer-submit"
        onClick={onOpenCreate}
      >
        <Plus size={16} />
        <span>Post</span>
      </button>
    </section>
  );
}
