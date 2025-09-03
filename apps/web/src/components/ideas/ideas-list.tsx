import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useQuery } from "convex/react";
import { Button } from "flowbite-react";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IdeaCard } from "./idea-card";
import { IdeaForm } from "./idea-form";

interface IdeasListProps {
	workspaceId: Id<"workspaces">;
	projectId?: Id<"projects">;
	folderId?: Id<"folders">;
}

export function IdeasList({
	workspaceId,
	projectId,
	folderId,
}: IdeasListProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [status, setStatus] = useState<
		"draft" | "active" | "archived" | undefined
	>();

	// Get ideas with filters
	const ideas = useQuery(api.ideas.list, {
		workspaceId,
		projectId,
		folderId,
		status,
		limit: 50,
	});

	// Get search results if query provided
	const searchResults = useQuery(
		api.ideas.search,
		searchQuery.trim() ? { workspaceId, query: searchQuery.trim() } : "skip",
	);

	const displayedIdeas = searchQuery.trim() ? searchResults : ideas;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl text-gray-900 dark:text-white">
						Ideas
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Capture and organize your ideas
					</p>
				</div>
				<Button color="blue" onClick={() => setIsCreating(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Idea
				</Button>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Search ideas..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex gap-2">
							<Button
								color={status === undefined ? "blue" : "gray"}
								outline={status !== undefined}
								size="sm"
								onClick={() => setStatus(undefined)}
							>
								All
							</Button>
							<Button
								color={status === "draft" ? "blue" : "gray"}
								outline={status !== "draft"}
								size="sm"
								onClick={() => setStatus("draft")}
							>
								Draft
							</Button>
							<Button
								color={status === "active" ? "blue" : "gray"}
								outline={status !== "active"}
								size="sm"
								onClick={() => setStatus("active")}
							>
								Active
							</Button>
							<Button
								color={status === "archived" ? "blue" : "gray"}
								outline={status !== "archived"}
								size="sm"
								onClick={() => setStatus("archived")}
							>
								Archived
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Create Form */}
			{isCreating && (
				<IdeaForm
					workspaceId={workspaceId}
					projectId={projectId}
					folderId={folderId}
					onClose={() => setIsCreating(false)}
				/>
			)}

			{/* Ideas Grid */}
			{displayedIdeas === undefined ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{/* Loading skeletons */}
					{Array.from({ length: 6 }, (_, i) => i).map((index) => (
						<Card key={`loading-skeleton-${index}`} className="animate-pulse">
							<CardHeader>
								<div className="h-4 rounded bg-gray-200" />
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="h-3 rounded bg-gray-200" />
									<div className="h-3 w-2/3 rounded bg-gray-200" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : displayedIdeas.length === 0 ? (
				<Card>
					<CardContent className="p-8 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
							<Plus className="h-6 w-6 text-gray-400" />
						</div>
						<h3 className="mb-2 font-medium text-gray-900 dark:text-white">
							{searchQuery.trim() ? "No ideas found" : "No ideas yet"}
						</h3>
						<p className="mb-4 text-gray-600 dark:text-gray-400">
							{searchQuery.trim()
								? `No ideas match "${searchQuery}"`
								: "Get started by creating your first idea"}
						</p>
						{!searchQuery.trim() && (
							<Button color="blue" onClick={() => setIsCreating(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Create Idea
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{displayedIdeas.map((idea) => (
						<IdeaCard key={idea._id} idea={idea} workspaceId={workspaceId} />
					))}
				</div>
			)}
		</div>
	);
}
