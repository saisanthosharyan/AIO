"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  bookmarkPost,
  createComment,
  deleteComment,
  getComments,
  likePost,
  unbookmarkPost,
  unlikePost,
} from "@/lib/api";

import type {
  Comment,
} from "../../../../packages/types/src/post";

import {
  Bookmark,
  Check,
  Heart,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Users,
  X,
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

function formatCommentTime(
  createdAt: string,
): string {
  const created = new Date(createdAt);
  const createdTime = created.getTime();

  if (Number.isNaN(createdTime)) {
    return "now";
  }

  const difference = Math.max(
    0,
    Date.now() - createdTime,
  );

  const minutes = Math.floor(
    difference / 60000,
  );

  if (minutes < 1) {
    return "now";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d`;
  }

  return created.toLocaleDateString();
}

function normalizeComment(
  comment: Comment & {
    id?: string;
  },
): Comment {
  return {
    id:
      typeof comment.id === "string" &&
      comment.id.length > 0
        ? comment.id
        : crypto.randomUUID(),
    userId: comment.userId,
    postId: comment.postId,
    content: comment.content,
    createdAt: comment.createdAt,
    ...(comment.updatedAt
      ? {
          updatedAt: comment.updatedAt,
        }
      : {}),
  };
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
    commentsOpen,
    setCommentsOpen,
  ] = useState(false);

  const [
    commentsLoading,
    setCommentsLoading,
  ] = useState(false);

  const [
    commentSubmitting,
    setCommentSubmitting,
  ] = useState(false);

  const [
    commentDeleting,
    setCommentDeleting,
  ] = useState<string | null>(null);

  const [
    commentText,
    setCommentText,
  ] = useState("");

  const [
    commentList,
    setCommentList,
  ] = useState<Comment[]>([]);

  const [
    commentsLoaded,
    setCommentsLoaded,
  ] = useState(false);

  const [shared, setShared] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    commentError,
    setCommentError,
  ] = useState("");

  useEffect(() => {
    setLikes(likesCount);
  }, [likesCount]);

  useEffect(() => {
    setComments(commentsCount);
  }, [commentsCount]);

  useEffect(() => {
    setBookmarks(bookmarksCount);
  }, [bookmarksCount]);

  async function loadComments(): Promise<void> {
    try {
      setCommentsLoading(true);
      setCommentError("");

      const data =
        await getComments(postId);

      setCommentList(
        data.map((comment) =>
          normalizeComment(comment),
        ),
      );

      setCommentsLoaded(true);
    } catch (commentLoadError) {
      setCommentError(
        commentLoadError instanceof Error
          ? commentLoadError.message
          : "Unable to load comments",
      );
    } finally {
      setCommentsLoading(false);
    }
  }

  async function handleToggleComments(): Promise<void> {
    const nextOpen = !commentsOpen;

    setCommentsOpen(nextOpen);

    if (
      nextOpen &&
      !commentsLoaded
    ) {
      await loadComments();
    }
  }

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

  async function handleShare(): Promise<void> {
    try {
      if (
        typeof navigator.share ===
        "function"
      ) {
        await navigator.share({
          title: `${name} on AIO`,
          text: content,
        });
      } else if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          content,
        );
      } else {
        throw new Error(
          "Sharing is not supported",
        );
      }

      setShared(true);

      window.setTimeout(() => {
        setShared(false);
      }, 2000);
    } catch {
      return;
    }
  }

  async function handleSubmitComment(): Promise<void> {
    const trimmed =
      commentText.trim();

    if (
      !trimmed ||
      commentSubmitting
    ) {
      return;
    }

    if (trimmed.length > 1000) {
      setCommentError(
        "Comment cannot exceed 1000 characters.",
      );
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentError("");

      const response =
        await createComment(
          postId,
          trimmed,
        );

      const newComment =
        normalizeComment(
          response.comment,
        );

      setCommentList(
        (currentComments) => [
          newComment,
          ...currentComments,
        ],
      );

      setComments(
        response.commentsCount,
      );

      setCommentText("");
      setCommentsLoaded(true);
    } catch (commentCreateError) {
      setCommentError(
        commentCreateError instanceof Error
          ? commentCreateError.message
          : "Unable to create comment",
      );
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleDeleteComment(
    commentId: string,
  ): Promise<void> {
    if (commentDeleting) {
      return;
    }

    try {
      setCommentDeleting(commentId);
      setCommentError("");

      const response =
        await deleteComment(
          postId,
          commentId,
        );

      setCommentList(
        (currentComments) =>
          currentComments.filter(
            (comment) =>
              comment.id !== commentId,
          ),
      );

      setComments(
        response.commentsCount,
      );
    } catch (commentDeleteError) {
      setCommentError(
        commentDeleteError instanceof Error
          ? commentDeleteError.message
          : "Unable to delete comment",
      );
    } finally {
      setCommentDeleting(null);
    }
  }

  function handleCommentKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void handleSubmitComment();
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
                  Build for the
                  feeling, not the
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
                2.8K people exploring
                the future of AI
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

      {error && (
        <p
          style={{
            color: "var(--aio-danger)",
            fontSize: "13px",
            margin: "0 20px 12px",
          }}
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="post-footer">
        <button
          type="button"
          className={liked ? "liked" : ""}
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
          className={
            commentsOpen
              ? "active"
              : ""
          }
          onClick={() =>
            void handleToggleComments()
          }
          aria-label={`View ${comments} comments`}
          aria-expanded={commentsOpen}
        >
          <MessageSquare size={19} />

          <span>{comments}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            void handleShare()
          }
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
          onClick={() =>
            void handleBookmark()
          }
          disabled={bookmarkLoading}
          aria-label={
            saved
              ? "Remove from saved"
              : "Save post"
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

          <span className="sr-only">
            {bookmarks}
          </span>
        </button>
      </div>

      {commentsOpen && (
        <section
          className="post-comments"
          aria-label="Comments"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              padding:
                "16px 20px 12px",
              borderTop:
                "1px solid var(--aio-border)",
            }}
          >
            <strong>Comments</strong>

            <button
              type="button"
              onClick={() =>
                setCommentsOpen(false)
              }
              aria-label="Close comments"
              style={{
                background:
                  "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            style={{
              padding: "0 20px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-end",
              }}
            >
              <textarea
                value={commentText}
                onChange={(event) =>
                  setCommentText(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleCommentKeyDown
                }
                placeholder="Write a comment..."
                maxLength={1000}
                rows={2}
                disabled={
                  commentSubmitting
                }
                aria-label="Write a comment"
                style={{
                  flex: 1,
                  resize: "vertical",
                  minHeight: "42px",
                  maxHeight: "120px",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border:
                    "1px solid var(--aio-border)",
                  background:
                    "var(--aio-surface)",
                  color:
                    "var(--aio-text)",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  void handleSubmitComment()
                }
                disabled={
                  commentSubmitting ||
                  !commentText.trim()
                }
                aria-label="Post comment"
                style={{
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  borderRadius: "50%",
                  border: "none",
                  cursor:
                    commentSubmitting ||
                    !commentText.trim()
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    commentSubmitting ||
                    !commentText.trim()
                      ? 0.5
                      : 1,
                }}
              >
                {commentSubmitting ? (
                  <Loader2
                    size={18}
                    className="aio-spin"
                  />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <small
              style={{
                display: "block",
                marginTop: "6px",
                opacity: 0.6,
              }}
            >
              Press Enter to comment ·
              Shift + Enter for a new
              line
            </small>
          </div>

          {commentError && (
            <p
              role="alert"
              style={{
                color:
                  "var(--aio-danger)",
                fontSize: "13px",
                margin:
                  "0 20px 12px",
              }}
            >
              {commentError}
            </p>
          )}

          {commentsLoading && (
            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                alignItems: "center",
                gap: "8px",
                padding: "20px",
                opacity: 0.7,
              }}
            >
              <Loader2
                size={18}
                className="aio-spin"
              />

              <span>
                Loading comments...
              </span>
            </div>
          )}

          {!commentsLoading &&
            commentsLoaded &&
            commentList.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                  opacity: 0.65,
                }}
              >
                No comments yet. Be
                the first to comment.
              </p>
            )}

          {!commentsLoading &&
            commentList.length > 0 && (
              <div
                style={{
                  borderTop:
                    "1px solid var(--aio-border)",
                }}
              >
                {commentList.map(
                  (comment) => (
                    <div
                      key={comment.id}
                      style={{
                        display: "flex",
                        gap: "10px",
                        padding:
                          "14px 20px",
                        borderBottom:
                          "1px solid var(--aio-border)",
                      }}
                    >
                      <div
                        className="avatar avatar-purple"
                        style={{
                          width: "34px",
                          height: "34px",
                          minWidth: "34px",
                          fontSize: "11px",
                        }}
                      >
                        {comment.userId
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: "8px",
                          }}
                        >
                          <strong
                            style={{
                              fontSize:
                                "13px",
                            }}
                          >
                            AIO User
                          </strong>

                          <span
                            style={{
                              fontSize:
                                "11px",
                              opacity: 0.55,
                            }}
                          >
                            {formatCommentTime(
                              comment.createdAt,
                            )}
                          </span>
                        </div>

                        <p
                          style={{
                            margin:
                              "5px 0 0",
                            fontSize:
                              "14px",
                            lineHeight: 1.5,
                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          {comment.content}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDeleteComment(
                            comment.id,
                          )
                        }
                        disabled={
                          commentDeleting ===
                          comment.id
                        }
                        aria-label="Delete comment"
                        style={{
                          alignSelf:
                            "center",
                          background:
                            "transparent",
                          border: "none",
                          cursor:
                            "pointer",
                          opacity:
                            commentDeleting ===
                            comment.id
                              ? 0.5
                              : 0.65,
                        }}
                      >
                        {commentDeleting ===
                        comment.id ? (
                          <Loader2
                            size={16}
                            className="aio-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
        </section>
      )}
    </article>
  );
}