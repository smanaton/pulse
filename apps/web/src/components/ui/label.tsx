import type * as React from "react";

import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<"label"> & { as?: "label" | "span" };

function Label({ className, as, htmlFor, ...props }: LabelProps) {
	// If htmlFor is provided (or caller forces as="label"), render a label; otherwise render a span to satisfy a11y rule.
	const Comp: "label" | "span" = as ?? (htmlFor ? "label" : "span");
	const commonClass = cn(
		"flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
		className,
	);

	if (Comp === "label") {
		return <label data-slot="label" className={commonClass} htmlFor={htmlFor} {...props} />;
	}
	// span path: do not pass htmlFor
	const { /* eslint-disable-line */ ...rest } = props;
	return <span data-slot="label" className={commonClass} {...rest} />;
}

export { Label };
