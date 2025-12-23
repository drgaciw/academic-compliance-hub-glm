/**
 * Clerk authentication configuration
 */

export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  secretKey: process.env.CLERK_SECRET_KEY || '',
};

export const authRoutes = {
  signIn: '/sign-in',
  signUp: '/sign-up',
  afterSignIn: '/dashboard',
  afterSignUp: '/onboarding',
};

export const protectedRoutes = [
  '/dashboard',
  '/student',
  '/admin',
  '/api',
];

export const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/about',
];
