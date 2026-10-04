"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createSpace,
  getSpaces,
  type Space,
  type SpacePrivacy,
} from "../../lib/api";

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "S";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function formatCount(count: number): string {
  return new Intl.NumberFormat(
    "en",
    {
      notation: count >= 1000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    },
  ).format(count);
}

function SpaceCard({
  space,
}: {
  space: Space;
}) {
  return (
    <Link
      href={`/spaces/${encodeURIComponent(space.slug)}`}
      className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.055]"
    >
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-cyan-500/20">
        {space.coverUrl ? (
          <img
            src={space.coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute -left-10 -top-14 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute -bottom-16 right-0 h-36 w-36 rounded-full bg-cyan-400/15 blur-3xl" />
          </div>
        )}

        <div className="absolute right-4 top-4">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-medium capitalize text-white/70 backdrop-blur-xl">
            {space.privacy}
          </span>
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="-mt-8 mb-4 flex items-end justify-between">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#0b0b0f] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-xl">
            {space.avatarUrl ? (
              <img
                src={space.avatarUrl}
                alt={space.name}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(space.name)
            )}
          </div>

          {space.membership.isMember ? (
            <span className="mb-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              {space.membership.role === "owner"
                ? "Owner"
                : "Joined"}
            </span>
          ) : null}
        </div>

        <h2 className="text-lg font-semibold tracking-tight text-white transition group-hover:text-violet-200">
          {space.name}
        </h2>

        <p className="mt-1 text-xs text-white/40">
          /{space.slug}
        </p>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-white/55">
          {space.description ||
            "A community on AIO."}
        </p>

        <div className="mt-5 flex items-center gap-4 border-t border-white/[0.07] pt-4 text-xs text-white/45">
          <span>
            <strong className="font-semibold text-white/80">
              {formatCount(space.membersCount)}
            </strong>{" "}
            {space.membersCount === 1
              ? "member"
              : "members"}
          </span>

          <span className="h-1 w-1 rounded-full bg-white/20" />

          <span>
            <strong className="font-semibold text-white/80">
              {formatCount(space.postsCount)}
            </strong>{" "}
            {space.postsCount === 1
              ? "post"
              : "posts"}
          </span>
        </div>

        {space.creator ? (
          <div className="mt-3 text-xs text-white/35">
            Created by{" "}
            <span className="text-white/55">
              @{space.creator.username}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export default function SpacesPage() {
  const [spaces, setSpaces] =
    useState<Space[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [privacy, setPrivacy] =
    useState<SpacePrivacy>("public");

  const [isCreating, setIsCreating] =
    useState(false);

  const [createError, setCreateError] =
    useState("");

  const loadSpaces =
    useCallback(async () => {
      setIsLoading(true);
      setError("");

      try {
        const data =
          await getSpaces();

        setSpaces(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load Spaces.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadSpaces();
  }, [loadSpaces]);

  async function handleCreateSpace(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName =
      name.trim();

    if (trimmedName.length < 3) {
      setCreateError(
        "Space name must contain at least 3 characters.",
      );
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      const newSpace =
        await createSpace({
          name: trimmedName,
          description:
            description.trim(),
          privacy,
        });

      setSpaces((currentSpaces) => [
        newSpace,
        ...currentSpaces.filter(
          (space) =>
            space.id !== newSpace.id,
        ),
      ]);

      setName("");
      setDescription("");
      setPrivacy("public");
      setIsCreateOpen(false);
    } catch (createSpaceError) {
      setCreateError(
        createSpaceError instanceof Error
          ? createSpaceError.message
          : "Failed to create Space.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] px-6 py-8 sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-20 h-56 w-56 rounded-full bg-cyan-400/[0.07] blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-200">
                AIO Spaces
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Find your community.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/50 sm:text-base">
                Join communities around the
                people, ideas, technology and
                conversations you care about.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreateError("");
                setIsCreateOpen(true);
              }}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              + Create Space
            </button>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Explore Spaces
              </h2>

              {!isLoading && !error ? (
                <p className="mt-1 text-sm text-white/40">
                  {spaces.length}{" "}
                  {spaces.length === 1
                    ? "community"
                    : "communities"}{" "}
                  available
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                void loadSpaces();
              }}
              disabled={isLoading}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map(
                (item) => (
                  <div
                    key={item}
                    className="h-72 animate-pulse rounded-3xl border border-white/[0.07] bg-white/[0.025]"
                  />
                ),
              )}
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="rounded-3xl border border-red-400/15 bg-red-400/[0.06] p-6">
              <h3 className="font-semibold text-red-200">
                Unable to load Spaces
              </h3>

              <p className="mt-2 text-sm text-red-200/60">
                {error}
              </p>

              <button
                type="button"
                onClick={() => {
                  void loadSpaces();
                }}
                className="mt-4 rounded-xl border border-red-300/20 px-4 py-2 text-sm text-red-100 transition hover:bg-red-300/10"
              >
                Try again
              </button>
            </div>
          ) : null}

          {!isLoading &&
          !error &&
          spaces.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                #
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                No Spaces yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45">
                Create the first community
                and start bringing people
                together on AIO.
              </p>

              <button
                type="button"
                onClick={() =>
                  setIsCreateOpen(true)
                }
                className="mt-6 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-black"
              >
                Create Space
              </button>
            </div>
          ) : null}

          {!isLoading &&
          !error &&
          spaces.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {isCreateOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setIsCreateOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-[#111116] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create a Space
                </h2>

                <p className="mt-1 text-xs text-white/40">
                  Build a community on AIO.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsCreateOpen(false)
                }
                disabled={isCreating}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Close create Space dialog"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateSpace}
              className="space-y-5 p-6"
            >
              <div>
                <label
                  htmlFor="space-name"
                  className="mb-2 block text-sm font-medium text-white/75"
                >
                  Space name
                </label>

                <input
                  id="space-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  minLength={3}
                  maxLength={80}
                  required
                  placeholder="Example: AI Builders"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/40 focus:bg-white/[0.06]"
                />
              </div>

              <div>
                <label
                  htmlFor="space-description"
                  className="mb-2 block text-sm font-medium text-white/75"
                >
                  Description
                </label>

                <textarea
                  id="space-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  maxLength={1000}
                  rows={4}
                  placeholder="What is this Space about?"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/40 focus:bg-white/[0.06]"
                />

                <div className="mt-1 text-right text-[11px] text-white/30">
                  {description.length}/1000
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-white/75">
                  Privacy
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPrivacy("public")
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      privacy === "public"
                        ? "border-violet-400/40 bg-violet-400/10"
                        : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
                    }`}
                  >
                    <div className="text-sm font-semibold text-white">
                      Public
                    </div>

                    <div className="mt-1 text-xs leading-5 text-white/40">
                      Anyone can discover
                      and join.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPrivacy("private")
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      privacy === "private"
                        ? "border-violet-400/40 bg-violet-400/10"
                        : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
                    }`}
                  >
                    <div className="text-sm font-semibold text-white">
                      Private
                    </div>

                    <div className="mt-1 text-xs leading-5 text-white/40">
                      Membership is
                      restricted.
                    </div>
                  </button>
                </div>
              </div>

              {createError ? (
                <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200">
                  {createError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 border-t border-white/[0.07] pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setIsCreateOpen(false)
                  }
                  disabled={isCreating}
                  className="h-11 rounded-2xl border border-white/10 px-5 text-sm font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isCreating ||
                    name.trim().length < 3
                  }
                  className="h-11 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isCreating
                    ? "Creating..."
                    : "Create Space"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}