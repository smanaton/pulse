import agent from "@convex-dev/agent/convex.config";
import prosemirrorSync from "@convex-dev/prosemirror-sync/convex.config";
import { defineApp } from "convex/server";

/**
 * Convex app configuration with Prosemirror sync and AI agent components.
 * This enables real-time collaborative editing and AI functionality.
 */
const app = defineApp();

// Use the Prosemirror sync component for collaborative editing
app.use(prosemirrorSync);

// Use the agent component for AI functionality
app.use(agent);

export default app;
