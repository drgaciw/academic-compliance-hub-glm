#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 *
 * This script validates environment variables against required schemas.
 * Run before deployment to ensure all required variables are set correctly.
 *
 * Usage:
 *   node scripts/validate-env.js [environment]
 *
 *   environment: development | staging | production (default: development)
 */

const fs = require("fs");
const path = require("path");

const ENV_FILES = {
  development: ".env.development",
  staging: ".env.staging",
  production: ".env.production",
};

const REQUIRED_VARS = {
  critical: ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "JWT_SECRET"],
  high: [
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "SENTRY_DSN",
    "SENTRY_AUTH_TOKEN",
  ],
  medium: [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET",
    "PUSHER_APP_ID",
    "PUSHER_KEY",
    "PUSHER_SECRET",
  ],
};

const VALIDATION_RULES = {
  NEXTAUTH_SECRET: {
    minLength: 32,
    description: "NextAuth secret must be at least 32 characters",
  },
  JWT_SECRET: {
    minLength: 32,
    description: "JWT secret must be at least 32 characters",
  },
  DATABASE_URL: {
    pattern: /^postgresql:\/\/.+$/,
    description: "DATABASE_URL must be a valid PostgreSQL connection string",
  },
  SENTRY_DSN: {
    pattern: /^https:\/\/.+@.+\.ingest\.sentry\.io\/.+/,
    description: "SENTRY_DSN must be a valid Sentry DSN",
  },
  VERCEL_URL: {
    pattern: /^https?:\/\/.+/,
    description: "VERCEL_URL must be a valid URL",
  },
  NEXTAUTH_URL: {
    pattern: /^https?:\/\/.+/,
    description: "NEXTAUTH_URL must be a valid URL",
  },
};

const FORBIDDEN_PATTERNS = [
  {
    pattern: /CHANGE-ME/i,
    level: "error",
    description: "Placeholder value detected",
  },
  {
    pattern: /dev-secret/i,
    level: "warning",
    environment: "production",
    description: "Development secret in production",
  },
  {
    pattern: /dev-key/i,
    level: "warning",
    environment: "production",
    description: "Development key in production",
  },
  {
    pattern: /example\.com/i,
    level: "error",
    environment: "production",
    description: "Example domain in production",
  },
  {
    pattern: /localhost/i,
    level: "error",
    environment: ["production", "staging"],
    description: "localhost URL in production/staging",
  },
];

class EnvValidator {
  constructor(environment) {
    this.environment = environment || "development";
    this.envFile = ENV_FILES[this.environment];
    this.errors = [];
    this.warnings = [];
    this.missingVars = { critical: [], high: [], medium: [] };
  }

  loadEnvFile() {
    const envPath = path.join(process.cwd(), this.envFile);

    if (!fs.existsSync(envPath)) {
      throw new Error(`Environment file not found: ${this.envFile}`);
    }

    const content = fs.readFileSync(envPath, "utf8");
    this.envVars = {};

    content.split("\n").forEach((line) => {
      const match = line.match(/^([^#]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        this.envVars[key.trim()] = value.trim();
      }
    });
  }

  validateRequiredVars() {
    Object.entries(REQUIRED_VARS).forEach(([priority, vars]) => {
      vars.forEach((varName) => {
        const value = this.envVars[varName];

        if (!value || value === "" || value === '""' || value === "''") {
          this.missingVars[priority].push(varName);
          this.errors.push(
            `[${priority.toUpperCase()}] Missing required variable: ${varName}`,
          );
        }
      });
    });
  }

  validatePatterns() {
    Object.entries(VALIDATION_RULES).forEach(([varName, rules]) => {
      const value = this.envVars[varName];

      if (!value) return;

      if (rules.minLength && value.length < rules.minLength) {
        this.errors.push(
          `${varName}: ${rules.description} (current: ${value.length} chars, required: ${rules.minLength})`,
        );
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        this.errors.push(`${varName}: ${rules.description}`);
      }
    });
  }

  validateForbiddenPatterns() {
    Object.entries(this.envVars).forEach(([varName, value]) => {
      if (!value || value.startsWith("#")) return;

      FORBIDDEN_PATTERNS.forEach(
        ({ pattern, level, environment, description }) => {
          if (
            environment &&
            !Array.isArray(environment) &&
            this.environment !== environment
          )
            return;
          if (
            environment &&
            Array.isArray(environment) &&
            !environment.includes(this.environment)
          )
            return;

          if (pattern.test(value)) {
            const message = `${varName}: ${description}`;
            if (level === "error") {
              this.errors.push(message);
            } else {
              this.warnings.push(message);
            }
          }
        },
      );
    });
  }

  validateConsistency() {
    const urlVars = ["NEXTAUTH_URL", "VERCEL_URL", "NEXT_PUBLIC_APP_URL"];
    const urls = urlVars.map((v) => this.envVars[v]).filter(Boolean);

    if (urls.length > 1) {
      const firstUrl = new URL(urls[0]);
      urls.forEach((url, index) => {
        if (index === 0) return;
        const currentUrl = new URL(url);
        if (currentUrl.origin !== firstUrl.origin) {
          this.warnings.push(
            `URL mismatch: ${urlVars[0]} (${firstUrl.origin}) vs ${urlVars[index]} (${currentUrl.origin})`,
          );
        }
      });
    }
  }

  validateFeatureFlags() {
    const featureVars = Object.entries(this.envVars)
      .filter(([key]) => key.startsWith("FEATURE_"))
      .map(([key, value]) => ({ key, value }));

    featureVars.forEach(({ key, value }) => {
      if (
        !["true", "false", "1", "0", "yes", "no"].includes(value.toLowerCase())
      ) {
        this.warnings.push(
          `${key}: Invalid feature flag value "${value}" (expected: true/false)`,
        );
      }
    });
  }

  printSummary() {
    console.log("\n" + "=".repeat(70));
    console.log(
      `Environment Validation Report: ${this.environment.toUpperCase()}`,
    );
    console.log("=".repeat(70) + "\n");

    if (this.errors.length > 0) {
      console.error(`❌ ERRORS (${this.errors.length}):`);
      this.errors.forEach((error) => console.error(`   ${error}`));
      console.error("");
    }

    if (this.warnings.length > 0) {
      console.warn(`⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach((warning) => console.warn(`   ${warning}`));
      console.warn("");
    }

    if (Object.values(this.missingVars).some((arr) => arr.length > 0)) {
      console.error("📋 MISSING REQUIRED VARIABLES:");
      Object.entries(this.missingVars).forEach(([priority, vars]) => {
        if (vars.length > 0) {
          console.error(`   [${priority.toUpperCase()}] ${vars.join(", ")}`);
        }
      });
      console.error("");
    }

    const totalChecked = Object.keys(this.envVars).length;
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;

    console.log("=".repeat(70));
    console.log(`Variables checked: ${totalChecked}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log("=".repeat(70) + "\n");

    if (hasErrors) {
      console.error("❌ Validation FAILED - Fix errors before deployment\n");
      process.exit(1);
    } else if (hasWarnings) {
      console.warn(
        "⚠️  Validation PASSED with warnings - Review before deployment\n",
      );
      process.exit(0);
    } else {
      console.log("✅ Validation PASSED - All checks passed\n");
      process.exit(0);
    }
  }

  run() {
    try {
      console.log(`Loading environment file: ${this.envFile}`);
      this.loadEnvFile();

      console.log("Running validation checks...");
      this.validateRequiredVars();
      this.validatePatterns();
      this.validateForbiddenPatterns();
      this.validateConsistency();
      this.validateFeatureFlags();

      this.printSummary();
    } catch (error) {
      console.error(`\n❌ Validation failed: ${error.message}\n`);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const environment = process.argv[2] || "development";
  const validator = new EnvValidator(environment);
  validator.run();
}

module.exports = EnvValidator;
