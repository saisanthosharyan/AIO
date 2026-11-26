import type {
  Request,
  Response,
} from "express";

export async function uploadClip(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    if (!request.file) {
      response.status(400).json({
        success: false,
        message: "Video file is required",
      });
      return;
    }

    const clipUrl =
      `/uploads/clips/${request.file.filename}`;

    response.status(201).json({
      success: true,
      message: "Clip uploaded successfully",
      clipUrl,
      size: request.file.size,
      mimeType: request.file.mimetype,
    });
  } catch (error) {
    console.error("Upload clip error:", error);

    response.status(500).json({
      success: false,
      message: "Failed to upload clip",
    });
  }
}