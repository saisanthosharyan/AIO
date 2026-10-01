import { Router } from "express";

import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
} from "../controllers/message.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/conversations",
  getConversations,
);

router.post(
  "/conversations",
  createConversation,
);

router.get(
  "/conversations/:conversationId/messages",
  getMessages,
);

router.post(
  "/conversations/:conversationId/messages",
  sendMessage,
);

router.patch(
  "/conversations/:conversationId/read",
  markConversationRead,
);

export default router;
