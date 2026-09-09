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
  createComment,
  deleteComment,
  deletePost,
  getComments,
  getCurrentUser,
  likePost,
  unbookmarkPost,
  unlikePost,
} from "@/lib/api";

import type { Comment } from "../../../../packages/types/src/post";

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

function getCommentTime(
  createdAt: string,
): string {
  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return "";
  }

  const seconds = Math.floor(
    (Date.now() - created.getTime()) / 1000,
  );

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d`;
  }

  return created.toLocaleDateString();
}

function getInitials(
  displayName?: string,
  username?: string,
): string {
  const value =
    displayName?.trim() ||
    username?.trim() ||
    "AI";

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`
      .toUpperCase();
  }

  return value
    .slice(0, 2)
    .toUpperCase();
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

  const [comments, setComments] =
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

  const [
    commentsOpen,
    setCommentsOpen,
  ] = useState(false);

  const [
    commentsLoading,
    setCommentsLoading,
  ] = useState(false);

  const [
    commentsLoaded,
    setCommentsLoaded,
  ] = useState(false);

  const [
    commentList,
    setCommentList,
  ] = useState<Comment[]>([]);

  const [
    commentText,
    setCommentText,
  ] = useState("");

  const [
    commentSubmitting,
    setCommentSubmitting,
  ] = useState(false);

  const [
    deletingCommentId,
    setDeletingCommentId,
  ] = useState("");

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [
    commentError,
    setCommentError,
  ] = useState("");

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

  async function loadComments(): Promise<void> {
    setCommentsLoading(true);
    setCommentError("");

    try {
      const [
        loadedComments,
        currentUser,
      ] = await Promise.all([
        getComments(postId),
        getCurrentUser(),
      ]);

      setCommentList(loadedComments);
      setCurrentUserId(currentUser.id);
      setComments(
        loadedComments.length,
      );
      setCommentsLoaded(true);
    } catch (commentsLoadError) {
      setCommentError(
        commentsLoadError instanceof Error
          ? commentsLoadError.message
          : "Unable to load comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleCommentsToggle(): Promise<void> {
    const nextOpen = !commentsOpen;

    setCommentsOpen(nextOpen);

    if (
      nextOpen &&
      !commentsLoaded &&
      !commentsLoading
    ) {
      await loadComments();
    }
  }

  async function handleCreateComment(): Promise<void> {
    const trimmedComment =
      commentText.trim();

    if (!trimmedComment) {
      setCommentError(
        "Write something before posting your comment.",
      );
      return;
    }

    if (trimmedComment.length > 1000) {
      setCommentError(
        "Comment must be 1000 characters or less.",
      );
      return;
    }

    if (commentSubmitting) {
      return;
    }

    setCommentError("");
    setCommentSubmitting(true);

    try {
      const response =
        await createComment(
          postId,
          trimmedComment,
        );

      setCommentList((current) => [
        response.comment,
        ...current,
      ]);

      setComments(
        response.commentsCount,
      );

      setCommentText("");
      setCommentsLoaded(true);
    } catch (createError) {
      setCommentError(
        createError instanceof Error
          ? createError.message
          : "Unable to create comment.",
      );
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleDeleteComment(
    commentId: string,
  ): Promise<void> {
    if (deletingCommentId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this comment?",
      );

    if (!confirmed) {
      return;
    }

    setCommentError("");
    setDeletingCommentId(commentId);

    try {
      const response =
        await deleteComment(
          postId,
          commentId,
        );

      setCommentList((current) =>
        current.filter(
          (comment) =>
            comment.id !== commentId,
        ),
      );

      setComments(
        response.commentsCount,
      );
    } catch (deleteError) {
      setCommentError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete comment.",
      );
    } finally {
      setDeletingCommentId("");
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

      {error && (
        <div
          className="aio-error"
          role="alert"
        >
          {error}
        </div>
      )}

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
          className={
            commentsOpen
              ? "post-action comments-open"
              : "post-action"
          }
          onClick={() =>
            void handleCommentsToggle()
          }
          aria-label={
            commentsOpen
              ? "Hide comments"
              : `Show comments. ${comments} comments`
          }
          aria-expanded={commentsOpen}
        >
          {commentsLoading ? (
            <Loader2
              size={18}
              className="aio-spin"
            />
          ) : (
            <MessageCircle
              size={18}
            />
          )}

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

      {commentsOpen && (
        <section
          className="post-comments"
          aria-label="Comments"
        >
          <form
            className="comment-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreateComment();
            }}
          >
            <div
              className="comment-composer-avatar"
              aria-hidden="true"
            >
              AI
            </div>

            <div className="comment-composer-field">
              <textarea
                value={commentText}
                onChange={(event) =>
                  setCommentText(
                    event.target.value,
                  )
                }
                placeholder="Write a comment..."
                maxLength={1000}
                rows={2}
                aria-label="Write a comment"
                disabled={
                  commentSubmitting
                }
              />

              <div className="comment-composer-footer">
                <span>
                  {commentText.length}/1000
                </span>

                <button
                  type="submit"
                  className="aio-button aio-button-primary"
                  disabled={
                    commentSubmitting ||
                    !commentText.trim()
                  }
                >
                  {commentSubmitting ? (
                    <Loader2
                      size={16}
                      className="aio-spin"
                    />
                  ) : (
                    <Send size={16} />
                  )}

                  <span>
                    {commentSubmitting
                      ? "Posting..."
                      : "Comment"}
                  </span>
                </button>
              </div>
            </div>
          </form>

          {commentError && (
            <div
              className="aio-error"
              role="alert"
            >
              {commentError}
            </div>
          )}

          {commentsLoading ? (
            <div className="comments-loading">
              <Loader2
                size={20}
                className="aio-spin"
              />

              <span>
                Loading comments...
              </span>
            </div>
          ) : commentList.length === 0 ? (
            <div className="comments-empty">
              <MessageCircle
                size={22}
              />

              <strong>
                No comments yet
              </strong>

              <span>
                Be the first to join the
                conversation.
              </span>
            </div>
          ) : (
            <div className="comment-list">
              {commentList.map(
                (comment) => {
                  const author =
                    comment.author;

                  const displayName =
                    author?.displayName?.trim() ||
                    "AIO User";

                  const commentUsername =
                    author?.username?.trim() ||
                    "aio-user";

                  const commentInitials =
                    getInitials(
                      author?.displayName,
                      author?.username,
                    );

                  const canDelete =
                    Boolean(
                      currentUserId &&
                      comment.userId ===
                        currentUserId,
                    );

                  return (
                    <article
                      key={comment.id}
                      className="comment-item"
                    >
                      <div
                        className={`comment-avatar ${avatarClass}`}
                      >
                        {author?.avatarUrl ? (
                          <Image
                            src={
                              author.avatarUrl
                            }
                            alt={`${displayName}'s avatar`}
                            width={36}
                            height={36}
                            unoptimized
                          />
                        ) : (
                          commentInitials
                        )}
                      </div>

                      <div className="comment-body">
                        <div className="comment-header">
                          <div className="comment-author">
                            <strong>
                              {displayName}
                            </strong>

                            {author?.verified && (
                              <BadgeCheck
                                size={14}
                                strokeWidth={2.4}
                                aria-label="Verified account"
                              />
                            )}
                          </div>

                          <time>
                            {getCommentTime(
                              comment.createdAt,
                            )}
                          </time>
                        </div>

                        <div className="comment-username">
                          @{commentUsername}
                        </div>

                        <p>
                          {comment.content}
                        </p>

                        {canDelete && (
                          <button
                            type="button"
                            className="comment-delete"
                            onClick={() =>
                              void handleDeleteComment(
                                comment.id,
                              )
                            }
                            disabled={
                              deletingCommentId ===
                              comment.id
                            }
                            aria-label="Delete comment"
                          >
                            {deletingCommentId ===
                            comment.id ? (
                              <Loader2
                                size={14}
                                className="aio-spin"
                              />
                            ) : (
                              <Trash2
                                size={14}
                              />
                            )}

                            <span>
                              Delete
                            </span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      )}
    </article>
  );
}