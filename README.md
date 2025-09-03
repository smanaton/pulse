# pulse

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Convex, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Flowbite** - Modern UI components with Tailwind CSS
- **Convex** - Reactive backend-as-a-service platform
- **Orchestration System** - Job delegation, agent management, and workflow automation
- **Chrome Extension** - Web clipper for capturing content directly to Pulse
- **API Keys** - Secure device-scoped authentication for integrations
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **Starlight** - Documentation site with Astro
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
pnpm dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application.

Then, set required Convex auth environment variables (Convex reads these from its own environment, not .env files):

```bash
cd packages/backend
npx convex env set SITE_URL "http://localhost:3003"
npx convex env set AUTH_GOOGLE_ID "<your-google-client-id>.apps.googleusercontent.com"
npx convex env set AUTH_GOOGLE_SECRET "<your-google-client-secret>"
# Optional if using GitHub OAuth
npx convex env set AUTH_GITHUB_ID "<your-github-client-id>"
npx convex env set AUTH_GITHUB_SECRET "<your-github-client-secret>"
```

You can verify values with `npx convex env get <NAME>`.

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser to see the web application.
Notes:
- The dev script will fail fast if `SITE_URL`, `AUTH_GOOGLE_ID`, or `AUTH_GOOGLE_SECRET` are missing. Bypass with `PULSE_DEV_SKIP_AUTH_CHECK=1 pnpm dev` if you don't need OAuth locally.
- Convex dev runs locally at http://127.0.0.1:3210; the web app points to it via `VITE_CONVEX_URL`.



## Project Structure

```
pulse/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   ├── docs/        # Documentation site (Astro Starlight)
│   └── chrome-extension/  # Web clipper extension
├── packages/
│   ├── backend/     # Convex backend functions and schema
│   │   └── convex/
│   │       ├── orchestration/  # Job orchestration system
│   │       ├── schema.ts       # Database schema
│   │       └── ...            # Other backend modules
│   └── core/        # Shared utilities and types
```

## Available Scripts

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all applications
- `pnpm dev:web`: Start only the web application
- `pnpm dev:setup`: Setup and configure your Convex project
- `pnpm check-types`: Check TypeScript types across all apps
- `pnpm check`: Run Biome formatting and linting
- `cd apps/docs && pnpm dev`: Start documentation site
- `cd apps/docs && pnpm build`: Build documentation site

## Orchestration System

Pulse includes a comprehensive orchestration system for managing jobs, agents, and workflows:

### Key Components

- **Jobs & Runs** - Submit intents and track execution through state machines
- **Agent Management** - Register agents with capabilities and health monitoring
- **Event Streaming** - Real-time event ingestion with HMAC verification
- **Artifact Storage** - Handle large outputs with retention policies
- **Command & Control** - Pause, resume, cancel, and retry operations
- **Scheduled Tasks** - Background maintenance and timeout detection

### Features

- ✅ State machine enforcement with illegal transition prevention
- ✅ Idempotent event processing with deduplication
- ✅ HMAC-SHA256 webhook authentication with replay protection
- ✅ Agent heartbeat monitoring with timeout detection
- ✅ Workspace isolation with proper access controls
- ✅ Rate limiting and backpressure management
- ✅ Artifact retention policies with external storage support
- ✅ Real-time subscriptions for dashboard updates

### Usage

```typescript
// Submit a job
const result = await submitJob(ctx, {
  workspaceId: "workspace_123",
  intent: "analyze_document", 
  inputs: { documentUrl: "https://..." }
});

// Watch run progress
const events = useQuery(api.orchestration.realtime.watchRun, {
  workspaceId: "workspace_123",
  runId: "run_456"
});
```
