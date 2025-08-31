/**
 * Ideas Domain - Service Implementations
 *
 * Business logic services that implement domain operations for ideas and folders.
 * These services are framework-agnostic and contain pure business logic.
 */
import type { Id } from "../types";
import type { IBusinessContext, IdeaCreateInput, IdeaSearchOptions, IdeaUpdateInput, IFolderRepository, IFolderService, IIdeaRepository, IIdeaService } from "./interfaces";
export declare class IdeaDomainError extends Error {
    code: string;
    constructor(message: string, code: string);
}
export declare class ValidationError extends IdeaDomainError {
    constructor(message: string);
}
export declare class PermissionError extends IdeaDomainError {
    constructor(message: string);
}
export declare class NotFoundError extends IdeaDomainError {
    constructor(resource: string);
}
export declare class IdeaService implements IIdeaService {
    private readonly repository;
    private readonly context;
    constructor(repository: IIdeaRepository, context: IBusinessContext);
    create(input: IdeaCreateInput): Promise<Id<"ideas">>;
    update(ideaId: Id<"ideas">, input: IdeaUpdateInput): Promise<void>;
    delete(ideaId: Id<"ideas">): Promise<void>;
    get(ideaId: Id<"ideas">): Promise<any | null>;
    search(options: IdeaSearchOptions): Promise<any[]>;
    move(ideaId: Id<"ideas">, targetFolderId?: Id<"folders">, targetProjectId?: Id<"projects">): Promise<void>;
    private validateCreateInput;
    private validateStatusTransition;
}
export declare class FolderService implements IFolderService {
    private readonly repository;
    readonly _ideaRepository: IIdeaRepository;
    private readonly context;
    constructor(repository: IFolderRepository, _ideaRepository: IIdeaRepository, context: IBusinessContext);
    create(workspaceId: Id<"workspaces">, name: string, parentId?: Id<"folders">): Promise<Id<"folders">>;
    delete(folderId: Id<"folders">): Promise<void>;
    getHierarchy(workspaceId: Id<"workspaces">): Promise<any[]>;
    private validateFolderName;
    private buildFolderHierarchy;
}
export interface IServiceContainer {
    ideaService: IIdeaService;
    folderService: IFolderService;
}
export declare function createServices(repositories: {
    ideaRepository: IIdeaRepository;
    folderRepository: IFolderRepository;
}, context: IBusinessContext): IServiceContainer;
//# sourceMappingURL=services.d.ts.map