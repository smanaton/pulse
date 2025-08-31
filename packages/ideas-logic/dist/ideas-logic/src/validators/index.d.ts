/**
 * Ideas Logic Validators
 *
 * Pure validation functions that don't depend on Convex.
 * These complement the Convex validators with business logic validation.
 */
import type { CreateFolderInput, CreateIdeaInput, CreateTagInput, UpdateFolderInput, UpdateIdeaInput, ValidationResult } from "../types";
export declare function validateCreateIdeaInput(input: CreateIdeaInput): ValidationResult;
export declare function validateUpdateIdeaInput(input: UpdateIdeaInput): ValidationResult;
export declare function validateCreateFolderInput(input: CreateFolderInput): ValidationResult;
export declare function validateUpdateFolderInput(input: UpdateFolderInput): ValidationResult;
export declare function validateCreateTagInput(input: CreateTagInput): ValidationResult;
export declare function validateContent(content: string): ValidationResult;
export declare function validateBulkCreateIdeas(inputs: CreateIdeaInput[]): ValidationResult[];
export declare function validateBulkCreateFolders(inputs: CreateFolderInput[]): ValidationResult[];
export declare function validateBulkCreateTags(inputs: CreateTagInput[]): ValidationResult[];
//# sourceMappingURL=index.d.ts.map