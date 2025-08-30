# Pulse Modular Architecture

## Overview

Pulse has been refactored from a monolithic backend into a modular architecture that separates concerns, improves testability, and enables better code reuse. This document describes the new architecture and how to work with it.

## Architecture Principles

### 1. Separation of Concerns
- **Core Package (`@pulse/core`)**: Shared types, validators, and utilities
- **Logic Packages (`@pulse/ideas-logic`)**: Pure business logic without Convex dependencies
- **Convex Layer**: Database operations, authentication, and API endpoints

### 2. Dependency Flow
```
Convex Functions → Logic Packages → Core Package
```

### 3. Pure Business Logic
- Business logic is extracted into packages that can be tested independently
- No Convex dependencies in logic packages
- Database operations stay in Convex functions

## Package Structure

### Core Package (`packages/core/`)
```
packages/core/
├── src/
│   ├── types/           # Shared TypeScript types
│   ├── validators/      # Convex validators (reusable)
│   ├── auth/            # Authentication types and helpers
│   ├── workspaces/      # Workspace utilities
│   ├── users/           # User utilities
│   └── shared/          # Common utilities
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**Purpose**: Provides shared types, validators, and utility functions used across all other packages.

**Key Exports**:
- Type definitions for all entities (User, Workspace, Idea, etc.)
- Convex validators for input validation
- Authentication guard interfaces and helpers
- Common utility functions (sanitization, formatting, etc.)

### Ideas Logic Package (`packages/ideas-logic/`)
```
packages/ideas-logic/
├── src/
│   ├── services/        # Main business logic
│   ├── transformers/    # Data transformation functions
│   ├── validators/      # Runtime validation (non-Convex)
│   ├── types/           # Package-specific types
│   └── test/            # Test setup
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**Purpose**: Contains all business logic for idea management without any Convex dependencies.

**Key Features**:
- Idea creation and update processing
- Content validation and sanitization
- Search query processing
- Tag management and suggestions
- Folder hierarchy operations
- Export/import functionality

## How It Works

### 1. Request Flow
```
1. Client Request → Convex Function
2. Convex Function → Auth/Permission Checks
3. Convex Function → Business Logic Package
4. Business Logic → Data Validation & Processing
5. Convex Function → Database Operations
6. Response → Client
```

### 2. Example: Creating an Idea

**Before (Monolithic)**:
```typescript
export const create = mutation({
  args: ideaCreateArgs,
  handler: async (ctx, { workspaceId, title, contentMD }) => {
    const userId = await requireUserId(ctx);
    await assertWriteEnabled(ctx, workspaceId, "editor");
    
    // All validation and sanitization logic here
    const sanitizedTitle = title.trim().substring(0, 200);
    if (!sanitizedTitle) throw new ConvexError(...);
    const sanitizedContent = sanitizeContent(contentMD);
    
    // Database operation
    const ideaId = await ctx.db.insert("ideas", {
      workspaceId,
      title: sanitizedTitle,
      contentMD: sanitizedContent,
      status: "draft",
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return ideaId;
  },
});
```

**After (Modular)**:
```typescript
export const create = mutation({
  args: ideaCreateArgs,
  handler: async (ctx, { workspaceId, title, contentMD }) => {
    const userId = await requireUserId(ctx);
    await assertWriteEnabled(ctx, workspaceId, "editor");
    
    // Business logic handled by package
    const result = await processIdeaCreation({
      workspaceId,
      title,
      contentMD,
      createdBy: userId,
    });
    
    if (!result.success) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: result.errors?.[0] || "Failed to create idea",
      });
    }
    
    // Database operation
    const ideaId = await ctx.db.insert("ideas", result.data);
    return ideaId;
  },
});
```

## Benefits

### 1. Testability
- Business logic can be tested independently without Convex
- Pure functions are easier to test
- Mock dependencies are simpler

### 2. Reusability
- Logic packages can be used in different contexts
- Shared utilities prevent code duplication
- Consistent validation across modules

### 3. Maintainability
- Clear separation of concerns
- Smaller, focused packages
- Easier to understand and modify

### 4. Scalability
- New features can be added as separate packages
- Existing functionality is not affected
- Better code organization

## Development Guidelines

### Adding New Features

1. **Determine Package Placement**
   - Core functionality → `@pulse/core`
   - Business logic → Create new package (e.g., `@pulse/projects-logic`)
   - Database operations → Convex functions

2. **Follow Package Structure**
   ```
   packages/feature-logic/
   ├── src/
   │   ├── services/      # Main business logic
   │   ├── transformers/  # Data transformations
   │   ├── validators/    # Input validation
   │   └── types/         # TypeScript types
   ```

3. **Write Tests First**
   - Create comprehensive test suites
   - Test business logic independently
   - Mock external dependencies

4. **Update Documentation**
   - Update package README
   - Add examples to main documentation
   - Document any breaking changes

### Testing

Each package has its own test suite:

```bash
# Run all tests
pnpm test

# Test specific package
pnpm --filter @pulse/core test
pnpm --filter @pulse/ideas-logic test

# Test with coverage
pnpm --filter @pulse/core test:coverage
```

### Building

The modular architecture uses TypeScript path mapping and build scripts:

```bash
# Build all packages
pnpm build

# Build schema (merges modular schemas)
pnpm build:schema

# Type checking
pnpm typecheck
```

## Migration Guide

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions when upgrading existing code.

## Future Enhancements

### Planned Packages
- `@pulse/projects-logic`: Project management
- `@pulse/clients-logic`: Client management  
- `@pulse/tasks-logic`: Task management
- `@pulse/analytics-logic`: Analytics and reporting

### Potential Improvements
- Convex module resolution for proper package imports
- Automated schema generation from packages
- Runtime module loading
- Plugin architecture for extensions

## Contributing

When contributing to the modular architecture:

1. Follow the established package structure
2. Write comprehensive tests
3. Use TypeScript strictly
4. Document public APIs
5. Consider backward compatibility
6. Update relevant documentation

## FAQ

### Q: Why not use a monorepo tool like Nx or Lerna?
A: The current setup uses Turborepo with pnpm workspaces, which provides sufficient monorepo capabilities for our needs while being simpler to maintain.

### Q: How do I add a new business logic package?
A: Follow the pattern established by `@pulse/ideas-logic`. Create the package structure, add tests, update TypeScript paths, and create Convex functions that use the logic.

### Q: Can I use these packages outside of Convex?
A: Yes! The logic packages are designed to be framework-agnostic. They contain pure business logic that can be used in any JavaScript/TypeScript environment.

### Q: How do I debug issues across packages?
A: Use TypeScript's "Go to Definition" to trace code across packages. The development setup preserves source maps for debugging.

### Q: What about performance?
A: The modular architecture has minimal performance impact. The main benefit is development-time, not runtime. Build tools tree-shake unused code automatically.