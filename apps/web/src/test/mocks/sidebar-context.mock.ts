// tests/mocks/sidebar-context.mock.ts
import { vi } from "vitest";
import React, { type FC } from "react";
import type { WithChildren } from "./_types";

const PassThrough: FC<WithChildren> = ({ children }) =>
	React.createElement(React.Fragment, null, children);

export const sidebarCtxMock = {
	useSidebarContext: vi.fn(() => ({
		mobile: { isOpen: false, toggle: vi.fn() },
		desktop: { isCollapsed: false, toggle: vi.fn() },
	})),
	SidebarProvider: vi.fn(PassThrough),
};

vi.mock("@/contexts/sidebar-context", () => sidebarCtxMock);
