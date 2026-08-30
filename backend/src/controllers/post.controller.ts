import type {
  Request,
  Response,
} from "express";

import { PostModel } from "../models/Post.js";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

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

    /*
     * A post must contain either text or an image.
     */
    if (!content && !imageUrl) {
      response.status(400).json({
        success: false,
        message:
          "Post must contain text or an image",
      });
      return;
    }

    /*
     * Validate content length.
     */
    if (content.length > 5000) {
      response.status(400).json({
        success: false,
        message:
          "Post content cannot exceed 5000 characters",
      });
      return;
    }

    /*
     * Validate post type.
     */
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

    /*
     * Automatically determine the type when
     * the frontend does not provide one.
     */
    const postType:
      | "thought"
      | "image"
      | "space" =
      type ??
      (imageUrl ? "image" : "thought");

    /*
     * Create the post.
     *
     * content is allowed to be an empty string
     * because image-only posts are supported.
     */
    const post = await PostModel.create({
      authorId: userId,
      content,
      imageUrl: imageUrl || undefined,
      type: postType,
    });

    response.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
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

export async function getPosts(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const posts = await PostModel.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    response.status(200).json({
      success: true,
      count: posts.length,
      posts,
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

export async function getPostById(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const { id } = request.params;

    const post =
      await PostModel.findById(id);

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    response.status(200).json({
      success: true,
      post,
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

    const post =
      await PostModel.findById(id);

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    if (post.authorId !== userId) {
      response.status(403).json({
        success: false,
        message:
          "You are not allowed to update this post",
      });
      return;
    }

    const body = request.body ?? {};

    if (
      body.content !== undefined
    ) {
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

    if (
      body.imageUrl !== undefined
    ) {
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
     * Never allow an empty post.
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
     * Automatically change type when
     * an image is added to a thought post.
     */
    if (
      hasImage &&
      !hasContent &&
      post.type === "thought"
    ) {
      post.type = "image";
    }

    await post.save();

    response.status(200).json({
      success: true,
      message:
        "Post updated successfully",
      post,
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

    const post =
      await PostModel.findById(id);

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    if (post.authorId !== userId) {
      response.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this post",
      });
      return;
    }

    await PostModel.findByIdAndDelete(id);

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