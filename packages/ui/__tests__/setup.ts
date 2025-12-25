/**
 * Vitest Setup File
 *
 * This file is executed before each test file.
 * It sets up testing environment with necessary mocks and configurations.
 */

import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Extend Vitest's expect with jest-axe accessibility matchers
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toHaveNoViolations(): any;
    }
  }
}

expect.extend({
  toHaveNoViolations(received: any) {
    return {
      pass: received.violations.length === 0,
      message: () => {
        return received.violations.length > 0
          ? `Expected no violations, but found ${received.violations.length}`
          : `Expected violations, but found none`;
      },
    };
  },
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;
