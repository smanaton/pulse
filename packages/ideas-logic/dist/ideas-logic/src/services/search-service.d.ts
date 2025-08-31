/**
 * Search Service
 *
 * Business logic for search operations, filtering, and content discovery.
 */
import type { Id } from "@pulse/core/types";
import type { IdeaSearchInput } from "../types";
export interface ProcessedSearchQuery {
    originalQuery: string;
    cleanedQuery: string;
    searchTerms: string[];
    filters: SearchFilters;
}
export interface SearchFilters {
    workspaceId: Id<"workspaces">;
    folderId?: Id<"folders">;
    projectId?: Id<"projects">;
    status?: "draft" | "active" | "archived";
    tagIds?: Id<"tags">[];
    createdBy?: Id<"users">;
    dateRange?: {
        start: number;
        end: number;
    };
}
export declare function processSearchQuery(input: IdeaSearchInput): ProcessedSearchQuery;
export interface SearchResult {
    ideaId: Id<"ideas">;
    title: string;
    contentPreview: string;
    score: number;
    highlights: SearchHighlight[];
    matchedTerms: string[];
    createdAt: number;
    updatedAt: number;
}
export interface SearchHighlight {
    field: "title" | "content";
    text: string;
    startIndex: number;
    endIndex: number;
}
export declare function rankSearchResults(ideas: Array<{
    _id: Id<"ideas">;
    title: string;
    contentMD: string;
    createdAt: number;
    updatedAt: number;
    status: "draft" | "active" | "archived";
}>, searchTerms: string[], options?: {
    prioritizeRecent?: boolean;
    statusBoost?: Record<string, number>;
}): SearchResult[];
export interface AdvancedSearchOptions {
    filters: SearchFilters;
    sortBy?: "relevance" | "created" | "updated" | "title";
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
}
export declare function buildAdvancedSearchQuery(searchTerms: string[], options: AdvancedSearchOptions): {
    searchTerms: string[];
    filters: SearchFilters;
    sorting: {
        field: string;
        direction: "asc" | "desc";
    };
    pagination: {
        limit: number;
        offset: number;
    };
};
export interface SearchAnalytics {
    totalQueries: number;
    uniqueQueries: number;
    averageResultsPerQuery: number;
    topSearchTerms: Array<{
        term: string;
        count: number;
    }>;
    zeroResultQueries: Array<{
        query: string;
        count: number;
    }>;
    popularFilters: Record<string, number>;
}
export declare function calculateSearchAnalytics(searchHistory: Array<{
    query: string;
    resultCount: number;
    filters: SearchFilters;
    timestamp: number;
}>, timeRange?: {
    start: number;
    end: number;
}): SearchAnalytics;
export interface SearchSuggestion {
    query: string;
    type: "recent" | "popular" | "completion";
    score: number;
}
export declare function generateSearchSuggestions(partialQuery: string, searchHistory: Array<{
    query: string;
    resultCount: number;
    timestamp: number;
}>, maxSuggestions?: number): SearchSuggestion[];
//# sourceMappingURL=search-service.d.ts.map