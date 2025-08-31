/**
 * Idea Service
 *
 * Core business logic for idea management.
 */
import { extractKeywordsFromContent, transformCreateIdeaInput, transformUpdateIdeaInput, } from "../transformers";
import { validateContent, validateCreateIdeaInput, validateUpdateIdeaInput, } from "../validators";
export async function processIdeaCreation(input) {
    // Validate input
    const validation = validateCreateIdeaInput(input);
    if (!validation.valid) {
        return {
            success: false,
            validation,
            errors: validation.errors.map((e) => e.message),
        };
    }
    // Additional content validation - only if content exists
    if (input.contentMD && input.contentMD.trim()) {
        const contentValidation = validateContent(input.contentMD);
        if (!contentValidation.valid) {
            return {
                success: false,
                validation: contentValidation,
                errors: contentValidation.errors.map((e) => e.message),
            };
        }
    }
    // Transform input to database format
    const processedData = transformCreateIdeaInput(input);
    return {
        success: true,
        data: processedData,
    };
}
export async function processIdeaUpdate(input, existingIdea) {
    // Validate input
    const validation = validateUpdateIdeaInput(input);
    if (!validation.valid) {
        return {
            success: false,
            validation,
            errors: validation.errors.map((e) => e.message),
        };
    }
    // Validate content if being updated and not empty
    if (input.contentMD !== undefined && input.contentMD.trim()) {
        const contentValidation = validateContent(input.contentMD);
        if (!contentValidation.valid) {
            return {
                success: false,
                validation: contentValidation,
                errors: contentValidation.errors.map((e) => e.message),
            };
        }
    }
    // Transform input to database format
    const processedData = transformUpdateIdeaInput(input, existingIdea);
    return {
        success: true,
        data: processedData,
    };
}
export function enhanceIdeaMetadata(title, contentMD) {
    // Extract keywords
    const keywords = extractKeywordsFromContent(`${title} ${contentMD}`);
    // Generate suggested tags from keywords
    const suggestedTags = keywords
        .slice(0, 5) // Top 5 keywords as tag suggestions
        .map((keyword) => keyword.charAt(0).toUpperCase() + keyword.slice(1));
    // Calculate reading time (approximate)
    const wordCount = countWords(contentMD);
    const readingTime = Math.max(1, Math.round(wordCount / 200)); // ~200 words per minute
    // Generate simple summary (first paragraph or first 150 chars)
    const summary = generateSimpleSummary(contentMD);
    return {
        keywords,
        suggestedTags,
        readingTime,
        wordCount,
        summary,
    };
}
function countWords(text) {
    return text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
}
function generateSimpleSummary(contentMD) {
    // Get first paragraph or first 150 characters
    const firstParagraph = contentMD.split("\n\n")[0];
    if (firstParagraph && firstParagraph.length <= 150) {
        return firstParagraph.trim();
    }
    return (contentMD.substring(0, 150).trim() + (contentMD.length > 150 ? "..." : ""));
}
export function processStatusChange(_currentStatus, newStatus, ideaData) {
    // Validation rules for status changes
    switch (newStatus) {
        case "active":
            // To activate, idea must have meaningful content
            if (!ideaData.title.trim() || ideaData.title.trim().length < 3) {
                return {
                    success: false,
                    errors: [
                        "Idea must have a title with at least 3 characters to activate",
                    ],
                };
            }
            if (!ideaData.contentMD.trim() || ideaData.contentMD.trim().length < 10) {
                return {
                    success: false,
                    errors: ["Idea must have meaningful content to activate"],
                };
            }
            break;
        case "archived":
            // Can always archive
            break;
        case "draft":
            // Can always revert to draft
            break;
    }
    return {
        success: true,
        newStatus,
    };
}
export function processDuplicateIdea(originalIdea, createdBy, options) {
    const now = Date.now();
    // Generate new title if not provided
    const newTitle = options?.newTitle || `Copy of ${originalIdea.title}`;
    const duplicatedIdea = {
        workspaceId: originalIdea.workspaceId,
        projectId: options?.newProjectId || originalIdea.projectId,
        folderId: options?.newFolderId || originalIdea.folderId,
        title: newTitle,
        contentMD: originalIdea.contentMD,
        contentBlocks: originalIdea.contentBlocks
            ? JSON.parse(JSON.stringify(originalIdea.contentBlocks))
            : // Deep clone
                undefined,
        status: "draft", // Always start as draft
        createdBy,
        createdAt: now,
        updatedAt: now,
    };
    return {
        success: true,
        data: duplicatedIdea,
    };
}
export async function processBatchIdeaCreation(inputs) {
    const processed = [];
    const errors = [];
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (!input)
            continue;
        const result = await processIdeaCreation(input);
        if (result.success && result.data) {
            processed.push(result.data);
        }
        else {
            errors.push({
                index: i,
                errors: result.errors || ["Unknown error"],
            });
        }
    }
    return {
        success: errors.length === 0,
        processed,
        errors,
    };
}
