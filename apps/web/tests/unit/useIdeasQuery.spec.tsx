/**
 * Unit Test - Custom Hook
 * Tests hook behavior with mocked dependencies
 * No network calls, focused on hook logic
 */

import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useQuery } from "convex/react";

// Mock the hook dependencies
vi.mock("convex/react");

// Example custom hook that would be in your codebase
const useIdeasQuery = (workspaceId: string | undefined) => {
  const ideas = useQuery(
    workspaceId ? "api.ideas.listByWorkspace" : undefined,
    workspaceId ? { workspaceId } : undefined
  );

  return {
    ideas: ideas || [],
    isLoading: ideas === undefined,
    hasIdeas: (ideas?.length || 0) > 0,
  };
};

describe("useIdeasQuery", () => {
  test("Given_ValidWorkspaceId_When_Queried_Then_ReturnsIdeas", () => {
    // Arrange
    const mockIdeas = [
      { _id: "1", title: "Idea 1", workspaceId: "ws1" },
      { _id: "2", title: "Idea 2", workspaceId: "ws1" },
    ];
    vi.mocked(useQuery).mockReturnValue(mockIdeas);

    // Act
    const { result } = renderHook(() => useIdeasQuery("ws1"));

    // Assert
    expect(result.current.ideas).toEqual(mockIdeas);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasIdeas).toBe(true);
  });

  test("Given_NoWorkspaceId_When_Queried_Then_ReturnsEmptyState", () => {
    // Arrange
    vi.mocked(useQuery).mockReturnValue(undefined);

    // Act
    const { result } = renderHook(() => useIdeasQuery(undefined));

    // Assert
    expect(result.current.ideas).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasIdeas).toBe(false);
  });

  test("Given_LoadingState_When_Queried_Then_ShowsLoading", () => {
    // Arrange
    vi.mocked(useQuery).mockReturnValue(undefined);

    // Act
    const { result } = renderHook(() => useIdeasQuery("ws1"));

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.ideas).toEqual([]);
    expect(result.current.hasIdeas).toBe(false);
  });

  test("Given_EmptyResults_When_Queried_Then_ReturnsEmptyIdeas", () => {
    // Arrange
    vi.mocked(useQuery).mockReturnValue([]);

    // Act
    const { result } = renderHook(() => useIdeasQuery("ws1"));

    // Assert
    expect(result.current.ideas).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasIdeas).toBe(false);
  });
});