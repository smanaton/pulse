/**
 * Orchestration System Tests
 * Tests job submission, run assignment, state transitions, and command handling
 */

import { convexTest } from "convex-test";
import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("Orchestration System", () => {
  let t: ReturnType<typeof convexTest>;
  let adminUserId: any;
  let workspaceId: any;
  let agentId: any;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    // Setup test workspace and user
    adminUserId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("users", {
        name: "Admin User",
        email: "admin@test.com",
        tokenIdentifier: "test|admin123",
        createdAt: now,
        updatedAt: now,
      });
    });

    workspaceId = await t.run(async (ctx) => {
      const now = Date.now();
      return await ctx.db.insert("workspaces", {
        name: "Test Workspace",
        type: "shared",
        isPersonal: false,
        plan: "free",
        createdAt: now,
        updatedAt: now,
      });
    });

    // Add admin membership
    await t.run(async (ctx) => {
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        userId: adminUserId,
        role: "admin",
        createdAt: Date.now(),
      });
    });

    // Setup test agent
    agentId = "agent_test_123";
    await t.run(async (ctx) => {
      await ctx.db.insert("agents", {
        workspaceId,
        agentId,
        name: "Test Agent",
        type: "external",
        version: "1.0.0",
        capabilities: ["data_analysis", "web_scraping", "file_processing"],
        config: { model: "test", temperature: 0.7 },
        isActive: true,
        health: {
          status: "up",
          maxConcurrency: 3,
          lastHeartbeatAt: Date.now(),
        },
        createdBy: adminUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
  });

  afterEach(async () => {
    // Clean up test data
    await t.run(async (ctx) => {
      const tables = [
        "orchestrationEvents",
        "orchestrationRuns", 
        "orchestrationJobs",
        "agents",
        "workspaceMembers",
        "workspaces",
        "users",
        "events",
        "rateLimits"
      ];
      for (const table of tables) {
        try {
          const docs = await ctx.db.query(table).collect();
          for (const doc of docs) {
            await ctx.db.delete(doc._id);
          }
        } catch {
          // Table might not exist, skip
        }
      }
    });
  });

  describe("Job Management", () => {
    test("Given_AuthorizedUser_When_SubmitsJob_Then_CreatesJobAndLogsEvent", async () => {
      // Act
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "analyze_data",
          inputs: { 
            dataSource: "sales_report.csv",
            analysisType: "trends"
          },
          constraints: {
            deadline: new Date(Date.now() + 3600000).toISOString(),
            maxRetries: 3,
            timeout: 300000
          },
          artifactsDesired: ["summary", "charts", "insights"]
        });

      // Assert
      expect(result).toMatchObject({
        jobId: expect.stringMatching(/^job_/),
        corrId: expect.stringMatching(/^[0-9a-f-]{36}$/), // UUID format
      });

      // Verify job was created
      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryJob, {
          workspaceId,
          jobId: result.jobId,
        });

      expect(job).toMatchObject({
        intent: "analyze_data",
        inputs: {
          dataSource: "sales_report.csv",
          analysisType: "trends"
        },
        constraints: {
          maxRetries: 3,
          timeout: 300000
        },
        createdBy: adminUserId,
      });

      // Verify event was logged
      const events = await t.run(async (ctx) => {
        return await ctx.db
          .query("events")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
          .collect();
      });

      const jobCreatedEvent = events.find(e => e.type === "orchestration_job_created");
      expect(jobCreatedEvent).toBeDefined();
      expect(jobCreatedEvent?.meta).toMatchObject({
        intent: "analyze_data",
        corrId: result.corrId,
      });
    });

    test("Given_JobWithConstraints_When_SubmitsJob_Then_StoresConstraintsCorrectly", async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 86400000); // 24 hours from now

      // Act
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "time_sensitive_task",
          inputs: { priority: "high" },
          constraints: {
            deadline: futureDate.toISOString(),
            maxRetries: 5,
            timeout: 600000, // 10 minutes
          },
        });

      // Assert
      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryJob, {
          workspaceId,
          jobId: result.jobId,
        });

      expect(job.constraints).toMatchObject({
        deadline: futureDate.toISOString(),
        maxRetries: 5,
        timeout: 600000,
      });
    });

    test("Given_RateLimitExceeded_When_SubmitsJob_Then_ThrowsRateLimitError", async () => {
      // Arrange - Simulate rate limit by creating multiple jobs quickly
      const jobPromises = Array.from({ length: 12 }, (_, i) =>
        t.withIdentity({ tokenIdentifier: "test|admin123" })
          .mutation(api["orchestration/core"].submitJob, {
            workspaceId,
            intent: `bulk_job_${i}`,
            inputs: { index: i },
          })
      );

      // Act & Assert - Should reject when rate limit is hit (10 jobs per minute)
      await expect(Promise.all(jobPromises))
        .rejects.toThrow("Rate limit exceeded for orchestration jobs");
    });

    test("Given_UnauthorizedUser_When_SubmitsJob_Then_ThrowsPermissionError", async () => {
      // Arrange - Create non-member user
      const nonMemberUserId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          name: "Non Member",
          email: "nonmember@test.com", 
          tokenIdentifier: "test|nonmember123",
          createdAt: now,
          updatedAt: now,
        });
      });

      // Act & Assert
      await expect(
        t.withIdentity({ tokenIdentifier: "test|nonmember123" })
          .mutation(api["orchestration/core"].submitJob, {
            workspaceId,
            intent: "unauthorized_job",
            inputs: {},
          })
      ).rejects.toThrow();
    });

    test("Given_Workspace_When_ListsJobs_Then_ReturnsJobsInDescendingOrder", async () => {
      // Arrange - Create multiple jobs with slight delays
      const job1 = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "first_job",
          inputs: { order: 1 },
        });

      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

      const job2 = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "second_job",
          inputs: { order: 2 },
        });

      // Act
      const jobs = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].listJobs, {
          workspaceId,
          limit: 10,
        });

      // Assert - Should be in descending creation order (newest first)
      expect(jobs).toHaveLength(2);
      expect(jobs[0].intent).toBe("second_job");
      expect(jobs[1].intent).toBe("first_job");
    });
  });

  describe("Run Assignment", () => {
    test("Given_ValidJobAndAgent_When_AssignsRun_Then_CreatesRunInAssignedState", async () => {
      // Arrange
      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "data_analysis",
          inputs: { file: "data.csv" },
        });

      // Act
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].assignRun, {
          workspaceId,
          jobId: job.jobId,
          agentId,
          capability: "data_analysis",
          inputs: { file: "data.csv" },
          scopes: ["file:read", "workspace:write"],
        });

      // Assert
      expect(result).toMatchObject({
        runId: expect.stringMatching(/^run_/),
      });

      // Verify run was created
      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryRun, {
          workspaceId,
          runId: result.runId,
        });

      expect(run).toMatchObject({
        jobId: job.jobId,
        assignedTo: agentId,
        status: "assigned",
        capabilityVersionUsed: "data_analysis",
        scopes: ["file:read", "workspace:write"],
        retryCount: 0,
      });

      // Verify event was logged
      const events = await t.run(async (ctx) => {
        return await ctx.db
          .query("events")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
          .collect();
      });

      const runAssignedEvent = events.find(e => e.type === "orchestration_run_assigned");
      expect(runAssignedEvent).toBeDefined();
      expect(runAssignedEvent?.meta).toMatchObject({
        jobId: job.jobId,
        agentId,
        capability: "data_analysis",
      });
    });

    test("Given_AgentAtMaxConcurrency_When_AssignsRun_Then_QueuesRun", async () => {
      // Arrange - Create job
      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "concurrent_test",
          inputs: {},
        });

      // Create runs to reach max concurrency (3)
      const runPromises = Array.from({ length: 3 }, (_, i) =>
        t.withIdentity({ tokenIdentifier: "test|admin123" })
          .mutation(api["orchestration/core"].assignRun, {
            workspaceId,
            jobId: job.jobId,
            agentId,
            capability: "data_analysis",
            inputs: { index: i },
            scopes: [],
          })
      );

      await Promise.all(runPromises);

      // Act - Assign one more run (should be queued)
      const queuedResult = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].assignRun, {
          workspaceId,
          jobId: job.jobId,
          agentId,
          capability: "data_analysis",
          inputs: { index: 3 },
          scopes: [],
        });

      // Assert
      const queuedRun = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryRun, {
          workspaceId,
          runId: queuedResult.runId,
        });

      expect(queuedRun.status).toBe("queued");
    });

    test("Given_NonExistentJob_When_AssignsRun_Then_ThrowsJobNotFoundError", async () => {
      // Act & Assert
      await expect(
        t.withIdentity({ tokenIdentifier: "test|admin123" })
          .mutation(api["orchestration/core"].assignRun, {
            workspaceId,
            jobId: "job_nonexistent",
            agentId,
            capability: "data_analysis",
            inputs: {},
            scopes: [],
          })
      ).rejects.toThrow("Job not found");
    });

    test("Given_InactiveAgent_When_AssignsRun_Then_ThrowsAgentUnavailableError", async () => {
      // Arrange - Create inactive agent
      const inactiveAgentId = "agent_inactive_123";
      await t.run(async (ctx) => {
        await ctx.db.insert("agents", {
          workspaceId,
          agentId: inactiveAgentId,
          name: "Inactive Agent",
          type: "external",
          version: "1.0.0",
          capabilities: ["data_analysis"],
          config: { model: "test" },
          isActive: false, // Inactive
          createdBy: adminUserId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "test_inactive",
          inputs: {},
        });

      // Act & Assert
      await expect(
        t.withIdentity({ tokenIdentifier: "test|admin123" })
          .mutation(api["orchestration/core"].assignRun, {
            workspaceId,
            jobId: job.jobId,
            agentId: inactiveAgentId,
            capability: "data_analysis",
            inputs: {},
            scopes: [],
          })
      ).rejects.toThrow("Agent not available");
    });

    test("Given_UnsupportedCapability_When_AssignsRun_Then_ThrowsCapabilityError", async () => {
      // Arrange
      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "unsupported_capability",
          inputs: {},
        });

      // Act & Assert
      await expect(
        t.withIdentity({ tokenIdentifier: "test|admin123" })
          .mutation(api["orchestration/core"].assignRun, {
            workspaceId,
            jobId: job.jobId,
            agentId,
            capability: "unsupported_capability", // Not in agent capabilities
            inputs: {},
            scopes: [],
          })
      ).rejects.toThrow("Agent does not support this capability");
    });

    test("Given_JobWithRuns_When_ListsRunsForJob_Then_ReturnsAllRuns", async () => {
      // Arrange
      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "multi_run_job",
          inputs: {},
        });

      // Create multiple runs
      const run1 = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].assignRun, {
          workspaceId,
          jobId: job.jobId,
          agentId,
          capability: "data_analysis",
          inputs: { step: 1 },
          scopes: [],
        });

      const run2 = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].assignRun, {
          workspaceId,
          jobId: job.jobId,
          agentId,
          capability: "web_scraping",
          inputs: { step: 2 },
          scopes: [],
        });

      // Act
      const runs = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].listRunsForJob, {
          workspaceId,
          jobId: job.jobId,
        });

      // Assert
      expect(runs).toHaveLength(2);
      const runIds = runs.map(r => r.runId);
      expect(runIds).toContain(run1.runId);
      expect(runIds).toContain(run2.runId);
    });
  });

  describe("Run Commands", () => {
    let jobId: string;
    let runId: string;

    beforeEach(async () => {
      // Create job and run for command tests
      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "command_test",
          inputs: {},
        });
      jobId = job.jobId;

      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].assignRun, {
          workspaceId,
          jobId,
          agentId,
          capability: "data_analysis",
          inputs: {},
          scopes: [],
        });
      runId = run.runId;

      // Move run to started state for command tests
      await t.run(async (ctx) => {
        const runDoc = await ctx.db
          .query("orchestrationRuns")
          .withIndex("by_workspace_runId", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", runId)
          )
          .unique();
        
        if (runDoc) {
          await ctx.db.patch(runDoc._id, {
            status: "started",
            startedAt: Date.now(),
          });
        }
      });
    });

    test("Given_StartedRun_When_PausesRun_Then_EmitsControlEventAndTracksCommand", async () => {
      // Act
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].pauseRun, {
          workspaceId,
          runId,
          reason: "Manual pause for inspection",
        });

      // Assert
      expect(result).toEqual({ ok: true });

      // Verify command was tracked in run
      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryRun, {
          workspaceId,
          runId,
        });

      expect(run.lastCommand).toMatchObject({
        type: "run.pause",
        issuedAt: expect.any(Number),
      });
      expect(run.lastCommand?.acknowledgedAt).toBeUndefined();

      // Verify control event was created
      const events = await t.run(async (ctx) => {
        return await ctx.db
          .query("orchestrationEvents")
          .withIndex("by_workspace_run_time", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", runId)
          )
          .collect();
      });

      const pauseEvent = events.find(e => e.type === "run.pause");
      expect(pauseEvent).toBeDefined();
      expect(pauseEvent?.data).toMatchObject({
        reason: "Manual pause for inspection",
      });
    });

    test("Given_InvalidTransition_When_PausesRun_Then_ReturnsErrorWithoutChanges", async () => {
      // Arrange - Set run to completed state (cannot pause completed runs)
      await t.run(async (ctx) => {
        const runDoc = await ctx.db
          .query("orchestrationRuns")
          .withIndex("by_workspace_runId", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", runId)
          )
          .unique();
        
        if (runDoc) {
          await ctx.db.patch(runDoc._id, {
            status: "completed",
            endedAt: Date.now(),
          });
        }
      });

      // Act
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].pauseRun, {
          workspaceId,
          runId,
        });

      // Assert
      expect(result).toEqual({
        ok: false,
        error: "Cannot pause run in completed state",
      });

      // Verify no command was tracked
      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryRun, {
          workspaceId,
          runId,
        });

      expect(run.lastCommand).toBeUndefined();
    });

    test("Given_PausedRun_When_ResumesRun_Then_EmitsResumeControlEvent", async () => {
      // Arrange - Set run to paused state
      await t.run(async (ctx) => {
        const runDoc = await ctx.db
          .query("orchestrationRuns")
          .withIndex("by_workspace_runId", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", runId)
          )
          .unique();
        
        if (runDoc) {
          await ctx.db.patch(runDoc._id, {
            status: "paused",
          });
        }
      });

      // Act
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].resumeRun, {
          workspaceId,
          runId,
        });

      // Assert
      expect(result).toEqual({ ok: true });

      // Verify control event was created
      const events = await t.run(async (ctx) => {
        return await ctx.db
          .query("orchestrationEvents")
          .withIndex("by_workspace_run_time", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", runId)
          )
          .collect();
      });

      const resumeEvent = events.find(e => e.type === "run.resume");
      expect(resumeEvent).toBeDefined();
    });

    test("Given_ActiveRun_When_CancelsRun_Then_ImmediatelyMarksAsFailed", async () => {
      // Act
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].cancelRun, {
          workspaceId,
          runId,
          reason: "User requested cancellation",
        });

      // Assert
      expect(result).toEqual({ ok: true });

      // Verify run was marked as failed
      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryRun, {
          workspaceId,
          runId,
        });

      expect(run.status).toBe("failed");
      expect(run.errorCode).toBe("AGENT_ERROR");
      expect(run.errorMessage).toContain("Cancelled: User requested cancellation");
      expect(run.endedAt).toBeDefined();
    });

    test("Given_FailedRun_When_RetriesRun_Then_QueuesRunWithIncrementedRetryCount", async () => {
      // Arrange - Set run to failed state
      await t.run(async (ctx) => {
        const runDoc = await ctx.db
          .query("orchestrationRuns")
          .withIndex("by_workspace_runId", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", runId)
          )
          .unique();
        
        if (runDoc) {
          await ctx.db.patch(runDoc._id, {
            status: "failed",
            errorCode: "TIMEOUT",
            errorMessage: "Operation timed out",
            retryCount: 1,
          });
        }
      });

      // Act
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].retryRun, {
          workspaceId,
          runId,
        });

      // Assert
      expect(result).toEqual({ ok: true });

      // Verify run was updated
      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryRun, {
          workspaceId,
          runId,
        });

      expect(run.status).toBe("queued");
      expect(run.retryCount).toBe(2);
      expect(run.errorCode).toBeUndefined();
      expect(run.errorMessage).toBeUndefined();
    });

    test("Given_RunWithMaxRetries_When_RetriesRun_Then_ReturnsErrorAndDoesNotRetry", async () => {
      // Arrange - Set run to failed state with max retries
      await t.run(async (ctx) => {
        const runDoc = await ctx.db
          .query("orchestrationRuns")
          .withIndex("by_workspace_runId", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", runId)
          )
          .unique();
        
        if (runDoc) {
          await ctx.db.patch(runDoc._id, {
            status: "failed",
            retryCount: 3, // At max retry limit
          });
        }
      });

      // Act
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].retryRun, {
          workspaceId,
          runId,
        });

      // Assert
      expect(result).toEqual({
        ok: false,
        error: "Maximum retry limit (3) reached",
      });

      // Verify run was not modified
      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryRun, {
          workspaceId,
          runId,
        });

      expect(run.status).toBe("failed");
      expect(run.retryCount).toBe(3);
    });

    test("Given_PendingCommand_When_AcknowledgesCommand_Then_UpdatesAcknowledgmentTimestamp", async () => {
      // Arrange - Issue a pause command
      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].pauseRun, {
          workspaceId,
          runId,
        });

      // Act - Agent acknowledges the command
      const result = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].acknowledgeCommand, {
          workspaceId,
          runId,
          commandType: "run.pause",
        });

      // Assert
      expect(result).toEqual({ ok: true });

      // Verify acknowledgment was recorded
      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/core"].queryRun, {
          workspaceId,
          runId,
        });

      expect(run.lastCommand?.acknowledgedAt).toBeDefined();

      // Verify acknowledgment event was created
      const events = await t.run(async (ctx) => {
        return await ctx.db
          .query("orchestrationEvents")
          .withIndex("by_workspace_run_time", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", runId)
          )
          .collect();
      });

      const ackEvent = events.find(e => e.type === "command.acked");
      expect(ackEvent).toBeDefined();
      expect(ackEvent?.data).toMatchObject({
        command: "run.pause",
        acknowledgedAt: expect.any(Number),
      });
    });

    test("Given_AgentWithPendingCommands_When_ListsPendingCommands_Then_ReturnsUnacknowledgedCommands", async () => {
      // Arrange - Issue multiple commands
      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].pauseRun, {
          workspaceId,
          runId,
        });

      // Create another run and command
      const secondJob = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "second_command_test",
          inputs: {},
        });

      const secondRun = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].assignRun, {
          workspaceId,
          jobId: secondJob.jobId,
          agentId,
          capability: "data_analysis",
          inputs: {},
          scopes: [],
        });

      await t.run(async (ctx) => {
        const runDoc = await ctx.db
          .query("orchestrationRuns")
          .withIndex("by_workspace_runId", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", secondRun.runId)
          )
          .unique();
        
        if (runDoc) {
          await ctx.db.patch(runDoc._id, {
            status: "started",
          });
        }
      });

      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].cancelRun, {
          workspaceId,
          runId: secondRun.runId,
        });

      // Act
      const pendingCommands = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/commands"].listPendingCommands, {
          workspaceId,
          agentId,
        });

      // Assert - Should have one pending command (pause), cancel is immediately executed
      expect(pendingCommands).toHaveLength(1);
      expect(pendingCommands[0]).toMatchObject({
        runId,
        command: "run.pause",
        issuedAt: expect.any(Number),
      });
    });
  });

  describe("Command Status Tracking", () => {
    test("Given_RunWithCommand_When_GetsCommandStatus_Then_ReturnsCommandInfo", async () => {
      // Arrange
      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "status_test",
          inputs: {},
        });

      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].assignRun, {
          workspaceId,
          jobId: job.jobId,
          agentId,
          capability: "data_analysis",
          inputs: {},
          scopes: [],
        });

      // Move to started state and issue command
      await t.run(async (ctx) => {
        const runDoc = await ctx.db
          .query("orchestrationRuns")
          .withIndex("by_workspace_runId", (q) =>
            q.eq("workspaceId", workspaceId).eq("runId", run.runId)
          )
          .unique();
        
        if (runDoc) {
          await ctx.db.patch(runDoc._id, { status: "started" });
        }
      });

      await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/commands"].pauseRun, {
          workspaceId,
          runId: run.runId,
        });

      // Act
      const commandStatus = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/commands"].getCommandStatus, {
          workspaceId,
          runId: run.runId,
        });

      // Assert
      expect(commandStatus).toMatchObject({
        lastCommand: {
          type: "run.pause",
          issuedAt: expect.any(Number),
        },
        isPending: true,
      });
    });

    test("Given_RunWithoutCommand_When_GetsCommandStatus_Then_ReturnsNullCommand", async () => {
      // Arrange
      const job = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].submitJob, {
          workspaceId,
          intent: "no_command_test",
          inputs: {},
        });

      const run = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .mutation(api["orchestration/core"].assignRun, {
          workspaceId,
          jobId: job.jobId,
          agentId,
          capability: "data_analysis",
          inputs: {},
          scopes: [],
        });

      // Act
      const commandStatus = await t
        .withIdentity({ tokenIdentifier: "test|admin123" })
        .query(api["orchestration/commands"].getCommandStatus, {
          workspaceId,
          runId: run.runId,
        });

      // Assert
      expect(commandStatus).toEqual({
        lastCommand: null,
        isPending: false,
      });
    });
  });
});