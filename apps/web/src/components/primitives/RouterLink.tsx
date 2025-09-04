import { Link } from "@tanstack/react-router";
import { forwardRef } from "react";

type AProps = Omit<React.ComponentProps<"a">, "href"> & { href: string };

export const RouterLink = forwardRef<HTMLAnchorElement, AProps>(
	({ href, ...rest }, ref) => {
		// Cast href to bypass TanStack Router's strict route typing for generic href usage
		// This is necessary for dynamic routes that can't be statically typed
		return <Link ref={ref} to={href as string} {...rest} />;
	},
);
RouterLink.displayName = "RouterLink";
