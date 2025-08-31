import { Button } from "flowbite-react";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useWorkspaceContext } from "../../contexts/workspace-context";
import type { Client } from "../../hooks/use-clients";
import { useClients } from "../../hooks/use-clients";
import { DataTable } from "../ui/data-table";
import {
	clientColumns,
	createActionsColumn,
} from "../ui/data-table-column-helpers";

interface ClientsTableProps {
	onCreateClient?: () => void;
	onEditClient?: (client: Client) => void;
	onViewClient?: (client: Client) => void;
}

export function ClientsTable({
	onCreateClient,
	onEditClient,
	onViewClient,
}: ClientsTableProps) {
	const { currentWorkspace } = useWorkspaceContext();
	const { data, isLoading } = useClients(currentWorkspace!._id);

	const columns = useMemo(() => {
		const baseColumns = [
			clientColumns.name,
			clientColumns.email,
			clientColumns.company,
			clientColumns.status,
			clientColumns.createdAt,
		];

		if (onEditClient || onViewClient) {
			const actions = [];
			if (onViewClient) {
				actions.push({
					label: "View",
					onClick: onViewClient,
				});
			}
			if (onEditClient) {
				actions.push({
					label: "Edit",
					onClick: onEditClient,
				});
			}

			return [...baseColumns, createActionsColumn(actions)];
		}

		return baseColumns;
	}, [onEditClient, onViewClient]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-bold text-2xl">Clients</h2>
					{onCreateClient && (
						<Button onClick={onCreateClient}>
							<Plus className="mr-2 h-4 w-4" />
							Add Client
						</Button>
					)}
				</div>
				<div className="flex h-64 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-primary-600 border-b-2" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-2xl text-gray-900 dark:text-white">
					Clients
				</h2>
				{onCreateClient && (
					<Button onClick={onCreateClient}>
						<Plus className="mr-2 h-4 w-4" />
						Add Client
					</Button>
				)}
			</div>

			<DataTable
				columns={columns}
				data={data?.clients || []}
				searchPlaceholder="Search clients..."
				onRowClick={onViewClient}
			/>
		</div>
	);
}
