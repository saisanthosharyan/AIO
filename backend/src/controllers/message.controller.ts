import mongoose from "mongoose";
import type { Response } from "express";

import {
  ConversationModel,
} from "../models/Conversation.js";

import {
  MessageModel,
} from "../models/Message.js";

import {
  UserModel,
} from "../models/User.js";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

function isValidId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    mongoose.Types.ObjectId.isValid(value)
  );
}

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

export async function createConversation(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { participantId } = request.body;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      !isValidId(userId) ||
      !isValidId(participantId)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    if (userId === participantId) {
      response.status(400).json({
        success: false,
        message:
          "You cannot start a conversation with yourself",
      });
      return;
    }

    const participant =
      await UserModel.findById(participantId)
        .select(
          "_id username displayName avatarUrl verified",
        )
        .lean();

    if (!participant) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    let conversation =
      await ConversationModel.findOne({
        participantIds: {
          $all: [userId, participantId],
          $size: 2,
        },
      });

    let created = false;

    if (!conversation) {
      conversation =
        await ConversationModel.create({
          participantIds: [
            userId,
            participantId,
          ],
        });

      created = true;
    }

    response.status(created ? 201 : 200).json({
      success: true,
      created,
      conversation: {
        id: conversation._id.toString(),
        _id: conversation._id.toString(),
        participantIds:
          conversation.participantIds,
        lastMessageId:
          conversation.lastMessageId,
        lastMessageText:
          conversation.lastMessageText,
        lastMessageSenderId:
          conversation.lastMessageSenderId,
        lastMessageAt:
          conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        participant:
          normalizeUser(participant),
      },
    });
  } catch (error) {
    console.error(
      "Create conversation error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create conversation",
    });
  }
}

export async function getConversations(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;

    if (!userId || !isValidId(userId)) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const conversations =
      await ConversationModel.find({
        participantIds: userId,
      })
        .sort({
          lastMessageAt: -1,
          updatedAt: -1,
        })
        .lean();

    const otherUserIds = [
      ...new Set(
        conversations
          .flatMap(
            (conversation) =>
              conversation.participantIds,
          )
          .filter((id) => id !== userId),
      ),
    ].filter((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );

    const users = await UserModel.find({
      _id: {
        $in: otherUserIds.map(
          (id) =>
            new mongoose.Types.ObjectId(id),
        ),
      },
    })
      .select(
        "_id username displayName avatarUrl verified",
      )
      .lean();

    const userMap = new Map(
      users.map((user) => [
        user._id.toString(),
        normalizeUser(user),
      ]),
    );

    const normalized =
      conversations.map((conversation) => {
        const participantId =
          conversation.participantIds.find(
            (id) => id !== userId,
          );

        return {
          id: conversation._id.toString(),
          _id: conversation._id.toString(),
          participantIds:
            conversation.participantIds,
          participant: participantId
            ? userMap.get(participantId) ?? null
            : null,
          lastMessageId:
            conversation.lastMessageId,
          lastMessageText:
            conversation.lastMessageText,
          lastMessageSenderId:
            conversation.lastMessageSenderId,
          lastMessageAt:
            conversation.lastMessageAt,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        };
      });

    response.status(200).json({
      success: true,
      count: normalized.length,
      conversations: normalized,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch conversations",
    });
  }
}

export async function getMessages(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { conversationId } =
      request.params;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      !isValidId(userId) ||
      !isValidId(conversationId)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
      return;
    }

    const conversation =
      await ConversationModel.findOne({
        _id: conversationId,
        participantIds: userId,
      }).lean();

    if (!conversation) {
      response.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    const messages =
      await MessageModel.find({
        conversationId,
      })
        .sort({ createdAt: 1 })
        .lean();

    response.status(200).json({
      success: true,
      count: messages.length,
      messages: messages.map(
        (message) => ({
          id: message._id.toString(),
          _id: message._id.toString(),
          conversationId:
            message.conversationId,
          senderId: message.senderId,
          content: message.content,
          imageUrl: message.imageUrl,
          readBy: message.readBy,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        }),
      ),
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch messages",
    });
  }
}

export async function sendMessage(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { conversationId } =
      request.params;

    const { content, imageUrl } =
      request.body;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      !isValidId(userId) ||
      !isValidId(conversationId)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
      return;
    }

    const normalizedContent =
      typeof content === "string"
        ? content.trim()
        : "";

    const normalizedImageUrl =
      typeof imageUrl === "string"
        ? imageUrl.trim()
        : "";

    if (
      !normalizedContent &&
      !normalizedImageUrl
    ) {
      response.status(400).json({
        success: false,
        message:
          "Message content or image is required",
      });
      return;
    }

    if (normalizedContent.length > 5000) {
      response.status(400).json({
        success: false,
        message:
          "Message must be 5000 characters or less",
      });
      return;
    }

    const conversation =
      await ConversationModel.findOne({
        _id: conversationId,
        participantIds: userId,
      });

    if (!conversation) {
      response.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    const messageData = {
      conversationId,
      senderId: userId,
      content: normalizedContent,
      readBy: [userId],
      ...(normalizedImageUrl
        ? { imageUrl: normalizedImageUrl }
        : {}),
    };

    const message =
      await MessageModel.create(
        messageData,
      );

    conversation.lastMessageId =
      message._id.toString();

    conversation.lastMessageText =
      normalizedContent ||
      (normalizedImageUrl
        ? "Sent an image"
        : "");

    conversation.lastMessageSenderId =
      userId;

    conversation.lastMessageAt =
      message.createdAt;

    await conversation.save();

    response.status(201).json({
      success: true,
      message: {
        id: message._id.toString(),
        _id: message._id.toString(),
        conversationId:
          message.conversationId,
        senderId: message.senderId,
        content: message.content,
        imageUrl: message.imageUrl,
        readBy: message.readBy,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Send message error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send message",
    });
  }
}

export async function markConversationRead(
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> {
  try {
    const userId = request.userId;
    const { conversationId } =
      request.params;

    if (!userId) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      !isValidId(userId) ||
      !isValidId(conversationId)
    ) {
      response.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
      return;
    }

    const conversation =
      await ConversationModel.findOne({
        _id: conversationId,
        participantIds: userId,
      })
        .select("_id")
        .lean();

    if (!conversation) {
      response.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    const result =
      await MessageModel.updateMany(
        {
          conversationId,
          senderId: {
            $ne: userId,
          },
          readBy: {
            $ne: userId,
          },
        },
        {
          $addToSet: {
            readBy: userId,
          },
        },
      );

    response.status(200).json({
      success: true,
      message:
        "Conversation marked as read",
      updatedCount:
        result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark conversation read error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark conversation as read",
    });
  }
}

