"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import CreatePanel from "@/components/stream/CreatePanel";
import CreatePostModal, {
  type CreatePostData,
} from "@/components/stream/CreatePostModal";
import PostCard from "@/components/stream/PostCard";
import { createPost, getPosts } from "@/lib/api";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

interface PostAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  verified: boolean;
}

interface ApiPost {
  id?: string;
  _id?: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  type: "thought" | "image" | "space";
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  createdAt: string;
  updatedAt: string;
  author?: PostAuthor;
  isLiked: boolean;
  isBookmarked: boolean;
}

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
  isLiked: boolean;
  isBookmarked: boolean;
  verified: boolean;
  avatarUrl?: string;
}

type StreamFeed =
  | "for-you"
  | "following";

/* =========================================================
   HELPERS
   ========================================================= */

function formatTime(createdAt: string): string {
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

function getInitials(
  displayName: string,
  username: string,
): string {
  const source =
    displayName.trim() ||
    username.trim();

  if (!source) {
    return "AI";
  }

  const words = source
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return source
    .slice(0, 2)
    .toUpperCase();
}

/* =========================================================
   API POST -> UI POST
   ========================================================= */

function convertPost(
  post: ApiPost,
): StreamPost {
  const postId =
    typeof post.id === "string" &&
    post.id.length > 0
      ? post.id
      : typeof post._id === "string" &&
          post._id.length > 0
        ? post._id
        : "";

  const author = post.author;

  const displayName =
    author?.displayName?.trim() ||
    "AIO User";

  const username =
    author?.username?.trim() ||
    "";

  const initials = getInitials(
    displayName,
    username,
  );

  return {
    postId,

    name: displayName,

    username:
      username.length > 0
        ? `@${username}`
        : "@aio-user",

    time: formatTime(
      post.createdAt,
    ),

    initials,

    avatarClass: "avatar-purple",

    content:
      typeof post.content === "string"
        ? post.content
        : "",

    imageUrl: post.imageUrl,

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

    isLiked:
      post.isLiked === true,

    isBookmarked:
      post.isBookmarked === true,

    verified:
      author?.verified === true,

    ...(author?.avatarUrl
      ? {
          avatarUrl:
            author.avatarUrl,
        }
      : {}),
  };
}

/* =========================================================
   STREAM PAGE
   ========================================================= */

function StreamPageContent() {
  const searchParams = useSearchParams();

  const [activeFeed, setActiveFeed] =
    useState<StreamFeed>(
      "for-you",
    );

  const [posts, setPosts] =
    useState<StreamPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [publishing, setPublishing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [createOpen, setCreateOpen] =
    useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setError("");
      setCreateOpen(true);
    }
  }, [searchParams]);

  /* =======================================================
     LOAD POSTS
     ======================================================= */

  const loadPosts = useCallback(
    async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPosts(activeFeed);

        const apiPosts =
          data as unknown as ApiPost[];

        const convertedPosts =
          apiPosts
            .map(convertPost)
            .filter(
              (post) =>
                post.postId.length > 0,
            );

        setPosts(convertedPosts);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load posts",
        );
      } finally {
        setLoading(false);
      }
    },
    [activeFeed],
  );

  /* =======================================================
     FEED LOAD

     Runs initially and whenever the user changes
     between For You and Following.
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts(): Promise<void> {
      try {
        const data =
          await getPosts(activeFeed);

        if (cancelled) {
          return;
        }

        const apiPosts =
          data as unknown as ApiPost[];

        const convertedPosts =
          apiPosts
            .map(convertPost)
            .filter(
              (post) =>
                post.postId.length > 0,
            );

        setPosts(convertedPosts);
        setError("");
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load posts",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [activeFeed]);

  /* =======================================================
     CREATE / PUBLISH
     ======================================================= */

  async function handlePublish(
    post: CreatePostData,
  ): Promise<void> {
    if (publishing) {
      return;
    }

    const content =
      post.content.trim();

    if (!content && !post.imageUrl) {
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

  function handleOpenCreate(): void {
    setError("");
    setCreateOpen(true);
  }

  function handleCloseCreate(): void {
    if (publishing) {
      return;
    }

    setCreateOpen(false);
  }

  /* =======================================================
     FEED CHANGE
     ======================================================= */

  function handleFeedChange(
    feed: StreamFeed,
  ): void {
    if (feed === activeFeed) {
      return;
    }

    setLoading(true);
    setError("");
    setPosts([]);
    setActiveFeed(feed);
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <AuthGuard>
      <>
        <header className="aio-v2-stream-header">
          <div className="aio-v2-stream-heading">
            <div>
              <span className="aio-v2-stream-eyebrow">
                Your world
              </span>

              <h1>Stream</h1>

              <p>
                Discover what&apos;s happening across AIO.
              </p>
            </div>
          </div>

          <nav
            className="aio-v2-stream-tabs"
            aria-label="Stream filters"
          >
            <button
              type="button"
              className={`aio-v2-stream-tab ${
                activeFeed === "for-you"
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                handleFeedChange("for-you")
              }
              aria-pressed={
                activeFeed === "for-you"
              }
            >
              For You
            </button>

            <button
              type="button"
              className={`aio-v2-stream-tab ${
                activeFeed === "following"
                  ? "is-active"
                  : ""
              }`}
              onClick={() =>
                handleFeedChange("following")
              }
              aria-pressed={
                activeFeed === "following"
              }
            >
              Following
            </button>

            <button
              type="button"
              className="aio-v2-stream-tab"
              disabled
              title="Coming soon"
              aria-disabled="true"
            >
              Spaces
            </button>

            <button
              type="button"
              className="aio-v2-stream-tab"
              disabled
              title="Coming soon"
              aria-disabled="true"
            >
              Local
            </button>

            <button
              type="button"
              className="aio-v2-stream-tab"
              disabled
              title="Coming soon"
              aria-disabled="true"
            >
              Global
            </button>
          </nav>
        </header>

        <section className="aio-feed">
          {/* =================================================
              CREATE PANEL
             ================================================= */}

          <CreatePanel
            onOpenCreate={
              handleOpenCreate
            }
          />

          {/* =================================================
              LOADING
             ================================================= */}

          {loading && (
            <div className="post-card">
              <p className="post-text">
                {activeFeed === "following"
                  ? "Loading posts from people you follow..."
                  : "Loading your stream..."}
              </p>
            </div>
          )}

          {/* =================================================
              ERROR
             ================================================= */}

          {!loading && error && (
            <div className="post-card">
              <p className="post-text">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  void loadPosts()
                }
                className="aio-button aio-button-small aio-button-secondary"
              >
                Try again
              </button>
            </div>
          )}

          {/* =================================================
              EMPTY STATE
             ================================================= */}

          {!loading &&
            !error &&
            posts.length === 0 && (
              <div className="post-card">
                <p className="post-text">
                  {activeFeed === "following"
                    ? "No posts from people you follow yet. Follow people to build your Following feed."
                    : "No posts yet. Be the first to share something."}
                </p>
              </div>
            )}

          {/* =================================================
              POSTS
             ================================================= */}

          {!loading &&
            !error &&
            posts.map(
              (post) => (
                <PostCard
                  key={post.postId}
                  postId={post.postId}

                  name={post.name}
                  username={
                    post.username
                  }

                  avatarUrl={
                    post.avatarUrl
                  }
                  verified={
                    post.verified
                  }

                  time={post.time}
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
              ),
            )}
        </section>

        {/* ===================================================
            CREATE POST MODAL
           =================================================== */}

        <CreatePostModal
          open={createOpen}
          onClose={
            handleCloseCreate
          }
          onPublish={
            handlePublish
          }
        />

        {/* ===================================================
            PUBLISHING INDICATOR
           =================================================== */}

        {publishing && (
          <div
            aria-live="polite"
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform:
                "translateX(-50%)",
              zIndex: 1000,
            }}
          >
            Publishing...
          </div>
        )}
      </>
    </AuthGuard>
  );
}
export default function StreamPage() {
  return (
    <Suspense
      fallback={
        <div role="status" aria-live="polite">
          Loading stream...
        </div>
      }
    >
      <StreamPageContent />
    </Suspense>
  );
}