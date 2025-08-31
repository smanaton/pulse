export interface SidebarState {
	isCollapsed: boolean;
}

const SIDEBAR_STORAGE_KEY = "sidebar-state";

export const sidebarStorage = {
	get(): SidebarState {
		// Always return default for SSR compatibility
		if (typeof window === "undefined") {
			return { isCollapsed: false };
		}

		try {
			const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.error("Failed to parse sidebar state from localStorage:", error);
		}

		return { isCollapsed: false };
	},

	set(state: SidebarState): void {
		if (typeof window === "undefined") return;

		try {
			localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state));
		} catch (error) {
			console.error("Failed to save sidebar state to localStorage:", error);
		}
	},
};
