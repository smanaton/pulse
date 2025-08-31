---
trigger: always_on
---
<!-- Source: .ruler/instructions.md -->

# Pulse Project Rules & Guidelines

## Project Overview
Pulse is a modern web application built with:
- **Frontend**: React + TanStack Router + Vite + Tailwind + Flowbite
- **Backend**: Convex (serverless functions with real-time sync)
- **Auth**: Convex Auth with OAuth providers (GitHub, Google)
- **Testing**: Vitest + convex-test + Testing Library
- **Tooling**: Turborepo + pnpm + Biome + TypeScript

## Code Standards

### TypeScript
- **Strict mode always** - no `any`, no implicit any
- Use `type` imports: `import type { Id } from "./_generated/dataModel"`
- Prefer interfaces for object shapes, types for unions/aliases
- Exhaustive switch/case handling with `satisfies` operator
- Return types should be explicit for public APIs

### Function Design
- Keep functions under 50 lines (extract helpers if needed)
- Pure functions preferred - no side effects unless necessary
- Single responsibility - one function, one purpose
- Use early returns to reduce nesting
- Descriptive names: `getUsersByWorkspace` not `getUsers`

### Error Handling
```typescript
// Prefer Result types for expected failures
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

// Use precise error types
class AuthenticationError extends Error {}
class ValidationError extends Error {}

// Never silent catch - always log or re-throw
try {
  await riskyOperation()
} catch (error) {
  console.error('Operation failed:', error)
  throw new OperationError('Failed to complete operation', { cause: error })
}
```

## Convex Patterns

### Authentication Guards
Every mutation/action handling workspace data MUST check membership:
```typescript
export const updateProject = mutation({
  args: { projectId: v.id("projects"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx) // Auth guard
    const project = await ctx.db.get(args.projectId)
    
    // Membership guard
    await assertMembership(ctx, userId, project.workspaceId)
    
    // Rate limiting for expensive operations
    await checkRateLimit(ctx, userId, "update_project")
    
    // Business logic here...
  }
})
```

### Internal API Calls
NEVER use string literals for internal calls:
```typescript
// ❌ WRONG
await ctx.runMutation("internal.someFunction", args)

// ✅ CORRECT
import { internal } from "./_generated/api"
await ctx.runMutation(internal.internal.someFunction, args)
```

### Schema Design
- Use `.optional()` for nullable fields, not `v.union([v.string(), v.null()])`
- Indexes should follow pattern: `by_workspace_field` for multi-tenant queries
- Timestamps: use `v.number()` for `Date.now()` values
- Soft deletes: use `deletedAt: v.optional(v.number())` pattern

## Testing Requirements

### Backend Tests (Convex)
```typescript
// Use the tokenIdentifier pattern for auth
const identity = { tokenIdentifier: `user123|${crypto.randomUUID()}` }
const t = convexTest(schema, modules)

test("should create workspace", async () => {
  await t.withIdentity(identity).mutation(api.workspaces.create, {
    name: "Test Workspace"
  })
  
  const workspaces = await t.withIdentity(identity)
    .query(api.workspaces.list)
  expect(workspaces).toHaveLength(1)
})
```

### Frontend Tests
- Mock Convex hooks in `src/test/setup.ts`
- Test user interactions, not implementation details
- Use `data-testid` for test selectors
- Each component should have a corresponding test file

## Project Structure

```
pulse/
├── apps/
│   ├── web/               # Main React application
│   │   ├── src/
│   │   │   ├── components/ # UI components
│   │   │   ├── routes/     # TanStack Router pages
│   │   │   ├── hooks/      # Custom React hooks
│   │   │   ├── lib/        # Utilities
│   │   │   └── test/       # Test setup
│   │   └── vitest.config.ts
│   ├── docs/               # Starlight documentation
│   └── storybook/          # Component library
├── packages/
│   └── backend/            # Convex backend
│       └── convex/
│           ├── _generated/ # Auto-generated Convex files
│           ├── auth.ts     # Auth configuration
│           ├── schema.ts   # Database schema
│           └── *.ts        # Function modules
├── scripts/                # Build/dev scripts
│   ├── check-convex-guards.cjs
│   └── check-internal-calls.cjs
└── turbo.json             # Turborepo config
```

## Development Workflow

### Commands
```bash
# Development
pnpm dev              # Start all services
pnpm dev:web          # Frontend only
pnpm dev:server       # Convex only

# Quality checks
pnpm typecheck        # TypeScript validation
pnpm check            # Biome lint/format
pnpm test:backend     # Backend tests
pnpm test:web         # Frontend tests
pnpm repo:guards      # Validate Convex security patterns

# Building
pnpm build            # Build all packages
```

### Git Hooks (via Husky)
- **pre-commit**: Runs lint-staged (Biome on changed files)
- **pre-push**: Runs typecheck + tests + guard validation

### Environment Variables
```bash
# apps/web/.env
VITE_CONVEX_URL=https://...convex.cloud

# packages/backend/.env.local
CONVEX_DEPLOYMENT=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

## Security Requirements

### Authentication
- All user-facing mutations/queries must call `requireUserId(ctx)`
- OAuth providers configured in `convex/auth.config.ts`
- Session tokens stored in httpOnly cookies when possible

### Multi-tenancy
- Every workspace operation must verify membership
- Use `assertMembership(ctx, userId, workspaceId)` helper
- Filter queries by workspace: `.withIndex("by_workspace", q => q.eq("workspaceId", id))`

### Data Protection
- NEVER log sensitive data (tokens, passwords, PII)
- Sanitize user input before storage
- Use Convex validators for input validation
- Rate limit expensive operations

## UI/UX Guidelines

### Component Patterns
- Use Flowbite components as base (already themed)
- Tailwind for styling - avoid inline styles
- Dark mode support via `theme-provider.tsx`
- Responsive design - mobile-first approach

### State Management
- Convex for server state (real-time sync)
- React Context for UI state (sidebar, theme)
- TanStack Router for navigation state
- Local Storage for user preferences

### Performance
- Use React.lazy() for route-based code splitting
- Implement virtual scrolling for long lists
- Optimize images with next-gen formats
- Monitor bundle size (< 500KB per chunk)

## Deployment

### Production Checklist
- [ ] All tests passing
- [ ] TypeScript builds without errors
- [ ] Environment variables configured
- [ ] Convex deployment pushed
- [ ] Rate limits configured
- [ ] Error monitoring enabled
- [ ] Analytics configured

### Monitoring
- Convex dashboard for function metrics
- Browser error tracking (implement Sentry)
- Performance monitoring (Web Vitals)
- User analytics (privacy-compliant)

## AI Assistant Guidelines

When working with AI assistants on this codebase:

1. **Always verify auth patterns** - AI may suggest insecure patterns
2. **Check import paths** - Ensure using generated imports, not strings
3. **Validate test patterns** - Use established tokenIdentifier approach
4. **Review security changes** - Double-check membership/auth guards
5. **Prefer existing patterns** - Don't reinvent what already works

## Common Pitfalls to Avoid

1. **String literal API calls** - Always use generated imports
2. **Missing auth checks** - Every mutation needs `requireUserId`
3. **Workspace isolation** - Always filter by workspaceId
4. **Test auth confusion** - Use tokenIdentifier pattern consistently
5. **Bundle size creep** - Monitor and split large components
6. **Type safety bypass** - No `as any` or `@ts-ignore`
7. **Silent failures** - Always handle errors explicitly

## Quick Reference

### File naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts` or `*.convex.test.ts`
- Types: `types.ts` or inline with component

### Import order
1. External packages
2. Internal packages (`@pulse/*`)
3. Absolute imports (`@/`)
4. Relative imports (`./`, `../`)
5. Type imports last

### Commit conventions
```
feat: Add user profile page
fix: Correct workspace member query
docs: Update API documentation
test: Add workspace creation tests
refactor: Extract auth helpers
chore: Update dependencies
```

Remember: Code quality > feature velocity. A well-tested, secure feature is better than two buggy ones.



<!-- Source: .ruler/bts.md -->

# Better-T-Stack Project Rules

This is a pulse project created with Better-T-Stack CLI.

## Project Structure

This is a monorepo with the following structure:

- **`apps/web/`** - Frontend application (React with TanStack Router)

- **`packages/backend/`** - Convex backend functions


## Available Scripts

- `pnpm run dev` - Start all apps in development mode
- `pnpm run dev:web` - Start only the web app




## Adding More Features

You can add additional addons or deployment options to your project using:

```bash
pnpx create-better-t-stack
add
```

Available addons you can add:
- **Documentation**: Starlight, Fumadocs
- **Linting**: Biome, Oxlint, Ultracite
- **Other**: Ruler, Turborepo, PWA, Tauri, Husky

You can also add web deployment configurations like Cloudflare Workers support.

## Project Configuration

This project includes a `bts.jsonc` configuration file that stores your Better-T-Stack settings:

- Contains your selected stack configuration (database, ORM, backend, frontend, etc.)
- Used by the CLI to understand your project structure
- Safe to delete if not needed
- Updated automatically when using the `add` command

## Key Points

