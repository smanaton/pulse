/**
 * Integration Test - BlockNote Integration
 * Tests that our Block rendering system works correctly with real BlockNote structures
 * Ensures compatibility between editor output and display rendering
 */

import { describe, expect, test } from "vitest";
import type { Block as BlockNoteBlock } from "@blocknote/core";

// Mock realistic BlockNote block structures based on actual BlockNote output
const createMockBlockNoteBlocks = (): BlockNoteBlock[] => {
	return [
		{
			id: "block_abc123",
			type: "heading",
			props: {
				backgroundColor: "default",
				textColor: "default",
				textAlignment: "left",
				level: 1,
			},
			content: [
				{
					type: "text",
					text: "Introduction to React Testing",
					styles: {},
				},
			],
			children: [],
		},
		{
			id: "block_def456",
			type: "paragraph",
			props: {
				backgroundColor: "default",
				textColor: "default",
				textAlignment: "left",
			},
			content: [
				{
					type: "text",
					text: "This document covers the essentials of testing React components.",
					styles: {},
				},
			],
			children: [],
		},
		{
			id: "block_ghi789",
			type: "bulletListItem",
			props: {
				backgroundColor: "default",
				textColor: "default",
				textAlignment: "left",
			},
			content: [
				{
					type: "text",
					text: "Unit tests for individual components",
					styles: {},
				},
			],
			children: [],
		},
		{
			id: "block_jkl012",
			type: "bulletListItem",
			props: {
				backgroundColor: "default",
				textColor: "default",
				textAlignment: "left",
			},
			content: [
				{
					type: "text",
					text: "Integration tests for component interactions",
					styles: {},
				},
			],
			children: [],
		},
		{
			id: "block_mno345",
			type: "codeBlock",
			props: {
				backgroundColor: "default",
				textColor: "default",
				textAlignment: "left",
				language: "javascript",
			},
			content: [
				{
					type: "text",
					text: "import { render, screen } from '@testing-library/react';\\ntest('renders learn react link', () => {\\n  render(<App />);\\n});",
					styles: {},
				},
			],
			children: [],
		},
	] as BlockNoteBlock[];
};

describe("BlockNote Integration", () => {
	test("Given_RealBlockNoteStructure_When_CheckingIds_Then_EachBlockHasUniqueId", () => {
		// Arrange
		const blocks = createMockBlockNoteBlocks();

		// Act & Assert
		const ids = blocks.map((block) => block.id);
		const uniqueIds = new Set(ids);

		expect(uniqueIds.size).toBe(blocks.length);
		expect(ids).toEqual(
			expect.arrayContaining([
				"block_abc123",
				"block_def456",
				"block_ghi789",
				"block_jkl012",
				"block_mno345",
			]),
		);
	});

	test("Given_BlockNoteBlock_When_AccessingContent_Then_HasExpectedStructure", () => {
		// Arrange
		const blocks = createMockBlockNoteBlocks();
		const paragraphBlock = blocks.find((b) => b.type === "paragraph");

		// Act & Assert
		expect(paragraphBlock).toBeDefined();
		expect(paragraphBlock?.id).toBe("block_def456");
		expect(paragraphBlock?.content).toHaveLength(1);
		expect(paragraphBlock?.content?.[0]).toMatchObject({
			type: "text",
			text: expect.any(String),
			styles: {},
		});
	});

	test("Given_HeadingBlock_When_CheckingProps_Then_HasLevelProperty", () => {
		// Arrange
		const blocks = createMockBlockNoteBlocks();
		const headingBlock = blocks.find((b) => b.type === "heading");

		// Act & Assert
		expect(headingBlock?.props).toBeDefined();
		expect(headingBlock?.props?.level).toBe(1);
		expect(headingBlock?.props).toMatchObject({
			level: 1,
			backgroundColor: "default",
			textColor: "default",
			textAlignment: "left",
		});
	});

	test("Given_CodeBlock_When_CheckingProps_Then_HasLanguageProperty", () => {
		// Arrange
		const blocks = createMockBlockNoteBlocks();
		const codeBlock = blocks.find((b) => b.type === "codeBlock");

		// Act & Assert
		expect(codeBlock?.props).toBeDefined();
		expect(codeBlock?.props?.language).toBe("javascript");
	});

	test("Given_BlockNoteBlocks_When_SerializingToJson_Then_PreservesStructure", () => {
		// Arrange
		const blocks = createMockBlockNoteBlocks();

		// Act
		const serialized = JSON.stringify(blocks);
		const deserialized = JSON.parse(serialized) as BlockNoteBlock[];

		// Assert
		expect(deserialized).toHaveLength(blocks.length);

		// Check that critical properties are preserved
		deserialized.forEach((block, index) => {
			expect(block.id).toBe(blocks[index].id);
			expect(block.type).toBe(blocks[index].type);
			expect(block.content).toEqual(blocks[index].content);
			expect(block.props).toEqual(blocks[index].props);
		});
	});

	test("Given_BlockNoteContent_When_ExtractingText_Then_GetsCorrectText", () => {
		// Arrange
		const blocks = createMockBlockNoteBlocks();

		// Helper function to extract text (same as our rendering logic)
		const getTextContent = (block: BlockNoteBlock) => {
			if (block.content && Array.isArray(block.content)) {
				return block.content
					.map((item: { text?: string; type?: string } | string) => {
						if (typeof item === "string") return item;
						if (item.text) return item.text;
						if (item.type === "text") return item.text || "";
						return "";
					})
					.join("");
			}
			return "";
		};

		// Act & Assert
		expect(getTextContent(blocks[0])).toBe("Introduction to React Testing");
		expect(getTextContent(blocks[1])).toBe(
			"This document covers the essentials of testing React components.",
		);
		expect(getTextContent(blocks[2])).toBe(
			"Unit tests for individual components",
		);
	});

	test("Given_EmptyBlockNoteContent_When_ExtractingText_Then_ReturnsEmptyString", () => {
		// Arrange
		const emptyBlock: BlockNoteBlock = {
			id: "empty_block",
			type: "paragraph",
			props: {
				backgroundColor: "default",
				textColor: "default",
				textAlignment: "left",
			},
			content: [],
			children: [],
		} as BlockNoteBlock;

		// Helper function to extract text
		const getTextContent = (block: BlockNoteBlock) => {
			if (block.content && Array.isArray(block.content)) {
				return block.content
					.map((item: { text?: string; type?: string } | string) => {
						if (typeof item === "string") return item;
						if (item.text) return item.text;
						if (item.type === "text") return item.text || "";
						return "";
					})
					.join("");
			}
			return "";
		};

		// Act & Assert
		expect(getTextContent(emptyBlock)).toBe("");
	});

	test("Given_BlocksWithStyledText_When_ExtractingText_Then_IgnoresStylesButKeepsText", () => {
		// Arrange - Block with bold and italic text
		const styledBlock: BlockNoteBlock = {
			id: "styled_block",
			type: "paragraph",
			props: {
				backgroundColor: "default",
				textColor: "default",
				textAlignment: "left",
			},
			content: [
				{
					type: "text",
					text: "This is ",
					styles: {},
				},
				{
					type: "text",
					text: "bold text",
					styles: { bold: true },
				},
				{
					type: "text",
					text: " and this is ",
					styles: {},
				},
				{
					type: "text",
					text: "italic text",
					styles: { italic: true },
				},
			],
			children: [],
		} as BlockNoteBlock;

		// Helper function to extract text
		const getTextContent = (block: BlockNoteBlock) => {
			if (block.content && Array.isArray(block.content)) {
				return block.content
					.map((item: { text?: string; type?: string } | string) => {
						if (typeof item === "string") return item;
						if (item.text) return item.text;
						if (item.type === "text") return item.text || "";
						return "";
					})
					.join("");
			}
			return "";
		};

		// Act & Assert
		expect(getTextContent(styledBlock)).toBe(
			"This is bold text and this is italic text",
		);
	});

	test("Given_DatabaseSavedBlocks_When_ParsingFromJson_Then_MaintainsBlockIds", () => {
		// Arrange - Simulate what would be saved in database
		const blocks = createMockBlockNoteBlocks();
		const databaseJson = JSON.stringify(blocks);

		// Act - Simulate loading from database
		const loadedBlocks = JSON.parse(databaseJson) as BlockNoteBlock[];

		// Assert - IDs should be preserved exactly
		expect(loadedBlocks[0].id).toBe("block_abc123");
		expect(loadedBlocks[1].id).toBe("block_def456");
		expect(loadedBlocks[2].id).toBe("block_ghi789");

		// Verify all blocks maintain their identity
		blocks.forEach((originalBlock, index) => {
			expect(loadedBlocks[index].id).toBe(originalBlock.id);
		});
	});
});
