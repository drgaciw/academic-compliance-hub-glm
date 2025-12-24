/**
 * Vitest Configuration for Main App
 *
 * This configuration sets up Vitest for testing the main application
 * with React Testing Library, jsdom environment, and Next.js integration.
 *
 * Coverage Targets:
 * - Components: 90%+
 * - Hooks: 95%+
 * - Utilities: 100%
 * - Services: 85%+
 * - Overall: 90%
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", "coverage"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "__tests__/",
        "**/*.config.*",
        "**/*.d.ts",
        "**/dist/**",
        "**/build/**",
        "**/.next/**",
        "**/coverage/**",
        "**/public/**",
        "**/.turbo/**",
        "**/mocks/**",
        "**/fixtures/**",
      ],
      // Per-file thresholds
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      // Include uncovered lines in report
      all: true,
      // Clean coverage directory before running
      clean: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@aah/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@aah/auth": path.resolve(__dirname, "../../packages/auth/src"),
      "@aah/database": path.resolve(__dirname, "../../packages/database/src"),
      "@aah/api-utils": path.resolve(__dirname, "../../packages/api-utils/src"),
      "@aah/ai": path.resolve(__dirname, "../../packages/ai/src"),
    },
  },
});
