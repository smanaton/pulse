/**
 * Test Data Factories for Ideas Logic
 *
 * Provides type-safe mock data for testing without using 'as any'
 */

import type { Id } from "@pulse/core/types";
import type {
	CreateIdeaInput,
	UpdateIdeaInput,
	CreateFolderInput,
	UpdateFolderInput,
	CreateTagInput,
	IdeaSearchInput,
} from "../types";

// ============================================================================
// Mock ID Generators
// ============================================================================

let idCounter = 1;

export const mockId = <T extends string>(tableName: T): Id<T> => {
	return `${tableName}_${idCounter++}` as Id<T>;
};

// Common mock IDs for reuse
export const MOCK_IDS = {
	workspace: mockId("workspaces"),
	user: mockId("users"),
	project: mockId("projects"),
	folder: mockId("folders"),
	tag: mockId("tags"),
	idea: mockId("ideas"),
};

// ============================================================================
// Idea Data Factories
// ============================================================================

export const IdeaFactory = {
	createInput(overrides: Partial<CreateIdeaInput> = {}): CreateIdeaInput {
		return {
			workspaceId: MOCK_IDS.workspace,
			title: "Test Idea",
			contentMD: "Test content for the idea",
			createdBy: MOCK_IDS.user,
			...overrides,
		};
	},

	updateInput(overrides: Partial<UpdateIdeaInput> = {}): UpdateIdeaInput {
		return {
			title: "Updated Test Idea",
			contentMD: "Updated test content",
			status: "active",
			...overrides,
		};
	},

	searchInput(overrides: Partial<IdeaSearchInput> = {}): IdeaSearchInput {
		return {
			workspaceId: MOCK_IDS.workspace,
			query: "test search",
			limit: 10,
			offset: 0,
			...overrides,
		};
	},

	// Invalid data for validation testing
	invalidCreateInput(
		overrides: Partial<CreateIdeaInput> = {},
	): CreateIdeaInput {
		return {
			workspaceId: "" as Id<"workspaces">, // Invalid empty ID
			title: "",
			contentMD: "",
			createdBy: "" as Id<"users">, // Invalid empty ID
			...overrides,
		};
	},

	// Valid update inputs
	validUpdateInput(overrides: Partial<UpdateIdeaInput> = {}): UpdateIdeaInput {
		return {
			title: "Updated Title",
			status: "active",
			...overrides,
		};
	},

	// Invalid update inputs
	emptyTitleUpdate(): UpdateIdeaInput {
		return { title: "" };
	},

	invalidStatusUpdate(): UpdateIdeaInput {
		return { status: "invalid-status" as unknown as UpdateIdeaInput["status"] };
	},
};

// ============================================================================
// Folder Data Factories
// ============================================================================

export const FolderFactory = {
	createInput(overrides: Partial<CreateFolderInput> = {}): CreateFolderInput {
		return {
			workspaceId: MOCK_IDS.workspace,
			name: "Test Folder",
			createdBy: MOCK_IDS.user,
			...overrides,
		};
	},

	updateInput(overrides: Partial<UpdateFolderInput> = {}): UpdateFolderInput {
		return {
			name: "Updated Test Folder",
			...overrides,
		};
	},

	// Invalid data for validation testing
	invalidCreateInput(
		overrides: Partial<CreateFolderInput> = {},
	): CreateFolderInput {
		return {
			workspaceId: "" as Id<"workspaces">, // Invalid empty ID
			name: "",
			createdBy: "" as Id<"users">, // Invalid empty ID
			...overrides,
		};
	},

	longNameInput(): CreateFolderInput {
		return this.createInput({
			name: "a".repeat(150), // Too long name
		});
	},
};

// ============================================================================
// Tag Data Factories
// ============================================================================

export const TagFactory = {
	createInput(overrides: Partial<CreateTagInput> = {}): CreateTagInput {
		return {
			workspaceId: MOCK_IDS.workspace,
			name: "test-tag",
			color: "#FF6B6B",
			createdBy: MOCK_IDS.user,
			...overrides,
		};
	},

	// Invalid data for validation testing
	invalidCreateInput(overrides: Partial<CreateTagInput> = {}): CreateTagInput {
		return {
			workspaceId: "" as Id<"workspaces">, // Invalid empty ID
			name: "",
			createdBy: "" as Id<"users">, // Invalid empty ID
			...overrides,
		};
	},
};

// ============================================================================
// Content Factories
// ============================================================================

export const ContentFactory = {
	markdown: {
		simple: "# Test Header\n\nThis is **bold** text.",
		withImages: "# Header\n\n![Image](image.jpg)\n\nText after image.",
		withCodeBlocks: "```javascript\nconst test = 'code';\n```",
		complex: `
# Header 1
## Header 2

This is **bold** text and *italic* text.
Here's a \`code snippet\` and a [link](https://example.com).

![Image](image.jpg)

\`\`\`javascript
const code = "block";
\`\`\`
		`.trim(),
	},

	contentBlocks: {
		valid: [
			{ type: "paragraph", content: [{ type: "text", text: "Test content" }] },
		],
		circular: (() => {
			type SelfRef = { self?: unknown };
			const circular: SelfRef = {};
			circular.self = circular;
			return circular;
		})(),
	},

	searchQueries: {
		simple: "test search",
		withSpecialChars: "Special@#$%Characters",
		long: "a".repeat(150),
		keywords: "JavaScript React TypeScript programming development",
	},
};

// ============================================================================
// Validation Test Data
// ============================================================================

export const ValidationTestData = {
	validIdeaInput: IdeaFactory.createInput(),
	invalidIdeaInputs: {
		emptyTitle: IdeaFactory.createInput({ title: "" }),
		longTitle: IdeaFactory.createInput({ title: "a".repeat(300) }),
		longContent: IdeaFactory.createInput({ contentMD: "a".repeat(60000) }),
		circularBlocks: IdeaFactory.createInput({
			contentBlocks: ContentFactory.contentBlocks.circular,
		}),
		missingWorkspace: IdeaFactory.invalidCreateInput(),
	},

	validIdeaUpdate: IdeaFactory.validUpdateInput(),
	invalidIdeaUpdates: {
		emptyTitle: IdeaFactory.emptyTitleUpdate(),
		invalidStatus: IdeaFactory.invalidStatusUpdate(),
	},

	validFolderInput: FolderFactory.createInput(),
	invalidFolderInputs: {
		emptyName: FolderFactory.createInput({ name: "" }),
		longName: FolderFactory.longNameInput(),
		missingWorkspace: FolderFactory.invalidCreateInput(),
	},

	validTagInput: TagFactory.createInput(),
	invalidTagInputs: {
		emptyName: TagFactory.createInput({ name: "" }),
		missingWorkspace: TagFactory.invalidCreateInput(),
	},
};

// ============================================================================
// Reset Counter for Clean Tests
// ============================================================================

export const resetIdCounter = () => {
	idCounter = 1;
};
