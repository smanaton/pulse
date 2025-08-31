/**
 * Ideas Domain - Service Implementations
 *
 * Business logic services that implement domain operations for ideas and folders.
 * These services are framework-agnostic and contain pure business logic.
 */
import { sanitizeContent, sanitizeTitle } from "../shared/helpers";
// ============================================================================
// Domain Errors
// ============================================================================
export class IdeaDomainError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "IdeaDomainError";
    }
}
export class ValidationError extends IdeaDomainError {
    constructor(message) {
        super(message, "VALIDATION_ERROR");
    }
}
export class PermissionError extends IdeaDomainError {
    constructor(message) {
        super(message, "PERMISSION_ERROR");
    }
}
export class NotFoundError extends IdeaDomainError {
    constructor(resource) {
        super(`${resource} not found`, "NOT_FOUND");
    }
}
// ============================================================================
// Idea Service Implementation
// ============================================================================
export class IdeaService {
    repository;
    context;
    constructor(repository, context) {
        this.repository = repository;
        this.context = context;
    }
    async create(input) {
        // Validate input
        this.validateCreateInput(input);
        // Ensure user has access to workspace
        if (this.context.workspaceId &&
            this.context.workspaceId !== input.workspaceId) {
            throw new PermissionError("Cannot create idea in different workspace");
        }
        // Sanitize user input
        const sanitizedInput = {
            ...input,
            title: sanitizeTitle(input.title),
            contentMD: sanitizeContent(input.contentMD),
        };
        // Create the idea
        const ideaId = await this.repository.create({
            ...sanitizedInput,
            createdBy: this.context.userId,
        });
        return ideaId;
    }
    async update(ideaId, input) {
        // Validate the idea exists and user has access
        const existingIdea = await this.repository.findById(ideaId);
        if (!existingIdea) {
            throw new NotFoundError("Idea");
        }
        // Check workspace access
        if (this.context.workspaceId &&
            this.context.workspaceId !== existingIdea.workspaceId) {
            throw new PermissionError("Cannot update idea in different workspace");
        }
        // Sanitize any text updates
        const sanitizedInput = { ...input };
        if (input.title) {
            sanitizedInput.title = sanitizeTitle(input.title);
        }
        if (input.contentMD) {
            sanitizedInput.contentMD = sanitizeContent(input.contentMD);
        }
        // Validate business rules for status transitions
        if (input.status && existingIdea.status !== input.status) {
            this.validateStatusTransition(existingIdea.status, input.status);
        }
        await this.repository.update(ideaId, sanitizedInput);
    }
    async delete(ideaId) {
        // Validate the idea exists and user has access
        const existingIdea = await this.repository.findById(ideaId);
        if (!existingIdea) {
            throw new NotFoundError("Idea");
        }
        // Check workspace access
        if (this.context.workspaceId &&
            this.context.workspaceId !== existingIdea.workspaceId) {
            throw new PermissionError("Cannot delete idea in different workspace");
        }
        // Check if user can delete (creator or admin)
        if (existingIdea.createdBy !== this.context.userId &&
            this.context.userRole !== "admin") {
            throw new PermissionError("Only the creator or workspace admin can delete this idea");
        }
        await this.repository.delete(ideaId);
    }
    async get(ideaId) {
        const idea = await this.repository.findById(ideaId);
        // Check workspace access
        if (idea &&
            this.context.workspaceId &&
            this.context.workspaceId !== idea.workspaceId) {
            throw new PermissionError("Cannot access idea in different workspace");
        }
        return idea;
    }
    async search(options) {
        // Ensure search is within user's workspace
        if (this.context.workspaceId &&
            this.context.workspaceId !== options.workspaceId) {
            throw new PermissionError("Cannot search ideas in different workspace");
        }
        // Apply reasonable limits
        const searchOptions = {
            ...options,
            limit: Math.min(options.limit || 50, 100), // Max 100 results
        };
        return await this.repository.search(searchOptions);
    }
    async move(ideaId, targetFolderId, targetProjectId) {
        // Validate the idea exists and user has access
        const existingIdea = await this.repository.findById(ideaId);
        if (!existingIdea) {
            throw new NotFoundError("Idea");
        }
        // Check workspace access
        if (this.context.workspaceId &&
            this.context.workspaceId !== existingIdea.workspaceId) {
            throw new PermissionError("Cannot move idea in different workspace");
        }
        // Update the idea location
        await this.repository.update(ideaId, {
            folderId: targetFolderId,
            projectId: targetProjectId,
        });
    }
    // ============================================================================
    // Private Validation Methods
    // ============================================================================
    validateCreateInput(input) {
        if (!input.title || input.title.trim().length === 0) {
            throw new ValidationError("Title is required");
        }
        if (input.title.length > 200) {
            throw new ValidationError("Title must be less than 200 characters");
        }
        if (!input.contentMD || input.contentMD.trim().length === 0) {
            throw new ValidationError("Content is required");
        }
        if (input.contentMD.length > 100000) {
            throw new ValidationError("Content is too long (max 100,000 characters)");
        }
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            draft: ["active", "archived"],
            active: ["archived", "draft"],
            archived: ["active"], // Can reactivate archived ideas
        };
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new ValidationError(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
    }
}
// ============================================================================
// Folder Service Implementation
// ============================================================================
export class FolderService {
    repository;
    _ideaRepository;
    context;
    constructor(repository, _ideaRepository, context) {
        this.repository = repository;
        this._ideaRepository = _ideaRepository;
        this.context = context;
    }
    async create(workspaceId, name, parentId) {
        // Check workspace access
        if (this.context.workspaceId && this.context.workspaceId !== workspaceId) {
            throw new PermissionError("Cannot create folder in different workspace");
        }
        // Validate input
        this.validateFolderName(name);
        // Sanitize folder name
        const sanitizedName = sanitizeTitle(name);
        // If parent is specified, validate it exists and is in same workspace
        if (parentId) {
            const parentFolder = await this.repository.findById(parentId);
            if (!parentFolder) {
                throw new NotFoundError("Parent folder");
            }
            if (parentFolder.workspaceId !== workspaceId) {
                throw new ValidationError("Parent folder must be in the same workspace");
            }
        }
        return await this.repository.create({
            workspaceId,
            name: sanitizedName,
            parentId,
            createdBy: this.context.userId,
        });
    }
    async delete(folderId) {
        // Validate the folder exists
        const folder = await this.repository.findById(folderId);
        if (!folder) {
            throw new NotFoundError("Folder");
        }
        // Check workspace access
        if (this.context.workspaceId &&
            this.context.workspaceId !== folder.workspaceId) {
            throw new PermissionError("Cannot delete folder in different workspace");
        }
        // The repository will check if folder has ideas and throw an error if it does
        await this.repository.delete(folderId);
    }
    async getHierarchy(workspaceId) {
        // Check workspace access
        if (this.context.workspaceId && this.context.workspaceId !== workspaceId) {
            throw new PermissionError("Cannot access folders in different workspace");
        }
        const allFolders = await this.repository.findByWorkspace(workspaceId);
        // Build hierarchy (simple approach - could be optimized)
        return this.buildFolderHierarchy(allFolders);
    }
    // ============================================================================
    // Private Helper Methods
    // ============================================================================
    validateFolderName(name) {
        if (!name || name.trim().length === 0) {
            throw new ValidationError("Folder name is required");
        }
        if (name.length > 100) {
            throw new ValidationError("Folder name must be less than 100 characters");
        }
        // Check for invalid characters
        if (/[/\\:*?"<>|]/.test(name)) {
            throw new ValidationError("Folder name contains invalid characters");
        }
    }
    buildFolderHierarchy(folders) {
        const folderMap = new Map();
        const rootFolders = [];
        // Create a map of all folders
        for (const folder of folders) {
            folderMap.set(folder._id, { ...folder, children: [] });
        }
        // Build the hierarchy
        for (const folder of folders) {
            const folderNode = folderMap.get(folder._id);
            if (folder.parentId) {
                const parent = folderMap.get(folder.parentId);
                if (parent) {
                    parent.children.push(folderNode);
                }
                else {
                    // Parent doesn't exist (maybe deleted), treat as root
                    rootFolders.push(folderNode);
                }
            }
            else {
                rootFolders.push(folderNode);
            }
        }
        return rootFolders;
    }
}
export function createServices(repositories, context) {
    return {
        ideaService: new IdeaService(repositories.ideaRepository, context),
        folderService: new FolderService(repositories.folderRepository, repositories.ideaRepository, context),
    };
}
