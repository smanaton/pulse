# Testing Patterns for Pulse Project

This document outlines the established testing patterns for the Pulse project, covering both Convex backend functions and React components.

## Overview

Our testing strategy consists of:
- **Convex Function Testing**: Using `convex-test` for backend function testing
- **React Component Testing**: Using Vitest + Testing Library with mocked Convex hooks
- **Workspace Isolation**: Ensuring tests don't interfere with each other
- **Authentication Testing**: Proper patterns for auth-dependent functions

## Convex Function Testing Patterns

### Basic Setup

```typescript
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("Workspace Functions", () => {
  test("should create workspace", async () => {
    const t = convexTest(schema, modules);

    const result = await t
      .withIdentity({
        tokenIdentifier: `user123|${crypto.randomUUID()}`,
        email: "test@example.com",
        name: "Test User",
      })
      .mutation(api.workspaces.createShared, {
        name: "Test Workspace",
        slug: "test-workspace",
      });

    expect(result).toMatchObject({
      name: "Test Workspace",
      slug: "test-workspace",
      type: "shared",
      isPersonal: false,
    });
  });
});
```

### Key Principles

1. **Always use tokenIdentifier pattern for authentication**
   ```typescript
   const identity = {
     tokenIdentifier: `user123|${crypto.randomUUID()}`,
     email: "test@example.com",
     name: "Test User",
   };
   ```

2. **Use unique identifiers to prevent test interference**
   ```typescript
   const uniqueId = crypto.randomUUID();
   const identity = { tokenIdentifier: `user_${uniqueId}|${uniqueId}` };
   ```

3. **Test workspace isolation patterns**
   ```typescript
   test("should only return user's own workspaces", async () => {
     const t = convexTest(schema, modules);
     
     // Create workspace for user 1
     const user1Identity = { tokenIdentifier: "user1|123" };
     await t.withIdentity(user1Identity)
       .mutation(api.workspaces.createShared, { name: "User 1 Workspace" });
     
     // Create workspace for user 2  
     const user2Identity = { tokenIdentifier: "user2|456" };
     await t.withIdentity(user2Identity)
       .mutation(api.workspaces.createShared, { name: "User 2 Workspace" });
     
     // Verify isolation
     const user1Workspaces = await t.withIdentity(user1Identity)
       .query(api.workspaces.list);
     expect(user1Workspaces).toHaveLength(1);
     expect(user1Workspaces[0].name).toBe("User 1 Workspace");
   });
   ```

4. **Test validation and error cases**
   ```typescript
   test("should validate workspace name", async () => {
     const t = convexTest(schema, modules);
     const identity = { tokenIdentifier: "testing|validation_user" };

     await expect(
       t.withIdentity(identity).mutation(api.workspaces.createShared, {
         name: "", // Invalid empty name
         slug: "test-workspace",
       })
     ).rejects.toThrow("Workspace name cannot be empty");
   });
   ```

### Workspace Membership Testing

```typescript
test("should enforce workspace membership", async () => {
  const t = convexTest(schema, modules);
  
  // User 1 creates a workspace
  const user1 = { tokenIdentifier: "user1|123" };
  const workspace = await t.withIdentity(user1)
    .mutation(api.workspaces.createShared, { name: "Private Workspace" });
  
  // User 2 tries to access user 1's workspace
  const user2 = { tokenIdentifier: "user2|456" };
  await expect(
    t.withIdentity(user2)
      .query(api.projects.list, { workspaceId: workspace._id })
  ).rejects.toThrow("Access denied");
});
```

## React Component Testing Patterns

### Component with Convex Hooks

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ClientsTable } from "../ClientsTable";
import { TestDataFactory } from "../../test/convex-test-setup";

// Mock the Convex hooks
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

describe("ClientsTable", () => {
  test("should display clients when loaded", async () => {
    const mockClients = [
      TestDataFactory.client({ name: "Acme Corp" }),
      TestDataFactory.client({ name: "Beta Inc" }),
    ];

    vi.mocked(useQuery).mockReturnValue({
      data: { clients: mockClients },
      isLoading: false,
    });

    render(<ClientsTable />);

    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("Beta Inc")).toBeInTheDocument();
    });
  });

  test("should show loading state", () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<ClientsTable />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```

### Testing User Interactions with Mutations

```typescript
import userEvent from "@testing-library/user-event";

test("should create new client on form submit", async () => {
  const user = userEvent.setup();
  const mockCreateClient = vi.fn().mockResolvedValue("new_client_id");
  
  vi.mocked(useMutation).mockReturnValue(mockCreateClient);
  vi.mocked(useQuery).mockReturnValue({
    data: { clients: [] },
    isLoading: false,
  });

  render(<ClientsTable onCreateClient={() => {}} />);

  const createButton = screen.getByText("Add Client");
  await user.click(createButton);

  // Verify the mutation was called
  expect(mockCreateClient).toHaveBeenCalledWith({
    name: expect.any(String),
    workspaceId: expect.any(String),
  });
});
```

## Test Data Factory Patterns

### Using the Test Data Factory

```typescript
// Located in apps/web/src/test/convex-test-setup.ts
export const TestDataFactory = {
  user: (overrides = {}) => ({
    _id: "user_123" as Id<"users">,
    _creationTime: Date.now(),
    name: "Test User",
    email: "test@example.com",
    tokenIdentifier: "testing|user123",
    ...overrides,
  }),

  workspace: (overrides = {}) => ({
    _id: "workspace_123" as Id<"workspaces">,
    _creationTime: Date.now(),
    name: "Test Workspace",
    slug: "test-workspace",
    type: "shared" as const,
    isPersonal: false,
    ...overrides,
  }),

  client: (overrides = {}) => ({
    _id: "client_123" as Id<"clients">,
    _creationTime: Date.now(),
    name: "Test Client",
    email: "client@example.com",
    workspaceId: "workspace_123" as Id<"workspaces">,
    ...overrides,
  }),
};
```

### Creating Related Test Data

```typescript
test("should handle client-project relationships", async () => {
  const t = convexTest(schema, modules);
  const identity = { tokenIdentifier: "user|test" };

  // Create workspace first
  const workspace = await t.withIdentity(identity)
    .mutation(api.workspaces.createShared, { name: "Test Workspace" });

  // Create client in that workspace
  const client = await t.withIdentity(identity)
    .mutation(api.clients.create, {
      name: "Test Client",
      workspaceId: workspace._id,
    });

  // Create project for that client
  const project = await t.withIdentity(identity)
    .mutation(api.projects.create, {
      name: "Test Project",
      clientId: client._id,
      workspaceId: workspace._id,
    });

  // Verify relationships
  const clientProjects = await t.withIdentity(identity)
    .query(api.projects.listByClient, { clientId: client._id });
  
  expect(clientProjects).toHaveLength(1);
  expect(clientProjects[0]._id).toBe(project._id);
});
```

## Authentication Flow Testing

### Testing Protected Routes

```typescript
test("should redirect unauthenticated users", async () => {
  const t = convexTest(schema, modules);

  // Try to access protected function without identity
  await expect(
    t.query(api.workspaces.list)
  ).rejects.toThrow("Authentication required");
});

test("should allow authenticated access", async () => {
  const t = convexTest(schema, modules);
  const identity = { tokenIdentifier: "user|authenticated" };

  // Should work with proper identity
  const result = await t.withIdentity(identity)
    .query(api.workspaces.list);
  
  expect(Array.isArray(result)).toBe(true);
});
```

## Best Practices Summary

### Do's ✅

1. **Use tokenIdentifier pattern consistently**
2. **Create unique test identities to prevent interference**
3. **Test both success and error cases**
4. **Use TestDataFactory for consistent test data**
5. **Mock Convex hooks properly in component tests**
6. **Test workspace isolation and member permissions**
7. **Use descriptive test names that explain the expected behavior**

### Don'ts ❌

1. **Don't reuse the same tokenIdentifier across tests**
2. **Don't test implementation details, focus on behavior**
3. **Don't forget to test error conditions**
4. **Don't skip cleanup between tests**
5. **Don't test multiple unrelated things in one test**
6. **Don't use any types in test code**

## Running Tests

```bash
# Run all tests
pnpm test

# Run backend tests only
pnpm test:backend

# Run frontend tests only  
pnpm test:web

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

## Debugging Tests

### Common Issues and Solutions

1. **Tests interfering with each other**
   - Solution: Use unique tokenIdentifiers and workspace IDs

2. **Convex functions not found**
   - Solution: Ensure test.setup.ts includes all necessary modules

3. **Authentication failures**
   - Solution: Verify tokenIdentifier format and identity object structure

4. **Type errors in tests**
   - Solution: Use proper TypeScript interfaces, avoid `any` types

This documentation should be updated as new patterns emerge and the testing requirements evolve.