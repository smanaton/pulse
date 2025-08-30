import { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
	desktop: {
		isCollapsed: boolean;
		toggle: () => void;
		setCollapsed: (collapsed: boolean) => void;
	};
	mobile: {
		isOpen: boolean;
		toggle: () => void;
		open: () => void;
		close: () => void;
	};
}

const SidebarContext = createContext<SidebarContextType | null>(null);

interface SidebarProviderProps {
	children: React.ReactNode;
	initialCollapsed?: boolean;
}

export function SidebarProvider({
	children,
	initialCollapsed = false,
}: SidebarProviderProps) {
	const [isDesktopCollapsed, setIsDesktopCollapsed] =
		useState(initialCollapsed);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	// Save desktop sidebar state to localStorage
	useEffect(() => {
		localStorage.setItem(
			"sidebar-collapsed",
			JSON.stringify(isDesktopCollapsed),
		);
	}, [isDesktopCollapsed]);

	const value: SidebarContextType = {
		desktop: {
			isCollapsed: isDesktopCollapsed,
			toggle: () => setIsDesktopCollapsed((prev) => !prev),
			setCollapsed: setIsDesktopCollapsed,
		},
		mobile: {
			isOpen: isMobileOpen,
			toggle: () => setIsMobileOpen((prev) => !prev),
			open: () => setIsMobileOpen(true),
			close: () => setIsMobileOpen(false),
		},
	};

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	);
}

export function useSidebarContext() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebarContext must be used within a SidebarProvider");
	}
	return context;
}
