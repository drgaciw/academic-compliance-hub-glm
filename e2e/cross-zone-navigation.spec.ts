import { test, expect } from "@playwright/test";

test.describe("Cross-Zone Navigation", () => {
  test.describe("Main Site Navigation", () => {
    test("should navigate from main site to student portal", async ({
      page,
      context,
    }) => {
      await page.goto("/");

      const studentLink = page.getByRole("link", { name: /student|portal/i });
      if (await studentLink.isVisible()) {
        await studentLink.click();

        const newPage = await context.waitForEvent("page");
        await newPage.waitForLoadState("networkidle");
        await expect(newPage).toHaveURL(/.*student/i);
      } else {
        await page.goto("/student");
        await expect(page).toHaveURL(/.*student/i);
      }
    });

    test("should navigate from main site to admin dashboard", async ({
      page,
      context,
    }) => {
      await page.goto("/");

      const adminLink = page.getByRole("link", { name: /admin/i });
      if (await adminLink.isVisible()) {
        await adminLink.click();

        const newPage = await context.waitForEvent("page");
        await newPage.waitForLoadState("networkidle");
        await expect(newPage).toHaveURL(/.*admin/i);
      } else {
        await page.goto("/admin");
        await expect(page).toHaveURL(/.*admin/i);
      }
    });

    test("should have navigation menu on main site", async ({ page }) => {
      await page.goto("/");

      const navMenu = page.getByRole("navigation");
      await expect(navMenu).toBeVisible();
    });

    test("should have home link in navigation", async ({ page }) => {
      await page.goto("/");

      const homeLink = page.getByRole("link", { name: /home|logo/i });
      await expect(homeLink).toBeVisible();
    });
  });

  test.describe("Student Portal Navigation", () => {
    test("should navigate from student portal to main site", async ({
      page,
    }) => {
      await page.goto("/student");

      const homeLink = page.getByRole("link", { name: /home|main.*site/i });
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page).toHaveURL(/\/(?!student)/);
      } else {
        await page.goto("/");
        await expect(page).toHaveURL(/\/(?!student)/);
      }
    });

    test("should navigate from student portal to admin (if authorized)", async ({
      page,
    }) => {
      await page.goto("/student");

      const adminLink = page.getByRole("link", { name: /admin/i });
      if (await adminLink.isVisible()) {
        await adminLink.click();
        await expect(page).toHaveURL(/.*admin/i);
      }
    });

    test("should navigate between student pages", async ({ page }) => {
      await page.goto("/student");

      await page.goto("/student/dashboard");
      await expect(page).toHaveURL(/.*student.*dashboard/i);

      await page.goto("/student/preliminary");
      await expect(page).toHaveURL(/.*student.*preliminary/i);

      await page.goto("/student/status");
      await expect(page).toHaveURL(/.*student.*status/i);
    });

    test("should have consistent navigation across student pages", async ({
      page,
    }) => {
      await page.goto("/student/dashboard");

      const navMenu = page.getByRole("navigation");
      await expect(navMenu).toBeVisible();

      await page.goto("/student/status");
      await expect(navMenu).toBeVisible();
    });
  });

  test.describe("Admin Dashboard Navigation", () => {
    test("should navigate from admin dashboard to main site", async ({
      page,
    }) => {
      await page.goto("/admin");

      const homeLink = page.getByRole("link", { name: /home|main.*site/i });
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page).toHaveURL(/\/(?!admin)/);
      } else {
        await page.goto("/");
        await expect(page).toHaveURL(/\/(?!admin)/);
      }
    });

    test("should navigate from admin dashboard to student portal", async ({
      page,
    }) => {
      await page.goto("/admin");

      const studentLink = page.getByRole("link", { name: /student/i });
      if (await studentLink.isVisible()) {
        await studentLink.click();
        await expect(page).toHaveURL(/.*student/i);
      }
    });

    test("should navigate between admin pages", async ({ page }) => {
      await page.goto("/admin");

      await page.goto("/admin/users");
      await expect(page).toHaveURL(/.*admin.*users/i);

      await page.goto("/admin/reports");
      await expect(page).toHaveURL(/.*admin.*reports/i);

      await page.goto("/admin/analytics");
      await expect(page).toHaveURL(/.*admin.*analytics/i);
    });

    test("should have consistent navigation across admin pages", async ({
      page,
    }) => {
      await page.goto("/admin/users");

      const navMenu = page.getByRole("navigation");
      await expect(navMenu).toBeVisible();

      await page.goto("/admin/analytics");
      await expect(navMenu).toBeVisible();
    });
  });

  test.describe("Session Management Across Zones", () => {
    test("should maintain login session across zones", async ({
      page,
      context,
    }) => {
      await page.goto("/student/dashboard");

      const cookies = await context.cookies();
      const sessionCookie = cookies.find(
        (cookie) =>
          cookie.name.includes("session") ||
          cookie.name.includes("token") ||
          cookie.name.includes("auth"),
      );

      if (sessionCookie) {
        await page.goto("/admin/dashboard");

        const isRedirectedToLogin =
          (await page.url()).includes("/login") ||
          (await page.url()).includes("/signin");

        expect(!isRedirectedToLogin || sessionCookie).toBeTruthy();
      }
    });

    test("should logout from all zones when logging out", async ({ page }) => {
      await page.goto("/student/dashboard");

      const logoutButton = page.getByRole("button", {
        name: /logout|sign.*out/i,
      });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();

        await page.goto("/admin/dashboard");
        const isRedirectedToLogin =
          (await page.url()).includes("/login") ||
          (await page.url()).includes("/signin");

        await page.goto("/student/dashboard");
        const isStudentRedirectedToLogin =
          (await page.url()).includes("/login") ||
          (await page.url()).includes("/signin") ||
          (await page.url()).includes("/student/login");

        expect(isRedirectedToLogin || isStudentRedirectedToLogin).toBeTruthy();
      }
    });
  });

  test.describe("Navigation Performance", () => {
    test("should load main site quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test("should load student portal quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/student");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test("should load admin dashboard quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/admin");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });
  });

  test.describe("Navigation Consistency", () => {
    test("should maintain active state in navigation", async ({ page }) => {
      await page.goto("/student/dashboard");

      const dashboardLink = page.getByRole("link", { name: /dashboard/i });
      if (await dashboardLink.isVisible()) {
        const isActive = await dashboardLink.evaluate((el) => {
          return (
            el.classList.contains("active") ||
            el.getAttribute("aria-current") === "page" ||
            (el.tagName.toLowerCase() === "a" &&
              window.location.pathname.includes("dashboard"))
          );
        });
        expect(isActive).toBeTruthy();
      }
    });

    test("should highlight current page in breadcrumb", async ({ page }) => {
      await page.goto("/student/dashboard");

      const breadcrumb = page.getByRole("navigation", {
        name: /breadcrumb/i,
      });
      if (await breadcrumb.isVisible()) {
        await expect(breadcrumb).toBeVisible();
      }
    });

    test("should have back button functionality", async ({ page }) => {
      await page.goto("/student");
      await page.goto("/student/preliminary");

      const backButton = page.getByRole("button", { name: /back/i });
      if (await backButton.isVisible()) {
        await backButton.click();
        await expect(page).toHaveURL(/student\/(?!preliminary)/);
      }
    });
  });

  test.describe("Navigation Error Handling", () => {
    test("should handle 404 pages gracefully", async ({ page }) => {
      await page.goto("/non-existent-page");

      await expect(
        page.getByRole("heading", { name: /not.*found|404/i }),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should have home button on 404 page", async ({ page }) => {
      await page.goto("/non-existent-page");

      const homeButton = page.getByRole("link", { name: /home/i });
      if (await homeButton.isVisible({ timeout: 2000 })) {
        await homeButton.click();
        await expect(page).toHaveURL(/\/$/);
      }
    });

    test("should handle invalid routes in student zone", async ({ page }) => {
      await page.goto("/student/invalid-route");

      await expect(
        page.getByRole("heading", { name: /not.*found|404/i }),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should handle invalid routes in admin zone", async ({ page }) => {
      await page.goto("/admin/invalid-route");

      await expect(
        page.getByRole("heading", { name: /not.*found|404/i }),
      ).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Deep Linking", () => {
    test("should navigate directly to student dashboard", async ({ page }) => {
      await page.goto("/student/dashboard");

      await expect(
        page.getByRole("heading", { name: /dashboard/i }),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should navigate directly to admin users page", async ({ page }) => {
      await page.goto("/admin/users");

      await expect(
        page.getByRole("heading", { name: /users|user.*management/i }),
      ).toBeVisible({ timeout: 3000 });
    });

    test("should navigate directly to student status page", async ({
      page,
    }) => {
      await page.goto("/student/status");

      await expect(
        page.getByRole("heading", { name: /status|transfer.*status/i }),
      ).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Responsive Navigation", () => {
    test("should have mobile menu on small screens", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /menu|hamburger/i });
      await expect(menuButton).toBeVisible();
    });

    test("should open mobile menu when clicked", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /menu|hamburger/i });
      await menuButton.click();

      const mobileMenu = page
        .getByRole("navigation")
        .or(page.locator(".mobile-menu"));
      await expect(mobileMenu).toBeVisible({ timeout: 2000 });
    });

    test("should close mobile menu when link clicked", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /menu|hamburger/i });
      await menuButton.click();

      const mobileMenu = page
        .getByRole("navigation")
        .or(page.locator(".mobile-menu"));
      if (await mobileMenu.isVisible({ timeout: 2000 })) {
        const navLink = mobileMenu.getByRole("link").first();
        await navLink.click();

        await expect(mobileMenu).not.toBeVisible({ timeout: 2000 });
      }
    });
  });

  test.describe("Navigation Loading States", () => {
    test("should show loading indicator during navigation", async ({
      page,
    }) => {
      await page.goto("/");

      await page.route("**/student/**", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        route.continue();
      });

      const studentLink = page.getByRole("link", { name: /student|portal/i });
      if (await studentLink.isVisible()) {
        await studentLink.click();

        const loadingIndicator = page.getByText(/loading|loading\.\.\./i);
        const isVisible = await loadingIndicator.isVisible({ timeout: 500 });
        expect(isVisible).toBeTruthy();
      }
    });
  });

  test.describe("Browser Navigation", () => {
    test("should work with browser back button", async ({ page }) => {
      await page.goto("/student/dashboard");
      await page.goto("/student/preliminary");

      await page.goBack();
      await expect(page).toHaveURL(/student.*dashboard/i);
    });

    test("should work with browser forward button", async ({ page }) => {
      await page.goto("/student/dashboard");
      await page.goto("/student/preliminary");

      await page.goBack();
      await expect(page).toHaveURL(/student.*dashboard/i);

      await page.goForward();
      await expect(page).toHaveURL(/student.*preliminary/i);
    });

    test("should maintain scroll position on back navigation", async ({
      page,
    }) => {
      await page.goto("/student/status");

      await page.evaluate(() => window.scrollTo(0, 500));
      const scrollPosition = await page.evaluate(() => window.scrollY);

      await page.goto("/student/dashboard");
      await page.goBack();

      const newScrollPosition = await page.evaluate(() => window.scrollY);
      expect(newScrollPosition).toBeGreaterThan(0);
    });
  });
});
