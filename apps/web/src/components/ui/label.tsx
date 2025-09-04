import type * as React from "react";

import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<"label"> & { as?: "label" | "span" };

function Label({ className, as, htmlFor, children, ...props }: LabelProps) {
	// Only render <label> when we have a valid htmlFor to associate with a control.
	const wantLabel = (as ?? (htmlFor ? "label" : "span")) === "label";
	const useLabel = wantLabel && !!htmlFor;

	const commonClass = cn(
		"flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
		className,
	);

	if (useLabel) {
		// Render children inside label for accessible text; spread remaining props excluding children
		const { children: _c, ...rest } = props as Record<string, unknown>;
		return (
			<label
				data-slot="label"
				className={commonClass}
				htmlFor={htmlFor}
				{...(rest as React.LabelHTMLAttributes<HTMLLabelElement>)}
			>
				{children}
			</label>
		);
	}

	// If caller forced as="label" but didn't provide htmlFor, fall back to span to satisfy a11y
	// and avoid passing htmlFor down.
	const {
		htmlFor: _ignored,
		children: _children,
		...rest
	} = props as Record<string, unknown>;
	return (
		<span
			data-slot="label"
			className={commonClass}
			{...(rest as React.HTMLAttributes<HTMLSpanElement>)}
		>
			{children}
		</span>
	);
}

export { Label };
