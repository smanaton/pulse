import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Pulse Workspace Schema
 *
 * Core principle: ALL domain data is workspace-scoped.
 * Every table (except auth) requires workspaceId and proper indexes.
 */

// Export individual table validators for reuse
export const usersValidator = {
	email: v.optional(v.string()),
	emailVerified: v.optional(v.number()),
	emailVerificationTime: v.optional(v.number()), // Auth0 legacy field
	name: v.optional(v.string()),
	image: v.optional(v.string()),
	tokenIdentifier: v.optional(v.string()), // e.g. "testing|userA" or "github|12345"
	createdAt: v.optional(v.number()),
	updatedAt: v.optional(v.number()),
};

export const workspacesValidator = {
	type: v.union(v.literal("personal"), v.literal("shared")),
	isPersonal: v.boolean(),
	plan: v.union(v.literal("free"), v.literal("team")),
	name: v.string(),
	slug: v.optional(v.string()), // null for personal workspaces
	ownerUserId: v.optional(v.id("users")), // set for personal workspaces
	disabled: v.optional(v.boolean()), // kill switch
	createdAt: v.number(),
	updatedAt: v.number(),
};

export const ideasValidator = {
	workspaceId: v.id("workspaces"),
	projectId: v.optional(v.id("projects")),
	folderId: v.optional(v.id("folders")),
	title: v.string(),
	contentMD: v.string(), // Markdown content (kept for backward compatibility)
	contentBlocks: v.optional(v.any()), // BlockNote structured content
	// Structured idea fields for qualifying lightbulb moments
	problem: v.optional(v.string()), // What problem does this solve?
	hypothesis: v.optional(v.string()), // What's our hypothesis/approach?
	value: v.optional(v.string()), // What value will this create?
	risks: v.optional(v.string()), // What are the potential risks/challenges?
	aiSummary: v.optional(v.string()), // Cached AI-generated summary
	status: v.union(
		v.literal("draft"),
		v.literal("active"),
		v.literal("archived"),
	),
	copiedFromId: v.optional(v.id("ideas")), // For provenance tracking
	createdBy: v.id("users"),
	deletedAt: v.optional(v.number()), // Soft delete
	createdAt: v.number(),
	updatedAt: v.number(),
};

export const projectsValidator = {
	workspaceId: v.id("workspaces"),
	name: v.string(),
	description: v.optional(v.string()),
	status: v.union(
		v.literal("active"),
		v.literal("on_hold"),
		v.literal("completed"),
		v.literal("archived"),
	),
	priority: v.optional(
		v.union(
			v.literal("low"),
			v.literal("medium"),
			v.literal("high"),
			v.literal("urgent"),
		),
	),
	startDate: v.optional(v.number()),
	endDate: v.optional(v.number()),
	ownerId: v.id("users"), // Primary owner
	clientId: v.optional(v.id("clients")), // Associated client
	tags: v.optional(v.array(v.string())), // Categories like "SEO", "Development", etc.
	color: v.optional(v.string()), // Hex color for visual identification
	budget: v.optional(v.number()), // Project budget
	estimatedHours: v.optional(v.number()), // Time estimation
	actualHours: v.optional(v.number()), // Time tracking
	progress: v.optional(v.number()), // Progress percentage (0-100)
	isTemplate: v.optional(v.boolean()), // Whether this is a template project
	templateId: v.optional(v.id("projects")), // If created from template
	sortKey: v.number(), // For ordering
	createdBy: v.id("users"),
	deletedAt: v.optional(v.number()), // Soft delete
	createdAt: v.number(),
	updatedAt: v.number(),
};

export const clientsValidator = {
	workspaceId: v.id("workspaces"),
	name: v.string(),
	email: v.optional(v.string()),
	phone: v.optional(v.string()),
	company: v.optional(v.string()),
	website: v.optional(v.string()),
	notes: v.optional(v.string()),
	status: v.union(v.literal("active"), v.literal("inactive")),
	tags: v.optional(v.array(v.string())), // For categorization
	address: v.optional(
		v.object({
			street: v.optional(v.string()),
			city: v.optional(v.string()),
			state: v.optional(v.string()),
			zip: v.optional(v.string()),
			country: v.optional(v.string()),
		}),
	),
	createdBy: v.id("users"),
	deletedAt: v.optional(v.number()), // Soft delete
	createdAt: v.number(),
	updatedAt: v.number(),
};

export const agentsValidator = {
	workspaceId: v.id("workspaces"),
	agentId: v.optional(v.string()), // External/orchestration ID
	name: v.string(),
	description: v.optional(v.string()),
	type: v.union(
		v.literal("assistant"), // AI assistant for general help
		v.literal("automation"), // Process automation agent
		v.literal("researcher"), // Research and data gathering
		v.literal("writer"), // Content generation
		v.literal("external"), // External orchestration agent
	),
	capabilities: v.array(v.string()), // ["web_search", "code_generation", "hubspot.audit@1.0", etc.]
	config: v.any(), // Agent-specific configuration (model, prompts, etc.)
	// Orchestration fields
	owner: v.optional(v.string()), // "vendor:acme" | "internal:pulse"
	version: v.optional(v.string()),
	accepts: v.optional(
		v.array(
			v.object({
				capability: v.string(),
				inputSchemaRef: v.string(),
				outputSchemaRef: v.string(),
			}),
		),
	),
	health: v.optional(
		v.object({
			status: v.union(v.literal("up"), v.literal("down")),
			lastHeartbeatAt: v.optional(v.number()),
			queueLength: v.optional(v.number()),
			maxConcurrency: v.optional(v.number()),
		}),
	),
	auth: v.optional(
		v.object({
			methods: v.array(v.string()), // ["bearer", "hmac"]
		}),
	),
	endpoints: v.optional(
		v.object({
			baseUrl: v.string(),
		}),
	),
	isActive: v.boolean(),
	avatar: v.optional(v.string()), // Avatar URL or identifier
	createdBy: v.id("users"),
	lastUsedAt: v.optional(v.number()),
	createdAt: v.number(),
	updatedAt: v.number(),
};

export const activitiesValidator = {
	workspaceId: v.id("workspaces"),
	actorId: v.id("users"), // User or agent that performed the action
	actorType: v.union(v.literal("user"), v.literal("agent")),
	entityType: v.union(
		v.literal("project"),
		v.literal("idea"),
		v.literal("client"),
		v.literal("workspace"),
		v.literal("member"),
	),
	entityId: v.string(), // ID of the entity that was acted upon
	action: v.union(
		v.literal("created"),
		v.literal("updated"),
		v.literal("deleted"),
		v.literal("moved"),
		v.literal("assigned"),
		v.literal("commented"),
		v.literal("completed"),
	),
	description: v.string(), // Human-readable description
	metadata: v.optional(v.any()), // Additional context (field changes, etc.)
	createdAt: v.number(),
};

export default defineSchema({
	// Auth tables with custom users table
	...authTables,

	// Users: Extended with tokenIdentifier for unified testing
	users: defineTable(usersValidator)
		.index("by_token", ["tokenIdentifier"]) // For auth shim lookups
		.index("email", ["email"]), // Preserve existing email index

	// Workspaces: The primary isolation boundary
	workspaces: defineTable(workspacesValidator)
		.index("by_slug", ["slug"]) // Unique constraint enforced in code
		.index("personal_by_owner", ["ownerUserId", "isPersonal"]),

	// Workspace Members: Role-based access control
	workspaceMembers: defineTable({
		workspaceId: v.id("workspaces"),
		userId: v.id("users"),
		role: v.union(
			v.literal("owner"),
			v.literal("admin"),
			v.literal("editor"),
			v.literal("viewer"),
		),
		invitedBy: v.optional(v.id("users")),
		invitedAt: v.optional(v.number()),
		joinedAt: v.optional(v.number()),
		createdAt: v.number(),
	})
		.index("by_workspace_user", ["workspaceId", "userId"]) // Primary lookup
		.index("by_user", ["userId"]) // User's workspaces
		.index("by_workspace", ["workspaceId"]), // Workspace members

	// Projects: Top-level organization within workspace
	projects: defineTable(projectsValidator)
		.index("by_workspace", ["workspaceId", "sortKey"])
		.index("by_workspace_status", ["workspaceId", "status", "updatedAt"])
		.index("by_workspace_owner", ["workspaceId", "ownerId", "updatedAt"])
		.index("by_workspace_client", ["workspaceId", "clientId", "updatedAt"])
		.index("by_workspace_priority", ["workspaceId", "priority", "updatedAt"])
		.index("by_workspace_dates", ["workspaceId", "startDate", "endDate"]),

	// Clients: Customer/client management
	clients: defineTable(clientsValidator)
		.index("by_workspace", ["workspaceId", "name"])
		.index("by_workspace_status", ["workspaceId", "status", "updatedAt"])
		.index("by_workspace_company", ["workspaceId", "company"])
		.index("by_workspace_created", ["workspaceId", "createdAt"]),

	// Project-Client Relationships: Many-to-many mapping
	projectClients: defineTable({
		projectId: v.id("projects"),
		clientId: v.id("clients"),
		isPrimary: v.boolean(), // Primary client for this project
		createdBy: v.id("users"),
		createdAt: v.number(),
	})
		.index("by_project", ["projectId"])
		.index("by_client", ["clientId"])
		.index("by_project_primary", ["projectId", "isPrimary"]),

	// Project Members: Team members assigned to projects
	projectMembers: defineTable({
		projectId: v.id("projects"),
		userId: v.id("users"),
		role: v.union(
			v.literal("owner"),
			v.literal("manager"),
			v.literal("member"),
			v.literal("viewer"),
		),
		canEditTasks: v.optional(v.boolean()),
		canManageMembers: v.optional(v.boolean()),
		addedBy: v.id("users"),
		addedAt: v.number(),
	})
		.index("by_project", ["projectId", "role"])
		.index("by_user", ["userId"])
		.index("by_project_user", ["projectId", "userId"]),

	// Tasks: Individual work items within projects
	tasks: defineTable({
		workspaceId: v.id("workspaces"),
		projectId: v.id("projects"),
		boardId: v.optional(v.string()), // Kanban board/column identifier
		name: v.string(),
		description: v.optional(v.string()),
		status: v.union(
			v.literal("backlog"),
			v.literal("todo"),
			v.literal("in_progress"),
			v.literal("in_review"),
			v.literal("done"),
			v.literal("cancelled"),
		),
		priority: v.union(
			v.literal("low"),
			v.literal("medium"),
			v.literal("high"),
			v.literal("urgent"),
		),
		assignedTo: v.optional(v.array(v.id("users"))), // Multiple assignees
		reporterId: v.id("users"), // Task creator
		parentTaskId: v.optional(v.id("tasks")), // For subtasks
		ideaId: v.optional(v.id("ideas")), // Link to idea for research tasks
		taskType: v.optional(
			v.union(
				v.literal("general"),
				v.literal("research"),
				v.literal("bug"),
				v.literal("feature"),
			),
		), // Type of task
		dueDate: v.optional(v.number()),
		startDate: v.optional(v.number()),
		completedAt: v.optional(v.number()),
		estimatedHours: v.optional(v.number()),
		actualHours: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
		position: v.number(), // For ordering within board/status
		sortKey: v.number(), // Global sort order
		attachments: v.optional(v.array(v.id("files"))),
		dependencies: v.optional(v.array(v.id("tasks"))), // Blocking tasks
		progress: v.optional(v.number()), // Progress percentage (0-100)
		createdBy: v.id("users"),
		deletedAt: v.optional(v.number()), // Soft delete
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_workspace", ["workspaceId", "updatedAt"])
		.index("by_project", ["projectId", "sortKey"])
		.index("by_project_status", ["projectId", "status", "position"])
		.index("by_project_assignee", ["projectId", "assignedTo", "updatedAt"])
		.index("by_workspace_assignee", ["workspaceId", "assignedTo", "dueDate"])
		.index("by_project_board", ["projectId", "boardId", "position"])
		.index("by_parent", ["parentTaskId", "sortKey"])
		.index("by_idea", ["ideaId", "createdAt"]), // For research tasks linked to ideas

	// Task Comments: Discussion and updates on tasks
	taskComments: defineTable({
		taskId: v.id("tasks"),
		workspaceId: v.id("workspaces"),
		projectId: v.id("projects"),
		content: v.string(),
		authorId: v.id("users"),
		parentCommentId: v.optional(v.id("taskComments")), // For threaded comments
		attachments: v.optional(v.array(v.id("files"))),
		isInternal: v.optional(v.boolean()), // Internal team comments vs client-visible
		editedAt: v.optional(v.number()),
		deletedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_task", ["taskId", "createdAt"])
		.index("by_project", ["projectId", "createdAt"])
		.index("by_workspace", ["workspaceId", "createdAt"])
		.index("by_author", ["authorId", "createdAt"]),

	// AI Agents: Virtual team members with specific capabilities
	agents: defineTable(agentsValidator)
		.index("by_workspace", ["workspaceId", "isActive", "name"])
		.index("by_workspace_type", ["workspaceId", "type"])
		.index("by_workspace_created", ["workspaceId", "createdAt"])
		.index("by_workspace_agentId", ["workspaceId", "agentId"])
		.index("by_workspace_capability", ["workspaceId", "capabilities"]),

	// Activities: Audit log and timeline for workspace activities
	activities: defineTable(activitiesValidator)
		.index("by_workspace", ["workspaceId", "createdAt"])
		.index("by_workspace_entity", [
			"workspaceId",
			"entityType",
			"entityId",
			"createdAt",
		])
		.index("by_workspace_actor", ["workspaceId", "actorId", "createdAt"])
		.index("by_workspace_action", ["workspaceId", "action", "createdAt"]),

	// Folders: Hierarchical organization within workspace
	folders: defineTable({
		workspaceId: v.id("workspaces"),
		parentId: v.optional(v.id("folders")), // null = root folder
		name: v.string(),
		sortKey: v.number(), // For ordering within parent
		createdBy: v.id("users"),
		deletedAt: v.optional(v.number()), // Soft delete
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_workspace", ["workspaceId", "parentId", "sortKey"])
		.index("by_workspace_updated", ["workspaceId", "updatedAt"]),

	// Ideas: The core content type
	ideas: defineTable(ideasValidator)
		.index("by_workspace", ["workspaceId", "updatedAt"]) // Recent ideas
		.index("by_workspace_folder", ["workspaceId", "folderId", "updatedAt"])
		.index("by_workspace_project", ["workspaceId", "projectId", "updatedAt"])
		.index("by_workspace_status", ["workspaceId", "status", "updatedAt"])
		.index("by_workspace_created", ["workspaceId", "createdAt"]) // For search
		.index("by_folder", ["folderId"]), // Simple folder-based queries

	// Tags: Flexible labeling system
	tags: defineTable({
		workspaceId: v.id("workspaces"),
		name: v.string(), // Normalized lowercase
		color: v.optional(v.string()), // Hex color
		createdBy: v.id("users"),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_workspace", ["workspaceId", "name"]) // Unique per workspace
		.index("by_workspace_created", ["workspaceId", "createdAt"]),

	// Idea Tags: Many-to-many relationship
	ideaTags: defineTable({
		ideaId: v.id("ideas"),
		tagId: v.id("tags"),
		createdAt: v.number(),
	})
		.index("by_idea", ["ideaId"])
		.index("by_tag", ["tagId"]),

	// Idea Discussions: AI assistant interactions and conversations
	ideaDiscussions: defineTable({
		ideaId: v.id("ideas"),
		workspaceId: v.id("workspaces"),
		userId: v.optional(v.id("users")), // null for AI messages
		role: v.union(v.literal("user"), v.literal("assistant")),
		message: v.string(),
		messageType: v.optional(
			v.union(
				v.literal("chat"),
				v.literal("summary"),
				v.literal("qualify"),
				v.literal("contrarian"),
			),
		), // Type of AI interaction
		metadata: v.optional(v.any()), // Additional context (tokens used, model, etc.)
		createdAt: v.number(),
	})
		.index("by_idea", ["ideaId", "createdAt"])
		.index("by_workspace", ["workspaceId", "createdAt"]),

	// Files: Attachments for ideas
	files: defineTable({
		workspaceId: v.id("workspaces"),
		ideaId: v.optional(v.id("ideas")),
		name: v.string(),
		size: v.number(),
		contentType: v.string(),
		url: v.string(), // Storage URL (includes workspaceId in path)
		createdBy: v.id("users"),
		deletedAt: v.optional(v.number()), // Soft delete
		createdAt: v.number(),
	})
		.index("by_workspace", ["workspaceId", "createdAt"])
		.index("by_idea", ["ideaId"]),

	// Move/Copy Jobs: Workflow tracking
	moveJobs: defineTable({
		sourceWorkspaceId: v.id("workspaces"),
		targetWorkspaceId: v.id("workspaces"),
		projectId: v.id("projects"),
		mode: v.union(v.literal("move"), v.literal("copy")),
		status: v.union(
			v.literal("pending"),
			v.literal("running"),
			v.literal("completed"),
			v.literal("failed"),
			v.literal("cancelled"),
		),
		// Progress tracking
		totalItems: v.number(),
		itemsProcessed: v.number(),
		batchesProcessed: v.number(),
		// Results
		itemsMoved: v.optional(v.number()),
		itemsCopied: v.optional(v.number()),
		tagsMerged: v.optional(v.number()),
		// Metadata
		errorMessage: v.optional(v.string()),
		startedBy: v.id("users"),
		startedAt: v.number(),
		completedAt: v.optional(v.number()),
	})
		.index("by_source_workspace", ["sourceWorkspaceId", "startedAt"])
		.index("by_target_workspace", ["targetWorkspaceId", "startedAt"])
		.index("by_project", ["projectId", "mode"]), // For idempotency

	// Rate Limits: Track usage per user/workspace
	rateLimits: defineTable({
		userId: v.id("users"),
		workspaceId: v.optional(v.id("workspaces")),
		type: v.union(
			v.literal("invite_per_workspace"),
			v.literal("invite_per_user"),
			v.literal("ai_tokens_daily"),
			v.literal("ai_tags_daily"),
			v.literal("ai_summaries_daily"),
			v.literal("move_operations"),
		),
		count: v.number(),
		windowStart: v.number(), // Start of current rate limit window
		windowEnd: v.number(), // End of current rate limit window
		updatedAt: v.number(),
	})
		.index("by_user_type", ["userId", "type"])
		.index("by_workspace_type", ["workspaceId", "type"]),

	// API Keys: Device-scoped tokens for extensions and integrations
	apiKeys: defineTable({
		userId: v.id("users"),
		workspaceId: v.id("workspaces"),
		name: v.string(), // User-friendly name
		keyHash: v.string(), // SHA-256 hash of the key
		keyPrefix: v.string(), // First 8 chars for identification (pk_live_abc...)
		device: v.string(), // "chrome_extension", "cli", etc.
		scopes: v.array(v.string()), // ["clipper:write", "workspace:read"]
		lastUsed: v.optional(v.number()),
		expiresAt: v.optional(v.number()), // Optional expiration
		createdBy: v.id("users"),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_user", ["userId", "createdAt"])
		.index("by_workspace", ["workspaceId", "createdAt"])
		.index("by_hash", ["keyHash"]), // For auth lookup

	// Web Clips: Track captured web content
	webClips: defineTable({
		workspaceId: v.id("workspaces"),
		ideaId: v.id("ideas"),
		url: v.string(),
		canonicalUrl: v.string(),
		title: v.string(),
		contentHash: v.string(), // For deduplication
		favicon: v.optional(v.string()), // URL to favicon
		captureType: v.string(), // "quick", "selection", "screenshot", "full"
		metadata: v.any(), // JSON metadata (og tags, author, etc.)
		createdBy: v.id("users"),
		createdAt: v.number(),
	})
		.index("by_workspace", ["workspaceId", "createdAt"])
		.index("by_idea", ["ideaId"])
		.index("by_url", ["canonicalUrl"])
		.index("by_content_hash", ["contentHash"]), // For dedupe

	// Clipper Tasks: Async processing queue for web content
	clipperTasks: defineTable({
		workspaceId: v.id("workspaces"),
		status: v.union(
			v.literal("pending"),
			v.literal("processing"),
			v.literal("completed"),
			v.literal("failed"),
		),
		url: v.string(),
		title: v.optional(v.string()),
		selection: v.optional(v.string()), // Selected text
		screenshot: v.optional(v.string()), // Storage URL for screenshot
		captureType: v.string(), // "quick", "selection", "screenshot"
		destination: v.string(), // "new" or "existing"
		targetIdeaId: v.optional(v.id("ideas")), // For append mode
		resultIdeaId: v.optional(v.id("ideas")), // Created/updated idea
		tags: v.optional(v.array(v.string())),
		error: v.optional(v.string()),
		processingStartedAt: v.optional(v.number()),
		createdBy: v.id("users"),
		createdAt: v.number(),
		completedAt: v.optional(v.number()),
	})
		.index("by_workspace_status", ["workspaceId", "status", "createdAt"])
		.index("by_user", ["createdBy", "createdAt"]),

	// Events: Telemetry and audit log (NO PII)
	events: defineTable({
		workspaceId: v.id("workspaces"),
		actorUserId: v.id("users"),
		type: v.union(
			v.literal("user_setup_completed"),
			v.literal("personal_workspace_created"),
			v.literal("workspace_created"),
			v.literal("invite_sent"),
			v.literal("member_joined"),
			v.literal("idea_created"),
			v.literal("idea_updated"),
			v.literal("idea_moved"),
			v.literal("idea_promoted"),
			v.literal("idea_deleted"),
			v.literal("project_created"),
			v.literal("project_updated"),
			v.literal("project_deleted"),
			v.literal("projects_reordered"),
			v.literal("member_added"),
			v.literal("member_updated"),
			v.literal("member_role_updated"),
			v.literal("member_removed"),
			v.literal("folder_created"),
			v.literal("folder_deleted"),
			v.literal("file_uploaded"),
			v.literal("file_deleted"),
			v.literal("tag_created"),
			v.literal("tag_deleted"),
			v.literal("move_started"),
			v.literal("move_batch"),
			v.literal("move_completed"),
			v.literal("move_failed"),
			v.literal("ai_summary_generated"),
			v.literal("ai_tags_suggested"),
			v.literal("ai_message_processed"),
			v.literal("kill_switch_enabled"),
			v.literal("kill_switch_disabled"),
			v.literal("web_clip_created"),
			v.literal("api_key_created"),
			v.literal("api_key_used"),
			v.literal("api_key_revoked"),
			v.literal("navigation_customized"),
			// Task events
			v.literal("task_created"),
			v.literal("task_updated"),
			v.literal("task_moved"),
			v.literal("task_deleted"),
			v.literal("commented"),
			// Orchestration events
			v.literal("orchestration_job_created"),
			v.literal("orchestration_run_assigned"),
			v.literal("orchestration_run_completed"),
			v.literal("orchestration_run_failed"),
		),
		entity: v.string(), // Entity type (idea, project, etc.)
		entityId: v.string(), // Entity ID
		meta: v.optional(v.any()), // JSON metadata (sanitized, no PII)
		createdAt: v.number(),
	})
		.index("by_workspace", ["workspaceId", "createdAt"])
		.index("by_type", ["type", "createdAt"])
		.index("by_actor", ["actorUserId", "createdAt"]),

	// Orchestration Jobs: Units of work with intent and constraints
	orchestrationJobs: defineTable({
		workspaceId: v.id("workspaces"),
		jobId: v.string(),
		corrId: v.string(), // Correlation ID for tracing
		intent: v.string(),
		inputs: v.any(),
		constraints: v.optional(
			v.object({
				deadline: v.optional(v.string()),
				maxRetries: v.optional(v.number()),
				timeout: v.optional(v.number()), // ms
			}),
		),
		artifactsDesired: v.optional(v.any()),
		planId: v.optional(v.string()),
		createdBy: v.id("users"),
		createdAt: v.number(),
	})
		.index("by_workspace_jobId", ["workspaceId", "jobId"])
		.index("by_workspace_created", ["workspaceId", "createdAt"])
		.index("by_workspace_corrId", ["workspaceId", "corrId"]),

	// Orchestration Plans: DAG of steps for job execution
	orchestrationPlans: defineTable({
		workspaceId: v.id("workspaces"),
		planId: v.string(),
		jobId: v.string(),
		steps: v.array(
			v.object({
				id: v.string(),
				name: v.optional(v.string()),
				capability: v.string(),
				dependsOn: v.array(v.string()),
				inputs: v.optional(v.any()), // Can reference prior step outputs
			}),
		),
		createdAt: v.number(),
	})
		.index("by_workspace_job", ["workspaceId", "jobId"])
		.index("by_workspace_planId", ["workspaceId", "planId"]),

	// Orchestration Runs: Job/step execution bindings
	orchestrationRuns: defineTable({
		workspaceId: v.id("workspaces"),
		runId: v.string(),
		jobId: v.string(),
		stepId: v.optional(v.string()),
		assignedTo: v.string(), // agentId
		status: v.union(
			v.literal("assigned"),
			v.literal("started"),
			v.literal("progress"),
			v.literal("blocked"),
			v.literal("paused"),
			v.literal("completed"),
			v.literal("failed"),
			v.literal("queued"),
			v.literal("timed_out"),
		),
		// Version tracking
		capabilityVersionUsed: v.optional(v.string()),
		agentVersionUsed: v.optional(v.string()),
		// Command tracking
		lastCommand: v.optional(
			v.object({
				type: v.union(
					v.literal("run.pause"),
					v.literal("run.resume"),
					v.literal("run.cancel"),
					v.literal("run.retry"),
				),
				issuedAt: v.number(),
				acknowledgedAt: v.optional(v.number()),
			}),
		),
		// Timing
		startedAt: v.optional(v.number()),
		endedAt: v.optional(v.number()),
		lastEventAt: v.optional(v.number()),
		lastHeartbeatAt: v.optional(v.number()),
		// Metadata
		scopes: v.array(v.string()),
		corrId: v.string(),
		retryCount: v.optional(v.number()),
		errorCode: v.optional(v.string()), // Standardized error taxonomy
		errorMessage: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("by_workspace_status", ["workspaceId", "status"])
		.index("by_workspace_job", ["workspaceId", "jobId"])
		.index("by_workspace_heartbeat", ["workspaceId", "lastHeartbeatAt"])
		.index("by_workspace_runId", ["workspaceId", "runId"])
		.index("by_workspace_lastEvent", ["workspaceId", "lastEventAt"]),

	// Orchestration Events: Run progress and state changes
	orchestrationEvents: defineTable({
		workspaceId: v.id("workspaces"),
		runId: v.string(),
		eventId: v.string(), // UUID for idempotency
		type: v.string(), // run.started, run.progress, etc.
		timestamp: v.number(),
		data: v.any(),
		ttl: v.optional(v.number()), // Expiry for cleanup
		createdAt: v.number(),
	})
		.index("by_run_time", ["runId", "timestamp"])
		.index("by_workspace_run_time", ["workspaceId", "runId", "timestamp"])
		.index("dedupe", ["workspaceId", "runId", "eventId"]), // Composite for dedupe

	// Orchestration Artifacts: Output metadata
	orchestrationArtifacts: defineTable({
		workspaceId: v.id("workspaces"),
		artifactId: v.string(),
		runId: v.string(),
		type: v.string(),
		uri: v.string(), // S3/R2 URL
		hash: v.optional(v.string()),
		sizeBytes: v.optional(v.number()),
		retentionDays: v.number(), // Default 90
		expiresAt: v.number(), // Calculated from retentionDays
		deletedAt: v.optional(v.number()), // Soft delete
		createdAt: v.number(),
	})
		.index("by_run", ["runId"])
		.index("by_workspace_created", ["workspaceId", "createdAt"])
		.index("by_workspace_expires", ["workspaceId", "expiresAt"])
		.index("by_workspace_artifactId", ["workspaceId", "artifactId"]),

	// Agent Heartbeats: Health monitoring
	agentHeartbeats: defineTable({
		workspaceId: v.id("workspaces"),
		agentId: v.string(),
		at: v.number(),
		metrics: v.optional(
			v.object({
				activeRuns: v.optional(v.number()),
				queuedRuns: v.optional(v.number()),
				cpuPercent: v.optional(v.number()),
				memoryPercent: v.optional(v.number()),
				errors: v.optional(v.number()),
			}),
		),
	})
		.index("by_workspace_agent", ["workspaceId", "agentId", "at"])
		.index("by_workspace_recent", ["workspaceId", "at"]),

	// Navigation Preferences: User-specific navigation customization
	navigationPreferences: defineTable({
		userId: v.id("users"),
		workspaceId: v.id("workspaces"),
		applications: v.array(
			v.object({
				id: v.string(), // "dashboard", "ideas", "projects", etc.
				name: v.string(), // Display name
				icon: v.string(), // Icon identifier (lucide icon name)
				href: v.string(), // Route path
				isVisible: v.boolean(), // Whether to show in navigation
				sortOrder: v.number(), // Display order (0-based)
				badge: v.optional(v.string()), // Optional badge text
				isCustom: v.optional(v.boolean()), // User-added custom apps
				customConfig: v.optional(
					v.object({
						color: v.optional(v.string()), // Custom color
						description: v.optional(v.string()), // Custom description
					}),
				),
			}),
		),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_user_workspace", ["userId", "workspaceId"])
		.index("by_workspace", ["workspaceId"]),
});
