/**
 * AI Functions
 *
 * AI-powered features like command processing, summarization and tag suggestions.
 * All functions respect workspace policies and rate limits.
 */

import { ConvexError, v } from "convex/values";
import OpenAI from "openai";
import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";
import {
	assertWriteEnabled,
	checkRateLimit,
	incrementRateLimit,
	logEvent,
} from "./helpers";
import { requireUserId } from "./server/lib/authz";

/**
 * Get workspace AI policy limits.
 */
function getAIPolicy(plan: string) {
	switch (plan) {
		case "free":
			return {
				dailyTokenLimit: 5000,
				dailySummaries: 5,
				dailyTagSuggestions: 10,
			};
		case "team":
			return {
				dailyTokenLimit: 50000,
				dailySummaries: 100,
				dailyTagSuggestions: 200,
			};
		default:
			return {
				dailyTokenLimit: 1000,
				dailySummaries: 2,
				dailyTagSuggestions: 5,
			};
	}
}

/**
 * Call Ollama model directly (bypassing LiteLLM for simplicity).
 */
async function callOllamaModel(
	ctx: any,
	options: {
		workspaceId: string;
		message: string;
		userId: string;
		usePrivacy: boolean;
		model?: string;
	},
): Promise<any> {
	const { workspaceId, message, userId, usePrivacy, model } = options;

	// Map our model names to actual Ollama models
	let ollamaModel = "hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M"; // Default to Qwen3

	if (model === "main" || model === "fast") {
		ollamaModel = "llama3.2:1b"; // Fastest model for quick responses
	} else if (
		model === "enhanced" ||
		model === "creative" ||
		model === "documents"
	) {
		ollamaModel = "hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M"; // Best model for complex tasks
	}

	console.log(`Calling Ollama model: ${ollamaModel}`, {
		originalModel: model,
		messageLength: message.length,
		usePrivacy,
	});

	try {
		// Call Ollama's generate API
		const response = await fetch(
			`${process.env.OLLAMA_BASE_URL}/api/generate`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: ollamaModel,
					prompt: `You are Pulse AI, an intelligent assistant for idea management and productivity. Help users organize their thoughts, create ideas, and manage their workspace efficiently.

NAVIGATION INSTRUCTIONS:
When users want to navigate to different sections of the app, include these phrases in your response:
- For tasks/todos: "Let me take you to your tasks" or "Navigating to /tasks"
- For ideas: "Let me take you to your ideas" or "Navigating to /ideas" 
- For calendar: "Let me take you to your calendar" or "Navigating to /calendar"
- For projects: "Let me take you to your projects" or "Navigating to /projects"
- For analytics: "Let me take you to analytics" or "Navigating to /analytics"
- For settings: "Let me take you to settings" or "Navigating to /settings"
- For team: "Let me take you to your team" or "Navigating to /team"

The frontend will detect these navigation phrases and automatically redirect the user.

User: ${message}

AI:`,
					stream: false,
				}),
			},
		);

		if (!response.ok) {
			throw new Error(`Ollama API error: ${response.status}`);
		}

		const data = await response.json();
		const aiResponse = data.response || "I couldn't generate a response.";

		console.log(`Ollama response received (${data.eval_count} tokens)`, {
			model: ollamaModel,
			totalDuration: data.total_duration,
		});

		// Check if this looks like an idea creation request
		const isIdeaRequest =
			message.toLowerCase().includes("idea") &&
			(message.toLowerCase().includes("create") ||
				message.toLowerCase().includes("add") ||
				message.toLowerCase().includes("new"));

		if (isIdeaRequest) {
			try {
				// Extract a title from the message
				const title = extractIdeaTitle(message);

				// Create the idea
				const ideaId = await ctx.runMutation(api.ideas.create, {
					workspaceId,
					title,
					contentMD: aiResponse,
				});

				return {
					text: aiResponse,
					action: "navigate",
					target: `/ideas/${ideaId}/edit`,
					model: ollamaModel,
					ideaId,
				};
			} catch (error) {
				console.error("Failed to create idea:", error);
				// Still return the AI response even if idea creation fails
				return {
					text:
						aiResponse +
						"\n\n(Note: I couldn't automatically create the idea, but you can copy this content manually)",
					model: ollamaModel,
				};
			}
		}

		return {
			text: aiResponse,
			model: ollamaModel,
		};
	} catch (error) {
		console.error("Ollama API Error:", error);

		// Try fallback to smaller model if using complex model failed
		// Only retry once to avoid infinite loops
		if (ollamaModel !== "llama3.2:1b" && !options.model?.includes("main")) {
			console.log("Retrying with fallback model: llama3.2:1b");
			return await callOllamaModel(ctx, {
				...options,
				model: "main",
			});
		}

		throw new ConvexError({
			code: "AI_ERROR",
			message: "Failed to connect to local AI model - check Ollama is running",
		});
	}
}

/**
 * Call AI model through LiteLLM proxy or direct API.
 */
async function callAIModel(
	ctx: any,
	options: {
		workspaceId: string;
		message: string;
		userId: string;
		usePrivacy: boolean;
		model?: string;
	},
): Promise<any> {
	const { workspaceId, message, userId, usePrivacy, model } = options;

	// Use LiteLLM proxy with the configured models
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY || "dummy-key",
		baseURL: process.env.LITELLM_BASE_URL || "https://api.openai.com/v1",
	});

	console.log("AI Client Config:", {
		baseURL: process.env.LITELLM_BASE_URL || "https://api.openai.com/v1",
		hasApiKey: !!process.env.OPENAI_API_KEY,
	});

	// Use the configured LiteLLM model names
	let selectedModel = "ollama/llama3.2:1b"; // Default to fast model

	if (usePrivacy) {
		selectedModel = "ollama/smollm:135m"; // Super fast for privacy
	} else if (model) {
		// Map semantic model names to actual LiteLLM models
		switch (model) {
			case "fast":
				selectedModel = "ollama/smollm:135m"; // Fastest model
				break;
			case "main":
				selectedModel = "ollama/llama3.2:1b"; // Good balance
				break;
			case "enhanced":
			case "creative":
			case "documents":
				selectedModel =
					"ollama/hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M"; // Most capable
				break;
			default:
				selectedModel = "ollama/llama3.2:1b";
		}
	}

	console.log(`Using fallback model: ${selectedModel}`, {
		messageLength: message.length,
		usePrivacy,
		explicitModel: model,
	});

	try {
		// Call AI model
		const completion = await openai.chat.completions.create({
			model: selectedModel,
			messages: [
				{
					role: "system",
					content: `You are Pulse AI, an intelligent assistant for idea management and productivity. Help users organize their thoughts, create ideas, and manage their workspace efficiently.

NAVIGATION INSTRUCTIONS:
When users want to navigate to different sections of the app, include these phrases in your response:
- For tasks/todos: "Let me take you to your tasks" or "Navigating to /tasks"
- For ideas: "Let me take you to your ideas" or "Navigating to /ideas" 
- For calendar: "Let me take you to your calendar" or "Navigating to /calendar"
- For projects: "Let me take you to your projects" or "Navigating to /projects"
- For analytics: "Let me take you to analytics" or "Navigating to /analytics"
- For settings: "Let me take you to settings" or "Navigating to /settings"
- For team: "Let me take you to your team" or "Navigating to /team"

The frontend will detect these navigation phrases and automatically redirect the user.`,
				},
				{ role: "user", content: message },
			],
			temperature: 0.7,
			max_tokens: 2000,
		});

		const response =
			completion.choices[0]?.message?.content ||
			"I couldn't generate a response.";

		// Check if this looks like an idea creation request
		const isIdeaRequest =
			message.toLowerCase().includes("idea") &&
			(message.toLowerCase().includes("create") ||
				message.toLowerCase().includes("add") ||
				message.toLowerCase().includes("new"));

		if (isIdeaRequest) {
			try {
				// Extract a title from the message
				const title = extractIdeaTitle(message);

				// Create the idea
				const ideaId = await ctx.runMutation(api.ideas.create, {
					workspaceId,
					title,
					contentMD: response,
				});

				return {
					text: response,
					action: "navigate",
					target: `/ideas/${ideaId}/edit`,
					model: selectedModel,
					ideaId,
				};
			} catch (error) {
				console.error("Failed to create idea:", error);
				// Still return the AI response even if idea creation fails
				return {
					text:
						response +
						"\n\n(Note: I couldn't automatically create the idea, but you can copy this content manually)",
					model: selectedModel,
				};
			}
		}

		return {
			text: response,
			model: selectedModel,
		};
	} catch (error) {
		console.error("AI API Error:", error);

		// If using the larger model failed, try fallback to the smaller model
		// But only if we haven't already tried it, and only if we have valid setup
		if (
			selectedModel ===
				"ollama/hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M" &&
			process.env.LITELLM_BASE_URL
		) {
			console.log("Retrying with fallback model: ollama/llama3.2:1b");
			return await callAIModel(ctx, {
				...options,
				model: "main", // This will map to ollama/llama3.2:1b
			});
		}

		throw new ConvexError({
			code: "AI_ERROR",
			message:
				"Failed to process AI request - check LiteLLM proxy is running and configured",
		});
	}
}

/**
 * Summarise an idea using AI.
 */
export const summariseIdea = action({
	args: {
		workspaceId: v.id("workspaces"),
		ideaId: v.id("ideas"),
	},
	handler: async (ctx, { workspaceId, ideaId }) => {
		const userId = await requireUserId(ctx);

		// Check permissions and get workspace
		const { workspace } = await ctx.runQuery(
			internal.internal.assertWriteEnabledInternal,
			{
				workspaceId,
				minRole: "editor",
			},
		);

		// Check AI rate limits
		const policy = getAIPolicy(workspace.plan);

		const withinLimit = await ctx.runQuery(
			internal.internal.checkRateLimitInternal,
			{
				userId,
				type: "ai_tokens_daily",
				workspaceId,
				limit: policy.dailySummaries,
				windowMinutes: 24 * 60, // 24 hours
			},
		);

		if (!withinLimit) {
			throw new ConvexError({
				code: "RATE_LIMITED",
				message: "Daily AI limit exceeded",
			});
		}

		// Get the idea
		const idea = await ctx.runQuery(internal.internal.ideasGetInternal, {
			ideaId,
		});
		if (!idea) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found",
			});
		}

		// Generate AI summary using OpenAI
		const summary = await generateAISummary(idea.title, idea.contentMD);

		// Update idea with summary (append to content)
		await ctx.runMutation(internal.internal.ideasUpdateInternal, {
			ideaId,
			contentMD: idea.contentMD + "\n\n## AI Summary\n\n" + summary,
		});

		// Increment rate limit
		await ctx.runMutation(internal.internal.incrementRateLimitInternal, {
			userId,
			type: "ai_tokens_daily",
			workspaceId,
			windowMinutes: 24 * 60,
		});

		// Log AI usage event
		await ctx.runMutation(internal.internal.logEventInternal, {
			workspaceId,
			type: "ai_summary_generated",
			entity: "idea",
			entityId: ideaId,
			meta: { tokens: summary.length },
		});

		return { summary, tokensUsed: summary.length };
	},
});

/**
 * Suggest tags for an idea using AI.
 */
export const suggestTags = action({
	args: {
		workspaceId: v.id("workspaces"),
		ideaId: v.id("ideas"),
	},
	handler: async (ctx, { workspaceId, ideaId }) => {
		const userId = await requireUserId(ctx);

		// Check permissions and get workspace
		const { workspace } = await ctx.runQuery(
			internal.internal.assertWriteEnabledInternal,
			{
				workspaceId,
				minRole: "editor",
			},
		);

		// Check AI rate limits
		const policy = getAIPolicy(workspace.plan);

		const withinLimit = await ctx.runQuery(
			internal.internal.checkRateLimitInternal,
			{
				userId,
				type: "ai_tokens_daily",
				workspaceId,
				limit: policy.dailyTagSuggestions,
				windowMinutes: 24 * 60, // 24 hours
			},
		);

		if (!withinLimit) {
			throw new ConvexError({
				code: "RATE_LIMITED",
				message: "Daily AI limit exceeded",
			});
		}

		// Get the idea
		const idea = await ctx.runQuery(internal.internal.ideasGetInternal, {
			ideaId,
		});
		if (!idea) {
			throw new ConvexError({
				code: "NOT_FOUND",
				message: "Idea not found",
			});
		}

		// Get existing workspace tags for suggestions
		const existingTags = await ctx.runQuery(
			internal.internal.tagsListInternal,
			{ workspaceId },
		);

		// Generate AI tag suggestions using OpenAI
		const suggestions = await generateAITagSuggestions(
			idea.title,
			idea.contentMD,
			existingTags.map((t: any) => t.name),
		);

		// Increment rate limit
		await ctx.runMutation(internal.internal.incrementRateLimitInternal, {
			userId,
			type: "ai_tokens_daily",
			workspaceId,
			windowMinutes: 24 * 60,
		});

		// Log AI usage event
		await ctx.runMutation(internal.internal.logEventInternal, {
			workspaceId,
			type: "ai_tags_suggested",
			entity: "idea",
			entityId: ideaId,
			meta: { suggestionCount: suggestions.length },
		});

		return suggestions;
	},
});

/**
 * Generate AI summary using OpenAI.
 */
async function generateAISummary(
	title: string,
	content: string,
): Promise<string> {
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});

	try {
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful assistant that creates concise summaries of ideas. Focus on key points, implementation considerations, and next steps. Keep summaries under 3 sentences.",
				},
				{
					role: "user",
					content: `Please summarize this idea:\n\nTitle: ${title}\n\nContent: ${content}`,
				},
			],
			max_tokens: 150,
			temperature: 0.7,
		});

		return (
			response.choices[0]?.message?.content?.trim() ||
			"Unable to generate summary."
		);
	} catch (error) {
		console.error("OpenAI summary generation failed:", error);
		// Fallback to a basic summary if AI fails
		return `Summary of "${title}": ${content.slice(0, 100)}${content.length > 100 ? "..." : ""}`;
	}
}

/**
 * Generate AI tag suggestions using OpenAI.
 */
async function generateAITagSuggestions(
	title: string,
	content: string,
	existingTags: string[],
): Promise<string[]> {
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});

	try {
		const existingTagsStr =
			existingTags.length > 0
				? `\n\nExisting tags in this workspace: ${existingTags.join(", ")}`
				: "";

		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful assistant that suggests relevant tags for ideas. Return only 3-5 short, hyphenated tags (e.g., 'bug-fix', 'feature', 'ui-ux'). Prefer existing workspace tags when relevant. Return only the tag names, one per line, no explanations.",
				},
				{
					role: "user",
					content: `Suggest tags for this idea:\n\nTitle: ${title}\n\nContent: ${content}${existingTagsStr}`,
				},
			],
			max_tokens: 100,
			temperature: 0.3,
		});

		const suggestedTags =
			response.choices[0]?.message?.content
				?.trim()
				.split("\n")
				.map((tag) => tag.trim().toLowerCase())
				.filter((tag) => tag.length > 0 && tag.length <= 30)
				.slice(0, 5) || [];

		// Prioritize existing tags, then new suggestions
		const existingMatches = suggestedTags.filter((tag) =>
			existingTags.includes(tag),
		);
		const newSuggestions = suggestedTags.filter(
			(tag) => !existingTags.includes(tag),
		);

		return [...existingMatches.slice(0, 2), ...newSuggestions.slice(0, 3)];
	} catch (error) {
		console.error("OpenAI tag suggestions failed:", error);
		// Fallback to simple keyword-based suggestions
		const fallbackTags = ["feature", "improvement", "idea"];
		return fallbackTags.slice(0, 2);
	}
}

/**
 * Process messages with AI using LiteLLM proxy.
 */
export const processMessage = action({
	args: {
		workspaceId: v.id("workspaces"),
		message: v.string(),
		usePrivacy: v.optional(v.boolean()),
		model: v.optional(v.string()),
	},
	handler: async (
		ctx,
		{ workspaceId, message, usePrivacy, model },
	): Promise<any> => {
		console.log("ProcessMessage called with:", {
			workspaceId,
			messageLength: message.length,
			usePrivacy,
			model,
		});

		const userId = await requireUserId(ctx);
		console.log("User ID:", userId);

		// Check permissions and get workspace
		const { workspace } = await ctx.runQuery(
			internal.internal.assertWriteEnabledInternal,
			{
				workspaceId,
				minRole: "viewer",
			},
		);

		// Check AI rate limits
		const policy = getAIPolicy(workspace.plan);

		const withinLimit = await ctx.runQuery(
			internal.internal.checkRateLimitInternal,
			{
				userId,
				type: "ai_tokens_daily",
				workspaceId,
				limit: policy.dailyTokenLimit / 1000,
				windowMinutes: 24 * 60, // 24 hours
			},
		);

		if (!withinLimit) {
			throw new ConvexError({
				code: "RATE_LIMITED",
				message: "Daily AI limit exceeded",
			});
		}

		try {
			console.log("About to call AI model...");
			// Call AI through LiteLLM proxy
			const result = await callAIModel(ctx, {
				workspaceId,
				message: message.trim(),
				userId,
				usePrivacy: usePrivacy || false,
				model,
			});

			console.log("AI model returned:", {
				hasText: !!result.text,
				textLength: result.text?.length,
				model: result.model,
			});

			// Increment rate limit
			await ctx.runMutation(internal.internal.incrementRateLimitInternal, {
				userId,
				type: "ai_tokens_daily",
				workspaceId,
				windowMinutes: 24 * 60,
			});

			// Log AI usage event
			await ctx.runMutation(internal.internal.logEventInternal, {
				workspaceId,
				type: "ai_message_processed",
				entity: "message",
				entityId: "ai_message",
				meta: {
					messageLength: message.length,
					model: result.model,
					action: result.action || "chat",
				},
			});

			return result;
		} catch (error) {
			console.error("AI processing error:", error);
			return {
				text: "I'm having trouble processing that request right now. Please try again.",
				error: true,
			};
		}
	},
});

/**
 * Process natural language commands (legacy - keeping for backward compatibility).
 */
export const processCommand = action({
	args: {
		workspaceId: v.id("workspaces"),
		command: v.string(),
	},
	handler: async (ctx, { workspaceId, command }): Promise<any> => {
		// Redirect to new processMessage action
		return await ctx.runAction(api.ai.processMessage, {
			workspaceId,
			message: command,
		});
	},
});

/**
 * Process natural language command and return structured result.
 */
async function processNaturalLanguageCommand(
	ctx: any,
	{
		workspaceId,
		command,
		userId,
	}: {
		workspaceId: string;
		command: string;
		userId: string;
	},
): Promise<any> {
	const lowerCommand = command.toLowerCase();

	// Idea creation commands
	if (
		(lowerCommand.includes("create") || lowerCommand.includes("add")) &&
		lowerCommand.includes("idea")
	) {
		const title = extractIdeaTitle(command);
		const content = extractIdeaContent(command);

		try {
			const ideaId: any = await ctx.runMutation(
				internal.internal.ideasCreateInternal,
				{
					workspaceId,
					title,
					contentMD: content,
					userId,
				},
			);

			return {
				type: "idea_created",
				message: `✅ Created new idea: "${title}"`,
				data: { ideaId, title },
				actions: [
					{ type: "view_idea", label: "View Idea", data: { ideaId } },
					{ type: "edit_idea", label: "Edit Idea", data: { ideaId } },
				],
			};
		} catch (error) {
			return {
				type: "error",
				message: "❌ Failed to create idea. Please check your permissions.",
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Summary commands
	if (
		lowerCommand.includes("summarize") ||
		lowerCommand.includes("summary") ||
		lowerCommand.includes("overview")
	) {
		try {
			const ideas: any = await ctx.runQuery(
				internal.internal.ideasListInternal,
				{
					workspaceId,
					limit: 20,
				},
			);

			const summary = generateWorkspaceSummary(ideas);

			return {
				type: "summary_generated",
				message: summary,
				data: { ideasCount: ideas.length },
				actions: [
					{ type: "view_all_ideas", label: "View All Ideas", data: {} },
					{ type: "create_idea", label: "Create New Idea", data: {} },
				],
			};
		} catch (error) {
			return {
				type: "error",
				message: "❌ Failed to generate summary. Please try again.",
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	// Tag suggestion commands
	if (lowerCommand.includes("tag") || lowerCommand.includes("organize")) {
		return {
			type: "tag_suggestions",
			message: `🏷️ **Tag Organization Suggestions**

**Recommended Tags:**
• #brainstorm - for early-stage ideas
• #feature - for new functionality
• #improvement - for enhancements
• #research - for investigative work
• #urgent - for high-priority items

**Organization Tips:**
• Use consistent naming conventions
• Limit to 3-5 tags per idea  
• Create hierarchical tag structures
• Review and cleanup monthly

Would you like me to suggest specific tags for your existing ideas?`,
			data: { suggestedTags: 5 },
			actions: [
				{ type: "apply_tags", label: "Apply Suggested Tags", data: {} },
				{ type: "manage_tags", label: "Manage Tags", data: {} },
			],
		};
	}

	// Search commands
	if (lowerCommand.includes("find") || lowerCommand.includes("search")) {
		const searchQuery = extractSearchQuery(command);
		if (searchQuery) {
			try {
				const results: any = await ctx.runQuery(
					internal.internal.ideasSearchInternal,
					{
						workspaceId,
						query: searchQuery,
						limit: 10,
					},
				);

				return {
					type: "search_results",
					message: `🔍 Found ${results.length} ideas matching "${searchQuery}"`,
					data: { results, query: searchQuery },
					actions: [
						{
							type: "view_search_results",
							label: "View Results",
							data: { query: searchQuery },
						},
						{ type: "refine_search", label: "Refine Search", data: {} },
					],
				};
			} catch (error) {
				return {
					type: "error",
					message: "❌ Search failed. Please try again.",
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		}
	}

	// Fallback - general assistance
	return {
		type: "general_assistance",
		message: `I understand you want to: "${command}"

I can help you with:
✅ **Create ideas** - "Create an idea about user onboarding"
✅ **Summarize workspace** - "Give me a summary of my active ideas"  
✅ **Find content** - "Find ideas about authentication"
✅ **Organize with tags** - "Suggest tags for my ideas"

Try rephrasing your request with one of these patterns, or let me know what specific task you'd like help with!`,
		data: { originalCommand: command },
		actions: [
			{ type: "create_idea", label: "Create New Idea", data: {} },
			{ type: "view_all_ideas", label: "View All Ideas", data: {} },
		],
	};
}

/**
 * Extract idea title from natural language command.
 */
function extractIdeaTitle(command: string): string {
	// Simple extraction - in production, use NLP
	const patterns = [
		/create.*idea.*about\s+(.+)/i,
		/add.*idea.*about\s+(.+)/i,
		/new.*idea.*about\s+(.+)/i,
		/create.*idea.*["']([^"']+)["']/i,
		/add.*idea.*["']([^"']+)["']/i,
	];

	for (const pattern of patterns) {
		const match = command.match(pattern);
		if (match?.[1]) {
			return match[1].trim().substring(0, 200);
		}
	}

	// Fallback: extract meaningful words
	const words = command
		.split(" ")
		.filter(
			(word) =>
				word.length > 2 &&
				![
					"create",
					"add",
					"new",
					"idea",
					"about",
					"the",
					"a",
					"an",
					"and",
					"or",
					"for",
				].includes(word.toLowerCase()),
		);

	return words.slice(0, 6).join(" ") || "New Idea";
}

/**
 * Extract idea content from natural language command.
 */
function extractIdeaContent(command: string): string {
	// Simple content extraction
	if (command.length > 100) {
		return `Generated from command: ${command}

This idea was created using AI assistance. You can edit this content to add more details, requirements, or implementation notes.`;
	}

	return `Initial concept: ${command}

Next steps:
- Define requirements
- Research existing solutions  
- Plan implementation approach
- Identify resources needed`;
}

/**
 * Extract search query from command.
 */
function extractSearchQuery(command: string): string | null {
	const patterns = [
		/find.*["']([^"']+)["']/i,
		/search.*["']([^"']+)["']/i,
		/find.*about\s+(.+)/i,
		/search.*about\s+(.+)/i,
		/find\s+(.+)/i,
		/search\s+(.+)/i,
	];

	for (const pattern of patterns) {
		const match = command.match(pattern);
		if (match?.[1]) {
			return match[1].trim();
		}
	}

	return null;
}

/**
 * Generate workspace summary from ideas.
 */
function generateWorkspaceSummary(ideas: any[]): string {
	const totalIdeas = ideas.length;
	const statusCounts = ideas.reduce(
		(acc, idea) => {
			acc[idea.status] = (acc[idea.status] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	const recentIdeas = ideas.filter(
		(idea) => Date.now() - idea.createdAt < 7 * 24 * 60 * 60 * 1000, // Last 7 days
	).length;

	return `📊 **Workspace Summary**

**Total Ideas:** ${totalIdeas}
• Active: ${statusCounts.active || 0}
• Draft: ${statusCounts.draft || 0}  
• Archived: ${statusCounts.archived || 0}

**Recent Activity:** ${recentIdeas} ideas created this week

**Key Insights:**
${
	totalIdeas === 0
		? "• No ideas yet - great opportunity to start brainstorming!"
		: totalIdeas < 5
			? "• Good start! Consider expanding on your existing ideas"
			: totalIdeas < 20
				? "• Growing collection - consider organizing with tags and projects"
				: "• Extensive idea collection - excellent progress!"
}

**Recommendations:**
${
	statusCounts.draft > statusCounts.active
		? "• Focus on converting draft ideas to active status"
		: "• Keep the momentum going with new ideas"
}
• Review and update older ideas regularly
• Use tags to group related concepts`;
}
