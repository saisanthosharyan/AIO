"use client";

import Image from "next/image";
import { BadgeCheck, Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Comment } from "../../../../packages/types/src/post";

export interface CommentThreadNode {
  comment: Comment;
  children: CommentThreadNode[];
}

interface CommentThreadProps {
  nodes: CommentThreadNode[];
  currentUserId: string;
  avatarClass: string;
  deletingCommentId: string;
  onReply: (parentCommentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function relativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

function ThreadItem({
  node,
  currentUserId,
  avatarClass,
  deletingCommentId,
  onReply,
  onDelete,
}: Omit<CommentThreadProps, "nodes"> & { node: CommentThreadNode }) {
  const { comment, children } = node;
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const deleted = comment.isDeleted;
  const author = comment.author;
  const name = deleted ? "Deleted user" : author?.displayName || "AIO User";
  const canDelete = !deleted && !!currentUserId && comment.userId === currentUserId;

  async function submitReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = replyText.trim();
    if (!text || text.length > 1000 || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      await onReply(comment.id, text);
      setReplyText("");
      setReplyOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post reply.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="aio-thread-node">
      {deleted ? (
        <div className="aio-thread-deleted-row">
          <span>This comment was deleted</span>
        </div>
      ) : (
      <article className="comment-item">
        <div className={`comment-avatar ${avatarClass}`}>
          {!deleted && author?.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={`${name}'s avatar`}
              width={36}
              height={36}
              unoptimized
            />
          ) : deleted ? (
            "—"
          ) : (
            initials(name)
          )}
        </div>

        <div className="comment-body">
          <div className="comment-header">
            <div className="comment-author">
              <strong>{name}</strong>
              {!deleted && author?.verified && <BadgeCheck size={14} />}
            </div>
            <time>{relativeTime(comment.createdAt)}</time>
          </div>

          {!deleted && author?.username && (
            <div className="comment-username">@{author.username}</div>
          )}

          <p className={deleted ? "aio-thread-deleted" : ""}>
            {deleted ? "This comment was deleted" : comment.content}
          </p>

          {!deleted && (
            <div className="aio-thread-actions">
              <button
                type="button"
                className="aio-thread-reply-button"
                onClick={() => setReplyOpen((open) => !open)}
                aria-expanded={replyOpen}
              >
                <MessageCircle size={14} />
                Reply
              </button>

              {canDelete && (
                <button
                  type="button"
                  className="comment-delete"
                  disabled={deletingCommentId === comment.id}
                  onClick={() => void onDelete(comment.id)}
                >
                  {deletingCommentId === comment.id
                    ? <Loader2 size={14} className="aio-spin" />
                    : <Trash2 size={14} />}
                  Delete
                </button>
              )}
            </div>
          )}

          {replyOpen && !deleted && (
            <form className="aio-thread-reply-composer" onSubmit={submitReply}>
              <div className="comment-username">
                Replying to @{author?.username || "aio-user"}
              </div>
              <textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                maxLength={1000}
                placeholder="Post your reply..."
                aria-label="Write a reply"
                disabled={submitting}
                autoFocus
              />
              <div className="comment-composer-footer">
                <span>{replyText.length}/1000</span>
                <button
                  type="submit"
                  className="aio-button aio-button-primary"
                  disabled={!replyText.trim() || submitting}
                >
                  {submitting
                    ? <Loader2 size={16} className="aio-spin" />
                    : <Send size={16} />}
                  Reply
                </button>
              </div>
              {error && <div className="aio-error" role="alert">{error}</div>}
            </form>
          )}
        </div>
      </article>
      )}

      {children.length > 0 && (
        <div className="aio-thread-children">
          {children.map((child) => (
            <ThreadItem
              key={child.comment.id}
              node={child}
              currentUserId={currentUserId}
              avatarClass={avatarClass}
              deletingCommentId={deletingCommentId}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentThread({
  nodes,
  currentUserId,
  avatarClass,
  deletingCommentId,
  onReply,
  onDelete,
}: CommentThreadProps) {
  return (
    <div className="aio-thread">
      {nodes.map((node) => (
        <ThreadItem
          key={node.comment.id}
          node={node}
          currentUserId={currentUserId}
          avatarClass={avatarClass}
          deletingCommentId={deletingCommentId}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
