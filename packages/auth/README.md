# @aah/auth

Authentication and authorization package using NextAuth.js v5.

## Features

- **NextAuth.js v5**: Modern authentication with support for multiple providers
- **OAuth Providers**: Google and Microsoft OAuth integration
- **Role-Based Access Control (RBAC)**: Student, Advisor, Compliance Officer, and Admin roles
- **Permission System**: Granular permissions for different actions
- **Session Management**: Secure session handling with JWT
- **Token Refresh**: Automatic OAuth token refresh with rotation
- **Middleware Protection**: Route protection with customizable rules

## Installation

```bash
pnpm install @aah/auth
```

## Environment Variables

Add these to your `.env` file:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-in-production
```

## Quick Start

### 1. Create API Route Handler

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@aah/auth";

export const { GET, POST } = handlers;
```

### 2. Add Middleware

Create `middleware.ts` in your app root:

```typescript
import { middleware } from "@aah/auth";

export { middleware as default };
```

### 3. Use Session in Components

```typescript
import { getSession, getUser } from "@aah/auth";

export default async function Dashboard() {
  const session = await getSession();
  const user = await getUser();

  if (!session) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {user?.name}</div>;
}
```

## Roles and Permissions

### Available Roles

- `STUDENT`: Student user with basic access
- `ADVISOR`: Academic advisor with student management capabilities
- `COMPLIANCE_OFFICER`: Compliance officer with full compliance access
- `ADMIN`: Administrator with full system access

### Example: Checking Permissions

```typescript
import { hasPermission, Permission, Role } from "@aah/auth";

// Check if user has a specific permission
const canView = hasPermission(Role.STUDENT, Permission.STUDENT_VIEW_PROFILE);

// Check if user has any of multiple permissions
const hasAny = hasAnyPermission(Role.ADVISOR, [
  Permission.ADVISOR_VIEW_STUDENTS,
  Permission.ADVISOR_UPDATE_COMPLIANCE,
]);

// Check if user has all required permissions
const hasAll = hasAllPermissions(Role.ADMIN, [
  Permission.ADMIN_MANAGE_USERS,
  Permission.ADMIN_MANAGE_ROLES,
]);
```

## API Routes Protection

### Using Middleware Wrappers

```typescript
import { withAuth, withRoles, withPermission } from "@aah/auth";
import { Role, Permission } from "@aah/auth";

// Require authentication
export const GET = withAuth(async (req, context) => {
  return NextResponse.json({ user: context });
});

// Require specific role
export const POST = withRoles([Role.ADMIN], async (req, context) => {
  return NextResponse.json({ message: "Admin only" });
});

// Require specific permission
export const DELETE = withPermission(
  Permission.ADMIN_MANAGE_USERS,
  async (req, context) => {
    return NextResponse.json({ message: "Authorized" });
  },
);
```

### Manual Authorization Check

```typescript
import { requireAuth, requireRole, requirePermission } from "@aah/auth";
import { Role, Permission } from "@aah/auth";

export async function GET() {
  const authContext = await requireAuth();
  // or
  const adminUser = await requireRole(Role.ADMIN);
  // or
  const authorized = await requirePermission(Permission.ADMIN_VIEW_ALL_DATA);

  return NextResponse.json({ data: "Authorized content" });
}
```

## Session Management

### Get Current Session

```typescript
import { getSession } from "@aah/auth";

const session = await getSession();
if (session) {
  console.log(session.user.id);
  console.log(session.expires);
  console.log(session.accessToken);
}
```

### Get Current User

```typescript
import { getUser } from "@aah/auth";

const user = await getUser();
if (user) {
  console.log(user.id);
  console.log(user.name);
  console.log(user.email);
  console.log(user.role);
}
```

### Require Session (Throws if not authenticated)

```typescript
import { requireSession } from "@aah/auth";

const session = await requireSession();
```

### Check User Role

```typescript
import { hasRole, requireRole } from "@aah/auth";

const isAdmin = await hasRole(Role.ADMIN);
if (isAdmin) {
  // Admin-specific logic
}

const adminUser = await requireRole(Role.ADMIN);
```

## Token Refresh

The package automatically handles OAuth token refresh for Google and Microsoft providers. The refresh mechanism:

- Checks token expiration before each request
- Automatically refreshes tokens when they're within 5 minutes of expiration
- Rotates refresh tokens for enhanced security
- Handles refresh failures gracefully

### Manual Token Refresh

```typescript
import { autoRefreshToken, ExtendedJWT } from "@aah/auth";

const refreshedToken = await autoRefreshToken(token, "google");
```

## Protected Routes

Configure protected and public routes in `auth.config.ts`:

```typescript
export const protectedRoutes = [
  "/dashboard",
  "/student",
  "/advisor",
  "/compliance",
  "/admin",
  "/api/protected",
];

export const publicRoutes = ["/", "/sign-in", "/sign-out", "/about"];
```

## Sign In/Out

```typescript
import { signIn, signOut } from "@aah/auth";

// Sign in with Google
await signIn("google");

// Sign in with Microsoft
await signIn("microsoft");

// Sign in with credentials
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
});

// Sign out
await signOut();
```

## Custom Pages

Customize authentication pages by setting the `pages` option in `authConfig`:

```typescript
export const authRoutes = {
  signIn: "/sign-in",
  signOut: "/sign-out",
  afterSignIn: "/dashboard",
  afterSignUp: "/onboarding",
};

// pages configuration in authConfig
pages: {
  signIn: "/sign-in",
  signOut: "/sign-out",
  error: "/auth/error",
  verifyRequest: "/auth/verify-request",
  newUser: "/auth/new-user",
},
```

## Testing

```bash
pnpm test
```

## License

MIT
