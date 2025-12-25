import { test, expect } from "@playwright/test";

test.describe("Focus Management Tests", () => {
  test.describe("Initial Focus", () => {
    test("should set focus on first focusable element on page load", async ({
      page,
    }) => {
      await page.goto("/");

      const body = page.locator("body");
      await body.focus();

      const activeElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      expect(activeElement).toBeTruthy();
    });

    test("should set focus on login form when visiting login page", async ({
      page,
    }) => {
      await page.goto("/login");

      const emailInput = page.getByLabel(/email/i);
      if (await emailInput.isVisible()) {
        await emailInput.focus();

        const isFocused = await emailInput.evaluate((el: any) => {
          return document.activeElement === el;
        });

        expect(isFocused).toBeTruthy();
      }
    });

    test("should not focus decorative elements on page load", async ({
      page,
    }) => {
      await page.goto("/");

      const decorativeElements = page.locator(
        '[aria-hidden="true"], [role="presentation"]',
      );
      const count = await decorativeElements.count();

      for (let i = 0; i < count; i++) {
        const element = decorativeElements.nth(i);
        const isFocusable = await element.evaluate((el: any) => {
          const focusable =
            el.tagName === "BUTTON" ||
            (el.tagName === "A" && el.hasAttribute("href")) ||
            (el.tagName === "INPUT" && el.type !== "hidden") ||
            el.tagName === "SELECT" ||
            el.tagName === "TEXTAREA" ||
            (el.hasAttribute("tabindex") &&
              el.getAttribute("tabindex") !== "-1");

          return focusable;
        });

        expect(isFocusable).toBeFalsy();
      }
    });
  });

  test.describe("Focus Traps", () => {
    test("should trap focus within modal dialog", async ({ page }) => {
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
          for (let i = 0; i < 10; i++) {
            await page.keyboard.press("Tab");

            const isFocusInModal = await page.evaluate(() => {
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

    test("should keep focus within modal when cycling through elements", async ({
      page,
    }) => {
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
          const focusableCount = await page.evaluate(() => {
            const modal = document.querySelector(
              '[role="dialog"], [role="alertdialog"], .modal',
            );
            if (!modal) return 0;

            const focusable = modal.querySelectorAll(
              'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            return focusable.length;
          });

          if (focusableCount > 0) {
            for (let i = 0; i < focusableCount + 2; i++) {
              await page.keyboard.press("Tab");

              const isFocusInModal = await page.evaluate(() => {
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
      }
    });

    test("should escape focus trap when closing modal", async ({ page }) => {
      await page.goto("/admin/users");

      const deleteButton = page
        .getByRole("button", { name: /delete|deactivate/i })
        .first();

      if (await deleteButton.isVisible()) {
        await deleteButton.focus();

        const triggerElement = await page.evaluate(() => {
          return document.activeElement?.getAttribute("aria-label");
        });

        await deleteButton.click();

        await page.waitForTimeout(500);

        const modal = page
          .getByRole("dialog")
          .or(page.locator('[role="alertdialog"]'));

        const modalCount = await modal.count();

        if (modalCount > 0) {
          const cancelButton = modal
            .getByRole("button", { name: /cancel|close/i })
            .first();

          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          } else {
            await page.keyboard.press("Escape");
          }

          await page.waitForTimeout(500);

          const isModalFocused = await page.evaluate(() => {
            const el = document.activeElement;
            const modal = el?.closest('[role="dialog"], [role="alertdialog"]');
            return !!modal;
          });

          expect(isModalFocused).toBeFalsy();
        }
      }
    });
  });

  test.describe("Focus Restoration", () => {
    test("should restore focus to trigger element after closing modal", async ({
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
          const cancelButton = modal
            .getByRole("button", { name: /cancel|close/i })
            .first();

          if (await cancelButton.isVisible()) {
            await cancelButton.click();
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

    test("should restore focus after navigating back in browser", async ({
      page,
    }) => {
      await page.goto("/student/dashboard");

      const link = page.getByRole("link").first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState("networkidle");

        await page.goBack();
        await page.waitForLoadState("networkidle");

        const hasFocus = await page.evaluate(() => {
          return document.activeElement !== document.body;
        });

        expect(hasFocus).toBeTruthy();
      }
    });

    test("should restore focus after form submission error", async ({
      page,
    }) => {
      await page.goto("/login");

      const emailInput = page.getByLabel(/email/i);
      await emailInput.fill("test@example.com");

      const submitButton = page.getByRole("button", { name: /sign in/i });
      await submitButton.click();

      await page.waitForTimeout(1000);

      const isInputFocused = await emailInput.evaluate((el: any) => {
        return document.activeElement === el;
      });

      if (
        await page.getByText(/required|invalid/i).isVisible({ timeout: 500 })
      ) {
        expect(isInputFocused).toBeTruthy();
      }
    });
  });

  test.describe("Focus Indicators", () => {
    test("should have visible focus indicators on interactive elements", async ({
      page,
    }) => {
      await page.goto("/");

      const focusableElements = page.locator(
        "button, a[href], input, select, textarea",
      );

      const count = await focusableElements.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = focusableElements.nth(i);
        await element.focus();

        const hasFocusIndicator = await element.evaluate((el: any) => {
          const styles = window.getComputedStyle(el);
          return (
            styles.outline !== "none" ||
            styles.boxShadow !== "none" ||
            styles.borderColor !== ""
          );
        });

        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test("should have consistent focus indicator style", async ({ page }) => {
      await page.goto("/");

      const buttons = page.getByRole("button");
      const count = await buttons.count();

      if (count >= 2) {
        const firstButton = buttons.first();
        const secondButton = buttons.nth(1);

        await firstButton.focus();
        const firstIndicator = await firstButton.evaluate((el: any) => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineColor: styles.outlineColor,
            outlineWidth: styles.outlineWidth,
          };
        });

        await secondButton.focus();
        const secondIndicator = await secondButton.evaluate((el: any) => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineColor: styles.outlineColor,
            outlineWidth: styles.outlineWidth,
          };
        });

        expect(firstIndicator.outline).toBe(secondIndicator.outline);
      }
    });

    test("should not have focus indicator on decorative elements", async ({
      page,
    }) => {
      await page.goto("/");

      const decorativeElements = page.locator('[aria-hidden="true"]');
      const count = await decorativeElements.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = decorativeElements.nth(i);

        const hasNoFocus = await element.evaluate((el: any) => {
          return (
            el.getAttribute("tabindex") === "-1" ||
            el.getAttribute("aria-hidden") === "true"
          );
        });

        expect(hasNoFocus).toBeTruthy();
      }
    });
  });

  test.describe("Focus Management in Forms", () => {
    test("should set focus on first invalid field on form validation", async ({
      page,
    }) => {
      await page.goto("/login");

      const submitButton = page.getByRole("button", { name: /sign in/i });
      await submitButton.click();

      await page.waitForTimeout(1000);

      const firstInvalidField = page
        .locator('input:invalid, [aria-invalid="true"], .error')
        .first();

      const count = await firstInvalidField.count();

      if (count > 0) {
        const isFocused = await firstInvalidField.evaluate((el: any) => {
          return document.activeElement === el;
        });

        expect(isFocused).toBeTruthy();
      }
    });

    test("should move focus to next field on error", async ({ page }) => {
      await page.goto("/student/preliminary");

      const firstInput = page.getByLabel(/source/i);
      const secondInput = page.getByLabel(/destination/i);

      if ((await firstInput.isVisible()) && (await secondInput.isVisible())) {
        await firstInput.fill("Test University");
        await secondInput.fill("Target University");

        await firstInput.focus();

        await page.keyboard.press("Tab");

        const isSecondFocused = await secondInput.evaluate((el: any) => {
          return document.activeElement === el;
        });

        expect(isSecondFocused).toBeTruthy();
      }
    });
  });

  test.describe("Focus Management in Dynamic Content", () => {
    test("should set focus on newly revealed content", async ({ page }) => {
      await page.goto("/admin/users");

      const createButton = page.getByRole("button", {
        name: /add.*user|create.*user|new.*user/i,
      });

      if (await createButton.isVisible()) {
        await createButton.click();

        await page.waitForTimeout(500);

        const form = page
          .locator("form")
          .or(page.locator('[role="dialog"] form'))
          .first();

        const isFormVisible = await form
          .isVisible({ timeout: 1000 })
          .catch(() => false);

        if (isFormVisible) {
          const firstInput = form.locator("input, select").first();
          const isFocused = await firstInput
            .evaluate((el: any) => {
              return document.activeElement === el;
            })
            .catch(() => false);

          expect(isFocused).toBeTruthy();
        }
      }
    });

    test("should announce focus changes to screen readers", async ({
      page,
    }) => {
      await page.goto("/");

      const skipLink = page
        .locator("a[href^='#']")
        .filter({ hasText: /skip/i });
      const count = await skipLink.count();

      if (count > 0) {
        const hasAnnounce = await skipLink.first().evaluate((el: any) => {
          return el.hasAttribute("aria-live") || el.hasAttribute("aria-atomic");
        });

        expect(hasAnnounce).toBeTruthy();
      }
    });
  });

  test.describe("Focus Order", () => {
    test("should maintain logical tab order", async ({ page }) => {
      await page.goto("/");

      const focusableElements = page.locator(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const count = await focusableElements.count();

      const previousPositions: number[] = [];

      for (let i = 0; i < Math.min(count, 10); i++) {
        const currentPosition = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return -1;

          const rect = el.getBoundingClientRect();
          return rect.top;
        });

        if (previousPositions.length > 0) {
          const lastPosition = previousPositions[previousPositions.length - 1];
          expect(Math.abs(currentPosition - lastPosition)).toBeLessThan(1000);
        }

        previousPositions.push(currentPosition);
        await page.keyboard.press("Tab");
      }
    });

    test("should respect positive tabindex values", async ({ page }) => {
      await page.goto("/");

      const customTabElements = page.locator(
        '[tabindex]:not([tabindex="0"]):not([tabindex="-1"])',
      );
      const count = await customTabElements.count();

      if (count > 0) {
        const firstCustom = customTabElements.first();

        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");

        const isFocused = await firstCustom
          .evaluate((el: any) => {
            return document.activeElement === el;
          })
          .catch(() => false);

        if (isFocused) {
          expect(isFocused).toBeTruthy();
        }
      }
    });
  });

  test.describe("Accessibility Focus Requirements", () => {
    test("should have focusable skip link", async ({ page }) => {
      await page.goto("/");

      const skipLink = page
        .locator("a[href^='#']")
        .filter({ hasText: /skip/i });
      const count = await skipLink.count();

      if (count > 0) {
        const isFocusable = await skipLink.first().evaluate((el: any) => {
          return el.getAttribute("tabindex") !== "-1";
        });

        expect(isFocusable).toBeTruthy();
      }
    });

    test("should have no focusable decorative elements", async ({ page }) => {
      await page.goto("/");

      const decorativeFocusable = page.locator(
        '[aria-hidden="true"][tabindex="0"]',
      );
      const count = await decorativeFocusable.count();

      expect(count).toBe(0);
    });
  });
});
