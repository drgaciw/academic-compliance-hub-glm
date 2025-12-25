/**
 * Shared Configuration
 */

export const basePath = {
  main: "/",
  student: "/student",
  admin: "/admin",
} as const;

export type BasePath = (typeof basePath)[keyof typeof basePath];

export const appUrls = {
  main: process.env.NEXT_PUBLIC_MAIN_URL || "http://localhost:3000",
  student: process.env.NEXT_PUBLIC_STUDENT_URL || "http://localhost:3001",
  admin: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002",
} as const;

export const cookieConfig = {
  name: "aah-session",
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    domain:
      process.env.NODE_ENV === "production"
        ? process.env.COOKIE_DOMAIN
        : undefined,
  },
} as const;
