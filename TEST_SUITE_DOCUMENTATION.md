# Pulse Test Suite Documentation

A pragmatic, comprehensive test suite implementing the modern test pyramid for speed, reliability, and maintainability.

## 🎯 Testing Philosophy

- **70-80% Unit Tests**: Fast, isolated, pure logic
- **15-25% Integration Tests**: Router + API contracts + Convex functions
- **1-5% E2E Tests**: Critical smoke tests only
- **Behavior over Implementation**: Test what users experience
- **Fast Feedback**: Unit tests < 2min, integration parallel, E2E on-demand

## 📁 Project Structure

```
pulse/
├── tests/                          # Shared test utilities
│   ├── harness/
│   │   ├── builders.ts             # Test data factories
│   │   ├── convex-test-harness.ts  # Convex testing utilities
│   │   ├── msw-handlers.ts         # Network mocks
│   │   └── global-*.ts             # Playwright setup/teardown
│   └── contracts/                  # API contract validation
│       ├── *.contract.spec.ts      # Zod schema tests
│       └── vitest.config.ts        # Contract test config
├── apps/
│   ├── web/
│   │   ├── tests/
│   │   │   ├── unit/               # Component & hook tests
│   │   │   ├── integration/        # Router + MSW tests
│   │   │   ├── e2e/               # Playwright smoke tests
│   │   │   └── harness/           # Test utilities
│   │   ├── vitest.config.ts        # Unit test config
│   │   └── vitest.integration.ts   # Integration test config
│   └── extension/
│       └── tests/unit/             # Extension unit tests
└── packages/
    └── backend/
        └── convex/
            ├── *.convex.test.ts    # Convex integration tests
            └── *.unit.test.ts      # Pure function tests
```

## 🧪 Test Types & Commands

### Unit Tests (Fast & Isolated)
```bash
# Run all unit tests
pnpm test:unit

# Run specific package
pnpm -F web test:unit
pnpm -F @pulse/backend test:unit

# Watch mode
pnpm -F web test:watch
```

**Examples:**
- Component behavior: `AddIdeaButton.spec.tsx`
- Pure functions: `date-helpers.spec.ts`
- Custom hooks: `useIdeasQuery.spec.tsx`

### Integration Tests (Real Components + Mocked APIs)
```bash
# Run all integration tests
pnpm test:integration

# Web app integration (router + MSW)
pnpm -F web test:integration
```

**Examples:**
- Route testing: `ideas.route.spec.tsx`
- Convex functions: `ideas.integration.test.ts`

### Contract Tests (API Shape Validation)
```bash
# Run contract tests
pnpm test:contracts
```

**Examples:**
- API schemas: `ideas.contract.spec.ts`
- Extension messages: `chrome-extension.contract.spec.ts`

### E2E Tests (Critical Journeys Only)
```bash
# Run smoke tests (fast)
pnpm test:e2e:smoke

# Run all E2E tests
pnpm test:e2e

# Run specific browser
npx playwright test --project=smoke-chromium
```

**Examples:**
- Auth + create idea: `smoke.spec.ts`
- Web clipper flow: `smoke.spec.ts`

## 📊 Test Coverage Map

| Feature | Unit | Integration | Contract | E2E |
|---------|------|-------------|----------|-----|
| **Auth Flow** | ❌ | ✅ OAuth mocks | ✅ JWT schema | ✅ Sign-in journey |
| **Ideas CRUD** | ✅ Components | ✅ Convex functions | ✅ API schemas | ✅ Create flow |
| **Router** | ❌ | ✅ Full routes | ❌ | ✅ Navigation |
| **UI Components** | ✅ Interactions | ❌ | ❌ | ❌ |
| **Data Validation** | ✅ Pure functions | ❌ | ✅ Zod schemas | ❌ |
| **Chrome Extension** | ✅ Mock APIs | ❌ | ✅ Messages | ✅ Clip flow |

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
Lint & TypeCheck → Unit Tests → Integration Tests
                                     ↓
                 Contract Tests → Build Verification
                                     ↓
                              E2E Tests (on main)
```

**Fast Feedback Loop:**
1. **Lint/TypeCheck** (30s): Code quality gates
2. **Unit Tests** (1-2min): Parallel across packages  
3. **Integration** (2-3min): Router + Convex tests
4. **Contract Tests** (30s): Schema validation
5. **E2E** (3-5min): Only on main branch or when labeled

### Running Locally

```bash
# Quick feedback loop
pnpm check && pnpm test:unit

# Full validation (before PR)
pnpm check && pnpm test:unit && pnpm test:integration && pnpm test:contracts

# Complete suite (CI equivalent)
pnpm test:e2e:smoke
```

## 🛠 Test Utilities

### Data Builders
```typescript
import { TestDataFactory, Scenario } from '@/tests/harness/builders';

// Simple factories
const user = TestDataFactory.user();
const idea = TestDataFactory.idea();

// Fluent builders
const idea = IdeaBuilder.create()
  .withTitle("Test Idea")
  .withPriority("high")
  .build();

// Pre-built scenarios
const { workspace, admin, ideas } = Scenario.workspaceWithIdeas(5);
```

### MSW Handlers
```typescript
import { setupServer } from 'msw/node';
import { defaultHandlers, scenarioHandlers } from '@/tests/harness/msw-handlers';

// Default API mocks
const server = setupServer(...defaultHandlers);

// Scenario-specific mocks
server.use(...scenarioHandlers.empty); // Empty state
server.use(...scenarioHandlers.error); // Error conditions
```

### Convex Test Harness
```typescript
import { createTestContext } from '@/tests/harness/convex-test-harness';

const { t, withAuth, scenarios, reset } = createTestContext();

// Test with auth
const idea = await withAuth("test|user123")
  .mutation(api.ideas.create, { title: "Test" });

// Pre-built scenarios
const { workspaceId, userId } = await scenarios.workspaceWithAdmin();

// Clean up between tests
afterEach(async () => await reset());
```

### Playwright Fixtures
```typescript
import { test, expect } from '@/tests/harness/playwright-fixtures';

test("authenticated flow", async ({ authenticatedPage, testWorkspace }) => {
  await authenticatedPage.goto(`/workspaces/${testWorkspace.id}`);
  await expect(authenticatedPage.getByText(testWorkspace.name)).toBeVisible();
});
```

## 📋 Anti-Patterns We Avoid

❌ **Don't Test:**
- CSS/Tailwind styles (trust the framework)
- Flowbite component internals (test behavior)  
- React/Router internals (test with MSW)
- Every prop combination (test meaningful states)
- Implementation details (test user experience)

❌ **Avoid:**
- UI snapshots (brittle, slow)
- Mocking React Router internals
- Testing file system operations
- Over-mocking Convex (use test harness)
- Exhaustive E2E coverage

✅ **Do Test:**
- User interactions and workflows
- Business logic and edge cases
- API contracts and data shapes
- Error states and loading states
- Accessibility basics (roles, names)

## 🔧 Configuration Files

### Root Package Scripts
```json
{
  "test:unit": "turbo run test:unit",
  "test:integration": "turbo run test:integration", 
  "test:contracts": "vitest run -c tests/contracts/vitest.config.ts",
  "test:e2e": "playwright test",
  "test:e2e:smoke": "playwright test --grep @smoke"
}
```

### Vitest Configurations
- `vitest.config.ts`: Unit tests (jsdom, fast)
- `vitest.integration.config.ts`: Integration tests (MSW, slower)
- `tests/contracts/vitest.config.ts`: Contract tests (node, very fast)

### Playwright Config
- **Projects**: smoke-chromium (fast), firefox/webkit (full runs)
- **Reporters**: HTML, JUnit for CI
- **Timeouts**: 1min per test, 10s per action
- **Artifacts**: Screenshots/videos on failure only

## 📈 Performance Targets

| Test Type | Target Time | Parallel | Frequency |
|-----------|-------------|----------|-----------|
| **Unit** | < 2 minutes | ✅ Per package | Every commit |
| **Integration** | < 3 minutes | ✅ Some scenarios | Every commit |
| **Contract** | < 30 seconds | ✅ All tests | Every commit |
| **E2E Smoke** | < 5 minutes | ❌ Sequential | Main branch |
| **E2E Full** | < 15 minutes | ❌ Sequential | Nightly |

## 🎮 Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   npx playwright install chromium
   ```

2. **Run your first test:**
   ```bash
   pnpm test:unit
   ```

3. **Try integration tests:**
   ```bash
   pnpm -F web test:integration
   ```

4. **Run smoke tests:**
   ```bash
   pnpm test:e2e:smoke
   ```

## 📚 Best Practices

### Writing Tests
1. **Use descriptive names**: `Given_ValidInput_When_Submitted_Then_CreatesIdea`
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Test behavior, not implementation**
4. **Use builders for test data**
5. **Keep tests focused and fast**

### Test Data
1. **Use builders for complex objects**
2. **Seed faker for deterministic results**
3. **Create minimal but realistic data**
4. **Clean up between tests**

### Debugging
1. **Use `test.only()` to isolate failing tests**
2. **Add `console.log()` in test data builders**
3. **Use Playwright trace viewer for E2E issues**
4. **Check MSW handlers for integration test issues**

This test suite provides comprehensive coverage with fast feedback, focusing on user value over implementation details.