import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth.config";
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

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return {
    userId: session.user.id || "",
    role: (session.user as any).role || Role.STUDENT,
    email: session.user.email || undefined,
  };
}

export async function requireAuth(): Promise<AuthContext> {
  const authContext = await getAuthContext();

  if (!authContext) {
    throw new AuthorizationError("Authentication required");
  }

  return authContext;
}

export function requireRoles(requiredRoles: Role[]) {
  return async (): Promise<AuthContext> => {
    const authContext = await requireAuth();

    if (!requiredRoles.includes(authContext.role)) {
      throw new AuthorizationError(
        `Requires ${requiredRoles.join(" or ")} role`,
      );
    }

    return authContext;
  };
}

export function requirePermission(permission: Permission) {
  return async (): Promise<AuthContext> => {
    const authContext = await requireAuth();

    if (!hasPermission(authContext.role, permission)) {
      throw new AuthorizationError(`Requires ${permission} permission`);
    }

    return authContext;
  };
}

export function requireAnyPermission(permissions: Permission[]) {
  return async (): Promise<AuthContext> => {
    const authContext = await requireAuth();

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
  return async (): Promise<AuthContext> => {
    const authContext = await requireAuth();

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
      const context = await requireAuth();
      return await handler(request, context);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      throw error;
    }
  };
}

export function withRoles(
  requiredRoles: Role[],
  handler: (
    request: NextRequest,
    context: AuthContext,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const context = await requireRoles(requiredRoles)();
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
      const context = await requirePermission(permission)();
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
      const context = await requireAuth();
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
