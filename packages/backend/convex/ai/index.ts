/**
 * AI Module Index
 * 
 * Clean exports for the refactored AI system
 */

// Export all actions (these are the public API)
export { 
  processMessage, 
  summarizeIdea, 
  suggestTags, 
  processCommand 
} from "./actions";

// Export types for use in other modules
export type { 
  AIModel, 
  AIRequest, 
  AIResponse, 
  AIPolicyLimits 
} from "./types";

// Export services for testing or advanced usage
export { AIModelService } from "./modelService";
export { AIContentServiceImpl } from "./contentService";

// Export configuration utilities
export { 
  getAIPolicyLimits, 
  getModelConfig 
} from "./config";