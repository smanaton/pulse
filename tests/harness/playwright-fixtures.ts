/**
 * Playwright Custom Fixtures
 * Extends Playwright with custom test fixtures for common scenarios
 */

import { test as base, expect, Page } from "@playwright/test";
import { TestDataFactory } from "./builders";

// Define custom fixture types
type CustomFixtures = {
  authenticatedPage: Page;
  testWorkspace: { id: string; name: string };
  testUser: { id: string; name: string; email: string };
  mockApiResponses: void;
};

// Extend base test with custom fixtures
export const test = base.extend<CustomFixtures>({
  /**
   * Authenticated page fixture
   * Provides a page with user already logged in
   */
  authenticatedPage: async ({ page }, use) => {
    // Setup authentication
    await page.goto("/");
    
    // Mock authentication or use stored auth state
    await page.evaluate(() => {
      localStorage.setItem("auth_token", "test_token_12345");
      localStorage.setItem("user_id", "test_user_123");
      
      // Mock user data
      localStorage.setItem("user_data", JSON.stringify({
        id: "test_user_123",
        name: "Test User",
        email: "test@example.com",
      }));
    });

    // Navigate to dashboard to complete auth setup
    await page.goto("/dashboard");
    
    // Wait for auth to be established
    await expect(page.getByText("Welcome")).toBeVisible({ timeout: 10000 });

    await use(page);
  },

  /**
   * Test workspace fixture
   * Provides a workspace ID that can be used in tests
   */
  testWorkspace: async ({ page }, use) => {
    const workspace = TestDataFactory.workspace({
      name: "Test Workspace",
    });

    // Create workspace via API or UI
    // This is a mock - in real app you'd call your API
    await page.evaluate((ws) => {
      // Mock workspace creation
      localStorage.setItem("test_workspace", JSON.stringify(ws));
    }, workspace);

    await use({
      id: workspace._id,
      name: workspace.name,
    });

    // Cleanup workspace after test
    await page.evaluate(() => {
      localStorage.removeItem("test_workspace");
    });
  },

  /**
   * Test user fixture
   * Provides test user data
   */
  testUser: async ({ page }, use) => {
    const user = TestDataFactory.user({
      name: "E2E Test User",
      email: "e2e@test.com",
    });

    await use({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  },

  /**
   * Mock API responses fixture
   * Sets up common API mocks for isolated testing
   */
  mockApiResponses: async ({ page }, use) => {
    // Mock API responses to avoid dependencies on backend state
    await page.route("**/api/workspaces", async (route) => {
      const workspaces = [
        TestDataFactory.workspace({ name: "Default Workspace" }),
        TestDataFactory.workspace({ name: "Team Workspace" }),
      ];
      
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(workspaces),
      });
    });

    await page.route("**/api/ideas*", async (route) => {
      const method = route.request().method();
      
      if (method === "GET") {
        const ideas = [
          TestDataFactory.idea({ title: "Mock Idea 1" }),
          TestDataFactory.idea({ title: "Mock Idea 2" }),
        ];
        
        await route.fulfill({
          status: 200,
          contentType: "application/json", 
          body: JSON.stringify(ideas),
        });
      } else if (method === "POST") {
        const newIdea = TestDataFactory.idea({ 
          title: "New Mock Idea",
          _id: `mock_${Date.now()}`,
        });
        
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(newIdea),
        });
      }
    });

    await page.route("**/api/users/me", async (route) => {
      const user = TestDataFactory.user({
        name: "Mock Current User",
        email: "current@test.com",
      });
      
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(user),
      });
    });

    await use();
  },
});

/**
 * Custom assertions and helpers
 */
export const customExpect = {
  /**
   * Assert that an idea card is visible with correct data
   */
  ideaCardToBeVisible: async (page: Page, ideaTitle: string) => {
    const ideaCard = page.locator(`[data-testid="idea-card"]`).filter({
      hasText: ideaTitle,
    });
    
    await expect(ideaCard).toBeVisible();
    await expect(ideaCard.getByText(ideaTitle)).toBeVisible();
  },

  /**
   * Assert that workspace is selected
   */
  workspaceToBeSelected: async (page: Page, workspaceName: string) => {
    const workspaceSelector = page.locator(`[data-testid="workspace-selector"]`);
    await expect(workspaceSelector).toContainText(workspaceName);
  },

  /**
   * Assert that user is authenticated
   */
  userToBeAuthenticated: async (page: Page) => {
    // Check for auth indicators
    await expect(page.locator(`[data-testid="user-menu"]`)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
  },

  /**
   * Assert that loading state is shown
   */
  loadingToBeVisible: async (page: Page) => {
    await expect(page.getByText(/loading/i)).toBeVisible();
  },

  /**
   * Assert that error message is shown
   */
  errorToBeVisible: async (page: Page, errorMessage?: string) => {
    const errorElement = page.locator(`[data-testid="error-message"]`);
    await expect(errorElement).toBeVisible();
    
    if (errorMessage) {
      await expect(errorElement).toContainText(errorMessage);
    }
  },

  /**
   * Assert that success message is shown
   */
  successToBeVisible: async (page: Page, successMessage?: string) => {
    const successElement = page.locator(`[data-testid="success-message"]`);
    await expect(successElement).toBeVisible();
    
    if (successMessage) {
      await expect(successElement).toContainText(successMessage);
    }
  },
};

/**
 * Page object models for common pages
 */
export class DashboardPage {
  constructor(private page: Page) {}

  async navigateToIdeas() {
    await this.page.getByRole("link", { name: /ideas/i }).click();
  }

  async navigateToWorkspaces() {
    await this.page.getByRole("link", { name: /workspaces/i }).click();
  }

  async waitForLoad() {
    await expect(this.page.getByText("Welcome")).toBeVisible();
  }
}

export class IdeasPage {
  constructor(private page: Page) {}

  async createIdea(title: string, content: string) {
    await this.page.getByRole("button", { name: /new idea/i }).click();
    await this.page.getByLabel("Title").fill(title);
    await this.page.getByLabel("Content").fill(content);
    await this.page.getByRole("button", { name: /save/i }).click();
  }

  async waitForIdeaToAppear(title: string) {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async getIdeaCount() {
    return await this.page.locator(`[data-testid="idea-card"]`).count();
  }
}

export class AuthPage {
  constructor(private page: Page) {}

  async signIn() {
    await this.page.getByRole("button", { name: /sign in/i }).click();
    // Mock auth flow or handle OAuth
    await this.page.waitForURL("/dashboard");
  }

  async signOut() {
    await this.page.getByRole("button", { name: /sign out/i }).click();
    await this.page.waitForURL("/");
  }
}

// Re-export everything we need
export { expect } from "@playwright/test";
export type { Page } from "@playwright/test";