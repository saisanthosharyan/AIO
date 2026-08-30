import type {
  Request,
  Response,
} from "express";

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const uploadsDirectory =
  path.resolve(
    process.cwd(),
    "uploads",
    "posts",
  );

export async function uploadImage(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const body = request.body ?? {};

    const imageData =
      typeof body.image === "string"
        ? body.image
        : "";

    if (!imageData) {
      response.status(400).json({
        success: false,
        message: "Image is required",
      });
      return;
    }

    const match =
      imageData.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/,
      );

    if (!match) {
      response.status(400).json({
        success: false,
        message:
          "Invalid image data",
      });
      return;
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const extensionMap: Record<
      string,
      string
    > = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
    };

    const extension =
      extensionMap[mimeType];

    if (!extension) {
      response.status(400).json({
        success: false,
        message:
          "Unsupported image type",
      });
      return;
    }

    const buffer =
      Buffer.from(
        base64Data,
        "base64",
      );

    if (
      buffer.length >
      5 * 1024 * 1024
    ) {
      response.status(400).json({
        success: false,
        message:
          "Image must be smaller than 5MB",
      });
      return;
    }

    fs.mkdirSync(
      uploadsDirectory,
      {
        recursive: true,
      },
    );

    const filename =
      `${crypto.randomUUID()}${extension}`;

    const filePath =
      path.join(
        uploadsDirectory,
        filename,
      );

    fs.writeFileSync(
      filePath,
      buffer,
    );

    const imageUrl =
      `/uploads/posts/${filename}`;

    response.status(201).json({
      success: true,
      message:
        "Image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error(
      "Upload image error:",
      error,
    );

    response.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to upload image",
    });
  }
}