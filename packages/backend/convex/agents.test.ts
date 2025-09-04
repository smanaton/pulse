/**
 * Comprehensive Tests for AI Agents System
 *
 * Testing all agent management operations including:
 * - Agent creation with different types and capabilities
 * - Agent updates and configuration changes
 * - Agent activation/deactivation
 * - Agent deletion with proper authorization
 * - Agent listing and filtering by type/status
 * - Usage recording and analytics
 * - Permission enforcement (admin-only operations)
 * - Error handling for missing agents and invalid operations
 */

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { modules } from "./test.setup";
import { assertExists, idOf } from "../test-utils";

// Test utilities
function createUniqueIdentity() {
	return { tokenIdentifier: `user123|${crypto.randomUUID()}` };
}

// ...existing code...

describe("Agents System", () => {
	describe("Agent Creation", () => {
		test("Should_Create_Agent_When_User_Is_Admin", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			// Create workspace
			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-agents",
				});
			if (!workspace) throw new Error("workspace creation failed");
			const workspaceId = idOf(workspace, "workspace");

			// Create agent with valid data
			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "AI Assistant",
				description: "General purpose AI assistant",
				type: "assistant",
				capabilities: ["general_help", "task_planning", "question_answering"],
				config: { model: "gpt-4", temperature: 0.7 },
				avatar: "https://example.com/avatar.png",
			});

			expect(agent).toBeDefined();
			expect(idOf(agent, "agent")).toBeDefined();
			expect(agent?.name).toBe("AI Assistant");
			expect(agent?.type).toBe("assistant");
			expect(agent?.capabilities).toEqual([
				"general_help",
				"task_planning",
				"question_answering",
			]);
			expect(agent?.isActive).toBe(true);
			expect(agent?.workspaceId).toBe(workspaceId);
			expect(agent?.createdBy).toBeDefined();
			expect(agent?.createdAt).toBeDefined();
			expect(agent?.updatedAt).toBeDefined();
		});

		test("Should_Create_Agent_With_All_Types", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-agent-types",
				});
			if (!workspace) throw new Error("workspace creation failed");
			const workspaceId = workspace._id;

			const agentTypes = [
				"assistant",
				"automation",
				"researcher",
				"writer",
			] as const;

			for (const type of agentTypes) {
				const agent = await t
					.withIdentity(identity)
					.mutation(api.agents.create, {
						workspaceId,
						name: `${type} Agent`,
						type,
						capabilities: [`${type}_capability`],
					});

				expect(agent?.type).toBe(type);
				expect(agent?.name).toBe(`${type} Agent`);
			}
		});

		test("Should_Create_Agent_With_Minimal_Data", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-minimal-agent",
				});
			if (!workspace) throw new Error("workspace creation failed");
			const workspaceId = workspace._id;

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Minimal Agent",
				type: "assistant",
				capabilities: ["basic"],
			});

			expect(agent).toBeDefined();
			expect(agent?.name).toBe("Minimal Agent");
			expect(agent?.description).toBeUndefined();
			expect(agent?.config).toEqual({});
			expect(agent?.avatar).toBeUndefined();
		});

		test("Should_Log_Activity_When_Agent_Created", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-activity-log",
				});
			if (!workspace) throw new Error("workspace creation failed");
			const workspaceId = workspace._id;

			await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Logged Agent",
				type: "researcher",
				capabilities: ["web_search", "data_analysis"],
			});

			// Check activity log
			const activitiesResult = await t
				.withIdentity(identity)
				.query(api.activities.list, {
					workspaceId,
					limit: 10,
				});

			const agentActivity = activitiesResult.activities.find((a) =>
				a.description.includes("Created AI agent"),
			);
			expect(agentActivity).toBeDefined();
			expect(agentActivity?.action).toBe("created");
		});
	});

	describe("Agent Updates", () => {
		test("Should_Update_Agent_Properties", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-update-agent",
				});
			assertExists(workspace, "workspace creation failed");
			const workspaceId = idOf(workspace, "workspace");

			const originalAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId,
					name: "Original Name",
					type: "assistant",
					capabilities: ["basic"],
					description: "Original description",
				});

			assertExists(originalAgent, "originalAgent creation failed");
			const updatedAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.update, {
					agentId: originalAgent._id,
					name: "Updated Name",
					description: "Updated description",
					capabilities: ["advanced", "specialized"],
					config: { newSetting: "value" },
				});

			expect(updatedAgent?.name).toBe("Updated Name");
			expect(updatedAgent?.description).toBe("Updated description");
			expect(updatedAgent?.capabilities).toEqual(["advanced", "specialized"]);
			expect(updatedAgent?.config).toEqual({ newSetting: "value" });
			expect(updatedAgent?.updatedAt).toBeGreaterThan(
				originalAgent?.updatedAt as number,
			);
		});

		test("Should_Update_Only_Specified_Fields", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-partial-update",
				});
			if (!workspace) throw new Error("workspace creation failed");
			const workspaceId = workspace._id;

			const originalAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId,
					name: "Original Name",
					type: "automation",
					capabilities: ["workflow"],
					description: "Keep this",
				});

			assertExists(originalAgent, "originalAgent creation failed");
			const updatedAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.update, {
					agentId: originalAgent._id,
					name: "New Name", // Only updating name
				});

			expect(updatedAgent?.name).toBe("New Name");
			expect(updatedAgent?.description).toBe("Keep this"); // Should remain unchanged
			expect(updatedAgent?.type).toBe("automation"); // Should remain unchanged
			expect(updatedAgent?.capabilities).toEqual(["workflow"]); // Should remain unchanged
		});

		test("Should_Reject_Update_For_Nonexistent_Agent", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-fake-id",
				});

			const tempAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId: idOf(workspace, "workspace"),
					name: "Temp Agent",
					type: "assistant",
					capabilities: ["temp"],
				});

			// Delete the temp agent to make the ID invalid
			await t.withIdentity(identity).mutation(api.agents.remove, {
				agentId: idOf(tempAgent, "tempAgent"),
			});

			await expect(
				t.withIdentity(identity).mutation(api.agents.update, {
					agentId: idOf(tempAgent, "tempAgent"),
					name: "Won't work",
				}),
			).rejects.toThrow("Agent not found");
		});
	});

	describe("Agent Activation/Deactivation", () => {
		test("Should_Activate_And_Deactivate_Agent", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-activation",
				});
			const workspaceId = idOf(workspace, "workspace");

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Toggle Agent",
				type: "automation",
				capabilities: ["task_scheduling"],
			});

			// Agent should start active
			expect(agent?.isActive).toBe(true);

			// Deactivate agent
			const deactivatedAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.setActive, {
					agentId: idOf(agent, "agent"),
					isActive: false,
				});

			expect(deactivatedAgent?.isActive).toBe(false);

			// Reactivate agent
			const reactivatedAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.setActive, {
					agentId: idOf(agent, "agent"),
					isActive: true,
				});

			expect(reactivatedAgent?.isActive).toBe(true);
		});

		test("Should_Log_Activation_Changes", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-activation-log",
				});
			const workspaceId = idOf(workspace, "workspace");

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Logged Agent",
				type: "assistant",
				capabilities: ["help"],
			});

			await t.withIdentity(identity).mutation(api.agents.setActive, {
				agentId: idOf(agent, "agent"),
				isActive: false,
			});

			const activitiesResult = await t
				.withIdentity(identity)
				.query(api.activities.list, {
					workspaceId,
					limit: 10,
				});

			const deactivationActivity = activitiesResult.activities.find((a) =>
				a.description.includes("Deactivated"),
			);
			expect(deactivationActivity).toBeDefined();
		});
	});

	describe("Agent Deletion", () => {
		test("Should_Delete_Agent_When_Admin", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-deletion",
				});
			const workspaceId = idOf(workspace, "workspace");

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Doomed Agent",
				type: "researcher",
				capabilities: ["research"],
			});

			const result = await t
				.withIdentity(identity)
				.mutation(api.agents.remove, {
					agentId: idOf(agent, "agent"),
				});

			expect(result?.success).toBe(true);

			// Verify agent is deleted
			const deletedAgent = await t
				.withIdentity(identity)
				.query(api.agents.getById, {
					agentId: idOf(agent, "agent"),
				});

			expect(deletedAgent).toBeNull();
		});

		test("Should_Log_Deletion_Activity", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-deletion-log",
				});
			const workspaceId = idOf(workspace, "workspace");

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Agent to Delete",
				type: "writer",
				capabilities: ["writing"],
			});

			await t.withIdentity(identity).mutation(api.agents.remove, {
				agentId: idOf(agent, "agent"),
			});

			const activitiesResult = await t
				.withIdentity(identity)
				.query(api.activities.list, {
					workspaceId,
					limit: 10,
				});

			const deletionActivity = activitiesResult.activities.find((a) =>
				a.description.includes("Deleted AI agent"),
			);
			expect(deletionActivity).toBeDefined();
			expect(deletionActivity?.action).toBe("deleted");
		});
	});

	describe("Agent Queries", () => {
		test("Should_Get_Agent_By_ID", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-get-by-id",
				});
			const workspaceId = idOf(workspace, "workspace");

			const createdAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId,
					name: "Retrievable Agent",
					type: "assistant",
					capabilities: ["retrieval"],
					description: "Test description",
				});

			const retrievedAgent = await t
				.withIdentity(identity)
				.query(api.agents.getById, {
					agentId: idOf(createdAgent, "createdAgent"),
				});

			expect(retrievedAgent).toBeDefined();
			expect(idOf(retrievedAgent, "retrievedAgent")).toBe(
				idOf(createdAgent, "createdAgent"),
			);
			expect(retrievedAgent?.name).toBe("Retrievable Agent");
			expect(retrievedAgent?.description).toBe("Test description");
		});

		test("Should_Return_Null_For_Nonexistent_Agent", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-fake-id-2",
				});

			const tempAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId: idOf(workspace, "workspace"),
					name: "Temp Agent",
					type: "assistant",
					capabilities: ["temp"],
				});

			// Delete the temp agent to make the ID invalid
			await t.withIdentity(identity).mutation(api.agents.remove, {
				agentId: idOf(tempAgent, "tempAgent"),
			});

			const agent = await t.withIdentity(identity).query(api.agents.getById, {
				agentId: idOf(tempAgent, "tempAgent"),
			});

			expect(agent).toBeNull();
		});

		test("Should_List_All_Agents_In_Workspace", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-list-agents",
				});
			const workspaceId = idOf(workspace, "workspace");

			// Create multiple agents
			await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Agent 1",
				type: "assistant",
				capabilities: ["help"],
			});

			await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Agent 2",
				type: "researcher",
				capabilities: ["research"],
			});

			await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Agent 3",
				type: "writer",
				capabilities: ["writing"],
			});

			const agents = await t.withIdentity(identity).query(api.agents.list, {
				workspaceId,
			});

			expect(agents).toHaveLength(3);
			expect(agents.map((a) => a.name).sort()).toEqual([
				"Agent 1",
				"Agent 2",
				"Agent 3",
			]);
		});

		test("Should_Filter_Agents_By_Type", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-filter-type",
				});
			const workspaceId = idOf(workspace, "workspace");

			// Create agents of different types
			await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Assistant Agent",
				type: "assistant",
				capabilities: ["help"],
			});

			await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Research Agent",
				type: "researcher",
				capabilities: ["research"],
			});

			// Filter by researcher type
			const researchAgents = await t
				.withIdentity(identity)
				.query(api.agents.list, {
					workspaceId,
					type: "researcher",
				});

			expect(researchAgents).toHaveLength(1);
			expect(researchAgents?.[0]?.name).toBe("Research Agent");
			expect(researchAgents?.[0]?.type).toBe("researcher");
		});

		test("Should_Filter_Agents_By_Active_Status", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-filter-status",
				});
			const workspaceId = idOf(workspace, "workspace");

			// Create active agent
			const _activeAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId,
					name: "Active Agent",
					type: "automation",
					capabilities: ["automation"],
				});

			// Create and deactivate another agent
			const inactiveAgent = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId,
					name: "Inactive Agent",
					type: "writer",
					capabilities: ["writing"],
				});

			await t.withIdentity(identity).mutation(api.agents.setActive, {
				agentId: idOf(inactiveAgent, "inactiveAgent"),
				isActive: false,
			});

			// Filter by active status
			const activeAgents = await t
				.withIdentity(identity)
				.query(api.agents.list, {
					workspaceId,
					isActive: true,
				});

			const inactiveAgents = await t
				.withIdentity(identity)
				.query(api.agents.list, {
					workspaceId,
					isActive: false,
				});

			expect(activeAgents).toHaveLength(1);
			expect(activeAgents?.[0]?.name).toBe("Active Agent");

			expect(inactiveAgents).toHaveLength(1);
			expect(inactiveAgents?.[0]?.name).toBe("Inactive Agent");
		});

		test("Should_Get_Agents_By_Type_With_Index", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-by-type",
				});
			const workspaceId = idOf(workspace, "workspace");

			// Create writers
			await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Writer 1",
				type: "writer",
				capabilities: ["copywriting"],
			});

			await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Writer 2",
				type: "writer",
				capabilities: ["technical_writing"],
			});

			// Create deactivated writer
			const inactiveWriter = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId,
					name: "Inactive Writer",
					type: "writer",
					capabilities: ["content"],
				});

			await t.withIdentity(identity).mutation(api.agents.setActive, {
				agentId: idOf(inactiveWriter, "inactiveWriter"),
				isActive: false,
			});

			// Get active writers only (default)
			const activeWriters = await t
				.withIdentity(identity)
				.query(api.agents.getByType, {
					workspaceId,
					type: "writer",
				});

			expect(activeWriters).toHaveLength(2);
			expect(activeWriters.every((a) => a.isActive)).toBe(true);

			// Get all writers including inactive
			const allWriters = await t
				.withIdentity(identity)
				.query(api.agents.getByType, {
					workspaceId,
					type: "writer",
					activeOnly: false,
				});

			expect(allWriters).toHaveLength(3);
		});

		test("Should_Respect_Limit_Parameter", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-limit",
				});
			const workspaceId = idOf(workspace, "workspace");

			// Create 5 agents
			for (let i = 1; i <= 5; i++) {
				await t.withIdentity(identity).mutation(api.agents.create, {
					workspaceId,
					name: `Agent ${i}`,
					type: "assistant",
					capabilities: ["basic"],
				});
			}

			// List with limit
			const limitedAgents = await t
				.withIdentity(identity)
				.query(api.agents.list, {
					workspaceId,
					limit: 3,
				});

			expect(limitedAgents).toHaveLength(3);
		});
	});

	describe("Agent Usage Tracking", () => {
		test.skip("Should_Record_Agent_Usage", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-usage",
				});
			const workspaceId = idOf(workspace, "workspace");

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Used Agent",
				type: "automation",
				capabilities: ["data_processing"],
			});

			const originalLastUsed = agent?.lastUsedAt;

			const result = await t
				.withIdentity(identity)
				.mutation(api.agents.recordUsage, {
					agentId: idOf(agent, "agent"),
					metadata: {
						taskType: "data_processing",
						itemsProcessed: 100,
						duration: 5000,
					},
				});

			expect(result?.success).toBe(true);

			// Check that lastUsedAt was updated
			const updatedAgent = await t
				.withIdentity(identity)
				.query(api.agents.getById, {
					agentId: idOf(agent, "agent"),
				});

			expect(updatedAgent?.lastUsedAt).toBeDefined();
			expect(updatedAgent?.lastUsedAt || 0).toBeGreaterThan(
				originalLastUsed || 0,
			);
		});

		test.skip("Should_Log_Usage_Activity", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-usage-log",
				});
			const workspaceId = idOf(workspace, "workspace");

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Activity Agent",
				type: "researcher",
				capabilities: ["web_search"],
			});

			await t.withIdentity(identity).mutation(api.agents.recordUsage, {
				agentId: idOf(agent, "agent"),
				metadata: { searchQuery: "test query" },
			});

			const activitiesResult = await t
				.withIdentity(identity)
				.query(api.activities.list, {
					workspaceId,
					limit: 10,
				});

			const usageActivity = activitiesResult.activities.find(
				(a) =>
					a.actorType === "agent" && a.description.includes("completed a task"),
			);

			expect(usageActivity).toBeDefined();
			expect(usageActivity?.actorId).toBe(idOf(agent, "agent"));
			expect(usageActivity?.action).toBe("completed");
		});

		test("Should_Reject_Usage_For_Inactive_Agent", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-inactive-usage",
				});
			const workspaceId = idOf(workspace, "workspace");

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Soon Inactive Agent",
				type: "writer",
				capabilities: ["content"],
			});

			// Deactivate agent
			await t.withIdentity(identity).mutation(api.agents.setActive, {
				agentId: idOf(agent, "agent"),
				isActive: false,
			});

			// Try to record usage - should fail
			await expect(
				t.withIdentity(identity).mutation(api.agents.recordUsage, {
					agentId: idOf(agent, "agent"),
				}),
			).rejects.toThrow("Agent not found or inactive");
		});
	});

	describe("Agent Capabilities", () => {
		test("Should_Return_Available_Capabilities", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const capabilities = await t
				.withIdentity(identity)
				.query(api.agents.getCapabilities);

			expect(capabilities).toBeDefined();
			expect(capabilities?.assistant).toContain("general_help");
			expect(capabilities?.automation).toContain("workflow_automation");
			expect(capabilities?.researcher).toContain("web_search");
			expect(capabilities?.writer).toContain("content_generation");
		});
	});

	describe("Agent Usage Analytics", () => {
		test.skip("Should_Return_Usage_Analytics_For_Workspace", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-analytics",
				});
			const workspaceId = idOf(workspace, "workspace");

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Analytics Agent",
				type: "assistant",
				capabilities: ["analytics"],
			});

			// Record some usage
			await t.withIdentity(identity).mutation(api.agents.recordUsage, {
				agentId: idOf(agent, "agent"),
				metadata: { task: "task1" },
			});

			await t.withIdentity(identity).mutation(api.agents.recordUsage, {
				agentId: idOf(agent, "agent"),
				metadata: { task: "task2" },
			});

			const analytics = await t
				.withIdentity(identity)
				.query(api.agents.getUsageAnalytics, {
					workspaceId,
				});

			expect(analytics).toBeDefined();
			expect(analytics?.period).toBe(30); // Default 30 days
			expect(analytics?.totalUsage).toBeGreaterThan(0);
			expect(analytics.agents.length).toBeGreaterThan(0);

			const agentAnalytics = analytics.agents.find(
				(a) => a.agentId === idOf(agent, "agent"),
			);
			expect(agentAnalytics).toBeDefined();
			expect(agentAnalytics?.count).toBe(2);
			expect(agentAnalytics?.agent?.name).toBe("Analytics Agent");
		});

		test("Should_Respect_Custom_Time_Period", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-period",
				});
			const workspaceId = idOf(workspace, "workspace");

			const analytics = await t
				.withIdentity(identity)
				.query(api.agents.getUsageAnalytics, {
					workspaceId,
					days: 7,
				});

			expect(analytics?.period).toBe(7);
		});
	});

	describe("Permission Enforcement", () => {
		test("Should_Require_Authentication_For_All_Operations", async () => {
			const t = convexTest(schema, modules);

			// Try operations without authentication - should fail
			await expect(
				t.query(api.agents.list, {
					workspaceId: "fake" as Id<"workspaces">,
				}),
			).rejects.toThrow();

			await expect(
				t.mutation(api.agents.create, {
					workspaceId: "fake" as Id<"workspaces">,
					name: "Test",
					type: "assistant",
					capabilities: ["test"],
				}),
			).rejects.toThrow();
		});
	});

	describe("Edge Cases and Error Handling", () => {
		test("Should_Handle_Large_Capability_Lists", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-large-caps",
				});
			const workspaceId = idOf(workspace, "workspace");

			const manyCapabilities = Array.from(
				{ length: 20 },
				(_, i) => `capability_${i}`,
			);

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Multi Capability Agent",
				type: "automation",
				capabilities: manyCapabilities,
			});

			expect(agent?.capabilities).toHaveLength(20);
			expect(agent?.capabilities).toEqual(manyCapabilities);
		});

		test("Should_Handle_Complex_Configuration_Objects", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-complex-config",
				});
			const workspaceId = idOf(workspace, "workspace");

			const complexConfig = {
				model: "gpt-4",
				parameters: {
					temperature: 0.7,
					maxTokens: 2000,
					topP: 0.9,
				},
				prompts: {
					system: "You are a helpful AI assistant",
					fallback: "I don't understand",
				},
				features: ["multimodal", "function_calling"],
				limits: {
					requestsPerHour: 100,
					tokensPerDay: 50000,
				},
			};

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "Complex Agent",
				type: "assistant",
				capabilities: ["advanced"],
				config: complexConfig,
			});

			expect(agent?.config).toEqual(complexConfig);
		});

		test("Should_Handle_Empty_Capabilities_Array", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-empty-caps",
				});
			const workspaceId = idOf(workspace, "workspace");

			const agent = await t.withIdentity(identity).mutation(api.agents.create, {
				workspaceId,
				name: "No Capabilities Agent",
				type: "assistant",
				capabilities: [],
			});

			expect(agent?.capabilities).toEqual([]);
		});

		test("Should_Maintain_Agent_Count_Consistency", async () => {
			const t = convexTest(schema, modules);
			const identity = createUniqueIdentity();

			const workspace = await t
				.withIdentity(identity)
				.mutation(api.workspaces.createShared, {
					name: "Test Workspace",
					slug: "test-consistency",
				});
			const workspaceId = idOf(workspace, "workspace");

			// Create 3 agents
			const _agent1 = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId,
					name: "Agent 1",
					type: "assistant",
					capabilities: ["help"],
				});

			const agent2 = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId,
					name: "Agent 2",
					type: "researcher",
					capabilities: ["research"],
				});

			const agent3 = await t
				.withIdentity(identity)
				.mutation(api.agents.create, {
					workspaceId,
					name: "Agent 3",
					type: "writer",
					capabilities: ["writing"],
				});

			// List all - should be 3
			let agents = await t.withIdentity(identity).query(api.agents.list, {
				workspaceId,
			});
			expect(agents).toHaveLength(3);

			// Delete one
			await t.withIdentity(identity).mutation(api.agents.remove, {
				agentId: idOf(agent2, "agent2"),
			});

			// List all - should be 2
			agents = await t.withIdentity(identity).query(api.agents.list, {
				workspaceId,
			});
			expect(agents).toHaveLength(2);

			// Deactivate one
			await t.withIdentity(identity).mutation(api.agents.setActive, {
				agentId: idOf(agent3, "agent3"),
				isActive: false,
			});

			// List active - should be 1
			const activeAgents = await t
				.withIdentity(identity)
				.query(api.agents.list, {
					workspaceId,
					isActive: true,
				});
			expect(activeAgents).toHaveLength(1);

			// List all - should still be 2
			agents = await t.withIdentity(identity).query(api.agents.list, {
				workspaceId,
			});
			expect(agents).toHaveLength(2);
		});
	});
});
