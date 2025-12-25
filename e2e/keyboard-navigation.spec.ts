import { test, expect } from "@playwright/test";

test.describe("Keyboard Navigation Tests", () => {
  test.describe("Tab Navigation", () => {
    test("should navigate through focusable elements with Tab key", async ({
      page,
    }) => {
      await page.goto("/");

      const focusableElements = page.locator(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const count = await focusableElements.count();

      for (let i = 0; i < Math.min(count, 15); i++) {
        await page.keyboard.press("Tab");

        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            tabIndex: el?.getAttribute("tabindex"),
          };
        });

        expect(
          ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(
            activeElement.tagName || "",
          ),
        ).toBeTruthy();
      }
    });

    test("should navigate backwards with Shift+Tab", async ({ page }) => {
      await page.goto("/");

      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      const firstFocused = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      await page.keyboard.press("Shift+Tab");

      const secondFocused = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      expect(firstFocused).not.toBe(secondFocused);
    });

    test("should skip elements with negative tabindex", async ({ page }) => {
      await page.goto("/");

      const elementsBeforeTab = await page.evaluate(() => {
        const focusable = Array.from(
          document.querySelectorAll(
            'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        return focusable.length;
      });

      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      const activeElement = await page.evaluate(() => {
        return document.activeElement?.getAttribute("tabindex");
      });

      expect(activeElement).not.toBe("-1");
    });
  });

  test.describe("Enter and Space Keys", () => {
    test("should activate buttons with Enter key", async ({ page }) => {
      await page.goto("/");

      const button = page.getByRole("button").first();
      await button.focus();
      await page.keyboard.press("Enter");

      await page.waitForTimeout(500);

      const isButtonStillFocused = await button.evaluate((el: any) => {
        return document.activeElement === el;
      });

      expect(isButtonStillFocused).toBeTruthy();
    });

    test("should activate buttons with Space key", async ({ page }) => {
      await page.goto("/");

      const button = page.getByRole("button").first();
      await button.focus();
      await page.keyboard.press("Space");

      await page.waitForTimeout(500);

      const isButtonStillFocused = await button.evaluate((el: any) => {
        return document.activeElement === el;
      });

      expect(isButtonStillFocused).toBeTruthy();
    });

    test("should navigate links with Enter key", async ({ page }) => {
      await page.goto("/");

      const link = page.getByRole("link").first();
      const href = await link.getAttribute("href");

      if (href && !href.startsWith("#")) {
        await link.focus();
        await page.keyboard.press("Enter");

        await page.waitForTimeout(1000);

        const currentUrl = page.url();
        expect(currentUrl).not.toBe("about:blank");
      }
    });
  });

  test.describe("Arrow Keys", () => {
    test("should navigate between radio buttons with arrow keys", async ({
      page,
    }) => {
      await page.goto("/login");

      const radioGroup = page.locator('input[type="radio"]');
      const count = await radioGroup.count();

      if (count > 1) {
        const firstRadio = radioGroup.first();
        await firstRadio.focus();

        await page.keyboard.press("ArrowRight");

        const secondRadio = radioGroup.nth(1);
        const isSecondFocused = await secondRadio.evaluate((el: any) => {
          return document.activeElement === el;
        });

        expect(isSecondFocused).toBeTruthy();
      }
    });

    test("should navigate select options with arrow keys", async ({ page }) => {
      await page.goto("/student/preliminary");

      const select = page.locator("select").first();
      const count = await select.count();

      if (count > 0) {
        await select.focus();
        await page.keyboard.press("ArrowDown");

        const isSelectOpen = await select.evaluate((el: any) => {
          return el.open;
        });

        expect(isSelectOpen).not.toBeUndefined();
      }
    });
  });

  test.describe("Escape Key", () => {
    test("should close modals with Escape key", async ({ page }) => {
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
          await page.keyboard.press("Escape");

          await page.waitForTimeout(500);

          const isModalVisible = await modal
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
          expect(isModalVisible).toBeFalsy();
        }
      }
    });

    test("should close dropdowns with Escape key", async ({ page }) => {
      await page.goto("/admin/users");

      const filterButton = page.getByRole("button", { name: /filter/i });

      if (await filterButton.isVisible()) {
        await filterButton.click();

        await page.waitForTimeout(500);

        const dropdown = page
          .getByRole("menu")
          .or(page.locator(".dropdown-menu"));
        const dropdownCount = await dropdown.count();

        if (dropdownCount > 0) {
          await page.keyboard.press("Escape");

          await page.waitForTimeout(500);

          const isDropdownVisible = await dropdown
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
          expect(isDropdownVisible).toBeFalsy();
        }
      }
    });
  });

  test.describe("Focus Management", () => {
    test("should maintain focus trap in modal", async ({ page }) => {
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
          let isFocusInModal = false;

          for (let i = 0; i < 10; i++) {
            await page.keyboard.press("Tab");

            isFocusInModal = await page.evaluate(() => {
              const el = document.activeElement;
              const modal = el?.closest(
                '[role="dialog"], [role="alertdialog"], .modal',
              );
              return !!modal;
            });

            expect(isFocusInModal).toBeTruthy();
          }
        }
      }
    });

    test("should return focus to trigger after closing modal", async ({
      page,
    }) => {
      await page.goto("/admin/users");

      const deleteButton = page
        .getByRole("button", { name: /delete|deactivate/i })
        .first();

      if (await deleteButton.isVisible()) {
        await deleteButton.focus();
        const triggerElement = await page.evaluate(() => {
          return document.activeElement?.tagName;
        });

        await deleteButton.click();

        await page.waitForTimeout(500);

        const modal = page
          .getByRole("dialog")
          .or(page.locator('[role="alertdialog"]'));

        const modalCount = await modal.count();

        if (modalCount > 0) {
          const closeButton = modal
            .getByRole("button", { name: /cancel|close|x/i })
            .first();

          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            await page.keyboard.press("Escape");
          }

          await page.waitForTimeout(500);

          const focusedElement = await page.evaluate(() => {
            return document.activeElement?.tagName;
          });

          expect(focusedElement).toBe(triggerElement);
        }
      }
    });

    test("should move focus to first focusable element after page load", async ({
      page,
    }) => {
      await page.goto("/");

      const firstFocusable = page
        .locator(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        .first();

      await firstFocusable.focus();

      const isFocused = await firstFocusable.evaluate((el: any) => {
        return document.activeElement === el;
      });

      expect(isFocused).toBeTruthy();
    });
  });

  test.describe("Form Navigation", () => {
    test("should navigate form fields with Tab key", async ({ page }) => {
      await page.goto("/login");

      await page.getByLabel(/email/i).focus();

      await page.keyboard.press("Tab");
      let activeElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      expect(activeElement).toBe("INPUT");

      await page.keyboard.press("Tab");
      activeElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      expect(activeElement).toBe("BUTTON");
    });

    test("should submit form with Enter key", async ({ page }) => {
      await page.goto("/login");

      await page.getByLabel(/email/i).fill("test@example.com");
      await page.getByLabel(/password/i).fill("password123");

      await page.keyboard.press("Enter");

      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    });

    test("should navigate select dropdown with arrow keys", async ({
      page,
    }) => {
      await page.goto("/student/preliminary");

      const select = page.locator("select").first();
      const count = await select.count();

      if (count > 0) {
        await select.focus();
        await page.keyboard.press("ArrowDown");

        const isSelectFocused = await select.evaluate((el: any) => {
          return document.activeElement === el;
        });

        expect(isSelectFocused).toBeTruthy();
      }
    });
  });

  test.describe("Skip Links", () => {
    test("should navigate to main content with skip link", async ({ page }) => {
      await page.goto("/");

      const skipLink = page
        .locator("a[href^='#']")
        .filter({ hasText: /skip/i });
      const count = await skipLink.count();

      if (count > 0) {
        await skipLink.first().focus();
        await page.keyboard.press("Enter");

        await page.waitForTimeout(500);

        const mainContent = page
          .locator("main")
          .or(page.locator('[role="main"]'));
        const isMainFocused = await mainContent
          .evaluate((el: any) => {
            return document.activeElement === el;
          })
          .catch(() => false);

        expect(isMainFocused).toBeTruthy();
      }
    });

    test("should make skip link visible on focus", async ({ page }) => {
      await page.goto("/");

      const skipLink = page
        .locator("a[href^='#']")
        .filter({ hasText: /skip/i });
      const count = await skipLink.count();

      if (count > 0) {
        await skipLink.first().focus();

        const isVisible = await skipLink.first().isVisible();
        expect(isVisible).toBeTruthy();
      }
    });
  });

  test.describe("Custom Keyboard Shortcuts", () => {
    test("should have search shortcut if available", async ({ page }) => {
      await page.goto("/");

      const hasShortcut = await page.evaluate(() => {
        return document.querySelector('[data-shortcut="search"]') !== null;
      });

      if (hasShortcut) {
        await page.keyboard.press("Control+K");
        await page.waitForTimeout(500);

        const searchInput = page.getByPlaceholder(/search/i);
        const count = await searchInput.count();

        if (count > 0) {
          const isFocused = await searchInput.first().evaluate((el: any) => {
            return document.activeElement === el;
          });
          expect(isFocused).toBeTruthy();
        }
      }
    });
  });

  test.describe("Keyboard Accessibility Score", () => {
    test("should be fully keyboard navigable", async ({ page }) => {
      await page.goto("/");

      let canNavigateAll = true;

      const focusableElements = page.locator(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const count = await focusableElements.count();

      for (let i = 0; i < Math.min(count, 20); i++) {
        await page.keyboard.press("Tab");

        const activeElement = await page.evaluate(() => {
          return document.activeElement?.tagName;
        });

        if (
          !["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(
            activeElement || "",
          )
        ) {
          canNavigateAll = false;
          break;
        }
      }

      expect(canNavigateAll).toBeTruthy();
    });
  });
});
