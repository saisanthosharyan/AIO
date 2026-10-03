"use client";

import {
  Image as ImageIcon,
  PenLine,
  Sparkles,
  WandSparkles,
} from "lucide-react";

interface CreatePanelProps {
  onOpenCreate: () => void;
}

const actions = [
  {
    label: "Post",
    icon: PenLine,
  },
  {
    label: "Image",
    icon: ImageIcon,
  },
  {
    label: "Moment",
    icon: Sparkles,
  },
  {
    label: "Ask AI",
    icon: WandSparkles,
  },
];

export default function CreatePanel({
  onOpenCreate,
}: CreatePanelProps) {
  return (
    <section
      className="create-panel aio-v2-composer"
      aria-label="Create a post"
    >
      <div className="aio-v2-composer-main">
        <button
          type="button"
          className="aio-v2-composer-avatar"
          onClick={onOpenCreate}
          aria-label="Create post"
        >
          AI
        </button>

        <button
          type="button"
          className="aio-v2-composer-input"
          onClick={onOpenCreate}
        >
          <span>
            What&apos;s on your mind?
          </span>
        </button>
      </div>

      <div className="aio-v2-composer-divider" />

      <div className="aio-v2-composer-actions">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              onClick={onOpenCreate}
              aria-label={`Create ${action.label}`}
            >
              <span className="aio-v2-composer-action-icon">
                <Icon
                  size={17}
                  strokeWidth={2}
                />
              </span>

              <span>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}