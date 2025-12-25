# ADR-004: tRPC for Type-Safe APIs

**Status**: Accepted
**Date**: 2025-01-22
**Decision Makers**: Tech Lead, Senior Architect, Backend Lead
**Technical Story**: https://github.com/your-org/athletic-academics-hub/issues/89

---

## Context

We need to choose an API solution that provides:

- End-to-end type safety from backend to frontend
- Excellent developer experience
- No need to manually write API clients
- Real-time capabilities (websockets)
- Good performance
- Works with Next.js API routes

Current constraints:

- Using TypeScript throughout stack
- Need for type-safe database interactions
- Team has React experience
- Simple deployment (serverless)

## Decision

We selected **tRPC** as our primary API framework.

Key features:

- End-to-end type safety without schemas/codegen
- Automatic client generation from backend
- Works with Next.js API routes
- Support for serverless functions
- Subscription support for real-time
- Excellent TypeScript support
- No API documentation needed (types are documentation)

## Consequences

### Positive

- **Type Safety**: End-to-end types from database to UI
- **Developer Experience**: Excellent autocomplete, no boilerplate
- **Productivity**: No need to write API client code
- **Refactoring**: Easy to change API, types update everywhere
- **No Codegen**: Types inferred from implementation
- **Performance**: Minimal overhead, efficient serialization
- **Real-time**: Built-in subscription support
- **Validation**: Zod integration for request/response validation

### Negative

- **Backend Lock-in**: tRPC is opinionated on backend structure
- **HTTP Headers**: Limited control over HTTP headers
- **Public API**: Not ideal for public APIs (use REST/OpenAPI)
- **Team Learning**: Team needs to learn tRPC concepts
- **Debugging**: Request/response debugging can be harder than REST

### Risks and Mitigations

- **Risk**: Need for public REST API in future
  - **Mitigation**: Can run tRPC and REST APIs side-by-side, generate OpenAPI from tRPC

- **Risk**: Complex types become hard to manage
  - **Mitigation**: Keep procedures simple and focused, use proper typing patterns

- **Risk**: Performance overhead with complex queries
  - **Mitigation**: Use data loaders, optimize database queries, leverage caching

## Alternatives Considered

### Alternative 1: REST API with OpenAPI

- **Description**: Traditional REST API with OpenAPI specification
- **Pros**:
  - Universal standard
  - Works with any client
  - Easy to test with curl/Postman
  - Good for public APIs
- **Cons**:
  - No end-to-end type safety
  - Requires code generation for types
  - More boilerplate
  - API documentation must be maintained separately
- **Rejection Reason**: Lacks end-to-end type safety, more boilerplate

### Alternative 2: GraphQL

- **Description**: Use GraphQL as API layer
- **Pros**:
  - Strong typing
  - Flexible queries
  - Self-documenting
  - Good ecosystem
- **Cons**:
  - Complex setup
  - N+1 query problem
  - Requires code generation for types
  - More cognitive overhead
  - Serverless deployment more complex
- **Rejection Reason**: More complex than needed, tRPC provides better DX

### Alternative 3: Custom API with Zod

- **Description**: Build custom API with manual Zod validation
- **Pros**:
  - Full control
  - Simple concepts
  - Good validation
- **Cons**:
  - Must build client code manually
  - No automatic type inference
  - More boilerplate
  - No standard patterns
- **Rejection Reason**: More boilerplate, less tooling support than tRPC

## Implementation Details

### Router Setup

```typescript
// packages/trpc/src/router.ts
import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  users: t.router({
    list: t.procedure.query(async ({ ctx }) => {
      return await prisma.user.findMany();
    }),

    byId: t.procedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const user = await prisma.user.findUnique({
          where: { id: input.id },
        });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        return user;
      }),

    create: t.procedure
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().min(2),
          role: z.enum(["student", "advisor", "admin"]),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        return await prisma.user.create({
          data: input,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

### Next.js API Route

```typescript
// apps/main/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@packages/trpc/src/router";

const handler = fetchRequestHandler({
  router: appRouter,
  createContext,
});

export { handler as GET, handler as POST };
```

### Client Setup

```typescript
// packages/trpc/src/client.ts
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "./router";

export const trpc = createTRPCReact<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});
```

### Usage in React Components

```typescript
'use client';

import { trpc } from '@packages/trpc/client';

export function UserProfile({ userId }: { userId: string }) {
  // Fully typed query
  const { data: user, isLoading, error } = trpc.users.byId.useQuery({
    id: userId,
  });

  const createUser = trpc.users.create.useMutation();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <button onClick={() => createUser.mutate({ ... })}>
        Create User
      </button>
    </div>
  );
}
```

### Context and Authentication

```typescript
// packages/trpc/src/context.ts
import { inferAsyncReturnType } from "@trpc/server";
import { clerkClient } from "@packages/auth/clerk";
import { prisma } from "@packages/database/client";

export async function createContext(opts?: { req?: Request }) {
  const session = await clerkClient.getSession(opts?.req);

  return {
    prisma,
    user: session?.user,
  };
}

type Context = inferAsyncReturnType<typeof createContext>;
```

### Protected Procedures

```typescript
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const appRouter = t.router({
  protected: t.router({
    getProfile: isAuthed.procedure.query(async ({ ctx }) => {
      return await prisma.user.findUnique({
        where: { id: ctx.user.id },
      });
    }),
  }),
});
```

### Server-Side Usage

```typescript
// apps/main/app/dashboard/page.tsx
import { trpcServer } from '@packages/trpc/server';

export default async function DashboardPage() {
  // Server-side tRPC call
  const user = await trpcServer.users.byId.query({ id: '123' });

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
    </div>
  );
}
```

## Best Practices

- Keep procedures small and focused
- Use Zod for input validation
- Leverage context for shared data (user, prisma)
- Use middleware for common logic (auth, logging)
- Batch requests when possible
- Use React Query caching effectively
- Handle errors gracefully with proper TRPCError codes
- Document complex procedures with JSDoc

## Related Decisions

- [ADR-001: Next.js Framework](../ADR-001-nextjs-framework.md)
- [ADR-002: TypeScript Adoption](../ADR-002-typescript.md)

## References

- [tRPC Documentation](https://trpc.io/docs)
- [tRPC with Next.js](https://trpc.io/docs/nextjs)
- [tRPC Best Practices](https://trpc.io/docs/guides/performance)

## Sign-off

- [x] John Doe, Tech Lead
- [x] Jane Smith, Senior Architect
- [x] Mike Brown, Backend Lead
