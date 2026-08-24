import mongoose from "mongoose";
import type { Response } from "express";

import { BookmarkModel } from "../models/Bookmark.js";
import { PostModel } from "../models/Post.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export async function bookmarkPost(
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
      !mongoose.Types.ObjectId.isValid(id)
    ) {
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

    const existingBookmark = await BookmarkModel.findOne({
      userId,
      postId,
    });

    if (existingBookmark) {
      response.status(409).json({
        success: false,
        message: "Post already bookmarked",
      });
      return;
    }

    await BookmarkModel.create({
      userId,
      postId,
    });

    post.bookmarksCount += 1;
    await post.save();

    response.status(201).json({
      success: true,
      message: "Post bookmarked successfully",
      bookmarksCount: post.bookmarksCount,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to bookmark post",
    });
  }
}

export async function unbookmarkPost(
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
      !mongoose.Types.ObjectId.isValid(id)
    ) {
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

    const bookmark = await BookmarkModel.findOneAndDelete({
      userId,
      postId,
    });

    if (!bookmark) {
      response.status(404).json({
        success: false,
        message: "Post is not bookmarked",
      });
      return;
    }

    post.bookmarksCount = Math.max(
      0,
      post.bookmarksCount - 1,
    );

    await post.save();

    response.status(200).json({
      success: true,
      message: "Post unbookmarked successfully",
      bookmarksCount: post.bookmarksCount,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to unbookmark post",
    });
  }
}

export async function getBookmarkedPosts(
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

    const bookmarks = await BookmarkModel.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .populate("postId")
      .lean();

    response.status(200).json({
      success: true,
      count: bookmarks.length,
      bookmarks,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch bookmarked posts",
    });
  }
}