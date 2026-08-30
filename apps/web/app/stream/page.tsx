"use client";

import AuthGuard from "@/components/auth/AuthGuard";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import CreatePanel from "@/components/stream/CreatePanel";

import CreatePostModal, {
  type CreatePostData,
} from "@/components/stream/CreatePostModal";

import PostCard from "@/components/stream/PostCard";

import {
  createPost,
  getPosts,
} from "@/lib/api";

import type {
  Post,
} from "../../../../packages/types/src/post";

interface StreamPost {
  postId: string;
  name: string;
  username: string;
  time: string;
  initials: string;
  avatarClass: string;
  content: string;
  imageUrl?: string;
  type?: "thought" | "space";
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
}

function formatTime(
  createdAt: string,
): string {
  const created =
    new Date(createdAt);

  const createdTime =
    created.getTime();

  if (
    Number.isNaN(createdTime)
  ) {
    return "now";
  }

  const difference =
    Math.max(
      0,
      Date.now() - createdTime,
    );

  const minutes =
    Math.floor(
      difference / 60000,
    );

  if (minutes < 1) {
    return "now";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours}h`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  if (days < 7) {
    return `${days}d`;
  }

  return created.toLocaleDateString();
}

function convertPost(
  post: Post,
): StreamPost {
  const authorId =
    typeof post.authorId === "string"
      ? post.authorId
      : "";

  const mongoPost = post as Post & {
    _id?: string;
  };

  const postId =
    typeof post.id === "string" &&
    post.id.length > 0
      ? post.id
      : typeof mongoPost._id === "string" &&
          mongoPost._id.length > 0
        ? mongoPost._id
        : "";

  const initials =
    authorId
      .slice(0, 2)
      .toUpperCase() || "AI";

  return {
    postId,

    name: "AIO User",

    username:
      authorId.length > 0
        ? `@${authorId.slice(0, 8)}`
        : "@aio-user",

    time:
      formatTime(
        post.createdAt,
      ),

    initials,

    avatarClass:
      "avatar-purple",

    content:
      typeof post.content === "string"
        ? post.content
        : "",

    imageUrl:
      post.imageUrl,

    type:
      post.type === "space"
        ? "space"
        : "thought",

    likesCount:
      typeof post.likesCount === "number"
        ? post.likesCount
        : 0,

    commentsCount:
      typeof post.commentsCount === "number"
        ? post.commentsCount
        : 0,

    bookmarksCount:
      typeof post.bookmarksCount === "number"
        ? post.bookmarksCount
        : 0,
  };
}

export default function StreamPage() {
  const [
    posts,
    setPosts,
  ] = useState<StreamPost[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const loadPosts =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getPosts();

          const convertedPosts =
            data
              .map(convertPost)
              .filter(
                (post) =>
                  post.postId.length > 0,
              );

          setPosts(
            convertedPosts,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load posts",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  async function handlePublish(
    post: CreatePostData,
  ) {
    if (publishing) {
      return;
    }

    const content =
      post.content.trim();

    if (
      !content &&
      !post.imageUrl
    ) {
      return;
    }

    try {
      setPublishing(true);
      setError("");

      await createPost(
        content,
        post.imageUrl,
        post.imageUrl
          ? "image"
          : "thought",
      );

      setCreateOpen(false);

      await loadPosts();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Failed to publish post",
      );
    } finally {
      setPublishing(false);
    }
  }



  function handleOpenCreate() {
    setError("");
    setCreateOpen(true);
  }

  function handleCloseCreate() {
    if (publishing) {
      return;
    }

    setCreateOpen(false);
  }

  return (
    <AuthGuard>
      <>
        <div className="aio-page-header">
          <div>
            <h1>
              Stream
            </h1>

            <p>
              What&apos;s happening
              in your world?
            </p>
          </div>
        </div>

        <section className="aio-feed">
          <CreatePanel
            onOpenCreate={
              handleOpenCreate
            }
          />

          {loading && (
            <div className="post-card">
              <p className="post-text">
                Loading your stream...
              </p>
            </div>
          )}

          {!loading &&
            error && (
              <div className="post-card">
                <p className="post-text">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void loadPosts()
                  }
                >
                  Try again
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            posts.length === 0 && (
              <div className="post-card">
                <p className="post-text">
                  No posts yet.
                  Be the first
                  to share
                  something.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            posts.map(
              (post, index) => (
                <PostCard
                  key={`${post.postId}-${index}`}
                  postId={
                    post.postId
                  }
                  name={
                    post.name
                  }
                  username={
                    post.username
                  }
                  time={
                    post.time
                  }
                  initials={
                    post.initials
                  }
                  avatarClass={
                    post.avatarClass
                  }
                  content={
                    post.content
                  }
                  imageUrl={
                    post.imageUrl
                  }
                  type={
                    post.type
                  }
                  likesCount={
                    post.likesCount
                  }
                  commentsCount={
                    post.commentsCount
                  }
                  bookmarksCount={
                    post.bookmarksCount
                  }
                />
              ),
            )}
        </section>

        <CreatePostModal
          open={
            createOpen
          }
          onClose={
            handleCloseCreate
          }
          onPublish={
            handlePublish
          }
        />

        {publishing && (
          <div
            aria-live="polite"
            style={{
              position:
                "fixed",
              bottom:
                "24px",
              left:
                "50%",
              transform:
                "translateX(-50%)",
              zIndex:
                1000,
            }}
          >
            Publishing...
          </div>
        )}
      </>
    </AuthGuard>
  );
}
