import { Loader2 } from "lucide-react";

export default function Loader() {
	return (
		// <div className="flex h-full items-center justify-center pt-8">
		// 	<Loader2 className="animate-spin" />
		// </div>
		<div className="flex min-h-64 items-center justify-center">
			<div className="text-center">
				<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-gray-600 border-b-2" />
				<p className="text-gray-600 dark:text-gray-400">
					Setting up your workspace...
				</p>
			</div>
		</div>
	);
}
