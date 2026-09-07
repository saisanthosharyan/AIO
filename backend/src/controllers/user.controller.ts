import type { Response } from "express";

import mongoose from "mongoose";

import { UserModel } from "../models/User.js";
import { FollowModel } from "../models/Follow.js";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

/**
 * Get the currently authenticated user's profile.
 */
export async function getCurrentUser(
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

    const user = await UserModel.findById(
      userId,
    ).select("-password");

    if (!user) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    response.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        id: user._id.toString(),
      },
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch current user",
    });
  }
}

/**
 * Get a public user profile by username.
 */
export async function getUserProfile(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const { username } = request.params;

    if (
      typeof username !== "string" ||
      !username.trim()
    ) {
      response.status(400).json({
        success: false,
        message: "Username is required",
      });
      return;
    }

    const user = await UserModel.findOne({
      username: username.trim(),
    }).select("-password");

    if (!user) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    let isFollowing = false;

    if (request.userId) {
      const follow = await FollowModel.findOne({
        followerId: String(request.userId),
        followingId: user._id.toString(),
      });

      isFollowing = Boolean(follow);
    }

    response.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        id: user._id.toString(),
        isFollowing,
      },
    });
  } catch (error) {
    console.error(
      "Get user profile error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch user profile",
    });
  }
}

/**
 * Update the currently authenticated user's profile.
 */
export async function updateProfile(
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

    const user =
      await UserModel.findById(userId);

    if (!user) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const body = request.body ?? {};

    if (body.displayName !== undefined) {
      if (
        typeof body.displayName !==
        "string"
      ) {
        response.status(400).json({
          success: false,
          message: "Invalid display name",
        });
        return;
      }

      const displayName =
        body.displayName.trim();

      if (!displayName) {
        response.status(400).json({
          success: false,
          message:
            "Display name cannot be empty",
        });
        return;
      }

      if (displayName.length > 80) {
        response.status(400).json({
          success: false,
          message:
            "Display name cannot exceed 80 characters",
        });
        return;
      }

      user.displayName = displayName;
    }

    if (body.bio !== undefined) {
      if (
        typeof body.bio !== "string"
      ) {
        response.status(400).json({
          success: false,
          message: "Invalid bio",
        });
        return;
      }

      const bio = body.bio.trim();

      if (bio.length > 500) {
        response.status(400).json({
          success: false,
          message:
            "Bio cannot exceed 500 characters",
        });
        return;
      }

      user.bio = bio || undefined;
    }

    if (body.avatarUrl !== undefined) {
      if (
        typeof body.avatarUrl !==
        "string"
      ) {
        response.status(400).json({
          success: false,
          message:
            "Invalid avatar URL",
        });
        return;
      }

      user.avatarUrl =
        body.avatarUrl.trim() ||
        undefined;
    }

    await user.save();

    const userObject = user.toObject() as unknown as Record<string, unknown>;
    delete userObject.password;

    response.status(200).json({
    success: true,
    message:
        "Profile updated successfully",
    user: {
        ...userObject,
        id: user._id.toString(),
    },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update profile",
    });
  }
}

/**
 * Follow another user.
 */
export async function followUser(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { userId: targetUserId } =
      request.params;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof targetUserId !== "string" ||
      !mongoose.isValidObjectId(
        targetUserId,
      )
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    if (
      String(userId) ===
      String(targetUserId)
    ) {
      response.status(400).json({
        success: false,
        message:
          "You cannot follow yourself",
      });
      return;
    }

    const targetUser =
      await UserModel.findById(
        targetUserId,
      );

    if (!targetUser) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const existingFollow =
      await FollowModel.findOne({
        followerId: String(userId),
        followingId: targetUserId,
      });

    if (existingFollow) {
      response.status(409).json({
        success: false,
        message: "Already following this user",
      });
      return;
    }

    await FollowModel.create({
      followerId: String(userId),
      followingId: targetUserId,
    });

    await Promise.all([
      UserModel.findByIdAndUpdate(
        userId,
        {
          $inc: {
            followingCount: 1,
          },
        },
      ),

      UserModel.findByIdAndUpdate(
        targetUserId,
        {
          $inc: {
            followersCount: 1,
          },
        },
      ),
    ]);

    response.status(201).json({
      success: true,
      message: "User followed successfully",
    });
  } catch (error) {
    console.error(
      "Follow user error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to follow user",
    });
  }
}

/**
 * Unfollow another user.
 */
export async function unfollowUser(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { userId: targetUserId } =
      request.params;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof targetUserId !== "string" ||
      !mongoose.isValidObjectId(
        targetUserId,
      )
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const follow =
      await FollowModel.findOneAndDelete({
        followerId: String(userId),
        followingId: targetUserId,
      });

    if (!follow) {
      response.status(404).json({
        success: false,
        message:
          "You are not following this user",
      });
      return;
    }

    await Promise.all([
      UserModel.findByIdAndUpdate(
        userId,
        {
          $inc: {
            followingCount: -1,
          },
        },
      ),

      UserModel.findByIdAndUpdate(
        targetUserId,
        {
          $inc: {
            followersCount: -1,
          },
        },
      ),
    ]);

    response.status(200).json({
      success: true,
      message:
        "User unfollowed successfully",
    });
  } catch (error) {
    console.error(
      "Unfollow user error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to unfollow user",
    });
  }
}

/**
 * Get a user's followers.
 */
export async function getFollowers(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const { userId } = request.params;

    if (
      typeof userId !== "string" ||
      !mongoose.isValidObjectId(userId)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const user =
      await UserModel.findById(userId);

    if (!user) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const follows =
      await FollowModel.find({
        followingId: userId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    const followerIds =
      follows.map(
        (follow) => follow.followerId,
      );

    const followers =
      await UserModel.find({
        _id: {
          $in: followerIds,
        },
      })
        .select("-password")
        .lean();

    const followerMap = new Map(
      followers.map((follower) => [
        follower._id.toString(),
        follower,
      ]),
    );

    const orderedFollowers =
    followerIds
        .map((id) =>
        followerMap.get(String(id)),
        )
        .filter(
        (
            follower,
        ): follower is NonNullable<
            typeof follower
        > => Boolean(follower),
        )
        .map((follower) => ({
        ...follower,
        id: follower._id.toString(),
        }));

    response.status(200).json({
      success: true,
      count: orderedFollowers.length,
      followers: orderedFollowers,
    });
  } catch (error) {
    console.error(
      "Get followers error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch followers",
    });
  }
}

/**
 * Get users followed by a user.
 */
export async function getFollowing(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const { userId } = request.params;

    if (
      typeof userId !== "string" ||
      !mongoose.isValidObjectId(userId)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const user =
      await UserModel.findById(userId);

    if (!user) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const follows =
      await FollowModel.find({
        followerId: userId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    const followingIds =
      follows.map(
        (follow) => follow.followingId,
      );

    const following =
      await UserModel.find({
        _id: {
          $in: followingIds,
        },
      })
        .select("-password")
        .lean();

    const followingMap = new Map(
      following.map((followedUser) => [
        followedUser._id.toString(),
        followedUser,
      ]),
    );

    const orderedFollowing =
    followingIds
        .map((id) =>
        followingMap.get(String(id)),
        )
        .filter(
        (
            followedUser,
        ): followedUser is NonNullable<
            typeof followedUser
        > => Boolean(followedUser),
        )
        .map((followedUser) => ({
        ...followedUser,
        id: followedUser._id.toString(),
        }));

    response.status(200).json({
      success: true,
      count: orderedFollowing.length,
      following: orderedFollowing,
    });
  } catch (error) {
    console.error(
      "Get following error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch following",
    });
  }
}