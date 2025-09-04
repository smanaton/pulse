// tests/mocks/flowbite.mock.tsx
import { vi } from "vitest";
import type {
	WithChildren,
	ButtonProps,
	DivProps,
	LabelProps,
	InputProps,
	TextareaProps,
	KbdProps,
	HrProps,
	NavProps,
} from "./_types";

export const flowbiteMock = {
	Button: vi.fn((props: WithChildren & ButtonProps) => (
		<button {...props}>{props.children}</button>
	)),
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

	Navbar: vi.fn((props: WithChildren & NavProps) => (
		<nav {...props}>{props.children}</nav>
	)),
	NavbarBrand: vi.fn((props: WithChildren & DivProps) => (
		<div {...props}>{props.children}</div>
	)),

	Label: vi.fn((props: WithChildren & LabelProps) => {
		// ensure label is associated with an input for accessibility in tests
		return (
			<label {...props} htmlFor={props.htmlFor ?? "flowbite-mock-label"}>
				{props.children}
			</label>
		);
	}),
	TextInput: vi.fn((props: InputProps) => <input {...props} />),

	Dropdown: vi.fn((props: WithChildren & (DivProps & { label?: string })) => (
		<div {...props}>
			{props.label}
			{props.children}
		</div>
	)),
	DropdownHeader: vi.fn((props: WithChildren & DivProps) => (
		<div {...props}>{props.children}</div>
	)),
	DropdownItem: vi.fn((props: WithChildren & ButtonProps) => (
		<button {...props}>{props.children}</button>
	)),
	DropdownDivider: vi.fn((_props?: HrProps) => <hr />),

	Avatar: vi.fn(
		(props: WithChildren & (DivProps & { img?: string; alt?: string })) =>
			props.img ? (
				<img src={props.img} alt={props.alt ?? ""} />
			) : (
				<div {...props}>{props.children}</div>
			),
	),

	Tooltip: vi.fn((props: WithChildren & DivProps) => (
		<div {...props}>{props.children}</div>
	)),
	Kbd: vi.fn((props: WithChildren & KbdProps) => (
		<kbd {...props}>{props.children}</kbd>
	)),
	Spinner: vi.fn((props: DivProps) => <div {...props} data-testid="spinner" />),
	Textarea: vi.fn((props: TextareaProps) => <textarea {...props} />),
	Badge: vi.fn((props: WithChildren & DivProps) => (
		<span {...props}>{props.children}</span>
	)),

	useThemeMode: vi.fn(() => ({
		mode: "light" as const,
		setMode: vi.fn(),
		toggleMode: vi.fn(),
	})),
};

vi.mock("flowbite-react", () => flowbiteMock);
