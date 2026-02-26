/**
 * Security Utilities
 *
 * Provides security-related utilities for the application.
 */

import { NextRequest } from "next/server";

/**
 * Check if a request is from an allowed origin
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  if (!origin) {
    return true; // Same-origin requests don't have Origin header
  }

  return allowedOrigins.includes(origin);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a secure random token using rejection sampling
 * to avoid modulo bias.
 */
export function generateSecureToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = chars.length;
  // Largest multiple of charsLength that fits in a Uint32 (avoids modulo bias)
  const maxValid = Math.floor(0x100000000 / charsLength) * charsLength;
  let token = "";

  for (let i = 0; i < length; i++) {
    let randomValue: number;
    do {
      randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
    } while (randomValue >= maxValid);
    token += chars[randomValue % charsLength];
  }

  return token;
}

/**
 * Check if a string is a potential secret
 */
export function isPotentialSecret(str: string): boolean {
  // Check for common secret patterns
  const patterns = [
    /^sk-[a-zA-Z0-9]{32,}$/, // OpenAI/Stripe API keys
    /^pk-[a-zA-Z0-9]{32,}$/, // Publishable keys
    /^[a-f0-9]{32}$/, // MD5 hashes (potential password)
    /^[a-f0-9]{40}$/, // SHA1 hashes
    /^[a-f0-9]{64}$/, // SHA256 hashes
    /^Bearer [a-zA-Z0-9\-._~+/]+=*$/, // Bearer tokens
  ];

  return patterns.some((pattern) => pattern.test(str));
}

/**
 * Redact sensitive information from logs
 */
export function redactSensitiveData(data: any): any {
  if (typeof data === "string") {
    if (isPotentialSecret(data)) {
      return "[REDACTED]";
    }
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const redacted: any = {};
    for (const key in data) {
      const sensitiveKeys = [
        "password",
        "secret",
        "token",
        "apiKey",
        "api_key",
        "private_key",
        "authorization",
        "cookie",
        "session",
        "credit_card",
        "ssn",
        "social_security_number",
      ];

      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactSensitiveData(data[key]);
      }
    }
    return redacted;
  }

  return data;
}
