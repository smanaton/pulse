import type { Id } from "@pulse/backend/dataModel";
import {
	Badge,
	Button,
	Card,
	Dropdown,
	Label,
	Modal,
	Progress,
	TextInput,
} from "flowbite-react";
import {
	Archive,
	Calendar,
	Download,
	Eye,
	File,
	FileAudio,
	FileText,
	FileVideo,
	Image,
	MoreHorizontal,
	Plus,
	Search,
	Trash2,
	Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

interface ProjectFile {
	_id: string;
	name: string;
	type: string;
	size: number;
	mimeType: string;
	uploadedBy: {
		_id: Id<"users">;
		name?: string;
		email?: string;
		image?: string;
	};
	uploadedAt: number;
	description?: string;
	tags?: string[];
	downloadCount?: number;
}

interface ProjectFilesTableProps {
	projectId?: Id<"projects">;
	files?: ProjectFile[];
	onUpload?: (files: FileList) => Promise<void>;
	onDelete?: (fileId: string) => Promise<void>;
	onDownload?: (fileId: string) => void;
	isLoading?: boolean;
}

function getFileIcon(mimeType: string, fileName: string) {
	if (mimeType.startsWith("image/")) return Image;
	if (mimeType.startsWith("video/")) return FileVideo;
	if (mimeType.startsWith("audio/")) return FileAudio;
	if (mimeType.includes("pdf")) return FileText;
	if (
		mimeType.includes("zip") ||
		mimeType.includes("rar") ||
		mimeType.includes("tar")
	)
		return Archive;

	// Check by extension
	const ext = fileName.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "txt":
		case "md":
		case "doc":
		case "docx":
			return FileText;
		case "jpg":
		case "jpeg":
		case "png":
		case "gif":
		case "svg":
			return Image;
		case "mp4":
		case "avi":
		case "mov":
			return FileVideo;
		case "mp3":
		case "wav":
		case "flac":
			return FileAudio;
		case "zip":
		case "rar":
		case "7z":
			return Archive;
		default:
			return File;
	}
}

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return Number.parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
}

function getFileTypeLabel(mimeType: string, fileName: string): string {
	if (mimeType.includes("pdf")) return "PDF";
	if (mimeType.startsWith("image/"))
		return mimeType.split("/")[1].toUpperCase();
	if (mimeType.startsWith("video/"))
		return mimeType.split("/")[1].toUpperCase();
	if (mimeType.startsWith("audio/"))
		return mimeType.split("/")[1].toUpperCase();

	const ext = fileName.split(".").pop()?.toUpperCase();
	return ext || "FILE";
}

export function ProjectFilesTable({
	projectId,
	files = [],
	onUpload,
	onDelete,
	onDownload,
	isLoading = false,
}: ProjectFilesTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [uploadModalOpen, setUploadModalOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	// Mock file data for demo purposes
	const mockFiles: ProjectFile[] = useMemo(
		() => [
			{
				_id: "1",
				name: "Project_Requirements.pdf",
				type: "document",
				size: 2457600, // 2.4 MB
				mimeType: "application/pdf",
				uploadedBy: {
					_id: "user1" as Id<"users">,
					name: "John Doe",
					email: "john@example.com",
				},
				uploadedAt: Date.now() - 86400000, // 1 day ago
				description: "Initial project requirements and specifications",
				tags: ["requirements", "planning"],
				downloadCount: 12,
			},
			{
				_id: "2",
				name: "wireframes.sketch",
				type: "design",
				size: 15728640, // 15 MB
				mimeType: "application/octet-stream",
				uploadedBy: {
					_id: "user2" as Id<"users">,
					name: "Jane Smith",
					email: "jane@example.com",
				},
				uploadedAt: Date.now() - 172800000, // 2 days ago
				description: "UI wireframes and mockups",
				tags: ["design", "ui"],
				downloadCount: 8,
			},
			{
				_id: "3",
				name: "demo_video.mp4",
				type: "video",
				size: 52428800, // 50 MB
				mimeType: "video/mp4",
				uploadedBy: {
					_id: "user3" as Id<"users">,
					name: "Bob Wilson",
					email: "bob@example.com",
				},
				uploadedAt: Date.now() - 259200000, // 3 days ago
				description: "Product demo and walkthrough",
				tags: ["demo", "presentation"],
				downloadCount: 25,
			},
		],
		[],
	);

	const displayFiles = files.length > 0 ? files : mockFiles;

	const filteredFiles = useMemo(() => {
		if (!searchQuery) return displayFiles;

		const query = searchQuery.toLowerCase();
		return displayFiles.filter(
			(file) =>
				file.name.toLowerCase().includes(query) ||
				file.description?.toLowerCase().includes(query) ||
				file.tags?.some((tag) => tag.toLowerCase().includes(query)),
		);
	}, [displayFiles, searchQuery]);

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (!files || !onUpload) return;

		setUploading(true);
		setUploadProgress(0);

		try {
			// Simulate upload progress
			const progressInterval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return prev;
					}
					return prev + 10;
				});
			}, 200);

			await onUpload(files);

			clearInterval(progressInterval);
			setUploadProgress(100);

			setTimeout(() => {
				setUploading(false);
				setUploadProgress(0);
				setUploadModalOpen(false);
			}, 500);
		} catch (error) {
			console.error("Upload failed:", error);
			setUploading(false);
			setUploadProgress(0);
		}
	};

	const handleDeleteFile = async (fileId: string) => {
		if (!onDelete) return;

		const file = displayFiles.find((f) => f._id === fileId);
		if (confirm(`Are you sure you want to delete "${file?.name}"?`)) {
			try {
				await onDelete(fileId);
			} catch (error) {
				console.error("Delete failed:", error);
			}
		}
	};

	if (isLoading) {
		return (
			<Card>
				<div className="animate-pulse space-y-4">
					<div className="flex items-center justify-between">
						<div className="h-6 w-48 rounded bg-gray-200" />
						<div className="h-10 w-32 rounded bg-gray-200" />
					</div>
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className="flex items-center space-x-4 rounded border p-4"
						>
							<div className="h-10 w-10 rounded bg-gray-200" />
							<div className="flex-1 space-y-2">
								<div className="h-4 w-3/4 rounded bg-gray-200" />
								<div className="h-3 w-1/2 rounded bg-gray-200" />
							</div>
						</div>
					))}
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<Card>
				<div className="flex flex-col space-y-4">
					{/* Header */}
					<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<div>
							<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
								Files and Assets
							</h3>
							<p className="text-gray-500 text-sm dark:text-gray-400">
								Manage project files, documents, and assets
							</p>
						</div>
						<Button onClick={() => setUploadModalOpen(true)}>
							<Upload className="mr-2 h-4 w-4" />
							Upload Files
						</Button>
					</div>

					{/* Search */}
					<div className="relative max-w-md">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
						<TextInput
							type="search"
							placeholder="Search files..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Files List */}
					<div className="space-y-2">
						{filteredFiles.length === 0 ? (
							<div className="py-8 text-center">
								<File className="mx-auto mb-4 h-16 w-16 text-gray-400" />
								<h4 className="mb-2 font-medium text-gray-900 text-lg dark:text-white">
									No files found
								</h4>
								<p className="mb-4 text-gray-500 dark:text-gray-400">
									{searchQuery
										? "Try adjusting your search terms."
										: "Upload your first file to get started."}
								</p>
								{!searchQuery && (
									<Button onClick={() => setUploadModalOpen(true)}>
										<Upload className="mr-2 h-4 w-4" />
										Upload Files
									</Button>
								)}
							</div>
						) : (
							filteredFiles.map((file) => {
								const FileIcon = getFileIcon(file.mimeType, file.name);
								const fileTypeLabel = getFileTypeLabel(
									file.mimeType,
									file.name,
								);

								return (
									<div
										key={file._id}
										className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
									>
										<div className="flex min-w-0 flex-1 items-center space-x-4">
											<div className="flex-shrink-0">
												<FileIcon className="h-8 w-8 text-gray-500" />
											</div>

											<div className="min-w-0 flex-1">
												<div className="mb-1 flex items-center space-x-3">
													<h4 className="truncate font-medium text-gray-900 dark:text-white">
														{file.name}
													</h4>
													<Badge color="gray" size="xs">
														{fileTypeLabel}
													</Badge>
													{file.downloadCount && (
														<span className="text-gray-500 text-xs">
															{file.downloadCount} downloads
														</span>
													)}
												</div>

												<div className="flex items-center space-x-4 text-gray-500 text-sm dark:text-gray-400">
													<span>{formatFileSize(file.size)}</span>
													<span>•</span>
													<span>
														{file.uploadedBy.name || file.uploadedBy.email}
													</span>
													<span>•</span>
													<div className="flex items-center space-x-1">
														<Calendar className="h-3 w-3" />
														<span>
															{new Date(file.uploadedAt).toLocaleDateString()}
														</span>
													</div>
												</div>

												{file.description && (
													<p className="mt-1 truncate text-gray-600 text-sm dark:text-gray-400">
														{file.description}
													</p>
												)}

												{file.tags && file.tags.length > 0 && (
													<div className="mt-2 flex flex-wrap gap-1">
														{file.tags.map((tag, index) => (
															<Badge key={index} color="blue" size="xs">
																#{tag}
															</Badge>
														))}
													</div>
												)}
											</div>
										</div>

										{/* Actions */}
										<Dropdown
											arrowIcon={false}
											placement="left-start"
											label=""
											renderTrigger={() => (
												<Button size="sm" color="gray" className="p-2">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											)}
										>
											<ul className="py-2 text-gray-700 text-sm dark:text-gray-200">
												<li>
													<button
														onClick={() => onDownload?.(file._id)}
														className="flex w-full items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
													>
														<Download className="mr-2 h-4 w-4" />
														Download
													</button>
												</li>
												<li>
													<button
														onClick={() => {
															// Preview file functionality
														}}
														className="flex w-full items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
													>
														<Eye className="mr-2 h-4 w-4" />
														Preview
													</button>
												</li>
												<li className="border-gray-100 border-t dark:border-gray-600">
													<button
														onClick={() => handleDeleteFile(file._id)}
														className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</button>
												</li>
											</ul>
										</Dropdown>
									</div>
								);
							})
						)}
					</div>

					{/* Pagination placeholder */}
					{filteredFiles.length > 10 && (
						<div className="flex items-center justify-between border-gray-200 border-t pt-4 dark:border-gray-700">
							<span className="text-gray-500 text-sm dark:text-gray-400">
								Showing 1-{Math.min(10, filteredFiles.length)} of{" "}
								{filteredFiles.length}
							</span>
							<div className="flex space-x-2">
								<Button size="sm" color="gray" disabled>
									Previous
								</Button>
								<Button size="sm" color="gray">
									Next
								</Button>
							</div>
						</div>
					)}
				</div>
			</Card>

			{/* Upload Modal */}
			<Modal
				show={uploadModalOpen}
				onClose={() => setUploadModalOpen(false)}
				size="md"
			>
				<div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
					<h3 className="font-semibold text-gray-900 text-xl dark:text-white">
						Upload Files
					</h3>
				</div>
				<div className="p-6">
					{uploading ? (
						<div className="space-y-4">
							<div className="text-center">
								<Upload className="mx-auto mb-4 h-12 w-12 text-blue-500" />
								<p className="mb-2 text-gray-600 text-sm dark:text-gray-400">
									Uploading files...
								</p>
							</div>
							<Progress progress={uploadProgress} color="blue" />
							<p className="text-center text-gray-500 text-xs">
								{uploadProgress}% complete
							</p>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex w-full items-center justify-center">
								<label
									htmlFor="file-upload"
									className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-300 border-dashed bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800"
								>
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<Upload className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400" />
										<p className="mb-2 text-gray-500 text-sm dark:text-gray-400">
											<span className="font-semibold">Click to upload</span> or
											drag and drop
										</p>
										<p className="text-gray-500 text-xs dark:text-gray-400">
											PNG, JPG, PDF, DOC up to 100MB
										</p>
									</div>
									<input
										id="file-upload"
										type="file"
										className="hidden"
										multiple
										onChange={handleFileUpload}
									/>
								</label>
							</div>

							<div className="text-center">
								<Button color="gray" onClick={() => setUploadModalOpen(false)}>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</div>
			</Modal>
		</div>
	);
}
