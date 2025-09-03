import { Link } from "@tanstack/react-router";
import { forwardRef } from "react";

type AProps = Omit<React.ComponentProps<"a">, "href"> & { href: string };

export const RouterLink = forwardRef<HTMLAnchorElement, AProps>(
	({ href, ...rest }, ref) => {
		// Cast href to bypass TanStack Router's strict route typing for generic href usage
		// biome-ignore lint/suspicious/noExplicitAny: TanStack Router requires any for dynamic routes
		return <Link ref={ref} to={href as any} {...rest} />;
	},
);
RouterLink.displayName = "RouterLink";
