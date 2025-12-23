# @aah/config

Shared configurations for TypeScript, ESLint, and other tools for Athletic Academics Hub.

## Overview

This package provides centralized configuration files used across the monorepo.

## Configurations

### TypeScript Configs

- `base.json` - Base TypeScript configuration
- `nextjs.json` - Configuration for Next.js applications
- `react-library.json` - Configuration for React libraries/packages

### ESLint Configs

- `eslint.js` - Base ESLint configuration
- `eslint-next.js` - ESLint configuration for Next.js apps

## Usage

### TypeScript

In your `tsconfig.json`:

```json
{
  "extends": "@aah/config/base.json"
}
```

For Next.js apps:

```json
{
  "extends": "@aah/config/nextjs.json"
}
```

### ESLint

In your `eslint.config.js`:

```javascript
module.exports = {
  extends: ['@aah/config/eslint'],
};
```

For Next.js apps:

```javascript
module.exports = {
  extends: ['@aah/config/eslint-next'],
};
```

## Features

- Strict TypeScript configuration
- ESLint rules for TypeScript
- Next.js specific configurations
- React library support
