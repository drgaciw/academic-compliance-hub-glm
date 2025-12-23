import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Role, Permission, canAccessRoute, hasPermission } from "./permissions";

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export interface AuthContext {
  userId: string;
  role: Role;
  email?: string;
}

export async function getAuthContext(
  request: NextRequest,
): Promise<AuthContext | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const { getToken } = auth();
  const tokenPromise = getToken?.({ template: "default" });
  const token = tokenPromise ? await tokenPromise : null;

  let role = Role.STUDENT;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = (payload.metadata?.role as Role) || Role.STUDENT;
    } catch (e) {
      console.error("Error parsing token:", e);
    }
  }

  return {
    userId,
    role,
  };
}

export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const authContext = await getAuthContext(request);

  if (!authContext) {
    throw new AuthorizationError("Authentication required");
  }

  return authContext;
}

export function requireRole(requiredRoles: Role[]) {
  return async (request: NextRequest): Promise<AuthContext> => {
    const authContext = await requireAuth(request);

    if (!requiredRoles.includes(authContext.role)) {
      throw new AuthorizationError(
        `Requires ${requiredRoles.join(" or ")} role`,
      );
    }

    return authContext;
  };
}

export function requirePermission(permission: Permission) {
  return async (request: NextRequest): Promise<AuthContext> => {
    const authContext = await requireAuth(request);

    if (!hasPermission(authContext.role, permission)) {
      throw new AuthorizationError(`Requires ${permission} permission`);
    }

    return authContext;
  };
}

export function requireAnyPermission(permissions: Permission[]) {
  return async (request: NextRequest): Promise<AuthContext> => {
    const authContext = await requireAuth(request);

    const hasAny = permissions.some((p) => hasPermission(authContext.role, p));

    if (!hasAny) {
      throw new AuthorizationError(
        `Requires one of: ${permissions.join(", ")}`,
      );
    }

    return authContext;
  };
}

export function requireAllPermissions(permissions: Permission[]) {
  return async (request: NextRequest): Promise<AuthContext> => {
    const authContext = await requireAuth(request);

    const hasAll = permissions.every((p) => hasPermission(authContext.role, p));

    if (!hasAll) {
      throw new AuthorizationError(
        `Requires all permissions: ${permissions.join(", ")}`,
      );
    }

    return authContext;
  };
}

export function withAuth(
  handler: (
    request: NextRequest,
    context: AuthContext,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const context = await requireAuth(request);
      return await handler(request, context);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      throw error;
    }
  };
}

export function withRole(
  requiredRoles: Role[],
  handler: (
    request: NextRequest,
    context: AuthContext,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const context = await requireRole(requiredRoles)(request);
      return await handler(request, context);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      throw error;
    }
  };
}

export function withPermission(
  permission: Permission,
  handler: (
    request: NextRequest,
    context: AuthContext,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const context = await requirePermission(permission)(request);
      return await handler(request, context);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      throw error;
    }
  };
}

export function withRouteAccess(
  handler: (
    request: NextRequest,
    context: AuthContext,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const context = await requireAuth(request);
      const pathname = request.nextUrl.pathname;

      if (!canAccessRoute(context.role, pathname)) {
        throw new AuthorizationError(
          `Access denied to ${pathname} for ${context.role}`,
        );
      }

      return await handler(request, context);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      throw error;
    }
  };
}

export async function createUnauthorizedResponse(
  request: NextRequest,
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("redirect_url", pathname);

  return NextResponse.redirect(signInUrl);
}
