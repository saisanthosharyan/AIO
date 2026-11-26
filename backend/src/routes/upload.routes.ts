import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

import { uploadImage } from "../controllers/upload.controller.js";
import { uploadClip } from "../controllers/clip-upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

const clipsDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "clips",
);

const clipUpload = multer({
  storage: multer.diskStorage({
    destination(_request, _file, callback) {
      fs.mkdirSync(clipsDirectory, { recursive: true });
      callback(null, clipsDirectory);
    },
    filename(_request, file, callback) {
      const extension =
        file.mimetype === "video/mp4" ? ".mp4" : ".webm";

      callback(null, `${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_request, file, callback) {
    const supportedTypes = [
      "video/mp4",
      "video/webm",
    ];

    if (!supportedTypes.includes(file.mimetype)) {
      callback(new Error("Only MP4 and WebM videos are supported"));
      return;
    }

    callback(null, true);
  },
});

router.post("/", uploadImage);

router.post(
  "/clips",
  authenticate,
  (request, response, next) => {
    clipUpload.single("video")(request, response, (error) => {
      if (error instanceof multer.MulterError) {
        response.status(400).json({
          success: false,
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Video must be 50MB or smaller"
              : error.message,
        });
        return;
      }

      if (error) {
        response.status(400).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Video upload failed",
        });
        return;
      }

      next();
    });
  },
  uploadClip,
);

export default router;