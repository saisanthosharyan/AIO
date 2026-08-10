"use client";

import {
  Compass,
  MessageCircle,
  MoreHorizontal,
  Send,
  Sparkles,
} from "lucide-react";

export default function IntelligencePanel() {
  return (
    <aside className="intelligence-panel">
      <div className="intelligence-header">
        <div className="intelligence-title">
          <div className="ai-orb">
            <Sparkles size={17} />
          </div>

          <div>
            <strong>Intelligence</strong>
            <span>AIO is ready</span>
          </div>
        </div>

        <button className="icon-button">
          <MoreHorizontal size={19} />
        </button>
      </div>

      <div className="ai-greeting">
        <span className="eyebrow">CONTEXTUAL AI</span>

        <h2>
          What would you like
          <br />
          to explore?
        </h2>

        <p>
          Ask about your conversations, discover new ideas,
          or create something with AIO.
        </p>
      </div>

      <div className="ai-suggestions">
        <button>
          <Compass size={17} />
          <span>What&apos;s trending?</span>
        </button>

        <button>
          <MessageCircle size={17} />
          <span>Summarize my chats</span>
        </button>

        <button>
          <Sparkles size={17} />
          <span>Help me create</span>
        </button>
      </div>

      <div className="ai-input">
        <input placeholder="Ask AIO anything..." />

        <button>
          <Send size={17} />
        </button>
      </div>
    </aside>
  );
}