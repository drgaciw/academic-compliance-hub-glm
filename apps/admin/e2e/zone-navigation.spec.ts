import { test, expect } from "@playwright/test";

test.describe("Zone Navigation Tests", () => {
  const ZONES = {
    MAIN: "http://localhost:3000",
    STUDENT: "http://localhost:3001",
    ADMIN: "http://localhost:3002",
  };

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("T2.6.1-001: Student can navigate from main app to student portal", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.click('a[href*="student.aah.vercel.app"], a[href*="/student"]');

    await expect(page).toHaveURL(/\/student/);
    await expect(page.locator("h1")).toContainText("Student");
  });

  test("T2.6.1-002: Advisor can navigate from main app to student portal", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "advisor@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.STUDENT}/student/dashboard`);

    await expect(page).toHaveURL(/\/student\/dashboard/);
    await expect(page.locator("text=Advisor Dashboard")).toBeVisible();
  });

  test("T2.6.1-003: Admin can navigate from main app to admin dashboard", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.ADMIN}/admin/users`);

    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator("text=Admin Dashboard")).toBeVisible();
  });

  test("T2.6.1-004: Navigation maintains session context across zones", async ({
    context,
  }) => {
    const page = await context.newPage();

    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "advisor@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    const cookiesAfterLogin = await context.cookies();

    await page.goto(`${ZONES.STUDENT}/student/profile`);

    const cookiesAfterNav1 = await context.cookies();

    expect(cookiesAfterNav1.length).toBe(cookiesAfterLogin.length);

    await page.goto(`${ZONES.ADMIN}/admin/analytics`);

    const cookiesAfterNav2 = await context.cookies();

    expect(cookiesAfterNav2.length).toBe(cookiesAfterLogin.length);
  });

  test("T2.6.1-005: Zone redirects work for protected routes", async ({
    page,
  }) => {
    await page.goto(`${ZONES.STUDENT}/student/transcripts`);

    await expect(page).toHaveURL(/\/sign-in/);

    const currentUrl = page.url();
    expect(currentUrl).toContain("redirect_url");
    expect(currentUrl).toContain("transcripts");
  });

  test("T2.6.1-006: Unauthorized access redirects correctly", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.ADMIN}/admin/settings`);

    await expect(page).toHaveURL(/\/unauthorized/);
    await expect(
      page.locator("text=You do not have permission to access this page"),
    ).toBeVisible();
  });

  test("T2.6.1-007: Public routes work across all zones", async ({ page }) => {
    await page.goto(`${ZONES.MAIN}/`);

    await expect(page).toHaveURL(/\//);
    await expect(page.locator("h1")).toBeVisible();

    await page.goto(`${ZONES.STUDENT}/`);

    await expect(page).toHaveURL(/\//);
    await expect(page.locator("h1")).toBeVisible();

    await page.goto(`${ZONES.ADMIN}/`);

    await expect(page).toHaveURL(/\//);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("T2.6.1-008: Navigation links use correct zone URLs", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    const studentLink = page.locator('a[href*="/student"]');
    const adminLink = page.locator('a[href*="/admin"]');

    await expect(studentLink).toBeVisible();
    await expect(adminLink).toBeVisible();

    const studentHref = await studentLink.getAttribute("href");
    const adminHref = await adminLink.getAttribute("href");

    expect(studentHref).toMatch(/student/);
    expect(adminHref).toMatch(/admin/);
  });

  test("T2.6.1-009: Browser back button works correctly across zones", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "advisor@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.STUDENT}/student/dashboard`);

    await page.waitForURL(/\/student\/dashboard/);

    await page.goBack();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("T2.6.1-010: Zone navigation preserves query parameters", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.STUDENT}/student/transcripts?status=pending`);

    await expect(page).toHaveURL(/status=pending/);

    await expect(page.locator("text=Pending")).toBeVisible();
  });
});
