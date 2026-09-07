
"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import CreatePanel from "@/components/stream/CreatePanel";
import CreatePostModal, {
  type CreatePostData,
} from "@/components/stream/CreatePostModal";
import PostCard from "@/components/stream/PostCard";
import { createPost, getPosts } from "@/lib/api";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

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

function formatTime(
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

  /*
   * New backend posts contain the complete
   * public author profile.
   *
   * Legacy posts may not have an author.
   */
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

    /*
     * Real author display name.
     */
    name: displayName,

    /*
     * Real author username.
     */
    username:
      username.length > 0
        ? `@${username}`
        : "@aio-user",

    time: formatTime(
      post.createdAt,
    ),

    initials,

    /*
     * Keep the current AIO avatar styling.
     */
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
      typeof post.bookmarksCount ===
      "number"
        ? post.bookmarksCount
        : 0,

    /*
     * These values come from the backend.
     */
    isLiked: post.isLiked === true,

    isBookmarked:
      post.isBookmarked === true,

    verified:
      author?.verified === true,

    /*
     * Only store avatarUrl when it actually
     * exists.
     */
    ...(author?.avatarUrl
      ? {
          avatarUrl:
            author.avatarUrl,
        }
      : {}),
  };
}

export default function StreamPage() {
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

  const loadPosts = useCallback(
    async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const data = await getPosts();

        /*
         * The backend returns additional fields
         * (author, isLiked, isBookmarked) that
         * are not necessarily represented in the
         * existing shared frontend type.
         */
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
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialPosts(): Promise<void> {
      try {
        setError("");

        const data = await getPosts();

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

    void fetchInitialPosts();

    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <AuthGuard>
      <>
        <div className="aio-page-header">
          <div>
            <h1>Stream</h1>

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
                  postId={post.postId}
                  name={post.name}
                  username={
                    post.username
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
                />
              ),
            )}
        </section>

        <CreatePostModal
          open={createOpen}
          onClose={handleCloseCreate}
          onPublish={handlePublish}
        />

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
