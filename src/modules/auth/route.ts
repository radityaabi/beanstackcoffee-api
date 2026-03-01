import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { hashSync, compareSync } from "bcryptjs";
import {
  signToken,
  generateRefreshToken,
  REFRESH_TOKEN_EXPIRY_DAYS,
  authMiddleware,
} from "../../lib/auth";
import {
  RegisterSchema,
  LoginSchema,
  AuthResponseSchema,
  RefreshSchema,
  RefreshResponseSchema,
  MeResponseSchema,
} from "./schema";

export const authRoute = new OpenAPIHono({
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

// ─── POST /auth/register ───
const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags,
  summary: "Register a new user",
  request: {
    body: {
      content: { "application/json": { schema: RegisterSchema } },
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
  const { username, email, password } = c.req.valid("json");

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    return c.json({ error: "Username or email already exists" }, 409);
  }

  const hashedPassword = hashSync(password, 10);

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });

  const token = await signToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken();

  await prisma.userToken.create({
    data: {
      userId: user.id,
      accessToken: token,
      refreshToken,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      ),
    },
  });

  return c.json(
    {
      message: "User registered successfully",
      token,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email },
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
      content: { "application/json": { schema: LoginSchema } },
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const validPassword = compareSync(password, user.password);
  if (!validPassword) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const token = await signToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken();

  await prisma.userToken.create({
    data: {
      userId: user.id,
      accessToken: token,
      refreshToken,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      ),
    },
  });

  return c.json(
    {
      message: "Login successful",
      token,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email },
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
  const userId = c.get("userId" as never) as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(
    {
      ...user,
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
  description:
    "Revokes the current access token and its associated refresh token.",
  security: [{ Bearer: [] }],
  responses: {
    200: { description: "Logged out successfully" },
    401: { description: "Unauthorized" },
  },
});

authRoute.use("/logout", authMiddleware);

authRoute.openapi(logoutRoute, async (c) => {
  const authHeader = c.req.header("Authorization")!;
  const token = authHeader.replace("Bearer ", "");

  await prisma.userToken.delete({
    where: { accessToken: token },
  });

  return c.json({ message: "Logged out successfully" }, 200);
});

// ─── POST /auth/refresh ───
const refreshRoute = createRoute({
  method: "post",
  path: "/refresh",
  tags,
  summary: "Refresh access token",
  description: "Exchange a valid refresh token for a new access token.",
  request: {
    body: {
      content: { "application/json": { schema: RefreshSchema } },
    },
  },
  responses: {
    200: {
      description: "Token refreshed successfully",
      content: { "application/json": { schema: RefreshResponseSchema } },
    },
    401: { description: "Invalid or expired refresh token" },
  },
});

authRoute.openapi(refreshRoute, async (c) => {
  const { refreshToken } = c.req.valid("json");

  const userToken = await prisma.userToken.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!userToken) {
    return c.json({ error: "Invalid refresh token." }, 401);
  }

  if (userToken.expiresAt < new Date()) {
    await prisma.userToken.delete({ where: { id: userToken.id } });
    return c.json(
      { error: "Refresh token has expired. Please login again." },
      401,
    );
  }

  const newAccessToken = await signToken({
    userId: userToken.user.id,
    email: userToken.user.email,
  });

  await prisma.userToken.update({
    where: { id: userToken.id },
    data: { accessToken: newAccessToken },
  });

  return c.json(
    {
      message: "Token refreshed successfully",
      token: newAccessToken,
    },
    200,
  );
});
