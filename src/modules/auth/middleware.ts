import { createFactory } from "hono/factory";
import { getCookie } from "hono/cookie";
import { verifyToken } from "../../lib/token";
import { prisma } from "../../lib/prisma";
import z from "zod";
import { UserSchema } from "../user/schema-type";

export const AuthMiddlewareEnvSchema = z.object({
  Variables: z.object({
    user: UserSchema,
  }),
});

export type AuthMiddlewareEnv = z.infer<typeof AuthMiddlewareEnvSchema>;

const factory = createFactory<AuthMiddlewareEnv>();

export const checkAuthMiddleware = factory.createMiddleware(async (c, next) => {
  try {
    const token = getCookie(c, "access_token");

    if (!token) {
      return c.json({ error: "Unauthorized. No access token." }, 401);
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return c.json({ error: "Invalid or expired token." }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return c.json(
        { error: "Invalid or expired token. User not found." },
        401,
      );
    }

    c.set("user", user);

    await next();
  } catch (error) {
    console.error(error);
    return c.json(
      {
        message: "Failed to check authorized user",
        error,
      },
      401,
    );
  }
});
