// tests/mocks/convex.mock.tsx
import { vi } from "vitest";
import type { FC } from "react";
import type { WithChildren } from "./_types";
import { TestDataFactory } from "../factories";

const PassThrough: FC<WithChildren> = ({ children }) => <>{children}</>;

export const convexMock = {
	useQuery: vi.fn((query: unknown, _args?: unknown) => {
		if (typeof query === "string") {
			if (query.includes("getCurrentUser") || query.includes("users")) {
				return TestDataFactory.user();
			}
			if (query.includes("ideas") || query.includes("list")) {
				return [TestDataFactory.idea()];
			}
			if (query.includes("workspaces")) {
				return [TestDataFactory.workspace()];
			}
		}
		return null;
	}),
	useMutation: vi.fn(() => vi.fn(async () => "test_id_123")),
	useAction: vi.fn(() =>
		vi.fn(async () => ({
			type: "success" as const,
			message: "Action completed",
		})),
	),
	useConvex: vi.fn(() => ({
		query: vi.fn(),
		mutation: vi.fn(),
		action: vi.fn(),
	})),
	Authenticated: vi.fn(PassThrough),
	Unauthenticated: vi.fn(PassThrough),
	ConvexReactClient: vi.fn(),
	ConvexProvider: vi.fn(PassThrough),
};

vi.mock("convex/react", () => convexMock);
