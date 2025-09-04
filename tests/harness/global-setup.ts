/**
 * Playwright Global Setup
 * Runs before all tests to prepare the test environment
 */

import { chromium, FullConfig } from "@playwright/test";
import { TestDataFactory } from "./builders";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting Playwright global setup...");

  const { baseURL } = config.projects[0].use;
  
  if (!baseURL) {
    throw new Error("Base URL not configured");
  }

  // Launch browser for setup operations
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the app to be ready
    console.log("⏳ Waiting for app to be ready...");
    await page.goto(baseURL);
    
    // Wait for the app to load completely
    await page.waitForSelector("body", { timeout: 30000 });
    
    // Check if app is responding
    const title = await page.title();
    console.log(`📱 App loaded with title: ${title}`);

    // Setup test data if needed
    await setupTestData(page, baseURL);
    
    // Store authentication state for tests that need it
    await setupAuthState(page, baseURL);

  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("✅ Global setup completed successfully");
}

/**
 * Setup test data in the application
 */
async function setupTestData(page: any, baseURL: string) {
  try {
    console.log("📊 Setting up test data...");
    
    // This would depend on your app's API or setup endpoints
    // Example: Create test workspace and ideas via API calls
    
    const testWorkspace = TestDataFactory.workspace({
      name: "E2E Test Workspace",
      description: "Workspace for end-to-end testing",
    });

    // If your app has a setup API endpoint, call it here
    // await page.request.post(`${baseURL}/api/test/setup`, {
    //   data: { workspace: testWorkspace }
    // });

    console.log("✅ Test data setup completed");
  } catch (error) {
    console.warn("⚠️ Test data setup failed (continuing anyway):", error);
  }
}

/**
 * Setup authentication state for tests
 */
async function setupAuthState(page: any, baseURL: string) {
  try {
    console.log("🔐 Setting up authentication state...");
    
    // If you have a test login endpoint or mock auth
    // Navigate to login page
    await page.goto(`${baseURL}/auth/test-login`);
    
    // Or simulate authentication by setting cookies/localStorage
    await page.evaluate(() => {
      // Mock authentication token
      localStorage.setItem("auth_token", "test_token_12345");
      localStorage.setItem("user_id", "test_user_123");
    });

    // Store auth state for use in tests
    await page.context().storageState({ 
      path: "tests/harness/auth-state.json" 
    });

    console.log("✅ Authentication state saved");
  } catch (error) {
    console.warn("⚠️ Auth setup failed (tests may need to handle auth):", error);
  }
}

export default globalSetup;