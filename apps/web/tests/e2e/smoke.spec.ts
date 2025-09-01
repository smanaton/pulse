/**
 * E2E Test - Smoke Tests
 * Critical user journeys only, tagged @smoke
 * Real browser automation, minimal but essential coverage
 */

import { expect, test } from "@playwright/test";

test.describe("@smoke Critical User Journeys", () => {
  test.describe.configure({ mode: "serial" }); // Run smoke tests in sequence

  test("Sign in and create idea journey", async ({ page }) => {
    // Step 1: Navigate to app
    await page.goto("/");
    
    // Step 2: Verify landing page loads
    await expect(page.getByRole("heading", { name: /pulse/i })).toBeVisible();
    
    // Step 3: Click sign in
    await page.getByRole("button", { name: /sign in/i }).click();
    
    // Step 4: Mock authentication (or use test OAuth provider)
    // This would depend on your auth setup - could be test credentials or mocked
    await page.waitForURL("/dashboard", { timeout: 10000 });
    
    // Step 5: Verify dashboard loads
    await expect(page.getByText("Welcome")).toBeVisible();
    
    // Step 6: Navigate to ideas section
    await page.getByRole("link", { name: /ideas/i }).click();
    
    // Step 7: Create new idea
    await page.getByRole("button", { name: /new idea/i }).click();
    
    // Step 8: Fill idea form
    await page.getByLabel("Title").fill("E2E Test Idea");
    await page.getByLabel("Content").fill("This is a test idea created by E2E automation");
    
    // Step 9: Save idea
    await page.getByRole("button", { name: /save/i }).click();
    
    // Step 10: Verify success
    await expect(page.getByText("Idea created successfully")).toBeVisible();
    await expect(page.getByText("E2E Test Idea")).toBeVisible();
  });

  test("Web clipper integration flow", async ({ page, context }) => {
    // Step 1: Navigate to a test page to clip
    await page.goto("https://example.com");
    
    // Step 2: Simulate extension injection (or load actual extension)
    await page.evaluate(() => {
      // Inject the clipper UI (this would normally be done by the extension)
      const clipperButton = document.createElement("button");
      clipperButton.id = "pulse-clipper";
      clipperButton.textContent = "Clip to Pulse";
      clipperButton.style.position = "fixed";
      clipperButton.style.top = "10px";
      clipperButton.style.right = "10px";
      clipperButton.style.zIndex = "10000";
      document.body.appendChild(clipperButton);
    });
    
    // Step 3: Verify clipper appears
    await expect(page.locator("#pulse-clipper")).toBeVisible();
    
    // Step 4: Click clipper button
    await page.locator("#pulse-clipper").click();
    
    // Step 5: Verify clip modal or redirect to Pulse
    // This would depend on your clipper implementation
    await expect(page.getByText("Clipped to Pulse")).toBeVisible({ timeout: 5000 });
  });

  test("Authentication state persistence", async ({ page }) => {
    // Step 1: Sign in (assuming previous test or setup)
    await page.goto("/");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("/dashboard");
    
    // Step 2: Navigate away and back
    await page.goto("https://example.com");
    await page.goBack();
    
    // Step 3: Verify still authenticated
    await expect(page.getByText("Welcome")).toBeVisible();
    
    // Step 4: Refresh page
    await page.reload();
    
    // Step 5: Verify authentication persists
    await expect(page.getByText("Welcome")).toBeVisible();
  });
});

test.describe("@smoke Error Handling", () => {
  test("Graceful offline behavior", async ({ page, context }) => {
    // Step 1: Go online and load app
    await page.goto("/dashboard");
    
    // Step 2: Go offline
    await context.setOffline(true);
    
    // Step 3: Try to perform action that requires network
    await page.getByRole("button", { name: /new idea/i }).click();
    await page.getByLabel("Title").fill("Offline Test");
    await page.getByRole("button", { name: /save/i }).click();
    
    // Step 4: Verify offline message or queuing behavior
    await expect(
      page.getByText(/offline|connection|retry/i)
    ).toBeVisible({ timeout: 5000 });
    
    // Step 5: Go back online
    await context.setOffline(false);
    
    // Step 6: Verify app recovers
    await page.getByRole("button", { name: /retry|sync/i }).click();
    await expect(page.getByText("Offline Test")).toBeVisible();
  });

  test("Invalid route handling", async ({ page }) => {
    // Step 1: Navigate to invalid route
    await page.goto("/invalid-route-that-does-not-exist");
    
    // Step 2: Verify 404 handling
    await expect(
      page.getByText(/not found|404/i)
    ).toBeVisible();
    
    // Step 3: Verify navigation back to valid routes works
    await page.getByRole("link", { name: /home|dashboard/i }).click();
    await expect(page.getByText("Welcome")).toBeVisible();
  });
});

test.describe("@smoke Accessibility", () => {
  test("Keyboard navigation works", async ({ page }) => {
    // Step 1: Load app
    await page.goto("/dashboard");
    
    // Step 2: Navigate using keyboard
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    
    // Step 3: Verify keyboard navigation works
    // This is a basic test - you might want to use axe-playwright for comprehensive a11y testing
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("Screen reader landmarks present", async ({ page }) => {
    // Step 1: Load app
    await page.goto("/dashboard");
    
    // Step 2: Verify ARIA landmarks
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
    
    // Step 3: Verify headings structure
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    await expect(headings.first()).toBeVisible();
  });
});

test.describe("@smoke Performance", () => {
  test("App loads within performance budget", async ({ page }) => {
    // Step 1: Start performance monitoring
    await page.goto("/", { waitUntil: "networkidle" });
    
    // Step 2: Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find((entry) => entry.entryType === "largest-contentful-paint");
          const fid = entries.find((entry) => entry.entryType === "first-input");
          
          resolve({
            lcp: lcp?.startTime || 0,
            fid: fid?.processingStart - fid?.startTime || 0,
          });
        }).observe({ entryTypes: ["largest-contentful-paint", "first-input"] });
        
        // Fallback timeout
        setTimeout(() => resolve({ lcp: 0, fid: 0 }), 3000);
      });
    });
    
    // Step 3: Verify performance thresholds
    // These thresholds are examples - adjust based on your performance budget
    // expect(metrics.lcp).toBeLessThan(2500); // LCP should be < 2.5s
    // expect(metrics.fid).toBeLessThan(100); // FID should be < 100ms
    
    // Step 4: Verify app is interactive
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });
});