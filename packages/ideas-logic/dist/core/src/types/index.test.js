/**
 * Tests for core types
 */
import { describe, expect, it } from "vitest";
describe("Core Types", () => {
    it("should have correct User interface structure", () => {
        const user = {
            _id: "user123",
            _creationTime: 1234567890000,
            email: "test@example.com",
            name: "Test User",
            createdAt: 1234567890000,
            updatedAt: 1234567890000,
        };
        expect(user._id).toBe("user123");
        expect(user.email).toBe("test@example.com");
        expect(user.name).toBe("Test User");
        expect(typeof user.createdAt).toBe("number");
    });
    it("should have correct Workspace interface structure", () => {
        const workspace = {
            _id: "workspace123",
            _creationTime: 1234567890000,
            type: "shared",
            isPersonal: false,
            plan: "team",
            name: "Test Workspace",
            slug: "test-workspace",
            createdAt: 1234567890000,
            updatedAt: 1234567890000,
        };
        expect(workspace.type).toBe("shared");
        expect(workspace.plan).toBe("team");
        expect(workspace.isPersonal).toBe(false);
        expect(workspace.slug).toBe("test-workspace");
    });
    it("should have correct WorkspaceMember interface structure", () => {
        const member = {
            _id: "member123",
            _creationTime: 1234567890000,
            workspaceId: "workspace123",
            userId: "user123",
            role: "editor",
            createdAt: 1234567890000,
            updatedAt: 1234567890000,
        };
        expect(member.role).toBe("editor");
        expect(member.workspaceId).toBe("workspace123");
        expect(member.userId).toBe("user123");
    });
    it("should have correct Idea interface structure", () => {
        const idea = {
            _id: "idea123",
            _creationTime: 1234567890000,
            workspaceId: "workspace123",
            title: "Test Idea",
            contentMD: "# Test Content",
            status: "active",
            createdBy: "user123",
            createdAt: 1234567890000,
            updatedAt: 1234567890000,
        };
        expect(idea.title).toBe("Test Idea");
        expect(idea.status).toBe("active");
        expect(idea.contentMD).toBe("# Test Content");
    });
    it("should have correct ModuleDefinition interface structure", () => {
        const module = {
            name: "test-module",
            version: "1.0.0",
            dependencies: ["@pulse/core"],
            schema: {},
            functions: {},
            permissions: {
                read: ["test:read"],
                write: ["test:write"],
                admin: ["test:admin"],
            },
        };
        expect(module.name).toBe("test-module");
        expect(module.version).toBe("1.0.0");
        expect(module.dependencies).toContain("@pulse/core");
        expect(Array.isArray(module.permissions?.read)).toBe(true);
    });
    it("should support optional fields correctly", () => {
        const workspace = {
            _id: "workspace123",
            _creationTime: 1234567890000,
            type: "personal",
            isPersonal: true,
            plan: "free",
            name: "Personal Workspace",
            // slug is optional for personal workspaces
            createdAt: 1234567890000,
            updatedAt: 1234567890000,
        };
        expect(workspace.slug).toBeUndefined();
        expect(workspace.type).toBe("personal");
        expect(workspace.isPersonal).toBe(true);
    });
});
