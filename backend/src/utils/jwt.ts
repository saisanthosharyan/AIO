import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ?? "aio-development-secret";

export interface JwtPayload {
  userId: string;
}

export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyToken(
  token: string,
): JwtPayload {
  return jwt.verify(
    token,
    JWT_SECRET,
  ) as JwtPayload;
}
