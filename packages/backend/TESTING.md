# Backend testing notes

This document explains the test-utils pattern and how we handle AI model calls in tests.

Overview
- Tests live under `packages/backend/convex` and use `convex-test` + Vitest.
- Shared helpers live in `packages/backend/test-utils.ts`.

Pattern for AI model calls
- The project uses an `AIModelService` in `convex/ai/modelService.ts` to call external models.
- In test environment (`NODE_ENV=test`) the service returns deterministic mock responses to avoid network calls.
- When adding tests touching AI flows, prefer to:
  - Use `convexTest(schema, modules)` and `t.withIdentity(...)` helpers.
  - Avoid relying on external services; assert structure and side-effects instead.

Running tests (backend)
- From repo root (pnpm workspace):

```bash
pnpm --filter @pulse/backend --workspace-root exec -- vitest run
```

Triaging LLM/timeouts
- If a test times out waiting for an AI response, either:
  1. Add a test-specific mock (preferred) in `convex/__mocks__` or via dependency injection.
  2. Increase the single-test timeout using Vitest `test.timeout(milliseconds)` or `test(..., { timeout: XXX })`.

Notes
- AI test guards are already implemented in `convex/ai/modelService.ts` and `convex/ai/contentService.ts`. No codemod is needed.

Contact
- For questions about the test pattern or the codemod, open an issue in the repo and assign to the backend maintainers.
