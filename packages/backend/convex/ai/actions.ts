/**
 * AI Actions
 *
 * Clean, properly typed AI actions following SRP
 */

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { requireUserId } from "../server/lib/authz";
import { getAIPolicyLimits } from "./config";
import { AIModelService } from "./modelService";
import { AIContentServiceImpl } from "./contentService";
import { ConvexError, v } from "convex/values";
import type { AIResponse } from "./types";

// Service instances
const modelService = new AIModelService();
const contentService = new AIContentServiceImpl();

/**
 * Legacy command processor (for backward compatibility)
 */
export const processCommand = action({
  args: {
    workspaceId: v.id("workspaces"),
    command: v.string(),
  },
  returns: v.object({
    text: v.string(),
    model: v.string(),
    message: v.optional(v.string()),
    action: v.optional(v.union(v.literal("navigate"), v.literal("create_idea"))),
    target: v.optional(v.string()),
    ideaId: v.optional(v.id("ideas")),
    tokensUsed: v.optional(v.number()),
    error: v.optional(v.boolean()),
  }),
  handler: async (ctx, args): Promise<AIResponse> => {
    // Import api at runtime to avoid circular dependencies
    const { api } = await import("../_generated/api");

    // Redirect to processMessage
    return await ctx.runAction(api.ai.processMessage, {
      workspaceId: args.workspaceId,
      message: args.command,
    });
  },
});

/**
 * Process AI message with proper typing and error handling
 */
export const processMessage = action({
  args: {
    workspaceId: v.id("workspaces"),
    message: v.string(),
    usePrivacy: v.optional(v.boolean()),
    model: v.optional(v.union(
      v.literal("fast"),
      v.literal("main"),
      v.literal("enhanced"),
      v.literal("creative"),
      v.literal("documents")
    )),
  },
  returns: v.object({
    text: v.string(),
    model: v.string(),
    message: v.optional(v.string()),
    action: v.optional(v.union(v.literal("navigate"), v.literal("create_idea"))),
    target: v.optional(v.string()),
    ideaId: v.optional(v.id("ideas")),
    tokensUsed: v.optional(v.number()),
    error: v.optional(v.boolean()),
  }),
  handler: async (ctx, args): Promise<AIResponse> => {
    const userId = await requireUserId(ctx);

    // Check permissions and get workspace
    const { workspace } = await ctx.runQuery(
      internal.internal.assertWriteEnabledInternal,
      {
        workspaceId: args.workspaceId,
        minRole: "viewer",
      }
    );

    // Check AI rate limits
    const policy = getAIPolicyLimits(workspace.plan);
    const withinLimit = await ctx.runQuery(
      internal.internal.checkRateLimitInternal,
      {
        userId,
        type: "ai_tokens_daily",
        workspaceId: args.workspaceId,
        limit: Math.floor(policy.dailyTokenLimit / 1000),
        windowMinutes: 24 * 60,
      }
    );

    if (!withinLimit) {
      throw new ConvexError({
        code: "RATE_LIMITED",
        message: "Daily AI limit exceeded",
      });
    }

    try {
      // Call AI model service
      const result = await modelService.callModel(ctx, {
        workspaceId: args.workspaceId,
        message: args.message.trim(),
        userId,
        usePrivacy: args.usePrivacy || false,
        model: args.model,
      });

      // Increment rate limit
      await ctx.runMutation(internal.internal.incrementRateLimitInternal, {
        userId,
        type: "ai_tokens_daily",
        workspaceId: args.workspaceId,
        windowMinutes: 24 * 60,
      });

      // Log AI usage event
      await ctx.runMutation(internal.internal.logEventInternal, {
        workspaceId: args.workspaceId,
        type: "ai_message_processed",
        entity: "message",
        entityId: "ai_message",
        meta: {
          messageLength: args.message.length,
          model: result.model,
          action: result.action || "chat",
        },
      });

      return result;
    } catch (error) {
      console.error("AI processing error:", error);
      return {
        text: "I'm having trouble processing that request right now. Please try again.",
        model: "error",
        error: true,
      };
    }
  },
});

/**
 * Suggest tags for an idea using AI
 */
export const suggestTags = action({
  args: {
    workspaceId: v.id("workspaces"),
    ideaId: v.id("ideas"),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args): Promise<string[]> => {
    const userId = await requireUserId(ctx);

    // Check permissions
    const { workspace } = await ctx.runQuery(
      internal.internal.assertWriteEnabledInternal,
      {
        workspaceId: args.workspaceId,
        minRole: "editor",
      }
    );

    // Check AI rate limits
    const policy = getAIPolicyLimits(workspace.plan);
    const withinLimit = await ctx.runQuery(
      internal.internal.checkRateLimitInternal,
      {
        userId,
        type: "ai_tags_daily",
        workspaceId: args.workspaceId,
        limit: policy.dailyTagSuggestions,
        windowMinutes: 24 * 60,
      }
    );

    if (!withinLimit) {
      throw new ConvexError({
        code: "RATE_LIMITED",
        message: "Daily AI tag suggestion limit exceeded",
      });
    }

    // Get the idea
    const idea = await ctx.runQuery(internal.internal.ideasGetInternal, {
      ideaId: args.ideaId,
    });

    if (!idea) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Idea not found",
      });
    }

    // Get existing workspace tags
    const existingTags = await ctx.runQuery(
      internal.internal.tagsListInternal,
      { workspaceId: args.workspaceId }
    );

    // Generate tag suggestions
    const suggestions = await contentService.suggestTags(
      idea.title,
      idea.contentMD,
      existingTags.map((t) => t.name)
    );

    // Increment rate limit
    await ctx.runMutation(internal.internal.incrementRateLimitInternal, {
      userId,
      type: "ai_tags_daily",
      workspaceId: args.workspaceId,
      windowMinutes: 24 * 60,
    });

    // Log event
    await ctx.runMutation(internal.internal.logEventInternal, {
      workspaceId: args.workspaceId,
      type: "ai_tags_suggested",
      entity: "idea",
      entityId: args.ideaId,
      meta: { suggestionCount: suggestions.length },
    });

    return suggestions;
  },
});

/**
 * Summarize an idea using AI
 */
export const summarizeIdea = action({
  args: {
    workspaceId: v.id("workspaces"),
    ideaId: v.id("ideas"),
  },
  returns: v.object({
    summary: v.string(),
    tokensUsed: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    // Check permissions
    const { workspace } = await ctx.runQuery(
      internal.internal.assertWriteEnabledInternal,
      {
        workspaceId: args.workspaceId,
        minRole: "editor",
      }
    );

    // Check AI rate limits
    const policy = getAIPolicyLimits(workspace.plan);
    const withinLimit = await ctx.runQuery(
      internal.internal.checkRateLimitInternal,
      {
        userId,
        type: "ai_summaries_daily",
        workspaceId: args.workspaceId,
        limit: policy.dailySummaries,
        windowMinutes: 24 * 60,
      }
    );

    if (!withinLimit) {
      throw new ConvexError({
        code: "RATE_LIMITED",
        message: "Daily AI summary limit exceeded",
      });
    }

    // Get the idea
    const idea = await ctx.runQuery(internal.internal.ideasGetInternal, {
      ideaId: args.ideaId,
    });

    if (!idea) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Idea not found",
      });
    }

    // Generate summary
    const summary = await contentService.summarizeIdea(idea.title, idea.contentMD);

    // Update idea with summary
    await ctx.runMutation(internal.internal.ideasUpdateInternal, {
      ideaId: args.ideaId,
      contentMD: idea.contentMD + "\n\n## AI Summary\n\n" + summary,
    });

    // Increment rate limit
    await ctx.runMutation(internal.internal.incrementRateLimitInternal, {
      userId,
      type: "ai_summaries_daily",
      workspaceId: args.workspaceId,
      windowMinutes: 24 * 60,
    });

    // Log event
    await ctx.runMutation(internal.internal.logEventInternal, {
      workspaceId: args.workspaceId,
      type: "ai_summary_generated",
      entity: "idea",
      entityId: args.ideaId,
      meta: { tokens: summary.length },
    });

    return {
      summary,
      tokensUsed: summary.length,
    };
  },
});