// tests/mocks/backend.mock.ts
export const backendMock = {
	api: {
		users: { getCurrentUser: "users:getCurrentUser", update: "users:update" },
		ideas: {
			list: "ideas:list",
			create: "ideas:create",
			update: "ideas:update",
			delete: "ideas:delete",
		},
		workspaces: {
			list: "workspaces:list",
			create: "workspaces:create",
			update: "workspaces:update",
			getOrCreatePersonal: "workspaces:getOrCreatePersonal",
		},
		projects: {
			list: "projects:list",
			create: "projects:create",
			update: "projects:update",
			delete: "projects:delete",
		},
		navigationPreferences: {
			updateNavigationPreferences:
				"navigationPreferences:updateNavigationPreferences",
		},
		ai: {
			processCommand: "ai:processCommand",
			processMessage: "ai:processMessage",
		},
	},
} as const;

vi.mock("@pulse/backend", () => backendMock);
