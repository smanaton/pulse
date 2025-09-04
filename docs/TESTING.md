# Testing Guide

## Overview

Pulse uses a standardized testing system built on **Vitest v3.2.4** across all packages in the monorepo. This guide covers our testing patterns, configuration, and best practices.

## Architecture

### Testing Stack
- **Test Runner**: Vitest v3.2.4
- **Assertion Library**: Vitest built-in (Jest-compatible)
- **DOM Testing**: jsdom for browser environments
- **React Testing**: @testing-library/react
- **Mocking**: Vitest's built-in vi mocking
- **Coverage**: v8 provider

### Package Structure
```
pulse/
├── apps/
│   ├── web/                    # React app (jsdom)
│   └── chrome-extension/       # Web extension (jsdom + chrome APIs)
├── packages/
│   ├── backend/               # Convex functions (edge-runtime)
│   ├── core/                  # Shared utilities (node)
│   └── ideas-logic/           # Business logic (node)
```

## Configuration

### Package-level Configuration

Each package has its own `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths"; // Optional

export default defineConfig({
  plugins: [tsconfigPaths()], // For path aliases
  test: {
    environment: "node", // or "jsdom" for browser code
    globals: true,
    setupFiles: ["./src/test/setup.ts"], // Optional
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{js,ts}"],
      exclude: [
        "src/**/*.{test,spec}.{js,ts}",
        "src/**/*.d.ts",
        "src/index.ts",
      ],
    },
  },
});
```

### Environment-specific Settings

#### Node Environment (packages/core, packages/ideas-logic)
```typescript
test: {
  environment: "node",
  globals: true,
}
```

#### DOM Environment (apps/web, apps/chrome-extension)
```typescript
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

#### Edge Runtime Environment (packages/backend)
```typescript
test: {
  environment: "edge-runtime", // For Convex functions
  server: {
    deps: {
      inline: ["convex-test"], // Required for convex-test
    },
  },
}
```

## Testing Patterns

### 1. Mock Organization

#### Web App Centralized Mocks (`apps/web/src/test/mocks/`)
```typescript
// convex.mock.tsx
export const convexMock = {
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useAction: vi.fn(),
  // ... other mocks
};

vi.mock("convex/react", () => convexMock);
```

#### Setup File Pattern
```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";

// Auto-import all mocks
import "./mocks/convex.mock";
import "./mocks/router.mock";
// ... other mocks
```

### 2. Mock Hoisting

**❌ Wrong**: Variables in mock factory cause hoisting issues
```typescript
const mockFn = vi.fn();
vi.mock("module", () => ({ fn: mockFn })); // Error!
```

**✅ Correct**: Inline functions or hoist mock before imports
```typescript
vi.mock("module", () => ({
  fn: vi.fn(() => "mocked"),
}));

// Or hoist before imports:
vi.mock("@pulse/core/shared", () => ({
  sanitizeContent: (content: string) => content.replace(/script/g, ""),
}));

import { myFunction } from "./myModule";
```

### 3. Convex Testing

#### Backend Tests (packages/backend)
```typescript
import { convexTest } from "convex-test";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const t = convexTest(schema);

test("should create workspace", async () => {
  const identity = { 
    tokenIdentifier: `user123|${crypto.randomUUID()}` 
  };
  
  const workspaceId = await t
    .withIdentity(identity)
    .mutation(api.workspaces.create, {
      name: "Test Workspace",
    });
  
  expect(workspaceId).toBeDefined();
});
```

#### Web App Convex Mocks
```typescript
// Mock Convex hooks
export const convexMock = {
  useQuery: vi.fn((query: unknown, args?: unknown) => {
    if (query.includes("ideas")) return [TestDataFactory.idea()];
    if (query.includes("workspaces")) return [TestDataFactory.workspace()];
    return null;
  }),
  useMutation: vi.fn(() => vi.fn(async () => "test_id_123")),
};
```

### 4. Component Testing

#### React Component Tests
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IdeaCard } from "./IdeaCard";

test("should display idea title and content", () => {
  const idea = TestDataFactory.idea();
  
  render(<IdeaCard idea={idea} />);
  
  expect(screen.getByText(idea.title)).toBeInTheDocument();
  expect(screen.getByText(idea.contentMD)).toBeInTheDocument();
});

test("should handle click events", async () => {
  const user = userEvent.setup();
  const onEdit = vi.fn();
  
  render(<IdeaCard idea={idea} onEdit={onEdit} />);
  
  await user.click(screen.getByRole("button", { name: /edit/i }));
  
  expect(onEdit).toHaveBeenCalledWith(idea._id);
});
```

### 5. Business Logic Testing

#### Pure Function Tests
```typescript
import { validateCreateIdeaInput } from "./validators";

test("should validate correct input", () => {
  const input = {
    title: "Valid Title",
    contentMD: "Valid content",
    workspaceId: "workspace123",
    createdBy: "user123",
  };

  const result = validateCreateIdeaInput(input);
  
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});

test("should reject invalid input", () => {
  const input = { /* invalid data */ };
  const result = validateCreateIdeaInput(input);
  
  expect(result.valid).toBe(false);
  expect(result.errors[0].field).toBe("title");
  expect(result.errors[0].code).toBe("TITLE_REQUIRED");
});
```

### 6. Extension Testing

#### Chrome Extension Setup
```typescript
// src/test/setup.ts
global.chrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
  },
  storage: {
    local: { get: vi.fn(), set: vi.fn() },
  },
  tabs: { query: vi.fn() },
};

global.browser = global.chrome; // Firefox compatibility
```

## Commands

### Run All Tests
```bash
pnpm -w test              # All packages
pnpm test:unit            # Unit tests only
pnpm test:integration     # Integration tests only
pnpm test:coverage        # With coverage
```

### Package-specific Tests
```bash
pnpm -F @pulse/core test
pnpm -F @pulse/backend test
pnpm -F web test
pnpm -F pulse-web-clipper test
```

### Watch Mode
```bash
pnpm test:watch           # All packages
pnpm -F web test:watch    # Specific package
```

## Best Practices

### 1. Test Organization
- **Unit tests**: Test individual functions/components
- **Integration tests**: Test feature workflows
- **E2E tests**: Test complete user journeys (separate from Vitest)

### 2. Naming Conventions
- Test files: `*.test.ts` or `*.spec.ts`
- Test suites: Describe the unit being tested
- Test cases: Should describe expected behavior

```typescript
describe("IdeaValidator", () => {
  describe("validateCreateIdeaInput", () => {
    it("should accept valid input", () => {
      // Test implementation
    });
    
    it("should reject empty title", () => {
      // Test implementation
    });
  });
});
```

### 3. Mock Strategy
- **Mock external dependencies**: APIs, databases, file system
- **Don't mock what you're testing**: Test actual business logic
- **Use factory patterns**: Create consistent test data

### 4. Test Data Management
```typescript
// TestDataFactory pattern
export const TestDataFactory = {
  idea: (overrides = {}) => ({
    _id: "idea123",
    title: "Test Idea",
    contentMD: "Test content",
    status: "draft",
    createdAt: Date.now(),
    ...overrides,
  }),
  
  workspace: (overrides = {}) => ({
    _id: "workspace123",
    name: "Test Workspace",
    ...overrides,
  }),
};
```

### 5. Assertion Guidelines
- **Be specific**: Use precise matchers
- **Test behavior**: Not implementation details
- **Use semantic queries**: `getByRole`, `getByLabelText` over `getByTestId`

## Coverage Guidelines

### Minimum Coverage Targets
- **Utilities/Logic**: 90%+
- **Components**: 80%+
- **Integration**: 70%+

### Coverage Commands
```bash
pnpm test:coverage                    # All packages
pnpm -F @pulse/core test:coverage     # Specific package
```

## Debugging Tests

### VS Code Integration
Add to `.vscode/settings.json`:
```json
{
  "vitest.enable": true,
  "vitest.commandLine": "pnpm test",
}
```

### Debug Mode
```bash
pnpm -F web test --reporter=verbose --no-coverage
```

### Common Issues

#### Mock Hoisting Errors
```
Error: Cannot access 'mockVariable' before initialization
```
**Solution**: Move mocks before imports or use inline functions.

#### Path Resolution Issues
```
Error: Cannot resolve module '@/components'
```
**Solution**: Add `vite-tsconfig-paths` plugin to vitest config.

#### Environment Mismatches
```
Error: document is not defined
```
**Solution**: Check `environment` setting in vitest config.

## Turbo Integration

### Pipeline Configuration
```json
{
  "test": {
    "inputs": [
      "$TURBO_DEFAULT$",
      "**/*.test.*",
      "**/*.spec.*",
      "vitest.config.*",
      "package.json",
      "tsconfig*.json"
    ],
    "outputs": ["coverage/**"],
    "cache": true
  }
}
```

### Caching
- Tests are cached based on source code and config changes
- Coverage reports are cached as outputs
- Use `--force` to bypass cache

## Migration Notes

### From Jest to Vitest
1. Update imports: `vitest` instead of `@jest/globals`
2. Update config: `vitest.config.ts` instead of `jest.config.js`
3. Mock syntax: `vi.mock()` instead of `jest.mock()`
4. Setup files: `setupFiles` instead of `setupFilesAfterEnv`

### Package Dependencies
Each package should have:
```json
{
  "devDependencies": {
    "vitest": "^3.2.4",
    "@vitest/coverage-v8": "^3.2.4"
  }
}
```

For DOM testing:
```json
{
  "devDependencies": {
    "jsdom": "^26.1.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.8.0"
  }
}
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library Docs](https://testing-library.com)
- [Convex Testing Guide](https://docs.convex.dev/functions/testing)
- [Chrome Extension Testing](https://developer.chrome.com/docs/extensions/mv3/tut_unit_testing/)

---

This testing system provides consistent, reliable, and maintainable test coverage across the entire Pulse monorepo.