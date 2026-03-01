import { sign, verify } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import type { Context, Next } from "hono";
import { prisma } from "./prisma";
import { randomUUID } from "crypto";

function getJwtSecret(): string {
  return process.env.JWT_SECRET || "default-secret-change-me";
}

export async function signToken(payload: {
  userId: string;
  email: string;
}): Promise<string> {
  return await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
    },
    getJwtSecret(),
    "HS256",
  );
}

export function generateRefreshToken(): string {
  return randomUUID();
}

export const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export async function verifyToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  try {
    const payload = await verify(token, getJwtSecret(), "HS256");
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

export const authMiddleware = createMiddleware(
  async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized. Bearer token required." }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);

    if (!payload) {
      return c.json({ error: "Invalid or expired token." }, 401);
    }

    // Check if token exists in active sessions (not logged out)
    const activeToken = await prisma.userToken.findUnique({
      where: { accessToken: token },
    });

    if (!activeToken) {
      return c.json({ error: "Token has been revoked." }, 401);
    }

    c.set("userId" as never, payload.userId as never);
    c.set("email" as never, payload.email as never);

    await next();
  },
);
