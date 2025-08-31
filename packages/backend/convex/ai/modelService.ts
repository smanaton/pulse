/**
 * AI Model Service
 * 
 * Handles communication with AI models (Ollama and LiteLLM)
 * Single responsibility: AI model interaction
 */

import OpenAI from "openai";
import type { ActionCtx } from "../_generated/server";
import { AI_MODEL_CONFIGS, SYSTEM_PROMPTS, getModelConfig } from "./config";
import { AIError, type AIRequest, type AIResponse } from "./types";

export class AIModelService {
  
  /**
   * Call AI model with fallback logic
   */
  async callModel(ctx: ActionCtx, request: AIRequest): Promise<AIResponse> {
    const modelConfig = getModelConfig(request.model, request.usePrivacy);
    
    // Try LiteLLM first if available
    if (process.env.LITELLM_BASE_URL) {
      try {
        return await this.callLiteLLM(ctx, request, modelConfig);
      } catch (error) {
        console.error("LiteLLM failed, falling back to Ollama:", error);
      }
    }
    
    // Fallback to direct Ollama
    if (process.env.OLLAMA_BASE_URL) {
      return await this.callOllama(ctx, request, modelConfig);
    }
    
    throw new AIError(
      "MODEL_UNAVAILABLE",
      "No AI models available. Configure LITELLM_BASE_URL or OLLAMA_BASE_URL"
    );
  }

  /**
   * Call LiteLLM proxy
   */
  private async callLiteLLM(
    ctx: ActionCtx, 
    request: AIRequest, 
    modelConfig: typeof AI_MODEL_CONFIGS[keyof typeof AI_MODEL_CONFIGS]
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

      const text = completion.choices[0]?.message?.content || 
        "I couldn't generate a response.";

      return await this.processResponse(ctx, request, text, modelConfig.liteLLMModel);
    } catch (error) {
      throw new AIError("AI_ERROR", "LiteLLM request failed", error as Error);
    }
  }

  /**
   * Call Ollama directly
   */
  private async callOllama(
    ctx: ActionCtx,
    request: AIRequest,
    modelConfig: typeof AI_MODEL_CONFIGS[keyof typeof AI_MODEL_CONFIGS]
  ): Promise<AIResponse> {
    const prompt = `${SYSTEM_PROMPTS.general}\n\nUser: ${request.message}\n\nAI:`;

    try {
      const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelConfig.ollamaModel,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.response || "I couldn't generate a response.";

      return await this.processResponse(ctx, request, text, modelConfig.ollamaModel);
    } catch (error) {
      throw new AIError("AI_ERROR", "Ollama request failed", error as Error);
    }
  }

  /**
   * Process AI response and handle idea creation
   */
  private async processResponse(
    ctx: ActionCtx,
    request: AIRequest,
    text: string,
    model: string
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
          text: text + "\n\n(Note: I couldn't automatically create the idea, but you can copy this content manually)",
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
    return lowerMessage.includes("idea") && (
      lowerMessage.includes("create") ||
      lowerMessage.includes("add") ||
      lowerMessage.includes("new")
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
      .filter(word => 
        word.length > 2 &&
        !["create", "add", "new", "idea", "about", "the", "a", "an", "and", "or", "for"]
          .includes(word.toLowerCase())
      );

    return words.slice(0, 6).join(" ") || "New Idea";
  }
}