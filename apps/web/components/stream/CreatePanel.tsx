"use client";

import {
  Plus,
  Sparkles,
  Video,
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
    label: "Clip",
    icon: Video,
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
    <section className="create-panel">
      <div className="avatar avatar-purple">
        SA
      </div>

      <div className="create-input">
        <button
          type="button"
          className="create-placeholder"
          onClick={onOpenCreate}
        >
          Share something meaningful...
        </button>

        <div className="create-actions">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                onClick={onOpenCreate}
                aria-label={`Create ${action.label}`}
              >
                <Icon size={17} />

                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}