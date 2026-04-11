import { z } from "@hono/zod-openapi";
import { UserModelSchema } from "../../generated/zod/schemas";

export const UserSchema = UserModelSchema.omit({
  password: true,
  cart: true,
  tokens: true,
}).openapi("User");

export const UsersSchema = UserSchema.array();

export const SeedUserSchema = UserModelSchema.omit({
  id: true,
  cart: true,
  tokens: true,
  updatedAt: true,
  createdAt: true,
});

export const SeedUsersSchema = SeedUserSchema.array();

export const PublicUserSchema = UserSchema.omit({
  email: true,
});

export const PublicUsersSchema = PublicUserSchema.array();

export const GetUserParamSchema = z.object({
  username: z.string().min(1).openapi({ example: "coffeeenthusiast" }),
});

export type UserSchema = z.infer<typeof UserSchema>;
export type UsersSchema = z.infer<typeof UsersSchema>;
export type SeedUserSchema = z.infer<typeof SeedUserSchema>;
export type SeedUsersSchema = z.infer<typeof SeedUsersSchema>;
export type PublicUserSchema = z.infer<typeof PublicUserSchema>;
export type PublicUsersSchema = z.infer<typeof PublicUsersSchema>;
export type GetUserParamSchema = z.infer<typeof GetUserParamSchema>;
