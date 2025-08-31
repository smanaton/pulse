/**
 * Core TypeScript Types
 *
 * Shared type definitions used across the Pulse platform.
 * These types are extracted from the main schema for reuse.
 */
export type Id<T extends string> = string & {
    __tableName: T;
};
import type { WorkspacePlan, WorkspaceType } from "../workspaces/types";
export interface BaseEntity {
    _id: string;
    _creationTime: number;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
}
export interface User extends BaseEntity {
    _id: Id<"users">;
    email?: string;
    emailVerified?: number;
    emailVerificationTime?: number;
    name?: string;
    image?: string;
    tokenIdentifier?: string;
}
export interface Workspace extends BaseEntity {
    _id: Id<"workspaces">;
    type: WorkspaceType;
    isPersonal: boolean;
    plan: WorkspacePlan;
    name: string;
    slug?: string;
    ownerUserId?: Id<"users">;
    disabled?: boolean;
}
export interface WorkspaceMember extends BaseEntity {
    _id: Id<"workspaceMembers">;
    workspaceId: Id<"workspaces">;
    userId: Id<"users">;
    role: "owner" | "admin" | "editor" | "viewer";
    invitedBy?: Id<"users">;
    invitedAt?: number;
    joinedAt?: number;
}
export type IdeaStatus = "draft" | "active" | "archived";
export interface Idea extends BaseEntity {
    _id: Id<"ideas">;
    workspaceId: Id<"workspaces">;
    projectId?: Id<"projects">;
    folderId?: Id<"folders">;
    title: string;
    contentMD: string;
    contentBlocks?: any;
    status: IdeaStatus;
    copiedFromId?: Id<"ideas">;
    createdBy: Id<"users">;
}
export interface Folder extends BaseEntity {
    _id: Id<"folders">;
    workspaceId: Id<"workspaces">;
    parentId?: Id<"folders">;
    name: string;
    sortKey: number;
    createdBy: Id<"users">;
}
export interface Tag extends BaseEntity {
    _id: Id<"tags">;
    workspaceId: Id<"workspaces">;
    name: string;
    color?: string;
    createdBy: Id<"users">;
}
export interface IdeaTag {
    _id: Id<"ideaTags">;
    _creationTime: number;
    ideaId: Id<"ideas">;
    tagId: Id<"tags">;
    createdAt: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type EntityId<T extends string> = Id<T>;
export interface ModuleDefinition<T = any> {
    name: string;
    version: string;
    dependencies: string[];
    schema: Record<string, any>;
    functions: T;
    permissions?: ModulePermissions;
    config?: ModuleConfig;
}
export interface ModulePermissions {
    read: string[];
    write: string[];
    admin: string[];
}
export interface ModuleConfig {
    [key: string]: any;
}
//# sourceMappingURL=index.d.ts.map