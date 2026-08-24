import { Router } from "express";

import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

import {
  likePost,
  unlikePost,
} from "../controllers/like.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getPosts);

router.get("/:id", getPostById);

router.post("/", authenticate, createPost);

router.put("/:id", authenticate, updatePost);

router.delete("/:id", authenticate, deletePost);

router.post("/:id/like", authenticate, likePost);

router.delete("/:id/like", authenticate, unlikePost);

export default router;