"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  getCurrentUser,
  getPosts,
  updateProfile,
  type UserProfile,
} from "@/lib/api";

import type { Post } from "../../../../packages/types/src/post";

type ProfileTab = "posts" | "media";

function getInitials(user: UserProfile): string {
  const source = user.displayName || user.username || "AIO";

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
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

function ProfileContent() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const currentUser = await getCurrentUser();

        if (!mounted) {
          return;
        }

        setUser(currentUser);
        setDisplayName(currentUser.displayName ?? "");
        setBio(currentUser.bio ?? "");
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
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      try {
        setPostsLoading(true);

        const allPosts = await getPosts();

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

    return posts.filter((post) => post.authorId === user.id);
  }, [posts, user]);

  const mediaPosts = useMemo(
    () => userPosts.filter((post) => Boolean(post.imageUrl)),
    [userPosts],
  );

  function openEditor() {
    if (!user) {
      return;
    }

    setDisplayName(user.displayName ?? "");
    setBio(user.bio ?? "");
    setSaveError("");
    setSaveSuccess("");
    setEditing(true);
  }

  function closeEditor() {
    if (saving) {
      return;
    }

    setEditing(false);
    setSaveError("");
    setSaveSuccess("");
  }

  async function handleSaveProfile() {
    if (!user) {
      return;
    }

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setSaveError("Display name is required.");
      return;
    }

    if (trimmedName.length > 80) {
      setSaveError("Display name must be 80 characters or less.");
      return;
    }

    if (bio.trim().length > 500) {
      setSaveError("Bio must be 500 characters or less.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const updatedUser = await updateProfile({
        displayName: trimmedName,
        bio: bio.trim(),
      });

      setUser(updatedUser);
      setDisplayName(updatedUser.displayName ?? "");
      setBio(updatedUser.bio ?? "");
      setSaveSuccess("Profile updated successfully.");

      window.setTimeout(() => {
        setEditing(false);
        setSaveSuccess("");
      }, 700);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
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
          <div className="aio-error" role="alert">
            {error || "Unable to load profile."}
          </div>
        </section>
      </main>
    );
  }

  const initials = getInitials(user);
  const joinedDate = formatDate(user.createdAt);

  return (
    <>
      <main className="aio-page">
        <section className="aio-profile-header profile-header">
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
              <span aria-hidden="true">{initials}</span>
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
              className="aio-button aio-button-secondary"
              onClick={openEditor}
            >
              Edit Profile
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
              <strong>{userPosts.length}</strong>
              <span>Posts</span>
            </div>

            <div className="profile-stat">
              <strong>{user.followersCount}</strong>
              <span>Followers</span>
            </div>

            <div className="profile-stat">
              <strong>{user.followingCount}</strong>
              <span>Following</span>
            </div>
          </div>
        </section>

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
            onClick={() => setActiveTab("posts")}
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
            onClick={() => setActiveTab("media")}
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
                    <p>{post.content}</p>

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
                <strong>No posts yet</strong>
                <span>
                  Your posts will appear here.
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
              <strong>No media yet</strong>
              <span>
                Images from your posts will appear here.
              </span>
            </div>
          )}
        </section>
      </main>

      {editing && (
        <div
          className="aio-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditor();
            }
          }}
        >
          <section
            className="aio-modal profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="aio-modal-header">
              <div>
                <h2 id="edit-profile-title">
                  Edit Profile
                </h2>
                <p>
                  Update how your profile appears to
                  other people.
                </p>
              </div>

              <button
                type="button"
                className="aio-modal-close"
                onClick={closeEditor}
                disabled={saving}
                aria-label="Close edit profile"
              >
                ×
              </button>
            </div>

            <div className="aio-modal-body">
              <label
                className="aio-field"
                htmlFor="profile-display-name"
              >
                <span>Display name</span>
                <input
                  id="profile-display-name"
                  className="aio-input"
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(event.target.value)
                  }
                  maxLength={80}
                  disabled={saving}
                />
              </label>

              <label
                className="aio-field"
                htmlFor="profile-bio"
              >
                <span>Bio</span>
                <textarea
                  id="profile-bio"
                  className="aio-textarea"
                  value={bio}
                  onChange={(event) =>
                    setBio(event.target.value)
                  }
                  maxLength={500}
                  rows={5}
                  disabled={saving}
                />
                <small>
                  {bio.length}/500
                </small>
              </label>

              {saveError && (
                <p className="aio-error" role="alert">
                  {saveError}
                </p>
              )}

              {saveSuccess && (
                <p className="aio-success" role="status">
                  {saveSuccess}
                </p>
              )}
            </div>

            <div className="aio-modal-footer">
              <button
                type="button"
                className="aio-button aio-button-secondary"
                onClick={closeEditor}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="aio-button aio-button-primary"
                onClick={() => void handleSaveProfile()}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}