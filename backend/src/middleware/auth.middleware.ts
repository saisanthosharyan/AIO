import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticate(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
): void {
  try {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const token = authorization.substring(7);
    const payload = verifyToken(token);

    request.userId = payload.userId;

    next();
  } catch {
    response.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}