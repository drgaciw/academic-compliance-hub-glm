/**
 * ESLint configuration for Next.js apps
 */

const { resolve } = require('node:path');

module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  parserOptions: {
    project: true,
  },
  rules: {
    '@next/next/no-html-link-for-pages': 'warn',
  },
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
};
