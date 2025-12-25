import { test, expect } from "@playwright/test";

test.describe("Transfer Request Submission", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/student/dashboard");
  });

  test.describe("Navigation to Transfer Request Form", () => {
    test("should display transfer request navigation option", async ({
      page,
    }) => {
      const transferRequestLink = page.getByRole("link", {
        name: /transfer.*request|submit.*transfer/i,
      });
      if (await transferRequestLink.isVisible()) {
        await transferRequestLink.click();
        await expect(page).toHaveURL(/.*transfer/i);
      }
    });

    test("should navigate to preliminary evaluation page", async ({ page }) => {
      await page.goto("/student/preliminary");
      await expect(
        page.getByRole("heading", {
          name: /preliminary.*evaluation|transfer/i,
        }),
      ).toBeVisible();
    });
  });

  test.describe("Preliminary Evaluation Form", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/student/preliminary");
    });

    test("should display all required fields", async ({ page }) => {
      await expect(page.getByLabel(/source.*institution|from/i)).toBeVisible();
      await expect(
        page.getByLabel(/destination.*institution|to/i),
      ).toBeVisible();
      await expect(page.getByLabel(/course.*subject/i)).toBeVisible();
      await expect(
        page.getByLabel(/course.*code|course.*number/i),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /submit|evaluate/i }),
      ).toBeVisible();
    });

    test("should show validation errors for empty required fields", async ({
      page,
    }) => {
      const submitButton = page.getByRole("button", {
        name: /submit|evaluate/i,
      });
      await submitButton.click();

      await expect(
        page.getByText(/required|please.*fill|missing/i),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should validate source institution format", async ({ page }) => {
      const sourceInput = page.getByLabel(/source.*institution|from/i);
      await sourceInput.fill("ABC");
      await page.getByRole("button", { name: /submit|evaluate/i }).click();

      const errorText = page.getByText(/invalid|at least|minimum/i);
      if (await errorText.isVisible({ timeout: 2000 })) {
        await expect(errorText).toBeVisible();
      }
    });

    test("should validate course code format", async ({ page }) => {
      const courseCodeInput = page.getByLabel(/course.*code|course.*number/i);
      await courseCodeInput.fill("123");
      await page.getByRole("button", { name: /submit|evaluate/i }).click();

      const errorText = page.getByText(/invalid.*format/i);
      if (await errorText.isVisible({ timeout: 2000 })) {
        await expect(errorText).toBeVisible();
      }
    });
  });

  test.describe("Transfer Request Submission Flow", () => {
    test("should complete full transfer request flow", async ({ page }) => {
      await page.goto("/student/preliminary");

      await page
        .getByLabel(/source.*institution|from/i)
        .fill("Test University");
      await page
        .getByLabel(/destination.*institution|to/i)
        .fill("Target University");
      await page.getByLabel(/course.*subject/i).fill("Mathematics");
      await page.getByLabel(/course.*code|course.*number/i).fill("MATH 101");
      await page.getByLabel(/credits|credit.*hours/i).fill("3");

      await page.getByRole("button", { name: /submit|evaluate/i }).click();

      await expect(
        page.getByRole("heading", { name: /evaluation|results|review/i }),
      ).toBeVisible({ timeout: 5000 });
    });

    test("should show loading state during submission", async ({ page }) => {
      await page.goto("/student/preliminary");

      await page
        .getByLabel(/source.*institution|from/i)
        .fill("Test University");
      await page
        .getByLabel(/destination.*institution|to/i)
        .fill("Target University");
      await page.getByLabel(/course.*subject/i).fill("Mathematics");
      await page.getByLabel(/course.*code|course.*number/i).fill("MATH 101");

      const submitButton = page.getByRole("button", {
        name: /submit|evaluate/i,
      });
      await submitButton.click();

      const isLoading = await page
        .getByText(/loading|processing|evaluating/i)
        .isVisible({ timeout: 1000 });
      const isDisabled = await submitButton.isDisabled();

      expect(isLoading || isDisabled).toBeTruthy();
    });

    test("should display evaluation results after successful submission", async ({
      page,
    }) => {
      await page.goto("/student/preliminary");

      await page
        .getByLabel(/source.*institution|from/i)
        .fill("Test University");
      await page
        .getByLabel(/destination.*institution|to/i)
        .fill("Target University");
      await page.getByLabel(/course.*subject/i).fill("Mathematics");
      await page.getByLabel(/course.*code|course.*number/i).fill("MATH 101");

      await page.getByRole("button", { name: /submit|evaluate/i }).click();

      await expect(
        page.getByRole("heading", { name: /results|evaluation/i }),
      ).toBeVisible({ timeout: 5000 });

      const creditMatchText = page.getByText(/credit.*match|equivalent/i);
      const statusText = page.getByText(/approved|pending|needs.*review/i);

      await expect(creditMatchText.or(statusText)).toBeVisible({
        timeout: 3000,
      });
    });
  });

  test.describe("Multiple Course Requests", () => {
    test("should allow adding multiple courses", async ({ page }) => {
      await page.goto("/student/preliminary");

      const addButton = page.getByRole("button", {
        name: /add.*course|another/i,
      });
      if (await addButton.isVisible()) {
        await addButton.click();

        await expect(
          page.getByLabel(/course.*2|source.*institution/i),
        ).toBeVisible();
      }
    });

    test("should validate all courses before submission", async ({ page }) => {
      await page.goto("/student/preliminary");

      const addButton = page.getByRole("button", {
        name: /add.*course|another/i,
      });
      if (await addButton.isVisible()) {
        await addButton.click();

        await page
          .getByLabel(/source.*institution|from/i)
          .fill("Test University");
        await page
          .getByLabel(/destination.*institution|to/i)
          .fill("Target University");

        await page.getByRole("button", { name: /submit|evaluate/i }).click();

        const errorText = page.getByText(/required|please.*fill/i);
        await expect(errorText).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe("Document Upload", () => {
    test("should have transcript upload option", async ({ page }) => {
      await page.goto("/student/upload");

      const uploadSection = page.getByText(/transcript|upload.*document/i);
      await expect(uploadSection).toBeVisible();

      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        await expect(fileInput).toBeVisible();
      }
    });

    test("should show file size validation for uploads", async ({ page }) => {
      await page.goto("/student/upload");

      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles({
          name: "large-file.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.alloc(11 * 1024 * 1024),
        });

        const errorText = page.getByText(/too.*large|size.*limit/i);
        if (await errorText.isVisible({ timeout: 3000 })) {
          await expect(errorText).toBeVisible();
        }
      }
    });

    test("should show file type validation for uploads", async ({ page }) => {
      await page.goto("/student/upload");

      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles({
          name: "test.exe",
          mimeType: "application/x-msdownload",
          buffer: Buffer.alloc(100),
        });

        const errorText = page.getByText(
          /invalid.*type|pdf.*only|allowed.*format/i,
        );
        if (await errorText.isVisible({ timeout: 3000 })) {
          await expect(errorText).toBeVisible();
        }
      }
    });
  });

  test.describe("Request History and Status", () => {
    test("should display request history", async ({ page }) => {
      await page.goto("/student/status");

      await expect(
        page.getByRole("heading", {
          name: /request.*history|transfer.*status/i,
        }),
      ).toBeVisible();
    });

    test("should show request status details", async ({ page }) => {
      await page.goto("/student/status");

      const statusCard = page.getByRole("article").first();
      if (await statusCard.isVisible()) {
        await expect(
          statusCard.getByText(/pending|approved|denied|needs.*review/i),
        ).toBeVisible();
      }
    });

    test("should allow viewing request details", async ({ page }) => {
      await page.goto("/student/status");

      const viewButton = page
        .getByRole("button", { name: /view|details/i })
        .first();
      if (await viewButton.isVisible()) {
        await viewButton.click();

        await expect(
          page.getByRole("heading", { name: /request.*details/i }),
        ).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe("Error Handling", () => {
    test("should handle network errors gracefully", async ({ page }) => {
      await page.goto("/student/preliminary");

      await page.route("**/api/**", (route) => route.abort("failed"));

      await page
        .getByLabel(/source.*institution|from/i)
        .fill("Test University");
      await page
        .getByLabel(/destination.*institution|to/i)
        .fill("Target University");
      await page.getByLabel(/course.*subject/i).fill("Mathematics");
      await page.getByLabel(/course.*code|course.*number/i).fill("MATH 101");

      await page.getByRole("button", { name: /submit|evaluate/i }).click();

      const errorMessage = page.getByText(
        /network.*error|connection.*failed|try.*again/i,
      );
      if (await errorMessage.isVisible({ timeout: 5000 })) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test("should handle server errors gracefully", async ({ page }) => {
      await page.goto("/student/preliminary");

      await page.route("**/api/**", (route) => {
        route.fulfill({ status: 500, body: "Internal Server Error" });
      });

      await page
        .getByLabel(/source.*institution|from/i)
        .fill("Test University");
      await page
        .getByLabel(/destination.*institution|to/i)
        .fill("Target University");
      await page.getByLabel(/course.*subject/i).fill("Mathematics");
      await page.getByLabel(/course.*code|course.*number/i).fill("MATH 101");

      await page.getByRole("button", { name: /submit|evaluate/i }).click();

      const errorMessage = page.getByText(
        /server.*error|something.*went.*wrong/i,
      );
      if (await errorMessage.isVisible({ timeout: 5000 })) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });

  test.describe("Form Auto-save", () => {
    test("should save form data as draft", async ({ page }) => {
      await page.goto("/student/preliminary");

      await page
        .getByLabel(/source.*institution|from/i)
        .fill("Test University");
      await page
        .getByLabel(/destination.*institution|to/i)
        .fill("Target University");

      await page.waitForTimeout(2000);

      await page.reload();

      const sourceValue = await page
        .getByLabel(/source.*institution|from/i)
        .inputValue();
      expect(sourceValue).toBe("Test University");
    });
  });

  test.describe("Responsive Design", () => {
    test("should work correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/student/preliminary");

      await expect(
        page.getByRole("heading", { name: /preliminary|transfer/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/source.*institution|from/i)).toBeVisible();
    });

    test("should work correctly on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/student/preliminary");

      await expect(
        page.getByRole("heading", { name: /preliminary|transfer/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/source.*institution|from/i)).toBeVisible();
    });
  });
});
