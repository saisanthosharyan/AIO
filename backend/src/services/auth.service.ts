import bcrypt from "bcryptjs";

import { UserModel } from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(
  input: RegisterInput,
) {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const displayName = input.displayName.trim();

  if (!username || !email || !password || !displayName) {
    throw new Error("All fields are required");
  }

  const existingEmail = await UserModel.findOne({
    email,
  });

  if (existingEmail) {
    throw new Error("Email already registered");
  }

  const existingUsername = await UserModel.findOne({
    username,
  });

  if (existingUsername) {
    throw new Error("Username already taken");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10,
  );

  const user = await UserModel.create({
    username,
    email,
    password: hashedPassword,
    displayName,
    verified: false,
    followersCount: 0,
    followingCount: 0,
  });

  return {
    user: sanitizeUser(user),
    token: generateToken(user._id.toString()),
  };
}

export async function loginUser(
  input: LoginInput,
) {
  const email = input.email.trim().toLowerCase();

  const user = await UserModel.findOne({
    email,
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const validPassword = await bcrypt.compare(
    input.password,
    user.password,
  );

  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  return {
    user: sanitizeUser(user),
    token: generateToken(user._id.toString()),
  };
}

export async function findUserById(
  userId: string,
) {
  return UserModel.findById(userId);
}

function sanitizeUser(user: {
  _id: unknown;
  toObject: () => Record<string, unknown>;
}) {
  const userObject = user.toObject();

  delete userObject.password;

  return {
    ...userObject,
    id: String(user._id),
  };
}