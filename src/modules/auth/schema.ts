import { z } from "@hono/zod-openapi";

export const PasswordSchema = z
  .string()
  .min(8)
  .max(255, "Password must not exceed 255 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .openapi({ example: "Securepassword123" });

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(30)
      .openapi({ example: "coffeeenthusiast" }),
    email: z.email().openapi({ example: "user@example.com" }),
    password: PasswordSchema,
  })
  .openapi("Register");

export const LoginSchema = z
  .object({
    email: z.email().openapi({ example: "user@example.com" }),
    password: z.string().min(1).openapi({ example: "Securepassword123" }),
  })
  .openapi("Login");

export const AuthResponseSchema = z
  .object({
    message: z.string(),
    token: z.string(),
    refreshToken: z.string(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      email: z.email(),
    }),
  })
  .openapi("AuthResponse");

export const RefreshSchema = z
  .object({
    refreshToken: z.string().min(1).openapi({ example: "your-refresh-token" }),
  })
  .openapi("Refresh");

export const RefreshResponseSchema = z
  .object({
    message: z.string(),
    token: z.string(),
  })
  .openapi("RefreshResponse");

export const MeResponseSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    email: z.email(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("MeResponse");
