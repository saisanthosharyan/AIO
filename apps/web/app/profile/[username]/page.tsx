"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  followUser,
  getPosts,
  getUserProfile,
  unfollowUser,
  type UserProfile,
} from "@/lib/api";

import type { Post } from "../../../../../packages/types/src/post";

type ProfileTab = "posts" | "media";

function getInitials(user: UserProfile): string {
  const source =
    user.displayName ||
    user.username ||
    "AIO";

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ?? "",
    )
    .join("");
}

function formatDate(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function PublicProfileContent() {
  const params = useParams();
  const router = useRouter();

  const username =
    typeof params.username === "string"
      ? params.username
      : "";

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [activeTab, setActiveTab] =
    useState<ProfileTab>("posts");

  const [loading, setLoading] =
    useState(true);

  const [postsLoading, setPostsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [followLoading, setFollowLoading] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!username) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const profile =
          await getUserProfile(username);

        if (!mounted) {
          return;
        }

        setUser(profile);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [username]);

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      try {
        setPostsLoading(true);

        const allPosts =
          await getPosts();

        if (!mounted) {
          return;
        }

        setPosts(allPosts);
      } catch {
        if (mounted) {
          setPosts([]);
        }
      } finally {
        if (mounted) {
          setPostsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      mounted = false;
    };
  }, []);

  const userPosts = useMemo(() => {
    if (!user) {
      return [];
    }

    return posts.filter(
      (post) =>
        post.authorId === user.id,
    );
  }, [posts, user]);

  const mediaPosts = useMemo(
    () =>
      userPosts.filter(
        (post) => Boolean(post.imageUrl),
      ),
    [userPosts],
  );

  async function handleFollowToggle() {
    if (!user || followLoading) {
      return;
    }

    try {
      setFollowLoading(true);
      setError("");

      if (user.isFollowing) {
        await unfollowUser(user.username);
      } else {
        await followUser(user.username);
      }

      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        const isFollowing =
          !currentUser.isFollowing;

        return {
          ...currentUser,
          isFollowing,
          followersCount:
            Math.max(
              0,
              currentUser.followersCount +
                (isFollowing ? 1 : -1),
            ),
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update follow status.",
      );
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="aio-page">
        <section className="profile-header">
          <div className="aio-loading">
            Loading profile...
          </div>
        </section>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="aio-page">
        <section className="profile-header">
          <button
            type="button"
            className="aio-button aio-button-secondary"
            onClick={() => router.back()}
          >
            Back
          </button>

          <div
            className="aio-error"
            role="alert"
          >
            {error ||
              "Unable to load profile."}
          </div>
        </section>
      </main>
    );
  }

  const initials = getInitials(user);
  const joinedDate = formatDate(
    user.createdAt,
  );

  return (
    <main className="aio-page">
      <section className="aio-profile-header profile-header">
        <button
          type="button"
          className="aio-button aio-button-secondary"
          onClick={() => router.back()}
        >
          Back
        </button>

        <div className="profile-avatar">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={`${user.displayName} profile`}
              width={88}
              height={88}
              unoptimized
            />
          ) : (
            <span aria-hidden="true">
              {initials}
            </span>
          )}
        </div>

        <div className="profile-name-row">
          <div>
            <h1 className="profile-name">
              {user.displayName}

              {user.verified && (
                <span
                  className="profile-verified"
                  title="Verified"
                  aria-label="Verified"
                >
                  ✓
                </span>
              )}
            </h1>

            <p className="profile-username">
              @{user.username}
            </p>
          </div>

          <button
            type="button"
            className="aio-button aio-button-primary"
            onClick={() =>
              void handleFollowToggle()
            }
            disabled={followLoading}
          >
            {followLoading
              ? "Updating..."
              : user.isFollowing
                ? "Following"
                : "Follow"}
          </button>
        </div>

        {user.bio && (
          <p className="profile-bio">
            {user.bio}
          </p>
        )}

        {joinedDate && (
          <p className="profile-joined">
            Joined {joinedDate}
          </p>
        )}

        <div className="profile-stats">
          <div className="profile-stat">
            <strong>
              {userPosts.length}
            </strong>
            <span>Posts</span>
          </div>

          <div className="profile-stat">
            <strong>
              {user.followersCount}
            </strong>
            <span>Followers</span>
          </div>

          <div className="profile-stat">
            <strong>
              {user.followingCount}
            </strong>
            <span>Following</span>
          </div>
        </div>
      </section>

      {error && (
        <div
          className="aio-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <nav
        className="profile-tabs"
        aria-label="Profile content"
      >
        <button
          type="button"
          className={
            activeTab === "posts"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("posts")
          }
          aria-current={
            activeTab === "posts"
              ? "page"
              : undefined
          }
        >
          Posts
        </button>

        <button
          type="button"
          className={
            activeTab === "media"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("media")
          }
          aria-current={
            activeTab === "media"
              ? "page"
              : undefined
          }
        >
          Media
        </button>
      </nav>

      <section className="profile-content">
        {postsLoading ? (
          <div className="aio-loading">
            Loading posts...
          </div>
        ) : activeTab === "posts" ? (
          userPosts.length > 0 ? (
            <div className="profile-post-list">
              {userPosts.map((post) => (
                <article
                  key={post.id}
                  className="profile-post"
                >
                  <p>
                    {post.content}
                  </p>

                  {post.imageUrl && (
                    <div className="profile-post-image">
                      <Image
                        src={post.imageUrl}
                        alt="Post media"
                        width={640}
                        height={480}
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="profile-post-meta">
                    <span>
                      {post.likesCount} likes
                    </span>

                    <span>
                      {post.commentsCount} comments
                    </span>

                    <span>
                      {new Date(
                        post.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-empty">
              <strong>
                No posts yet
              </strong>

              <span>
                This user hasn't posted
                anything yet.
              </span>
            </div>
          )
        ) : mediaPosts.length > 0 ? (
          <div className="profile-media-grid">
            {mediaPosts.map((post) => (
              <article
                key={post.id}
                className="profile-media-item"
              >
                {post.imageUrl && (
                  <Image
                    src={post.imageUrl}
                    alt="Profile media"
                    width={320}
                    height={320}
                    unoptimized
                  />
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="profile-empty">
            <strong>
              No media yet
            </strong>

            <span>
              Images from this user's posts
              will appear here.
            </span>
          </div>
        )}
      </section>
    </main>
  );
}

export default function PublicProfilePage() {
  return (
    <AuthGuard>
      <PublicProfileContent />
    </AuthGuard>
  );
}