/**
 * @aah/config
 * Shared configurations for TypeScript, ESLint, and other tools
 */

// Export configuration paths for easy access
export const configPaths = {
  typescript: {
    base: './base.json',
    nextjs: './nextjs.json',
    reactLibrary: './react-library.json',
  },
  eslint: {
    base: './eslint.js',
    next: './eslint-next.js',
  },
};
