import { Router } from "express";

import {
  getCurrentUser,
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/*
 * Current user's profile
 */
router.get(
  "/me",
  authenticate,
  getCurrentUser,
);

/*
 * Update current user's profile
 */
router.put(
  "/me",
  authenticate,
  updateProfile,
);

/*
 * Follow / unfollow a user
 */
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

/*
 * Followers / following lists
 */
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

/*
 * Public user profile.
 *
 * Keep this route LAST because it accepts
 * any single path segment.
 */
router.get(
  "/:username",
  authenticate,
  getUserProfile,
);

export default router;