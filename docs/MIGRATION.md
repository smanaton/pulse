# Migration Guide: Monolithic to Modular Architecture

This guide helps you migrate existing code to use the new modular architecture introduced in Pulse v2.0.

## Overview of Changes

### What Changed
- Business logic extracted from Convex functions into separate packages
- Shared utilities moved to `@pulse/core` package
- New testing infrastructure with better isolation
- Schema merging system for modular development

### What Stayed the Same
- All existing Convex API endpoints work unchanged
- Database schema remains identical
- Frontend integration points are preserved
- No changes to deployment process

## Migration Checklist

### ✅ Phase 1: Understanding (Week 1)
- [ ] Read [MODULAR_ARCHITECTURE.md](./MODULAR_ARCHITECTURE.md)
- [ ] Review new package structure in `packages/`
- [ ] Run existing tests to ensure nothing broke
- [ ] Explore example refactored functions in `convex/ideas.ts`

### ✅ Phase 2: Development Setup (Week 2)  
- [ ] Update your development environment
- [ ] Install new package dependencies: `pnpm install`
- [ ] Run schema build: `pnpm build:schema`
- [ ] Test the build process: `pnpm build`

### ✅ Phase 3: Code Migration (Weeks 3-4)
- [ ] Migrate custom Convex functions (see examples below)
- [ ] Update any direct imports from helpers
- [ ] Add tests for extracted business logic
- [ ] Update documentation

### ✅ Phase 4: Testing & Validation (Week 5)
- [ ] Run comprehensive test suite: `pnpm test`
- [ ] Test in development environment
- [ ] Validate all existing functionality works
- [ ] Performance testing

## Detailed Migration Steps

### 1. Updating Imports

**Before**:
```typescript
import { sanitizeContent } from "./helpers";
```

**After**:
```typescript
import { sanitizeContent } from "@pulse/core/shared";
// OR for direct imports in Convex functions:
import { sanitizeContent } from "../../../core/src/shared/helpers";
```

### 2. Extracting Business Logic

**Before**: Monolithic Convex function
```typescript
export const createProject = mutation({
  args: { workspaceId: v.id("workspaces"), name: v.string() },
  handler: async (ctx, { workspaceId, name }) => {
    const userId = await requireUserId(ctx);
    await assertMembership(ctx, userId, workspaceId, "editor");
    
    // Business logic mixed with Convex code
    const sanitizedName = name.trim().substring(0, 100);
    if (!sanitizedName) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT", 
        message: "Name is required"
      });
    }
    
    const slug = sanitizedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
      
    const projectId = await ctx.db.insert("projects", {
      workspaceId,
      name: sanitizedName,
      slug,
      status: "active",
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    await logEvent(ctx, workspaceId, "project_created", "project", projectId);
    return projectId;
  },
});
```

**After**: Modular approach

**Step 1**: Create business logic service (`packages/projects-logic/src/services/project-service.ts`)
```typescript
export interface CreateProjectInput {
  workspaceId: Id<"workspaces">;
  name: string;
  createdBy: Id<"users">;
}

export interface ProjectCreationResult {
  success: boolean;
  data?: ProcessedProjectData;
  errors?: string[];
}

export async function processProjectCreation(
  input: CreateProjectInput
): Promise<ProjectCreationResult> {
  // Validate input
  const validation = validateCreateProjectInput(input);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors.map(e => e.message),
    };
  }

  // Transform to database format
  const data = transformCreateProjectInput(input);

  return {
    success: true,
    data,
  };
}
```

**Step 2**: Update Convex function
```typescript
import { processProjectCreation } from "@pulse/projects-logic/services";

export const createProject = mutation({
  args: { workspaceId: v.id("workspaces"), name: v.string() },
  handler: async (ctx, { workspaceId, name }) => {
    const userId = await requireUserId(ctx);
    await assertMembership(ctx, userId, workspaceId, "editor");
    
    // Business logic handled by service
    const result = await processProjectCreation({
      workspaceId,
      name,
      createdBy: userId,
    });
    
    if (!result.success) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: result.errors?.[0] || "Failed to create project",
      });
    }
    
    // Database operations stay in Convex
    const projectId = await ctx.db.insert("projects", result.data);
    await logEvent(ctx, workspaceId, "project_created", "project", projectId);
    
    return projectId;
  },
});
```

### 3. Creating New Packages

When creating a new logic package (e.g., `@pulse/projects-logic`):

**Directory Structure**:
```
packages/projects-logic/
├── src/
│   ├── services/
│   │   ├── index.ts
│   │   └── project-service.ts
│   ├── transformers/
│   │   └── index.ts
│   ├── validators/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── test/
│   │   └── setup.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**package.json**:
```json
{
  "name": "@pulse/projects-logic",
  "version": "0.1.0",
  "dependencies": {
    "@pulse/core": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.18.0",
    "typescript": "^5.9.2",
    "vitest": "^3.2.4"
  }
}
```

### 4. Writing Tests

**Before**: Testing Convex functions required full setup
```typescript
// Difficult to test business logic in isolation
test("should create project", async () => {
  const t = convexTest(schema, modules);
  const result = await t.mutation(api.projects.create, {
    workspaceId: "workspace123",
    name: "Test Project"
  });
  expect(result).toBeDefined();
});
```

**After**: Test business logic independently
```typescript
// Test pure business logic
test("should process project creation", async () => {
  const input = {
    workspaceId: "workspace123" as Id<"workspaces">,
    name: "Test Project",
    createdBy: "user123" as Id<"users">,
  };
  
  const result = await processProjectCreation(input);
  
  expect(result.success).toBe(true);
  expect(result.data?.name).toBe("Test Project");
  expect(result.data?.slug).toBe("test-project");
});

// Test validation separately
test("should reject invalid input", async () => {
  const input = {
    workspaceId: "workspace123" as Id<"workspaces">,
    name: "", // Invalid
    createdBy: "user123" as Id<"users">,
  };
  
  const result = await processProjectCreation(input);
  
  expect(result.success).toBe(false);
  expect(result.errors).toContain("Name is required");
});
```

## Common Migration Patterns

### Pattern 1: Simple Validation

**Before**:
```typescript
const sanitizedTitle = title.trim().substring(0, 200);
if (!sanitizedTitle) {
  throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Title required" });
}
```

**After**:
```typescript
const result = await processCreation({ title, ... });
if (!result.success) {
  throw new ConvexError({
    code: "INVALID_ARGUMENT",
    message: result.errors?.[0] || "Validation failed",
  });
}
```

### Pattern 2: Complex Business Logic

**Before**:
```typescript
// 50 lines of business logic mixed with database calls
const processed = /* complex logic */;
await ctx.db.insert(table, processed);
```

**After**:
```typescript
const result = await processBusinessLogic(input);
if (result.success) {
  await ctx.db.insert(table, result.data);
}
```

### Pattern 3: Reusable Utilities

**Before**:
```typescript
// Duplicated across multiple files
function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
```

**After**:
```typescript
import { generateSlug } from "@pulse/core/shared";
// Used consistently across all packages
```

## Testing Strategy

### 1. Unit Tests (New)
Test business logic in isolation:
```bash
pnpm --filter @pulse/projects-logic test
```

### 2. Integration Tests (Enhanced)  
Test Convex functions with the new architecture:
```bash
pnpm --filter @pulse/backend test:integration
```

### 3. E2E Tests (Unchanged)
Frontend integration tests remain the same:
```bash
pnpm --filter web test:e2e
```

## Deployment Considerations

### Build Process
The new architecture requires an additional build step:

```bash
# Build schema from modular definitions
pnpm build:schema

# Build all packages
pnpm build

# Deploy (unchanged)
pnpm --filter @pulse/backend deploy
```

### CI/CD Updates
Update your CI pipeline to include the new build steps:

```yaml
- name: Build Schema
  run: pnpm build:schema

- name: Build Packages  
  run: pnpm build

- name: Run Tests
  run: pnpm test
```

## Troubleshooting

### Common Issues

**Issue**: Import errors in Convex functions
```
Could not resolve "@pulse/ideas-logic/services"
```

**Solution**: Use relative imports temporarily:
```typescript
import { processIdeaCreation } from "../../../ideas-logic/src/services/idea-service";
```

**Issue**: TypeScript path resolution
```
Cannot find module '@pulse/core/types'
```

**Solution**: Check `tsconfig.json` paths configuration and ensure packages are built.

**Issue**: Tests failing after migration
```
Module not found in test files
```

**Solution**: Update test setup files and ensure proper mocking of dependencies.

## Rollback Plan

If migration issues arise, you can rollback by:

1. **Revert Convex Functions**: Use git to revert function changes
2. **Remove New Packages**: Delete package directories  
3. **Restore Old Imports**: Change back to original import statements
4. **Run Original Tests**: Ensure everything works as before

## Getting Help

If you encounter issues during migration:

1. Check the [MODULAR_ARCHITECTURE.md](./MODULAR_ARCHITECTURE.md) documentation
2. Review existing migrated code in `convex/ideas.ts`
3. Run tests to identify specific issues
4. Check the troubleshooting section above

## Post-Migration Benefits

After successful migration, you'll benefit from:

- ✅ **Better Testing**: Test business logic independently
- ✅ **Improved Code Organization**: Clear separation of concerns
- ✅ **Enhanced Reusability**: Share logic across different contexts
- ✅ **Easier Maintenance**: Smaller, focused modules
- ✅ **Better Developer Experience**: Clearer code structure
- ✅ **Future Scalability**: Easy to add new features as modules