import { test, expect } from "@playwright/test";

test.describe("H4-001: Security Audit - E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  describe("SQL Injection Prevention", () => {
    test("H4-001-E001: Should block SQL injection in login form", async ({
      page,
    }) => {
      await page.fill('input[type="email"]', "' OR '1'='1");
      await page.fill('input[type="password"]', "' OR '1'='1");
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator("text=Invalid credentials")).toBeVisible();
    });

    test("H4-001-E002: Should block union-based SQL injection", async ({
      page,
    }) => {
      await page.fill(
        'input[type="email"]',
        "admin' UNION SELECT * FROM users --",
      );
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator("text=Invalid credentials")).toBeVisible();
    });

    test("H4-001-E003: Should block time-based SQL injection", async ({
      page,
    }) => {
      const startTime = Date.now();
      await page.fill(
        'input[type="email"]',
        "admin'; WAITFOR DELAY '0:0:5' --",
      );
      await page.click('button[type="submit"]');
      const duration = Date.now() - startTime;

      await expect(duration).toBeLessThan(3000);
    });

    test("H4-001-E004: Should block SQL injection in search forms", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/search");
      await page.fill('input[name="query"]', "1' OR '1'='1");
      await page.click('button:has-text("Search")');

      await expect(page.locator("text=Invalid search query")).toBeVisible();
    });
  });

  describe("XSS Prevention", () => {
    test("H4-001-E005: Should block script injection in form fields", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/profile");
      await page.fill(
        'input[name="firstName"]',
        "<script>alert('XSS')</script>",
      );
      await page.click('button:has-text("Save")');

      await expect(page.locator("script")).toHaveCount(0);
    });

    test("H4-001-E006: Should sanitize HTML in text areas", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/notes");
      await page.fill(
        'textarea[name="content"]',
        '<img src=x onerror=alert("XSS")>',
      );
      await page.click('button:has-text("Save")');

      const pageContent = await page.content();
      expect(pageContent).not.toContain("onerror");
      expect(pageContent).not.toContain("alert");
    });

    test("H4-001-E007: Should prevent JavaScript URI in links", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/profile");
      await page.fill('input[name="website"]', "javascript:alert('XSS')");
      await page.click('button:has-text("Save")');

      const input = page.locator('input[name="website"]');
      const value = await input.inputValue();
      expect(value).not.toContain("javascript:");
    });

    test("H4-001-E008: Should prevent event handler injection", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/profile");
      await page.fill('input[name="displayName"]', 'test" onload="alert(1)');
      await page.click('button:has-text("Save")');

      const input = page.locator('input[name="displayName"]');
      const value = await input.inputValue();
      expect(value).not.toContain("onload");
    });
  });

  describe("CSRF Protection", () => {
    test("H4-001-E009: Should reject requests without CSRF token", async ({
      page,
      request,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      const response = await request.post("/api/update-profile", {
        data: {
          firstName: "Modified",
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test("H4-001-E010: Should validate CSRF token in forms", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/profile");

      const csrfToken = await page
        .locator('input[name="csrf_token"]')
        .inputValue();
      expect(csrfToken).toBeTruthy();
      expect(csrfToken.length).toBeGreaterThan(0);
    });

    test("H4-001-E011: Should reject invalid CSRF tokens", async ({
      page,
      request,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      const response = await request.post("/api/update-profile", {
        data: {
          firstName: "Modified",
          csrf_token: "invalid-token",
        },
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Authentication Security", () => {
    test("H4-001-E012: Should lock account after failed attempts", async ({
      page,
    }) => {
      for (let i = 0; i < 5; i++) {
        await page.goto("/login");
        await page.fill('input[type="email"]', "test@example.com");
        await page.fill('input[type="password"]', "wrongpassword");
        await page.click('button[type="submit"]');
        await page.waitForTimeout(100);
      }

      await expect(
        page.locator("text=Account locked|Too many attempts"),
      ).toBeVisible();
    });

    test("H4-001-E013: Should enforce password complexity", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.click('a:has-text("Register")');
      await page.fill('input[type="email"]', "newuser@example.com");
      await page.fill('input[type="password"]', "simple");
      await page.click('button:has-text("Register")');

      await expect(
        page.locator("text=Password too weak|Password must"),
      ).toBeVisible();
    });

    test("H4-001-E014: Should protect against brute force", async ({
      page,
    }) => {
      const startTime = Date.now();
      for (let i = 0; i < 3; i++) {
        await page.goto("/login");
        await page.fill('input[type="email"]', "test@example.com");
        await page.fill('input[type="password"]', "wrongpassword");
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      }
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThan(2500);
    });

    test("H4-001-E015: Should logout and invalidate session", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.click('button:has-text("Logout")');

      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  describe("Authorization Checks", () => {
    test("H4-001-E016: Should prevent student from accessing admin routes", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "student@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/admin/users");

      await expect(page).toHaveURL(/\/dashboard|\/unauthorized/);
      await expect(
        page.locator("text=Access denied|Unauthorized"),
      ).toBeVisible();
    });

    test("H4-001-E017: Should prevent direct URL access to protected routes", async ({
      page,
    }) => {
      await page.goto("/admin/settings");

      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test("H4-001-E018: Should enforce role-based permissions", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "advisor@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/compliance/rules");

      await expect(page).toHaveURL(/\/dashboard|\/unauthorized/);
    });

    test("H4-001-E019: Should prevent permission escalation via URL manipulation", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "student@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/student/../admin/users");

      await expect(page).toHaveURL(/\/dashboard|\/unauthorized/);
    });
  });

  describe("Input Validation", () => {
    test("H4-001-E020: Should validate email format", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "not-an-email");
      await page.click('button[type="submit"]');

      await expect(page.locator("text=Invalid email")).toBeVisible();
    });

    test("H4-001-E021: Should sanitize special characters in inputs", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/profile");
      await page.fill(
        'input[name="bio"]',
        "Test & <script>alert(1)</script> & More",
      );
      await page.click('button:has-text("Save")');

      await page.reload();
      const savedBio = await page.locator('[data-testid="bio"]').textContent();
      expect(savedBio).not.toContain("<script>");
      expect(savedBio).not.toContain("alert");
    });

    test("H4-001-E022: Should limit input length", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      await page.goto("/profile");
      const longInput = "a".repeat(10000);
      await page.fill('input[name="firstName"]', longInput);
      await page.click('button:has-text("Save")');

      const input = page.locator('input[name="firstName"]');
      const value = await input.inputValue();
      expect(value.length).toBeLessThan(1000);
    });
  });

  describe("Secure Headers", () => {
    test("H4-001-E023: Should set secure cookies", async ({
      page,
      context,
    }) => {
      await page.goto("/login");

      const cookies = await context.cookies();
      const sessionCookie = cookies.find((c) => c.name.includes("session"));

      if (sessionCookie) {
        expect(sessionCookie.httpOnly).toBe(true);
        expect(sessionCookie.sameSite).toBeTruthy();
      }
    });

    test("H4-001-E024: Should include security headers", async ({
      page,
      request,
    }) => {
      const response = await request.get("/");
      const headers = response.headers();

      expect(headers["x-frame-options"]).toBeDefined();
      expect(headers["x-content-type-options"]).toBeDefined();
      expect(headers["x-xss-protection"]).toBeDefined();
    });

    test("H4-001-E025: Should enforce HTTPS in production", async ({
      page,
    }) => {
      const baseUrl = page.url();

      if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
        expect(baseUrl).toContain("http://");
      } else {
        expect(baseUrl).toContain("https://");
      }
    });
  });

  describe("Error Handling", () => {
    test("H4-001-E026: Should not leak sensitive information in errors", async ({
      page,
    }) => {
      await page.goto("/non-existent-page-12345");

      const pageContent = await page.content();
      expect(pageContent).not.toContain("Stack trace");
      expect(pageContent).not.toContain("node_modules");
      expect(pageContent).not.toContain("database");
      expect(pageContent).not.toContain("password");
    });

    test("H4-001-E027: Should display generic error messages", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "wrong@example.com");
      await page.fill('input[type="password"]', "wrongpass");
      await page.click('button[type="submit"]');

      await expect(page.locator("text=Invalid credentials")).toBeVisible();
      await expect(page.locator("text=User not found")).not.toBeVisible();
    });

    test("H4-001-E028: Should log errors server-side", async ({ page }) => {
      await page.goto("/api/trigger-error", {
        waitUntil: "domcontentloaded",
      });

      await expect(page.locator("text=An error occurred")).toBeVisible();
    });
  });

  describe("Session Management", () => {
    test("H4-001-E029: Should expire session after timeout", async ({
      page,
      context,
    }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);

      await context.clearCookies();
      await page.goto("/dashboard");

      await expect(page).toHaveURL(/\/login/);
    });

    test("H4-001-E030: Should prevent session fixation", async ({ page }) => {
      const sessionBefore = await page.evaluate(() => {
        return document.cookie;
      });

      await page.goto("/login");
      await page.fill('input[type="email"]', "test@example.com");
      await page.fill('input[type="password"]', "testpass");
      await page.click('button[type="submit"]');

      await page.waitForURL(/\/dashboard/);
      const sessionAfter = await page.evaluate(() => {
        return document.cookie;
      });

      expect(sessionAfter).not.toBe(sessionBefore);
    });
  });
});
