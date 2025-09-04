// tests/mocks/use-media-query.mock.ts
import { vi } from "vitest";
export const useMediaQueryMock = { useMediaQuery: vi.fn(() => true) };
vi.mock("@/hooks/use-media-query", () => useMediaQueryMock);
