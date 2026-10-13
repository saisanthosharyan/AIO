
import mongoose from "mongoose";
import type { Response } from "express";

import { CommentModel } from "../models/Comment.js";
import { PostModel } from "../models/Post.js";
import { UserModel } from "../models/User.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

function normalizeUser(user: {
  _id: mongoose.Types.ObjectId;
  username: string;
  displayName: string;
  avatarUrl?: string;
  verified: boolean;
}) {
  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    verified: user.verified,
  };
}

export async function createComment(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { id } = request.params;
    const { content, parentCommentId } = request.body ?? {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    if (typeof content !== "string" || !content.trim()) {
      response.status(400).json({
        success: false,
        message: "Comment content is required",
      });
      return;
    }

    if (content.trim().length > 1000) {
      response.status(400).json({
        success: false,
        message: "Comment must be 1000 characters or less",
      });
      return;
    }

    if (
      parentCommentId !== undefined &&
      parentCommentId !== null &&
      (typeof parentCommentId !== "string" ||
        !mongoose.Types.ObjectId.isValid(parentCommentId))
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid parent comment ID",
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

    let parentId: mongoose.Types.ObjectId | null = null;

    if (parentCommentId) {
      parentId = new mongoose.Types.ObjectId(parentCommentId);


    const parent = await CommentModel.findOne({
      _id: parentId,
      postId,
      isDeleted: { $ne: true },
    });


      if (!parent) {
        response.status(404).json({
          success: false,
          message: "Parent comment not found on this post",
        });
        return;
      }
    }

    const user = await UserModel.findById(userObjectId)
      .select("_id username displayName avatarUrl verified")
      .lean();

    if (!user) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const comment = await CommentModel.create({
      userId: userObjectId,
      postId,
      parentCommentId: parentId,
      content: content.trim(),
    });

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } },
      { new: true },
    );

    response.status(201).json({
      success: true,
      message: parentId
        ? "Reply created successfully"
        : "Comment created successfully",
      comment: {
        _id: comment._id.toString(),
        id: comment._id.toString(),
        userId: comment.userId.toString(),
        postId: comment.postId.toString(),
        parentCommentId: parentId?.toString() ?? null,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: normalizeUser(user),
      },
      commentsCount: updatedPost?.commentsCount ?? 0,
    });
  } catch (error) {
    console.error("Create comment error:", error);

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

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const postId = new mongoose.Types.ObjectId(id);

    const post = await PostModel.findById(postId)
      .select("_id")
      .lean();

    if (!post) {
      response.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const comments = await CommentModel.find({ postId })
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    if (comments.length === 0) {
      response.status(200).json({
        success: true,
        count: 0,
        comments: [],
      });
      return;
    }

    const userIds = [
      ...new Set(
        comments.map((comment) => comment.userId.toString()),
      ),
    ]
      .filter((value) => mongoose.Types.ObjectId.isValid(value))
      .map((value) => new mongoose.Types.ObjectId(value));

    const users = await UserModel.find({
      _id: { $in: userIds },
    })
      .select("_id username displayName avatarUrl verified")
      .lean();

    const userMap = new Map(
      users.map((user) => [
        user._id.toString(),
        normalizeUser(user),
      ]),
    );


const normalizedComments = comments.map((comment) => {
  const isDeleted = comment.isDeleted === true;

  return {
    _id: comment._id.toString(),
    id: comment._id.toString(),
    userId: isDeleted ? null : comment.userId.toString(),
    postId: comment.postId.toString(),
    parentCommentId:
      comment.parentCommentId?.toString() ?? null,
    content: isDeleted ? "[deleted]" : comment.content,
    isDeleted,
    deletedAt: isDeleted ? comment.deletedAt ?? null : null,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: isDeleted
      ? null
      : userMap.get(comment.userId.toString()) ?? null,
  };
});


    response.status(200).json({
      success: true,
      count: normalizedComments.length,
      comments: normalizedComments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

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
    const { id, commentId } = request.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof id !== "string" ||
      typeof commentId !== "string" ||
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid comment or post ID",
      });
      return;
    }

    const postId = new mongoose.Types.ObjectId(id);
    const commentObjectId = new mongoose.Types.ObjectId(commentId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const comment = await CommentModel.findOneAndUpdate(
      {
        _id: commentObjectId,
        postId,
        userId: userObjectId,
        isDeleted: { $ne: true },
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          content: "[deleted]",
        },
      },
      { new: true },
    );

    if (!comment) {
      response.status(404).json({
        success: false,
        message: "Comment not found or already deleted",
      });
      return;
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: -1 } },
      { new: true },
    );

    response.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      comment: {
        _id: comment._id.toString(),
        id: comment._id.toString(),
        parentCommentId:
          comment.parentCommentId?.toString() ?? null,
        content: "[deleted]",
        isDeleted: true,
        deletedAt: comment.deletedAt,
        author: null,
      },
      commentsCount: updatedPost?.commentsCount ?? 0,
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete comment",
    });
  }
}
