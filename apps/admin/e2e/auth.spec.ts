import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("H2-001-001: Should display login page with all required fields", async ({
    page,
  }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page).toHaveTitle(/Login|Admin Dashboard/);
  });

  test("H2-001-002: Should validate empty credentials", async ({ page }) => {
    await page.click('button[type="submit"]');

    const emailError = page
      .locator('input[type="email"]')
      .evaluate((el) => el.getAttribute("aria-invalid"));
    expect(await emailError).toBe("true");
  });

  test("H2-001-003: Should validate invalid email format", async ({ page }) => {
    await page.fill('input[type="email"]', "invalid-email");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid email")).toBeVisible();
  });

  test("H2-001-004: Should login successfully with valid credentials", async ({
    page,
  }) => {
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard|\/admin/);
    await expect(page.locator("text=Dashboard|Welcome")).toBeVisible();
  });

  test("H2-001-005: Should show error for invalid credentials", async ({
    page,
  }) => {
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "WrongPassword");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=Invalid credentials|Authentication failed"),
    ).toBeVisible();
  });

  test("H2-001-006: Should redirect to dashboard after successful login", async ({
    page,
  }) => {
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard|\/admin/);
    await expect(page.locator("h1")).toContainText(/Dashboard|Admin/);
  });

  test("H2-001-007: Should logout successfully", async ({ page }) => {
    await page.goto("/dashboard");

    await page.click('button:has-text("Logout"), [aria-label="Logout"]');
    await expect(page).toHaveURL("/login");
  });

  test("H2-001-008: Should protect dashboard route without authentication", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
  });

  test("H2-001-009: Should show forgot password link", async ({ page }) => {
    await expect(page.locator('a:has-text("Forgot Password")')).toBeVisible();
  });

  test("H2-001-010: Should display password strength indicator", async ({
    page,
  }) => {
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill("weak");

    const strengthIndicator = page.locator('[data-testid="password-strength"]');
    await expect(strengthIndicator).toBeVisible();
  });
});
