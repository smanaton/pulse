import type { Id } from "@pulse/backend/dataModel";
import { type PropsWithChildren, useEffect, useState } from "react";
import { IdeasSecondarySidebar } from "@/components/ideas/ideas-secondary-sidebar";
import { SidebarProvider, useSidebarContext } from "@/contexts/sidebar-context";
import { sidebarStorage } from "@/lib/sidebar-storage";
import { DashboardSidebar } from "./dashboard/sidebar";
import { SidebarNavbar } from "./dashboard/sidebar-navbar";

interface IdeasLayoutProps extends PropsWithChildren {
	workspaceId: Id<"workspaces">;
	selectedIdeaId: Id<"ideas"> | null;
	onSelectIdea: (ideaId: Id<"ideas"> | null) => void;
}

export function IdeasLayout({
	children,
	workspaceId,
	selectedIdeaId,
	onSelectIdea,
}: IdeasLayoutProps) {
	// Force main sidebar to be collapsed when we have a secondary sidebar
	const sidebarState = sidebarStorage.get();
	const initialCollapsed = true; // Always start collapsed for ideas workspace

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<SidebarProvider initialCollapsed={initialCollapsed}>
				<IdeasLayoutWithSidebar
					workspaceId={workspaceId}
					selectedIdeaId={selectedIdeaId}
					onSelectIdea={onSelectIdea}
				>
					{children}
				</IdeasLayoutWithSidebar>
			</SidebarProvider>
		</div>
	);
}

function IdeasLayoutWithSidebar({
	children,
	workspaceId,
	selectedIdeaId,
	onSelectIdea,
}: IdeasLayoutProps) {
	const sidebar = useSidebarContext();

	// Force collapse main sidebar when component mounts (for ideas workspace)
	useEffect(() => {
		if (!sidebar.desktop.isCollapsed) {
			sidebar.desktop.setCollapsed(true);
		}
	}, []);

	return (
		<>
			<SidebarNavbar />
			<div className="mt-16 flex items-start">
				<DashboardSidebar />
				<IdeasLayoutContent
					workspaceId={workspaceId}
					selectedIdeaId={selectedIdeaId}
					onSelectIdea={onSelectIdea}
				>
					{children}
				</IdeasLayoutContent>
			</div>
		</>
	);
}

interface IdeasLayoutContentProps extends PropsWithChildren {
	workspaceId: Id<"workspaces">;
	selectedIdeaId: Id<"ideas"> | null;
	onSelectIdea: (ideaId: Id<"ideas"> | null) => void;
}

function IdeasLayoutContent({
	children,
	workspaceId,
	selectedIdeaId,
	onSelectIdea,
}: IdeasLayoutContentProps) {
	const sidebar = useSidebarContext();

	return (
		<div
			className={`flex h-[calc(100vh-64px)] w-full overflow-hidden ${
				sidebar.desktop.isCollapsed ? "lg:ml-16" : "lg:ml-64"
			}`}
		>
			{/* Secondary Sidebar for Ideas */}
			<div className="h-full w-64 overflow-hidden border-gray-200 border-r dark:border-gray-700">
				<IdeasSecondarySidebar
					workspaceId={workspaceId}
					selectedIdeaId={selectedIdeaId}
					onSelectIdea={onSelectIdea}
				/>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-hidden">{children}</div>
		</div>
	);
}
