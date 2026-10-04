import { Router } from "express";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

import {
  createSpace,
  getSpaceBySlug,
  getSpacePosts,
  getSpaces,
  joinSpace,
  leaveSpace,
} from "../controllers/space.controller.js";

const router = Router();

/* =========================================================
   GET /api/spaces
   Discover / list Spaces
   ========================================================= */

router.get(
  "/",
  authenticate,
  getSpaces,
);

/* =========================================================
   POST /api/spaces
   Create a new Space
   ========================================================= */

router.post(
  "/",
  authenticate,
  createSpace,
);

/* =========================================================
   POST /api/spaces/:spaceId/join
   Join a public Space
   ========================================================= */

router.post(
  "/:spaceId/join",
  authenticate,
  joinSpace,
);

/* =========================================================
   DELETE /api/spaces/:spaceId/join
   Leave a Space
   ========================================================= */

router.delete(
  "/:spaceId/join",
  authenticate,
  leaveSpace,
);

/* =========================================================
   GET /api/spaces/:slug/posts
   Get posts belonging to a Space
   ========================================================= */

router.get(
  "/:slug/posts",
  authenticate,
  getSpacePosts,
);

/* =========================================================
   GET /api/spaces/:slug
   Get one Space by slug

   Keep this route LAST because it is the generic
   dynamic Space route.
   ========================================================= */

router.get(
  "/:slug",
  authenticate,
  getSpaceBySlug,
);

export default router;