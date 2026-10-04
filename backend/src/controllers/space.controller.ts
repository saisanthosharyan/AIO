import type { Response } from "express";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import {
  SpaceModel,
} from "../models/Space.js";

import {
  SpaceMemberModel,
} from "../models/SpaceMember.js";

import {
  UserModel,
} from "../models/User.js";

import mongoose from "mongoose";

import {
  PostModel,
} from "../models/Post.js";

import {
  LikeModel,
} from "../models/Like.js";

import {
  BookmarkModel,
} from "../models/Bookmark.js";


/* =========================================================
   HELPERS
   ========================================================= */

function createSlug(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function createUniqueSlug(
  name: string,
): Promise<string> {
  const baseSlug =
    createSlug(name) || "space";

  let slug = baseSlug;
  let counter = 2;

  while (
    await SpaceModel.exists({
      slug,
    })
  ) {
    slug =
      `${baseSlug}-${counter}`;

    counter += 1;
  }

  return slug;
}

/* =========================================================
   CREATE SPACE
   ========================================================= */

export async function createSpace(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      name,
      description,
      avatarUrl,
      coverUrl,
      privacy,
    } = request.body as {
      name?: unknown;
      description?: unknown;
      avatarUrl?: unknown;
      coverUrl?: unknown;
      privacy?: unknown;
    };

    if (
      typeof name !== "string" ||
      name.trim().length < 3
    ) {
      response.status(400).json({
        success: false,
        message:
          "Space name must be at least 3 characters",
      });
      return;
    }

    if (name.trim().length > 80) {
      response.status(400).json({
        success: false,
        message:
          "Space name cannot exceed 80 characters",
      });
      return;
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      response.status(400).json({
        success: false,
        message:
          "Description must be a string",
      });
      return;
    }

    if (
      typeof description === "string" &&
      description.trim().length > 1000
    ) {
      response.status(400).json({
        success: false,
        message:
          "Description cannot exceed 1000 characters",
      });
      return;
    }

    if (
      avatarUrl !== undefined &&
      typeof avatarUrl !== "string"
    ) {
      response.status(400).json({
        success: false,
        message:
          "Avatar URL must be a string",
      });
      return;
    }

    if (
      coverUrl !== undefined &&
      typeof coverUrl !== "string"
    ) {
      response.status(400).json({
        success: false,
        message:
          "Cover URL must be a string",
      });
      return;
    }

    if (
      privacy !== undefined &&
      privacy !== "public" &&
      privacy !== "private"
    ) {
      response.status(400).json({
        success: false,
        message:
          "Privacy must be public or private",
      });
      return;
    }

    const creator =
      await UserModel.findById(
        userId,
      )
        .select(
          "_id username displayName avatarUrl verified",
        )
        .lean();

    if (!creator) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const slug =
      await createUniqueSlug(
        name,
      );

    const space =
      await SpaceModel.create({
        creatorId: String(userId),

        name: name.trim(),

        slug,

        description:
          typeof description === "string"
            ? description.trim()
            : "",

        ...(typeof avatarUrl === "string" &&
        avatarUrl.trim()
          ? {
              avatarUrl:
                avatarUrl.trim(),
            }
          : {}),

        ...(typeof coverUrl === "string" &&
        coverUrl.trim()
          ? {
              coverUrl:
                coverUrl.trim(),
            }
          : {}),

        privacy:
          privacy === "private"
            ? "private"
            : "public",

        membersCount: 1,
        postsCount: 0,
      });

    try {
      await SpaceMemberModel.create({
        spaceId: String(space._id),
        userId: String(userId),
        role: "owner",
      });
    } catch (membershipError) {
      /*
       * Do not leave a Space behind if
       * owner membership creation fails.
       */
      await SpaceModel.findByIdAndDelete(
        space._id,
      );

      throw membershipError;
    }

    response.status(201).json({
      success: true,
      message:
        "Space created successfully",

      space: {
        id: String(space._id),
        creatorId:
          String(space.creatorId),
        name: space.name,
        slug: space.slug,
        description:
          space.description,
        avatarUrl:
          space.avatarUrl,
        coverUrl:
          space.coverUrl,
        privacy:
          space.privacy,
        membersCount:
          space.membersCount,
        postsCount:
          space.postsCount,

        creator: {
          id: String(creator._id),
          username:
            creator.username,
          displayName:
            creator.displayName,
          avatarUrl:
            creator.avatarUrl,
          verified:
            creator.verified,
        },

        membership: {
          isMember: true,
          role: "owner",
        },

        createdAt:
          space.createdAt,
        updatedAt:
          space.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Create space error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        "Failed to create space",
    });
  }
}

/* =========================================================
   GET / DISCOVER SPACES
   ========================================================= */

export async function getSpaces(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const spaces =
      await SpaceModel.find({})
        .sort({
          membersCount: -1,
          createdAt: -1,
        })
        .lean();

    if (spaces.length === 0) {
      response.status(200).json({
        success: true,
        count: 0,
        spaces: [],
      });
      return;
    }

    const memberships =
      await SpaceMemberModel.find({
        userId: String(userId),
      })
        .select(
          "spaceId role",
        )
        .lean();

    const membershipMap =
      new Map<
        string,
        string
      >();

    for (
      const membership
      of memberships
    ) {
      membershipMap.set(
        String(
          membership.spaceId,
        ),
        membership.role,
      );
    }

    const creatorIds = [
      ...new Set(
        spaces.map(
          (space) =>
            String(
              space.creatorId,
            ),
        ),
      ),
    ];

    const creators =
      await UserModel.find({
        _id: {
          $in: creatorIds,
        },
      })
        .select(
          "_id username displayName avatarUrl verified",
        )
        .lean();

    const creatorMap =
      new Map<
        string,
        (typeof creators)[number]
      >();

    for (
      const creator
      of creators
    ) {
      creatorMap.set(
        String(creator._id),
        creator,
      );
    }

    const normalizedSpaces =
      spaces.map(
        (space) => {
          const spaceId =
            String(space._id);

          const creator =
            creatorMap.get(
              String(
                space.creatorId,
              ),
            );

          const memberRole =
            membershipMap.get(
              spaceId,
            );

          return {
            id: spaceId,

            creatorId:
              String(
                space.creatorId,
              ),

            name:
              space.name,

            slug:
              space.slug,

            description:
              space.description,

            avatarUrl:
              space.avatarUrl,

            coverUrl:
              space.coverUrl,

            privacy:
              space.privacy,

            membersCount:
              space.membersCount,

            postsCount:
              space.postsCount,

            creator: creator
              ? {
                  id: String(
                    creator._id,
                  ),
                  username:
                    creator.username,
                  displayName:
                    creator.displayName,
                  avatarUrl:
                    creator.avatarUrl,
                  verified:
                    creator.verified,
                }
              : null,

            membership: {
              isMember:
                memberRole !==
                undefined,

              role:
                memberRole ??
                null,
            },

            createdAt:
              space.createdAt,

            updatedAt:
              space.updatedAt,
          };
        },
      );

    response.status(200).json({
      success: true,
      count:
        normalizedSpaces.length,
      spaces:
        normalizedSpaces,
    });
  } catch (error) {
    console.error(
      "Get spaces error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        "Failed to load spaces",
    });
  }
}
/* =========================================================
   GET SPACE BY SLUG
   ========================================================= */

export async function getSpaceBySlug(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { slug } = request.params;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid Space slug",
      });
      return;
    }

    const space =
      await SpaceModel.findOne({
        slug: slug
          .trim()
          .toLowerCase(),
      }).lean();

    if (!space) {
      response.status(404).json({
        success: false,
        message: "Space not found",
      });
      return;
    }

    const [
      creator,
      membership,
    ] = await Promise.all([
      UserModel.findById(
        space.creatorId,
      )
        .select(
          "_id username displayName avatarUrl verified",
        )
        .lean(),

      SpaceMemberModel.findOne({
        spaceId: String(space._id),
        userId: String(userId),
      })
        .select("role")
        .lean(),
    ]);

    response.status(200).json({
      success: true,

      space: {
        id: String(space._id),

        creatorId:
          String(space.creatorId),

        name:
          space.name,

        slug:
          space.slug,

        description:
          space.description,

        avatarUrl:
          space.avatarUrl,

        coverUrl:
          space.coverUrl,

        privacy:
          space.privacy,

        membersCount:
          space.membersCount,

        postsCount:
          space.postsCount,

        creator: creator
          ? {
              id: String(
                creator._id,
              ),

              username:
                creator.username,

              displayName:
                creator.displayName,

              avatarUrl:
                creator.avatarUrl,

              verified:
                creator.verified,
            }
          : null,

        membership: {
          isMember:
            Boolean(membership),

          role:
            membership?.role ??
            null,
        },

        createdAt:
          space.createdAt,

        updatedAt:
          space.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Get space error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        "Failed to load space",
    });
  }
}

/* =========================================================
   GET SPACE POSTS
   ========================================================= */

export async function getSpacePosts(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { slug } = request.params;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid Space slug",
      });
      return;
    }

    const space =
      await SpaceModel.findOne({
        slug: slug
          .trim()
          .toLowerCase(),
      })
        .select(
          "_id name slug privacy",
        )
        .lean();

    if (!space) {
      response.status(404).json({
        success: false,
        message: "Space not found",
      });
      return;
    }

    const currentUserId =
      String(userId);

    const spaceId =
      String(space._id);

    /*
     * Private Spaces should only expose
     * posts to their members.
     */
    if (space.privacy === "private") {
      const membership =
        await SpaceMemberModel.findOne({
          spaceId,
          userId: currentUserId,
        })
          .select("_id")
          .lean();

      if (!membership) {
        response.status(403).json({
          success: false,
          message:
            "You must be a member to view posts in this Space",
        });
        return;
      }
    }

    /*
     * Get only posts belonging
     * to this Space.
     */
    const posts =
      await PostModel.find({
        spaceId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    if (posts.length === 0) {
      response.status(200).json({
        success: true,

        space: {
          id: spaceId,
          name: space.name,
          slug: space.slug,
        },

        count: 0,
        posts: [],
      });
      return;
    }

    const postIds =
      posts.map(
        (post) => post._id,
      );

    /*
     * Fetch current user's likes
     * and bookmarks in parallel.
     */
    const [
      likes,
      bookmarks,
    ] = await Promise.all([
      LikeModel.find({
        userId: currentUserId,

        postId: {
          $in: postIds,
        },
      })
        .select("postId")
        .lean(),

      BookmarkModel.find({
        userId: currentUserId,

        postId: {
          $in: postIds,
        },
      })
        .select("postId")
        .lean(),
    ]);

    const likedPostIds =
      new Set<string>(
        likes.map(
          (like) =>
            String(like.postId),
        ),
      );

    const bookmarkedPostIds =
      new Set<string>(
        bookmarks.map(
          (bookmark) =>
            String(
              bookmark.postId,
            ),
        ),
      );

    /*
     * Collect valid author IDs.
     *
     * This keeps compatibility with
     * older posts that may contain
     * non-MongoDB author IDs.
     */
    const authorIds = [
      ...new Set(
        posts
          .map(
            (post) =>
              String(
                post.authorId,
              ),
          )
          .filter(
            (authorId) =>
              mongoose.isValidObjectId(
                authorId,
              ),
          ),
      ),
    ];

    const authors =
      authorIds.length > 0
        ? await UserModel.find({
            _id: {
              $in: authorIds,
            },
          })
            .select(
              "_id username displayName avatarUrl verified",
            )
            .lean()
        : [];

    const authorMap =
      new Map<
        string,
        {
          id: string;
          username: string;
          displayName: string;
          verified: boolean;
          avatarUrl?: string;
        }
      >();

    for (const author of authors) {
      authorMap.set(
        String(author._id),
        {
          id:
            String(author._id),

          username:
            author.username,

          displayName:
            author.displayName,

          verified:
            author.verified,

          ...(author.avatarUrl
            ? {
                avatarUrl:
                  author.avatarUrl,
              }
            : {}),
        },
      );
    }

    /*
     * Normalize posts using the same
     * shape as the main Stream feed.
     */
    const normalizedPosts =
      posts.map((post) => {
        const postId =
          String(post._id);

        const authorId =
          String(
            post.authorId,
          );

        return {
          ...post,

          author:
            authorMap.get(
              authorId,
            ),

          isLiked:
            likedPostIds.has(
              postId,
            ),

          isBookmarked:
            bookmarkedPostIds.has(
              postId,
            ),
        };
      });

    response.status(200).json({
      success: true,

      space: {
        id: spaceId,
        name: space.name,
        slug: space.slug,
      },

      count:
        normalizedPosts.length,

      posts:
        normalizedPosts,
    });
  } catch (error) {
    console.error(
      "Get Space posts error:",
      error,
    );

    response.status(500).json({
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to load Space posts",
    });
  }
}
/* =========================================================
   JOIN SPACE
   ========================================================= */

export async function joinSpace(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { spaceId } = request.params;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof spaceId !== "string" ||
      !spaceId.trim()
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid Space ID",
      });
      return;
    }

    const space =
      await SpaceModel.findById(
        spaceId,
      );

    if (!space) {
      response.status(404).json({
        success: false,
        message: "Space not found",
      });
      return;
    }

    const existingMembership =
      await SpaceMemberModel.findOne({
        spaceId: String(space._id),
        userId: String(userId),
      });

    if (existingMembership) {
      response.status(409).json({
        success: false,
        message:
          "You are already a member of this Space",
      });
      return;
    }

    /*
     * Private Spaces will eventually use
     * a request/approval flow.
     */
    if (space.privacy === "private") {
      response.status(403).json({
        success: false,
        message:
          "Private Spaces cannot be joined directly",
      });
      return;
    }

    await SpaceMemberModel.create({
      spaceId: String(space._id),
      userId: String(userId),
      role: "member",
    });

    const updatedSpace =
      await SpaceModel.findByIdAndUpdate(
        space._id,
        {
          $inc: {
            membersCount: 1,
          },
        },
        {
          new: true,
        },
      );

    response.status(200).json({
      success: true,
      message:
        "Joined Space successfully",

      membership: {
        isMember: true,
        role: "member",
      },

      membersCount:
        updatedSpace?.membersCount ??
        space.membersCount + 1,
    });
  } catch (error) {
    console.error(
      "Join space error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        "Failed to join Space",
    });
  }
}
/* =========================================================
   LEAVE SPACE
   ========================================================= */

export async function leaveSpace(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { spaceId } = request.params;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof spaceId !== "string" ||
      !spaceId.trim()
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid Space ID",
      });
      return;
    }

    const space =
      await SpaceModel.findById(
        spaceId,
      );

    if (!space) {
      response.status(404).json({
        success: false,
        message: "Space not found",
      });
      return;
    }

    const membership =
      await SpaceMemberModel.findOne({
        spaceId: String(space._id),
        userId: String(userId),
      });

    if (!membership) {
      response.status(404).json({
        success: false,
        message:
          "You are not a member of this Space",
      });
      return;
    }

    /*
     * The owner cannot leave because
     * every Space must keep an owner.
     *
     * Ownership transfer can be added
     * later.
     */
    if (membership.role === "owner") {
      response.status(400).json({
        success: false,
        message:
          "Space owner cannot leave the Space",
      });
      return;
    }

    await SpaceMemberModel.deleteOne({
      _id: membership._id,
    });

    /*
     * Keep the counter from ever
     * becoming negative.
     */
    const updatedSpace =
      await SpaceModel.findOneAndUpdate(
        {
          _id: space._id,
          membersCount: {
            $gt: 0,
          },
        },
        {
          $inc: {
            membersCount: -1,
          },
        },
        {
          new: true,
        },
      );

    response.status(200).json({
      success: true,
      message:
        "Left Space successfully",

      membership: {
        isMember: false,
        role: null,
      },

      membersCount:
        updatedSpace?.membersCount ??
        Math.max(
          0,
          space.membersCount - 1,
        ),
    });
  } catch (error) {
    console.error(
      "Leave space error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        "Failed to leave Space",
    });
  }
}