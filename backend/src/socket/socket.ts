import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import mongoose from "mongoose";

import { verifyToken } from "../utils/jwt.js";
import { ConversationModel } from "../models/Conversation.js";
let appSocket: Server | null = null;

export function getSocketServer(): Server | null {
  return appSocket;
}

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ?? "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (typeof token !== "string" || !token) {
        return next(new Error("Authentication required"));
      }

      const payload = verifyToken(token);

      if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
        return next(new Error("Invalid user"));
      }

      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    socket.join(`user:${userId}`);

    console.log(`Socket connected: ${socket.id}`);

    socket.on(
      "conversation:join",
      async (
        conversationId: unknown,
        callback?: (result: { success: boolean }) => void,
      ) => {
        try {
          if (
            typeof conversationId !== "string" ||
            !mongoose.Types.ObjectId.isValid(conversationId)
          ) {
            callback?.({ success: false });
            return;
          }

          const conversation = await ConversationModel.exists({
            _id: conversationId,
            participantIds: userId,
          });

          if (!conversation) {
            callback?.({ success: false });
            return;
          }

          socket.join(`conversation:${conversationId}`);
          callback?.({ success: true });
        } catch {
          callback?.({ success: false });
        }
      },
    );

    socket.on("conversation:leave", (conversationId: unknown) => {
      if (typeof conversationId === "string") {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
  appSocket = io;
  return io;
}