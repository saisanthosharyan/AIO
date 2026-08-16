"use client";

import { useState } from "react";
import {
  Bookmark,
  Check,
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
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const [likes, setLikes] = useState(
    type === "thought" ? 124 : 87,
  );

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${name} on AIO`,
          text: content,
        });
      } else {
        await navigator.clipboard.writeText(content);
      }

      setShared(true);

      window.setTimeout(() => {
        setShared(false);
      }, 2000);
    } catch {
      // User cancelled the share dialog.
    }
  }

  function handleLike() {
    setLiked((current) => {
      setLikes((count) =>
        current ? count - 1 : count + 1,
      );

      return !current;
    });
  }

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

        <button
          type="button"
          className="more-button"
          aria-label={`More options for ${name}'s post`}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="post-content">
        <p className="post-text">
          {content}
        </p>

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

            <button
              type="button"
              className="join-button"
            >
              Explore
            </button>
          </div>
        )}
      </div>

      <div className="post-footer">
        <button
          type="button"
          className={liked ? "liked" : ""}
          onClick={handleLike}
          aria-label={liked ? "Unlike post" : "Like post"}
          aria-pressed={liked}
        >
          <Heart
            size={19}
            fill={liked ? "currentColor" : "none"}
          />

          <span>{likes}</span>
        </button>

        <button
          type="button"
          aria-label="View comments"
        >
          <MessageSquare size={19} />
          <span>18</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share post"
        >
          {shared ? (
            <Check size={19} />
          ) : (
            <Share2 size={19} />
          )}

          <span>
            {shared ? "Copied" : "Share"}
          </span>
        </button>

        <button
          type="button"
          className={`save-action ${
            saved ? "saved" : ""
          }`}
          onClick={() => setSaved((current) => !current)}
          aria-label={
            saved ? "Remove from saved" : "Save post"
          }
          aria-pressed={saved}
        >
          <Bookmark
            size={19}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>
    </article>
  );
}