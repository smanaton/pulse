// tests/mocks/sonner.mock.tsx
import { vi } from "vitest";

export const sonnerMock = { Toaster: vi.fn(() => null) };
vi.mock("@/components/ui/sonner", () => sonnerMock);
