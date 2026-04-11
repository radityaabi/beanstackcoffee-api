import { z } from "@hono/zod-openapi";
import { UserModelSchema } from "../../generated/zod/schemas";

export const UserSchema = UserModelSchema.omit({
  password: true,
  cart: true,
  tokens: true,
}).openapi("User");

export const UsersSchema = z.array(UserSchema.omit({ email: true }));

export const GetUserParamSchema = z.object({
  username: z.string().min(1).openapi({ example: "coffeeenthusiast" }),
});

export type UserSchema = z.infer<typeof UserSchema>;
export type UsersSchema = z.infer<typeof UsersSchema>;
export type GetUserParamSchema = z.infer<typeof GetUserParamSchema>;
