// tests/mocks/router.mock.tsx
import type { ReactNode } from "react";
import { vi } from "vitest";
import type { AnchorProps, WithChildren } from "./_types";

type LinkProps = WithChildren & { to: string } & Omit<AnchorProps, "href">;

export const routerMock = {
	useNavigate: vi.fn<() => (path: string) => void>(
		() => vi.fn() as (path: string) => void,
	),
	useLocation: vi.fn(() => ({ pathname: "/" })),
	useRouterState: vi.fn(() => ({ isLoading: false })),
	Link: vi.fn((props: LinkProps) => (
		<a href={props.to} {...props}>
			{props.children}
		</a>
	)),
	createFileRoute: vi.fn((_path: string) => ({
		component: vi.fn(),
		useSearch: () => ({}) as Record<string, never>,
	})),
	createRootRouteWithContext: vi.fn(() => ({})),
	Outlet: vi.fn(
		({ children }: { children?: ReactNode }) => children ?? <div />,
	),
	HeadContent: vi.fn(() => null),
	TanStackRouterDevtools: vi.fn(() => null),
};

vi.mock("@tanstack/react-router", () => routerMock);
