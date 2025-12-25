# ADR-002: Adopt TypeScript for Type Safety

**Status**: Accepted
**Date**: 2025-01-18
**Decision Makers**: Tech Lead, Senior Architect, Frontend Lead
**Technical Story**: https://github.com/your-org/athletic-academics-hub/issues/45

---

## Context

We need to choose a type system for the Athletic Academics Hub that provides:

- Type safety across the full stack
- Better developer experience with autocomplete
- Reduced runtime errors
- Improved code documentation
- Easier refactoring and maintenance

Current constraints:

- Team has JavaScript experience
- Next.js has excellent TypeScript support
- Need for type-safe database interactions
- Complex business logic requires type safety

## Decision

We selected **TypeScript** as our primary language with strict mode enabled.

Key features:

- End-to-end type safety from database to UI
- Excellent tooling and IDE support
- Gradual adoption possible with .ts and .tsx files
- Built-in type inference
- Strict type checking catches errors early

## Consequences

### Positive

- **Type Safety**: Errors caught at compile time, not runtime
- **Developer Experience**: Excellent autocomplete and inline documentation
- **Refactoring**: Safer with type checking
- **Code Documentation**: Types serve as documentation
- **Database Integration**: Prisma generates TypeScript types from schema
- **tRPC Integration**: End-to-end type safety from server to client

### Negative

- **Learning Curve**: Team needs to learn TypeScript
- **Build Time**: Slightly increased compilation time
- **Initial Setup**: More boilerplate for type definitions
- **Complex Types**: Some complex types can be verbose

### Risks and Mitigations

- **Risk**: Team unfamiliarity with TypeScript
  - **Mitigation**: Provide training sessions, start with lenient settings, gradually enable strict mode

- **Risk**: Over-engineering types
  - **Mitigation**: Use type inference where possible, avoid unnecessary type assertions

- **Risk**: Increased build time
  - **Mitigation**: Use Turborepo caching, incremental compilation

## Alternatives Considered

### Alternative 1: JavaScript with JSDoc

- **Description**: Continue with JavaScript, add type annotations via JSDoc comments
- **Pros**:
  - No learning curve for team
  - No build step required
  - More flexible
- **Cons**:
  - Types are not enforced at compile time
  - Poor tooling support
  - Runtime type errors still possible
  - JSDoc can get out of sync with code
- **Rejection Reason**: Doesn't provide compile-time type safety, weaker tooling

### Alternative 2: Flow

- **Description**: Use Flow as type checker for JavaScript
- **Pros**:
  - Gradual adoption like TypeScript
  - Good tooling support
- **Cons**:
  - Smaller ecosystem and community
  - Less integration with React ecosystem
  - Fewer library type definitions
- **Rejection Reason**: Less mature ecosystem than TypeScript, fewer benefits

## Implementation Details

### Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./*"],
      "@packages/*": ["./packages/*/src"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Type Definitions

```typescript
// packages/schemas/src/user.ts
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: "student" | "advisor" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = User["role"];

export type UserCreateInput = Omit<
  User,
  "id" | "clerkId" | "createdAt" | "updatedAt"
>;
```

### Prisma Integration

```typescript
// packages/database/prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  name      String
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// Prisma auto-generates TypeScript types
import { User, UserRole } from '@packages/database';
```

### tRPC Type Safety

```typescript
// packages/trpc/src/router.ts
export const appRouter = t.router({
  users: t.router({
    byId: t.procedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        // Fully typed
        const user = await prisma.user.findUnique({
          where: { id: input.id },
        });
        return user; // Type: User | null
      }),
  }),
});

// Client usage with type inference
const { data: user } = trpc.users.byId.useQuery({ id: "123" });
// user is automatically typed as User | null
```

### Best Practices

- Use strict mode for maximum safety
- Avoid `any` type
- Use type inference over explicit types
- Define shared types in `@packages/schemas`
- Use discriminated unions for variant types
- Use utility types: `Pick`, `Omit`, `Partial`, `Required`

## Related Decisions

- [ADR-001: Next.js Framework](../ADR-001-nextjs-framework.md)
- [ADR-003: Turborepo Monorepo](../ADR-003-turborepo.md)

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [TypeScript with Next.js](https://nextjs.org/docs/basic-features/typescript)
- [Prisma TypeScript](https://www.prisma.io/docs/concepts/components/prisma-schema/typescript)

## Sign-off

- [x] John Doe, Tech Lead
- [x] Jane Smith, Senior Architect
- [x] Bob Johnson, Frontend Lead
