import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export interface AuthUserPayload {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR" | "VOLUNTEER" | "DONOR" | "USER";
  bloodGroup?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || "prayas-default-access-secret-replace-in-prod";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "prayas-default-refresh-secret-replace-in-prod";
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "7d";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

// ---------------------------------------------------------------------------
// Password Hashing
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// JWT Signing & Verification
// ---------------------------------------------------------------------------

export function signAccessToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN as any,
  });
}

export function signRefreshToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN as any,
  });
}

export function verifyAccessToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as AuthUserPayload;
  } catch (error) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Token Extraction (Headers or Cookies)
// ---------------------------------------------------------------------------

export function extractBearerToken(req: Request | NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

export async function getAuthUser(req?: Request | NextRequest): Promise<AuthUserPayload | null> {
  // 1. Check Authorization header
  if (req) {
    const bearer = extractBearerToken(req);
    if (bearer) {
      const decoded = verifyAccessToken(bearer) || verifyRefreshToken(bearer);
      if (decoded) return decoded;
    }
  }

  // 2. Check HTTP-only cookies (Access Token & Refresh Token fallback)
  if (req) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const matchAccess = cookieHeader.match(/prayas_access_token=([^;]+)/);
      if (matchAccess && matchAccess[1]) {
        const decoded = verifyAccessToken(matchAccess[1]);
        if (decoded) return decoded;
      }
      const matchRefresh = cookieHeader.match(/prayas_refresh_token=([^;]+)/);
      if (matchRefresh && matchRefresh[1]) {
        const decoded = verifyRefreshToken(matchRefresh[1]);
        if (decoded) return decoded;
      }
    }
  }

  try {
    const cookieStore = cookies();
    const token = cookieStore.get("prayas_access_token")?.value;
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) return decoded;
    }

    const refreshToken = cookieStore.get("prayas_refresh_token")?.value;
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) return decoded;
    }
  } catch (e) {
    // cookies() might not be available in standard request context
  }

  // 3. In local development environment, fallback to seeded admin account
  if (process.env.NODE_ENV !== "production") {
    try {
      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
      if (admin) {
        return {
          userId: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role as any,
          bloodGroup: admin.bloodGroup,
        };
      }
    } catch (e) {
      // Prisma error or disconnected
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Cookie Utilities
// ---------------------------------------------------------------------------

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

export const REFRESH_COOKIE_OPTIONS = {
  ...AUTH_COOKIE_OPTIONS,
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};
