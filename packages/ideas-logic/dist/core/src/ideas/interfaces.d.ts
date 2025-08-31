/**
 * Ideas Domain - Service Interfaces
 *
 * Business logic interfaces that define the contracts for idea management.
 * These are implemented by services and consumed by Convex adapters.
 */
import type { Id } from "../types";
export interface IdeaCreateInput {
    workspaceId: Id<"workspaces">;
    projectId?: Id<"projects">;
    folderId?: Id<"folders">;
    title: string;
    contentMD: string;
    contentBlocks?: any;
}
export interface IdeaUpdateInput {
    title?: string;
    contentMD?: string;
    contentBlocks?: any;
    projectId?: Id<"projects">;
    folderId?: Id<"folders">;
    status?: "draft" | "active" | "archived";
}
export interface IdeaSearchOptions {
    workspaceId: Id<"workspaces">;
    query?: string;
    projectId?: Id<"projects">;
    folderId?: Id<"folders">;
    status?: "draft" | "active" | "archived";
    limit?: number;
}
export interface IIdeaRepository {
    create(data: IdeaCreateInput & {
        createdBy: Id<"users">;
    }): Promise<Id<"ideas">>;
    update(id: Id<"ideas">, data: Partial<IdeaUpdateInput>): Promise<void>;
    delete(id: Id<"ideas">): Promise<void>;
    findById(id: Id<"ideas">): Promise<any | null>;
    findByWorkspace(workspaceId: Id<"workspaces">, limit?: number): Promise<any[]>;
    search(options: IdeaSearchOptions): Promise<any[]>;
}
export interface IFolderRepository {
    create(data: {
        workspaceId: Id<"workspaces">;
        name: string;
        parentId?: Id<"folders">;
        createdBy: Id<"users">;
    }): Promise<Id<"folders">>;
    findById(id: Id<"folders">): Promise<any | null>;
    findByWorkspace(workspaceId: Id<"workspaces">): Promise<any[]>;
    delete(id: Id<"folders">): Promise<void>;
}
export interface IIdeaService {
    /**
     * Create a new idea with validation and business rules
     */
    create(input: IdeaCreateInput): Promise<Id<"ideas">>;
    /**
     * Update an existing idea with ownership validation
     */
    update(ideaId: Id<"ideas">, input: IdeaUpdateInput): Promise<void>;
    /**
     * Delete an idea (soft delete with cleanup)
     */
    delete(ideaId: Id<"ideas">): Promise<void>;
    /**
     * Get idea by ID with permission checking
     */
    get(ideaId: Id<"ideas">): Promise<any | null>;
    /**
     * Search ideas with full-text and filters
     */
    search(options: IdeaSearchOptions): Promise<any[]>;
    /**
     * Move idea to different folder/project
     */
    move(ideaId: Id<"ideas">, targetFolderId?: Id<"folders">, targetProjectId?: Id<"projects">): Promise<void>;
}
export interface IFolderService {
    /**
     * Create a new folder with hierarchy validation
     */
    create(workspaceId: Id<"workspaces">, name: string, parentId?: Id<"folders">): Promise<Id<"folders">>;
    /**
     * Delete folder after checking for contents
     */
    delete(folderId: Id<"folders">): Promise<void>;
    /**
     * Get folder hierarchy for workspace
     */
    getHierarchy(workspaceId: Id<"workspaces">): Promise<any[]>;
}
export interface IConvexContext {
    db: any;
    storage: any;
}
export interface IBusinessContext {
    userId: Id<"users">;
    workspaceId?: Id<"workspaces">;
    userRole?: string;
}
export interface IServiceContainer {
    ideaService: IIdeaService;
    folderService: IFolderService;
}
//# sourceMappingURL=interfaces.d.ts.map