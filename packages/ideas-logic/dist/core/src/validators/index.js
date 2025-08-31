/**
 * Core Validators
 *
 * Convex validator definitions extracted from the main schema.
 * These can be reused across different modules.
 */
import { v } from "convex/values";
// ============================================================================
// User Validators
// ============================================================================
export const usersValidator = {
    email: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
    emailVerificationTime: v.optional(v.number()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
};
// ============================================================================
// Workspace Validators
// ============================================================================
export const workspacesValidator = {
    type: v.union(v.literal("personal"), v.literal("shared")),
    isPersonal: v.boolean(),
    plan: v.union(v.literal("free"), v.literal("team")),
    name: v.string(),
    slug: v.optional(v.string()),
    ownerUserId: v.optional(v.id("users")),
    disabled: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
};
export const workspaceMembersValidator = {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("editor"), v.literal("viewer")),
    invitedBy: v.optional(v.id("users")),
    invitedAt: v.optional(v.number()),
    joinedAt: v.optional(v.number()),
    createdAt: v.number(),
};
// ============================================================================
// Ideas Validators
// ============================================================================
export const ideasValidator = {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    folderId: v.optional(v.id("folders")),
    title: v.string(),
    contentMD: v.string(),
    contentBlocks: v.optional(v.any()),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    copiedFromId: v.optional(v.id("ideas")),
    createdBy: v.id("users"),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
};
// ============================================================================
// Folder Validators
// ============================================================================
export const foldersValidator = {
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("folders")),
    name: v.string(),
    sortKey: v.number(),
    createdBy: v.id("users"),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
};
// ============================================================================
// Tag Validators
// ============================================================================
export const tagsValidator = {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    color: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
};
export const ideaTagsValidator = {
    ideaId: v.id("ideas"),
    tagId: v.id("tags"),
    createdAt: v.number(),
};
// ============================================================================
// Common Argument Validators
// ============================================================================
export const paginationArgs = {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    cursor: v.optional(v.string()),
};
export const workspaceId = v.id("workspaces");
export const ideaId = v.id("ideas");
export const folderId = v.id("folders");
export const tagId = v.id("tags");
export const userId = v.id("users");
// ============================================================================
// Input Validators (for mutations)
// ============================================================================
export const ideaCreateArgs = {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    folderId: v.optional(v.id("folders")),
    title: v.string(),
    contentMD: v.string(),
    contentBlocks: v.optional(v.any()),
};
export const ideaUpdateArgs = {
    id: v.id("ideas"),
    title: v.optional(v.string()),
    contentMD: v.optional(v.string()),
    contentBlocks: v.optional(v.any()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
    projectId: v.optional(v.id("projects")),
    folderId: v.optional(v.id("folders")),
};
export const ideaListArgs = {
    workspaceId: v.id("workspaces"),
    folderId: v.optional(v.id("folders")),
    projectId: v.optional(v.id("projects")),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
    ...paginationArgs,
};
export const ideaSearchArgs = {
    workspaceId: v.id("workspaces"),
    query: v.string(),
    ...paginationArgs,
};
export const ideaDeleteArgs = {
    id: v.id("ideas"),
};
export const ideaGetTagsArgs = {
    ideaId: v.id("ideas"),
};
export const tagIdeaArgs = {
    ideaId: v.id("ideas"),
    tagId: v.id("tags"),
};
export const tagIdeaRemoveArgs = {
    ideaId: v.id("ideas"),
    tagId: v.id("tags"),
};
// ============================================================================
// Folder Argument Validators
// ============================================================================
export const folderCreateArgs = {
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("folders")),
    name: v.string(),
};
export const folderUpdateArgs = {
    id: v.id("folders"),
    name: v.optional(v.string()),
    parentId: v.optional(v.id("folders")),
};
export const folderListArgs = {
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("folders")),
};
export const folderDeleteArgs = {
    id: v.id("folders"),
};
