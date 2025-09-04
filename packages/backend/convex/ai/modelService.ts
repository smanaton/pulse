/**
 * AI Model Service
 *
 * Handles communication with AI models (Ollama and LiteLLM)
 * Single responsibility: AI model interaction
 */

import OpenAI from "openai";
import type { ActionCtx } from "../_generated/server";
import {
	type AI_MODEL_CONFIGS,
	getModelConfig,
	SYSTEM_PROMPTS,
} from "./config";
import { AIError, type AIRequest, type AIResponse } from "./types";

export class AIModelService {
	/**
	 * Call AI model with fallback logic
	 */
	async callModel(ctx: ActionCtx, request: AIRequest): Promise<AIResponse> {
		// In tests, avoid external network calls. Return a deterministic mocked
		// response and let processResponse handle any idea-creation side effects
		// (it will still use ctx to mutate/query the in-test DB as needed).
		if (process.env.NODE_ENV === "test") {
			const modelName = request.model ?? (request.usePrivacy ? "fast" : "main");
			const text = `Mocked response for model=${modelName} message=${String(
				request.message,
			)}`.slice(0, 1000);
			try {
				return await this.processResponse(ctx, request, text, modelName);
			} catch (_err) {
				// If anything goes wrong, return a simple base response so tests can
				// continue validating behavior that doesn't rely on mutations.
				return { text, model: modelName, tokensUsed: text.length };
			}
		}
		const modelConfig = getModelConfig(request.model, request.usePrivacy);

		// Only route via LiteLLM proxy. Require LITELLM_BASE_URL for production use.
		if (process.env.LITELLM_BASE_URL) {
			return await this.callLiteLLM(ctx, request, modelConfig);
		}

		throw new AIError(
			"MODEL_UNAVAILABLE",
			"LiteLLM proxy not configured. Set LITELLM_BASE_URL to route model calls.",
		);
	}

	/**
	 * Call LiteLLM proxy
	 */
	private async callLiteLLM(
		ctx: ActionCtx,
		request: AIRequest,
		modelConfig: (typeof AI_MODEL_CONFIGS)[keyof typeof AI_MODEL_CONFIGS],
	): Promise<AIResponse> {
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY || "dummy-key",
			baseURL: process.env.LITELLM_BASE_URL,
		});

		try {
			const completion = await openai.chat.completions.create({
				model: modelConfig.liteLLMModel,
				messages: [
					{ role: "system", content: SYSTEM_PROMPTS.general },
					{ role: "user", content: request.message },
				],
				temperature: modelConfig.temperature,
				max_tokens: modelConfig.maxTokens,
			});

			const text =
				completion.choices[0]?.message?.content ||
				"I couldn't generate a response.";

			return await this.processResponse(
				ctx,
				request,
				text,
				modelConfig.liteLLMModel,
			);
		} catch (error) {
			throw new AIError("AI_ERROR", "LiteLLM request failed", error as Error);
		}
	}

	/**
	 * Process AI response and handle idea creation
	 */
	private async processResponse(
		ctx: ActionCtx,
		request: AIRequest,
		text: string,
		model: string,
	): Promise<AIResponse> {
		const baseResponse: AIResponse = {
			text,
			message: text, // For backward compatibility
			model,
		};

		// Check if this looks like an idea creation request
		const isIdeaRequest = this.detectIdeaCreationIntent(request.message);

		if (isIdeaRequest) {
			try {
				const title = this.extractIdeaTitle(request.message);

				// Import the API at runtime to avoid circular dependencies
				const { api } = await import("../_generated/api");

				const ideaId = await ctx.runMutation(api.ideas.create, {
					workspaceId: request.workspaceId,
					title,
					contentMD: text,
				});

				return {
					...baseResponse,
					action: "navigate",
					target: `/ideas/${ideaId}/edit`,
					ideaId,
				};
			} catch (error) {
				console.error("Failed to create idea:", error);
				// Return response with error note
				return {
					...baseResponse,
					text:
						text +
						"\n\n(Note: I couldn't automatically create the idea, but you can copy this content manually)",
				};
			}
		}

		return baseResponse;
	}

	/**
	 * Detect if message is requesting idea creation
	 */
	private detectIdeaCreationIntent(message: string): boolean {
		const lowerMessage = message.toLowerCase();
		return (
			lowerMessage.includes("idea") &&
			(lowerMessage.includes("create") ||
				lowerMessage.includes("add") ||
				lowerMessage.includes("new"))
		);
	}

	/**
	 * Extract idea title from natural language
	 */
	private extractIdeaTitle(message: string): string {
		const patterns = [
			/create.*idea.*about\s+(.+)/i,
			/add.*idea.*about\s+(.+)/i,
			/new.*idea.*about\s+(.+)/i,
			/create.*idea.*["']([^"']+)["']/i,
			/add.*idea.*["']([^"']+)["']/i,
		];

		for (const pattern of patterns) {
			const match = message.match(pattern);
			if (match?.[1]) {
				return match[1].trim().substring(0, 200);
			}
		}

		// Fallback: extract meaningful words
		const words = message
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
}
