import type { PropsWithChildren, ReactNode, ComponentProps } from "react";

export type WithChildren = PropsWithChildren<Record<string, unknown>>;
export type DivProps = ComponentProps<"div">;
export type ButtonProps = ComponentProps<"button">;
export type AnchorProps = ComponentProps<"a">;
export type FormProps = ComponentProps<"form">;
export type LabelProps = ComponentProps<"label">;
export type ImgProps = ComponentProps<"img">;
export type InputProps = ComponentProps<"input">;
export type TextareaProps = ComponentProps<"textarea">;
export type HrProps = ComponentProps<"hr">;
export type KbdProps = ComponentProps<"kbd">;
export type NavProps = ComponentProps<"nav">;

export type FCWithChildren<P = Record<string, unknown>> = (
	props: P & { children?: ReactNode },
) => ReactNode;
