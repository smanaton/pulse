// tests/mocks/ui-card.mock.tsx
import { vi } from "vitest";
import type { WithChildren, DivProps } from "./_types";

export const uiCardMock = {
	Card: vi.fn((props: WithChildren & DivProps) => (
		<div {...props}>{props.children}</div>
	)),
	CardContent: vi.fn((props: WithChildren & DivProps) => (
		<div {...props}>{props.children}</div>
	)),
	CardHeader: vi.fn((props: WithChildren & DivProps) => (
		<div {...props}>{props.children}</div>
	)),
	CardTitle: vi.fn((props: WithChildren & DivProps) => (
		<h3 {...props}>{props.children}</h3>
	)),
};

vi.mock("@/components/ui/card", () => uiCardMock);
