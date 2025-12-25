import { test, expect } from "@playwright/test";

test.describe("Cookie Persistence Across Zones", () => {
  const ZONES = {
    MAIN: "http://localhost:3000",
    STUDENT: "http://localhost:3001",
    ADMIN: "http://localhost:3002",
  };

  test("T2.4.3-001: Session cookie persists when navigating from main to student portal", async ({
    context,
  }) => {
    await context.clearCookies();
    const page = await context.newPage();

    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name.includes("session"));

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.domain).toMatch(/\.(localhost|yourdomain\.com)$/);
    expect(sessionCookie?.sameSite).toBe("lax");
  });

  test("T2.4.3-002: Session cookie persists when navigating from student to admin (for advisors)", async ({
    context,
  }) => {
    await context.clearCookies();
    const page = await context.newPage();

    await page.goto(`${ZONES.STUDENT}/sign-in`);

    await page.fill('input[type="email"]', "advisor@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/student\/dashboard/);

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name.includes("session"));

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.secure).toBe(false);
  });

  test("T2.4.3-003: Cookie domain allows sharing across all microsites", async ({
    context,
  }) => {
    await context.clearCookies();
    const page = await context.newPage();

    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]", "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    const cookies = await context.cookies();
    const authCookies = cookies.filter((c) =>
      c.name.includes("__session") || c.name.includes("clerk"),
    );

    expect(authCookies.length).toBeGreaterThan(0);

    authCookies.forEach((cookie) => {
      expect(cookie.domain).toMatch(/^\.(localhost|vercel\.app)$/);
      expect(cookie.path).toBe("/");
      expect(cookie.sameSite).toBe("lax");
    });
  });

  test("T2.4.3-004: Session remains valid when switching zones without re-authentication", async ({
    context,
  }) => {
    await context.clearCookies();
    const page = await context.newPage();

    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "advisor@example.com");
    await page.fill('input[type="password"]", "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.STUDENT}/student/dashboard`);

    await expect(page).toHaveURL(/\/student\/dashboard/);
    await expect(page.locator("text=Advisor Dashboard")).toBeVisible();

    await page.goto(`${ZONES.ADMIN}/admin/users`);

    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test("T2.4.3-005: Cookie security attributes are correctly set in production", async ({
    context,
  }) => {
    await context.clearCookies();
    const page = await context.newPage();

    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name.includes("session"));

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.sameSite).toBe("lax");

    if (process.env.NODE_ENV === "production") {
      expect(sessionCookie?.secure).toBe(true);
    }
  });

  test("T2.4.3-006: Clearing session from one zone affects all zones", async ({
    context,
  }) => {
    await context.clearCookies();
    const page = await context.newPage();

    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.STUDENT}/student/profile`);

    await page.click('button:has-text("Logout")');

    await page.waitForURL(/\/sign-in/);

    await page.goto(`${ZONES.MAIN}/dashboard`);

    await expect(page).toHaveURL(/\/sign-in/);

    await page.goto(`${ZONES.ADMIN}/admin`);

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("T2.4.3-007: Role-based access maintained across zones", async ({
    context,
  }) => {
    await context.clearCookies();
    const page = await context.newPage();

    await page.goto(`${ZONES.MAIN}/sign-in`);

    await page.fill('input[type="email"]', "student@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);

    await page.goto(`${ZONES.ADMIN}/admin/users`);

    await expect(page).toHaveURL(/\/unauthorized/);

    await page.goto(`${ZONES.STUDENT}/student/transcripts`);

    await expect(page).toHaveURL(/\/student\/transcripts/);
    await expect(page.locator("text=Transcripts")).toBeVisible();
  });

  test("T2.4.3-008: Multiple sessions across different browsers are isolated", async ({
    browser,
  }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto(`${ZONES.MAIN}/sign-in`);
    await page1.fill('input[type="email"]', "student@example.com");
    await page1.fill('input[type="password"]', "TestPassword123!");
    await page1.click('button[type="submit"]');
    await page1.waitForURL(/\/dashboard/);

    await page2.goto(`${ZONES.MAIN}/dashboard`);

    await expect(page2).toHaveURL(/\/sign-in/);

    const cookies1 = await context1.cookies();
    const cookies2 = await context2.cookies();

    expect(cookies1.length).toBeGreaterThan(cookies2.length);

    await context1.close();
    await context2.close();
  });
});
