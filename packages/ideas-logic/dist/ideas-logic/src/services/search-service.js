/**
 * Search Service
 *
 * Business logic for search operations, filtering, and content discovery.
 */
import { buildSearchTerms, transformSearchQuery } from "../transformers";
export function processSearchQuery(input) {
    const cleanedQuery = transformSearchQuery(input.query);
    const searchTerms = buildSearchTerms(cleanedQuery);
    return {
        originalQuery: input.query,
        cleanedQuery,
        searchTerms,
        filters: {
            workspaceId: input.workspaceId,
            folderId: input.folderId,
            projectId: input.projectId,
            status: input.status,
        },
    };
}
export function rankSearchResults(ideas, searchTerms, options = {}) {
    const { prioritizeRecent = true, statusBoost = { active: 1.2, draft: 1.0, archived: 0.8 }, } = options;
    const results = [];
    for (const idea of ideas) {
        const titleScore = calculateTextScore(idea.title, searchTerms);
        const contentScore = calculateTextScore(idea.contentMD, searchTerms) * 0.7; // Content less important than title
        let baseScore = titleScore + contentScore;
        if (baseScore === 0)
            continue; // No matches found
        // Apply status boost
        const statusMultiplier = statusBoost[idea.status] || 1.0;
        baseScore *= statusMultiplier;
        // Apply recency boost if enabled
        if (prioritizeRecent) {
            const daysSinceUpdate = (Date.now() - idea.updatedAt) / (1000 * 60 * 60 * 24);
            const recencyBoost = Math.max(0.5, 1 - daysSinceUpdate / 30); // Decay over 30 days
            baseScore *= recencyBoost;
        }
        // Generate highlights
        const highlights = generateHighlights(idea.title, idea.contentMD, searchTerms);
        const matchedTerms = getMatchedTerms(`${idea.title} ${idea.contentMD}`, searchTerms);
        const contentPreview = generateContentPreview(idea.contentMD, searchTerms);
        results.push({
            ideaId: idea._id,
            title: idea.title,
            contentPreview,
            score: Math.round(baseScore * 1000) / 1000, // Round to 3 decimal places
            highlights,
            matchedTerms,
            createdAt: idea.createdAt,
            updatedAt: idea.updatedAt,
        });
    }
    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
}
function calculateTextScore(text, searchTerms) {
    const lowerText = text.toLowerCase();
    let score = 0;
    for (const term of searchTerms) {
        const lowerTerm = term.toLowerCase().replace("*", ""); // Remove wildcards
        const termLength = lowerTerm.length;
        if (termLength === 0)
            continue;
        // Exact phrase match (higher score)
        if (lowerText.includes(lowerTerm)) {
            const occurrences = (lowerText.match(new RegExp(escapeRegex(lowerTerm), "g")) || []).length;
            score += occurrences * 2;
        }
        // Partial matches (for wildcards)
        if (term.endsWith("*")) {
            const prefix = lowerTerm;
            const regex = new RegExp(`\\b${escapeRegex(prefix)}\\w*`, "g");
            const matches = lowerText.match(regex) || [];
            score += matches.length * 1.5;
        }
        // Word boundary matches (medium score)
        const wordRegex = new RegExp(`\\b${escapeRegex(lowerTerm)}\\b`, "g");
        const wordMatches = lowerText.match(wordRegex) || [];
        score += wordMatches.length * 1.8;
    }
    return score;
}
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function generateHighlights(title, content, searchTerms) {
    const highlights = [];
    // Generate title highlights
    for (const term of searchTerms) {
        const cleanTerm = term.replace("*", "");
        const regex = new RegExp(`(${escapeRegex(cleanTerm)})`, "gi");
        let match;
        while ((match = regex.exec(title)) !== null) {
            if (match[1] && match.index !== undefined) {
                highlights.push({
                    field: "title",
                    text: match[1],
                    startIndex: match.index,
                    endIndex: match.index + match[1].length,
                });
            }
        }
    }
    // Generate content highlights (limit to first few matches)
    for (const term of searchTerms) {
        const cleanTerm = term.replace("*", "");
        const regex = new RegExp(`(${escapeRegex(cleanTerm)})`, "gi");
        let matchCount = 0;
        let match;
        while ((match = regex.exec(content)) !== null && matchCount < 3) {
            if (match[1] && match.index !== undefined) {
                highlights.push({
                    field: "content",
                    text: match[1],
                    startIndex: match.index,
                    endIndex: match.index + match[1].length,
                });
                matchCount++;
            }
        }
    }
    return highlights;
}
function getMatchedTerms(text, searchTerms) {
    const lowerText = text.toLowerCase();
    const matched = [];
    for (const term of searchTerms) {
        const cleanTerm = term.replace("*", "").toLowerCase();
        if (lowerText.includes(cleanTerm)) {
            matched.push(term);
        }
    }
    return matched;
}
function generateContentPreview(content, searchTerms, maxLength = 200) {
    // Find the first occurrence of any search term
    let bestIndex = -1;
    let bestTerm = "";
    for (const term of searchTerms) {
        const cleanTerm = term.replace("*", "").toLowerCase();
        const index = content.toLowerCase().indexOf(cleanTerm);
        if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
            bestIndex = index;
            bestTerm = cleanTerm;
        }
    }
    if (bestIndex === -1) {
        // No matches found, return beginning of content
        return (content.substring(0, maxLength) +
            (content.length > maxLength ? "..." : ""));
    }
    // Extract context around the match
    const contextStart = Math.max(0, bestIndex - 50);
    const contextEnd = Math.min(content.length, bestIndex + bestTerm.length + 100);
    let preview = content.substring(contextStart, contextEnd);
    // Add ellipsis if truncated
    if (contextStart > 0)
        preview = `...${preview}`;
    if (contextEnd < content.length)
        preview = `${preview}...`;
    return preview;
}
export function buildAdvancedSearchQuery(searchTerms, options) {
    const { filters, sortBy = "relevance", sortOrder = "desc", limit = 20, offset = 0, } = options;
    return {
        searchTerms,
        filters,
        sorting: {
            field: sortBy,
            direction: sortOrder,
        },
        pagination: {
            limit: Math.min(100, Math.max(1, limit)), // Clamp between 1-100
            offset: Math.max(0, offset),
        },
    };
}
export function calculateSearchAnalytics(searchHistory, timeRange) {
    // Filter by time range if provided
    let filteredHistory = searchHistory;
    if (timeRange) {
        filteredHistory = searchHistory.filter((search) => search.timestamp >= timeRange.start &&
            search.timestamp <= timeRange.end);
    }
    const totalQueries = filteredHistory.length;
    const uniqueQueries = new Set(filteredHistory.map((s) => s.query)).size;
    const totalResults = filteredHistory.reduce((sum, search) => sum + search.resultCount, 0);
    const averageResultsPerQuery = totalQueries > 0 ? totalResults / totalQueries : 0;
    // Analyze search terms
    const termCounts = new Map();
    const zeroResultCounts = new Map();
    for (const search of filteredHistory) {
        const terms = buildSearchTerms(search.query);
        for (const term of terms) {
            termCounts.set(term, (termCounts.get(term) || 0) + 1);
        }
        if (search.resultCount === 0) {
            zeroResultCounts.set(search.query, (zeroResultCounts.get(search.query) || 0) + 1);
        }
    }
    // Top search terms
    const topSearchTerms = Array.from(termCounts.entries())
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    // Zero result queries
    const zeroResultQueries = Array.from(zeroResultCounts.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    // Popular filters
    const filterCounts = {};
    for (const search of filteredHistory) {
        if (search.filters.status) {
            filterCounts[`status:${search.filters.status}`] =
                (filterCounts[`status:${search.filters.status}`] || 0) + 1;
        }
        if (search.filters.folderId) {
            filterCounts.hasFolder = (filterCounts.hasFolder || 0) + 1;
        }
        if (search.filters.projectId) {
            filterCounts.hasProject = (filterCounts.hasProject || 0) + 1;
        }
        if (search.filters.tagIds?.length) {
            filterCounts.hasTags = (filterCounts.hasTags || 0) + 1;
        }
    }
    return {
        totalQueries,
        uniqueQueries,
        averageResultsPerQuery: Math.round(averageResultsPerQuery * 100) / 100,
        topSearchTerms,
        zeroResultQueries,
        popularFilters: filterCounts,
    };
}
export function generateSearchSuggestions(partialQuery, searchHistory, maxSuggestions = 10) {
    const suggestions = [];
    const lowerPartial = partialQuery.toLowerCase().trim();
    if (lowerPartial.length < 2)
        return suggestions;
    // Recent searches that match
    const recentThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
    const recentSearches = searchHistory
        .filter((search) => search.timestamp > recentThreshold &&
        search.query.toLowerCase().includes(lowerPartial) &&
        search.resultCount > 0)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
    for (const search of recentSearches) {
        suggestions.push({
            query: search.query,
            type: "recent",
            score: 0.8 + (search.timestamp / Date.now()) * 0.2, // Boost more recent
        });
    }
    // Popular searches that match
    const queryCounts = new Map();
    for (const search of searchHistory) {
        if (search.query.toLowerCase().includes(lowerPartial) &&
            search.resultCount > 0) {
            queryCounts.set(search.query, (queryCounts.get(search.query) || 0) + 1);
        }
    }
    const popularQueries = Array.from(queryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    for (const [query, count] of popularQueries) {
        if (!suggestions.some((s) => s.query === query)) {
            suggestions.push({
                query,
                type: "popular",
                score: 0.6 + Math.min(0.3, count / 10), // Boost based on popularity
            });
        }
    }
    // Auto-completion suggestions
    const commonCompletions = [
        "project",
        "meeting",
        "idea",
        "task",
        "bug",
        "feature",
        "design",
        "client",
        "research",
        "review",
    ];
    for (const completion of commonCompletions) {
        if (completion.startsWith(lowerPartial) && completion !== lowerPartial) {
            suggestions.push({
                query: completion,
                type: "completion",
                score: 0.4,
            });
        }
    }
    // Sort by score and limit results
    return suggestions.sort((a, b) => b.score - a.score).slice(0, maxSuggestions);
}
