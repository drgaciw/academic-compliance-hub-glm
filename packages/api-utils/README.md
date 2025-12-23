# @aah/api-utils

API utilities and helper functions for the Athletic Academics Hub.

## Overview

This package provides common utilities for building APIs across the monorepo.

## Features

- Standardized API response format
- Custom error classes
- Validation schemas using Zod
- Pagination helpers

## Usage

```typescript
import { successResponse, errorResponse, ValidationError } from '@aah/api-utils';

// Success response
const response = successResponse({ id: 1, name: 'John' });

// Error response
const error = errorResponse('VALIDATION_ERROR', 'Invalid input');

// Custom error
throw new ValidationError('Email is required');
```

## Response Format

All API responses follow this structure:

```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}
```
