# @aah/auth

Authentication and authorization package for the Athletic Academics Hub.

## Overview

This package provides authentication and authorization utilities using Clerk.

## Features

- Clerk integration for authentication
- Route protection middleware
- Role-based access control
- Session management

## Usage

```typescript
import { clerkConfig, isProtectedRoute } from '@aah/auth';

// Check if a route is protected
if (isProtectedRoute('/dashboard')) {
  // Require authentication
}
```

## Configuration

Set the following environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
