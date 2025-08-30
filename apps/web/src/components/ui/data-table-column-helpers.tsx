import { createColumnHelper } from "@tanstack/react-table";
import { Badge, Button } from "flowbite-react";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { Client } from "../../hooks/use-clients";

// Helper for creating sortable header
export function createSortableHeader(title: string) {
	return ({ column }: { column: any }) => {
		return (
			<button
				type="button"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="flex h-auto items-center gap-2 p-0 font-medium hover:bg-transparent"
			>
				{title}
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</button>
		);
	};
}

// Helper for actions column
export function createActionsColumn<T>(
	actions: Array<{
		label: string;
		onClick: (item: T) => void;
		variant?: "default" | "danger";
	}>,
) {
	return {
		id: "actions",
		cell: ({ row }: { row: { original: T } }) => {
			const item = row.original;

			return (
				<div className="flex items-center gap-2">
					{actions.map((action, index) => (
						<Button
							key={index}
							size="xs"
							color={action.variant === "danger" ? "failure" : "light"}
							onClick={(e) => {
								e.stopPropagation();
								action.onClick(item);
							}}
						>
							{action.label}
						</Button>
					))}
				</div>
			);
		},
	};
}

// Helper for date formatting
export function formatDate(date: number) {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function formatDateTime(date: number) {
	return new Date(date).toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// Helper for status badges
export function createStatusBadge(
	status: string,
	variant: "success" | "warning" | "failure" | "info" | "dark" = "info",
) {
	return <Badge color={variant}>{status}</Badge>;
}

// Common column definitions

// Client columns
export const clientColumns = {
	name: {
		accessorKey: "name",
		header: createSortableHeader("Name"),
		cell: ({ row }: { row: { original: Client } }) => (
			<div className="font-medium">{row.original.name}</div>
		),
	},
	email: {
		accessorKey: "email",
		header: "Email",
		cell: ({ row }: { row: { original: Client } }) => (
			<div className="text-gray-500">{row.original.email || "—"}</div>
		),
	},
	company: {
		accessorKey: "company",
		header: "Company",
		cell: ({ row }: { row: { original: Client } }) => (
			<div>{row.original.company || "—"}</div>
		),
	},
	status: {
		accessorKey: "status",
		header: "Status",
		cell: ({ row }: { row: { original: Client } }) => {
			const status = row.original.status;
			const variant =
				{
					active: "success" as const,
					inactive: "warning" as const,
				}[status] || ("info" as const);
			return createStatusBadge(
				status.charAt(0).toUpperCase() + status.slice(1),
				variant,
			);
		},
	},
	createdAt: {
		accessorKey: "createdAt",
		header: createSortableHeader("Created"),
		cell: ({ row }: { row: { original: Client } }) =>
			formatDate(row.original.createdAt),
	},
};
