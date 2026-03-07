import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

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

  // Rate limiting for API routes
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
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/api/:path*"],
};
