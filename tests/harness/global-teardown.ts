/**
 * Playwright Global Teardown
 * Runs after all tests to clean up the test environment
 */

import { chromium, FullConfig } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting Playwright global teardown...");

  const { baseURL } = config.projects[0].use;

  if (!baseURL) {
    console.log("⚠️ No base URL configured, skipping teardown");
    return;
  }

  // Launch browser for cleanup operations
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Clean up test data
    await cleanupTestData(page, baseURL);
    
    // Clean up auth states
    await cleanupAuthState();
    
    // Clean up temporary files
    await cleanupTempFiles();

  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw - teardown failures shouldn't fail the test run
  } finally {
    await browser.close();
  }

  console.log("✅ Global teardown completed");
}

/**
 * Clean up test data from the application
 */
async function cleanupTestData(page: any, baseURL: string) {
  try {
    console.log("🗑️ Cleaning up test data...");
    
    // This would depend on your app's cleanup endpoints
    // Example: Delete test workspaces and ideas
    
    // If your app has a cleanup API endpoint, call it here
    // await page.request.delete(`${baseURL}/api/test/cleanup`);
    
    // Or navigate to admin cleanup page
    // await page.goto(`${baseURL}/admin/test-cleanup`);
    // await page.click('#cleanup-test-data');

    console.log("✅ Test data cleanup completed");
  } catch (error) {
    console.warn("⚠️ Test data cleanup failed:", error);
  }
}

/**
 * Clean up authentication state files
 */
async function cleanupAuthState() {
  try {
    console.log("🔐 Cleaning up auth state files...");
    
    const authStateFile = "tests/harness/auth-state.json";
    
    try {
      await fs.access(authStateFile);
      await fs.unlink(authStateFile);
      console.log("✅ Auth state file removed");
    } catch {
      // File doesn't exist, which is fine
    }
    
  } catch (error) {
    console.warn("⚠️ Auth state cleanup failed:", error);
  }
}

/**
 * Clean up temporary files and directories
 */
async function cleanupTempFiles() {
  try {
    console.log("🗂️ Cleaning up temporary files...");
    
    const tempDirs = [
      "test-results",
      "playwright-report", 
      "coverage",
    ];

    for (const dir of tempDirs) {
      try {
        const stats = await fs.stat(dir);
        if (stats.isDirectory()) {
          // Only clean up if the directory is very old (> 7 days)
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (stats.mtime.getTime() < sevenDaysAgo) {
            await fs.rmdir(dir, { recursive: true });
            console.log(`✅ Cleaned up old directory: ${dir}`);
          }
        }
      } catch {
        // Directory doesn't exist or permission error, skip
      }
    }

    console.log("✅ Temporary files cleanup completed");
  } catch (error) {
    console.warn("⚠️ Temporary files cleanup failed:", error);
  }
}

export default globalTeardown;