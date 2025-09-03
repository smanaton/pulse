import type {
	Block as BlockNoteBlock,
	BlockNoteEditor,
	PartialBlock,
} from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

// Use BlockNote's official types
type Block = BlockNoteBlock;
type HeadingBlock = Block & {
	type: "heading";
	props: {
		level: 1 | 2 | 3 | 4 | 5 | 6;
		// biome-ignore lint/suspicious/noExplicitAny: BlockNote requires flexible props
		[key: string]: any;
	};
};

/**
 * Hook to integrate BlockNote editor with Convex real-time sync
 */
export function useBlockNoteSync(ideaId: Id<"ideas">) {
	const [isLoading, setIsLoading] = useState(true);
	const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
	const [initialContent, setInitialContent] = useState<Block[] | null>(null);

	// Fetch the idea content
	const idea = useQuery(api.ideas.get, { ideaId });
	const updateIdea = useMutation(api.ideas.update);

	// Initialize content when idea loads
	useEffect(() => {
		if (idea && isLoading) {
			try {
				// Try to parse existing block content
				const blocks = idea.contentBlocks
					? JSON.parse(idea.contentBlocks)
					: [{ type: "paragraph", content: idea.contentMD || "" }];

				setInitialContent(blocks);
			} catch (_error) {
				// Fallback to markdown content if blocks parsing fails
				const fallbackBlocks: PartialBlock[] = idea.contentMD
					? [
							{
								type: "paragraph",
							},
						]
					: [
							{
								type: "paragraph",
							},
						];

				setInitialContent(fallbackBlocks as Block[]);
			}
			setIsLoading(false);
		}
	}, [idea, isLoading]);

	// Auto-save function with debouncing
	const saveContent = useCallback(
		async (blocks: Block[]) => {
			if (!idea) return;

			try {
				// Convert blocks to markdown for backward compatibility
				const markdown = blocksToMarkdown(blocks);

				await updateIdea({
					ideaId: idea._id,
					contentMD: markdown,
					contentBlocks: JSON.stringify(blocks),
				});
			} catch (error) {
				console.error("Failed to save content:", error);
			}
		},
		[idea, updateIdea],
	);

	// Create BlockNote editor
	const blockNoteEditor = useCreateBlockNote({
		initialContent: (initialContent as PartialBlock[]) || undefined,
	});

	// Set editor when BlockNote editor is ready
	useEffect(() => {
		if (blockNoteEditor && !editor) {
			setEditor(blockNoteEditor);
		}
	}, [blockNoteEditor, editor]);

	// Create a new document function
	const create = useCallback(
		async (initialBlocks: Block[]) => {
			if (!idea) return;

			try {
				const markdown = blocksToMarkdown(initialBlocks);
				await updateIdea({
					ideaId: idea._id,
					contentMD: markdown,
					contentBlocks: JSON.stringify(initialBlocks),
				});
				setInitialContent(initialBlocks);
			} catch (error) {
				console.error("Failed to create content:", error);
			}
		},
		[idea, updateIdea],
	);

	// Content change handler for BlockNoteView
	const handleChange = useCallback(() => {
		if (blockNoteEditor) {
			const blocks = blockNoteEditor.document as Block[];
			if (blocks.length > 0) {
				// Simple debouncing - save after 1 second of inactivity
				setTimeout(() => {
					saveContent(blocks);
				}, 1000);
			}
		}
	}, [blockNoteEditor, saveContent]);

	return {
		editor,
		isLoading,
		initialContent,
		create,
		onChange: handleChange,
	};
}

/**
 * Simple function to convert BlockNote blocks to markdown
 * This is a basic implementation - you could use a more sophisticated converter
 */
function blocksToMarkdown(blocks: Block[]): string {
	return blocks
		.map((block) => {
			switch (block.type) {
				case "heading": {
					const headingBlock = block as HeadingBlock;
					const level = headingBlock.props?.level || 1;
					const headingPrefix = "#".repeat(level);
					return `${headingPrefix} ${block.content || ""}`;
				}
				case "paragraph":
					return block.content || "";
				case "bulletListItem":
					return `- ${block.content || ""}`;
				case "numberedListItem":
					return `1. ${block.content || ""}`;
				case "codeBlock":
					return `\`\`\`\n${block.content || ""}\n\`\`\``;
				case "quote":
					return `> ${block.content || ""}`;
				default:
					return block.content || "";
			}
		})
		.join("\n\n");
}
