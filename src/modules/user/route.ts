import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { UserSchema, UsersSchema, GetUserParamSchema } from "./schema";

export const userRoute = new OpenAPIHono();

const tags = ["Users"];

// ─── GET /users ── List all users ───
const getUsersRoute = createRoute({
  method: "get",
  path: "/",
  tags,
  summary: "Get all users",
  responses: {
    200: {
      description: "List of users",
      content: { "application/json": { schema: UsersSchema } },
    },
  },
});

userRoute.openapi(getUsersRoute, async (c) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json(
    users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    })),
    200,
  );
});

// ─── GET /users/:username ── Get user by username ───
const getUserByUsernameRoute = createRoute({
  method: "get",
  path: "/{username}",
  tags,
  summary: "Get user by username",
  request: {
    params: GetUserParamSchema,
  },
  responses: {
    200: {
      description: "User details",
      content: { "application/json": { schema: UserSchema } },
    },
    404: { description: "User not found" },
  },
});

userRoute.openapi(getUserByUsernameRoute, async (c) => {
  const { username } = c.req.valid("param");

  const user = await prisma.user.findUnique({
    where: { username },
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
