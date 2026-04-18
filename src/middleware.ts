import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// NextAuth v5 uses `authjs.session-token` (not v4's `next-auth.session-token`)
// and `__Secure-` prefix in production (HTTPS). getToken() needs these
// explicitly because the library defaults still point to v4 names.
const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

// Simple in-memory rate limiter for API routes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // NextAuth's own routes (CSRF, callback, providers, session) must NOT
  // be rate-limited or intercepted — let them pass straight through.
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Rate limiting for other API routes
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Lightweight auth check using JWT token (no heavy imports)
  // NextAuth v5 encrypts JWTs (JWE) with a salt derived from the cookie name
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    cookieName: SESSION_COOKIE_NAME,
    salt: SESSION_COOKIE_NAME,
  });
  const isAuth = !!token;
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // Protect dashboard - require auth
  if (isDashboard && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect admin pages - require admin role
  if ((isAdmin || isAdminApi) && (!isAuth || token?.role !== "admin")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/api/:path*"],
};
