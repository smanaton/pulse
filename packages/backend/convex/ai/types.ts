/**
 * AI System Types
 *
 * Centralized type definitions for the AI system
 */

import type { Id } from "../_generated/dataModel";

// AI Model Configuration
export type AIModel =
	| "fast" // ollama/smollm:135m
	| "main" // ollama/llama3.2:1b
	| "enhanced" // ollama/hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M
	| "creative" // ollama/hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M
	| "documents"; // ollama/hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M

export interface AIModelConfig {
	name: string;
	displayName: string;
	ollamaModel: string;
	liteLLMModel: string;
	maxTokens: number;
	temperature: number;
}

// AI Request/Response Types
export interface AIRequest {
	workspaceId: Id<"workspaces">;
	message: string;
	userId: string;
	usePrivacy?: boolean;
	model?: AIModel;
}

export interface AIResponse {
	text: string;
	model: string;
	message?: string; // For backward compatibility
	action?: "navigate" | "create_idea";
	target?: string;
	ideaId?: Id<"ideas">;
	tokensUsed?: number;
	error?: boolean;
}

// AI Policy Configuration
export interface AIPolicyLimits {
	dailyTokenLimit: number;
	dailySummaries: number;
	dailyTagSuggestions: number;
}

export interface AIPolicy {
	free: AIPolicyLimits;
	team: AIPolicyLimits;
	default: AIPolicyLimits;
}

// Service Interfaces
export interface AIModelService {
	callModel(request: AIRequest): Promise<AIResponse>;
}

export interface AIContentService {
	summarizeIdea(title: string, content: string): Promise<string>;
	suggestTags(
		title: string,
		content: string,
		existingTags: string[],
	): Promise<string[]>;
}

// OpenAI Specific Types
export interface OpenAIMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface OpenAIRequest {
	model: string;
	messages: OpenAIMessage[];
	temperature: number;
	max_tokens: number;
}

// Error Types
export type AIErrorCode =
	| "AI_ERROR"
	| "RATE_LIMITED"
	| "MODEL_UNAVAILABLE"
	| "INVALID_REQUEST";

export class AIError extends Error {
	constructor(
		public code: AIErrorCode,
		message: string,
		public cause?: Error,
	) {
		super(message);
		this.name = "AIError";
	}
}
