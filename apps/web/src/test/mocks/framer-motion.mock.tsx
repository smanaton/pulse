// tests/mocks/framer-motion.mock.tsx
import { vi } from "vitest";
import type { WithChildren, DivProps, ButtonProps, FormProps } from "./_types";

export const framerMotionMock = {
	motion: {
		div: vi.fn((props: WithChildren & DivProps) => (
			<div {...props}>{props.children}</div>
		)),
		button: vi.fn((props: WithChildren & ButtonProps) => (
			<button {...props}>{props.children}</button>
		)),
		form: vi.fn((props: WithChildren & FormProps) => (
			<form {...props}>{props.children}</form>
		)),
	},
	AnimatePresence: vi.fn(({ children }: WithChildren) => <>{children}</>),
};

vi.mock("framer-motion", () => framerMotionMock);
