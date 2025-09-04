import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	Button,
	Dropdown,
	DropdownItem,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeadCell,
	TableRow,
	TextInput,
} from "flowbite-react";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchPlaceholder?: string;
	onRowClick?: (row: TData) => void;
	className?: string;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchPlaceholder = "Search...",
	onRowClick,
	className,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [globalFilter, setGlobalFilter] = useState("");

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: "includesString",
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			pagination,
			globalFilter,
		},
	});

	return (
		<div className={cn("space-y-4", className)}>
			{/* Toolbar */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 items-center space-x-2">
					<div className="relative max-w-sm flex-1">
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Search className="h-4 w-4 text-gray-400" />
						</div>
						<TextInput
							placeholder={searchPlaceholder}
							value={globalFilter ?? ""}
							onChange={(e) => setGlobalFilter(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				{/* Column visibility toggle */}
				<Dropdown
					renderTrigger={() => (
						<Button color="light" className="flex items-center gap-2">
							Columns
							<ChevronDown className="h-4 w-4" />
						</Button>
					)}
					placement="bottom-start"
				>
					{table
						.getAllColumns()
						.filter((column) => column.getCanHide())
						.map((column) => (
							<DropdownItem
								key={column.id}
								onClick={() => column.toggleVisibility(!column.getIsVisible())}
							>
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={column.getIsVisible()}
										onChange={() =>
											column.toggleVisibility(!column.getIsVisible())
										}
										className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
									/>
									{column.id}
								</div>
							</DropdownItem>
						))}
				</Dropdown>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
				<Table>
					<TableHead>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHeadCell key={header.id} className="px-6 py-3">
										<button
											type="button"
											className={cn(
												"flex items-center space-x-1",
												header.column.getCanSort() &&
													"cursor-pointer select-none",
											)}
											onClick={header.column.getToggleSortingHandler()}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
											{header.column.getCanSort() && (
												<div className="ml-2 h-4 w-4">
													{{
														asc: "↑",
														desc: "↓",
													}[header.column.getIsSorted() as string] ?? "↕"}
												</div>
											)}
										</button>
									</TableHeadCell>
								))}
							</TableRow>
						))}
					</TableHead>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className={cn(
										"hover:bg-gray-50 dark:hover:bg-gray-800",
										onRowClick && "cursor-pointer",
									)}
									onClick={() => onRowClick?.(row.original)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="px-6 py-4">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between px-2">
				<div className="flex-1 text-gray-500 text-sm dark:text-gray-400">
					Showing{" "}
					{table.getState().pagination.pageIndex *
						table.getState().pagination.pageSize +
						1}{" "}
					to{" "}
					{Math.min(
						(table.getState().pagination.pageIndex + 1) *
							table.getState().pagination.pageSize,
						table.getFilteredRowModel().rows.length,
					)}{" "}
					of {table.getFilteredRowModel().rows.length} entries
				</div>
				<div className="flex items-center space-x-6 lg:space-x-8">
					<div className="flex items-center space-x-2">
						<p className="font-medium text-gray-700 text-sm dark:text-gray-300">
							Rows per page
						</p>
						<select
							value={table.getState().pagination.pageSize}
							onChange={(e) => {
								table.setPageSize(Number(e.target.value));
							}}
							className="h-8 w-16 rounded border border-gray-300 bg-transparent px-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						>
							{[5, 10, 20, 50, 100].map((pageSize) => (
								<option key={pageSize} value={pageSize}>
									{pageSize}
								</option>
							))}
						</select>
					</div>
					<div className="flex w-20 items-center justify-center font-medium text-gray-700 text-sm dark:text-gray-300">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							outline
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>
						<Button
							outline
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
