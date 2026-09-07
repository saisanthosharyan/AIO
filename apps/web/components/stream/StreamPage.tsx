"use client";

import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import CreatePostModal, {
  type CreatePostData,
} from "@/components/stream/CreatePostModal";
import PostCard from "@/components/stream/PostCard";
import {
  createPost,
  getPosts,
} from "@/lib/api";

interface StreamPost {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  type: "thought" | "image" | "space";
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function StreamPage() {
  const [posts, setPosts] =
    useState<StreamPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [createOpen, setCreateOpen] =
    useState(false);

  const loadPosts = useCallback(
    async (): Promise<void> => {
      try {
        setError("");

        const response = await getPosts();

        setPosts(response);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load posts",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialPosts(): Promise<void> {
      try {
        setError("");

        const response = await getPosts();

        if (cancelled) {
          return;
        }

        setPosts(response);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load posts",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchInitialPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRefresh(): Promise<void> {
    if (refreshing) {
      return;
    }

    setRefreshing(true);
    await loadPosts();
  }

  async function handlePublish(
    post: CreatePostData,
  ): Promise<void> {
    const response = await createPost(
      post.content,
      post.imageUrl,
      post.imageUrl
        ? "image"
        : "thought",
    );

    setPosts((currentPosts) => [
      response.post,
      ...currentPosts,
    ]);

    setCreateOpen(false);
  }

  return (
    <main className="aio-stream-page">
      <div className="aio-stream-header">
        <div>
          <h1>Stream</h1>
          <p>
            See what&apos;s happening.
          </p>
        </div>

        <div className="aio-stream-header-actions">
          <button
            type="button"
            className="aio-icon-button"
            onClick={() =>
              void handleRefresh()
            }
            disabled={refreshing}
            aria-label="Refresh posts"
          >
            {refreshing ? (
              <Loader2
                size={20}
                className="aio-spin"
              />
            ) : (
              <RefreshCw size={20} />
            )}
          </button>

          <button
            type="button"
            className="aio-create-button"
            onClick={() =>
              setCreateOpen(true)
            }
          >
            <Plus size={18} />
            <span>Create</span>
          </button>
        </div>
      </div>

      <CreatePostModal
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onPublish={handlePublish}
      />

      {loading ? (
        <div className="aio-stream-loading">
          <Loader2
            size={28}
            className="aio-spin"
          />

          <p>
            Loading posts...
          </p>
        </div>
      ) : error ? (
        <div className="aio-stream-error">
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              void loadPosts()
            }
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="aio-stream-empty">
          <h2>No posts yet</h2>

          <p>
            Create the first post and
            start the conversation.
          </p>

          <button
            type="button"
            className="aio-create-button"
            onClick={() =>
              setCreateOpen(true)
            }
          >
            <Plus size={18} />
            Create your first post
          </button>
        </div>
      ) : (
        <div className="aio-stream-feed">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              name="Santhosh"
              username="santhosh"
              time={new Date(
                post.createdAt,
              ).toLocaleString()}
              initials="SA"
              avatarClass="aio-avatar-default"
              content={post.content}
              imageUrl={post.imageUrl}
              type={post.type}
              likesCount={
                post.likesCount
              }
              commentsCount={
                post.commentsCount
              }
              bookmarksCount={
                post.bookmarksCount
              }
              isLiked={
                post.isLiked
              }
              isBookmarked={
                post.isBookmarked
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}