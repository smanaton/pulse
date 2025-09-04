/**
 * Shared Validators
 *
 * Reusable validator definitions to eliminate duplication and ensure consistency
 * across all Convex functions. Following best practices from:
 * https://stack.convex.dev/argument-validation-without-repetition
 */

import { v } from "convex/values";
import { partial } from "convex-helpers/validators";

// === ID Validators ===
export const workspaceId = v.id("workspaces");
export const userId = v.id("users");
export const ideaId = v.id("ideas");
export const projectId = v.id("projects");
export const folderId = v.id("folders");
export const tagId = v.id("tags");
export const fileId = v.id("files");
export const taskId = v.id("tasks");
export const clientId = v.id("clients");
export const taskCommentId = v.id("taskComments");

// === Optional ID Validators ===
export const optionalProjectId = v.optional(projectId);
export const optionalFolderId = v.optional(folderId);
export const optionalUserId = v.optional(userId);
export const optionalTaskId = v.optional(taskId);
export const optionalClientId = v.optional(clientId);

// === String Validators ===
export const name = v.string();
export const title = v.string();
export const description = v.optional(v.string());
export const slug = v.string();
export const email = v.optional(v.string());
export const contentMD = v.string();
export const contentBlocks = v.optional(v.string()); // JSON string for BlockNote blocks

// === Number Validators ===
export const sortKey = v.number();
export const limit = v.optional(v.number());
export const count = v.number();
export const size = v.number();

// === Boolean Validators ===
export const isPersonal = v.boolean();
export const disabled = v.optional(v.boolean());

// === Enum Validators ===
// Workspace types
export const workspaceType = v.union(
	v.literal("personal"),
	v.literal("shared"),
);
export const planType = v.union(v.literal("free"), v.literal("team"));

// User roles
export const roleType = v.union(
	v.literal("owner"),
	v.literal("admin"),
	v.literal("editor"),
	v.literal("viewer"),
);

// Content status
export const statusType = v.union(
	v.literal("draft"),
	v.literal("active"),
	v.literal("archived"),
);

// Project status
export const projectStatusType = v.union(
	v.literal("active"),
	v.literal("on_hold"),
	v.literal("completed"),
	v.literal("archived"),
);

// Project priority
export const projectPriorityType = v.union(
	v.literal("low"),
	v.literal("medium"),
	v.literal("high"),
	v.literal("urgent"),
);

// Task status
export const taskStatusType = v.union(
	v.literal("backlog"),
	v.literal("todo"),
	v.literal("in_progress"),
	v.literal("in_review"),
	v.literal("done"),
	v.literal("cancelled"),
);

// Task priority (same as project priority)
export const taskPriorityType = projectPriorityType;

// Project member roles
export const projectMemberRoleType = v.union(
	v.literal("owner"),
	v.literal("manager"),
	v.literal("member"),
	v.literal("viewer"),
);

// Move job status
export const moveJobStatusType = v.union(
	v.literal("pending"),
	v.literal("running"),
	v.literal("completed"),
	v.literal("failed"),
	v.literal("cancelled"),
);

// Move mode
export const moveMode = v.union(v.literal("move"), v.literal("copy"));

// Rate limit types
export const rateLimitType = v.union(
	v.literal("invite_per_workspace"),
	v.literal("invite_per_user"),
	v.literal("ai_tokens_daily"),
	v.literal("ai_tags_daily"),
	v.literal("ai_summaries_daily"),
	v.literal("move_operations"),
);

// Event types
export const eventType = v.union(
	v.literal("personal_workspace_created"),
	v.literal("workspace_created"),
	v.literal("invite_sent"),
	v.literal("member_joined"),
	v.literal("idea_created"),
	v.literal("idea_updated"),
	v.literal("idea_moved"),
	v.literal("project_created"),
	v.literal("project_updated"),
	v.literal("project_deleted"),
	v.literal("projects_reordered"),
	v.literal("member_added"),
	v.literal("member_updated"),
	v.literal("member_removed"),
	v.literal("folder_created"),
	v.literal("tag_created"),
	v.literal("move_started"),
	v.literal("move_batch"),
	v.literal("move_completed"),
	v.literal("move_failed"),
	v.literal("ai_summary_generated"),
	v.literal("ai_tags_suggested"),
	v.literal("ai_message_processed"),
	v.literal("kill_switch_enabled"),
	v.literal("kill_switch_disabled"),
);

// === Common Argument Patterns ===

// Base workspace operation args
export const workspaceArgs = {
	workspaceId,
};

// Pagination args
export const paginationArgs = {
	limit,
};

// Idea creation args
export const ideaCreateArgs = {
	workspaceId,
	projectId: optionalProjectId,
	folderId: optionalFolderId,
	title,
	contentMD,
	contentBlocks,
	// Structured idea fields for qualifying lightbulb moments
	problem: v.optional(v.string()),
	hypothesis: v.optional(v.string()),
	value: v.optional(v.string()),
	risks: v.optional(v.string()),
};

// Idea update args (using partial pattern for optional updates)
export const ideaUpdateArgs = {
	ideaId,
	...partial({
		title,
		contentMD,
		contentBlocks,
		status: statusType,
		projectId,
		folderId,
		// Structured idea fields for qualifying lightbulb moments
		problem: v.string(),
		hypothesis: v.string(),
		value: v.string(),
		risks: v.string(),
	}),
};

// Project creation args
export const projectCreateArgs = {
	workspaceId,
	name,
	description,
	priority: v.optional(projectPriorityType),
	startDate: v.optional(v.number()),
	endDate: v.optional(v.number()),
	ownerId: v.optional(userId), // Optional - defaults to creator
	clientId: optionalClientId,
	tags: v.optional(v.array(v.string())),
	color: v.optional(v.string()),
	budget: v.optional(v.number()),
	estimatedHours: v.optional(v.number()),
	isTemplate: v.optional(v.boolean()),
	templateId: optionalProjectId,
};

// Project update args
export const projectUpdateArgs = {
	projectId,
	...partial({
		name,
		description,
		status: projectStatusType,
		priority: projectPriorityType,
		startDate: v.number(),
		endDate: v.number(),
		ownerId: userId,
		clientId,
		tags: v.array(v.string()),
		color: v.string(),
		budget: v.number(),
		estimatedHours: v.number(),
		actualHours: v.number(),
		progress: v.number(),
		sortKey,
	}),
};

// Workspace creation args
export const workspaceCreateArgs = {
	name,
	slug: v.optional(slug),
	type: workspaceType,
	plan: planType,
};

// Workspace member args
export const workspaceMemberArgs = {
	workspaceId,
	userId,
	role: roleType,
};

// File args
export const fileArgs = {
	workspaceId,
	name,
	size,
	contentType: v.string(),
	url: v.string(),
	ideaId: v.optional(ideaId),
};

// Tag args
export const tagCreateArgs = {
	workspaceId,
	name,
	color: v.optional(v.string()),
};

// List filtering args
export const ideaListArgs = {
	workspaceId,
	folderId: optionalFolderId,
	projectId: optionalProjectId,
	status: v.optional(statusType),
	...paginationArgs,
};

export const projectListArgs = {
	workspaceId,
	status: v.optional(projectStatusType),
	...paginationArgs,
};

// Project deletion args
export const projectDeleteArgs = {
	projectId,
};

// Project reorder args
export const projectReorderArgs = {
	workspaceId,
	projectIds: v.array(projectId),
};

// Workspace args
export const workspaceBySlugArgs = {
	slug,
};

export const workspaceMemberInviteArgs = {
	workspaceId,
	email: v.string(),
	role: roleType,
};

export const workspaceMemberUpdateArgs = {
	workspaceId,
	userId,
	role: roleType,
};

export const workspaceMemberRemoveArgs = {
	workspaceId,
	userId,
};

export const workspaceUpdateArgs = {
	workspaceId,
	...partial({
		name,
		slug: v.optional(slug),
		plan: planType,
		disabled,
	}),
};

// Get workspace by ID args
export const workspaceByIdArgs = {
	workspaceId,
};

// Create shared workspace args
export const workspaceCreateSharedArgs = {
	name,
	slug,
	plan: v.optional(planType),
};

// List workspace members args
export const workspaceListMembersArgs = {
	workspaceId,
};

// Empty args for functions with no parameters
export const emptyArgs = {};

// Update member role args
export const workspaceMemberRoleUpdateArgs = {
	workspaceId,
	userId,
	newRole: v.union(
		v.literal("viewer"),
		v.literal("editor"),
		v.literal("admin"),
	),
};

// Kill switch args
export const workspaceKillSwitchArgs = {
	workspaceId,
	disabled: v.boolean(),
};

// File upload args
export const fileUploadArgs = {
	workspaceId,
	ideaId: v.optional(ideaId),
	name,
	size,
	contentType: v.string(),
};

// File list args
export const fileListArgs = {
	workspaceId,
	ideaId: v.optional(ideaId),
	...paginationArgs,
};

// File delete args
export const fileDeleteArgs = {
	fileId,
};

// File get args
export const fileGetArgs = {
	fileId,
};

// Tag list args
export const tagListArgs = {
	workspaceId,
};

// Tag/idea association args
export const tagIdeaArgs = {
	ideaId,
	tagId,
};

export const tagIdeaRemoveArgs = {
	ideaId,
	tagId,
};

// Idea search args
export const ideaSearchArgs = {
	workspaceId,
	query: v.optional(v.string()),
	limit,
};

// Idea delete args
export const ideaDeleteArgs = {
	ideaId,
};

// Folder creation args
export const folderCreateArgs = {
	workspaceId,
	name,
	parentId: v.optional(v.id("folders")),
};

// Folder delete args
export const folderDeleteArgs = {
	folderId,
};

// Idea move args
export const ideaMoveArgs = {
	ideaId,
	targetFolderId: v.optional(v.id("folders")),
	targetProjectId: v.optional(v.id("projects")),
};

// Get idea tags args
export const ideaGetTagsArgs = {
	ideaId,
};

// === Task Validators ===

// Task creation args
export const taskCreateArgs = {
	workspaceId,
	projectId,
	name,
	description,
	status: v.optional(taskStatusType),
	priority: v.optional(taskPriorityType),
	assignedTo: v.optional(v.array(userId)),
	parentTaskId: optionalTaskId,
	dueDate: v.optional(v.number()),
	startDate: v.optional(v.number()),
	estimatedHours: v.optional(v.number()),
	tags: v.optional(v.array(v.string())),
	boardId: v.optional(v.string()),
};

// Task update args
export const taskUpdateArgs = {
	taskId,
	...partial({
		name,
		description,
		status: taskStatusType,
		priority: taskPriorityType,
		assignedTo: v.array(userId),
		dueDate: v.number(),
		startDate: v.number(),
		estimatedHours: v.number(),
		actualHours: v.number(),
		tags: v.array(v.string()),
		progress: v.number(),
		boardId: v.string(),
		position: v.number(),
	}),
};

// Task list args
export const taskListArgs = {
	workspaceId,
	projectId: optionalProjectId,
	status: v.optional(taskStatusType),
	assignedTo: optionalUserId,
	boardId: v.optional(v.string()),
	...paginationArgs,
};

// Task delete args
export const taskDeleteArgs = {
	taskId,
};

// Task move args (for kanban)
export const taskMoveArgs = {
	taskId,
	targetBoardId: v.string(),
	targetPosition: v.number(),
};

// Project member args
export const projectMemberAddArgs = {
	projectId,
	userId,
	role: projectMemberRoleType,
	canEditTasks: v.optional(v.boolean()),
	canManageMembers: v.optional(v.boolean()),
};

export const projectMemberUpdateArgs = {
	projectId,
	userId,
	role: projectMemberRoleType,
	canEditTasks: v.optional(v.boolean()),
	canManageMembers: v.optional(v.boolean()),
};

export const projectMemberRemoveArgs = {
	projectId,
	userId,
};

// Task comment args
export const taskCommentCreateArgs = {
	taskId,
	content: v.string(),
	parentCommentId: v.optional(taskCommentId),
	attachments: v.optional(v.array(fileId)),
	isInternal: v.optional(v.boolean()),
};

export const taskCommentUpdateArgs = {
	commentId: taskCommentId,
	content: v.string(),
};

export const taskCommentDeleteArgs = {
	commentId: taskCommentId,
};

// Project statistics args
export const projectStatsArgs = {
	workspaceId,
	projectId: optionalProjectId,
	timeframe: v.optional(
		v.union(
			v.literal("week"),
			v.literal("month"),
			v.literal("quarter"),
			v.literal("year"),
		),
	),
};
