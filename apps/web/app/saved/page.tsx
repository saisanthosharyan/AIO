"use client";

import { useEffect, useState } from "react";

import PostCard from "@/components/stream/PostCard";
import { getBookmarkedPosts } from "@/lib/api";


export default function SavedPage() {
  const [posts, setPosts] = useState<
    Awaited<ReturnType<typeof getBookmarkedPosts>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSavedPosts() {
      try {
        setLoading(true);
        setError("");

        const savedPosts = await getBookmarkedPosts();

        if (mounted) {
          setPosts(savedPosts);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load saved posts.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadSavedPosts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="stream-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">YOUR COLLECTION</span>

          <h1>Saved</h1>

          <p>
            Keep your favorite posts, ideas, and content in one place.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="stream-placeholder">
          <div className="stream-placeholder-icon">??</div>

          <h2>Loading your saved content...</h2>

          <p>
            We&apos;re getting your saved posts.
          </p>
        </div>
      ) : error ? (
        <div className="stream-placeholder">
          <div className="stream-placeholder-icon">??</div>

          <h2>Couldn&apos;t load saved content</h2>

          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="stream-placeholder">
          <div className="stream-placeholder-icon">??</div>

          <h2>Your saved content will appear here</h2>

          <p>
            Save posts and ideas from across AIO and find them here later.
          </p>
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
              likesCount={post.likesCount}
              commentsCount={post.commentsCount}
              bookmarksCount={post.bookmarksCount}
              isLiked={post.isLiked}
              isBookmarked={post.isBookmarked}
            />
          ))}
        </div>
      )}
    </section>
  );
}
