import { Link, type LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";

type AProps = Omit<React.ComponentProps<"a">, "href"> & { href: string };

export const RouterLink = forwardRef<HTMLAnchorElement, AProps>(
	({ href, ...rest }, ref) => {
		// Use any cast for the href->to prop transformation since TanStack Router
		// has very strict typing for route paths that conflicts with generic href usage
		return <Link ref={ref} to={href as any} {...(rest as any)} />;
	},
);
RouterLink.displayName = "RouterLink";
