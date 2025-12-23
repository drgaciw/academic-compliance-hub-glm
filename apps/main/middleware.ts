import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isComplianceRoute = createRouteMatcher([
  "/compliance(.*)",
  "/transfers(.*)",
  "/institutions(.*)",
  "/rules(.*)",
  "/audit(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isComplianceRoute(req)) {
    const { getToken } = await auth();
    const token = await getToken({ template: "default" });

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.metadata?.role;

        if (role !== "COMPLIANCE_OFFICER" && role !== "ADMIN") {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/(api|trpc)(.*)"],
};
