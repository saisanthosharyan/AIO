import { Router } from "express";

import {
  createComment,
  getComments,
  deleteComment,
} from "../controllers/comment.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.get("/", getComments);

router.post("/", authenticate, createComment);

router.delete("/:commentId", authenticate, deleteComment);

export default router;