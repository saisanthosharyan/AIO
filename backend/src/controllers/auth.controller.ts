import type { Request, Response } from "express";

import {
  findUserById,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import { verifyToken } from "../utils/jwt.js";

export async function register(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await registerUser(
      request.body,
    );

    response.status(201).json({
      success: true,
      message: "Account created successfully",
      ...result,
    });
  } catch (error) {
    response.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Registration failed",
    });
  }
}

export async function login(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const result = await loginUser(
      request.body,
    );

    response.json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    response.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Login failed",
    });
  }
}

export async function me(
  request: Request,
  response: Response,
): Promise<void> {
  try {
    const authorization =
      request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const token = authorization.substring(7);
    const payload = verifyToken(token);
    const user = findUserById(payload.userId);

    if (!user) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const { password: _password, ...safeUser } =
      user;

    response.json({
      success: true,
      user: safeUser,
    });
  } catch {
    response.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
