import mongoose from "mongoose";
import type { Response } from "express";

import { CommentModel } from "../models/Comment.js";
import { PostModel } from "../models/Post.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export async function createComment(
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
    const { content } = request.body;

    if (typeof id !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      response.status(400).json({
        success: false,
        message: "Comment content is required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const postId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const post = await PostModel.findById(postId);

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const comment = await CommentModel.create({
      userId: userObjectId,
      postId,
      content: content.trim(),
    });

    post.commentsCount += 1;
    await post.save();

    response.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment,
      commentsCount: post.commentsCount,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create comment",
    });
  }
}

export async function getComments(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const { id } = request.params;

    if (typeof id !== "string") {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const postId = new mongoose.Types.ObjectId(id);

    const post = await PostModel.findById(postId);

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const comments = await CommentModel.find({
      postId,
    })
      .sort({ createdAt: -1 })
      .lean();

    response.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch comments",
    });
  }
}

export async function deleteComment(
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

    const { id, commentId } = request.params;

    if (
      typeof id !== "string" ||
      typeof commentId !== "string"
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid comment or post ID",
      });
      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(commentId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid ID",
      });
      return;
    }

    const postId = new mongoose.Types.ObjectId(id);
    const commentObjectId =
      new mongoose.Types.ObjectId(commentId);
    const userObjectId =
      new mongoose.Types.ObjectId(userId);

    const comment = await CommentModel.findOneAndDelete({
      _id: commentObjectId,
      postId,
      userId: userObjectId,
    });

    if (!comment) {
      response.status(404).json({
        success: false,
        message:
          "Comment not found or you are not the owner",
      });
      return;
    }

    const post = await PostModel.findById(postId);

    if (post) {
      post.commentsCount = Math.max(
        0,
        post.commentsCount - 1,
      );

      await post.save();
    }

    response.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      comment,
      commentsCount: post?.commentsCount ?? 0,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete comment",
    });
  }
}