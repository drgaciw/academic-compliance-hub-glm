import { test, expect } from "@playwright/test";

test.describe("Report Generation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("H2-001-036: Should navigate to reports page", async ({ page }) => {
    await page.click('a:has-text("Reports"), nav a[href*="report"]');

    await expect(page).toHaveURL(/\/reports/);
    await expect(page.locator("h1")).toContainText(/Reports/);
  });

  test("H2-001-037: Should display available report types", async ({
    page,
  }) => {
    await page.goto("/reports");

    const reportCards = page.locator('[data-testid^="report-card-"]');
    const count = await reportCards.count();
    expect(count).toBeGreaterThan(0);

    await expect(
      page.locator("text=Eligibility|Transfer|Compliance"),
    ).toBeVisible();
  });

  test("H2-001-038: Should create eligibility report", async ({ page }) => {
    await page.goto("/reports");

    await page.click(
      'button:has-text("Eligibility Report"), [data-testid="report-eligibility"]',
    );

    await expect(page).toHaveURL(/\/reports\/create|\/eligibility-report/);

    await page.click(
      'button:has-text("Generate"), [data-testid="generate-button"]',
    );

    await expect(page.locator("text=Generating|Processing")).toBeVisible();
    await page.waitForSelector("text=Report generated|Download", {
      timeout: 10000,
    });
  });

  test("H2-001-039: Should configure report parameters", async ({ page }) => {
    await page.goto("/reports/create");

    await page.selectOption('[data-testid="report-type"]', "ELIGIBILITY");
    await page.fill('[data-testid="date-range-start"]', "2024-01-01");
    await page.fill('[data-testid="date-range-end"]', "2024-12-31");
    await page.selectOption('[data-testid="sport-filter"]', "FOOTBALL");

    await page.click('button:has-text("Generate")');

    await expect(page.locator("text=Processing")).toBeVisible();
  });

  test("H2-001-040: Should display report preview", async ({ page }) => {
    await page.goto("/reports/preview/123");

    await expect(page.locator('[data-testid="report-preview"]')).toBeVisible();
    await expect(page.locator("text=Summary|Details|Charts")).toBeVisible();
  });

  test("H2-001-041: Should download report as PDF", async ({ page }) => {
    await page.goto("/reports/preview/123");

    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Download PDF")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test("H2-001-042: Should download report as Excel", async ({ page }) => {
    await page.goto("/reports/preview/123");

    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Download Excel")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls)$/);
  });

  test("H2-001-043: Should display report statistics", async ({ page }) => {
    await page.goto("/reports/preview/123");

    await expect(
      page.locator('[data-testid="statistics-section"]'),
    ).toBeVisible();
    await expect(
      page.locator("text=Total Students|Eligible|Ineligible"),
    ).toBeVisible();
  });

  test("H2-001-044: Should show data visualization charts", async ({
    page,
  }) => {
    await page.goto("/reports/preview/123");

    await expect(page.locator('[data-testid="charts-section"]')).toBeVisible();
    const charts = page.locator('canvas, [data-testid^="chart-"]');
    const count = await charts.count();
    expect(count).toBeGreaterThan(0);
  });

  test("H2-001-045: Should schedule report generation", async ({ page }) => {
    await page.goto("/reports/create");

    await page.click('[data-testid="schedule-tab"]');

    await page.fill(
      '[data-testid="schedule-name"]',
      "Weekly Eligibility Report",
    );
    await page.selectOption('[data-testid="schedule-frequency"]', "weekly");
    await page.fill('[data-testid="schedule-date"]', "2024-12-30");

    await page.click('button:has-text("Schedule")');

    await expect(page.locator("text=Report scheduled")).toBeVisible();
  });

  test("H2-001-046: Should view scheduled reports", async ({ page }) => {
    await page.goto("/reports/scheduled");

    await expect(
      page.locator('[data-testid="scheduled-reports-list"]'),
    ).toBeVisible();
    const scheduledReports = page.locator('[data-testid^="scheduled-report-"]');
    const count = await scheduledReports.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("H2-001-047: Should delete scheduled report", async ({ page }) => {
    await page.goto("/reports/scheduled");

    const firstReport = page
      .locator('[data-testid^="scheduled-report-"]')
      .first();
    if ((await firstReport.count()) > 0) {
      await firstReport.hover();
      await page.click('[data-testid="delete-report"]');

      await page.click(
        'button:has-text("Confirm"), [data-testid="confirm-delete"]',
      );

      await expect(page.locator("text=Deleted|Cancelled")).toBeVisible();
    }
  });

  test("H2-001-048: Should view report history", async ({ page }) => {
    await page.goto("/reports/history");

    await expect(
      page.locator('[data-testid="report-history-list"]'),
    ).toBeVisible();
    const historyItems = page.locator('[data-testid^="history-item-"]');
    const count = await historyItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("H2-001-049: Should filter report history by date", async ({ page }) => {
    await page.goto("/reports/history");

    await page.fill('[data-testid="date-filter"]', "2024-12");
    await page.click('button:has-text("Filter")');

    await page.waitForSelector('[data-testid="loading"]', { state: "hidden" });
    const filteredItems = page.locator('[data-testid^="history-item-"]');
    expect(await filteredItems.count()).toBeGreaterThan(0);
  });

  test("H2-001-050: Should share report via email", async ({ page }) => {
    await page.goto("/reports/preview/123");

    await page.click('button:has-text("Share"), [data-testid="share-button"]');

    await page.fill('[data-testid="email-input"]', "recipient@example.com");
    await page.fill(
      '[data-testid="message-input"]',
      "Please review this report",
    );

    await page.click('button:has-text("Send")');

    await expect(page.locator("text=Sent|Email sent")).toBeVisible();
  });

  test("H2-001-051: Should display error for invalid report parameters", async ({
    page,
  }) => {
    await page.goto("/reports/create");

    await page.click('button:has-text("Generate")');

    await expect(
      page.locator("text=Required|Invalid parameters"),
    ).toBeVisible();
  });

  test("H2-001-052: Should cancel report generation", async ({ page }) => {
    await page.goto("/reports/create");

    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("Cancel")');

    await expect(page.locator("text=Cancelled")).toBeVisible();
  });
});
