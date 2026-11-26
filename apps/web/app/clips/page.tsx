"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import {
  bookmarkPost,
  createClip,
  getPosts,
  likePost,
  unbookmarkPost,
  unlikePost,
  uploadClip,
} from "@/lib/api";
import type { Post } from "../../../../packages/types/src/post";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Plus,
  Share2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

function ClipsContent() {
  const [clips, setClips] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [notice, setNotice] = useState("");
  const [muted, setMuted] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadClips = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const posts = await getPosts("for-you");

      setClips(
        posts.filter(
          (post) => post.type === "clip" && Boolean(post.videoUrl),
        ),
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load Clips",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClips();
  }, [loadClips]);

  async function handlePublish() {
    if (!selectedFile) {
      setUploadError("Choose a video before publishing.");
      return;
    }

    if (!["video/mp4", "video/webm"].includes(selectedFile.type)) {
      setUploadError("Only MP4 and WebM videos are supported.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setUploadError("Your video must be 50 MB or smaller.");
      return;
    }

    try {
      setPublishing(true);
      setUploadError("");
      setNotice("");

      const uploaded = await uploadClip(selectedFile);

      if (!uploaded.clipUrl) {
        throw new Error("The upload did not return a video URL.");
      }

      await createClip(caption.trim(), uploaded.clipUrl);

      setUploadOpen(false);
      setSelectedFile(null);
      setCaption("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setNotice("Your Clip has been published.");
      await loadClips();
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Could not publish your Clip.",
      );
    } finally {
      setPublishing(false);
    }
  }

  async function handleLike(post: Post) {
    const wasLiked = post.isLiked;

    setClips((current) =>
      current.map((item) =>
        item.id === post.id
          ? {
              ...item,
              isLiked: !wasLiked,
              likesCount: Math.max(
                0,
                item.likesCount + (wasLiked ? -1 : 1),
              ),
            }
          : item,
      ),
    );

    try {
      const result = wasLiked
        ? await unlikePost(post.id)
        : await likePost(post.id);

      setClips((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                isLiked: !wasLiked,
                likesCount: result.likesCount,
              }
            : item,
        ),
      );
    } catch (error) {
      setClips((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                isLiked: wasLiked,
                likesCount: post.likesCount,
              }
            : item,
        ),
      );

      setNotice(
        error instanceof Error ? error.message : "Like failed.",
      );
    }
  }

  async function handleBookmark(post: Post) {
    const wasBookmarked = post.isBookmarked;

    setClips((current) =>
      current.map((item) =>
        item.id === post.id
          ? {
              ...item,
              isBookmarked: !wasBookmarked,
              bookmarksCount: Math.max(
                0,
                item.bookmarksCount + (wasBookmarked ? -1 : 1),
              ),
            }
          : item,
      ),
    );

    try {
      const result = wasBookmarked
        ? await unbookmarkPost(post.id)
        : await bookmarkPost(post.id);

      setClips((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                isBookmarked: !wasBookmarked,
                bookmarksCount: result.bookmarksCount,
              }
            : item,
        ),
      );
    } catch (error) {
      setClips((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                isBookmarked: wasBookmarked,
                bookmarksCount: post.bookmarksCount,
              }
            : item,
        ),
      );

      setNotice(
        error instanceof Error ? error.message : "Bookmark failed.",
      );
    }
  }

  async function handleShare(post: Post) {
    const url = `${window.location.origin}/post/${post.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setNotice("Clip link copied.");
    } catch {
      setNotice("Could not copy the link in this browser.");
    }
  }

  function handleFileChange(file: File | undefined) {
    setUploadError("");
    setSelectedFile(null);

    if (!file) return;

    if (!["video/mp4", "video/webm"].includes(file.type)) {
      setUploadError("Choose an MP4 or WebM video.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError("The video must be 50 MB or smaller.");
      return;
    }

    setSelectedFile(file);
  }

  return (
    <main className="aio-clips-page">
      <header className="aio-clips-header">
        <div>
          <p className="aio-clips-eyebrow">AIO / VIDEO</p>
          <h1>Clips</h1>
          <p className="aio-clips-subtitle">
            Short videos from your community.
          </p>
        </div>

        <button
          type="button"
          className="aio-clips-create"
          onClick={() => {
            setUploadError("");
            setUploadOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Create Clip</span>
        </button>
      </header>

      {notice && (
        <div className="aio-clips-notice" role="status">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {loading && (
        <div className="aio-clips-state">
          <div className="aio-clips-loader" />
          <p>Loading Clips...</p>
        </div>
      )}

      {!loading && loadError && (
        <div className="aio-clips-state">
          <h2>Could not load Clips</h2>
          <p>{loadError}</p>
          <button type="button" onClick={() => void loadClips()}>
            Try again
          </button>
        </div>
      )}

      {!loading && !loadError && clips.length === 0 && (
        <section className="aio-clips-empty">
          <div className="aio-clips-empty-icon">
            <Plus size={26} />
          </div>
          <h2>Your next scroll starts here.</h2>
          <p>
            There are no Clips yet. Share a short video and start the feed.
          </p>
          <button
            type="button"
            className="aio-clips-create"
            onClick={() => setUploadOpen(true)}
          >
            <Plus size={18} />
            Create the first Clip
          </button>
        </section>
      )}

      {!loading && clips.length > 0 && (
        <section className="aio-clips-feed" aria-label="Clips feed">
          {clips.map((post) => {
            const authorName =
              post.author?.displayName ||
              post.author?.username ||
              "AIO Creator";

            const username = post.author?.username || "creator";

            return (
              <article className="aio-clip-card" key={post.id}>
                <div className="aio-clip-video-wrap">
                  <video
                    className="aio-clip-video"
                    src={post.videoUrl}
                    controls
                    playsInline
                    loop
                    muted={muted}
                    preload="metadata"
                  />

                  <button
                    type="button"
                    className="aio-clip-volume"
                    onClick={() => setMuted((value) => !value)}
                    aria-label={muted ? "Unmute videos" : "Mute videos"}
                  >
                    {muted ? (
                      <VolumeX size={18} />
                    ) : (
                      <Volume2 size={18} />
                    )}
                  </button>
                </div>

                <div className="aio-clip-info">
                  <div className="aio-clip-author">
                    {post.author?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.author.avatarUrl}
                        alt=""
                        className="aio-clip-avatar"
                      />
                    ) : (
                      <div className="aio-clip-avatar aio-clip-avatar-fallback">
                        {authorName.slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="aio-clip-author-text">
                      <strong>{authorName}</strong>
                      <span>@{username}</span>
                    </div>
                  </div>

                  {post.content && (
                    <p className="aio-clip-caption">{post.content}</p>
                  )}

                  <div className="aio-clip-actions">
                    <button
                      type="button"
                      className={post.isLiked ? "is-active" : ""}
                      onClick={() => void handleLike(post)}
                      aria-label={post.isLiked ? "Unlike Clip" : "Like Clip"}
                    >
                      <Heart
                        size={19}
                        fill={post.isLiked ? "currentColor" : "none"}
                      />
                      <span>{post.likesCount}</span>
                    </button>

                    <Link
                      href={`/post/${post.id}`}
                      aria-label={`View ${post.commentsCount} comments`}
                    >
                      <MessageCircle size={19} />
                      <span>{post.commentsCount}</span>
                    </Link>

                    <button
                      type="button"
                      className={post.isBookmarked ? "is-active" : ""}
                      onClick={() => void handleBookmark(post)}
                      aria-label={
                        post.isBookmarked ? "Remove bookmark" : "Bookmark Clip"
                      }
                    >
                      <Bookmark
                        size={19}
                        fill={post.isBookmarked ? "currentColor" : "none"}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleShare(post)}
                      aria-label="Copy Clip link"
                    >
                      <Share2 size={19} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {uploadOpen && (
        <div
          className="aio-clips-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !publishing) {
              setUploadOpen(false);
            }
          }}
        >
          <section
            className="aio-clips-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aio-clips-modal-title"
          >
            <div className="aio-clips-modal-header">
              <div>
                <p className="aio-clips-eyebrow">SHARE A MOMENT</p>
                <h2 id="aio-clips-modal-title">Create a Clip</h2>
              </div>

              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                disabled={publishing}
                aria-label="Close upload dialog"
              >
                <X size={20} />
              </button>
            </div>

            <label className="aio-clips-field-label" htmlFor="aio-clip-file">
              Video file
            </label>

            <input
              ref={fileInputRef}
              id="aio-clip-file"
              className="aio-clips-file-input"
              type="file"
              accept="video/mp4,video/webm"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0])
              }
              disabled={publishing}
            />

            <p className="aio-clips-hint">
              MP4 or WebM · Maximum file size 50 MB
            </p>

            {selectedFile && (
              <p className="aio-clips-selected-file">
                {selectedFile.name} ·{" "}
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}

            <label className="aio-clips-field-label" htmlFor="aio-clip-caption">
              Caption <span>(optional)</span>
            </label>

            <textarea
              id="aio-clip-caption"
              className="aio-clips-caption-input"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Write something about your video..."
              maxLength={2000}
              rows={4}
              disabled={publishing}
            />

            {uploadError && (
              <p className="aio-clips-upload-error" role="alert">
                {uploadError}
              </p>
            )}

            <button
              type="button"
              className="aio-clips-publish"
              onClick={() => void handlePublish()}
              disabled={publishing || !selectedFile}
            >
              {publishing ? "Uploading and publishing..." : "Publish Clip"}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default function ClipsPage() {
  return (
    <AuthGuard>
      <ClipsContent />
    </AuthGuard>
  );
}
