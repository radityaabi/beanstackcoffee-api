import { z } from "@hono/zod-openapi";
import { UserSchema } from "../user/schema-type";

export const PasswordSchema = z
  .string()
  .min(8)
  .max(255, "Password must not exceed 255 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .openapi({ example: "Securepassword123" });

export const RegisterUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: PasswordSchema,
});

export const LoginUserSchema = z
  .object({
    email: z.email().openapi({ example: "user@example.com" }),
    password: z.string().min(1).openapi({ example: "Securepassword123" }),
  })
  .openapi("Login");

export const AuthResponseSchema = z
  .object({
    message: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      username: z.string(),
      email: z.email(),
    }),
  })
  .openapi("AuthResponse");

export const RefreshResponseSchema = z
  .object({
    message: z.string(),
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
