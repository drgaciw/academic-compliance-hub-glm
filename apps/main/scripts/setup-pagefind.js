#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Setting up Pagefind search index...");

const outDir = path.join(process.cwd(), "out");

if (!fs.existsSync(outDir)) {
  console.log("Output directory not found. Building project first...");
  execSync("pnpm build", { stdio: "inherit" });
}

try {
  console.log("Running Pagefind index...");
  execSync("npx pagefind --site out", { stdio: "inherit" });
  console.log("✅ Pagefind search index created successfully!");
} catch (error) {
  console.error("❌ Failed to create Pagefind index:", error.message);
  process.exit(1);
}
