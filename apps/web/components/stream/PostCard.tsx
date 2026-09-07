"use client";

import Image from "next/image";
import {
  BadgeCheck,
  Bookmark,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  bookmarkPost,
  deletePost,
  likePost,
  unbookmarkPost,
  unlikePost,
} from "@/lib/api";

interface PostCardProps {
  postId: string;
  name: string;
  username: string;
  time: string;
  initials: string;
  avatarClass: string;
  content: string;
  imageUrl?: string;
  avatarUrl?: string;
  verified?: boolean;
  type?: "thought" | "image" | "space";
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
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
  verified = false,
  type = "thought",
  likesCount = 0,
  commentsCount = 0,
  bookmarksCount = 0,
  isLiked = false,
  isBookmarked = false,
  avatarUrl,
}: PostCardProps) {
  const [liked, setLiked] =
    useState(isLiked);

  const [saved, setSaved] =
    useState(isBookmarked);

  const [likes, setLikes] =
    useState(likesCount);

  const [comments] =
    useState(commentsCount);

  const [bookmarks, setBookmarks] =
    useState(bookmarksCount);

  const [likeLoading, setLikeLoading] =
    useState(false);

  const [
    bookmarkLoading,
    setBookmarkLoading,
  ] = useState(false);

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  async function handleLike(): Promise<void> {
    if (likeLoading) {
      return;
    }

    setError("");
    setLikeLoading(true);

    try {
      if (liked) {
        const response =
          await unlikePost(postId);

        setLiked(false);
        setLikes(response.likesCount);
      } else {
        const response =
          await likePost(postId);

        setLiked(true);
        setLikes(response.likesCount);
      }
    } catch (likeError) {
      setError(
        likeError instanceof Error
          ? likeError.message
          : "Unable to update like.",
      );
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleBookmark(): Promise<void> {
    if (bookmarkLoading) {
      return;
    }

    setError("");
    setBookmarkLoading(true);

    try {
      if (saved) {
        const response =
          await unbookmarkPost(postId);

        setSaved(false);
        setBookmarks(
          response.bookmarksCount,
        );
      } else {
        const response =
          await bookmarkPost(postId);

        setSaved(true);
        setBookmarks(
          response.bookmarksCount,
        );
      }
    } catch (bookmarkError) {
      setError(
        bookmarkError instanceof Error
          ? bookmarkError.message
          : "Unable to update bookmark.",
      );
    } finally {
      setBookmarkLoading(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (deleteLoading) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this post?",
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeleteLoading(true);

    try {
      await deletePost(postId);

      window.location.reload();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete post.",
      );

      setDeleteLoading(false);
    }
  }

  const normalizedUsername =
    username.startsWith("@")
      ? username.slice(1)
      : username;

  const safeName =
    name.trim() || "AIO User";

  const safeUsername =
    normalizedUsername.trim() ||
    "aio-user";

  const safeInitials =
    initials.trim().slice(0, 2).toUpperCase() ||
    "AI";

  return (
    <article
      className="post-card"
      aria-label={`Post by ${safeName}`}
    >
      {/* ===================================================
          HEADER
         =================================================== */}

      <header className="post-header">
        <div className="post-user">
          {avatarUrl ? (
            <div className="post-avatar">
              <Image
                src={avatarUrl}
                alt={`${safeName}'s avatar`}
                width={40}
                height={40}
                className="post-avatar-image"
                unoptimized
              />
            </div>
          ) : (
            <div
              className={`post-avatar ${avatarClass}`}
              aria-hidden="true"
            >
              {safeInitials}
            </div>
          )}

          <div className="post-author-details">
            <div className="post-author-line">
              <strong>
                {safeName}
              </strong>

              {verified && (
                <span
                  className="aio-verified"
                  title="Verified account"
                >
                  <BadgeCheck
                    size={16}
                    strokeWidth={2.4}
                    aria-label="Verified account"
                  />
                </span>
              )}
            </div>

            <div className="post-meta-line">
              <span>
                @{safeUsername}
              </span>

              <span
                className="post-meta-dot"
                aria-hidden="true"
              >
                ·
              </span>

              <time>
                {time}
              </time>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="more-button"
          aria-label="Post options"
          title="Post options"
        >
          <MoreHorizontal
            size={20}
          />
        </button>
      </header>

      {/* ===================================================
          CONTENT
         =================================================== */}

      <div className="post-content">
        {content && (
          <p className="post-text">
            {content}
          </p>
        )}

        {imageUrl && (
          <div className="post-media">
            <Image
              src={imageUrl}
              alt="Post attachment"
              width={1200}
              height={675}
              sizes="
                (max-width: 760px) 100vw,
                640px
              "
              className="post-media-image"
              unoptimized
            />
          </div>
        )}

        {type === "space" && (
          <span className="aio-badge">
            Space
          </span>
        )}
      </div>

      {/* ===================================================
          ERROR
         =================================================== */}

      {error && (
        <div
          className="aio-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* ===================================================
          ACTIONS
         =================================================== */}

      <footer className="post-footer">
        <button
          type="button"
          className={
            liked
              ? "post-action liked"
              : "post-action"
          }
          onClick={() =>
            void handleLike()
          }
          disabled={likeLoading}
          aria-label={
            liked
              ? "Unlike post"
              : "Like post"
          }
          aria-pressed={liked}
        >
          {likeLoading ? (
            <Loader2
              size={18}
              className="aio-spin"
            />
          ) : (
            <Heart
              size={18}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />
          )}

          <span>{likes}</span>
        </button>

        <button
          type="button"
          className="post-action"
          aria-label={`Comment on post. ${comments} comments`}
        >
          <MessageCircle
            size={18}
          />

          <span>{comments}</span>
        </button>

        <button
          type="button"
          className={
            saved
              ? "post-action saved"
              : "post-action"
          }
          onClick={() =>
            void handleBookmark()
          }
          disabled={bookmarkLoading}
          aria-label={
            saved
              ? "Remove bookmark"
              : "Bookmark post"
          }
          aria-pressed={saved}
        >
          {bookmarkLoading ? (
            <Loader2
              size={18}
              className="aio-spin"
            />
          ) : (
            <Bookmark
              size={18}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />
          )}

          <span>{bookmarks}</span>
        </button>

        <button
          type="button"
          className="post-action"
          aria-label="Share post"
        >
          <Send size={18} />
        </button>

        <button
          type="button"
          className="post-action post-delete-action"
          onClick={() =>
            void handleDelete()
          }
          disabled={deleteLoading}
          aria-label="Delete post"
        >
          {deleteLoading ? (
            <Loader2
              size={18}
              className="aio-spin"
            />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </footer>
    </article>
  );
}