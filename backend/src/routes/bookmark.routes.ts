import { Router } from "express";

import {
  bookmarkPost,
  unbookmarkPost,
  getBookmarkedPosts,
} from "../controllers/bookmark.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getBookmarkedPosts);

router.post("/:id", authenticate, bookmarkPost);

router.delete("/:id", authenticate, unbookmarkPost);

export default router;