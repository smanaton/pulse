import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useMutation } from "convex/react";
import {
	Dropdown,
	DropdownDivider,
	DropdownHeader,
	DropdownItem,
} from "flowbite-react";
import { Archive, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IdeaDetailModal } from "./idea-detail-modal";

interface IdeaCardProps {
	idea: {
		_id: Id<"ideas">;
		title: string;
		contentMD: string;
		status: "draft" | "active" | "archived";
		createdAt: number;
		updatedAt: number;
	};
	workspaceId: Id<"workspaces">;
}

export function IdeaCard({ idea, workspaceId }: IdeaCardProps) {
	const [showDetail, setShowDetail] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	const updateIdea = useMutation(api.ideas.update);
	const deleteIdea = useMutation(api.ideas.deleteIdea);

	const handleStatusChange = async (
		newStatus: "draft" | "active" | "archived",
	) => {
		if (isUpdating) return;
		setIsUpdating(true);

		try {
			await updateIdea({
				ideaId: idea._id,
				status: newStatus,
			});
			toast.success(
				`Idea ${newStatus === "archived" ? "archived" : `marked as ${newStatus}`}`,
			);
		} catch (error) {
			toast.error("Failed to update idea");
			console.error("Update idea error:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDelete = async () => {
		if (isUpdating) return;
		if (!confirm("Are you sure you want to delete this idea?")) return;

		setIsUpdating(true);
		try {
			await deleteIdea({ ideaId: idea._id });
			toast.success("Idea deleted");
		} catch (error) {
			toast.error("Failed to delete idea");
			console.error("Delete idea error:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "draft":
				return "bg-gray-100 text-gray-800";
			case "active":
				return "bg-blue-100 text-blue-800";
			case "archived":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const truncatedContent =
		idea.contentMD.length > 150
			? `${idea.contentMD.substring(0, 150)}...`
			: idea.contentMD;

	return (
		<>
			<Card
				className="group cursor-pointer transition-shadow hover:shadow-md"
				onClick={() => setShowDetail(true)}
			>
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<CardTitle className="line-clamp-2 text-base leading-tight">
							{idea.title}
						</CardTitle>
						<Dropdown
							label={
								<MoreHorizontal className="h-4 w-4 text-gray-400 hover:text-gray-600" />
							}
							placement="bottom-end"
							onClick={(e: React.MouseEvent) => e.stopPropagation()}
						>
							<DropdownHeader>
								<span className="block text-sm">{idea.title}</span>
							</DropdownHeader>
							<DropdownItem icon={Edit} onClick={() => setShowDetail(true)}>
								Edit
							</DropdownItem>
							<DropdownDivider />
							{idea.status !== "active" && (
								<DropdownItem
									icon={Archive}
									onClick={() => handleStatusChange("active")}
									disabled={isUpdating}
								>
									Mark Active
								</DropdownItem>
							)}
							{idea.status !== "draft" && (
								<DropdownItem
									icon={Edit}
									onClick={() => handleStatusChange("draft")}
									disabled={isUpdating}
								>
									Mark Draft
								</DropdownItem>
							)}
							{idea.status !== "archived" && (
								<DropdownItem
									icon={Archive}
									onClick={() => handleStatusChange("archived")}
									disabled={isUpdating}
								>
									Archive
								</DropdownItem>
							)}
							<DropdownDivider />
							<DropdownItem
								icon={Trash2}
								onClick={() => handleDelete()}
								disabled={isUpdating}
								className="text-red-600 focus:bg-red-50"
							>
								Delete
							</DropdownItem>
						</Dropdown>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="space-y-3">
						{/* Status Badge */}
						<span
							className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${getStatusColor(idea.status)}`}
						>
							{idea.status}
						</span>

						{/* Content Preview */}
						<p className="line-clamp-3 text-gray-600 text-sm">
							{truncatedContent || "No content"}
						</p>

						{/* Metadata */}
						<div className="flex items-center justify-between text-gray-500 text-xs">
							<span>
								Created {new Date(idea.createdAt).toLocaleDateString()}
							</span>
							{idea.updatedAt !== idea.createdAt && (
								<span>
									Updated {new Date(idea.updatedAt).toLocaleDateString()}
								</span>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Detail Modal */}
			{showDetail && (
				<IdeaDetailModal
					idea={idea}
					workspaceId={workspaceId}
					onClose={() => setShowDetail(false)}
				/>
			)}
		</>
	);
}
