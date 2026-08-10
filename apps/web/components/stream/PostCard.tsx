"use client";

import {
  Bookmark,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

interface PostCardProps {
  name: string;
  username: string;
  time: string;
  initials: string;
  avatarClass: string;
  content: string;
  type?: "thought" | "space";
}

export default function PostCard({
  name,
  username,
  time,
  initials,
  avatarClass,
  content,
  type = "thought",
}: PostCardProps) {
  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-user">
          <div className={`avatar ${avatarClass}`}>
            {initials}
          </div>

          <div>
            <strong>{name}</strong>

            <span>
              {username} · {time}
            </span>
          </div>
        </div>

        <button className="more-button">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="post-content">
        <p className="post-text">{content}</p>

        {type === "thought" && (
          <div className="idea-card">
            <div className="idea-icon">
              <Sparkles size={22} />
            </div>

            <div>
              <span>THOUGHT OF THE DAY</span>

              <h3>
                Build for the feeling, not the feature.
              </h3>
            </div>
          </div>
        )}

        {type === "space" && (
          <div className="space-preview">
            <div className="space-orbit">
              <Users size={24} />
            </div>

            <div className="space-info">
              <span>SPACE</span>

              <h3>AI Builders</h3>

              <p>
                2.8K people exploring the future of AI
              </p>
            </div>

            <button className="join-button">
              Explore
            </button>
          </div>
        )}
      </div>

      <div className="post-footer">
        <button>
          <Heart size={19} />
          <span>124</span>
        </button>

        <button>
          <MessageSquare size={19} />
          <span>18</span>
        </button>

        <button>
          <Share2 size={19} />
          <span>Share</span>
        </button>

        <button className="save-action">
          <Bookmark size={19} />
        </button>
      </div>
    </article>
  );
}