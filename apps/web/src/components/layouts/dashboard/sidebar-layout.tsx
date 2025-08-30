import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import { SidebarProvider, useSidebarContext } from "@/contexts/sidebar-context";
import { sidebarStorage } from "@/lib/sidebar-storage";
import { DashboardSidebar } from "./sidebar";
import { SidebarNavbar } from "./sidebar-navbar";

interface SidebarLayoutProps extends PropsWithChildren {
	className?: string;
}

export function SidebarLayout({ children, className }: SidebarLayoutProps) {
	const sidebarState = sidebarStorage.get();

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<SidebarProvider initialCollapsed={sidebarState.isCollapsed}>
				<SidebarNavbar />
				<div className="mt-16 flex items-start">
					<DashboardSidebar />
					<SidebarLayoutContent className={className}>
						{children}
					</SidebarLayoutContent>
				</div>
			</SidebarProvider>
		</div>
	);
}

interface SidebarLayoutContentProps extends PropsWithChildren {
	className?: string;
}

function SidebarLayoutContent({
	children,
	className,
}: SidebarLayoutContentProps) {
	const sidebar = useSidebarContext();

	return (
		<div
			className={twMerge(
				"relative h-full w-full overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900",
				sidebar.desktop.isCollapsed ? "lg:ml-16" : "lg:ml-64",
				className,
			)}
		>
			{children}
		</div>
	);
}
