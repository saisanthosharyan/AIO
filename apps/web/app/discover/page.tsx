"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  ArrowUpRight,
  FileText,
  Loader2,
  Search,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import {
  followUser,
  getCurrentUser,
  searchPosts,
  searchUsers,
  unfollowUser,
} from "@/lib/api";

import type {
  UserProfile,
} from "@/lib/api";

import type {
  Post,
} from "../../../../packages/types/src/post";

export default function DiscoverPage() {
  const [query, setQuery] =
    useState("");

  const [users, setUsers] =
    useState<UserProfile[]>([]);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser =
      async () => {
        try {
          const currentUser =
            await getCurrentUser();

          if (!cancelled) {
            setCurrentUserId(
              currentUser.id,
            );
          }
        } catch (err) {
          console.error(
            "Failed to load current user:",
            err,
          );

          if (!cancelled) {
            setCurrentUserId(null);
          }
        }
      };

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const trimmedQuery =
      query.trim();

    if (!trimmedQuery) {
      setUsers([]);
      setPosts([]);
      setError("");
      setLoading(false);

      return;
    }

    const timeout =
      window.setTimeout(
        async () => {
          try {
            setLoading(true);
            setError("");

            const [
              userResults,
              postResults,
            ] =
              await Promise.all([
                searchUsers(
                  trimmedQuery,
                ),
                searchPosts(
                  trimmedQuery,
                ),
              ]);

            setUsers(userResults);
            setPosts(postResults);
          } catch (err) {
            console.error(
              "Discover search error:",
              err,
            );

            setError(
              "Something went wrong while searching.",
            );

            setUsers([]);
            setPosts([]);
          } finally {
            setLoading(false);
          }
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timeout,
      );
  }, [query]);

  const handleFollowToggle =
    async (
      user: UserProfile,
    ) => {
      if (
        currentUserId &&
        user.id === currentUserId
      ) {
        return;
      }

      try {
        setError("");

        if (user.isFollowing) {
          await unfollowUser(
            user.id,
          );
        } else {
          await followUser(
            user.id,
          );
        }

        setUsers(
          (currentUsers) =>
            currentUsers.map(
              (currentUser) =>
                currentUser.id ===
                user.id
                  ? {
                      ...currentUser,
                      isFollowing:
                        !user.isFollowing,
                    }
                  : currentUser,
            ),
        );
      } catch (err) {
        console.error(
          "Follow toggle error:",
          err,
        );

        setError(
          "Failed to update follow status.",
        );
      }
    };

  const trimmedQuery =
    query.trim();

  const hasResults =
    users.length > 0 ||
    posts.length > 0;

  return (
    <main className="aio-discover-page">
      <section className="aio-discover-hero">
        <div className="aio-discover-hero-copy">
          <span className="aio-discover-eyebrow">
            Explore AIO
          </span>

          <h1>Discover</h1>

          <p>
            Find people, conversations
            and ideas from across AIO.
          </p>
        </div>

        <div
          className="aio-discover-hero-icon"
          aria-hidden="true"
        >
          <Sparkles size={22} />
        </div>
      </section>

      <section className="aio-discover-search-section">
        <div
          className={`aio-discover-search${
            loading
              ? " is-loading"
              : ""
          }`}
        >
          <Search
            size={20}
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Search people, usernames or posts..."
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
            aria-label="Search AIO"
            autoComplete="off"
          />

          {loading && (
            <Loader2
              size={19}
              className="aio-discover-spinner"
              aria-label="Searching"
            />
          )}

          {!loading &&
            trimmedQuery && (
              <span className="aio-discover-search-status">
                Search
              </span>
            )}
        </div>
      </section>

      {!trimmedQuery && (
        <section className="aio-discover-start">
          <div className="aio-discover-start-icon">
            <Search size={26} />
          </div>

          <span className="aio-discover-start-eyebrow">
            Search AIO
          </span>

          <h2>
            Find something interesting.
          </h2>

          <p>
            Search for people,
            usernames, conversations
            or posts from across the
            AIO community.
          </p>

          <div className="aio-discover-start-hints">
            <span>
              <Users size={16} />
              People
            </span>

            <span>
              <FileText size={16} />
              Posts
            </span>

            <span>
              <Sparkles size={16} />
              Ideas
            </span>
          </div>
        </section>
      )}

      {error && (
        <div
          className="aio-discover-error"
          role="alert"
        >
          <span>
            {error}
          </span>
        </div>
      )}

      {trimmedQuery &&
        !loading &&
        !error && (
          <div className="aio-discover-results">
            <div className="aio-discover-results-summary">
              <div>
                <span>
                  Results for
                </span>

                <strong>
                  &ldquo;
                  {trimmedQuery}
                  &rdquo;
                </strong>
              </div>

              <span>
                {users.length +
                  posts.length}{" "}
                {users.length +
                  posts.length ===
                1
                  ? "result"
                  : "results"}
              </span>
            </div>

            {!hasResults && (
              <section className="aio-discover-zero-state">
                <div className="aio-discover-zero-icon">
                  <Search size={24} />
                </div>

                <h2>
                  No results found
                </h2>

                <p>
                  We couldn&apos;t find
                  people or posts matching
                  &ldquo;
                  {trimmedQuery}
                  &rdquo;.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setQuery("")
                  }
                >
                  Clear search
                </button>
              </section>
            )}

            {hasResults && (
              <>
                <section className="aio-discover-section">
                  <div className="aio-discover-section-heading">
                    <div className="aio-discover-section-title">
                      <span className="aio-discover-section-icon">
                        <Users
                          size={18}
                        />
                      </span>

                      <div>
                        <span>
                          Community
                        </span>

                        <h2>
                          People
                        </h2>
                      </div>
                    </div>

                    <span className="aio-discover-count">
                      {users.length}
                    </span>
                  </div>

                  {users.length ===
                  0 ? (
                    <div className="aio-discover-no-results">
                      <UserRound
                        size={19}
                      />

                      <span>
                        No people found
                        for this search.
                      </span>
                    </div>
                  ) : (
                    <div className="aio-discover-user-list">
                      {users.map(
                        (user) => {
                          const initial =
                            user.displayName
                              .trim()
                              .charAt(0)
                              .toUpperCase() ||
                            user.username
                              .trim()
                              .charAt(0)
                              .toUpperCase() ||
                            "A";

                          const isCurrentUser =
                            currentUserId ===
                            user.id;

                          return (
                            <article
                              className="aio-discover-user-card"
                              key={
                                user.id
                              }
                            >
                              <Link
                                href={`/profile/${encodeURIComponent(
                                  user.username,
                                )}`}
                                className="aio-discover-user-main"
                              >
                                <div className="aio-discover-user-avatar">
                                  {user.avatarUrl ? (
                                    <img
                                      src={
                                        user.avatarUrl
                                      }
                                      alt=""
                                    />
                                  ) : (
                                    <span>
                                      {
                                        initial
                                      }
                                    </span>
                                  )}
                                </div>

                                <div className="aio-discover-user-info">
                                  <strong>
                                    {
                                      user.displayName
                                    }
                                  </strong>

                                  <span>
                                    @
                                    {
                                      user.username
                                    }
                                  </span>
                                </div>
                              </Link>

                              <div className="aio-discover-user-actions">
                                {isCurrentUser ? (
                                  <span className="aio-discover-you-badge">
                                    You
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className={
                                      user.isFollowing
                                        ? "is-following"
                                        : ""
                                    }
                                    onClick={() =>
                                      handleFollowToggle(
                                        user,
                                      )
                                    }
                                  >
                                    {user.isFollowing
                                      ? "Following"
                                      : "Follow"}
                                  </button>
                                )}

                                <Link
                                  href={`/profile/${encodeURIComponent(
                                    user.username,
                                  )}`}
                                  className="aio-discover-user-open"
                                  aria-label={`View ${user.displayName}'s profile`}
                                >
                                  <ArrowUpRight
                                    size={
                                      17
                                    }
                                  />
                                </Link>
                              </div>
                            </article>
                          );
                        },
                      )}
                    </div>
                  )}
                </section>

                <section className="aio-discover-section">
                  <div className="aio-discover-section-heading">
                    <div className="aio-discover-section-title">
                      <span className="aio-discover-section-icon">
                        <FileText
                          size={18}
                        />
                      </span>

                      <div>
                        <span>
                          Conversations
                        </span>

                        <h2>
                          Posts
                        </h2>
                      </div>
                    </div>

                    <span className="aio-discover-count">
                      {posts.length}
                    </span>
                  </div>

                  {posts.length ===
                  0 ? (
                    <div className="aio-discover-no-results">
                      <FileText
                        size={19}
                      />

                      <span>
                        No posts found
                        for this search.
                      </span>
                    </div>
                  ) : (
                    <div className="aio-discover-post-list">
                      {posts.map(
                        (post) => (
                          <Link
                            key={
                              post.id
                            }
                            href={`/post/${post.id}`}
                            className="aio-discover-post-result"
                          >
                            <div className="aio-discover-post-icon">
                              <FileText
                                size={
                                  18
                                }
                              />
                            </div>

                            <div className="aio-discover-post-copy">
                              <span>
                                Post
                              </span>

                              <p>
                                {
                                  post.content
                                }
                              </p>
                            </div>

                            <ArrowUpRight
                              size={
                                17
                              }
                            />
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}
    </main>
  );
}