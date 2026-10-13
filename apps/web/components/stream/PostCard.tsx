
"use client";
import CommentThread from "./CommentThread";

import Image from "next/image";
import {
  BadgeCheck,
  Bookmark,
  Heart,
  Link2,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  authorId?: string;
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
  onDeleted?: (postId: string) => void;
}

function getCommentTime(createdAt: string): string {
  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) return "";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - created.getTime()) / 1000),
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

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

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

interface CommentThreadNode {
  comment: Comment;
  children: CommentThreadNode[];
}

function buildCommentTree(comments: Comment[]): CommentThreadNode[] {
  const nodes = new Map<string, CommentThreadNode>();
  const roots: CommentThreadNode[] = [];

  for (const comment of comments) {
    nodes.set(comment.id, {
      comment,
      children: [],
    });
  }

  for (const comment of comments) {
    const node = nodes.get(comment.id)!;
    const parent = comment.parentCommentId
      ? nodes.get(comment.parentCommentId)
      : undefined;

    if (parent && parent !== node) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
export default function PostCard({
  postId,
  authorId,
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
  onDeleted,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isBookmarked);

  const [likes, setLikes] = useState(likesCount);
  const [comments, setComments] = useState(commentsCount);
  const [bookmarks, setBookmarks] = useState(bookmarksCount);

  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);

  const isPostOwner = Boolean(
    authorId &&
    currentUserId &&
    String(authorId) === String(currentUserId),
  );

  const safeName = name.trim() || "AIO User";
  const safeUsername =
    username.replace(/^@/, "").trim() || "aio-user";
  const safeInitials =
    initials.trim().slice(0, 2).toUpperCase() || "AI";

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const user = await getCurrentUser();

        if (active) {
          setCurrentUserId(user.id);
        }
      } catch {
        if (active) {
          setCurrentUserId("");
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handleOutsideClick(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!deleteDialogOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleteLoading) {
        setDeleteDialogOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [deleteDialogOpen, deleteLoading]);

  function getPostUrl(): string {
    return `${window.location.origin}/post/${encodeURIComponent(postId)}`;
  }

  async function copyPostLink(): Promise<void> {
    setMenuOpen(false);
    setError("");
    setShareMessage("");

    try {
      await navigator.clipboard.writeText(getPostUrl());
      setShareMessage("Post link copied to clipboard.");
    } catch {
      setError("Unable to copy post link.");
    }
  }

  async function handleShare(): Promise<void> {
    setError("");
    setShareMessage("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${safeName}`,
          text: content,
          url: getPostUrl(),
        });
      } else {
        await copyPostLink();
      }
    } catch (shareError) {
      if (
        shareError instanceof Error &&
        shareError.name === "AbortError"
      ) {
        return;
      }

      setError("Unable to share this post.");
    }
  }

  async function handleLike(): Promise<void> {
    if (likeLoading) return;

    const previousLiked = liked;
    const previousLikes = likes;

    setError("");
    setLikeLoading(true);

    setLiked(!previousLiked);
    setLikes((count) =>
      Math.max(0, count + (previousLiked ? -1 : 1)),
    );

    try {
      const response = previousLiked
        ? await unlikePost(postId)
        : await likePost(postId);

      setLikes(response.likesCount);
    } catch (err) {
      setLiked(previousLiked);
      setLikes(previousLikes);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update like.",
      );
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleBookmark(): Promise<void> {
    if (bookmarkLoading) return;

    const previousSaved = saved;
    const previousBookmarks = bookmarks;

    setError("");
    setBookmarkLoading(true);

    setSaved(!previousSaved);
    setBookmarks((count) =>
      Math.max(0, count + (previousSaved ? -1 : 1)),
    );

    try {
      const response = previousSaved
        ? await unbookmarkPost(postId)
        : await bookmarkPost(postId);

      setBookmarks(response.bookmarksCount);
    } catch (err) {
      setSaved(previousSaved);
      setBookmarks(previousBookmarks);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update bookmark.",
      );
    } finally {
      setBookmarkLoading(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (deleteLoading || !isPostOwner) return;

    setError("");
    setDeleteLoading(true);

    try {
      await deletePost(postId);

      setDeleteDialogOpen(false);

      if (onDeleted) {
        onDeleted(postId);
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete post.",
      );

      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function loadComments(): Promise<void> {
    setCommentsLoading(true);
    setCommentError("");

    try {
      const loadedComments = await getComments(postId);

      setCommentList(loadedComments);
      setComments(loadedComments.filter((comment) => !comment.isDeleted).length);
    } catch (err) {
      setCommentError(
        err instanceof Error
          ? err.message
          : "Unable to load comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleCommentsToggle(): Promise<void> {
    if (commentsLoading) return;

    const nextOpen = !commentsOpen;
    setCommentsOpen(nextOpen);

    if (nextOpen) {
      await loadComments();
    }
  }

  async function handleCreateComment(): Promise<void> {
    const trimmed = commentText.trim();

    if (!trimmed) {
      setCommentError("Write something before posting.");
      return;
    }

    if (trimmed.length > 1000) {
      setCommentError(
        "Comment must be 1000 characters or less.",
      );
      return;
    }

    if (commentSubmitting) return;

    setCommentError("");
    setCommentSubmitting(true);

    try {
      const response = await createComment(postId, trimmed);

      setCommentList((current) => [
        response.comment,
        ...current,
      ]);

      setComments(response.commentsCount);
      setCommentText("");
    } catch (err) {
      setCommentError(
        err instanceof Error
          ? err.message
          : "Unable to create comment.",
      );
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleCreateReply(
    parentCommentId: string,
    content: string,
  ): Promise<void> {
    const trimmed = content.trim();

    if (!trimmed || trimmed.length > 1000) {
      throw new Error("Reply must contain 1 to 1000 characters.");
    }

    const response = await createComment(
      postId,
      trimmed,
      parentCommentId,
    );

    setCommentList((current) => [
      ...current,
      response.comment,
    ]);

    setComments(response.commentsCount);
  }
  async function handleDeleteComment(
    commentId: string,
  ): Promise<void> {
    if (deletingCommentId) return;

    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    setCommentError("");
    setDeletingCommentId(commentId);

    try {
      const response = await deleteComment(postId, commentId);

      setCommentList((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isDeleted: true,
                deletedAt: new Date().toISOString(),
                content: "[deleted]",
                userId: null,
                author: null,
              }
            : comment,
        ),
      );

      setComments(response.commentsCount);
    } catch (err) {
      setCommentError(
        err instanceof Error
          ? err.message
          : "Unable to delete comment.",
      );
    } finally {
      setDeletingCommentId("");
    }
  }

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
              <strong>{safeName}</strong>

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
              <span>@{safeUsername}</span>
              <span
                className="post-meta-dot"
                aria-hidden="true"
              >
                Â·
              </span>
              <time>{time}</time>
            </div>
          </div>
        </div>

        <div
          ref={menuRef}
          className="aio-post-menu-wrap"
          style={{ position: "relative" }}
        >
          <button
            type="button"
            className="more-button"
            aria-label="Post options"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <Loader2 size={18} className="aio-spin" />
            ) : (
              <MoreHorizontal size={20} />
            )}
          </button>

          {menuOpen && (
            <div
              className="aio-post-menu"
              role="menu"
              aria-label="Post options"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                zIndex: 100,
                minWidth: 210,
                padding: 6,
                borderRadius: 12,
                border: "1px solid var(--canvas-border)",
                background: "var(--canvas-surface)",
                color: "var(--canvas-text)",
                boxShadow: "0 12px 35px rgba(0,0,0,.3)",
              }}
            >
              <button
                type="button"
                role="menuitem"
                className="aio-post-menu-item"
                onClick={() => void copyPostLink()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "11px 12px",
                  border: 0,
                  borderRadius: 8,
                  background: "transparent",
                  color: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <Link2 size={17} />
                Copy post link
              </button>

              <button
                type="button"
                role="menuitem"
                className="aio-post-menu-item"
                disabled={bookmarkLoading}
                onClick={() => {
                  setMenuOpen(false);
                  void handleBookmark();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "11px 12px",
                  border: 0,
                  borderRadius: 8,
                  background: "transparent",
                  color: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <Bookmark size={17} />
                {saved ? "Remove bookmark" : "Save post"}
              </button>

              {isPostOwner && (
                <button
                  type="button"
                  role="menuitem"
                  className="aio-post-menu-item"
                  disabled={deleteLoading}
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteDialogOpen(true);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "11px 12px",
                    border: 0,
                    borderRadius: 8,
                    background: "transparent",
                    color: "#ef4444",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={17} />
                  Delete post
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="post-content">
        {content && <p className="post-text">{content}</p>}

        {imageUrl && (
          <div className="post-media">
            <Image
              src={imageUrl}
              alt="Post attachment"
              width={1200}
              height={675}
              sizes="(max-width: 760px) 100vw, 640px"
              className="post-media-image"
              unoptimized
            />
          </div>
        )}

        {type === "space" && (
          <span className="aio-badge">Space</span>
        )}
      </div>

      {error && (
        <div className="aio-error" role="alert">
          {error}
        </div>
      )}

      {shareMessage && (
        <div role="status" style={{ fontSize: 12, padding: 8 }}>
          {shareMessage}
        </div>
      )}

      <footer className="post-footer">
        <button
          type="button"
          className={liked ? "post-action liked" : "post-action"}
          onClick={() => void handleLike()}
          disabled={likeLoading}
          aria-label={liked ? "Unlike post" : "Like post"}
          aria-pressed={liked}
        >
          {likeLoading ? (
            <Loader2 size={18} className="aio-spin" />
          ) : (
            <Heart
              size={18}
              fill={liked ? "currentColor" : "none"}
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
          onClick={() => void handleCommentsToggle()}
          aria-label={
            commentsOpen
              ? "Hide comments"
              : `Show comments. ${comments} comments`
          }
          aria-expanded={commentsOpen}
        >
          {commentsLoading ? (
            <Loader2 size={18} className="aio-spin" />
          ) : (
            <MessageCircle size={18} />
          )}
          <span>{comments}</span>
        </button>

        <button
          type="button"
          className={saved ? "post-action saved" : "post-action"}
          onClick={() => void handleBookmark()}
          disabled={bookmarkLoading}
          aria-label={
            saved ? "Remove bookmark" : "Bookmark post"
          }
          aria-pressed={saved}
        >
          {bookmarkLoading ? (
            <Loader2 size={18} className="aio-spin" />
          ) : (
            <Bookmark
              size={18}
              fill={saved ? "currentColor" : "none"}
            />
          )}
          <span>{bookmarks}</span>
        </button>

        <button
          type="button"
          className="post-action"
          aria-label="Share post"
          onClick={() => void handleShare()}
        >
          <Send size={18} />
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
                  setCommentText(event.target.value)
                }
                placeholder="Write a comment..."
                maxLength={1000}
                rows={2}
                aria-label="Write a comment"
                disabled={commentSubmitting}
              />

              <div className="comment-composer-footer">
                <span>{commentText.length}/1000</span>

                <button
                  type="submit"
                  className="aio-button aio-button-primary"
                  disabled={
                    commentSubmitting || !commentText.trim()
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
            <div className="aio-error" role="alert">
              {commentError}
            </div>
          )}

          {commentsLoading ? (
            <div className="comments-loading">
              <Loader2
                size={20}
                className="aio-spin"
              />
              <span>Loading comments...</span>
            </div>
          ) : commentList.length === 0 ? (
            <div className="comments-empty">
              <MessageCircle size={22} />
              <strong>No comments yet</strong>
              <span>
                Be the first to join the conversation.
              </span>
            </div>
          ) : (
            <div className="comment-list">
              <CommentThread
  nodes={buildCommentTree(commentList)}
  currentUserId={currentUserId}
  avatarClass={avatarClass}
  deletingCommentId={deletingCommentId}
  onReply={handleCreateReply}
  onDelete={handleDeleteComment}
/>
            </div>
          )}
        </section>
      )}

      {deleteDialogOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleteLoading
            ) {
              setDeleteDialogOpen(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(0,0,0,.65)",
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${postId}`}
            aria-describedby={`delete-desc-${postId}`}
            style={{
              width: "100%",
              maxWidth: 390,
              padding: 24,
              borderRadius: 18,
              border: "1px solid var(--canvas-border)",
              background: "var(--canvas-surface)",
              color: "var(--canvas-text)",
              boxShadow: "0 20px 60px rgba(0,0,0,.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                id={`delete-title-${postId}`}
                style={{
                  fontSize: 21,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Delete post?
              </h2>

              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteLoading}
                aria-label="Close dialog"
                style={{
                  border: 0,
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p
              id={`delete-desc-${postId}`}
              style={{
                margin: "12px 0 24px",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--canvas-muted)",
              }}
            >
              This action cannot be undone. Your post will
              be permanently deleted from AIO.
            </p>

            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleteLoading}
              style={{
                width: "100%",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: 0,
                borderRadius: 24,
                background: "#dc2626",
                color: "#fff",
                fontWeight: 700,
                cursor: deleteLoading ? "wait" : "pointer",
              }}
            >
              {deleteLoading ? (
                <Loader2
                  size={18}
                  className="aio-spin"
                />
              ) : (
                <Trash2 size={18} />
              )}
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>

            <button
              type="button"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
              style={{
                width: "100%",
                minHeight: 44,
                marginTop: 10,
                border: "1px solid var(--canvas-border)",
                borderRadius: 24,
                background: "transparent",
                color: "var(--canvas-text)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </section>
        </div>
      )}
    </article>
  );
}
