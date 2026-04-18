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

  // Vercel Cron jobs authenticate via Bearer <CRON_SECRET> in the
  // endpoint itself; must bypass rate-limiter + session checks.
  if (pathname.startsWith("/api/cron/")) {
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
  // Setup endpoint bootstraps the first admin; it does its own auth
  // check internally (requires signed-in user, refuses if an admin
  // already exists) so the middleware must let it through.
  const isAdminSetup = pathname === "/api/admin/setup";

  // Protect dashboard - require auth
  if (isDashboard && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect admin pages - require admin role (except the setup endpoint)
  if (
    (isAdmin || isAdminApi) &&
    !isAdminSetup &&
    (!isAuth || token?.role !== "admin")
  ) {
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
  // CSP — explicitly allow Awin, Vercel Analytics, and common fonts/images.
  // Awin uses www.awin1.com for tracking + clicks.awin.com for pixels.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.awin1.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: https://media.bigupdata.co.uk",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: https://www.awin1.com https://www.dwin1.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://www.awin1.com",
    "frame-ancestors 'none'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register", "/api/:path*"],
};
