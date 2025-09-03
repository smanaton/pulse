import { Link, useLocation } from "@tanstack/react-router";
import {
	Sidebar,
	SidebarCollapse,
	SidebarItem as SidebarItemDefault,
	SidebarItemGroup,
	SidebarItems,
	TextInput,
} from "flowbite-react";
import type { ComponentProps, FC, HTMLAttributeAnchorTarget } from "react";
import { useEffect, useId, useState } from "react";
import {
	HiCalendar,
	HiChartPie,
	HiChatAlt,
	HiCheckCircle,
	HiCog,
	HiHome,
	HiLightBulb,
	HiMail,
	HiSearch,
	HiTemplate,
	HiUsers,
	HiViewGrid,
} from "react-icons/hi";
import { twMerge } from "tailwind-merge";
import { RouterLink } from "@/components/primitives/RouterLink";
import { WorkspaceSwitcher } from "@/components/workspace";
import { useSidebarContext } from "@/contexts/sidebar-context";

interface SidebarItem {
	href?: string;
	target?: HTMLAttributeAnchorTarget;
	icon?: FC<ComponentProps<"svg">>;
	label: string;
	items?: SidebarItem[];
	badge?: string;
}

interface SidebarItemProps extends SidebarItem {
	pathname: string;
}

export function DashboardSidebar() {
	return (
		<>
			<div className="lg:hidden">
				<MobileSidebar />
			</div>
			<div className="hidden lg:block">
				<DesktopSidebar />
			</div>
		</>
	);
}

function DesktopSidebar() {
	const sidebarId = useId();
	const location = useLocation();
	const { isCollapsed, setCollapsed } = useSidebarContext().desktop;
	const [isPreview, setIsPreview] = useState(isCollapsed);

	useEffect(() => {
		if (isCollapsed) setIsPreview(false);
	}, [isCollapsed]);

	const preview = {
		enable() {
			if (!isCollapsed) return;

			setIsPreview(true);
			setCollapsed(false);
		},
		disable() {
			if (!isPreview) return;

			setCollapsed(true);
		},
	};

	return (
		<Sidebar
			onMouseEnter={preview.enable}
			onMouseLeave={preview.disable}
			aria-label="Dashboard sidebar"
			collapsed={isCollapsed}
			className={twMerge(
				"fixed inset-y-0 left-0 z-20 flex h-full shrink-0 flex-col border-gray-200 border-r pt-16 duration-75 sm:flex lg:flex dark:border-gray-700",
				isCollapsed && "hidden w-16",
			)}
			id={sidebarId}
		>
			<div className="flex h-full flex-col justify-between">
				<div>
					{/* Workspace Switcher */}
					<div className="py-3">
						<WorkspaceSwitcher isCollapsed={isCollapsed} />
					</div>

					{/* Navigation */}
					<div className="py-2">
						<SidebarItems>
							<SidebarItemGroup className="mt-0 border-t-0 pt-0 pb-1">
								{mainPages.map((item) => (
									<SidebarItem
										key={item.label}
										{...item}
										pathname={location.pathname}
									/>
								))}
							</SidebarItemGroup>
						</SidebarItems>
					</div>
				</div>
				<BottomMenu isCollapsed={isCollapsed} />
			</div>
		</Sidebar>
	);
}

function MobileSidebar() {
	const sidebarId = useId();
	const location = useLocation();
	const { isOpen, close } = useSidebarContext().mobile;

	if (!isOpen) return null;

	return (
		<>
			<Sidebar
				aria-label="Dashboard sidebar"
				className={twMerge(
					"fixed inset-y-0 left-0 z-20 hidden h-full shrink-0 flex-col border-gray-200 border-r pt-16 lg:flex dark:border-gray-700",
					isOpen && "flex",
				)}
				id={sidebarId}
			>
				<div className="flex h-full flex-col justify-between">
					<div>
						{/* Workspace Switcher */}
						<div className="py-3">
							<WorkspaceSwitcher isCollapsed={false} />
						</div>

						{/* Search */}
						<form className="px-3 pb-3">
							<TextInput
								icon={HiSearch}
								type="search"
								placeholder="Search"
								required
								size={32}
							/>
						</form>

						{/* Navigation */}
						<div className="py-2">
							<SidebarItems>
								<SidebarItemGroup className="mt-0 border-t-0 pt-0 pb-1">
									{mainPages.map((item) => (
										<SidebarItem
											key={item.label}
											{...item}
											pathname={location.pathname}
										/>
									))}
								</SidebarItemGroup>
							</SidebarItems>
						</div>
					</div>
					<BottomMenu isCollapsed={false} />
				</div>
			</Sidebar>
			<div
				onClick={close}
				aria-hidden="true"
				className="fixed inset-0 z-10 h-full w-full bg-gray-900/50 pt-16 dark:bg-gray-900/90"
			/>
		</>
	);
}

function SidebarItem({
	href,
	icon,
	label,
	items,
	badge,
	pathname,
}: SidebarItemProps) {
	if (items) {
		const isOpen = items.some((item) => pathname.startsWith(item.href ?? ""));

		return (
			<SidebarCollapse
				icon={icon}
				label={label}
				open={isOpen}
				theme={{ list: "space-y-2 py-2 [&>li>div]:w-full" }}
			>
				{items.map((item) => (
					<SidebarItemDefault
						key={item.label}
						as={RouterLink}
						href={item.href}
						className={twMerge(
							"justify-center *:font-normal",
							pathname === item.href && "bg-gray-100 dark:bg-gray-700",
						)}
					>
						{item.label}
					</SidebarItemDefault>
				))}
			</SidebarCollapse>
		);
	}

	return (
		<SidebarItemDefault
			as={RouterLink}
			href={href}
			icon={icon}
			label={badge}
			labelColor="blue"
			className={twMerge(pathname === href && "bg-gray-100 dark:bg-gray-700")}
		>
			{label}
		</SidebarItemDefault>
	);
}

function BottomMenu({ isCollapsed }: { isCollapsed: boolean }) {
	return (
		<div
			className={twMerge(
				"flex items-center justify-center gap-4 p-2",
				isCollapsed && "flex-col",
			)}
		>
			<Link
				to="/settings"
				className="inline-flex cursor-pointer justify-center rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
			>
				<span className="sr-only">Settings</span>
				<HiCog className="h-6 w-6" />
			</Link>
		</div>
	);
}

const mainPages: SidebarItem[] = [
	{ href: "/", icon: HiHome, label: "Home" },
	{ href: "/dashboard", icon: HiTemplate, label: "Dashboard" },
	{ href: "/ideas", icon: HiLightBulb, label: "Ideas" },
	{ href: "/projects", icon: HiViewGrid, label: "Projects" },
	{ href: "/todo", icon: HiCheckCircle, label: "To-do" },
	{ href: "/calendar", icon: HiCalendar, label: "Calendar" },
	{ href: "/email", icon: HiMail, label: "E-mail", badge: "13" },
	{ href: "/chat", icon: HiChatAlt, label: "Chat", badge: "3" },
	{ href: "/analytics", icon: HiChartPie, label: "Analytics" },
	{ href: "/team", icon: HiUsers, label: "Team" },
];
