import { sign, verify } from "hono/jwt";
import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

// ─── Secrets ───
function getJwtSecret(): string {
  return process.env.JWT_SECRET || "default-secret-change-me";
}

// ─── Environment ───
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// ─── Expiry ───
export const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 15; // 15 minutes
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_EXPIRY_SECONDS = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

// ─── Access Token ───
export async function signToken(payload: { userId: string }): Promise<string> {
  return await sign(
    {
      ...payload,
      type: "access",
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY_SECONDS,
    },
    getJwtSecret(),
    "HS256",
  );
}

export async function verifyToken(
  token: string,
): Promise<{ userId: string } | null> {
  try {
    const payload = await verify(token, getJwtSecret(), "HS256");
    if ((payload as any).type !== "access") return null;
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function generateRefreshToken(payload: {
  userId: string;
}): Promise<string> {
  return await sign(
    {
      ...payload,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY_SECONDS,
    },
    getJwtSecret(),
    "HS256",
  );
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ userId: string } | null> {
  try {
    const payload = await verify(token, getJwtSecret(), "HS256");
    if ((payload as any).type !== "refresh") return null;
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function createTokenPair(user: {
  id: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await signToken({ userId: user.id });
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
