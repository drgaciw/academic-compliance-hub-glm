import { test, expect } from "@playwright/test";

test.describe("Transcript Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("H2-001-011: Should navigate to transcript upload page", async ({
    page,
  }) => {
    await page.click('a:has-text("Transcripts"), nav a[href*="transcript"]');

    await expect(page).toHaveURL(/\/transcripts|\/upload/);
    await expect(page.locator("h1")).toContainText(/Transcript|Upload/);
  });

  test("H2-001-012: Should display file upload component", async ({ page }) => {
    await page.goto("/transcripts/upload");

    const uploadArea = page.locator(
      '[data-testid="upload-area"], .upload-zone',
    );
    await expect(uploadArea).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });

  test("H2-001-013: Should validate file type restrictions", async ({
    page,
  }) => {
    await page.goto("/transcripts/upload");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("test content"),
    });

    await expect(page.locator("text=Invalid file type|PDF only")).toBeVisible();
  });

  test("H2-001-014: Should upload PDF transcript successfully", async ({
    page,
  }) => {
    await page.goto("/transcripts/upload");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "transcript.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 fake pdf"),
    });

    await expect(page.locator("text=Uploading|Processing")).toBeVisible();
    await page.waitForSelector("text=Upload successful|Transcript uploaded", {
      timeout: 5000,
    });
  });

  test("H2-001-015: Should show upload progress indicator", async ({
    page,
  }) => {
    await page.goto("/transcripts/upload");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "transcript.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 fake pdf"),
    });

    const progressBar = page.locator('[role="progressbar"], .progress-bar');
    await expect(progressBar).toBeVisible();
  });

  test("H2-001-016: Should handle large file upload", async ({ page }) => {
    await page.goto("/transcripts/upload");

    const largeBuffer = Buffer.alloc(10 * 1024 * 1024);
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "large-transcript.pdf",
      mimeType: "application/pdf",
      buffer: largeBuffer,
    });

    await page.waitForTimeout(2000);
    await expect(
      page.locator("text=File too large|Maximum size"),
    ).not.toBeVisible();
  });

  test("H2-001-017: Should display transcript preview after upload", async ({
    page,
  }) => {
    await page.goto("/transcripts/upload");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "transcript.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 fake pdf"),
    });

    await page.waitForSelector("text=Preview|Uploaded", { timeout: 5000 });
    await expect(
      page.locator('[data-testid="transcript-preview"]'),
    ).toBeVisible();
  });

  test("H2-001-018: Should allow multiple file upload", async ({ page }) => {
    await page.goto("/transcripts/upload");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: "transcript1.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 fake pdf 1"),
      },
      {
        name: "transcript2.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 fake pdf 2"),
      },
    ]);

    await page.waitForSelector("text=2 files uploaded", { timeout: 5000 });
  });

  test("H2-001-019: Should show error for corrupted file", async ({ page }) => {
    await page.goto("/transcripts/upload");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "corrupted.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("corrupted content"),
    });

    await expect(
      page.locator("text=Corrupted file|Unable to parse"),
    ).toBeVisible();
  });

  test("H2-001-020: Should allow drag and drop upload", async ({ page }) => {
    await page.goto("/transcripts/upload");

    const uploadArea = page.locator(
      '[data-testid="upload-area"], .upload-zone',
    );

    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await uploadArea.dispatchEvent("drop", { dataTransfer });

    const dropText = page.locator("text=Drop file here|Drag and drop");
    await expect(dropText).toBeVisible();
  });
});
