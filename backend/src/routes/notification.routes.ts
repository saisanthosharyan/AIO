import { Router } from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getNotifications,
);

router.get(
  "/unread-count",
  authenticate,
  getUnreadNotificationCount,
);

router.patch(
  "/read-all",
  authenticate,
  markAllNotificationsAsRead,
);

router.patch(
  "/:notificationId/read",
  authenticate,
  markNotificationAsRead,
);

export default router;