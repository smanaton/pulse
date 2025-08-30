import { DarkThemeToggle } from "flowbite-react";

export function ModeToggle() {
	return (
		<DarkThemeToggle className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 dark:hover:bg-gray-700" />
	);
}
