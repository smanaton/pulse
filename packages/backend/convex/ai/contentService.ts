/**
 * AI Content Service
 *
 * Handles content-specific AI operations like summarization and tag suggestions
 * Single responsibility: Content analysis and generation
 */

import OpenAI from "openai";
import { SYSTEM_PROMPTS } from "./config";
import type { AIContentService } from "./types";

export class AIContentServiceImpl implements AIContentService {
	private openai: OpenAI | null = null;

	/**
	 * Lazy-initialize OpenAI client. If a LiteLLM proxy is configured via
	 * LITELLM_BASE_URL, prefer that as baseURL. Use a harmless dummy key when
	 * none is present so the client can be constructed during static analysis
	 * (avoids Convex push failures).
	 */
	private getOpenAI(): OpenAI {
		if (this.openai) return this.openai;

		const baseURL = process.env.LITELLM_BASE_URL;
		const apiKey = process.env.OPENAI_API_KEY || "dummy-key";

		this.openai = new OpenAI({ apiKey, baseURL });
		return this.openai;
	}

	/**
	 * Generate AI summary for idea content
	 */
	async summarizeIdea(title: string, content: string): Promise<string> {
		// In test environment, return a deterministic short summary to avoid
		// network calls and flakiness.
		if (process.env.NODE_ENV === "test") {
			return `Summary of "${title}": ${String(content).slice(0, 120)}`;
		}
		try {
			const openai = this.getOpenAI();
			const response = await openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: SYSTEM_PROMPTS.summarization },
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
			// Fallback to basic summary
			return this.generateFallbackSummary(title, content);
		}
	}

	/**
	 * Generate AI tag suggestions for idea content
	 */
	async suggestTags(
		title: string,
		content: string,
		existingTags: string[],
	): Promise<string[]> {
		// Avoid external calls in tests
		if (process.env.NODE_ENV === "test") {
			const fallback = ["feature", "improvement", "productivity"].filter(
				(t) => !existingTags.map((e) => e.toLowerCase()).includes(t),
			);
			return fallback.slice(0, 5);
		}
		try {
			const existingTagsStr =
				existingTags.length > 0
					? `\n\nExisting tags in this workspace: ${existingTags.join(", ")}`
					: "";

			const openai = this.getOpenAI();
			const response = await openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: SYSTEM_PROMPTS.tagSuggestion },
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

			return this.prioritizeTags(suggestedTags, existingTags);
		} catch (error) {
			console.error("OpenAI tag suggestions failed:", error);
			// Fallback to simple suggestions
			return this.generateFallbackTags();
		}
	}

	/**
	 * Generate fallback summary when AI fails
	 */
	private generateFallbackSummary(title: string, content: string): string {
		const truncatedContent = content.slice(0, 100);
		const suffix = content.length > 100 ? "..." : "";
		return `Summary of "${title}": ${truncatedContent}${suffix}`;
	}

	/**
	 * Generate fallback tags when AI fails
	 */
	private generateFallbackTags(): string[] {
		return ["feature", "improvement"];
	}

	/**
	 * Prioritize existing tags over new ones
	 */
	private prioritizeTags(
		suggestedTags: string[],
		existingTags: string[],
	): string[] {
		const lowerExistingTags = existingTags.map((tag) => tag.toLowerCase());

		const existingMatches = suggestedTags.filter((tag) =>
			lowerExistingTags.includes(tag),
		);

		const newSuggestions = suggestedTags.filter(
			(tag) => !lowerExistingTags.includes(tag),
		);

		return [...existingMatches.slice(0, 2), ...newSuggestions.slice(0, 3)];
	}
}
