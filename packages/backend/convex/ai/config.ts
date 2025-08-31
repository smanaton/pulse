/**
 * AI System Configuration
 * 
 * Centralized configuration for AI models and policies
 */

import type { AIModel, AIModelConfig, AIPolicy } from "./types";

// Model Configuration Map
export const AI_MODEL_CONFIGS: Record<AIModel, AIModelConfig> = {
  fast: {
    name: "fast",
    displayName: "Fast (SmolLM)",
    ollamaModel: "llama3.2:1b",
    liteLLMModel: "ollama/smollm:135m",
    maxTokens: 1000,
    temperature: 0.7,
  },
  main: {
    name: "main", 
    displayName: "Balanced (Llama 3.2)",
    ollamaModel: "llama3.2:1b",
    liteLLMModel: "ollama/llama3.2:1b",
    maxTokens: 2000,
    temperature: 0.7,
  },
  enhanced: {
    name: "enhanced",
    displayName: "Enhanced (Qwen3 4B)",
    ollamaModel: "hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M",
    liteLLMModel: "ollama/hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M", 
    maxTokens: 2000,
    temperature: 0.7,
  },
  creative: {
    name: "creative",
    displayName: "Creative (Qwen3 4B)",
    ollamaModel: "hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M",
    liteLLMModel: "ollama/hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M",
    maxTokens: 2000,
    temperature: 0.9,
  },
  documents: {
    name: "documents", 
    displayName: "Documents (Qwen3 4B)",
    ollamaModel: "hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M",
    liteLLMModel: "ollama/hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M",
    maxTokens: 2000,
    temperature: 0.3,
  },
};

// AI Policy Limits by Plan
export const AI_POLICIES: AIPolicy = {
  free: {
    dailyTokenLimit: 5000,
    dailySummaries: 5,
    dailyTagSuggestions: 10,
  },
  team: {
    dailyTokenLimit: 50000,
    dailySummaries: 100,
    dailyTagSuggestions: 200,
  },
  default: {
    dailyTokenLimit: 1000,
    dailySummaries: 2,
    dailyTagSuggestions: 5,
  },
};

// System Prompts
export const SYSTEM_PROMPTS = {
  general: `You are Pulse AI, an intelligent assistant for idea management and productivity. Help users organize their thoughts, create ideas, and manage their workspace efficiently.

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

  summarization: `You are a helpful assistant that creates concise summaries of ideas. Focus on key points, implementation considerations, and next steps. Keep summaries under 3 sentences.`,

  tagSuggestion: `You are a helpful assistant that suggests relevant tags for ideas. Return only 3-5 short, hyphenated tags (e.g., 'bug-fix', 'feature', 'ui-ux'). Prefer existing workspace tags when relevant. Return only the tag names, one per line, no explanations.`,
};

// Utility Functions
export function getAIPolicyLimits(plan: string) {
  return AI_POLICIES[plan as keyof AIPolicy] || AI_POLICIES.default;
}

export function getModelConfig(model?: AIModel, usePrivacy?: boolean): AIModelConfig {
  if (usePrivacy) {
    return AI_MODEL_CONFIGS.fast;
  }
  
  return AI_MODEL_CONFIGS[model || "main"];
}