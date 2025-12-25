/**
 * Vitest Configuration for UI Package
 *
 * This configuration sets up Vitest for testing React components
 * with React Testing Library and jsdom environment.
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
        "**/old-components/**",
      ],
      // Per-file thresholds
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      all: true,
      clean: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
