"use client";

import Image from "next/image";
import {
  Bookmark,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
  BadgeCheck,
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
  avatarUrl,
  verified = false,
  type = "thought",
  likesCount = 0,
  commentsCount = 0,
  bookmarksCount = 0,
  isLiked = false,
  isBookmarked = false,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isBookmarked);

  const [likes, setLikes] = useState(likesCount);
  const [comments] = useState(commentsCount);
  const [bookmarks, setBookmarks] =
    useState(bookmarksCount);

  const [likeLoading, setLikeLoading] =
    useState(false);

  const [bookmarkLoading, setBookmarkLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [error, setError] = useState("");

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
          : "Unable to update like",
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
          : "Unable to update bookmark",
      );
    } finally {
      setBookmarkLoading(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (deleteLoading) {
      return;
    }

    const confirmed = window.confirm(
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
          : "Unable to delete post",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  const normalizedUsername =
    username.startsWith("@")
      ? username.slice(1)
      : username;

  return (
    <article className="aio-post-card">
      <div className="aio-post-header">
        {avatarUrl ? (
          <div className="aio-avatar aio-avatar-image">
            <Image
              src={avatarUrl}
              alt={`${name}'s avatar`}
              width={48}
              height={48}
              className="aio-avatar-image-content"
              unoptimized
            />
          </div>
        ) : (
          <div
            className={`aio-avatar ${avatarClass}`}
          >
            {initials}
          </div>
        )}

        <div className="aio-post-author">
          <div className="aio-post-author-row">
            <strong>{name}</strong>

            {verified && (
              <BadgeCheck
                size={17}
                aria-label="Verified account"
              />
            )}

            <span>
              @{normalizedUsername}
            </span>
          </div>

          <span className="aio-post-time">
            {time}
          </span>
        </div>

        <button
          type="button"
          className="aio-icon-button"
          aria-label="Post options"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="aio-post-content">
        {content && (
          <p className="aio-post-text">
            {content}
          </p>
        )}

        {imageUrl && (
          <div className="aio-post-image-wrapper">
            <Image
              src={imageUrl}
              alt="Post attachment"
              className="aio-post-image"
              width={1200}
              height={675}
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized
            />
          </div>
        )}

        {type === "space" && (
          <span className="aio-post-type">
            Space
          </span>
        )}
      </div>

      {error && (
        <p className="aio-post-error">
          {error}
        </p>
      )}

      <div className="aio-post-actions">
        <button
          type="button"
          className={liked ? "liked" : ""}
          onClick={() => void handleLike()}
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
              size={19}
              className="aio-spin"
            />
          ) : (
            <Heart
              size={19}
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
          aria-label="Comment on post"
        >
          <MessageCircle size={19} />
          <span>{comments}</span>
        </button>

        <button
          type="button"
          className={saved ? "liked" : ""}
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
              size={19}
              className="aio-spin"
            />
          ) : (
            <Bookmark
              size={19}
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
          aria-label="Share post"
        >
          <Send size={19} />
        </button>

        <button
          type="button"
          className="aio-delete-button"
          onClick={() =>
            void handleDelete()
          }
          disabled={deleteLoading}
          aria-label="Delete post"
        >
          {deleteLoading ? (
            <Loader2
              size={19}
              className="aio-spin"
            />
          ) : (
            <Trash2 size={19} />
          )}
        </button>
      </div>
    </article>
  );
}