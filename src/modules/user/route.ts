import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import {
  PublicUserSchema,
  PublicUsersSchema,
  GetUserParamSchema,
} from "./schema-type";

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
      content: { "application/json": { schema: PublicUsersSchema } },
    },
  },
});

userRoute.openapi(getUsersRoute, async (c) => {
  const users = await prisma.user.findMany({
    omit: { email: true },
    orderBy: { createdAt: "desc" },
  });

  return c.json(
    users.map((user) => ({
      ...user,
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
      content: { "application/json": { schema: PublicUserSchema } },
    },
    404: { description: "User not found" },
  },
});

userRoute.openapi(getUserByUsernameRoute, async (c) => {
  const { username } = c.req.valid("param");

  const user = await prisma.user.findUnique({
    where: { username },
    omit: { email: true },
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
