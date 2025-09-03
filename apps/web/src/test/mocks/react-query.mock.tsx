// tests/mocks/react-query.mock.ts
import { vi } from "vitest";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { PropsWithChildren, JSX } from "react";

type UnknownResult = UseQueryResult<unknown, unknown>;

// Hoist the mock before any imports that might use it
vi.mock("@tanstack/react-query", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
		"@tanstack/react-query",
	);

	return {
		...actual,
		useQuery: vi.fn(
			(
				options: UseQueryOptions<unknown, unknown, unknown, unknown[]>,
			): UnknownResult => {
				const key = Array.isArray(options.queryKey) ? options.queryKey : [];
				if (key.includes("user") && key.includes("current")) {
					return {
						data: null,
						isLoading: false,
						isError: false,
						error: null,
					} as UnknownResult;
				}
				if (key.includes("workspaces")) {
					return {
						data: [],
						isLoading: false,
						isError: false,
						error: null,
					} as UnknownResult;
				}
				return {
					data: null,
					isLoading: false,
					isError: false,
					error: null,
				} as UnknownResult;
			},
		),
		useMutation: vi.fn(() => ({
			mutate: vi.fn(),
			isLoading: false,
			isError: false,
			error: null as unknown,
		})),
		useQueryClient: vi.fn(() => ({
			invalidateQueries: vi.fn(),
			setQueryData: vi.fn(),
			getQueryData: vi.fn(),
		})),
		QueryClientProvider: ({
			children,
		}: PropsWithChildren<{ client: unknown }>) => children as JSX.Element,
	};
});

export const reactQueryMock = {
	// These are available for tests that need to access the mocks directly
	useQuery: vi.fn(),
	useMutation: vi.fn(),
	useQueryClient: vi.fn(),
};
