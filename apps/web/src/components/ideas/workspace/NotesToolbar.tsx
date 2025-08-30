import { Tooltip } from "flowbite-react";
import { Brain, ChevronLeft, ChevronRight, Info, Tag } from "lucide-react";

interface NotesToolbarProps {
	selectedTool: "assistant" | "info" | "tags" | null;
	onSelectTool: (tool: "assistant" | "info" | "tags" | null) => void;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
}

interface ToolbarIconProps {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	isActive: boolean;
	onClick: () => void;
	badge?: number;
}

function ToolbarIcon({
	icon: Icon,
	label,
	isActive,
	onClick,
	badge,
}: ToolbarIconProps) {
	return (
		<Tooltip content={label} placement="left">
			<button
				onClick={onClick}
				className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors${
					isActive
						? "bg-blue-500 text-white"
						: "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
				}
				`}
			>
				<Icon className="h-5 w-5" />
				{badge && badge > 0 && (
					<span className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs">
						{badge > 9 ? "9+" : badge}
					</span>
				)}
			</button>
		</Tooltip>
	);
}

export function NotesToolbar({
	selectedTool,
	onSelectTool,
	isCollapsed,
	onToggleCollapse,
}: NotesToolbarProps) {
	const handleToolClick = (tool: "assistant" | "info" | "tags") => {
		if (selectedTool === tool) {
			// If clicking the same tool, toggle panel visibility
			onSelectTool(null);
		} else {
			// Select the new tool (and show panel if collapsed)
			onSelectTool(tool);
		}
	};

	return (
		<div className="flex w-12 flex-col items-center gap-2 border-gray-200 border-l bg-gray-50 py-4 dark:border-gray-700 dark:bg-gray-800">
			{/* Collapse/Expand Button */}
			<Tooltip
				content={isCollapsed ? "Expand panel" : "Collapse panel"}
				placement="left"
			>
				<button
					onClick={onToggleCollapse}
					className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
				>
					{isCollapsed ? (
						<ChevronLeft className="h-5 w-5" />
					) : (
						<ChevronRight className="h-5 w-5" />
					)}
				</button>
			</Tooltip>

			{/* Divider */}
			<div className="my-2 h-px w-6 bg-gray-200 dark:bg-gray-700" />

			{/* Tool Icons */}
			<ToolbarIcon
				icon={Brain}
				label="AI Assistant"
				isActive={selectedTool === "assistant"}
				onClick={() => handleToolClick("assistant")}
			/>

			<ToolbarIcon
				icon={Info}
				label="Document Info"
				isActive={selectedTool === "info"}
				onClick={() => handleToolClick("info")}
			/>

			<ToolbarIcon
				icon={Tag}
				label="Tags"
				isActive={selectedTool === "tags"}
				onClick={() => handleToolClick("tags")}
			/>
		</div>
	);
}
