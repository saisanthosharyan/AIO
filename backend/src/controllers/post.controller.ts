import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import { PostModel } from "../models/Post.js";
import { LikeModel } from "../models/Like.js";
import { BookmarkModel } from "../models/Bookmark.js";
import { UserModel } from "../models/User.js";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

/**
 * Create a new post
 */
export async function createPost(
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

    const body = request.body ?? {};

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    const imageUrl =
      typeof body.imageUrl === "string"
        ? body.imageUrl.trim()
        : "";

    const type = body.type;

    if (!content && !imageUrl) {
      response.status(400).json({
        success: false,
        message:
          "Post must contain text or an image",
      });
      return;
    }

    if (content.length > 5000) {
      response.status(400).json({
        success: false,
        message:
          "Post content cannot exceed 5000 characters",
      });
      return;
    }

    if (
      type !== undefined &&
      type !== "thought" &&
      type !== "image" &&
      type !== "space"
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid post type",
      });
      return;
    }

    const postType:
      | "thought"
      | "image"
      | "space" =
      type ??
      (imageUrl ? "image" : "thought");

    const post = await PostModel.create({
      authorId: String(userId),
      content,
      imageUrl: imageUrl || undefined,
      type: postType,
    });

    /*
     * Fetch the author's public profile.
     *
     * Password is never selected.
     */
    const author = await UserModel.findById(userId)
      .select(
        "_id username displayName avatarUrl verified",
      )
      .lean();

    const authorProfile = author
      ? {
          id: String(author._id),
          username: author.username,
          displayName: author.displayName,
          verified: author.verified,
          ...(author.avatarUrl
            ? {
                avatarUrl:
                  author.avatarUrl,
              }
            : {}),
        }
      : undefined;

    response.status(201).json({
      success: true,
      message: "Post created successfully",

      post: {
        ...post.toObject(),

        author: authorProfile,

        isLiked: false,
        isBookmarked: false,
      },
    });
  } catch (error) {
    console.error(
      "Create post error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create post",
    });
  }
}

/**
 * Get all posts.
 *
 * Returns:
 * - post data
 * - author profile
 * - current user's like state
 * - current user's bookmark state
 *
 * This endpoint requires authentication because
 * isLiked and isBookmarked are user-specific.
 */
export async function getPosts(
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

    const currentUserId = String(userId);

    /*
     * Get posts newest first.
     */
    const posts = await PostModel.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    /*
     * No posts.
     */
    if (posts.length === 0) {
      response.status(200).json({
        success: true,
        count: 0,
        posts: [],
      });
      return;
    }

    /*
     * Get all post IDs.
     */
    const postIds = posts.map(
      (post) => post._id,
    );

    /*
     * Fetch current user's likes and bookmarks
     * in parallel.
     */
    const [likes, bookmarks] =
      await Promise.all([
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

    /*
     * Create lookup sets for fast O(1) checks.
     */
    const likedPostIds = new Set<string>(
      likes.map((like) =>
        String(like.postId),
      ),
    );

    const bookmarkedPostIds =
      new Set<string>(
        bookmarks.map((bookmark) =>
          String(bookmark.postId),
        ),
      );

    /*
     * Collect unique author IDs.
     *
     * Older legacy posts may contain UUIDs
     * instead of MongoDB ObjectIds.
     *
     * Only valid MongoDB ObjectIds are queried
     * against UserModel.
     */
    const authorIds = [
      ...new Set(
        posts
          .map((post) =>
            String(post.authorId),
          )
          .filter((authorId) =>
            mongoose.isValidObjectId(
              authorId,
            ),
          ),
      ),
    ];

    /*
     * Fetch all valid authors in ONE query.
     *
     * Password is explicitly excluded.
     */
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

    /*
     * Build:
     *
     * authorId -> public author profile
     */
    const authorMap = new Map<
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
      const authorProfile = {
        id: String(author._id),
        username: author.username,
        displayName: author.displayName,
        verified: author.verified,
        ...(author.avatarUrl
          ? {
              avatarUrl:
                author.avatarUrl,
            }
          : {}),
      };

      authorMap.set(
        String(author._id),
        authorProfile,
      );
    }

    /*
     * Normalize every post.
     *
     * Legacy UUID posts simply receive
     * author: undefined instead of crashing
     * the entire feed.
     */
    const normalizedPosts = posts.map(
      (post) => {
        const postId =
          String(post._id);

        const authorId =
          String(post.authorId);

        const author =
          authorMap.get(authorId);

        return {
          ...post,

          author,

          isLiked:
            likedPostIds.has(postId),

          isBookmarked:
            bookmarkedPostIds.has(postId),
        };
      },
    );

    response.status(200).json({
      success: true,
      count: normalizedPosts.length,
      posts: normalizedPosts,
    });
  } catch (error) {
    console.error(
      "Get posts error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch posts",
    });
  }
}

/**
 * Get a single post.
 *
 * This endpoint does not require authentication.
 *
 * Therefore isLiked and isBookmarked are false
 * because there is no current-user context.
 */
export async function getPostById(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const { id } = request.params;

    if (
      typeof id !== "string" ||
      !mongoose.isValidObjectId(id)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post =
      await PostModel.findById(id).lean();

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    /*
     * Only query UserModel if authorId is
     * a valid MongoDB ObjectId.
     */
    let author:
      | {
          _id: mongoose.Types.ObjectId;
          username: string;
          displayName: string;
          avatarUrl?: string;
          verified: boolean;
        }
      | null = null;

    const authorId =
      String(post.authorId);

    if (
      mongoose.isValidObjectId(
        authorId,
      )
    ) {
      author =
        await UserModel.findById(
          authorId,
        )
          .select(
            "_id username displayName avatarUrl verified",
          )
          .lean();
    }

    const authorProfile = author
      ? {
          id: String(author._id),
          username: author.username,
          displayName: author.displayName,
          verified: author.verified,
          ...(author.avatarUrl
            ? {
                avatarUrl:
                  author.avatarUrl,
              }
            : {}),
        }
      : undefined;

    response.status(200).json({
      success: true,

      post: {
        ...post,

        author: authorProfile,

        isLiked: false,
        isBookmarked: false,
      },
    });
  } catch (error) {
    console.error(
      "Get post by id error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch post",
    });
  }
}

/**
 * Update a post.
 */
export async function updatePost(
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

    const { id } = request.params;

    if (
      typeof id !== "string" ||
      !mongoose.isValidObjectId(id)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post =
      await PostModel.findById(id);

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    /*
     * Only the owner can update the post.
     */
    if (
      String(post.authorId) !==
      String(userId)
    ) {
      response.status(403).json({
        success: false,
        message:
          "You are not allowed to update this post",
      });
      return;
    }

    const body = request.body ?? {};

    /*
     * Update content.
     */
    if (body.content !== undefined) {
      if (
        typeof body.content !==
        "string"
      ) {
        response.status(400).json({
          success: false,
          message:
            "Invalid post content",
        });
        return;
      }

      const content =
        body.content.trim();

      if (content.length > 5000) {
        response.status(400).json({
          success: false,
          message:
            "Post content cannot exceed 5000 characters",
        });
        return;
      }

      post.content = content;
    }

    /*
     * Update image.
     */
    if (body.imageUrl !== undefined) {
      if (
        typeof body.imageUrl !==
        "string"
      ) {
        response.status(400).json({
          success: false,
          message:
            "Invalid image URL",
        });
        return;
      }

      post.imageUrl =
        body.imageUrl.trim() ||
        undefined;
    }

    /*
     * Update type.
     */
    if (body.type !== undefined) {
      if (
        body.type !== "thought" &&
        body.type !== "image" &&
        body.type !== "space"
      ) {
        response.status(400).json({
          success: false,
          message:
            "Invalid post type",
        });
        return;
      }

      post.type = body.type;
    }

    /*
     * A post must contain either text or an image.
     */
    const hasContent =
      typeof post.content ===
        "string" &&
      post.content.trim().length > 0;

    const hasImage =
      typeof post.imageUrl ===
        "string" &&
      post.imageUrl.trim().length > 0;

    if (!hasContent && !hasImage) {
      response.status(400).json({
        success: false,
        message:
          "Post must contain text or an image",
      });
      return;
    }

    /*
     * Automatically change the type to image
     * when a post only contains an image.
     */
    if (
      hasImage &&
      !hasContent &&
      post.type === "thought"
    ) {
      post.type = "image";
    }

    await post.save();

    /*
     * Fetch public author information.
     */
    const author = await UserModel.findById(
      userId,
    )
      .select(
        "_id username displayName avatarUrl verified",
      )
      .lean();

    const authorProfile = author
      ? {
          id: String(author._id),
          username: author.username,
          displayName: author.displayName,
          verified: author.verified,
          ...(author.avatarUrl
            ? {
                avatarUrl:
                  author.avatarUrl,
              }
            : {}),
        }
      : undefined;

    response.status(200).json({
      success: true,
      message:
        "Post updated successfully",

      post: {
        ...post.toObject(),

        author: authorProfile,
      },
    });
  } catch (error) {
    console.error(
      "Update post error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update post",
    });
  }
}

/**
 * Delete a post.
 */
export async function deletePost(
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

    const { id } = request.params;

    if (
      typeof id !== "string" ||
      !mongoose.isValidObjectId(id)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post =
      await PostModel.findById(id);

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    /*
     * Only the owner can delete the post.
     */
    if (
      String(post.authorId) !==
      String(userId)
    ) {
      response.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this post",
      });
      return;
    }

    /*
     * Delete related likes and bookmarks
     * to avoid orphaned records.
     */
    await Promise.all([
      LikeModel.deleteMany({
        postId: post._id,
      }),

      BookmarkModel.deleteMany({
        postId: post._id,
      }),

      PostModel.findByIdAndDelete(id),
    ]);

    response.status(200).json({
      success: true,
      message:
        "Post deleted successfully",
      post,
    });
  } catch (error) {
    console.error(
      "Delete post error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete post",
    });
  }
}
