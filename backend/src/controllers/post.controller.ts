import type { Request, Response } from "express";
import { PostModel } from "../models/Post.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

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

    const { content, imageUrl, type } = request.body;

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      response.status(400).json({
        success: false,
        message: "Content is required",
      });
      return;
    }

    const post = await PostModel.create({
      authorId: userId,
      content: content.trim(),
      imageUrl,
      type: type ?? "thought",
    });

    response.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
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
      .sort({ createdAt: -1 })
      .lean();

    response.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
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

    const post = await PostModel.findById(id);

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
    const { content, imageUrl, type } = request.body;

    const post = await PostModel.findById(id);

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
        message: "You are not allowed to update this post",
      });
      return;
    }

    if (content !== undefined) {
      if (
        typeof content !== "string" ||
        !content.trim()
      ) {
        response.status(400).json({
          success: false,
          message: "Content cannot be empty",
        });
        return;
      }

      post.content = content.trim();
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== "string") {
        response.status(400).json({
          success: false,
          message: "Invalid image URL",
        });
        return;
      }

      post.imageUrl = imageUrl;
    }

    if (type !== undefined) {
      if (
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

      post.type = type;
    }

    await post.save();

    response.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
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

    const post = await PostModel.findById(id);

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
        message: "You are not allowed to delete this post",
      });
      return;
    }

    await PostModel.findByIdAndDelete(id);

    response.status(200).json({
      success: true,
      message: "Post deleted successfully",
      post,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete post",
    });
  }
}