/**
 * MSW (Mock Service Worker) Handlers
 * Network mocks for integration tests
 * Provides realistic API responses without network calls
 */

import { http, HttpResponse } from "msw";
import { TestDataFactory } from "./builders";

/**
 * Ideas API Handlers
 */
export const ideasHandlers = [
  // Get ideas by workspace
  http.get("/api/ideas", ({ request }) => {
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (!workspaceId) {
      return HttpResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Generate realistic ideas for the workspace
    const ideas = Array.from({ length: Math.min(limit, 10) }, (_, index) =>
      TestDataFactory.idea({
        _id: `idea_${workspaceId}_${offset + index}`,
        workspaceId,
        title: `Idea ${offset + index + 1}`,
        createdAt: Date.now() - (offset + index) * 60000, // Spread over time
      })
    );

    return HttpResponse.json(ideas);
  }),

  // Create idea
  http.post("/api/ideas", async ({ request }) => {
    const body = await request.json() as {
      title: string;
      content: string;
      workspaceId: string;
      tags?: string[];
      priority?: string;
    };

    if (!body.title || !body.content || !body.workspaceId) {
      return HttpResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (body.title.length > 200) {
      return HttpResponse.json(
        { error: "Title too long" },
        { status: 400 }
      );
    }

    const newIdea = TestDataFactory.idea({
      _id: `idea_${Date.now()}`,
      title: body.title,
      content: body.content,
      workspaceId: body.workspaceId,
      tags: body.tags,
      priority: body.priority as "low" | "medium" | "high",
    });

    return HttpResponse.json(newIdea, { status: 201 });
  }),

  // Update idea
  http.patch("/api/ideas/:id", async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<{
      title: string;
      content: string;
      tags: string[];
      priority: string;
    }>;

    const updatedIdea = TestDataFactory.idea({
      _id: id as string,
      ...body,
      updatedAt: Date.now(),
    });

    return HttpResponse.json(updatedIdea);
  }),

  // Delete idea
  http.delete("/api/ideas/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ success: true, deletedId: id });
  }),
];

/**
 * Workspaces API Handlers
 */
export const workspacesHandlers = [
  // Get workspaces for user
  http.get("/api/workspaces", ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    const workspaces = [
      TestDataFactory.workspace({
        _id: "ws_default",
        name: "Default Workspace",
        description: "Your personal workspace",
      }),
      TestDataFactory.workspace({
        _id: "ws_team",
        name: "Team Workspace", 
        description: "Shared team workspace",
      }),
    ];

    return HttpResponse.json(workspaces);
  }),

  // Create workspace
  http.post("/api/workspaces", async ({ request }) => {
    const body = await request.json() as {
      name: string;
      description?: string;
    };

    if (!body.name || body.name.trim().length === 0) {
      return HttpResponse.json(
        { error: "Workspace name is required" },
        { status: 400 }
      );
    }

    const newWorkspace = TestDataFactory.workspace({
      _id: `ws_${Date.now()}`,
      name: body.name,
      description: body.description,
    });

    return HttpResponse.json(newWorkspace, { status: 201 });
  }),

  // Get workspace by ID
  http.get("/api/workspaces/:id", ({ params }) => {
    const { id } = params;
    
    const workspace = TestDataFactory.workspace({
      _id: id as string,
      name: `Workspace ${id}`,
    });

    return HttpResponse.json(workspace);
  }),
];

/**
 * Users API Handlers
 */
export const usersHandlers = [
  // Get current user
  http.get("/api/users/me", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return HttpResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = TestDataFactory.user({
      _id: "user_current",
      name: "Current User",
      email: "current@example.com",
      tokenIdentifier: "test|current123",
    });

    return HttpResponse.json(user);
  }),

  // Update user profile
  http.patch("/api/users/me", async ({ request }) => {
    const body = await request.json() as Partial<{
      name: string;
      email: string;
      image: string;
    }>;

    const updatedUser = TestDataFactory.user({
      _id: "user_current",
      ...body,
      updatedAt: Date.now(),
    });

    return HttpResponse.json(updatedUser);
  }),

  // Get user by ID
  http.get("/api/users/:id", ({ params }) => {
    const { id } = params;
    
    const user = TestDataFactory.user({
      _id: id as string,
      name: `User ${id}`,
      email: `user${id}@example.com`,
    });

    return HttpResponse.json(user);
  }),
];

/**
 * Authentication Handlers
 */
export const authHandlers = [
  // Login
  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json() as {
      provider: string;
      redirectUrl?: string;
    };

    // Simulate OAuth flow
    return HttpResponse.json({
      authUrl: `https://auth.example.com/oauth/${body.provider}?redirect_uri=${encodeURIComponent(body.redirectUrl || "/dashboard")}`,
    });
  }),

  // Logout
  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ success: true });
  }),

  // Refresh token
  http.post("/api/auth/refresh", () => {
    return HttpResponse.json({
      token: `test_token_${Date.now()}`,
      expiresIn: 3600,
    });
  }),
];

/**
 * Error simulation handlers for testing error states
 */
export const errorHandlers = [
  // Simulate server error
  http.get("/api/ideas/error", () => {
    return HttpResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }),

  // Simulate network timeout
  http.get("/api/ideas/timeout", async () => {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Long delay
    return HttpResponse.json([]);
  }),

  // Simulate rate limiting
  http.post("/api/ideas/rate-limited", () => {
    return HttpResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }),

  // Simulate authentication failure
  http.get("/api/ideas/auth-required", () => {
    return HttpResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }),
];

/**
 * Chrome Extension Handlers
 */
export const extensionHandlers = [
  // Extension configuration
  http.get("/api/extension/config", () => {
    return HttpResponse.json({
      defaultWorkspaceId: "ws_default",
      autoClip: true,
      clipShortcut: "Ctrl+Shift+C",
      apiEndpoint: "http://localhost:3000/api",
    });
  }),

  // Save clipped content
  http.post("/api/extension/clip", async ({ request }) => {
    const body = await request.json() as {
      url: string;
      title: string;
      content: string;
      workspaceId: string;
      metadata?: object;
    };

    const idea = TestDataFactory.idea({
      _id: `clipped_${Date.now()}`,
      title: body.title,
      content: body.content,
      workspaceId: body.workspaceId,
      tags: ["clipped", "web"],
    });

    return HttpResponse.json({
      success: true,
      ideaId: idea._id,
      workspaceId: idea.workspaceId,
    });
  }),
];

/**
 * Default handlers combining all endpoints
 */
export const defaultHandlers = [
  ...ideasHandlers,
  ...workspacesHandlers,
  ...usersHandlers,
  ...authHandlers,
  ...extensionHandlers,
];

/**
 * Test scenario handlers for specific test cases
 */
export const scenarioHandlers = {
  // Empty state - no data
  empty: [
    http.get("/api/ideas", () => HttpResponse.json([])),
    http.get("/api/workspaces", () => HttpResponse.json([])),
  ],

  // Loading state - slow responses
  loading: [
    http.get("/api/ideas", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return HttpResponse.json([TestDataFactory.idea()]);
    }),
  ],

  // Error state - various error scenarios
  error: errorHandlers,

  // Offline state - network errors
  offline: [
    http.get("/api/*", () => HttpResponse.error()),
    http.post("/api/*", () => HttpResponse.error()),
    http.patch("/api/*", () => HttpResponse.error()),
    http.delete("/api/*", () => HttpResponse.error()),
  ],
};

/**
 * Helper to create MSW server with default handlers
 */
export const createMockServer = (handlers = defaultHandlers) => {
  return {
    handlers,
    // Helper to override handlers for specific tests
    use: (...newHandlers: typeof handlers) => newHandlers,
    // Helper to reset to defaults
    resetHandlers: () => handlers,
  };
};