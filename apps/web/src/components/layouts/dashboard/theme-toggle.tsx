import { Dropdown, DropdownItem, Tooltip, useThemeMode } from "flowbite-react";
import { HiDesktopComputer, HiMoon, HiSun } from "react-icons/hi";

interface ThemeToggleProps {
	hideSearch?: boolean;
}

export function ThemeToggle({ hideSearch = false }: ThemeToggleProps) {
	const { mode, computedMode, setMode } = useThemeMode();

	const handleSetMode = (newMode: "light" | "dark" | "auto") => {
		setMode(newMode);
	};

	const getIcon = () => {
		if (mode === "auto") {
			return <HiDesktopComputer className="h-5 w-5" />;
		}
		return computedMode === "dark" ? (
			<HiMoon className="h-5 w-5" />
		) : (
			<HiSun className="h-5 w-5" />
		);
	};

	const getTooltipText = () => {
		if (mode === "auto") {
			return `System theme (${computedMode})`;
		}
		return `${mode === "light" ? "Light" : "Dark"} theme`;
	};

	return (
		<Dropdown
			arrowIcon={false}
			inline
			label={
				<Tooltip content={getTooltipText()}>
					<div
						className={`rounded-lg p-2.5 text-sm transition-colors focus:outline-none focus:ring-4 ${hideSearch ? "text-gray-400 hover:bg-gray-800 hover:text-white focus:ring-gray-600" : "text-gray-500 hover:bg-gray-100 focus:ring-gray-200 dark:text-gray-400 dark:focus:ring-gray-700 dark:hover:bg-gray-700"}`}
					>
						{getIcon()}
					</div>
				</Tooltip>
			}
			placement="bottom"
		>
			<DropdownItem onClick={() => handleSetMode("light")}>
				<HiSun className="mr-2 h-4 w-4" />
				Light
				{mode === "light" && <span className="ml-auto">✓</span>}
			</DropdownItem>
			<DropdownItem onClick={() => handleSetMode("dark")}>
				<HiMoon className="mr-2 h-4 w-4" />
				Dark
				{mode === "dark" && <span className="ml-auto">✓</span>}
			</DropdownItem>
			<DropdownItem onClick={() => handleSetMode("auto")}>
				<HiDesktopComputer className="mr-2 h-4 w-4" />
				System
				{mode === "auto" && <span className="ml-auto">✓</span>}
			</DropdownItem>
		</Dropdown>
	);
}
