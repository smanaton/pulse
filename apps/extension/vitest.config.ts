import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Extension tests should be fast
    testTimeout: 5000,
    include: [
      "tests/**/*.spec.ts",
      "src/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/**/*.{ts,js}",
      ],
      exclude: [
        "src/**/*.test.{ts,js}",
        "src/**/*.d.ts",
        "tests/**/*",
      ],
    },
    // Mock browser APIs by default
    deps: {
      inline: ["webextension-polyfill"],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});