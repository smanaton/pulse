import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import { CustomDashboardNavbar } from "./navbar";
import { SidebarLayout } from "./sidebar-layout";

interface LayoutProps extends PropsWithChildren {
	className?: string;
}

/**
 * DashboardLayout
 * Special layout for dashboard with custom navbar
 * No sidebar, centered content with custom navbar
 */
export function DashboardLayout({ children, className }: LayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<CustomDashboardNavbar />
			<div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 pt-20 pb-6">
				<div className={twMerge("w-full max-w-6xl", className)}>{children}</div>
			</div>
		</div>
	);
}

/**
 * AppLayout
 * Standard layout with navbar for most applications
 * Use this for ideas, settings, team, analytics, etc.
 */
export function AppLayout({
	children,
	className,
	hideSearch = false,
}: LayoutProps & { hideSearch?: boolean }) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<CustomDashboardNavbar hideSearch={hideSearch} />
			<div className="mt-16">
				<LayoutContent className={className}>{children}</LayoutContent>
			</div>
		</div>
	);
}

/**
 * AuthLayout
 * Minimal layout for authentication pages
 */
export function AuthLayout({ children, className }: LayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<LayoutContent className={className}>{children}</LayoutContent>
		</div>
	);
}

interface LayoutContentProps extends PropsWithChildren {
	className?: string;
}

function LayoutContent({ children, className }: LayoutContentProps) {
	return (
		<div
			className={twMerge(
				"flex min-h-full w-full flex-col items-center justify-center p-6",
				className,
			)}
		>
			<div className="w-full max-w-6xl">{children}</div>
		</div>
	);
}

// Re-export SidebarLayout for convenience
export { SidebarLayout } from "./sidebar-layout";
