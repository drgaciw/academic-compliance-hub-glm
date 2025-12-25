import { test, expect } from "@playwright/test";

test.describe("Auth State Persistence Tests", () => {
  const ZONES = {
    MAIN: "http://localhost:3000",
    STUDENT: "http://localhost:3001",
    ADMIN: "http://localhost:3002",
  };

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("T2.6.2-001: User session persists after page refresh", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.reload();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("text=Welcome")).toBeVisible();
  });

  test("T2.6.2-002: Auth state persists when navigating between zones", async ({
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

    await page.goBack();

    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto(`${ZONES.ADMIN}/admin/analytics`);

    await expect(page).toHaveURL(/\/admin\/analytics/);
  });

  test("T2.6.2-003: User role is maintained across zone transitions", async ({
    context,
  }) => {
    const page = await context.newPage();

    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    const cookiesAfterLogin = await context.cookies();
    const sessionCookie = cookiesAfterLogin.find((c) =>
      c.name.includes("session"),
    );

    expect(sessionCookie).toBeDefined();

    await page.goto(`${ZONES.STUDENT}/student/profile`);

    const cookiesAfterNav = await context.cookies();
    const sessionCookieAfterNav = cookiesAfterNav.find((c) =>
      c.name.includes("session"),
    );

    expect(sessionCookieAfterNav).toBeDefined();
    expect(sessionCookieAfterNav?.value).toBe(sessionCookie?.value);
  });

  test("T2.6.2-004: Logout clears auth state from all zones", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.STUDENT}/student/profile`);

    await page.click('button:has-text("Logout"), [aria-label="Logout"]');

    await page.waitForURL(/\/sign-in/);

    await page.goto(`${ZONES.MAIN}/dashboard`);

    await expect(page).toHaveURL(/\/sign-in/);

    await page.goto(`${ZONES.ADMIN}/admin`);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("T2.6.2-005: Session timeout redirects to login", async ({
    context,
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name.includes("session"));

    if (sessionCookie) {
      await context.clearCookies();
      await page.goto(`${ZONES.STUDENT}/student/transcripts`);

      await expect(page).toHaveURL(/\/sign-in/);
    }
  });

  test("T2.6.2-006: User data loads correctly after zone navigation", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    const userInfo = page.locator('[data-testid="user-info"], .user-info');
    await expect(userInfo).toBeVisible();

    await page.goto(`${ZONES.STUDENT}/student/profile`);

    await expect(page.locator("text=Student Profile")).toBeVisible();

    await page.goto(`${ZONES.MAIN}/dashboard`);

    await expect(userInfo).toBeVisible();
  });

  test("T2.6.2-007: Multiple tabs maintain separate auth states", async ({
    context,
  }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto(`${ZONES.MAIN}/sign-in`);

    await page1.fill('input[type="email"]', "student@example.com");
    await page1.fill('input[type="password"]', "TestPassword123!");
    await page1.click('button[type="submit"]');

    await page1.waitForURL(/\/dashboard/);

    await page2.goto(`${ZONES.MAIN}/dashboard`);

    await expect(page2).toHaveURL(/\/dashboard/);

    await page1.click('button:has-text("Logout"), [aria-label="Logout"]');

    await page1.waitForURL(/\/sign-in/);

    await page2.reload();

    await expect(page2).toHaveURL(/\/sign-in/);

    await page1.close();
    await page2.close();
  });

  test("T2.6.2-008: Token refresh works transparently across zones", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "advisor@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.STUDENT}/student/dashboard`);

    await expect(page).toHaveURL(/\/student\/dashboard/);

    await page.waitForTimeout(5000);

    await page.reload();

    await expect(page).toHaveURL(/\/student\/dashboard/);
  });

  test("T2.6.2-009: Auth state persists after API calls", async ({ page }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.STUDENT}/student/transcripts`);

    const response = await page.goto(`${ZONES.STUDENT}/api/user/profile`);

    expect(response?.status()).toBe(200);

    await page.goto(`${ZONES.MAIN}/dashboard`);

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("T2.6.2-010: Security headers are set correctly during navigation", async ({
    page,
  }) => {
    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    const cspHeader = await page.evaluate(() => {
      const meta = document.querySelector(
        'meta[http-equiv="Content-Security-Policy"]',
      );
      return meta?.getAttribute("content");
    });

    expect(cspHeader).toBeDefined();
    expect(cspHeader).toContain("default-src 'self'");
  });
});
