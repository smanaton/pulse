/**
 * Test Utilities for Real Convex Integration
 *
 * These utilities provide a way to test with real Convex functions
 * instead of mocks, ensuring tests are meaningful and accurate.
 */

// Test setup for future real Convex integration
// For now, we use smart mocks that provide realistic behavior

// Test user type
interface TestUser {
	_id: string;
	_creationTime: number;
	email: string;
	name: string;
	image?: string | null;
	emailVerified?: number;
	createdAt: number;
	updatedAt: number;
}

// Test workspace type
interface TestWorkspace {
	_id: string;
	_creationTime: number;
	type: "personal" | "shared";
	isPersonal: boolean;
	plan: "free" | "pro" | "enterprise";
	name: string;
	ownerUserId: string;
	createdAt: number;
	updatedAt: number;
}

// Test idea type
interface TestIdea {
	_id: string;
	_creationTime: number;
	workspaceId: string;
	title: string;
	contentMD: string;
	status: "draft" | "published" | "archived";
	projectId?: string;
	createdBy: string;
	createdAt: number;
	updatedAt: number;
}

// Test project type
interface TestProject {
	_id: string;
	_creationTime: number;
	workspaceId: string;
	name: string;
	description: string;
	status: "active" | "completed" | "archived";
	sortKey: number;
	createdBy: string;
	createdAt: number;
	updatedAt: number;
}

// Test data factories with proper types
export const TestDataFactory = {
	user: (overrides?: Partial<TestUser>): TestUser => ({
		_id: "user_test_123",
		_creationTime: Date.now(),
		email: "test@example.com",
		name: "Test User",
		image: "https://example.com/avatar.jpg",
		emailVerified: Date.now(),
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...overrides,
	}),

	workspace: (overrides?: Partial<TestWorkspace>): TestWorkspace => ({
		_id: "workspace_test_123",
		_creationTime: Date.now(),
		type: "personal" as const,
		isPersonal: true,
		plan: "free" as const,
		name: "Test Workspace",
		ownerUserId: "user_test_123",
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...overrides,
	}),

	idea: (overrides?: Partial<TestIdea>): TestIdea => ({
		_id: "idea_test_123",
		_creationTime: Date.now(),
		workspaceId: "workspace_test_123",
		title: "Test Idea",
		contentMD: "This is a test idea",
		status: "draft" as const,
		createdBy: "user_test_123",
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...overrides,
	}),

	project: (overrides?: Partial<TestProject>): TestProject => ({
		_id: "project_test_123",
		_creationTime: Date.now(),
		workspaceId: "workspace_test_123",
		name: "Test Project",
		description: "This is a test project",
		status: "active" as const,
		sortKey: 1,
		createdBy: "user_test_123",
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...overrides,
	}),
};

// Test utilities for creating test scenarios
export const TestScenarios = {
	// Create a user workspace setup
	userWorkspaceScenario() {
		const user = TestDataFactory.user();
		const workspace = TestDataFactory.workspace({ ownerUserId: user._id });
		return { user, workspace };
	},

	// Create a project with ideas
	projectWithIdeasScenario() {
		const { user, workspace } = this.userWorkspaceScenario();
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
				status: "published" as const,
			}),
		];
		return { user, workspace, project, ideas };
	},
};

/**
 * Mock API Provider for tests that still need mocking
 * This provides a fallback when real API functions aren't available
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
			type: "success",
			message: "Command processed successfully",
		}),
	},
});
