"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Users,
  FileText,
  Loader2,
} from "lucide-react";
import {
  followUser,
  searchPosts,
  searchUsers,
  unfollowUser,
} from "@/lib/api";
import type { Post } from "../../../../packages/types/src/post";
import type { UserProfile } from "@/lib/api";

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setUsers([]);
      setPosts([]);
      setError("");
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const [userResults, postResults] =
          await Promise.all([
            searchUsers(trimmedQuery),
            searchPosts(trimmedQuery),
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
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleFollowToggle = async (
    user: UserProfile,
  ) => {
    try {
      setError("");

      if (user.isFollowing) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
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

  return (
    <main className="discover-page">
      <div className="discover-header">
        <h1>Discover</h1>

        <p>
          Find people and posts across AIO.
        </p>
      </div>

      <div className="discover-search">
        <Search size={20} />

        <input
          type="text"
          placeholder="Search people or posts..."
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
        />

        {loading && (
          <Loader2
            size={20}
            className="discover-spinner"
          />
        )}
      </div>

      {!query.trim() && (
        <div className="discover-empty">
          <Search size={42} />

          <h2>Start discovering</h2>

          <p>
            Search for people, usernames, or posts
            to find interesting content.
          </p>
        </div>
      )}

      {error && (
        <div className="discover-error">
          {error}
        </div>
      )}

      {query.trim() &&
        !loading &&
        !error && (
          <>
            <section className="discover-section">
              <div className="discover-section-header">
                <div>
                  <Users size={20} />

                  <h2>People</h2>
                </div>

                <span>
                  {users.length}
                </span>
              </div>

              {users.length === 0 ? (
                <div className="discover-no-results">
                  No people found.
                </div>
              ) : (
                <div className="discover-user-list">
                  {users.map((user) => (
                    <div
                      className="discover-user-card"
                      key={user.id}
                    >
                      <Link
                        href={`/profile/${encodeURIComponent(
                          user.username,
                        )}`}
                        className="discover-user-main"
                      >
                        <div className="discover-user-avatar">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={
                                user.displayName
                              }
                            />
                          ) : (
                            user.displayName
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </div>

                        <div className="discover-user-info">
                          <strong>
                            {user.displayName}
                          </strong>

                          <span>
                            @{user.username}
                          </span>
                        </div>
                      </Link>

                      <button
                        type="button"
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
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="discover-section">
              <div className="discover-section-header">
                <div>
                  <FileText size={20} />

                  <h2>Posts</h2>
                </div>

                <span>
                  {posts.length}
                </span>
              </div>

              {posts.length === 0 ? (
                <div className="discover-no-results">
                  No posts found.
                </div>
              ) : (
                <div className="discover-post-list">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="discover-post-result"
                    >
                      <p>
                        {post.content}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
    </main>
  );
}