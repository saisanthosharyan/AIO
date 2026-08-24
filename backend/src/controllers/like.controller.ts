import type { Response } from "express";
import mongoose from "mongoose";

import { PostModel } from "../models/Post.js";
import { LikeModel } from "../models/Like.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

function getPostId(
  request: AuthenticatedRequest,
): string | null {
  const { id } = request.params;

  if (typeof id !== "string") {
    return null;
  }

  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return id;
}

export async function likePost(
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

    const id = getPostId(request);

    if (!id) {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post = await PostModel.findById(id);

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const postId =
      new mongoose.Types.ObjectId(id);

    const existingLike =
      await LikeModel.findOne({
        userId: userId,
        postId: postId,
      });

    if (existingLike) {
      response.status(409).json({
        success: false,
        message: "Post already liked",
      });
      return;
    }

    await LikeModel.create({
      userId: userId,
      postId: postId,
    });

    post.likesCount += 1;

    await post.save();

    response.status(201).json({
      success: true,
      message: "Post liked successfully",
      likesCount: post.likesCount,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to like post",
    });
  }
}

export async function unlikePost(
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

    const id = getPostId(request);

    if (!id) {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post = await PostModel.findById(id);

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const postId =
      new mongoose.Types.ObjectId(id);

    const like =
      await LikeModel.findOneAndDelete({
        userId: userId,
        postId: postId,
      });

    if (!like) {
      response.status(404).json({
        success: false,
        message: "Post is not liked",
      });
      return;
    }

    post.likesCount = Math.max(
      0,
      post.likesCount - 1,
    );

    await post.save();

    response.status(200).json({
      success: true,
      message: "Post unliked successfully",
      likesCount: post.likesCount,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to unlike post",
    });
  }
}