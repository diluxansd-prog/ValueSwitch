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

// Paths whose content comes from the database. When Postgres is down these
// render as empty comparison pages, which Google reads as thin or missing
// content and can drop from the index. Answering 503 + Retry-After instead
// tells crawlers the outage is temporary and to come back — the standard
// signal for planned or accidental downtime. The body still points visitors
// at /offers, which needs no database.
const DATA_PATHS = [
  "/mobile",
  "/sim-only",
  "/broadband",
  "/refurbished",
  "/best",
  "/best-deals",
  "/compare",
  "/deals",
  "/providers",
];

// Per-instance cache so the probe adds at most one subrequest a minute.
let dbHealth: { ok: boolean; at: number } = { ok: true, at: 0 };
const HEALTH_TTL_MS = 60_000;

async function databaseIsDown(origin: string): Promise<boolean> {
  const now = Date.now();
  if (now - dbHealth.at < HEALTH_TTL_MS) return !dbHealth.ok;
  try {
    const res = await fetch(`${origin}/api/health/db`, {
      signal: AbortSignal.timeout(2500),
      headers: { "x-health-probe": "1" },
    });
    dbHealth = { ok: res.ok, at: now };
  } catch {
    // Fail open: a flaky probe must never take the site down itself.
    dbHealth = { ok: true, at: now };
  }
  return !dbHealth.ok;
}

function temporarilyUnavailable(): NextResponse {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Prices are updating — ValueSwitch</title>
<style>body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;display:grid;place-items:center;min-height:100vh;background:#f5f4ef;color:#0c2528;padding:24px}main{max-width:32rem;text-align:center}h1{font-size:1.6rem;margin:0 0 .75rem}p{line-height:1.6;color:#44605f}a{display:inline-block;margin:.4rem;padding:.75rem 1.25rem;border-radius:.75rem;background:#0c2528;color:#fff;text-decoration:none;font-weight:600}a.alt{background:transparent;color:#0c2528;border:1px solid #cfd8d6}</style>
</head><body><main>
<h1>Live prices are updating</h1>
<p>Our comparison tables are briefly unavailable while we refresh them. Partner offers and guides are still available.</p>
<p><a href="/offers">Browse partner offers</a><a class="alt" href="/guides">Read our guides</a></p>
</main></body></html>`;
  return new NextResponse(body, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "3600",
      "Cache-Control": "no-store",
    },
  });
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // NextAuth's own routes (CSRF, callback, providers, session) must NOT
  // be rate-limited or intercepted — let them pass straight through.
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // The middleware's own health probe must never be rate-limited.
  if (pathname === "/api/health/db") {
    return NextResponse.next();
  }

  // Database-backed public pages: serve a "come back later" response
  // rather than an empty comparison table while Postgres is unreachable.
  if (
    req.method === "GET" &&
    DATA_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    if (await databaseIsDown(req.nextUrl.origin)) {
      return temporarilyUnavailable();
    }
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
  // The refresh-feed cron fans out to /api/admin/refresh-merchant/* with
  // a Bearer CRON_SECRET header (server-to-server, no session cookie).
  // Let those through — the route re-validates the secret itself.
  const cronSecret = process.env.CRON_SECRET;
  const hasCronAuth = Boolean(
    isAdminApi &&
      cronSecret &&
      req.headers.get("authorization") === `Bearer ${cronSecret}`
  );
  // Setup endpoint bootstraps the first admin; it does its own auth
  // check internally (requires signed-in user, refuses if an admin
  // already exists) so the middleware must let it through.
  const isAdminSetup = pathname === "/api/admin/setup";

  // Protect dashboard - require auth
  if (isDashboard && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect admin pages - require admin role (except the setup endpoint
  // and cron-secret-authenticated fan-out requests)
  if (
    (isAdmin || isAdminApi) &&
    !isAdminSetup &&
    !hasCronAuth &&
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
  //
  // We DROP 'unsafe-eval' since Next.js 16 + Turbopack doesn't need it in
  // production. We KEEP 'unsafe-inline' for scripts/styles because Next
  // emits inline hydration scripts and Tailwind ships inline style props
  // that nonces alone don't cover. (Strict CSP with nonces would require
  // refactoring every dynamic component — disproportionate for the
  // marginal XSS gain on a no-user-input affiliate site.)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.awin1.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://www.awin1.com https://www.dwin1.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://www.awin1.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/api/:path*",
    // Database-backed listings — see DATA_PATHS above.
    "/mobile/:path*",
    "/sim-only/:path*",
    "/broadband/:path*",
    "/refurbished",
    "/best/:path*",
    "/best-deals/:path*",
    "/compare/:path*",
    "/deals/:path*",
    "/providers/:path*",
  ],
};
