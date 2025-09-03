import type * as React from "react";

import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<"label"> & { as?: "label" | "span" };

function Label({ className, as, htmlFor, ...props }: LabelProps) {
	// If htmlFor is provided (or caller forces as="label"), render a label; otherwise render a span to satisfy a11y rule.
	const Comp: "label" | "span" = as ?? (htmlFor ? "label" : "span");
	return (
		<Comp
			// data-slot is fine on both span and label
			data-slot="label"
			// @ts-expect-error props are compatible for our usage across label/span
			className={cn(
				"flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className,
			)}
			// Only label supports htmlFor; spreading it on span is harmless in DOM, but ensure type safety via ts-expect-error above
			htmlFor={htmlFor}
			{...props}
		/>
	);
}

export { Label };
