"use client";

import { useState } from "react";
import {
  bookmarkPost,
  likePost,
  unlikePost,
  unbookmarkPost,
} from "../../lib/api";

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
  postId: string;
  name: string;
  username: string;
  time: string;
  initials: string;
  avatarClass: string;
  content: string;
  imageUrl?: string;
  type?: "thought" | "image" | "space";
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
}

export default function PostCard({
  postId,
  name,
  username,
  time,
  initials,
  avatarClass,
  content,
  imageUrl,
  type = "thought",
  likesCount = 0,
  commentsCount = 0,
  bookmarksCount = 0,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const [likes, setLikes] = useState(likesCount);
  const [comments] = useState(commentsCount);
  const [bookmarks, setBookmarks] =
    useState(bookmarksCount);

  const [likeLoading, setLikeLoading] =
    useState(false);
  const [bookmarkLoading, setBookmarkLoading] =
    useState(false);

  async function handleLike() {
    if (likeLoading) {
      return;
    }

    try {
      setLikeLoading(true);

      if (liked) {
        const result = await unlikePost(postId);

        setLiked(false);
        setLikes(result.likesCount);
      } else {
        const result = await likePost(postId);

        setLiked(true);
        setLikes(result.likesCount);
      }
    } catch (error) {
      console.error(
        "Failed to update like:",
        error,
      );
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleBookmark() {
    if (bookmarkLoading) {
      return;
    }

    try {
      setBookmarkLoading(true);

      if (saved) {
        const result =
          await unbookmarkPost(postId);

        setSaved(false);
        setBookmarks(
          result.bookmarksCount,
        );
      } else {
        const result =
          await bookmarkPost(postId);

        setSaved(true);
        setBookmarks(
          result.bookmarksCount,
        );
      }
    } catch (error) {
      console.error(
        "Failed to update bookmark:",
        error,
      );
    } finally {
      setBookmarkLoading(false);
    }
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${name} on AIO`,
          text: content,
        });
      } else {
        await navigator.clipboard.writeText(
          content,
        );
      }

      setShared(true);

      window.setTimeout(() => {
        setShared(false);
      }, 2000);
    } catch {
      // User cancelled the share dialog.
    }
  }

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-user">
          <div
            className={`avatar ${avatarClass}`}
          >
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
        {content && (
          <p className="post-text">
            {content}
          </p>
        )}

        {imageUrl && (
          <div className="post-image-wrapper">
            <img
              src={imageUrl}
              alt={`Image shared by ${name}`}
              className="post-image"
            />
          </div>
        )}

        {!imageUrl &&
          type === "thought" && (
            <div className="idea-card">
              <div className="idea-icon">
                <Sparkles size={22} />
              </div>

              <div>
                <span>
                  THOUGHT OF THE DAY
                </span>

                <h3>
                  Build for the feeling, not the
                  feature.
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
                2.8K people exploring the future
                of AI
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
          className={
            liked ? "liked" : ""
          }
          onClick={handleLike}
          disabled={likeLoading}
          aria-label={
            liked
              ? "Unlike post"
              : "Like post"
          }
          aria-pressed={liked}
        >
          <Heart
            size={19}
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />

          <span>{likes}</span>
        </button>

        <button
          type="button"
          aria-label="View comments"
        >
          <MessageSquare size={19} />

          <span>{comments}</span>
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
            {shared
              ? "Copied"
              : "Share"}
          </span>
        </button>

        <button
          type="button"
          className={`save-action ${
            saved ? "saved" : ""
          }`}
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          aria-label={
            saved
              ? "Remove from saved"
              : "Save post"
          }
          aria-pressed={saved}
        >
          <Bookmark
            size={19}
            fill={
              saved
                ? "currentColor"
                : "none"
            }
          />

          <span className="sr-only">
            {bookmarks}
          </span>
        </button>
      </div>
    </article>
  );
}