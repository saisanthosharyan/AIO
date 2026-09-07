"use client";

import {
  Image as ImageIcon,
  Plus,
  Sparkles,
} from "lucide-react";

interface CreatePanelProps {
  onOpenCreate: () => void;
}

const actions = [
  {
    label: "Moment",
    icon: Sparkles,
  },
  {
    label: "Image",
    icon: ImageIcon,
  },
  {
    label: "Post",
    icon: Plus,
  },
];

export default function CreatePanel({
  onOpenCreate,
}: CreatePanelProps) {
  return (
    <section
      className="create-panel"
      aria-label="Create a post"
    >
      <div className="create-panel-main">
        <div
          className="avatar avatar-purple"
          aria-hidden="true"
        >
          AI
        </div>

        <button
          type="button"
          className="create-placeholder"
          onClick={onOpenCreate}
        >
          <span>
            Share something meaningful...
          </span>
        </button>
      </div>

      <div className="create-actions">
        {actions.map(
          (action) => {
            const Icon =
              action.icon;

            return (
              <button
                key={action.label}
                type="button"
                onClick={onOpenCreate}
                aria-label={`Create ${action.label}`}
              >
                <Icon
                  size={16}
                  strokeWidth={2}
                />

                <span>
                  {action.label}
                </span>
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}