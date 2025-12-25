#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Building with Pagefind integration...");

const nextConfigPath = path.join(process.cwd(), "next.config.mjs");
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"),
);

if (!packageJson.dependencies?.pagefind) {
  console.error("❌ Pagefind not installed. Run: pnpm add pagefind");
  process.exit(1);
}

try {
  console.log("Building Next.js application...");
  execSync("next build", { stdio: "inherit" });

  console.log("Generating Pagefind search index...");
  execSync("npx pagefind --site .next/server/app", { stdio: "inherit" });

  console.log("✅ Build complete with Pagefind integration!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
