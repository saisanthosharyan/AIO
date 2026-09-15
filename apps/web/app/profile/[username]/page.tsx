"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  X,
} from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";
import {
  followUser,
  getFollowers,
  getFollowing,
  getPosts,
  getUserProfile,
  unfollowUser,
  type UserProfile,
} from "@/lib/api";
import type { Post } from "../../../../../packages/types/src/post";

type ProfileTab = "posts" | "media";

type RelationshipList =
  | "followers"
  | "following"
  | null;

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

function formatPostDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function UserAvatar({
  user,
  size = 48,
}: {
  user: UserProfile;
  size?: number;
}) {
  const initials = getInitials(user);

  if (user.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={`${user.displayName} profile`}
        width={size}
        height={size}
        unoptimized
      />
    );
  }

  return (
    <span
      className="public-profile-avatar-fallback"
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function RelationshipModal({
  type,
  users,
  loading,
  error,
  onClose,
}: {
  type: Exclude<RelationshipList, null>;
  users: UserProfile[];
  loading: boolean;
  error: string;
  onClose: () => void;
}) {
  const title =
    type === "followers"
      ? "Followers"
      : "Following";

  return (
    <div
      className="profile-relation-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="profile-relation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="relationship-title"
      >
        <div className="profile-relation-header">
          <div>
            <span className="profile-relation-eyebrow">
              AIO
            </span>

            <h2 id="relationship-title">
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="profile-relation-close"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="profile-relation-body">
          {loading ? (
            <div className="profile-relation-state">
              Loading {title.toLowerCase()}...
            </div>
          ) : error ? (
            <div
              className="profile-relation-state"
              role="alert"
            >
              <strong>
                Unable to load {title.toLowerCase()}
              </strong>

              <span>{error}</span>
            </div>
          ) : users.length === 0 ? (
            <div className="profile-relation-state">
              <Users size={30} />

              <strong>
                No {title.toLowerCase()} yet
              </strong>

              <span>
                This list is currently empty.
              </span>
            </div>
          ) : (
            <div className="profile-relation-list">
              {users.map((relationUser) => (
                <Link
                  key={relationUser.id}
                  href={`/profile/${encodeURIComponent(
                    relationUser.username,
                  )}`}
                  className="profile-relation-user"
                  onClick={onClose}
                >
                  <div className="profile-relation-avatar">
                    <UserAvatar
                      user={relationUser}
                      size={46}
                    />
                  </div>

                  <div className="profile-relation-info">
                    <strong>
                      {relationUser.displayName}
                    </strong>

                    <span>
                      @{relationUser.username}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
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

  const [relationshipList, setRelationshipList] =
    useState<RelationshipList>(null);

  const [relationshipUsers, setRelationshipUsers] =
    useState<UserProfile[]>([]);

  const [relationshipLoading, setRelationshipLoading] =
    useState(false);

  const [relationshipError, setRelationshipError] =
    useState("");

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
      } catch (err) {
        console.error(
          "Public profile posts error:",
          err,
        );

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

  useEffect(() => {
    if (!relationshipList || !user?.id) {
      return;
    }

    const profileUserId = user.id;
    const relationshipType = relationshipList;

    let mounted = true;

    async function loadRelationshipUsers() {
      try {
        setRelationshipLoading(true);
        setRelationshipError("");
        setRelationshipUsers([]);

        const result =
          relationshipType === "followers"
            ? await getFollowers(profileUserId)
            : await getFollowing(profileUserId);

        if (!mounted) {
          return;
        }

        setRelationshipUsers(result);
      } catch (err) {
        console.error(
          "Relationship list error:",
          err,
        );

        if (!mounted) {
          return;
        }

        setRelationshipUsers([]);

        setRelationshipError(
          err instanceof Error
            ? err.message
            : "Failed to load this list.",
        );
      } finally {
        if (mounted) {
          setRelationshipLoading(false);
        }
      }
    }

    void loadRelationshipUsers();

    return () => {
      mounted = false;
    };
  }, [relationshipList, user?.id]);

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
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }

      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        const nextFollowing =
          !currentUser.isFollowing;

        return {
          ...currentUser,
          isFollowing: nextFollowing,
          followersCount: Math.max(
            0,
            currentUser.followersCount +
              (nextFollowing ? 1 : -1),
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

  function openRelationshipList(
    type: Exclude<RelationshipList, null>,
  ) {
    setRelationshipError("");
    setRelationshipUsers([]);
    setRelationshipList(type);
  }

  function closeRelationshipList() {
    setRelationshipList(null);
    setRelationshipUsers([]);
    setRelationshipError("");
    setRelationshipLoading(false);
  }

  if (loading) {
    return (
      <main className="aio-page public-profile-page">
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
      <main className="aio-page public-profile-page">
        <section className="profile-header">
          <button
            type="button"
            className="aio-button aio-button-secondary"
            onClick={() => router.back()}
          >
            <ArrowLeft size={16} />
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

  const profileUser = user;

  const joinedDate = formatDate(
    profileUser.createdAt,
  );

  return (
    <main className="aio-page public-profile-page">
      <section className="aio-profile-header profile-header">
        <button
          type="button"
          className="aio-button aio-button-secondary profile-back-button"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="profile-avatar public-profile-avatar">
          <UserAvatar
            user={profileUser}
            size={88}
          />
        </div>

        <div className="profile-name-row">
          <div>
            <h1 className="profile-name">
              {profileUser.displayName}

              {profileUser.verified && (
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
              @{profileUser.username}
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
              : profileUser.isFollowing
                ? "Following"
                : "Follow"}
          </button>
        </div>

        {profileUser.bio && (
          <p className="profile-bio">
            {profileUser.bio}
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

          <button
            type="button"
            className="profile-stat profile-stat-button"
            onClick={() =>
              openRelationshipList("followers")
            }
            aria-label={`View ${profileUser.followersCount} followers`}
          >
            <strong>
              {profileUser.followersCount}
            </strong>

            <span>Followers</span>
          </button>

          <button
            type="button"
            className="profile-stat profile-stat-button"
            onClick={() =>
              openRelationshipList("following")
            }
            aria-label={`View ${profileUser.followingCount} following`}
          >
            <strong>
              {profileUser.followingCount}
            </strong>

            <span>Following</span>
          </button>
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
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="profile-post"
                >
                  <div className="profile-post-author">
                    <div className="profile-post-author-avatar">
                      <UserAvatar
                        user={profileUser}
                        size={38}
                      />
                    </div>

                    <div>
                      <strong>
                        {profileUser.displayName}
                      </strong>

                      <span>
                        @{profileUser.username}
                      </span>
                    </div>
                  </div>

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
                      {formatPostDate(
                        post.createdAt,
                      )}
                    </span>
                  </div>
                </Link>
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
              <Link
                key={post.id}
                href={`/post/${post.id}`}
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
              </Link>
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

      {relationshipList !== null && (
        <RelationshipModal
          type={relationshipList}
          users={relationshipUsers}
          loading={relationshipLoading}
          error={relationshipError}
          onClose={closeRelationshipList}
        />
      )}
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
