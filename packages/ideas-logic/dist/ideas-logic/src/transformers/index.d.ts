/**
 * Data Transformers
 *
 * Pure functions that transform input data into the format needed for database storage.
 * These functions handle sanitization, normalization, and data preparation.
 */
import type { Id } from "@pulse/core/types";
import type { CreateFolderInput, CreateIdeaInput, CreateTagInput, ProcessedFolderData, ProcessedIdeaData, ProcessedTagData, UpdateFolderInput, UpdateIdeaInput } from "../types";
export declare function transformCreateIdeaInput(input: CreateIdeaInput): ProcessedIdeaData;
export declare function transformUpdateIdeaInput(input: UpdateIdeaInput, _existingIdea: {
    title: string;
    contentMD: string;
    contentBlocks?: unknown;
    status: "draft" | "active" | "archived";
    projectId?: Id<"projects">;
    folderId?: Id<"folders">;
}): Partial<ProcessedIdeaData>;
export declare function transformCreateFolderInput(input: CreateFolderInput): ProcessedFolderData;
export declare function transformUpdateFolderInput(input: UpdateFolderInput, _existingFolder: {
    name: string;
    parentId?: Id<"folders">;
}): Partial<ProcessedFolderData>;
export declare function calculateFolderSortKey(_parentId?: Id<"folders">, insertAfter?: number): number;
export declare function transformCreateTagInput(input: CreateTagInput): ProcessedTagData;
export declare function normalizeTagName(name: string): string;
export declare function generateTagColor(name: string): string;
export declare function extractPlainTextFromMarkdown(markdown: string): string;
export declare function extractKeywordsFromContent(content: string, maxKeywords?: number): string[];
export declare function transformSearchQuery(query: string): string;
export declare function buildSearchTerms(query: string): string[];
type IdeaLike = {
    _id: string;
    title: string;
    contentMD: string;
    status: string;
    createdAt: number;
    updatedAt: number;
};
export declare function transformIdeaForExport(idea: IdeaLike, format: "json" | "markdown" | "csv"): unknown;
export declare function transformBulkCreateIdeas(inputs: CreateIdeaInput[]): ProcessedIdeaData[];
export declare function transformBulkCreateFolders(inputs: CreateFolderInput[]): ProcessedFolderData[];
export declare function transformBulkCreateTags(inputs: CreateTagInput[]): ProcessedTagData[];
export {};
//# sourceMappingURL=index.d.ts.map