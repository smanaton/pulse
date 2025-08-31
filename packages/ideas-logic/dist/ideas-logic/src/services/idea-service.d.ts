/**
 * Idea Service
 *
 * Core business logic for idea management.
 */
import type { Id } from "@pulse/core/types";
import type { CreateIdeaInput, ProcessedIdeaData, UpdateIdeaInput, ValidationResult } from "../types";
export interface IdeaCreationResult {
    success: boolean;
    data?: ProcessedIdeaData;
    validation?: ValidationResult;
    errors?: string[];
}
export declare function processIdeaCreation(input: CreateIdeaInput): Promise<IdeaCreationResult>;
export interface IdeaUpdateResult {
    success: boolean;
    data?: Partial<ProcessedIdeaData>;
    validation?: ValidationResult;
    errors?: string[];
}
export declare function processIdeaUpdate(input: UpdateIdeaInput, existingIdea: {
    title: string;
    contentMD: string;
    contentBlocks?: any;
    status: "draft" | "active" | "archived";
    projectId?: Id<"projects">;
    folderId?: Id<"folders">;
}): Promise<IdeaUpdateResult>;
export interface IdeaEnhancement {
    keywords: string[];
    suggestedTags: string[];
    readingTime: number;
    wordCount: number;
    summary?: string;
}
export declare function enhanceIdeaMetadata(title: string, contentMD: string): IdeaEnhancement;
export interface StatusChangeResult {
    success: boolean;
    newStatus?: "draft" | "active" | "archived";
    errors?: string[];
}
export declare function processStatusChange(_currentStatus: "draft" | "active" | "archived", newStatus: "draft" | "active" | "archived", ideaData: {
    title: string;
    contentMD: string;
}): StatusChangeResult;
export interface IdeaDuplicationResult {
    success: boolean;
    data?: ProcessedIdeaData;
    errors?: string[];
}
export declare function processDuplicateIdea(originalIdea: {
    title: string;
    contentMD: string;
    contentBlocks?: any;
    workspaceId: Id<"workspaces">;
    projectId?: Id<"projects">;
    folderId?: Id<"folders">;
}, createdBy: Id<"users">, options?: {
    newTitle?: string;
    newFolderId?: Id<"folders">;
    newProjectId?: Id<"projects">;
}): IdeaDuplicationResult;
export interface BatchIdeaCreationResult {
    success: boolean;
    processed: ProcessedIdeaData[];
    errors: Array<{
        index: number;
        errors: string[];
    }>;
}
export declare function processBatchIdeaCreation(inputs: CreateIdeaInput[]): Promise<BatchIdeaCreationResult>;
//# sourceMappingURL=idea-service.d.ts.map