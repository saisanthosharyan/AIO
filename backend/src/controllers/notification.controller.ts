import type { Response } from "express";
import mongoose from "mongoose";

import { NotificationModel } from "../models/Notification.js";
import { UserModel } from "../models/User.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
export async function getNotifications(
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

    const notifications =
      await NotificationModel.find({
        recipientId: String(userId),
      })
        .sort({
          createdAt: -1,
        })
        .limit(50)
        .lean();

    const actorIds = [
    ...new Set(
        notifications.map(
        (notification: typeof notifications[number]) =>
            String(notification.actorId),
        ),
    ),
    ];

    const actors =
      actorIds.length > 0
        ? await UserModel.find({
            _id: {
              $in: actorIds.filter((id) =>
                mongoose.isValidObjectId(id),
              ),
            },
          })
            .select(
              "_id username displayName avatarUrl verified",
            )
            .lean()
        : [];

    const actorMap = new Map(
        actors.map((actor: typeof actors[number]) => [
        actor._id.toString(),
        {
          id: actor._id.toString(),
          username: actor.username,
          displayName: actor.displayName,
          avatarUrl: actor.avatarUrl,
          verified: actor.verified,
        },
      ]),
    );

    const normalizedNotifications =
        notifications.map(
            (notification: typeof notifications[number]) => ({
          ...notification,
          id: notification._id.toString(),
          actor:
            actorMap.get(
              String(notification.actorId),
            ) ?? null,
        }),
      );

    const unreadCount =
      await NotificationModel.countDocuments({
        recipientId: String(userId),
        read: false,
      });

    response.status(200).json({
      success: true,
      count: normalizedNotifications.length,
      unreadCount,
      notifications:
        normalizedNotifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch notifications",
    });
  }
}

export async function getUnreadNotificationCount(
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

    const unreadCount =
      await NotificationModel.countDocuments({
        recipientId: String(userId),
        read: false,
      });

    response.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch unread notification count",
    });
  }
}

export async function markNotificationAsRead(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { notificationId } =
      request.params;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      typeof notificationId !== "string" ||
      !mongoose.isValidObjectId(
        notificationId,
      )
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
      return;
    }

    const notification =
      await NotificationModel.findOneAndUpdate(
        {
          _id: notificationId,
          recipientId: String(userId),
        },
        {
          $set: {
            read: true,
          },
        },
        {
          new: true,
        },
      ).lean();

    if (!notification) {
      response.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    response.status(200).json({
      success: true,
      message:
        "Notification marked as read",
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read",
    });
  }
}

export async function markAllNotificationsAsRead(
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

    await NotificationModel.updateMany(
      {
        recipientId: String(userId),
        read: false,
      },
      {
        $set: {
          read: true,
        },
      },
    );

    response.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read",
    });
  }
}