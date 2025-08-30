import { Alert, Button, Progress } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { Badge } from "@/components/ui/badge";

/**
 * Demo component showing the custom "action" color in use across different Flowbite components
 * This demonstrates how a consistent brand color can be applied throughout the application
 */
export function ActionColorDemo() {
	return (
		<div className="space-y-6 p-6">
			<h2 className="font-semibold text-gray-900 text-xl dark:text-white">
				Custom "Action" Color Demo
			</h2>

			{/* Buttons with action color */}
			<div className="space-y-3">
				<h3 className="font-medium text-gray-700 dark:text-gray-300">
					Buttons
				</h3>
				<div className="flex flex-wrap gap-3">
					<Button color="action">Action Button</Button>
					<Button color="action" size="sm">
						Small Action
					</Button>
					<Button color="action" size="lg">
						Large Action
					</Button>
					<Button color="action" disabled>
						Disabled Action
					</Button>
				</div>
			</div>

			{/* Badges with action color */}
			<div className="space-y-3">
				<h3 className="font-medium text-gray-700 dark:text-gray-300">
					Badges (Custom shadcn/ui)
				</h3>
				<div className="flex flex-wrap items-center gap-3">
					<Badge variant="action">Action Badge</Badge>
					<Badge variant="default">Default Badge</Badge>
					<Badge variant="secondary">Secondary Badge</Badge>
					<Badge variant="destructive">Destructive Badge</Badge>
				</div>
			</div>

			{/* Progress bars with action color */}
			<div className="space-y-3">
				<h3 className="font-medium text-gray-700 dark:text-gray-300">
					Progress Bars
				</h3>
				<div className="space-y-2">
					<Progress color="action" progress={45} />
					<Progress color="action" progress={75} size="lg" />
					<Progress color="action" progress={90} size="sm" />
				</div>
			</div>

			{/* Alerts with action color */}
			<div className="space-y-3">
				<h3 className="font-medium text-gray-700 dark:text-gray-300">Alerts</h3>
				<Alert color="action" icon={HiInformationCircle}>
					<span className="font-medium">Action Alert!</span> This alert uses the
					custom action color theme.
				</Alert>
			</div>

			{/* Color palette reference */}
			<div className="space-y-3">
				<h3 className="font-medium text-gray-700 dark:text-gray-300">
					Action Color Palette
				</h3>
				<div className="grid grid-cols-6 gap-2">
					{[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
						(shade) => (
							<div key={shade} className="text-center">
								<div
									className={`h-12 w-full rounded border bg-action-${shade} ${shade >= 500 ? "border-white" : "border-gray-300"}`}
								/>
								<span className="text-gray-600 text-xs dark:text-gray-400">
									{shade}
								</span>
							</div>
						),
					)}
				</div>
			</div>

			{/* Usage instructions */}
			<div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
				<h4 className="mb-2 font-medium text-gray-900 dark:text-white">
					How to Use
				</h4>
				<div className="space-y-1 text-gray-700 text-sm dark:text-gray-300">
					<p>
						<code className="rounded bg-gray-200 px-1 dark:bg-gray-700">
							{'<Button color="action">'}
						</code>{" "}
						- Use action color for Flowbite buttons
					</p>
					<p>
						<code className="rounded bg-gray-200 px-1 dark:bg-gray-700">
							{'<Badge variant="action">'}
						</code>{" "}
						- Use action color for shadcn/ui badges
					</p>
					<p>
						<code className="rounded bg-gray-200 px-1 dark:bg-gray-700">
							{'<Progress color="action">'}
						</code>{" "}
						- Use action color for progress bars
					</p>
					<p>
						<code className="rounded bg-gray-200 px-1 dark:bg-gray-700">
							{'<Alert color="action">'}
						</code>{" "}
						- Use action color for alerts
					</p>
					<p>
						<code className="rounded bg-gray-200 px-1 dark:bg-gray-700">
							bg-action-500
						</code>{" "}
						- Use directly in Tailwind classes
					</p>
				</div>
			</div>
		</div>
	);
}
