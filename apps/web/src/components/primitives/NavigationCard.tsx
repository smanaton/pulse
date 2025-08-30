import { Link } from "@tanstack/react-router";
import { Badge } from "flowbite-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface NavigationCardProps {
	id: string;
	name: string;
	icon: LucideIcon;
	badge?: number;
	href: string; // Always required - all cards should navigate
	index: number;
}

export function NavigationCard({
	id,
	name,
	icon: IconComponent,
	badge,
	href,
	index,
}: NavigationCardProps) {
	const cardClasses =
		"relative cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200 w-24 h-24 flex flex-col items-center justify-center text-center";

	const cardContent = (
		<>
			{badge && (
				<Badge
					color="failure"
					size="sm"
					className="-top-2 -right-2 absolute z-10"
				>
					{badge}
				</Badge>
			)}
			<IconComponent className="mb-3 h-10 w-10 text-gray-600 dark:text-gray-300" />
			<span className="font-medium text-gray-900 text-xs dark:text-white">
				{name}
			</span>
		</>
	);

	const animationProps = {
		initial: { opacity: 0, scale: 0.8, y: 20 },
		animate: { opacity: 1, scale: 1, y: 0 },
		transition: {
			delay: 0.3 + index * 0.05,
			duration: 0.3,
			type: "spring" as const,
			stiffness: 200,
			damping: 20,
		},
	};

	return (
		<motion.div key={id} {...animationProps}>
			<Link to={href} className={cardClasses}>
				{cardContent}
			</Link>
		</motion.div>
	);
}
