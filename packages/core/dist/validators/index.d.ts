/**
 * Core Validators
 *
 * Convex validator definitions extracted from the main schema.
 * These can be reused across different modules.
 */
export declare const usersValidator: {
    email: import("convex/values").VString<string | undefined, "optional">;
    emailVerified: import("convex/values").VFloat64<number | undefined, "optional">;
    emailVerificationTime: import("convex/values").VFloat64<number | undefined, "optional">;
    name: import("convex/values").VString<string | undefined, "optional">;
    image: import("convex/values").VString<string | undefined, "optional">;
    tokenIdentifier: import("convex/values").VString<string | undefined, "optional">;
    createdAt: import("convex/values").VFloat64<number | undefined, "optional">;
    updatedAt: import("convex/values").VFloat64<number | undefined, "optional">;
};
export declare const workspacesValidator: {
    type: import("convex/values").VUnion<"personal" | "shared", [import("convex/values").VLiteral<"personal", "required">, import("convex/values").VLiteral<"shared", "required">], "required", never>;
    isPersonal: import("convex/values").VBoolean<boolean, "required">;
    plan: import("convex/values").VUnion<"free" | "team", [import("convex/values").VLiteral<"free", "required">, import("convex/values").VLiteral<"team", "required">], "required", never>;
    name: import("convex/values").VString<string, "required">;
    slug: import("convex/values").VString<string | undefined, "optional">;
    ownerUserId: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
    disabled: import("convex/values").VBoolean<boolean | undefined, "optional">;
    createdAt: import("convex/values").VFloat64<number, "required">;
    updatedAt: import("convex/values").VFloat64<number, "required">;
};
export declare const workspaceMembersValidator: {
    workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
    userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
    role: import("convex/values").VUnion<"owner" | "admin" | "editor" | "viewer", [import("convex/values").VLiteral<"owner", "required">, import("convex/values").VLiteral<"admin", "required">, import("convex/values").VLiteral<"editor", "required">, import("convex/values").VLiteral<"viewer", "required">], "required", never>;
    invitedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
    invitedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    joinedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    createdAt: import("convex/values").VFloat64<number, "required">;
};
export declare const ideasValidator: {
    workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
    projectId: import("convex/values").VId<import("convex/values").GenericId<"projects"> | undefined, "optional">;
    folderId: import("convex/values").VId<import("convex/values").GenericId<"folders"> | undefined, "optional">;
    title: import("convex/values").VString<string, "required">;
    contentMD: import("convex/values").VString<string, "required">;
    contentBlocks: import("convex/values").VAny<any, "optional", string>;
    status: import("convex/values").VUnion<"draft" | "active" | "archived", [import("convex/values").VLiteral<"draft", "required">, import("convex/values").VLiteral<"active", "required">, import("convex/values").VLiteral<"archived", "required">], "required", never>;
    copiedFromId: import("convex/values").VId<import("convex/values").GenericId<"ideas"> | undefined, "optional">;
    createdBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
    deletedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    createdAt: import("convex/values").VFloat64<number, "required">;
    updatedAt: import("convex/values").VFloat64<number, "required">;
};
export declare const foldersValidator: {
    workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
    parentId: import("convex/values").VId<import("convex/values").GenericId<"folders"> | undefined, "optional">;
    name: import("convex/values").VString<string, "required">;
    sortKey: import("convex/values").VFloat64<number, "required">;
    createdBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
    deletedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    createdAt: import("convex/values").VFloat64<number, "required">;
    updatedAt: import("convex/values").VFloat64<number, "required">;
};
export declare const tagsValidator: {
    workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
    name: import("convex/values").VString<string, "required">;
    color: import("convex/values").VString<string | undefined, "optional">;
    createdBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
    createdAt: import("convex/values").VFloat64<number, "required">;
    updatedAt: import("convex/values").VFloat64<number, "required">;
};
export declare const ideaTagsValidator: {
    ideaId: import("convex/values").VId<import("convex/values").GenericId<"ideas">, "required">;
    tagId: import("convex/values").VId<import("convex/values").GenericId<"tags">, "required">;
    createdAt: import("convex/values").VFloat64<number, "required">;
};
export declare const paginationArgs: {
    limit: import("convex/values").VFloat64<number | undefined, "optional">;
    offset: import("convex/values").VFloat64<number | undefined, "optional">;
    cursor: import("convex/values").VString<string | undefined, "optional">;
};
export declare const workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
export declare const ideaId: import("convex/values").VId<import("convex/values").GenericId<"ideas">, "required">;
export declare const folderId: import("convex/values").VId<import("convex/values").GenericId<"folders">, "required">;
export declare const tagId: import("convex/values").VId<import("convex/values").GenericId<"tags">, "required">;
export declare const userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
export declare const ideaCreateArgs: {
    workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
    projectId: import("convex/values").VId<import("convex/values").GenericId<"projects"> | undefined, "optional">;
    folderId: import("convex/values").VId<import("convex/values").GenericId<"folders"> | undefined, "optional">;
    title: import("convex/values").VString<string, "required">;
    contentMD: import("convex/values").VString<string, "required">;
    contentBlocks: import("convex/values").VAny<any, "optional", string>;
};
export declare const ideaUpdateArgs: {
    id: import("convex/values").VId<import("convex/values").GenericId<"ideas">, "required">;
    title: import("convex/values").VString<string | undefined, "optional">;
    contentMD: import("convex/values").VString<string | undefined, "optional">;
    contentBlocks: import("convex/values").VAny<any, "optional", string>;
    status: import("convex/values").VUnion<"draft" | "active" | "archived" | undefined, [import("convex/values").VLiteral<"draft", "required">, import("convex/values").VLiteral<"active", "required">, import("convex/values").VLiteral<"archived", "required">], "optional", never>;
    projectId: import("convex/values").VId<import("convex/values").GenericId<"projects"> | undefined, "optional">;
    folderId: import("convex/values").VId<import("convex/values").GenericId<"folders"> | undefined, "optional">;
};
export declare const ideaListArgs: {
    limit: import("convex/values").VFloat64<number | undefined, "optional">;
    offset: import("convex/values").VFloat64<number | undefined, "optional">;
    cursor: import("convex/values").VString<string | undefined, "optional">;
    workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
    folderId: import("convex/values").VId<import("convex/values").GenericId<"folders"> | undefined, "optional">;
    projectId: import("convex/values").VId<import("convex/values").GenericId<"projects"> | undefined, "optional">;
    status: import("convex/values").VUnion<"draft" | "active" | "archived" | undefined, [import("convex/values").VLiteral<"draft", "required">, import("convex/values").VLiteral<"active", "required">, import("convex/values").VLiteral<"archived", "required">], "optional", never>;
};
export declare const ideaSearchArgs: {
    limit: import("convex/values").VFloat64<number | undefined, "optional">;
    offset: import("convex/values").VFloat64<number | undefined, "optional">;
    cursor: import("convex/values").VString<string | undefined, "optional">;
    workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
    query: import("convex/values").VString<string, "required">;
};
export declare const ideaDeleteArgs: {
    id: import("convex/values").VId<import("convex/values").GenericId<"ideas">, "required">;
};
export declare const ideaGetTagsArgs: {
    ideaId: import("convex/values").VId<import("convex/values").GenericId<"ideas">, "required">;
};
export declare const tagIdeaArgs: {
    ideaId: import("convex/values").VId<import("convex/values").GenericId<"ideas">, "required">;
    tagId: import("convex/values").VId<import("convex/values").GenericId<"tags">, "required">;
};
export declare const tagIdeaRemoveArgs: {
    ideaId: import("convex/values").VId<import("convex/values").GenericId<"ideas">, "required">;
    tagId: import("convex/values").VId<import("convex/values").GenericId<"tags">, "required">;
};
export declare const folderCreateArgs: {
    workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
    parentId: import("convex/values").VId<import("convex/values").GenericId<"folders"> | undefined, "optional">;
    name: import("convex/values").VString<string, "required">;
};
export declare const folderUpdateArgs: {
    id: import("convex/values").VId<import("convex/values").GenericId<"folders">, "required">;
    name: import("convex/values").VString<string | undefined, "optional">;
    parentId: import("convex/values").VId<import("convex/values").GenericId<"folders"> | undefined, "optional">;
};
export declare const folderListArgs: {
    workspaceId: import("convex/values").VId<import("convex/values").GenericId<"workspaces">, "required">;
    parentId: import("convex/values").VId<import("convex/values").GenericId<"folders"> | undefined, "optional">;
};
export declare const folderDeleteArgs: {
    id: import("convex/values").VId<import("convex/values").GenericId<"folders">, "required">;
};
//# sourceMappingURL=index.d.ts.map