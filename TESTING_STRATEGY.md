# Pulse Project - Testing Strategy & Implementation Plan

## Overview
This document outlines the comprehensive testing strategy for the Pulse monorepo project, following modern test pyramid principles with a focus on behavior-driven testing and maintainability.

## Testing Philosophy

### Core Principles
1. **Test Behavior, Not Implementation** - Focus on what the system does, not how it does it
2. **Modern Test Pyramid** - 70-80% unit tests, 15-25% integration, 1-5% E2E
3. **Fast & Deterministic** - Tests must run quickly and produce consistent results
4. **Given_When_Then Naming** - Clear, descriptive test names that explain the scenario
5. **No Test Duplication** - Each behavior tested at only one level of the pyramid
6. **Contract-Based Testing** - Use schema validation and API contracts over E2E when possible

### Test Categories
- **Unit Tests** - Individual functions, components, utilities
- **Integration Tests** - Database operations, API endpoints, service interactions
- **Contract Tests** - Schema validation, API contracts, data flows
- **E2E Smoke Tests** - Critical user journeys only

## Technology Stack

### Backend Testing (Convex)
- **Framework**: Vitest
- **Convex Testing**: convex-test for function testing
- **Naming Convention**: `*.convex.test.ts` for Convex functions
- **Test Data**: faker.js for realistic test data generation
- **Authentication**: Mock identity tokens with `withIdentity()`

### Frontend Testing (React)
- **Framework**: Vitest + Testing Library
- **Component Testing**: @testing-library/react
- **Mocking**: MSW (Mock Service Worker) for API mocking
- **Hooks Testing**: @testing-library/react-hooks
- **User Interactions**: user-event library

### E2E Testing
- **Framework**: Playwright
- **Scope**: Critical user journeys only
- **Focus**: Login, core workflows, data integrity

## Implementation Status

### ✅ Completed Systems

#### 1. API Keys System (16 tests)
**Status**: All tests passing ✅
- **Coverage**: Key generation, validation, security, permissions, revocation, usage tracking
- **Key Fixes**: Schema validation (missing `isPersonal`, role values, prefix regex, event fields)

#### 2. Authentication System (10 tests) 
**Status**: All tests passing ✅
- **Coverage**: User auth, security, profile management, providers, session management
- **Key Fixes**: Invalid token handling, empty name validation expectations

#### 3. Projects System (41 tests)
**Status**: All tests passing ✅
- **Coverage**: Complete CRUD, member management, statistics, event logging, permissions
- **Key Fixes**: Multiple schema issues (clients status, tasks reporterId/position/sortKey, event types)

**Total Implemented**: 67 tests across 3 systems

### 🔄 In Progress Systems

#### 4. Tasks System (Critical)
**Status**: Ready for implementation
- **Scope**: Task CRUD, assignment, status management, time tracking, comments, dependencies
- **Dependencies**: Projects system (completed)
- **Estimated**: 35-40 tests

### 📋 Pending Critical Systems

#### 5. Ideas System (Critical)
**Status**: Tests exist but blocked by business logic issues
- **Issue**: Missing `ownerId` field requirement in business logic layer
- **Scope**: Idea management, folders, search, AI features, web clipping
- **Estimated**: 30+ tests (existing, needs fixes)

#### 6. Agents System
**Status**: Not started
- **Scope**: Agent management, orchestration, configurations
- **Estimated**: 20-25 tests

#### 7. AI Services
**Status**: Not started  
- **Scope**: AI integration, summarization, tagging
- **Estimated**: 15-20 tests

#### 8. Files System
**Status**: Not started
- **Scope**: File upload, storage, attachment management  
- **Estimated**: 12-15 tests

## Test Implementation Patterns

### Convex Function Testing Pattern
```typescript
describe("System Name", () => {
  let t: ReturnType<typeof convexTest>;
  let adminUserId: any;
  let workspaceId: any;

  beforeEach(async () => {
    t = convexTest(schema, modules);
    
    // Setup test data with proper schema compliance
    adminUserId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Admin User",
        email: "admin@test.com", 
        tokenIdentifier: "test|admin123",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
  });

  afterEach(async () => {
    // Clean up all test data
    await t.run(async (ctx) => {
      const tables = ["table1", "table2"];
      for (const table of tables) {
        const docs = await ctx.db.query(table).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
      }
    });
  });

  test("Given_ValidInput_When_Action_Then_ExpectedResult", async () => {
    // Arrange - Set up test conditions
    
    // Act - Execute the function
    const result = await t
      .withIdentity({ tokenIdentifier: "test|admin123" })
      .mutation(api.system.action, { args });
    
    // Assert - Verify results
    expect(result).toMatchObject({ expected });
  });
});
```

### Schema Validation Requirements
All test data must comply with schema requirements:

**Common Required Fields**:
- `users`: name, tokenIdentifier, createdAt, updatedAt
- `workspaces`: name, type, isPersonal, plan, createdAt, updatedAt  
- `projects`: workspaceId, name, status, priority, ownerId, sortKey, createdBy, createdAt, updatedAt
- `tasks`: workspaceId, projectId, name, status, priority, reporterId, position, sortKey, createdBy, createdAt, updatedAt
- `clients`: workspaceId, name, status, createdBy, createdAt, updatedAt

## Quality Metrics & Coverage Goals

### Target Coverage
- **Backend Functions**: 90%+ test coverage
- **Critical Business Logic**: 100% coverage
- **Permission & Validation**: 100% coverage  
- **Error Handling**: 100% coverage

### Quality Gates
- All tests must pass before PR merge
- No skipped tests in main branch
- Test execution time < 30 seconds total
- Zero flaky tests tolerance

## Test Data Management

### Test Data Strategy
- **Isolated**: Each test creates its own data
- **Deterministic**: Use fixed seeds for faker
- **Realistic**: Use faker for realistic data
- **Complete**: Always include required schema fields
- **Clean**: Full cleanup after each test

### Common Test Fixtures
```typescript
// User fixtures
const createTestUser = (role: string) => ({
  name: `${role} User`,
  email: `${role.toLowerCase()}@test.com`,
  tokenIdentifier: `test|${role.toLowerCase()}123`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Workspace fixtures  
const createTestWorkspace = () => ({
  name: "Test Workspace",
  type: "shared" as const,
  isPersonal: false,
  plan: "free" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

## Continuous Integration

### Test Execution
- **Pre-commit**: Lint + unit tests for changed files
- **Pre-push**: Full test suite + typecheck
- **PR Pipeline**: All tests + coverage report
- **Main Branch**: Full test suite + deployment tests

### Performance Monitoring
- Track test execution times
- Monitor test reliability metrics
- Alert on test failures or performance degradation

## Known Issues & Technical Debt

### Schema Validation Challenges
1. **Complex Dependencies**: Many tables have intricate required field relationships
2. **Business Logic Coupling**: Some tests blocked by business logic architecture issues
3. **Event Type Maintenance**: Event types must be kept in sync between validators and schema

### Areas for Improvement
1. **Test Data Builders**: Create reusable builders for complex entities
2. **Test Utilities**: Extract common assertion patterns
3. **Performance**: Some integration tests are slower than desired
4. **Error Message Consistency**: Standardize error messages across the system

## Next Steps

### Immediate (Next 1-2 Sessions)
1. ✅ Complete Tasks system tests (35-40 tests)
2. 🔍 Debug and fix Ideas system business logic issues
3. 🏗️ Implement Agents system tests

### Short Term (Next 3-5 Sessions)  
1. Complete AI Services testing
2. Implement Files system testing
3. Address Extension build issues
4. Fix critical lint issues

### Medium Term
1. Frontend component testing implementation
2. E2E smoke test implementation
3. Performance optimization
4. Test utilities and builders library

## Success Metrics

### Quantitative Goals
- **150+ backend tests** across all critical systems
- **90%+ code coverage** for business logic
- **< 30 second** full test suite execution time
- **Zero flaky tests** in CI pipeline

### Qualitative Goals
- High confidence in deployments
- Fast feedback for developers
- Clear test failure diagnostics
- Maintainable test codebase

---

*Last Updated: January 2025*
*Next Review: After Tasks system completion*