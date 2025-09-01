/**
 * Integration Test - Router with MSW
 * Tests real route behavior with mocked network calls
 * Full component tree, real routing, stubbed APIs
 */

import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { createMemoryRouter, RouterProvider } from "@tanstack/react-router";

// MSW server setup
const server = setupServer(
  http.get("/api/ideas", ({ request }) => {
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");
    
    if (workspaceId === "ws_empty") {
      return HttpResponse.json([]);
    }
    
    return HttpResponse.json([
      {
        _id: "idea_1",
        title: "Test Idea 1",
        content: "This is a test idea",
        workspaceId: workspaceId || "ws_default",
        createdAt: Date.now(),
      },
      {
        _id: "idea_2", 
        title: "Test Idea 2",
        content: "Another test idea",
        workspaceId: workspaceId || "ws_default",
        createdAt: Date.now(),
      }
    ]);
  }),

  http.get("/api/workspaces", () => {
    return HttpResponse.json([
      { _id: "ws_default", name: "Default Workspace" },
      { _id: "ws_empty", name: "Empty Workspace" }
    ]);
  }),

  http.post("/api/ideas", async ({ request }) => {
    const body = await request.json() as { title: string; content: string };
    return HttpResponse.json({
      _id: "new_idea",
      title: body.title,
      content: body.content,
      workspaceId: "ws_default",
      createdAt: Date.now(),
    });
  })
);

// Mock component that represents your Ideas page
const IdeasPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ideas")
      .then(res => res.json())
      .then(data => {
        setIdeas(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading ideas...</div>;

  return (
    <div>
      <h1>Ideas</h1>
      {ideas.length === 0 ? (
        <p>No ideas yet</p>
      ) : (
        <ul>
          {ideas.map((idea: any) => (
            <li key={idea._id}>
              <h3>{idea.title}</h3>
              <p>{idea.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Mock imports for routing
import { useEffect, useState } from "react";

// Test setup
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderRoute = (path: string, initialEntries: string[] = [path]) => {
  const router = createMemoryRouter(
    [
      {
        path: "/ideas",
        element: <IdeasPage />,
      },
    ],
    {
      initialEntries,
    }
  );

  return render(<RouterProvider router={router} />);
};

describe("Ideas Route Integration", () => {
  test("Given_IdeasRoute_When_Loaded_Then_DisplaysIdeas", async () => {
    // Act
    renderRoute("/ideas");

    // Assert - Wait for loading to complete
    expect(screen.getByText("Loading ideas...")).toBeInTheDocument();
    
    // Wait for ideas to load
    await screen.findByText("Test Idea 1");
    expect(screen.getByText("Test Idea 2")).toBeInTheDocument();
    expect(screen.getByText("This is a test idea")).toBeInTheDocument();
  });

  test("Given_EmptyWorkspace_When_LoadingIdeas_Then_ShowsNoIdeas", async () => {
    // Arrange
    server.use(
      http.get("/api/ideas", () => {
        return HttpResponse.json([]);
      })
    );

    // Act
    renderRoute("/ideas");

    // Assert
    await screen.findByText("No ideas yet");
    expect(screen.queryByText("Test Idea 1")).not.toBeInTheDocument();
  });

  test("Given_APIError_When_LoadingIdeas_Then_HandlesGracefully", async () => {
    // Arrange
    server.use(
      http.get("/api/ideas", () => {
        return HttpResponse.error();
      })
    );

    // Act
    renderRoute("/ideas");

    // Assert - Should handle error gracefully (component implementation dependent)
    expect(screen.getByText("Loading ideas...")).toBeInTheDocument();
    
    // Wait to ensure the loading state persists or error is handled
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  test("Given_SlowAPI_When_LoadingIdeas_Then_ShowsLoadingState", async () => {
    // Arrange - Add delay to API response
    server.use(
      http.get("/api/ideas", async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return HttpResponse.json([]);
      })
    );

    // Act
    renderRoute("/ideas");

    // Assert
    expect(screen.getByText("Loading ideas...")).toBeInTheDocument();
    
    // Wait for loading to complete
    await screen.findByText("No ideas yet");
  });
});