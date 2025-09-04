import { Avatar } from "flowbite-react";
import type { FC } from "react";
import { HiOfficeBuilding, HiUser } from "react-icons/hi";

interface WorkspaceAvatarProps {
	name: string;
	type: "personal" | "team";
	image?: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	className?: string;
}

function generateInitials(name: string): string {
	return name
		.split(" ")
		.map((word) => word.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function generateColorFromName(name: string): string {
	const colors = [
		"bg-blue-500",
		"bg-green-500",
		"bg-purple-500",
		"bg-pink-500",
		"bg-indigo-500",
		"bg-yellow-500",
		"bg-red-500",
		"bg-gray-500",
	];

	const hash = name.split("").reduce((acc, char) => {
		const newAcc = (acc << 5) - acc + char.charCodeAt(0);
		return newAcc & newAcc;
	}, 0);

	return colors[Math.abs(hash) % colors.length];
}

export const WorkspaceAvatar: FC<WorkspaceAvatarProps> = ({
	name,
	type,
	image,
	size = "sm",
	className = "",
}) => {
	if (image) {
		return <Avatar img={image} size={size} className={className} />;
	}

	const initials = generateInitials(name);
	const bgColor = generateColorFromName(name);

	const sizeClasses = {
		xs: "w-6 h-6 text-xs",
		sm: "w-8 h-8 text-sm",
		md: "w-10 h-10 text-base",
		lg: "w-12 h-12 text-lg",
		xl: "w-16 h-16 text-xl",
	};

	return (
		<div className={`relative ${sizeClasses[size]} ${className}`}>
			{/* Main avatar */}
			<div
				className={`
				${bgColor} 
				${sizeClasses[size]}rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white dark:ring-gray-800`}
			>
				{initials}
			</div>

			{/* Type indicator badge */}
			<div
				className={`-bottom-1 absolute -right-1${size === "xs" ? "h-3 w-3" : "h-4 w-4"}bg-gray-100 flex items-center justify-center rounded-full ring-2 ring-white dark:bg-gray-700 dark:ring-gray-800`}
			>
				{type === "personal" ? (
					<HiUser
						className={`${size === "xs" ? "h-2 w-2" : "h-2.5 w-2.5"} text-gray-600 dark:text-gray-300`}
					/>
				) : (
					<HiOfficeBuilding
						className={`${size === "xs" ? "h-2 w-2" : "h-2.5 w-2.5"} text-gray-600 dark:text-gray-300`}
					/>
				)}
			</div>
		</div>
	);
};
