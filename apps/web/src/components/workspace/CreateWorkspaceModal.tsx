import type { Id } from "@pulse/backend/dataModel";
import { Alert, Button, Modal, Select, TextInput } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import {
	HiExclamationCircle,
	HiOfficeBuilding,
	HiSparkles,
	HiX,
} from "react-icons/hi";
import { toast } from "sonner";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import { useCreateSharedWorkspace } from "@/hooks/use-workspaces";

interface CreateWorkspaceModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateWorkspaceModal: FC<CreateWorkspaceModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [plan, setPlan] = useState<"free" | "team">("free");
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pendingWorkspaceId, setPendingWorkspaceId] =
		useState<Id<"workspaces"> | null>(null);

	const createWorkspaceMutation = useCreateSharedWorkspace();
	const { switchWorkspace, workspaces } = useWorkspaceContext();
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Watch for the newly created workspace to appear in the list
	useEffect(() => {
		if (pendingWorkspaceId) {
			const workspace = workspaces.find((w) => w._id === pendingWorkspaceId);
			if (workspace) {
				// Workspace is now available in the list, switch to it
				switchWorkspace(pendingWorkspaceId);
				setPendingWorkspaceId(null);
			} else {
				// Set a timeout to give up waiting after 5 seconds
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
				timeoutRef.current = setTimeout(() => {
					console.warn("Timeout waiting for workspace to appear in list");
					setPendingWorkspaceId(null);
				}, 5000);
			}
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [pendingWorkspaceId, workspaces, switchWorkspace]);

	// Auto-generate slug from name
	const handleNameChange = (value: string) => {
		setName(value);
		// Generate slug: lowercase, replace spaces/special chars with hyphens
		const generatedSlug = value
			.toLowerCase()
			.replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.replace(/-+/g, "-") // Replace multiple hyphens with single
			.replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
		setSlug(generatedSlug);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !slug.trim()) return;

		setIsCreating(true);
		setError(null);

		createWorkspaceMutation.mutate(
			{
				name: name.trim(),
				slug: slug.trim(),
				plan,
			},
			{
				onSuccess: (newWorkspace) => {
					toast.success(`${name} workspace created successfully!`);

					// Reset form and close modal first
					setName("");
					setSlug("");
					setPlan("free");
					setError(null);
					setIsCreating(false);
					onClose();

					// Set the pending workspace ID to wait for it to appear in the list
					if (newWorkspace?._id) {
						setPendingWorkspaceId(newWorkspace._id);
					}
				},
				onError: (err) => {
					console.error("Failed to create workspace:", err);

					if (err instanceof Error) {
						if (err.message.includes("Slug is already taken")) {
							setError(
								"This workspace name is already taken. Please try a different one.",
							);
						} else if (err.message.includes("Workspace name is required")) {
							setError("Please enter a workspace name.");
						} else {
							setError(err.message);
						}
					} else {
						setError("Failed to create workspace. Please try again.");
					}
					setIsCreating(false);
				},
			},
		);
	};

	const handleClose = () => {
		setName("");
		setSlug("");
		setPlan("free");
		setError(null);
		setPendingWorkspaceId(null);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		onClose();
	};

	return (
		<Modal show={isOpen} onClose={handleClose} size="md">
			<div className="flex items-center justify-between border-gray-200 border-b p-6 dark:border-gray-600">
				<div className="flex items-center space-x-2">
					<HiOfficeBuilding className="h-5 w-5 text-blue-600" />
					<span className="font-semibold text-gray-900 text-lg dark:text-white">
						Create Team Workspace
					</span>
				</div>
				<button
					type="button"
					onClick={handleClose}
					className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-gray-400 text-sm hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
				>
					<HiX className="h-3 w-3" />
				</button>
			</div>

			<div className="p-6">
				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<Alert color="failure" icon={HiExclamationCircle}>
							{error}
						</Alert>
					)}

					<div>
						<label
							htmlFor="workspace-name"
							className="mb-2 block font-medium text-gray-900 text-sm dark:text-white"
						>
							Workspace Name
						</label>
						<TextInput
							id="workspace-name"
							type="text"
							placeholder="My Company"
							value={name}
							onChange={(e) => handleNameChange(e.target.value)}
							required
							disabled={isCreating}
							maxLength={100}
						/>
						<p className="mt-1 text-gray-500 text-xs dark:text-gray-400">
							This will be visible to all team members
						</p>
					</div>

					<div>
						<label
							htmlFor="workspace-slug"
							className="mb-2 block font-medium text-gray-900 text-sm dark:text-white"
						>
							Workspace URL
						</label>
						<div className="flex">
							<span className="inline-flex items-center rounded-l-md border border-gray-300 border-r-0 bg-gray-200 px-3 text-gray-900 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400">
								pulse.app/w/
							</span>
							<TextInput
								id="workspace-slug"
								type="text"
								placeholder="my-company"
								value={slug}
								onChange={(e) => setSlug(e.target.value.toLowerCase())}
								required
								disabled={isCreating}
								className="rounded-l-none"
								maxLength={50}
								pattern="[a-z0-9-]+"
								title="Only lowercase letters, numbers, and hyphens are allowed"
							/>
						</div>
						<p className="mt-1 text-gray-500 text-xs dark:text-gray-400">
							Choose a unique URL for your workspace
						</p>
					</div>

					<div>
						<label
							htmlFor="workspace-plan"
							className="mb-2 block font-medium text-gray-900 text-sm dark:text-white"
						>
							Plan
						</label>
						<Select
							id="workspace-plan"
							value={plan}
							onChange={(e) => setPlan(e.target.value as "free" | "team")}
							disabled={isCreating}
						>
							<option value="free">Free - Up to 5 members</option>
							<option value="team">
								Team - Unlimited members, advanced features
							</option>
						</Select>

						{plan === "team" && (
							<div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
								<div className="flex items-center space-x-2">
									<HiSparkles className="h-4 w-4 text-blue-600" />
									<span className="font-medium text-blue-800 text-sm dark:text-blue-200">
										Team Plan Features
									</span>
								</div>
								<ul className="mt-1 list-inside list-disc text-blue-700 text-xs dark:text-blue-300">
									<li>Unlimited team members</li>
									<li>Advanced project management</li>
									<li>Team analytics and insights</li>
									<li>Priority support</li>
								</ul>
							</div>
						)}
					</div>
				</form>
			</div>

			<div className="flex items-center justify-end space-x-3 border-gray-200 border-t p-6 dark:border-gray-600">
				<Button color="gray" onClick={handleClose} disabled={isCreating}>
					Cancel
				</Button>
				<button
					type="submit"
					onClick={handleSubmit}
					disabled={!name.trim() || !slug.trim() || isCreating}
					className={`rounded-lg border border-transparent bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:focus:ring-blue-800 dark:hover:bg-blue-700 ${isCreating ? "flex items-center" : ""}`}
				>
					{isCreating && (
						<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
					)}
					Create Workspace
				</button>
			</div>
		</Modal>
	);
};
