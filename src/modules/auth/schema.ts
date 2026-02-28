import { z } from "@hono/zod-openapi";

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(30)
      .openapi({ example: "coffeeenthusiast" }),
    email: z.email().openapi({ example: "user@example.com" }),
    password: z.string().min(8).openapi({ example: "securepassword123" }),
  })
  .openapi("Register");

export const LoginSchema = z
  .object({
    email: z.email().openapi({ example: "user@example.com" }),
    password: z.string().min(1).openapi({ example: "securepassword123" }),
  })
  .openapi("Login");

export const AuthResponseSchema = z
  .object({
    message: z.string(),
    token: z.string(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      email: z.email(),
    }),
  })
  .openapi("AuthResponse");

export const MeResponseSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    email: z.email(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("MeResponse");
