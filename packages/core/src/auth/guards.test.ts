/**
 * Tests for auth guards
 */

import { describe, expect, it } from "vitest";
import {
	canAccess,
	createMockAuthGuards,
	getRolePermissions,
	hasPermission,
	PERMISSIONS,
	ROLE_HIERARCHY,
	ROLE_PERMISSIONS,
} from "./guards";

describe("Auth Guards", () => {
	describe("Permission System", () => {
		it("should define all required permissions", () => {
			expect(PERMISSIONS.IDEAS_READ).toBe("ideas:read");
			expect(PERMISSIONS.IDEAS_WRITE).toBe("ideas:write");
			expect(PERMISSIONS.WORKSPACE_READ).toBe("workspace:read");
			expect(PERMISSIONS.WORKSPACE_ADMIN).toBe("workspace:admin");
		});

		it("should have correct role hierarchy", () => {
			expect(ROLE_HIERARCHY.owner).toBe(4);
			expect(ROLE_HIERARCHY.admin).toBe(3);
			expect(ROLE_HIERARCHY.editor).toBe(2);
			expect(ROLE_HIERARCHY.viewer).toBe(1);
		});

		it("should map roles to correct permissions", () => {
			const ownerPerms = ROLE_PERMISSIONS.owner;
			const viewerPerms = ROLE_PERMISSIONS.viewer;

			expect(ownerPerms).toContain(PERMISSIONS.IDEAS_READ);
			expect(ownerPerms).toContain(PERMISSIONS.IDEAS_WRITE);
			expect(ownerPerms).toContain(PERMISSIONS.WORKSPACE_ADMIN);

			expect(viewerPerms).toContain(PERMISSIONS.IDEAS_READ);
			expect(viewerPerms).not.toContain(PERMISSIONS.IDEAS_WRITE);
			expect(viewerPerms).not.toContain(PERMISSIONS.WORKSPACE_ADMIN);
		});
	});

	describe("Permission Helpers", () => {
		it("should correctly check if role has permission", () => {
			expect(hasPermission("owner", PERMISSIONS.IDEAS_READ)).toBe(true);
			expect(hasPermission("owner", PERMISSIONS.IDEAS_WRITE)).toBe(true);
			expect(hasPermission("viewer", PERMISSIONS.IDEAS_READ)).toBe(true);
			expect(hasPermission("viewer", PERMISSIONS.IDEAS_WRITE)).toBe(false);
		});

		it("should correctly check role access levels", () => {
			expect(canAccess("owner", "viewer")).toBe(true);
			expect(canAccess("admin", "editor")).toBe(true);
			expect(canAccess("editor", "admin")).toBe(false);
			expect(canAccess("viewer", "owner")).toBe(false);
			expect(canAccess("editor", "editor")).toBe(true);
		});

		it("should return correct permissions for role", () => {
			const editorPerms = getRolePermissions("editor");

			expect(editorPerms).toContain(PERMISSIONS.IDEAS_READ);
			expect(editorPerms).toContain(PERMISSIONS.IDEAS_WRITE);
			expect(editorPerms).toContain(PERMISSIONS.WORKSPACE_READ);
			expect(editorPerms).not.toContain(PERMISSIONS.WORKSPACE_ADMIN);
			expect(editorPerms).not.toContain(PERMISSIONS.IDEAS_DELETE);
		});
	});

	describe("Mock Guards", () => {
		it("should create functional mock guards", async () => {
			const mockGuards = createMockAuthGuards();

			expect(typeof mockGuards.requireUserId).toBe("function");
			expect(typeof mockGuards.assertMembership).toBe("function");
			expect(typeof mockGuards.checkPermission).toBe("function");

			// Test mock implementations
			const userId = await mockGuards.requireUserId({} as any);
			expect(userId).toBe("test-user-id");

			const membership = await mockGuards.assertMembership(
				{} as any,
				"user123" as any,
				"workspace123" as any,
			);
			expect(membership.userId).toBe("user123");
			expect(membership.role).toBe("editor");

			const hasPermission = await mockGuards.checkPermission(
				{} as any,
				"user123" as any,
				"workspace123" as any,
				"test:permission",
			);
			expect(hasPermission).toBe(true);
		});
	});

	describe("Role Validation", () => {
		it("should validate all roles exist in hierarchy", () => {
			const roles: Array<keyof typeof ROLE_HIERARCHY> = [
				"owner",
				"admin",
				"editor",
				"viewer",
			];

			for (const role of roles) {
				expect(typeof ROLE_HIERARCHY[role]).toBe("number");
				expect(ROLE_HIERARCHY[role]).toBeGreaterThan(0);
				expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
			}
		});

		it("should maintain proper hierarchy ordering", () => {
			expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.admin);
			expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.editor);
			expect(ROLE_HIERARCHY.editor).toBeGreaterThan(ROLE_HIERARCHY.viewer);
		});

		it("should ensure higher roles have more permissions", () => {
			const viewerPerms = ROLE_PERMISSIONS.viewer.length;
			const editorPerms = ROLE_PERMISSIONS.editor.length;
			const adminPerms = ROLE_PERMISSIONS.admin.length;
			const ownerPerms = ROLE_PERMISSIONS.owner.length;

			expect(editorPerms).toBeGreaterThanOrEqual(viewerPerms);
			expect(adminPerms).toBeGreaterThanOrEqual(editorPerms);
			expect(ownerPerms).toBeGreaterThanOrEqual(adminPerms);
		});
	});
});
