import { Badge, Button, Card, TextInput } from "flowbite-react";
import { Filter, Search, Tag, Users, X } from "lucide-react";
import { useState } from "react";

interface ProjectFiltersProps {
	onFiltersChange: (filters: ProjectFilterState) => void;
	availableTags?: string[];
	teamMembers?: Array<{ id: string; name: string; avatar?: string }>;
}

export interface ProjectFilterState {
	search: string;
	status: string[];
	priority: string[];
	tags: string[];
	assignedTo: string[];
	dateRange: {
		start?: Date;
		end?: Date;
	};
	budgetRange: {
		min?: number;
		max?: number;
	};
	progress: {
		min: number;
		max: number;
	};
}

const defaultFilters: ProjectFilterState = {
	search: "",
	status: [],
	priority: [],
	tags: [],
	assignedTo: [],
	dateRange: {},
	budgetRange: {},
	progress: { min: 0, max: 100 },
};

const statusOptions = [
	{ value: "active", label: "Active", color: "green" },
	{ value: "on_hold", label: "On Hold", color: "yellow" },
	{ value: "completed", label: "Completed", color: "blue" },
	{ value: "archived", label: "Archived", color: "gray" },
];

const priorityOptions = [
	{ value: "urgent", label: "Urgent", color: "red" },
	{ value: "high", label: "High", color: "orange" },
	{ value: "medium", label: "Medium", color: "blue" },
	{ value: "low", label: "Low", color: "green" },
];

export function ProjectFilters({
	onFiltersChange,
	availableTags = [],
	teamMembers = [],
}: ProjectFiltersProps) {
	const [filters, setFilters] = useState<ProjectFilterState>(defaultFilters);
	const [isExpanded, setIsExpanded] = useState(false);

	const updateFilters = (newFilters: Partial<ProjectFilterState>) => {
		const updated = { ...filters, ...newFilters };
		setFilters(updated);
		onFiltersChange(updated);
	};

	const clearFilters = () => {
		setFilters(defaultFilters);
		onFiltersChange(defaultFilters);
	};

	const toggleArrayFilter = (
		type: "status" | "priority" | "tags" | "assignedTo",
		value: string,
	) => {
		const current = filters[type] as string[];
		const updated = current.includes(value)
			? current.filter((item) => item !== value)
			: [...current, value];
		updateFilters({ [type]: updated });
	};

	const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
		if (key === "search") return value !== "";
		if (key === "progress") return value.min !== 0 || value.max !== 100;
		if (Array.isArray(value)) return value.length > 0;
		if (typeof value === "object") return Object.keys(value).length > 0;
		return false;
	});

	const activeFilterCount = [
		filters.search ? 1 : 0,
		filters.status.length,
		filters.priority.length,
		filters.tags.length,
		filters.assignedTo.length,
		Object.keys(filters.dateRange).length > 0 ? 1 : 0,
		Object.keys(filters.budgetRange).length > 0 ? 1 : 0,
		filters.progress.min !== 0 || filters.progress.max !== 100 ? 1 : 0,
	].reduce((sum, count) => sum + count, 0);

	return (
		<Card className="mb-6">
			<div className="flex flex-col space-y-4">
				{/* Search Bar and Main Controls */}
				<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
					<div className="max-w-md flex-1">
						<div className="relative">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
							<TextInput
								type="text"
								placeholder="Search projects..."
								value={filters.search}
								onChange={(e) => updateFilters({ search: e.target.value })}
								className="pl-10"
							/>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Button
							color="light"
							size="sm"
							onClick={() => setIsExpanded(!isExpanded)}
							className="flex items-center"
						>
							<Filter className="mr-2 h-4 w-4" />
							Filters
							{activeFilterCount > 0 && (
								<Badge color="blue" size="sm" className="ml-2">
									{activeFilterCount}
								</Badge>
							)}
						</Button>

						{hasActiveFilters && (
							<Button
								color="gray"
								size="sm"
								onClick={clearFilters}
								className="flex items-center"
							>
								<X className="mr-1 h-4 w-4" />
								Clear
							</Button>
						)}
					</div>
				</div>

				{/* Quick Status Filters */}
				<div className="flex flex-wrap gap-2">
					{statusOptions.map((status) => (
						<button
							type="button"
							key={status.value}
							onClick={() => toggleArrayFilter("status", status.value)}
							className={`rounded-full px-3 py-1 font-medium text-sm transition-colors ${
								filters.status.includes(status.value)
									? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							}`}
						>
							{status.label}
						</button>
					))}
				</div>

				{/* Expanded Filters */}
				{isExpanded && (
					<div className="space-y-4 border-gray-200 border-t pt-4 dark:border-gray-700">
						{/* Priority Filter */}
						<div>
							<h3 className="mb-2 block font-medium text-gray-700 text-sm dark:text-gray-300">
								Priority
							</h3>
							<div className="flex flex-wrap gap-2">
								{priorityOptions.map((priority) => (
									<button
										type="button"
										key={priority.value}
										onClick={() =>
											toggleArrayFilter("priority", priority.value)
										}
										className={`rounded-full px-3 py-1 font-medium text-sm transition-colors ${
											filters.priority.includes(priority.value)
												? `bg-${priority.color}-100 text-${priority.color}-800 dark:bg-${priority.color}-900 dark:text-${priority.color}-200`
												: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
										}`}
									>
										{priority.label}
									</button>
								))}
							</div>
						</div>

						{/* Tags Filter */}
						{availableTags.length > 0 && (
							<div>
								<h3 className="mb-2 block font-medium text-gray-700 text-sm dark:text-gray-300">
									<Tag className="mr-1 inline h-4 w-4" />
									Tags
								</h3>
								<div className="flex flex-wrap gap-2">
									{availableTags.slice(0, 8).map((tag) => (
										<button
											type="button"
											key={tag}
											onClick={() => toggleArrayFilter("tags", tag)}
											className={`rounded-full px-3 py-1 font-medium text-sm transition-colors ${
												filters.tags.includes(tag)
													? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
													: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
											}`}
										>
											#{tag}
										</button>
									))}
									{availableTags.length > 8 && (
										<span className="px-3 py-1 text-gray-500 text-sm">
											+{availableTags.length - 8} more
										</span>
									)}
								</div>
							</div>
						)}

						{/* Team Members Filter */}
						{teamMembers.length > 0 && (
							<div>
								<h3 className="mb-2 block font-medium text-gray-700 text-sm dark:text-gray-300">
									<Users className="mr-1 inline h-4 w-4" />
									Team Members
								</h3>
								<div className="flex flex-wrap gap-2">
									{teamMembers.slice(0, 6).map((member) => (
										<button
											type="button"
											key={member.id}
											onClick={() => toggleArrayFilter("assignedTo", member.id)}
											className={`flex items-center rounded-full px-3 py-1 font-medium text-sm transition-colors ${
												filters.assignedTo.includes(member.id)
													? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
													: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
											}`}
										>
											{member.avatar && (
												<img
													src={member.avatar}
													alt={member.name}
													className="mr-1 h-4 w-4 rounded-full"
												/>
											)}
											{member.name}
										</button>
									))}
									{teamMembers.length > 6 && (
										<span className="px-3 py-1 text-gray-500 text-sm">
											+{teamMembers.length - 6} more
										</span>
									)}
								</div>
							</div>
						)}

						{/* Progress Range */}
						<div>
							<h3 className="mb-2 block font-medium text-gray-700 text-sm dark:text-gray-300">
								Progress Range: {filters.progress.min}% - {filters.progress.max}
								%
							</h3>
							<div className="flex items-center space-x-4">
								<input
									type="range"
									min="0"
									max="100"
									step="5"
									value={filters.progress.min}
									onChange={(e) =>
										updateFilters({
											progress: {
												...filters.progress,
												min: Number.parseInt(e.target.value, 10),
											},
										})
									}
									className="flex-1"
								/>
								<input
									type="range"
									min="0"
									max="100"
									step="5"
									value={filters.progress.max}
									onChange={(e) =>
										updateFilters({
											progress: {
												...filters.progress,
												max: Number.parseInt(e.target.value, 10),
											},
										})
									}
									className="flex-1"
								/>
							</div>
						</div>
					</div>
				)}

				{/* Active Filters Summary */}
				{hasActiveFilters && (
					<div className="flex flex-wrap gap-2 border-gray-200 border-t pt-2 dark:border-gray-700">
						{filters.search && (
							<Badge color="blue" className="flex items-center">
								Search: "{filters.search}"
								<X
									className="ml-1 h-3 w-3 cursor-pointer"
									onClick={() => updateFilters({ search: "" })}
								/>
							</Badge>
						)}
						{filters.status.map((status) => (
							<Badge key={status} color="green" className="flex items-center">
								Status: {statusOptions.find((s) => s.value === status)?.label}
								<X
									className="ml-1 h-3 w-3 cursor-pointer"
									onClick={() => toggleArrayFilter("status", status)}
								/>
							</Badge>
						))}
						{filters.priority.map((priority) => (
							<Badge
								key={priority}
								color="orange"
								className="flex items-center"
							>
								Priority:{" "}
								{priorityOptions.find((p) => p.value === priority)?.label}
								<X
									className="ml-1 h-3 w-3 cursor-pointer"
									onClick={() => toggleArrayFilter("priority", priority)}
								/>
							</Badge>
						))}
						{filters.tags.map((tag) => (
							<Badge key={tag} color="purple" className="flex items-center">
								#{tag}
								<X
									className="ml-1 h-3 w-3 cursor-pointer"
									onClick={() => toggleArrayFilter("tags", tag)}
								/>
							</Badge>
						))}
					</div>
				)}
			</div>
		</Card>
	);
}
