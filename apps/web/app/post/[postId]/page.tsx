"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import PostCard from "@/components/stream/PostCard";
import { getPost } from "@/lib/api";

type PostData = Awaited<ReturnType<typeof getPost>>;

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "A";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] + words[words.length - 1][0]
  ).toUpperCase();
}

function getPostTime(createdAt: string): string {
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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();

  const postId =
    typeof params.postId === "string"
      ? params.postId
      : "";

  const [post, setPost] =
    useState<PostData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!postId) {
      setError("Invalid post ID");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPost() {
      try {
        setLoading(true);
        setError("");

        const data = await getPost(postId);

        if (!cancelled) {
          setPost(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load post",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const author = post?.author;

  const name =
    author?.displayName ||
    author?.username ||
    "AIO User";

  const username =
    author?.username || "unknown";

  const initials = getInitials(name);

  return (
    <main className="post-detail-page">
      <div className="post-detail-header">
        <button
          type="button"
          className="post-detail-back"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1>Post</h1>
          <p>View post and comments</p>
        </div>
      </div>

      <section className="post-detail-content">
        {loading && (
          <div className="post-detail-state">
            Loading post...
          </div>
        )}

        {!loading && error && (
          <div className="post-detail-state post-detail-error">
            <h2>Unable to load post</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                router.push("/stream")
              }
            >
              Back to Stream
            </button>
          </div>
        )}

        {!loading && !error && post && (
          <PostCard
            postId={post.id}
            name={name}
            username={username}
            time={getPostTime(post.createdAt)}
            initials={initials}
            avatarClass="avatar-teal"
            content={post.content}
            imageUrl={post.imageUrl}
            avatarUrl={author?.avatarUrl}
            verified={author?.verified ?? false}
            type={post.type}
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            bookmarksCount={post.bookmarksCount}
            isLiked={post.isLiked}
            isBookmarked={post.isBookmarked}
          />
        )}
      </section>
    </main>
  );
}