import * as jwt from "jsonwebtoken";
import type { Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { TokenUserType } from "../modules/auth/schema-type";

// ─── Secrets ───
function getJwtSecret(): string {
  return process.env.TOKEN_SECRET_KEY || "default-secret-change-me";
}

// ─── Expiry ───
function getJwtExpiryDays(): number {
  return Number(process.env.TOKEN_EXPIRY_DAYS) || 7;
}

// ─── Environment ───
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// ─── Expiry ───
export const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_DAYS = getJwtExpiryDays();
const REFRESH_TOKEN_EXPIRY_SECONDS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

// ─── Access Token ───
export async function signToken(payload: TokenUserType): Promise<string> {
  return jwt.sign(
    {
      ...payload,
      type: "access",
    },
    getJwtSecret(),
    { algorithm: "HS256", expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS },
  );
}

export async function verifyToken(
  token: string,
): Promise<{ userId: string } | null> {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    if ((payload as any).type !== "access") return null;
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function generateRefreshToken(payload: {
  userId: string;
}): Promise<string> {
  return jwt.sign(
    {
      ...payload,
      type: "refresh",
    },
    getJwtSecret(),
    { algorithm: "HS256", expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS },
  );
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ userId: string } | null> {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    if ((payload as any).type !== "refresh") return null;
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function createTokenPair(user: {
  id: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await signToken({ id: user.id });
  const refreshToken = await generateRefreshToken({
    userId: user.id,
  });

  return { accessToken, refreshToken };
}

// ─── Cookie Helpers ───
export function setAuthCookies(
  c: Context,
  accessToken: string,
  refreshToken: string,
): void {
  const production = isProduction();

  setCookie(c, "access_token", accessToken, {
    httpOnly: true,
    secure: production,
    sameSite: production ? "None" : "Lax",
    path: "/",
    maxAge: ACCESS_TOKEN_EXPIRY_SECONDS,
  });

  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: production,
    sameSite: production ? "None" : "Lax",
    path: "/",
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
  });
}

export function clearAuthCookies(c: Context): void {
  const prod = isProduction();
  const cookieOptions = {
    httpOnly: true,
    secure: prod,
    sameSite: prod ? ("None" as const) : ("Lax" as const),
    path: "/",
  };

  deleteCookie(c, "access_token", cookieOptions);
  deleteCookie(c, "refresh_token", cookieOptions);
}
