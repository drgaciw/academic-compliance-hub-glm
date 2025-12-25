import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests - Main Site", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const count = await headings.count();

    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      await expect(heading).toBeVisible();
    }
  });

  test("should have alt text for all images", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute("alt");

      if (
        !(await image.getAttribute("role"))?.includes("presentation") &&
        !(await image.getAttribute("aria-hidden"))
      ) {
        expect(altText).toBeTruthy();
      }
    }
  });

  test("should have proper ARIA labels on form inputs", async ({ page }) => {
    const formInputs = page.locator("input, select, textarea");
    const count = await formInputs.count();

    for (let i = 0; i < count; i++) {
      const input = formInputs.nth(i);
      const hasLabel =
        (await input.getAttribute("aria-label")) ||
        (await input.getAttribute("aria-labelledby")) ||
        (await input.getAttribute("id"));

      if (!hasLabel) {
        const hasForLabel = await page.evaluate(
          (input) => {
            const id = input.getAttribute("id");
            return !!document.querySelector(`label[for="${id}"]`);
          },
          await input.elementHandle(),
        );

        const hasParentLabel = await page.evaluate(
          (input) => {
            return !!input.closest("label");
          },
          await input.elementHandle(),
        );

        expect(hasForLabel || hasParentLabel).toBeTruthy();
      }
    }
  });

  test("should have proper link text", async ({ page }) => {
    const links = page.locator("a[href]");
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute("aria-label");

      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test("should have sufficient color contrast", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "color-contrast",
    );

    expect(contrastViolations).toEqual([]);
  });

  test("should have proper focus management", async ({ page }) => {
    const interactiveElements = page.locator(
      "button, a[href], input, select, textarea, [tabindex]",
    );
    const count = await interactiveElements.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = interactiveElements.nth(i);
      await element.focus();
      const isFocused = await element.evaluate((el: any) => {
        return document.activeElement === el;
      });
      expect(isFocused).toBeTruthy();
    }
  });

  test("should have proper skip links", async ({ page }) => {
    const skipLink = page.locator("a[href^='#']").filter({ hasText: /skip/i });
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
  });

  test("should have proper language attribute", async ({ page }) => {
    const html = page.locator("html");
    const lang = await html.getAttribute("lang");
    expect(lang).toBeTruthy();
  });
});

test.describe("Accessibility Tests - Student Portal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/student");
  });

  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const count = await headings.count();

    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      await expect(heading).toBeVisible();
    }
  });

  test("should have alt text for all images", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute("alt");

      if (
        !(await image.getAttribute("role"))?.includes("presentation") &&
        !(await image.getAttribute("aria-hidden"))
      ) {
        expect(altText).toBeTruthy();
      }
    }
  });

  test("should have proper ARIA labels on form inputs", async ({ page }) => {
    await page.goto("/student/preliminary");

    const formInputs = page.locator("input, select, textarea");
    const count = await formInputs.count();

    for (let i = 0; i < count; i++) {
      const input = formInputs.nth(i);
      const hasLabel =
        (await input.getAttribute("aria-label")) ||
        (await input.getAttribute("aria-labelledby")) ||
        (await input.getAttribute("id"));

      if (!hasLabel) {
        const hasForLabel = await page.evaluate(
          (input) => {
            const id = input.getAttribute("id");
            return !!document.querySelector(`label[for="${id}"]`);
          },
          await input.elementHandle(),
        );

        const hasParentLabel = await page.evaluate(
          (input) => {
            return !!input.closest("label");
          },
          await input.elementHandle(),
        );

        expect(hasForLabel || hasParentLabel).toBeTruthy();
      }
    }
  });

  test("should have sufficient color contrast", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "color-contrast",
    );

    expect(contrastViolations).toEqual([]);
  });
});

test.describe("Accessibility Tests - Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
  });

  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const count = await headings.count();

    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      await expect(heading).toBeVisible();
    }
  });

  test("should have alt text for all images", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute("alt");

      if (
        !(await image.getAttribute("role"))?.includes("presentation") &&
        !(await image.getAttribute("aria-hidden"))
      ) {
        expect(altText).toBeTruthy();
      }
    }
  });

  test("should have proper ARIA labels on form inputs", async ({ page }) => {
    await page.goto("/admin/users");

    const formInputs = page.locator("input, select, textarea");
    const count = await formInputs.count();

    for (let i = 0; i < count; i++) {
      const input = formInputs.nth(i);
      const hasLabel =
        (await input.getAttribute("aria-label")) ||
        (await input.getAttribute("aria-labelledby")) ||
        (await input.getAttribute("id"));

      if (!hasLabel) {
        const hasForLabel = await page.evaluate(
          (input) => {
            const id = input.getAttribute("id");
            return !!document.querySelector(`label[for="${id}"]`);
          },
          await input.elementHandle(),
        );

        const hasParentLabel = await page.evaluate(
          (input) => {
            return !!input.closest("label");
          },
          await input.elementHandle(),
        );

        expect(hasForLabel || hasParentLabel).toBeTruthy();
      }
    }
  });

  test("should have proper table accessibility", async ({ page }) => {
    await page.goto("/admin/users");

    const tables = page.locator("table");
    const count = await tables.count();

    for (let i = 0; i < count; i++) {
      const table = tables.nth(i);
      const hasCaption = (await table.locator("caption").count()) > 0;
      const hasHeaders = (await table.locator("th").count()) > 0;

      expect(hasHeaders).toBeTruthy();
    }
  });

  test("should have sufficient color contrast", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === "color-contrast",
    );

    expect(contrastViolations).toEqual([]);
  });
});

test.describe("Accessibility Tests - Forms", () => {
  test("should have error messages with proper ARIA attributes on login form", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForTimeout(1000);

    const errorMessages = page.locator('[role="alert"], [aria-live]');
    const count = await errorMessages.count();

    if (count > 0) {
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test("should have proper form validation feedback", async ({ page }) => {
    await page.goto("/student/preliminary");
    await page.getByRole("button", { name: /submit|evaluate/i }).click();

    await page.waitForTimeout(1000);

    const errorMessages = page.getByText(/required|please.*fill/i);
    const count = await errorMessages.count();

    expect(count).toBeGreaterThan(0);
  });

  test("should have required field indicators", async ({ page }) => {
    await page.goto("/student/preliminary");

    const requiredFields = page.locator('[required], [aria-required="true"]');
    const count = await requiredFields.count();

    if (count > 0) {
      await expect(requiredFields.first()).toBeVisible();
    }
  });
});

test.describe("Accessibility Tests - Dynamic Content", () => {
  test("should announce dynamic content changes", async ({ page }) => {
    await page.goto("/student/preliminary");

    await page.getByLabel(/source.*institution|from/i).fill("Test University");
    await page
      .getByLabel(/destination.*institution|to/i)
      .fill("Target University");
    await page.getByLabel(/course.*subject/i).fill("Mathematics");
    await page.getByLabel(/course.*code|course.*number/i).fill("MATH 101");

    await page.getByRole("button", { name: /submit|evaluate/i }).click();

    await page.waitForTimeout(2000);

    const liveRegions = page.locator('[aria-live], [role="status"]');
    const count = await liveRegions.count();

    if (count > 0) {
      await expect(liveRegions.first()).toBeVisible();
    }
  });

  test("should have proper modal accessibility", async ({ page }) => {
    await page.goto("/admin/users");

    const deleteButton = page
      .getByRole("button", { name: /delete|deactivate/i })
      .first();

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      await page.waitForTimeout(500);

      const modal = page
        .getByRole("dialog")
        .or(page.locator('[role="alertdialog"]'));

      const modalCount = await modal.count();

      if (modalCount > 0) {
        await expect(modal.first()).toBeVisible();

        const hasCloseButton = await modal
          .getByRole("button", { name: /close|x/i })
          .count();

        const hasCancelButton = await modal
          .getByRole("button", { name: /cancel/i })
          .count();

        expect(hasCloseButton + hasCancelButton).toBeGreaterThan(0);
      }
    }
  });
});

test.describe("Accessibility Tests - Keyboard Navigation", () => {
  test("should be fully keyboard navigable on main site", async ({ page }) => {
    await page.goto("/");

    const focusableElements = page.locator(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const count = await focusableElements.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      await page.keyboard.press("Tab");
      const activeElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      expect(
        ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(
          activeElement || "",
        ),
      ).toBeTruthy();
    }
  });

  test("should have visible focus indicators", async ({ page }) => {
    await page.goto("/");

    const focusableElements = page.locator(
      "button, a[href], input, select, textarea",
    );
    const firstElement = focusableElements.first();

    await firstElement.focus();

    const hasFocusIndicator = await firstElement.evaluate((el: any) => {
      const styles = window.getComputedStyle(el);
      return (
        styles.outline !== "none" ||
        styles.boxShadow !== "none" ||
        styles.border !== "none"
      );
    });

    expect(hasFocusIndicator).toBeTruthy();
  });
});
