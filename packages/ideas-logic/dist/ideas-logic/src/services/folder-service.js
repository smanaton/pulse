/**
 * Folder Service
 *
 * Business logic for folder management and hierarchy operations.
 */
import { calculateFolderSortKey, transformCreateFolderInput, transformUpdateFolderInput, } from "../transformers";
import { validateCreateFolderInput, validateUpdateFolderInput, } from "../validators";
export async function processFolderCreation(input, existingFolderNames) {
    // Validate input
    const validation = validateCreateFolderInput(input);
    if (!validation.valid) {
        return {
            success: false,
            validation,
            errors: validation.errors.map((e) => e.message),
        };
    }
    // Check for name conflicts within the same parent
    if (existingFolderNames?.includes(input.name.trim())) {
        return {
            success: false,
            errors: ["A folder with this name already exists in this location"],
        };
    }
    // Transform input to database format
    const processedData = transformCreateFolderInput(input);
    return {
        success: true,
        data: processedData,
    };
}
export async function processFolderUpdate(input, existingFolder, existingFolderNames) {
    // Validate input
    const validation = validateUpdateFolderInput(input);
    if (!validation.valid) {
        return {
            success: false,
            validation,
            errors: validation.errors.map((e) => e.message),
        };
    }
    // Check for name conflicts if name is being changed
    if (input.name !== undefined &&
        input.name.trim() !== existingFolder.name &&
        existingFolderNames &&
        existingFolderNames.includes(input.name.trim())) {
        return {
            success: false,
            errors: ["A folder with this name already exists in this location"],
        };
    }
    // Transform input to database format
    const processedData = transformUpdateFolderInput(input, existingFolder);
    return {
        success: true,
        data: processedData,
    };
}
export function processFolderMove(folderId, targetParentId, folderHierarchy) {
    // Check for circular dependency
    if (targetParentId &&
        wouldCreateCircularDependency(folderId, targetParentId, folderHierarchy)) {
        return {
            success: false,
            errors: ["Cannot move folder: would create circular dependency"],
        };
    }
    // Calculate new sort key
    const sortKey = calculateFolderSortKey(targetParentId);
    return {
        success: true,
        data: {
            parentId: targetParentId,
            sortKey,
            updatedAt: Date.now(),
        },
    };
}
function wouldCreateCircularDependency(folderId, targetParentId, hierarchy) {
    let currentParent = targetParentId;
    const visited = new Set();
    while (currentParent) {
        if (currentParent === folderId) {
            return true; // Circular dependency detected
        }
        if (visited.has(currentParent)) {
            return true; // Loop detected in existing hierarchy
        }
        visited.add(currentParent);
        currentParent = hierarchy.get(currentParent);
    }
    return false;
}
// ============================================================================
// Folder Hierarchy Builder
// ============================================================================
export function buildFolderHierarchy(folders, ideaCounts) {
    // Create a map for quick lookup
    const _folderMap = new Map(folders.map((f) => [f._id, f]));
    const children = new Map();
    // Group folders by parent
    for (const folder of folders) {
        const parentId = folder.parentId;
        if (!children.has(parentId)) {
            children.set(parentId, []);
        }
        children.get(parentId)?.push(folder);
    }
    // Build hierarchy recursively
    function buildSubtree(parentId) {
        const subfolders = children.get(parentId) || [];
        // Sort by sortKey
        subfolders.sort((a, b) => a.sortKey - b.sortKey);
        return subfolders.map((folder) => ({
            folder: {
                _id: folder._id,
                name: folder.name,
                parentId: folder.parentId,
            },
            children: buildSubtree(folder._id),
            ideaCount: ideaCounts?.get(folder._id) || 0,
        }));
    }
    return buildSubtree(undefined); // Start with root folders
}
export function buildFolderPath(folderId, folders) {
    const path = [];
    let currentId = folderId;
    // Build path from child to root
    while (currentId) {
        const folder = folders.get(currentId);
        if (!folder)
            break;
        path.unshift({ _id: currentId, name: folder.name });
        currentId = folder.parentId;
    }
    return {
        folders: path,
        fullPath: path.map((f) => f.name).join(" / "),
    };
}
export function processFolderDeletion(folderId, folderHierarchy, ideasInFolders) {
    // Find all descendant folders
    const affectedFolders = [folderId];
    const toProcess = [folderId];
    while (toProcess.length > 0) {
        const currentFolder = toProcess.shift();
        if (!currentFolder)
            break;
        // Find children of current folder
        for (const [childId, parentId] of folderHierarchy.entries()) {
            if (parentId === currentFolder && !affectedFolders.includes(childId)) {
                affectedFolders.push(childId);
                toProcess.push(childId);
            }
        }
    }
    // Find all affected ideas
    const affectedIdeas = [];
    for (const folder of affectedFolders) {
        const ideas = ideasInFolders.get(folder) || [];
        affectedIdeas.push(...ideas);
    }
    return {
        success: true,
        affectedFolders,
        affectedIdeas,
    };
}
export async function processBatchFolderCreation(inputs) {
    const processed = [];
    const errors = [];
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (!input)
            continue;
        const result = await processFolderCreation(input);
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
export function calculateFolderStats(folders, ideaCounts) {
    const totalFolders = folders.length;
    const totalIdeas = Array.from(ideaCounts.values()).reduce((sum, count) => sum + count, 0);
    // Calculate max depth
    const folderMap = new Map(folders.map((f) => [f._id, f]));
    let maxDepth = 0;
    for (const folder of folders) {
        let depth = 1;
        let currentParent = folder.parentId;
        while (currentParent) {
            depth++;
            const parent = folderMap.get(currentParent);
            currentParent = parent?.parentId;
        }
        maxDepth = Math.max(maxDepth, depth);
    }
    const averageIdeasPerFolder = totalFolders > 0 ? totalIdeas / totalFolders : 0;
    return {
        totalFolders,
        totalIdeas,
        maxDepth,
        averageIdeasPerFolder: Math.round(averageIdeasPerFolder * 100) / 100, // Round to 2 decimal places
    };
}
