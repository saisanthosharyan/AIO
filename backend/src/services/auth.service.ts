import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import type { User } from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

const users: User[] = [];

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
  const existingUser = users.find(
    (user) =>
      user.email.toLowerCase() ===
      input.email.toLowerCase(),
  );

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const password = await bcrypt.hash(
    input.password,
    10,
  );

  const user: User = {
    id: randomUUID(),
    username: input.username,
    email: input.email,
    password,
    displayName: input.displayName,
    verified: false,
    followersCount: 0,
    followingCount: 0,
    createdAt: new Date().toISOString(),
  };

  users.push(user);

  return {
    user: sanitizeUser(user),
    token: generateToken(user.id),
  };
}

export async function loginUser(
  input: LoginInput,
) {
  const user = users.find(
    (item) =>
      item.email.toLowerCase() ===
      input.email.toLowerCase(),
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const validPassword =
    await bcrypt.compare(
      input.password,
      user.password,
    );

  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  return {
    user: sanitizeUser(user),
    token: generateToken(user.id),
  };
}

export function findUserById(
  userId: string,
) {
  return users.find(
    (user) => user.id === userId,
  );
}

function sanitizeUser(user: User) {
  const { password: _password, ...safeUser } =
    user;

  return safeUser;
}
