import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";
import { JWTExpired } from "jose/errors";

// Match the JWT secret configuration used by the token issuer (apps/web/lib/auth.ts)
const JWT_SECRET = process.env.JWT_SECRET || "prayas-default-access-secret-replace-in-prod";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token =
      request.cookies.get("prayas_access_token")?.value ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Cryptographically verify token signature, algorithm (HS256), and expiration
      const { payload } = await jwtVerify(token, SECRET_KEY, {
        algorithms: ["HS256"],
      });

      // Verify the cryptographically verified role is ADMIN
      if (payload.role !== "ADMIN") {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("error", "unauthorized_role");
        return NextResponse.redirect(loginUrl);
      }
    } catch (err: unknown) {
      const loginUrl = new URL("/admin/login", request.url);

      if (
        err instanceof JWTExpired ||
        (err as { code?: string })?.code === "ERR_JWT_EXPIRED"
      ) {
        loginUrl.searchParams.set("error", "session_expired");
        return NextResponse.redirect(loginUrl);
      }

      loginUrl.searchParams.set("error", "invalid_token");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

