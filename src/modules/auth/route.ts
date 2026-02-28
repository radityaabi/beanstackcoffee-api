import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { hashSync, compareSync } from "bcryptjs";
import { signToken, authMiddleware } from "../../lib/auth";
import {
  RegisterSchema,
  LoginSchema,
  AuthResponseSchema,
  MeResponseSchema,
} from "./schema";

export const authRoute = new OpenAPIHono();

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

  // Check if user already exists
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

  return c.json(
    {
      message: "User registered successfully",
      token,
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

  return c.json(
    {
      message: "Login successful",
      token,
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
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
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
  description: "Client should discard the token after this call.",
  security: [{ Bearer: [] }],
  responses: {
    200: { description: "Logged out successfully" },
    401: { description: "Unauthorized" },
  },
});

authRoute.use("/logout", authMiddleware);

authRoute.openapi(logoutRoute, async (c) => {
  return c.json({ message: "Logged out successfully" }, 200);
});
