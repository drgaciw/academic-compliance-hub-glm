/// <reference types="vitest" />

export default {
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["node_modules/", "tests/", "**/*.test.ts", "**/*.d.ts"],
    },
    setupFiles: [],
  },
};
