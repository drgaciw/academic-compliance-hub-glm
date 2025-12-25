/**
 * Vitest Workspace Configuration
 *
 * Root configuration for the monorepo workspace testing.
 * This enables running tests across all packages and apps with unified coverage reporting.
 */

import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  // Apps
  {
    test: {
      name: "main-app",
      root: "./apps/main",
      include: ["**/__tests__/**/*.test.{ts,tsx}"],
      environment: "jsdom",
    },
  },
  {
    test: {
      name: "student-app",
      root: "./apps/student",
      include: ["**/__tests__/**/*.test.{ts,tsx}"],
      environment: "jsdom",
    },
  },
  {
    test: {
      name: "admin-app",
      root: "./apps/admin",
      include: ["**/__tests__/**/*.test.{ts,tsx}"],
      environment: "jsdom",
    },
  },

  // Packages
  {
    test: {
      name: "ui-package",
      root: "./packages/ui",
      include: ["**/__tests__/**/*.test.{ts,tsx}"],
      environment: "jsdom",
    },
  },
  {
    test: {
      name: "auth-package",
      root: "./packages/auth",
      include: ["**/__tests__/**/*.test.{ts,tsx}"],
      environment: "node",
    },
  },
  {
    test: {
      name: "database-package",
      root: "./packages/database",
      include: ["**/tests/**/*.test.{ts,tsx}"],
      environment: "node",
    },
  },
  {
    test: {
      name: "api-utils-package",
      root: "./packages/api-utils",
      include: ["**/__tests__/**/*.test.{ts,tsx}"],
      environment: "node",
    },
  },
  {
    test: {
      name: "ai-package",
      root: "./packages/ai",
      include: ["**/__tests__/**/*.test.{ts,tsx}"],
      environment: "node",
    },
  },
  {
    test: {
      name: "integration-adapter-package",
      root: "./packages/integration-adapter",
      include: ["**/tests/**/*.test.{ts,tsx}"],
      environment: "node",
    },
  },
  {
    test: {
      name: "report-generation-package",
      root: "./packages/report-generation",
      include: ["**/tests/**/*.test.{ts,tsx}"],
      environment: "node",
    },
  },
  {
    test: {
      name: "compliance-engine-package",
      root: "./packages/compliance-engine",
      include: ["**/tests/**/*.test.{ts,tsx}"],
      environment: "node",
    },
  },
  {
    test: {
      name: "document-processing-package",
      root: "./packages/document-processing",
      include: ["**/tests/**/*.test.{ts,tsx}"],
      environment: "node",
    },
  },
  {
    test: {
      name: "course-mapping-package",
      root: "./packages/course-mapping",
      include: ["**/tests/**/*.test.{ts,tsx}"],
      environment: "node",
    },
  },
]);
