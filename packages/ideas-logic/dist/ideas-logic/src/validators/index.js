/**
 * Ideas Logic Validators
 *
 * Pure validation functions that don't depend on Convex.
 * These complement the Convex validators with business logic validation.
 */
// ============================================================================
// Idea Validators
// ============================================================================
export function validateCreateIdeaInput(input) {
    const errors = [];
    // Title validation
    if (!input.title || input.title.trim().length === 0) {
        errors.push({
            field: "title",
            message: "Title is required",
            code: "TITLE_REQUIRED",
        });
    }
    else if (input.title.trim().length > 200) {
        errors.push({
            field: "title",
            message: "Title must be less than 200 characters",
            code: "TITLE_TOO_LONG",
        });
    }
    // Content validation
    if (!input.contentMD) {
        errors.push({
            field: "contentMD",
            message: "Content is required",
            code: "CONTENT_REQUIRED",
        });
    }
    else if (input.contentMD.length > 50000) {
        errors.push({
            field: "contentMD",
            message: "Content must be less than 50,000 characters",
            code: "CONTENT_TOO_LONG",
        });
    }
    // Block content validation
    if (input.contentBlocks) {
        try {
            JSON.stringify(input.contentBlocks);
        }
        catch {
            errors.push({
                field: "contentBlocks",
                message: "Invalid block content format",
                code: "INVALID_BLOCKS",
            });
        }
    }
    // Required fields
    if (!input.workspaceId) {
        errors.push({
            field: "workspaceId",
            message: "Workspace ID is required",
            code: "WORKSPACE_ID_REQUIRED",
        });
    }
    if (!input.createdBy) {
        errors.push({
            field: "createdBy",
            message: "Creator ID is required",
            code: "CREATOR_ID_REQUIRED",
        });
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
export function validateUpdateIdeaInput(input) {
    const errors = [];
    // Title validation (if provided)
    if (input.title !== undefined) {
        if (input.title.trim().length === 0) {
            errors.push({
                field: "title",
                message: "Title cannot be empty",
                code: "TITLE_EMPTY",
            });
        }
        else if (input.title.trim().length > 200) {
            errors.push({
                field: "title",
                message: "Title must be less than 200 characters",
                code: "TITLE_TOO_LONG",
            });
        }
    }
    // Content validation (if provided)
    if (input.contentMD !== undefined && input.contentMD.length > 50000) {
        errors.push({
            field: "contentMD",
            message: "Content must be less than 50,000 characters",
            code: "CONTENT_TOO_LONG",
        });
    }
    // Block content validation (if provided)
    if (input.contentBlocks) {
        try {
            JSON.stringify(input.contentBlocks);
        }
        catch {
            errors.push({
                field: "contentBlocks",
                message: "Invalid block content format",
                code: "INVALID_BLOCKS",
            });
        }
    }
    // Status validation (if provided)
    if (input.status && !["draft", "active", "archived"].includes(input.status)) {
        errors.push({
            field: "status",
            message: "Invalid status value",
            code: "INVALID_STATUS",
        });
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
// ============================================================================
// Folder Validators
// ============================================================================
export function validateCreateFolderInput(input) {
    const errors = [];
    // Name validation
    if (!input.name || input.name.trim().length === 0) {
        errors.push({
            field: "name",
            message: "Folder name is required",
            code: "NAME_REQUIRED",
        });
    }
    else if (input.name.trim().length > 100) {
        errors.push({
            field: "name",
            message: "Folder name must be less than 100 characters",
            code: "NAME_TOO_LONG",
        });
    }
    // Required fields
    if (!input.workspaceId) {
        errors.push({
            field: "workspaceId",
            message: "Workspace ID is required",
            code: "WORKSPACE_ID_REQUIRED",
        });
    }
    if (!input.createdBy) {
        errors.push({
            field: "createdBy",
            message: "Creator ID is required",
            code: "CREATOR_ID_REQUIRED",
        });
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
export function validateUpdateFolderInput(input) {
    const errors = [];
    // Name validation (if provided)
    if (input.name !== undefined) {
        if (input.name.trim().length === 0) {
            errors.push({
                field: "name",
                message: "Folder name cannot be empty",
                code: "NAME_EMPTY",
            });
        }
        else if (input.name.trim().length > 100) {
            errors.push({
                field: "name",
                message: "Folder name must be less than 100 characters",
                code: "NAME_TOO_LONG",
            });
        }
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
// ============================================================================
// Tag Validators
// ============================================================================
export function validateCreateTagInput(input) {
    const errors = [];
    // Name validation
    if (!input.name || input.name.trim().length === 0) {
        errors.push({
            field: "name",
            message: "Tag name is required",
            code: "NAME_REQUIRED",
        });
    }
    else if (input.name.trim().length > 50) {
        errors.push({
            field: "name",
            message: "Tag name must be less than 50 characters",
            code: "NAME_TOO_LONG",
        });
    }
    // Color validation (if provided)
    if (input.color && !isValidHexColor(input.color)) {
        errors.push({
            field: "color",
            message: "Invalid color format, must be hex color",
            code: "INVALID_COLOR",
        });
    }
    // Required fields
    if (!input.workspaceId) {
        errors.push({
            field: "workspaceId",
            message: "Workspace ID is required",
            code: "WORKSPACE_ID_REQUIRED",
        });
    }
    if (!input.createdBy) {
        errors.push({
            field: "createdBy",
            message: "Creator ID is required",
            code: "CREATOR_ID_REQUIRED",
        });
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
// ============================================================================
// Helper Functions
// ============================================================================
function isValidHexColor(color) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
}
// ============================================================================
// Content Sanitization Validators
// ============================================================================
export function validateContent(content) {
    const errors = [];
    // Check for potentially dangerous content
    if (content.includes("<script")) {
        errors.push({
            field: "content",
            message: "Script tags are not allowed",
            code: "SCRIPT_NOT_ALLOWED",
        });
    }
    if (content.includes("<iframe")) {
        errors.push({
            field: "content",
            message: "Iframe tags are not allowed",
            code: "IFRAME_NOT_ALLOWED",
        });
    }
    if (content.includes("javascript:")) {
        errors.push({
            field: "content",
            message: "JavaScript URLs are not allowed",
            code: "JAVASCRIPT_URL_NOT_ALLOWED",
        });
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
// ============================================================================
// Bulk Validation
// ============================================================================
export function validateBulkCreateIdeas(inputs) {
    return inputs.map(validateCreateIdeaInput);
}
export function validateBulkCreateFolders(inputs) {
    return inputs.map(validateCreateFolderInput);
}
export function validateBulkCreateTags(inputs) {
    return inputs.map(validateCreateTagInput);
}
