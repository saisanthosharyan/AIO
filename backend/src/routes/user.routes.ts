import { Router } from "express";

import {
  getCurrentUser,
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  getCurrentUser,
);

router.put(
  "/me",
  authenticate,
  updateProfile,
);

router.get(
  "/search",
  authenticate,
  searchUsers,
);

router.post(
  "/:userId/follow",
  authenticate,
  followUser,
);

router.delete(
  "/:userId/follow",
  authenticate,
  unfollowUser,
);

router.get(
  "/:userId/followers",
  authenticate,
  getFollowers,
);

router.get(
  "/:userId/following",
  authenticate,
  getFollowing,
);

router.get(
  "/:username",
  authenticate,
  getUserProfile,
);

export default router;