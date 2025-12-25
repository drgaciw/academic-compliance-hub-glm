#!/usr/bin/env node

/**
 * Secret Audit Script
 *
 * Scans codebase for hardcoded secrets, API keys, passwords, and tokens.
 * Returns a report of potential security vulnerabilities.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Secret patterns to detect
const SECRET_PATTERNS = [
  // API Keys
  {
    name: "API Key (General)",
    pattern:
      /['"`]?(API_KEY|api_key|apiKey|APISECRET|api_secret|apiSecret)['"`]?\s*[:=]\s*['"`]([a-zA-Z0-9\-_]{20,})['"`]/gi,
    severity: "high",
  },
  // OpenAI
  {
    name: "OpenAI API Key",
    pattern:
      /['"`]?OPENAI_API_KEY['"`]?\s*[:=]\s*['"`](sk-[a-zA-Z0-9]{32,})['"`]/gi,
    severity: "critical",
  },
  // Anthropic
  {
    name: "Anthropic API Key",
    pattern:
      /['"`]?ANTHROPIC_API_KEY['"`]?\s*[:=]\s*['"`](sk-ant-[a-zA-Z0-9]{50,})['"`]/gi,
    severity: "critical",
  },
  // Clerk
  {
    name: "Clerk Secret Key",
    pattern:
      /['"`]?CLERK_SECRET_KEY['"`]?\s*[:=]\s*['"`](sk_test_[a-zA-Z0-9]{40,}|sk_live_[a-zA-Z0-9]{40,})['"`]/gi,
    severity: "critical",
  },
  // AWS
  {
    name: "AWS Access Key",
    pattern:
      /['"`]?(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_SESSION_TOKEN)['"`]?\s*[:=]\s*['"`]([a-zA-Z0-9/+=]{16,})['"`]/gi,
    severity: "critical",
  },
  // Database URLs
  {
    name: "Database URL with Credentials",
    pattern:
      /['"`]?(DATABASE_URL|MONGODB_URI|REDIS_URL)['"`]?\s*[:=]\s*['"`]?(postgresql|mysql|mongodb|redis):\/\/[a-zA-Z0-9\-_]+:[a-zA-Z0-9\-_]+@/gi,
    severity: "critical",
  },
  // JWT Secret
  {
    name: "JWT Secret",
    pattern:
      /['"`]?JWT_SECRET['"`]?\s*[:=]\s*['"`]([a-zA-Z0-9\-_]{16,}['"`])/gi,
    severity: "high",
  },
  // Bearer Tokens
  {
    name: "Bearer Token",
    pattern: /Bearer\s+[a-zA-Z0-9\-._~+/]+={0,2}/gi,
    severity: "high",
  },
  // Encryption Keys
  {
    name: "Encryption Key",
    pattern:
      /['"`]?(ENCRYPTION_KEY|PRIVATE_KEY|encryption_key|private_key)['"`]?\s*[:=]\s*['"`]([a-zA-Z0-9\-_]{16,}['"`])/gi,
    severity: "critical",
  },
  // Tokens
  {
    name: "Generic Token",
    pattern:
      /['"`]?(TOKEN|token|SECRET|secret|PASSWORD|password|PASS|pass)['"`]?\s*[:=]\s*['"`]([a-zA-Z0-9\-._~+/]{16,})['"`]/gi,
    severity: "medium",
  },
  // Webhooks
  {
    name: "Webhook Secret",
    pattern:
      /['"`]?(WEBHOOK_SECRET|webhook_secret|whsec_)['"`]?\s*[:=]\s*['"`]([a-zA-Z0-9]{20,})['"`]/gi,
    severity: "high",
  },
  // OAuth
  {
    name: "OAuth Client Secret",
    pattern:
      /['"`]?(CLIENT_SECRET|client_secret|OAUTH_SECRET)['"`]?\s*[:=]\s*['"`]([a-zA-Z0-9\-_]{16,})['"`]/gi,
    severity: "high",
  },
  // Stripe
  {
    name: "Stripe API Key",
    pattern:
      /['"`]?STRIPE_(SECRET|PUBLISHABLE)_KEY['"`]?\s*[:=]\s*['"`](sk_live_|pk_live_|sk_test_|pk_test_)[a-zA-Z0-9]{20,}['"`]/gi,
    severity: "critical",
  },
  // Twilio
  {
    name: "Twilio API Key",
    pattern:
      /['"`]?TWILIO_(ACCOUNT_SID|AUTH_TOKEN)['"`]?\s*[:=]\s*['"`]([a-zA-Z0-9]{32,})['"`]/gi,
    severity: "high",
  },
];

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.git/,
  /.env/,
  /\.env\.example/,
  /\.vscode/,
  /package-lock\.json/,
  /pnpm-lock\.yaml/,
  /yarn\.lock/,
  /\.turbo/,
  /test_reports/,
  /secrets/, // If there's a secrets directory
];

// File extensions to scan
const INCLUDE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".toml",
  ".env",
];

class SecretScanner {
  constructor(rootPath) {
    this.rootPath = path.resolve(rootPath);
    this.violations = [];
    this.stats = {
      filesScanned: 0,
      violationsFound: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
  }

  shouldInclude(filePath) {
    // Check if file is in excluded directory
    const relativePath = path.relative(this.rootPath, filePath);

    for (const pattern of EXCLUDE_PATTERNS) {
      if (pattern.test(relativePath)) {
        return false;
      }
    }

    // Check if file has included extension
    const ext = path.extname(filePath);
    return INCLUDE_EXTENSIONS.includes(ext);
  }

  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const relativePath = path.relative(this.rootPath, filePath);

      for (const secretType of SECRET_PATTERNS) {
        let match;
        const regex = new RegExp(secretType.pattern);

        while ((match = regex.exec(content)) !== null) {
          // Get line number
          const lines = content.substring(0, match.index).split("\n");
          const lineNumber = lines.length;
          const lineContent = lines[lines.length - 1].trim();

          this.violations.push({
            file: relativePath,
            line: lineNumber,
            content: lineContent,
            type: secretType.name,
            severity: secretType.severity,
            matched: match[0],
          });

          this.stats.violationsFound++;
          this.stats[secretType.severity]++;
        }
      }

      this.stats.filesScanned++;
    } catch (error) {
      // Skip files that can't be read
    }
  }

  scanDirectory(dirPath) {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          this.scanDirectory(fullPath);
        } else if (entry.isFile() && this.shouldInclude(fullPath)) {
          this.scanFile(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.stats.filesScanned,
        totalViolations: this.stats.violationsFound,
        bySeverity: {
          critical: this.stats.critical,
          high: this.stats.high,
          medium: this.stats.medium,
          low: this.stats.low,
        },
      },
      violations: this.violations.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
    };

    return report;
  }

  printReport(report) {
    console.log("\n" + "=".repeat(80));
    console.log("SECRET AUDIT REPORT");
    console.log("=".repeat(80));
    console.log(`Scan Date: ${report.timestamp}`);
    console.log(`Root: ${this.rootPath}\n`);

    console.log("SUMMARY");
    console.log("-".repeat(80));
    console.log(`Files Scanned: ${report.summary.totalFiles}`);
    console.log(`Total Violations: ${report.summary.totalViolations}\n`);

    console.log("By Severity:");
    console.log(`  Critical: ${report.summary.bySeverity.critical}`);
    console.log(`  High: ${report.summary.bySeverity.high}`);
    console.log(`  Medium: ${report.summary.bySeverity.medium}`);
    console.log(`  Low: ${report.summary.bySeverity.low}\n`);

    if (report.violations.length > 0) {
      console.log("VIOLATIONS");
      console.log("-".repeat(80));

      for (const violation of report.violations) {
        const severityColor = {
          critical: "🔴 CRITICAL",
          high: "🟠 HIGH",
          medium: "🟡 MEDIUM",
          low: "🟢 LOW",
        }[violation.severity];

        console.log(`\n[${severityColor}] ${violation.type}`);
        console.log(`  File: ${violation.file}:${violation.line}`);
        console.log(
          `  Content: ${violation.content.substring(0, 80)}${violation.content.length > 80 ? "..." : ""}`,
        );
      }
    } else {
      console.log("✅ No secrets detected in the codebase!");
    }

    console.log("\n" + "=".repeat(80) + "\n");

    if (
      report.summary.bySeverity.critical > 0 ||
      report.summary.bySeverity.high > 0
    ) {
      console.log(
        "⚠️  ACTION REQUIRED: Critical or high-severity secrets found!",
      );
      console.log("   Please remove or rotate these secrets immediately.\n");
    }
  }

  saveReport(report, outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to: ${outputPath}\n`);
  }
}

// Main execution
const rootPath = process.argv[2] || process.cwd();
const reportPath =
  process.argv[3] || path.join(rootPath, "secret-audit-report.json");

console.log(`Scanning ${rootPath} for secrets...\n`);

const scanner = new SecretScanner(rootPath);
scanner.scanDirectory(rootPath);

const report = scanner.generateReport();
scanner.printReport(report);

scanner.saveReport(report, reportPath);

// Exit with error code if critical/high violations found
if (
  report.summary.bySeverity.critical > 0 ||
  report.summary.bySeverity.high > 0
) {
  process.exit(1);
}
