const config = {
  projectToken: process.env.CHROMATIC_PROJECT_TOKEN,

  // Enable auto-accept changes for baseline commits
  // Set to true when capturing baselines, false for regular PRs
  autoAcceptChanges: process.env.CHROMATIC_AUTO_ACCEPT === "true",

  // Disable CSS animations for visual regression
  css: {
    disableAnimations: true,
  },

  // Build configuration
  buildScript: "storybook build",

  // Storybook directory
  storybookBuildDir: "storybook-static",

  // Skip stories matching this pattern
  stories: [],

  // Only build changed stories in CI for faster builds
  onlyChanged: process.env.CI === "true",

  // Exit with non-zero code if changes detected (blocks CI)
  // When exitZeroOnChanges is false, Chromatic will exit with code 1 if changes are found
  exitZeroOnChanges: process.env.CHROMATIC_EXIT_ZERO === "true",

  // Approval workflow configuration
  // Require manual approval for all changes
  buildCommandName: process.env.CI ? "CI Build" : "Local Build",

  // Upload build artifacts
  packageManager: "pnpm",

  // TypeScript config
  typescript: {
    // Disable type checking for faster builds
    check: false,
  },

  // Vite config
  viteConfig: {
    // Build optimization
    optimizeDeps: {
      include: ["@radix-ui/*", "lucide-react"],
    },
  },
};

export default config;
