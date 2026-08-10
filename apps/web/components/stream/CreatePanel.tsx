"use client";

import {
  Plus,
  Sparkles,
  Video,
} from "lucide-react";

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

export default function CreatePanel() {
  return (
    <section className="create-panel">
      <div className="avatar">SA</div>

      <div className="create-input">
        <span>Share something meaningful...</span>

        <div className="create-actions">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button key={action.label}>
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