"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import PostCard from "../../../components/stream/PostCard";

import {
  createSpacePost,
  getSpaceBySlug,
  getSpacePosts,
  joinSpace,
  leaveSpace,
  type Space,
} from "../../../lib/api";

import type { Post } from "../../../../../packages/types/src/post";

function getInitials(
  name?: string,
  username?: string,
): string {
  const value =
    name?.trim() ||
    username?.trim() ||
    "AIO";

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`
      .toUpperCase();
  }

  return value
    .slice(0, 2)
    .toUpperCase();
}

function formatCount(
  count: number,
): string {
  return new Intl.NumberFormat(
    "en",
    {
      notation:
        count >= 1000
          ? "compact"
          : "standard",
      maximumFractionDigits: 1,
    },
  ).format(count);
}

function formatPostTime(
  createdAt: string,
): string {
  const created =
    new Date(createdAt);

  if (
    Number.isNaN(
      created.getTime(),
    )
  ) {
    return "";
  }

  const seconds =
    Math.floor(
      (Date.now() -
        created.getTime()) /
        1000,
    );

  if (seconds < 60) {
    return "just now";
  }

  const minutes =
    Math.floor(
      seconds / 60,
    );

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

  return created.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year:
        created.getFullYear() !==
        new Date().getFullYear()
          ? "numeric"
          : undefined,
    },
  );
}

function getPostAuthor(
  post: Post,
) {
  const name =
    post.author?.displayName?.trim() ||
    post.author?.username?.trim() ||
    "AIO User";

  const username =
    post.author?.username?.trim() ||
    "aio-user";

  return {
    name,
    username,
    initials:
      getInitials(
        name,
        username,
      ),
  };
}

export default function SpacePage() {
  const params = useParams<{
    slug: string;
  }>();

  const slug =
    typeof params?.slug === "string"
      ? decodeURIComponent(
          params.slug,
        )
      : "";

  const [space, setSpace] =
    useState<Space | null>(
      null,
    );

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    membershipLoading,
    setMembershipLoading,
  ] = useState(false);

  const [
    membershipError,
    setMembershipError,
  ] = useState("");

  const [
    postContent,
    setPostContent,
  ] = useState("");

  const [
    postImageUrl,
    setPostImageUrl,
  ] = useState("");

  const [
    isPosting,
    setIsPosting,
  ] = useState(false);

  const [
    postError,
    setPostError,
  ] = useState("");

  const loadSpace =
    useCallback(
      async () => {
        if (!slug) {
          return;
        }

        setIsLoading(true);
        setError("");

        try {
          const [
            loadedSpace,
            loadedPosts,
          ] =
            await Promise.all([
              getSpaceBySlug(
                slug,
              ),
              getSpacePosts(
                slug,
              ),
            ]);

          setSpace(
            loadedSpace,
          );

          setPosts(
            loadedPosts,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Failed to load Space.",
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [slug],
    );

  useEffect(() => {
    void loadSpace();
  }, [loadSpace]);

  async function handleJoin() {
    if (
      !space ||
      membershipLoading
    ) {
      return;
    }

    setMembershipLoading(
      true,
    );

    setMembershipError("");

    try {
      const response =
        await joinSpace(
          space.id,
        );

      setSpace(
        (current) =>
          current
            ? {
                ...current,

                membersCount:
                  response.membersCount,

                membership: {
                  isMember:
                    response
                      .membership
                      .isMember,

                  role:
                    response
                      .membership
                      .role,
                },
              }
            : current,
      );
    } catch (
      joinError
    ) {
      setMembershipError(
        joinError instanceof
          Error
          ? joinError.message
          : "Unable to join Space.",
      );
    } finally {
      setMembershipLoading(
        false,
      );
    }
  }

  async function handleLeave() {
    if (
      !space ||
      membershipLoading
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Leave ${space.name}?`,
      );

    if (!confirmed) {
      return;
    }

    setMembershipLoading(
      true,
    );

    setMembershipError("");

    try {
      const response =
        await leaveSpace(
          space.id,
        );

      setSpace(
        (current) =>
          current
            ? {
                ...current,

                membersCount:
                  response.membersCount,

                membership: {
                  isMember:
                    response
                      .membership
                      .isMember,

                  role:
                    response
                      .membership
                      .role,
                },
              }
            : current,
      );
    } catch (
      leaveError
    ) {
      setMembershipError(
        leaveError instanceof
          Error
          ? leaveError.message
          : "Unable to leave Space.",
      );
    } finally {
      setMembershipLoading(
        false,
      );
    }
  }

  async function handleCreatePost(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !space ||
      isPosting
    ) {
      return;
    }

    const content =
      postContent.trim();

    const imageUrl =
      postImageUrl.trim();

    if (
      !content &&
      !imageUrl
    ) {
      setPostError(
        "Write something or add an image URL.",
      );

      return;
    }

    if (
      content.length > 5000
    ) {
      setPostError(
        "Post content is too long.",
      );

      return;
    }

    setIsPosting(true);
    setPostError("");

    try {
      const response =
        await createSpacePost(
          space.id,
          content,
          imageUrl ||
            undefined,
        );

      setPosts(
        (current) => [
          response.post,
          ...current,
        ],
      );

      setSpace(
        (current) =>
          current
            ? {
                ...current,
                postsCount:
                  current
                    .postsCount +
                  1,
              }
            : current,
      );

      setPostContent("");
      setPostImageUrl("");
    } catch (
      createError
    ) {
      setPostError(
        createError instanceof
          Error
          ? createError.message
          : "Unable to create Space post.",
      );
    } finally {
      setIsPosting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
          <div className="h-72 animate-pulse rounded-[32px] border border-white/[0.07] bg-white/[0.025]" />

          <div className="mt-6 h-36 animate-pulse rounded-3xl border border-white/[0.07] bg-white/[0.025]" />

          <div className="mt-4 h-72 animate-pulse rounded-3xl border border-white/[0.07] bg-white/[0.025]" />
        </div>
      </main>
    );
  }

  if (
    error ||
    !space
  ) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <div className="rounded-[28px] border border-red-400/15 bg-red-400/[0.06] p-7">
            <h1 className="text-xl font-semibold text-red-100">
              Unable to load Space
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-100/60">
              {error ||
                "This Space could not be found."}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  void loadSpace();
                }}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                Try again
              </button>

              <Link
                href="/spaces"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/60"
              >
                Back to Spaces
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isOwner =
    space.membership
      .isMember &&
    space.membership
      .role === "owner";

  const isMember =
    space.membership
      .isMember;

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6">
        <div className="mb-4">
          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
          >
            <span aria-hidden="true">
              ←
            </span>

            <span>
              Back to Spaces
            </span>
          </Link>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035]">
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-violet-500/25 via-fuchsia-500/10 to-cyan-400/20 sm:h-52">
            {space.coverUrl ? (
              <img
                src={
                  space.coverUrl
                }
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
              </>
            )}

            <div className="absolute right-5 top-5">
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium capitalize text-white/70 backdrop-blur-xl">
                {space.privacy}
              </span>
            </div>
          </div>

          <div className="relative px-5 pb-6 sm:px-7">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-[#0b0b0f] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-bold text-white shadow-xl">
                {space.avatarUrl ? (
                  <img
                    src={
                      space.avatarUrl
                    }
                    alt={
                      space.name
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(
                    space.name,
                  )
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:pb-1">
                {isOwner ? (
                  <span className="inline-flex h-10 items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-300">
                    Owner
                  </span>
                ) : isMember ? (
                  <button
                    type="button"
                    onClick={() => {
                      void handleLeave();
                    }}
                    disabled={
                      membershipLoading
                    }
                    className="h-10 rounded-xl border border-white/10 px-4 text-sm font-semibold text-white/70 transition hover:border-red-400/20 hover:bg-red-400/[0.08] hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {membershipLoading
                      ? "Leaving..."
                      : "Joined"}
                  </button>
                ) : space.privacy ===
                  "private" ? (
                  <button
                    type="button"
                    disabled
                    className="h-10 cursor-not-allowed rounded-xl border border-white/10 px-4 text-sm font-semibold text-white/35"
                  >
                    Private Space
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void handleJoin();
                    }}
                    disabled={
                      membershipLoading
                    }
                    className="h-10 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {membershipLoading
                      ? "Joining..."
                      : "Join Space"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {space.name}
              </h1>

              <p className="mt-1 text-sm text-white/35">
                /{space.slug}
              </p>

              {space.description ? (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">
                  {
                    space.description
                  }
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/45">
                <span>
                  <strong className="font-semibold text-white/85">
                    {formatCount(
                      space.membersCount,
                    )}
                  </strong>{" "}
                  {space.membersCount ===
                  1
                    ? "member"
                    : "members"}
                </span>

                <span className="h-1 w-1 rounded-full bg-white/20" />

                <span>
                  <strong className="font-semibold text-white/85">
                    {formatCount(
                      space.postsCount,
                    )}
                  </strong>{" "}
                  {space.postsCount ===
                  1
                    ? "post"
                    : "posts"}
                </span>
              </div>

              {space.creator ? (
                <div className="mt-3 text-xs text-white/35">
                  Created by{" "}
                  <span className="font-medium text-white/55">
                    @
                    {
                      space
                        .creator
                        .username
                    }
                  </span>
                </div>
              ) : null}

              {membershipError ? (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200"
                >
                  {
                    membershipError
                  }
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {isMember ? (
          <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div>
              <h2 className="font-semibold text-white">
                Post to{" "}
                {space.name}
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Share something with
                this community.
              </p>
            </div>

            <form
              onSubmit={
                handleCreatePost
              }
              className="mt-4"
            >
              <textarea
                value={
                  postContent
                }
                onChange={(
                  event,
                ) =>
                  setPostContent(
                    event.target
                      .value,
                  )
                }
                placeholder={`Share something with ${space.name}...`}
                rows={4}
                maxLength={5000}
                disabled={
                  isPosting
                }
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/40 focus:bg-white/[0.05] disabled:opacity-50"
              />

              <input
                type="url"
                value={
                  postImageUrl
                }
                onChange={(
                  event,
                ) =>
                  setPostImageUrl(
                    event.target
                      .value,
                  )
                }
                placeholder="Optional image URL"
                disabled={
                  isPosting
                }
                className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/40 focus:bg-white/[0.05] disabled:opacity-50"
              />

              {postError ? (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-red-400/15 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200"
                >
                  {postError}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-xs text-white/30">
                  {
                    postContent
                      .length
                  }
                  /5000
                </span>

                <button
                  type="submit"
                  disabled={
                    isPosting ||
                    (!postContent.trim() &&
                      !postImageUrl.trim())
                  }
                  className="h-10 rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPosting
                    ? "Posting..."
                    : "Post"}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.025] px-5 py-6 text-center">
            <h2 className="font-semibold text-white">
              Join to participate
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
              Become a member of{" "}
              {space.name} to
              create posts and
              participate in the
              community.
            </p>
          </section>
        )}

        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Space posts
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Conversations from{" "}
                {space.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void loadSpace();
              }}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white"
            >
              Refresh
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl text-white/60">
                #
              </div>

              <h3 className="mt-4 font-semibold text-white">
                No posts yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
                {isMember
                  ? `Start the first conversation in ${space.name}.`
                  : `There are no posts in ${space.name} yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(
                (post) => {
                  const author =
                    getPostAuthor(
                      post,
                    );

                  return (
                    <PostCard
                      key={
                        post.id
                      }
                      postId={
                        post.id
                      }
                      name={
                        author.name
                      }
                      username={
                        author.username
                      }
                      time={formatPostTime(
                        post.createdAt,
                      )}
                      initials={
                        author.initials
                      }
                      avatarClass="avatar-purple"
                      content={
                        post.content
                      }
                      imageUrl={
                        post.imageUrl
                      }
                      avatarUrl={
                        post.author
                          ?.avatarUrl
                      }
                      verified={
                        post.author
                          ?.verified ??
                        false
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
                      isLiked={
                        post.isLiked
                      }
                      isBookmarked={
                        post.isBookmarked
                      }
                    />
                  );
                },
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}