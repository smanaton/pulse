import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock webextension-polyfill globally
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

// Global test setup
global.chrome = mockBrowser as any;