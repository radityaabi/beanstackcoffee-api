import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    email: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("User");

export const UsersSchema = z.array(UserSchema);

export const GetUserParamSchema = z.object({
  username: z.string().min(1).openapi({ example: "coffeeenthusiast" }),
});
