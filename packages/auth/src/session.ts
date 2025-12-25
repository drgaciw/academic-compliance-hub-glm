import { auth } from "./auth.config";
import { Role } from "./permissions";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
  accessToken?: string;
}

export async function getSession(): Promise<AuthSession | null> {
  const session = await auth();

  if (!session || !session.user) {
    return null;
  }

  return {
    user: {
      id: session.user.id || "",
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: (session.user as any).role || Role.STUDENT,
    },
    expires: session.expires,
    accessToken: (session.user as any).accessToken,
  };
}

export async function getUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user || null;
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized: No active session");
  }

  return session;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  return user;
}

export async function hasRole(role: Role): Promise<boolean> {
  const user = await getUser();
  return user?.role === role;
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();

  if (user.role !== role) {
    throw new Error(`Forbidden: Required role ${role}`);
  }

  return user;
}

export async function hasAnyRole(roles: Role[]): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  return roles.includes(user.role);
}

export async function requireAnyRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: Required one of roles ${roles.join(", ")}`);
  }

  return user;
}

export function isSessionValid(session: AuthSession | null): boolean {
  if (!session) return false;

  const expires = new Date(session.expires);
  const now = new Date();

  return now < expires;
}

export async function invalidateSession(): Promise<void> {}
