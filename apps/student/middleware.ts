import {
  authMiddleware as clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/dist/types/index";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/docs(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/api/health(.*)",
]);

const isStudentRoute = createRouteMatcher([
  "/student(.*)",
  "/profile(.*)",
  "/transcripts(.*)",
  "/academics(.*)",
  "/eligibility(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isStudentRoute(req)) {
    const { getToken } = await auth();
    const token = await getToken({ template: "default" });

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.metadata?.role;

        if (role !== "STUDENT" && role !== "ADVISOR") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }

  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  const isDev = process.env.NODE_ENV === "development";
  const nonce = crypto.randomUUID();

  const cspReportUri =
    process.env.NODE_ENV === "production"
      ? `report-uri ${process.env.NEXT_PUBLIC_CSP_REPORT_URI || "/student/api/csp-report"}`
      : "";

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`} https://js.clerk.accounts.dev https://cdn.jsdelivr.net`,
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`} https://fonts.googleapis.com https://cdn.jsdelivr.net`,
    "img-src 'self' data: blob: https://images.clerk.accounts.dev https://*.vercel-storage.com",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "connect-src 'self' https://*.clerk.accounts.dev https://*.vercel.app",
    "media-src 'self' blob: data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    cspReportUri,
  ].filter(Boolean);

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));
  response.headers.set("x-nonce", nonce);

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/(api|trpc)(.*)"],
};
