// tests/factories.ts
/**
 * Typed, deterministic test data factories.
 * Keep this file even when using mocks: your mocks import these to stay consistent.
 */

type ISODateMs = number;

// Core test types (use your real app types if available)
export interface TestUser {
	_id: string;
	_creationTime: ISODateMs;
	email: string;
	name: string;
	image?: string | null;
	emailVerified?: ISODateMs;
	createdAt: ISODateMs;
	updatedAt: ISODateMs;
}

export interface TestWorkspace {
	_id: string;
	_creationTime: ISODateMs;
	type: "personal" | "team";
	isPersonal: boolean;
	plan: "free" | "pro";
	name: string;
	ownerUserId: string;
	createdAt: ISODateMs;
	updatedAt: ISODateMs;
}

export interface TestIdea {
	_id: string;
	_creationTime: ISODateMs;
	workspaceId: string;
	projectId?: string;
	title: string;
	contentMD: string;
	status: "draft" | "active" | "archived";
	createdBy: string;
	createdAt: ISODateMs;
	updatedAt: ISODateMs;
}

export interface TestProject {
	_id: string;
	_creationTime: ISODateMs;
	workspaceId: string;
	name: string;
	description: string;
	status: "active" | "paused" | "archived";
	sortKey: number;
	createdBy: string;
	createdAt: ISODateMs;
	updatedAt: ISODateMs;
}

// Deterministic timestamps for stable tests
const NOW = 1_725_000_000_000; // change in a test if you need a specific moment

// Factory helpers
export const TestDataFactory = {
	user: (overrides: Partial<TestUser> = {}): TestUser => ({
		_id: "user_test_123",
		_creationTime: NOW,
		email: "test@example.com",
		name: "Test User",
		image: "https://example.com/avatar.jpg",
		emailVerified: NOW,
		createdAt: NOW,
		updatedAt: NOW,
		...overrides,
	}),

	workspace: (overrides: Partial<TestWorkspace> = {}): TestWorkspace => ({
		_id: "workspace_test_123",
		_creationTime: NOW,
		type: "personal",
		isPersonal: true,
		plan: "free",
		name: "Test Workspace",
		ownerUserId: "user_test_123",
		createdAt: NOW,
		updatedAt: NOW,
		...overrides,
	}),

	idea: (overrides: Partial<TestIdea> = {}): TestIdea => ({
		_id: "idea_test_123",
		_creationTime: NOW,
		workspaceId: "workspace_test_123",
		title: "Test Idea",
		contentMD: "This is a test idea",
		status: "draft",
		createdBy: "user_test_123",
		createdAt: NOW,
		updatedAt: NOW,
		...overrides,
	}),

	project: (overrides: Partial<TestProject> = {}): TestProject => ({
		_id: "project_test_123",
		_creationTime: NOW,
		workspaceId: "workspace_test_123",
		name: "Test Project",
		description: "This is a test project",
		status: "active",
		sortKey: 1,
		createdBy: "user_test_123",
		createdAt: NOW,
		updatedAt: NOW,
		...overrides,
	}),
};

// Ready-made scenarios
export const TestScenarios = {
	userWorkspace() {
		const user = TestDataFactory.user();
		const workspace = TestDataFactory.workspace({ ownerUserId: user._id });
		return { user, workspace };
	},

	projectWithIdeas() {
		const { user, workspace } = this.userWorkspace();
		const project = TestDataFactory.project({
			workspaceId: workspace._id,
			createdBy: user._id,
		});
		const ideas = [
			TestDataFactory.idea({
				workspaceId: workspace._id,
				projectId: project._id,
				createdBy: user._id,
			}),
			TestDataFactory.idea({
				workspaceId: workspace._id,
				projectId: project._id,
				createdBy: user._id,
				title: "Second Test Idea",
				status: "active",
			}),
		];
		return { user, workspace, project, ideas };
	},
};

/**
 * If you truly still need a mock API, keep this; otherwise delete it.
 * You already mock Convex and backend elsewhere, so this is likely redundant.
 */
export const createMockApi = () => ({
	ideas: {
		list: async () => [TestDataFactory.idea()],
		create: async () => "idea_test_123",
		update: async () => null,
		delete: async () => null,
	},
	users: {
		getCurrentUser: async () => TestDataFactory.user(),
		update: async () => null,
	},
	workspaces: {
		list: async () => [TestDataFactory.workspace()],
		create: async () => "workspace_test_123",
	},
	ai: {
		processCommand: async () => ({
			type: "success" as const,
			message: "Command processed successfully",
		}),
	},
});
