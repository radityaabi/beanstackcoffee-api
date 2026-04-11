import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { hashPassword, verifyPassword } from "../../lib/hash";
import { getCookie } from "hono/cookie";
import {
  createTokenPair,
  verifyRefreshToken,
  REFRESH_TOKEN_EXPIRY_DAYS,
  setAuthCookies,
  clearAuthCookies,
} from "../../lib/token";
import { authMiddleware, type AuthMiddlewareEnv } from "./middleware";
import {
  RegisterUserSchema,
  LoginUserSchema,
  AuthResponseSchema,
  RefreshResponseSchema,
  MeResponseSchema,
} from "./schema-type";

export const authRoute = new OpenAPIHono<AuthMiddlewareEnv>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Validation failed",
          details: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        422,
      );
    }
  },
});

const tags = ["Auth"];

// ─── Helper ───
function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

// ─── POST /auth/register ───
const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags,
  summary: "Register a new user",
  request: {
    body: {
      content: { "application/json": { schema: RegisterUserSchema } },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
    409: { description: "Username or email already exists" },
  },
});

authRoute.openapi(registerRoute, async (c) => {
  const validatedBody = c.req.valid("json");

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: validatedBody.email },
        { username: validatedBody.username },
      ],
    },
  });

  if (existingUser) {
    return c.json({ error: "Username or email already exists" }, 409);
  }

  const hashedPassword = await hashPassword(validatedBody.password);

  const user = await prisma.user.create({
    data: {
      name: validatedBody.name,
      username: validatedBody.username,
      email: validatedBody.email,
      password: { create: { hash: hashedPassword } },
    },
  });

  return c.json(
    {
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    },
    201,
  );
});

// ─── POST /auth/login ───
const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags,
  summary: "Login user",
  request: {
    body: {
      content: { "application/json": { schema: LoginUserSchema } },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: { "application/json": { schema: AuthResponseSchema } },
    },
    401: { description: "Invalid email or password" },
  },
});

authRoute.openapi(loginRoute, async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await prisma.user.findUnique({
    where: { email },
    include: { password: true },
  });
  if (!user || !user.password) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const validPassword = await verifyPassword(user.password.hash, password);
  if (!validPassword) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const { accessToken, refreshToken } = await createTokenPair(user);

  await prisma.userToken.deleteMany({ where: { userId: user.id } });

  await prisma.userToken.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  setAuthCookies(c, accessToken, refreshToken);

  return c.json(
    {
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    },
    200,
  );
});

// ─── GET /auth/me ── Protected ───
const meRoute = createRoute({
  method: "get",
  path: "/me",
  tags,
  summary: "Get current authenticated user",
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "Current user details",
      content: { "application/json": { schema: MeResponseSchema } },
    },
    401: { description: "Unauthorized" },
  },
});

authRoute.use("/me", authMiddleware);

authRoute.openapi(meRoute, async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "User not found." }, 404);
  }

  return c.json(
    {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    200,
  );
});

// ─── POST /auth/logout ── Protected ───
const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  tags,
  summary: "Logout user",
  description: "Revokes the current refresh token and clears auth cookies.",
  security: [{ Bearer: [] }],
  responses: {
    200: { description: "Logged out successfully" },
    401: { description: "Unauthorized" },
  },
});

authRoute.use("/logout", authMiddleware);

authRoute.openapi(logoutRoute, async (c) => {
  const refreshToken = getCookie(c, "refresh_token");

  if (refreshToken) {
    await prisma.userToken.deleteMany({
      where: { refreshToken },
    });
  }

  clearAuthCookies(c);

  return c.json({ message: "Logged out successfully" }, 200);
});

// ─── POST /auth/refresh ───
const refreshRoute = createRoute({
  method: "post",
  path: "/refresh",
  tags,
  summary: "Refresh access token",
  description:
    "Exchange a valid refresh token (from cookie) for a new token pair.",
  responses: {
    200: {
      description: "Token refreshed successfully",
      content: { "application/json": { schema: RefreshResponseSchema } },
    },
    401: { description: "Invalid or expired refresh token" },
  },
});

authRoute.openapi(refreshRoute, async (c) => {
  const refreshToken = getCookie(c, "refresh_token");

  if (!refreshToken) {
    return c.json({ error: "No refresh token provided." }, 401);
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    clearAuthCookies(c);
    return c.json({ error: "Invalid or expired refresh token." }, 401);
  }

  const userToken = await prisma.userToken.findFirst({
    where: { userId: payload.userId, refreshToken },
    include: { user: true },
  });

  if (!userToken) {
    await prisma.userToken.deleteMany({ where: { userId: payload.userId } });
    clearAuthCookies(c);
    return c.json(
      {
        error: "Refresh token reuse detected. All sessions have been revoked.",
      },
      401,
    );
  }

  const { accessToken, refreshToken: newRefreshToken } = await createTokenPair(
    userToken.user,
  );

  await prisma.userToken.update({
    where: { id: userToken.id },
    data: {
      refreshToken: newRefreshToken,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  setAuthCookies(c, accessToken, newRefreshToken);

  return c.json(
    {
      message: "Token refreshed successfully",
    },
    200,
  );
});
