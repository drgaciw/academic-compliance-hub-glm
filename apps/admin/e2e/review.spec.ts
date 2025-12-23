import { test, expect } from "@playwright/test";

test.describe("Eligibility Review Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("H2-001-021: Should navigate to eligibility review page", async ({
    page,
  }) => {
    await page.click('a:has-text("Eligibility"), nav a[href*="eligibility"]');

    await expect(page).toHaveURL(/\/eligibility|\/review/);
    await expect(page.locator("h1")).toContainText(/Eligibility|Review/);
  });

  test("H2-001-022: Should display student list for review", async ({
    page,
  }) => {
    await page.goto("/eligibility/review");

    await expect(page.locator('[data-testid="student-list"]')).toBeVisible();
    const studentRows = page.locator('[data-testid^="student-row-"]');
    const count = await studentRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("H2-001-023: Should filter students by eligibility status", async ({
    page,
  }) => {
    await page.goto("/eligibility/review");

    await page.click(
      'button:has-text("Filter"), [data-testid="filter-button"]',
    );
    await page.click("text=Eligible");

    await page.waitForSelector('[data-testid="loading"]', { state: "hidden" });
    const statusCounts = await page.locator('[data-status="eligible"]').count();
    expect(statusCounts).toBeGreaterThan(0);
  });

  test("H2-001-024: Should display student eligibility details", async ({
    page,
  }) => {
    await page.goto("/eligibility/review");

    await page.click('[data-testid="student-row-0"]');

    await expect(page).toHaveURL(/\/eligibility\/student\/.+/);
    await expect(page.locator('[data-testid="student-details"]')).toBeVisible();
    await expect(
      page.locator("text=GPA|Credits|Academic Standing"),
    ).toBeVisible();
  });

  test("H2-001-025: Should show academic progress metrics", async ({
    page,
  }) => {
    await page.goto("/eligibility/student/12345");

    await expect(page.locator('[data-testid="gpa-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="credits-display"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="academic-standing"]'),
    ).toBeVisible();
  });

  test("H2-001-026: Should display course requirements status", async ({
    page,
  }) => {
    await page.goto("/eligibility/student/12345");

    await expect(
      page.locator('[data-testid="requirements-list"]'),
    ).toBeVisible();
    const requirements = page.locator('[data-testid^="requirement-"]');
    const count = await requirements.count();
    expect(count).toBeGreaterThan(0);
  });

  test("H2-001-027: Should allow eligibility status change", async ({
    page,
  }) => {
    await page.goto("/eligibility/student/12345");

    const statusSelect = page.locator('[data-testid="eligibility-status"]');
    await statusSelect.selectOption("ELIGIBLE");

    await page.click('button:has-text("Save"), [data-testid="save-button"]');

    await expect(page.locator("text=Saved|Updated")).toBeVisible();
  });

  test("H2-001-028: Should show notes/comments section", async ({ page }) => {
    await page.goto("/eligibility/student/12345");

    await expect(page.locator('[data-testid="notes-section"]')).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("H2-001-029: Should save notes successfully", async ({ page }) => {
    await page.goto("/eligibility/student/12345");

    const notesTextarea = page.locator('[data-testid="notes-textarea"]');
    await notesTextarea.fill("Student meets all eligibility requirements.");

    await page.click('button:has-text("Save Note")');

    await expect(page.locator("text=Note saved")).toBeVisible();
  });

  test("H2-001-030: Should navigate between students", async ({ page }) => {
    await page.goto("/eligibility/student/12345");

    await page.click('button:has-text("Next"), [data-testid="next-student"]');

    await expect(page).toHaveURL(/\/eligibility\/student\/(?!12345).+/);
  });

  test("H2-001-031: Should display eligibility history", async ({ page }) => {
    await page.goto("/eligibility/student/12345");

    await page.click('[data-testid="history-tab"]');

    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
  });

  test("H2-001-032: Should show warnings for at-risk students", async ({
    page,
  }) => {
    await page.goto("/eligibility/review?status=at-risk");

    const warningBanners = page.locator('[data-testid="warning-banner"]');
    const count = await warningBanners.count();
    expect(count).toBeGreaterThan(0);
  });

  test("H2-001-033: Should export eligibility report", async ({ page }) => {
    await page.goto("/eligibility/review");

    const downloadPromise = page.waitForEvent("download");
    await page.click(
      'button:has-text("Export"), [data-testid="export-button"]',
    );
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/eligibility|report/);
  });

  test("H2-001-034: Should search students by name or ID", async ({ page }) => {
    await page.goto("/eligibility/review");

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill("John Doe");

    await page.press(searchInput, "Enter");
    await page.waitForSelector('[data-testid="loading"]', { state: "hidden" });

    const results = page.locator('[data-testid^="student-row-"]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test("H2-001-035: Should display compliance indicators", async ({ page }) => {
    await page.goto("/eligibility/student/12345");

    await expect(
      page.locator('[data-testid="compliance-indicator"]'),
    ).toBeVisible();
    const indicator = page.locator('[data-testid="compliance-status"]');
    await expect(indicator).toContainText(/Compliant|Non-compliant|Pending/);
  });
});
