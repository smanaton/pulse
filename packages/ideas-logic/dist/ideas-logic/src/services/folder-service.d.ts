/**
 * Folder Service
 *
 * Business logic for folder management and hierarchy operations.
 */
import type { Id } from "@pulse/core/types";
import type { CreateFolderInput, FolderHierarchy, ProcessedFolderData, UpdateFolderInput, ValidationResult } from "../types";
export interface FolderCreationResult {
    success: boolean;
    data?: ProcessedFolderData;
    validation?: ValidationResult;
    errors?: string[];
}
export declare function processFolderCreation(input: CreateFolderInput, existingFolderNames?: string[]): Promise<FolderCreationResult>;
export interface FolderUpdateResult {
    success: boolean;
    data?: Partial<ProcessedFolderData>;
    validation?: ValidationResult;
    errors?: string[];
}
export declare function processFolderUpdate(input: UpdateFolderInput, existingFolder: {
    name: string;
    parentId?: Id<"folders">;
}, existingFolderNames?: string[]): Promise<FolderUpdateResult>;
export interface FolderMoveResult {
    success: boolean;
    data?: Partial<ProcessedFolderData>;
    errors?: string[];
}
export declare function processFolderMove(folderId: Id<"folders">, targetParentId: Id<"folders"> | undefined, folderHierarchy: Map<Id<"folders">, Id<"folders"> | undefined>): FolderMoveResult;
export declare function buildFolderHierarchy(folders: Array<{
    _id: Id<"folders">;
    name: string;
    parentId?: Id<"folders">;
    sortKey: number;
}>, ideaCounts?: Map<Id<"folders">, number>): FolderHierarchy[];
export interface FolderPath {
    folders: Array<{
        _id: Id<"folders">;
        name: string;
    }>;
    fullPath: string;
}
export declare function buildFolderPath(folderId: Id<"folders">, folders: Map<Id<"folders">, {
    name: string;
    parentId?: Id<"folders">;
}>): FolderPath;
export interface FolderDeletionResult {
    success: boolean;
    affectedFolders: Id<"folders">[];
    affectedIdeas: Id<"ideas">[];
    errors?: string[];
}
export declare function processFolderDeletion(folderId: Id<"folders">, folderHierarchy: Map<Id<"folders">, Id<"folders"> | undefined>, ideasInFolders: Map<Id<"folders">, Id<"ideas">[]>): FolderDeletionResult;
export interface BatchFolderCreationResult {
    success: boolean;
    processed: ProcessedFolderData[];
    errors: Array<{
        index: number;
        errors: string[];
    }>;
}
export declare function processBatchFolderCreation(inputs: CreateFolderInput[]): Promise<BatchFolderCreationResult>;
export interface FolderStats {
    totalFolders: number;
    totalIdeas: number;
    maxDepth: number;
    averageIdeasPerFolder: number;
}
export declare function calculateFolderStats(folders: Array<{
    _id: Id<"folders">;
    parentId?: Id<"folders">;
}>, ideaCounts: Map<Id<"folders">, number>): FolderStats;
//# sourceMappingURL=folder-service.d.ts.map