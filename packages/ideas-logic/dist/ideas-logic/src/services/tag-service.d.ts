/**
 * Tag Service
 *
 * Business logic for tag management and tagging operations.
 */
import type { Id } from "@pulse/core/types";
import type { CreateTagInput, ProcessedTagData, TagIdeaInput, ValidationResult } from "../types";
export interface TagCreationResult {
    success: boolean;
    data?: ProcessedTagData;
    validation?: ValidationResult;
    errors?: string[];
}
export declare function processTagCreation(input: CreateTagInput, existingTagNames?: string[]): Promise<TagCreationResult>;
export interface TagApplicationResult {
    success: boolean;
    errors?: string[];
}
export declare function processTagApplication(input: TagIdeaInput, existingTaggedIdeas?: Id<"ideas">[]): TagApplicationResult;
export interface TagSuggestion {
    name: string;
    color: string;
    confidence: number;
    reason: string;
}
export declare function generateTagSuggestions(content: string, existingTags: Array<{
    name: string;
    color: string;
}>, options?: {
    maxSuggestions?: number;
    minConfidence?: number;
}): TagSuggestion[];
export interface TagUsageStats {
    tagId: Id<"tags">;
    name: string;
    color: string;
    usageCount: number;
    lastUsed?: number;
    createdAt: number;
}
export interface TagAnalytics {
    totalTags: number;
    totalTaggedIdeas: number;
    averageTagsPerIdea: number;
    mostUsedTags: TagUsageStats[];
    recentlyUsedTags: TagUsageStats[];
    unusedTags: TagUsageStats[];
}
export declare function calculateTagAnalytics(tags: Array<{
    _id: Id<"tags">;
    name: string;
    color: string;
    createdAt: number;
}>, tagUsage: Map<Id<"tags">, {
    count: number;
    lastUsed?: number;
}>): TagAnalytics;
export interface TagCleanupResult {
    success: boolean;
    cleanedTags: Id<"tags">[];
    mergedTags: Array<{
        sourceId: Id<"tags">;
        targetId: Id<"tags">;
        sourceName: string;
        targetName: string;
    }>;
}
export declare function processTagCleanup(tags: Array<{
    _id: Id<"tags">;
    name: string;
    createdAt: number;
}>, tagUsage: Map<Id<"tags">, number>, options?: {
    removeUnused?: boolean;
    mergeSimilar?: boolean;
    daysUnusedThreshold?: number;
}): TagCleanupResult;
export interface BatchTagCreationResult {
    success: boolean;
    processed: ProcessedTagData[];
    errors: Array<{
        index: number;
        errors: string[];
    }>;
}
export declare function processBatchTagCreation(inputs: CreateTagInput[]): Promise<BatchTagCreationResult>;
//# sourceMappingURL=tag-service.d.ts.map