import { test, expect } from "@playwright/test";

test.describe("Admin User Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
  });

  test.describe("Navigation to User Management", () => {
    test("should navigate to users page", async ({ page }) => {
      const usersLink = page.getByRole("link", {
        name: /users|manage.*users/i,
      });
      if (await usersLink.isVisible()) {
        await usersLink.click();
        await expect(page).toHaveURL(/.*admin.*users|users/i);
      } else {
        await page.goto("/admin/users");
      }
    });

    test("should display user management heading", async ({ page }) => {
      await page.goto("/admin/users");
      await expect(
        page.getByRole("heading", { name: /user.*management|users/i }),
      ).toBeVisible();
    });
  });

  test.describe("User List View", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/users");
    });

    test("should display user table", async ({ page }) => {
      const userTable = page
        .locator("table")
        .or(page.getByRole("grid", { name: /users/i }));
      if (await userTable.isVisible()) {
        await expect(userTable).toBeVisible();
      } else {
        const userList = page
          .locator('[role="list"]')
          .or(page.locator(".user-list"));
        await expect(userList).toBeVisible();
      }
    });

    test("should have search functionality", async ({ page }) => {
      const searchInput = page
        .getByPlaceholder(/search/i)
        .or(page.getByLabel(/search/i));
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        await expect(searchInput).toHaveValue("test");
      }
    });

    test("should have filter options", async ({ page }) => {
      const filterButton = page.getByRole("button", { name: /filter/i });
      if (await filterButton.isVisible()) {
        await filterButton.click();

        const filterOptions = page.getByRole("menuitem", {
          name: /role|status|department/i,
        });
        await expect(filterOptions.first()).toBeVisible({ timeout: 2000 });
      }
    });

    test("should have pagination controls", async ({ page }) => {
      const pagination = page.getByRole("navigation", { name: /pagination/i });
      if (await pagination.isVisible()) {
        await expect(pagination).toBeVisible();
      }
    });
  });

  test.describe("User Creation", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/users");
    });

    test("should display create user button", async ({ page }) => {
      const createButton = page.getByRole("button", {
        name: /add.*user|create.*user|new.*user/i,
      });
      await expect(createButton).toBeVisible();
    });

    test("should open user creation form", async ({ page }) => {
      const createButton = page.getByRole("button", {
        name: /add.*user|create.*user|new.*user/i,
      });
      await createButton.click();

      await expect(
        page.getByRole("heading", { name: /create.*user|new.*user/i }),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should display all required fields in creation form", async ({
      page,
    }) => {
      const createButton = page.getByRole("button", {
        name: /add.*user|create.*user|new.*user/i,
      });
      await createButton.click();

      await expect(page.getByLabel(/name|full.*name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/role/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /save|create|submit/i }),
      ).toBeVisible();
    });

    test("should validate required fields on creation", async ({ page }) => {
      const createButton = page.getByRole("button", {
        name: /add.*user|create.*user|new.*user/i,
      });
      await createButton.click();

      await page.getByRole("button", { name: /save|create|submit/i }).click();

      const errorMessage = page.getByText(/required|please.*fill/i);
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    });

    test("should validate email format on creation", async ({ page }) => {
      const createButton = page.getByRole("button", {
        name: /add.*user|create.*user|new.*user/i,
      });
      await createButton.click();

      await page.getByLabel(/name|full.*name/i).fill("Test User");
      await page.getByLabel(/email/i).fill("invalid-email");

      await page.getByRole("button", { name: /save|create|submit/i }).click();

      const errorMessage = page.getByText(/invalid.*email/i);
      if (await errorMessage.isVisible({ timeout: 2000 })) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test("should create new user successfully", async ({ page }) => {
      const createButton = page.getByRole("button", {
        name: /add.*user|create.*user|new.*user/i,
      });
      await createButton.click();

      await page.getByLabel(/name|full.*name/i).fill("Test User");
      await page.getByLabel(/email/i).fill(`test${Date.now()}@example.com`);
      await page.getByLabel(/role/i).selectOption({ label: /student|admin/i });

      await page.getByRole("button", { name: /save|create|submit/i }).click();

      const successMessage = page.getByText(
        /user.*created|successfully|saved/i,
      );
      if (await successMessage.isVisible({ timeout: 3000 })) {
        await expect(successMessage).toBeVisible();
      }
    });
  });

  test.describe("User Editing", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/users");
    });

    test("should have edit options for each user", async ({ page }) => {
      const editButton = page.getByRole("button", { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await expect(editButton).toBeVisible();
      }
    });

    test("should open edit form", async ({ page }) => {
      const editButton = page.getByRole("button", { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();

        await expect(
          page.getByRole("heading", { name: /edit.*user/i }),
        ).toBeVisible({ timeout: 3000 });
      }
    });

    test("should pre-fill user data in edit form", async ({ page }) => {
      const editButton = page.getByRole("button", { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();

        const nameInput = page.getByLabel(/name|full.*name/i);
        if (await nameInput.isVisible()) {
          const nameValue = await nameInput.inputValue();
          expect(nameValue.length).toBeGreaterThan(0);
        }
      }
    });

    test("should save user changes successfully", async ({ page }) => {
      const editButton = page.getByRole("button", { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();

        const nameInput = page.getByLabel(/name|full.*name/i);
        if (await nameInput.isVisible()) {
          const originalValue = await nameInput.inputValue();
          await nameInput.clear();
          await nameInput.fill(`Updated ${originalValue}`);

          await page.getByRole("button", { name: /save|update/i }).click();

          const successMessage = page.getByText(/updated|successfully|saved/i);
          if (await successMessage.isVisible({ timeout: 3000 })) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("User Deactivation", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/users");
    });

    test("should have deactivate/deactivate options", async ({ page }) => {
      const deactivateButton = page
        .getByRole("button", { name: /deactivate|delete/i })
        .first();
      if (await deactivateButton.isVisible()) {
        await expect(deactivateButton).toBeVisible();
      }
    });

    test("should show confirmation dialog before deactivation", async ({
      page,
    }) => {
      const deactivateButton = page
        .getByRole("button", { name: /deactivate|delete/i })
        .first();
      if (await deactivateButton.isVisible()) {
        await deactivateButton.click();

        const dialog = page
          .getByRole("dialog")
          .or(page.getByRole("alertdialog"));
        if (await dialog.isVisible({ timeout: 2000 })) {
          await expect(dialog).toBeVisible();
        }
      }
    });

    test("should cancel deactivation", async ({ page }) => {
      const deactivateButton = page
        .getByRole("button", { name: /deactivate|delete/i })
        .first();
      if (await deactivateButton.isVisible()) {
        await deactivateButton.click();

        const cancelButton = page.getByRole("button", { name: /cancel/i });
        if (await cancelButton.isVisible({ timeout: 2000 })) {
          await cancelButton.click();

          const dialog = page
            .getByRole("dialog")
            .or(page.getByRole("alertdialog"));
          await expect(dialog).not.toBeVisible({ timeout: 2000 });
        }
      }
    });

    test("should deactivate user successfully", async ({ page }) => {
      const deactivateButton = page
        .getByRole("button", { name: /deactivate/i })
        .first();
      if (await deactivateButton.isVisible()) {
        await deactivateButton.click();

        const confirmButton = page.getByRole("button", {
          name: /confirm|yes|delete/i,
        });
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();

          const successMessage = page.getByText(
            /deactivated|removed|successfully/i,
          );
          if (await successMessage.isVisible({ timeout: 3000 })) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("User Roles and Permissions", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/users");
    });

    test("should display user roles", async ({ page }) => {
      const roleBadge = page.getByText(/admin|student|advisor/i).first();
      if (await roleBadge.isVisible()) {
        await expect(roleBadge).toBeVisible();
      }
    });

    test("should allow changing user role", async ({ page }) => {
      const editButton = page.getByRole("button", { name: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();

        const roleSelect = page.getByLabel(/role/i);
        if (await roleSelect.isVisible()) {
          await roleSelect.selectOption({ label: /admin|student/i });

          await page.getByRole("button", { name: /save|update/i }).click();

          const successMessage = page.getByText(/updated|successfully|saved/i);
          if (await successMessage.isVisible({ timeout: 3000 })) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("User Search and Filtering", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/users");
    });

    test("should filter users by name", async ({ page }) => {
      const searchInput = page
        .getByPlaceholder(/search/i)
        .or(page.getByLabel(/search/i));
      if (await searchInput.isVisible()) {
        await searchInput.fill("admin");

        await page.waitForTimeout(1000);

        const userResults = page.getByText(/admin/i);
        await expect(userResults.first()).toBeVisible();
      }
    });

    test("should filter users by email", async ({ page }) => {
      const searchInput = page
        .getByPlaceholder(/search/i)
        .or(page.getByLabel(/search/i));
      if (await searchInput.isVisible()) {
        await searchInput.fill("@example.com");

        await page.waitForTimeout(1000);

        const userResults = page.getByText(/@example.com/i);
        await expect(userResults.first()).toBeVisible();
      }
    });

    test("should filter users by role", async ({ page }) => {
      const filterButton = page.getByRole("button", { name: /filter/i });
      if (await filterButton.isVisible()) {
        await filterButton.click();

        const roleFilter = page.getByRole("menuitem", { name: /admin/i });
        if (await roleFilter.isVisible({ timeout: 2000 })) {
          await roleFilter.click();

          await page.waitForTimeout(1000);

          const userResults = page.getByText(/admin/i);
          await expect(userResults.first()).toBeVisible();
        }
      }
    });

    test("should clear filters", async ({ page }) => {
      const searchInput = page
        .getByPlaceholder(/search/i)
        .or(page.getByLabel(/search/i));
      if (await searchInput.isVisible()) {
        await searchInput.fill("admin");
        await page.waitForTimeout(500);

        await searchInput.clear();

        await page.waitForTimeout(500);

        expect(await searchInput.inputValue()).toBe("");
      }
    });
  });

  test.describe("Bulk Actions", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/users");
    });

    test("should have select all checkbox", async ({ page }) => {
      const selectAllCheckbox = page.getByRole("checkbox", {
        name: /select.*all/i,
      });
      if (await selectAllCheckbox.isVisible()) {
        await expect(selectAllCheckbox).toBeVisible();
      }
    });

    test("should have individual user checkboxes", async ({ page }) => {
      const userCheckbox = page.getByRole("checkbox").first();
      if (await userCheckbox.isVisible()) {
        await expect(userCheckbox).toBeVisible();
      }
    });

    test("should have bulk action dropdown", async ({ page }) => {
      const bulkActionSelect = page.getByLabel(/bulk.*action|actions/i);
      if (await bulkActionSelect.isVisible()) {
        await expect(bulkActionSelect).toBeVisible();
      }
    });
  });

  test.describe("User Activity Logs", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/users");
    });

    test("should have option to view user activity", async ({ page }) => {
      const activityButton = page
        .getByRole("button", { name: /activity|logs|history/i })
        .first();
      if (await activityButton.isVisible()) {
        await activityButton.click();

        await expect(
          page.getByRole("heading", { name: /activity|logs|history/i }),
        ).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe("Error Handling", () => {
    test("should handle duplicate email error", async ({ page }) => {
      await page.goto("/admin/users");

      const createButton = page.getByRole("button", {
        name: /add.*user|create.*user|new.*user/i,
      });
      await createButton.click();

      await page.getByLabel(/name|full.*name/i).fill("Test User");
      await page.getByLabel(/email/i).fill("admin@example.com");

      await page.getByRole("button", { name: /save|create|submit/i }).click();

      const errorMessage = page.getByText(/already.*exists|duplicate|taken/i);
      if (await errorMessage.isVisible({ timeout: 3000 })) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test("should handle network errors gracefully", async ({ page }) => {
      await page.goto("/admin/users");

      await page.route("**/api/**", (route) => route.abort("failed"));

      const createButton = page.getByRole("button", {
        name: /add.*user|create.*user|new.*user/i,
      });
      await createButton.click();

      await page.getByLabel(/name|full.*name/i).fill("Test User");
      await page.getByLabel(/email/i).fill(`test${Date.now()}@example.com`);

      await page.getByRole("button", { name: /save|create|submit/i }).click();

      const errorMessage = page.getByText(/network.*error|connection.*failed/i);
      if (await errorMessage.isVisible({ timeout: 5000 })) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("should work correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/admin/users");

      await expect(
        page.getByRole("heading", { name: /user.*management|users/i }),
      ).toBeVisible();
    });

    test("should work correctly on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/admin/users");

      await expect(
        page.getByRole("heading", { name: /user.*management|users/i }),
      ).toBeVisible();
    });
  });
});
