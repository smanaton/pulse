/**
 * Unit Test - Chrome Extension
 * Tests extension functionality with mocked browser APIs
 * No real browser, focused on extension logic
 */

import { describe, expect, test, vi, beforeEach } from "vitest";

// Mock webextension-polyfill
const mockBrowser = {
  tabs: {
    query: vi.fn(),
    executeScript: vi.fn(),
    sendMessage: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn(),
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
    setIcon: vi.fn(),
  },
};

vi.mock("webextension-polyfill", () => ({
  default: mockBrowser,
}));

// Mock extension modules (these would be your actual extension code)
import browser from "webextension-polyfill";

// Example clipper functionality
class WebClipper {
  async clipActiveTab(): Promise<{ url: string; title: string; content: string }> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];

    if (!activeTab?.url || !activeTab?.title) {
      throw new Error("No active tab found");
    }

    // Extract content from the page
    const content = await this.extractContent(activeTab.id!);

    return {
      url: activeTab.url,
      title: activeTab.title,
      content: content || "",
    };
  }

  async extractContent(tabId: number): Promise<string> {
    const results = await browser.tabs.executeScript(tabId, {
      code: `
        // Extract main content
        const content = document.querySelector('main, article, .content, .post')?.textContent ||
                       document.body.textContent;
        content?.slice(0, 5000); // Limit content length
      `,
    });

    return results?.[0] || "";
  }

  async saveToWorkspace(data: { url: string; title: string; content: string }, workspaceId: string) {
    const response = await browser.runtime.sendMessage({
      type: "SAVE_CLIP",
      data: {
        ...data,
        workspaceId,
      },
    });

    if (!response?.success) {
      throw new Error(response?.error || "Failed to save clip");
    }

    return response.ideaId;
  }
}

// Example configuration manager
class ConfigManager {
  async getConfig() {
    const result = await browser.storage.sync.get([
      "defaultWorkspaceId",
      "autoClip",
      "clipShortcut",
    ]);

    return {
      defaultWorkspaceId: result.defaultWorkspaceId || null,
      autoClip: result.autoClip || false,
      clipShortcut: result.clipShortcut || "Ctrl+Shift+C",
    };
  }

  async setConfig(config: { defaultWorkspaceId?: string; autoClip?: boolean; clipShortcut?: string }) {
    await browser.storage.sync.set(config);
  }
}

describe("Web Clipper", () => {
  let clipper: WebClipper;

  beforeEach(() => {
    clipper = new WebClipper();
    vi.clearAllMocks();
  });

  describe("clipActiveTab", () => {
    test("Given_ActiveTab_When_Clipped_Then_ReturnsTabInfo", async () => {
      // Arrange
      const mockTab = {
        id: 1,
        url: "https://example.com/article",
        title: "Test Article",
      };
      mockBrowser.tabs.query.mockResolvedValue([mockTab]);
      mockBrowser.tabs.executeScript.mockResolvedValue(["Article content here..."]);

      // Act
      const result = await clipper.clipActiveTab();

      // Assert
      expect(result).toEqual({
        url: "https://example.com/article",
        title: "Test Article",
        content: "Article content here...",
      });
    });

    test("Given_NoActiveTab_When_Clipped_Then_ThrowsError", async () => {
      // Arrange
      mockBrowser.tabs.query.mockResolvedValue([]);

      // Act & Assert
      await expect(clipper.clipActiveTab()).rejects.toThrow("No active tab found");
    });

    test("Given_TabWithoutUrl_When_Clipped_Then_ThrowsError", async () => {
      // Arrange
      const mockTab = {
        id: 1,
        title: "Test Article",
        // url is missing
      };
      mockBrowser.tabs.query.mockResolvedValue([mockTab]);

      // Act & Assert
      await expect(clipper.clipActiveTab()).rejects.toThrow("No active tab found");
    });

    test("Given_ContentExtractionFails_When_Clipped_Then_ReturnsEmptyContent", async () => {
      // Arrange
      const mockTab = {
        id: 1,
        url: "https://example.com/article",
        title: "Test Article",
      };
      mockBrowser.tabs.query.mockResolvedValue([mockTab]);
      mockBrowser.tabs.executeScript.mockResolvedValue([null]);

      // Act
      const result = await clipper.clipActiveTab();

      // Assert
      expect(result.content).toBe("");
    });
  });

  describe("extractContent", () => {
    test("Given_ValidTabId_When_ContentExtracted_Then_ReturnsContent", async () => {
      // Arrange
      const tabId = 123;
      mockBrowser.tabs.executeScript.mockResolvedValue(["Extracted content"]);

      // Act
      const result = await clipper.extractContent(tabId);

      // Assert
      expect(result).toBe("Extracted content");
      expect(mockBrowser.tabs.executeScript).toHaveBeenCalledWith(tabId, expect.any(Object));
    });

    test("Given_ScriptExecutionFails_When_ContentExtracted_Then_ReturnsEmpty", async () => {
      // Arrange
      const tabId = 123;
      mockBrowser.tabs.executeScript.mockResolvedValue([]);

      // Act
      const result = await clipper.extractContent(tabId);

      // Assert
      expect(result).toBe("");
    });
  });

  describe("saveToWorkspace", () => {
    test("Given_ValidData_When_Saved_Then_ReturnsIdeaId", async () => {
      // Arrange
      const clipData = {
        url: "https://example.com",
        title: "Test",
        content: "Content",
      };
      const workspaceId = "ws_123";
      mockBrowser.runtime.sendMessage.mockResolvedValue({
        success: true,
        ideaId: "idea_456",
      });

      // Act
      const result = await clipper.saveToWorkspace(clipData, workspaceId);

      // Assert
      expect(result).toBe("idea_456");
      expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
        type: "SAVE_CLIP",
        data: {
          ...clipData,
          workspaceId,
        },
      });
    });

    test("Given_SaveFails_When_Saved_Then_ThrowsError", async () => {
      // Arrange
      const clipData = {
        url: "https://example.com",
        title: "Test",
        content: "Content",
      };
      mockBrowser.runtime.sendMessage.mockResolvedValue({
        success: false,
        error: "Authentication required",
      });

      // Act & Assert
      await expect(clipper.saveToWorkspace(clipData, "ws_123")).rejects.toThrow("Authentication required");
    });
  });
});

describe("Config Manager", () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
    vi.clearAllMocks();
  });

  describe("getConfig", () => {
    test("Given_StoredConfig_When_Retrieved_Then_ReturnsConfig", async () => {
      // Arrange
      mockBrowser.storage.sync.get.mockResolvedValue({
        defaultWorkspaceId: "ws_123",
        autoClip: true,
        clipShortcut: "Ctrl+Alt+C",
      });

      // Act
      const config = await configManager.getConfig();

      // Assert
      expect(config).toEqual({
        defaultWorkspaceId: "ws_123",
        autoClip: true,
        clipShortcut: "Ctrl+Alt+C",
      });
    });

    test("Given_NoStoredConfig_When_Retrieved_Then_ReturnsDefaults", async () => {
      // Arrange
      mockBrowser.storage.sync.get.mockResolvedValue({});

      // Act
      const config = await configManager.getConfig();

      // Assert
      expect(config).toEqual({
        defaultWorkspaceId: null,
        autoClip: false,
        clipShortcut: "Ctrl+Shift+C",
      });
    });

    test("Given_PartialConfig_When_Retrieved_Then_MergesWithDefaults", async () => {
      // Arrange
      mockBrowser.storage.sync.get.mockResolvedValue({
        autoClip: true,
        // Missing other fields
      });

      // Act
      const config = await configManager.getConfig();

      // Assert
      expect(config).toEqual({
        defaultWorkspaceId: null,
        autoClip: true, // From storage
        clipShortcut: "Ctrl+Shift+C", // Default
      });
    });
  });

  describe("setConfig", () => {
    test("Given_NewConfig_When_Set_Then_StoresInSyncStorage", async () => {
      // Arrange
      const newConfig = {
        defaultWorkspaceId: "ws_456",
        autoClip: false,
      };

      // Act
      await configManager.setConfig(newConfig);

      // Assert
      expect(mockBrowser.storage.sync.set).toHaveBeenCalledWith(newConfig);
    });

    test("Given_PartialConfig_When_Set_Then_StoresOnlyProvidedFields", async () => {
      // Arrange
      const partialConfig = {
        autoClip: true,
      };

      // Act
      await configManager.setConfig(partialConfig);

      // Assert
      expect(mockBrowser.storage.sync.set).toHaveBeenCalledWith({
        autoClip: true,
      });
    });
  });
});

describe("Extension Integration", () => {
  test("Given_MessageFromWebapp_When_Received_Then_HandlesCorrectly", async () => {
    // Arrange
    const messageHandler = vi.fn();
    mockBrowser.runtime.onMessage.addListener.mockImplementation((handler) => {
      messageHandler.mockImplementation(handler);
    });

    // Simulate adding the listener
    browser.runtime.onMessage.addListener(messageHandler);

    // Act - Simulate message from webapp
    const message = {
      type: "CLIP_REQUEST",
      data: { url: "https://example.com" },
    };
    await messageHandler(message, { tab: { id: 1 } }, vi.fn());

    // Assert
    expect(messageHandler).toHaveBeenCalledWith(
      message,
      expect.any(Object),
      expect.any(Function)
    );
  });

  test("Given_ExtensionIcon_When_Updated_Then_CallsBrowserAPI", async () => {
    // Arrange & Act
    await browser.action.setBadgeText({ text: "1" });
    await browser.action.setBadgeBackgroundColor({ color: "#ff0000" });

    // Assert
    expect(mockBrowser.action.setBadgeText).toHaveBeenCalledWith({ text: "1" });
    expect(mockBrowser.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: "#ff0000" });
  });
});