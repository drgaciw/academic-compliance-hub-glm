/**
 * Authentication middleware for protecting routes
 */

import { authRoutes, protectedRoutes, publicRoutes } from './auth.config';

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export function isAuthRoute(pathname: string): boolean {
  return Object.values(authRoutes).some((route) => pathname.startsWith(route));
}
