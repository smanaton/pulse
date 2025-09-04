/**
 * Test Data Factories for Ideas Logic
 *
 * Provides type-safe mock data for testing without using 'as any'
 */
import type { Id } from "@pulse/core/types";
import type { CreateIdeaInput, UpdateIdeaInput, CreateFolderInput, UpdateFolderInput, CreateTagInput, IdeaSearchInput } from "../types";
export declare const mockId: <T extends string>(tableName: T) => Id<T>;
export declare const MOCK_IDS: {
    workspace: Id<"workspaces">;
    user: Id<"users">;
    project: Id<"projects">;
    folder: Id<"folders">;
    tag: Id<"tags">;
    idea: Id<"ideas">;
};
export declare const IdeaFactory: {
    createInput(overrides?: Partial<CreateIdeaInput>): CreateIdeaInput;
    updateInput(overrides?: Partial<UpdateIdeaInput>): UpdateIdeaInput;
    searchInput(overrides?: Partial<IdeaSearchInput>): IdeaSearchInput;
    invalidCreateInput(overrides?: Partial<CreateIdeaInput>): CreateIdeaInput;
    validUpdateInput(overrides?: Partial<UpdateIdeaInput>): UpdateIdeaInput;
    emptyTitleUpdate(): UpdateIdeaInput;
    invalidStatusUpdate(): UpdateIdeaInput;
};
export declare const FolderFactory: {
    createInput(overrides?: Partial<CreateFolderInput>): CreateFolderInput;
    updateInput(overrides?: Partial<UpdateFolderInput>): UpdateFolderInput;
    invalidCreateInput(overrides?: Partial<CreateFolderInput>): CreateFolderInput;
    longNameInput(): CreateFolderInput;
};
export declare const TagFactory: {
    createInput(overrides?: Partial<CreateTagInput>): CreateTagInput;
    invalidCreateInput(overrides?: Partial<CreateTagInput>): CreateTagInput;
};
export declare const ContentFactory: {
    markdown: {
        simple: string;
        withImages: string;
        withCodeBlocks: string;
        complex: string;
    };
    contentBlocks: {
        valid: {
            type: string;
            content: {
                type: string;
                text: string;
            }[];
        }[];
        circular: {
            self?: unknown;
        };
    };
    searchQueries: {
        simple: string;
        withSpecialChars: string;
        long: string;
        keywords: string;
    };
};
export declare const ValidationTestData: {
    validIdeaInput: CreateIdeaInput;
    invalidIdeaInputs: {
        emptyTitle: CreateIdeaInput;
        longTitle: CreateIdeaInput;
        longContent: CreateIdeaInput;
        circularBlocks: CreateIdeaInput;
        missingWorkspace: CreateIdeaInput;
    };
    validIdeaUpdate: UpdateIdeaInput;
    invalidIdeaUpdates: {
        emptyTitle: UpdateIdeaInput;
        invalidStatus: UpdateIdeaInput;
    };
    validFolderInput: CreateFolderInput;
    invalidFolderInputs: {
        emptyName: CreateFolderInput;
        longName: CreateFolderInput;
        missingWorkspace: CreateFolderInput;
    };
    validTagInput: CreateTagInput;
    invalidTagInputs: {
        emptyName: CreateTagInput;
        missingWorkspace: CreateTagInput;
    };
};
export declare const resetIdCounter: () => void;
//# sourceMappingURL=factories.d.ts.map