/**
 * AI Functions
 *
 * ✅ Refactored AI system with proper TypeScript types and SRP
 *
 * This file now serves as a clean interface to the modular AI system.
 * All complex logic has been moved to focused modules in ./ai/
 */

// Re-export all AI actions for backward compatibility
export {
	processCommand, // Legacy support
	processMessage,
	suggestTags,
	summarizeIdea,
} from "./ai/actions";

// Export types for frontend use
export type {
	AIModel,
	AIResponse,
} from "./ai/types";
