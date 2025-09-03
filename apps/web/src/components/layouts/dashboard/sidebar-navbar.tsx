import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@pulse/backend";
import type { Doc } from "@pulse/backend/dataModel";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	Avatar,
	Dropdown,
	DropdownDivider,
	DropdownHeader,
	DropdownItem,
	Label,
	Navbar,
	NavbarBrand,
	TextInput,
} from "flowbite-react";
import { useId } from "react";
import {
	HiBell,
	HiCog,
	HiLogout,
	HiMenuAlt1,
	HiSearch,
	HiUserCircle,
	HiViewGrid,
	HiX,
} from "react-icons/hi";
import { RouterLink } from "@/components/primitives/RouterLink";
import { useSidebarContext } from "@/contexts/sidebar-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ThemeToggle } from "./theme-toggle";

// Helper function to convert database user to dropdown user
function mapUserForDropdown(
	dbUser: Doc<"users"> | null,
): UserDropdownProps["user"] {
	if (!dbUser) return null;
	return {
		name: dbUser.name,
		email: dbUser.email,
		pictureUrl: dbUser.image, // Map image to pictureUrl
	};
}

export function SidebarNavbar() {
	const searchId = useId();
	const sidebar = useSidebarContext();
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const dbUser = useQuery(api.users.getCurrentUser);
	const user = mapUserForDropdown(dbUser ?? null);
	const { signOut } = useAuthActions();

	function handleToggleSidebar() {
		if (isDesktop) {
			sidebar.desktop.toggle();
		} else {
			sidebar.mobile.toggle();
		}
	}

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	return (
		<Navbar className="fixed top-0 z-30 w-full border-gray-200 border-b bg-white p-0 sm:p-0 dark:border-gray-700 dark:bg-gray-800">
			<div className="w-full p-3 pr-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<button
							type="button"
							onClick={handleToggleSidebar}
							className="mr-3 cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
						>
							<span className="sr-only">Toggle sidebar</span>
							{/* mobile */}
							<div className="lg:hidden">
								{sidebar.mobile.isOpen ? (
									<HiX className="h-6 w-6" />
								) : (
									<HiMenuAlt1 className="h-6 w-6" />
								)}
							</div>
							{/* desktop */}
							<div className="hidden lg:block">
								<HiMenuAlt1 className="h-6 w-6" />
							</div>
						</button>
						<NavbarBrand as={RouterLink} href="/" className="mr-14">
							<span className="self-center whitespace-nowrap font-semibold text-2xl dark:text-white">
								Pulse
							</span>
						</NavbarBrand>
						<form className="hidden lg:block lg:pl-2">
							<Label htmlFor={searchId} className="sr-only">
								Search
							</Label>
							<div className="relative">
								<HiSearch className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
								<TextInput
									className="w-full pl-8 lg:w-96"
									id={searchId}
									name="search"
									placeholder="Search"
									required
									type="search"
								/>
							</div>
						</form>
					</div>
					<div className="flex items-center lg:gap-3">
						<div className="flex items-center">
							<button
								type="button"
								className="cursor-pointer rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 lg:hidden dark:text-gray-400 dark:focus:bg-gray-700 dark:focus:ring-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
							>
								<span className="sr-only">Search</span>
								<HiSearch className="h-6 w-6" />
							</button>
							<NotificationBellDropdown />
							<AppDrawerDropdown />
							<ThemeToggle />
							<div className="ml-3 flex items-center">
								<UserDropdown user={user} onSignOut={handleSignOut} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</Navbar>
	);
}

function NotificationBellDropdown() {
	return (
		<Dropdown
			className="rounded"
			label={
				<span className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
					<span className="sr-only">Notifications</span>
					<HiBell className="h-6 w-6" />
				</span>
			}
			theme={{ content: "py-0" }}
		>
			<div className="max-w-sm">
				<div className="block rounded-t-xl bg-gray-50 px-4 py-2 text-center font-medium text-base text-gray-700 dark:bg-gray-700 dark:text-gray-400">
					Notifications
				</div>
				<div className="p-4 text-center text-gray-500 dark:text-gray-400">
					No new notifications
				</div>
			</div>
		</Dropdown>
	);
}

function AppDrawerDropdown() {
	return (
		<Dropdown
			className="rounded"
			label={
				<span className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
					<span className="sr-only">Apps</span>
					<HiViewGrid className="h-6 w-6" />
				</span>
			}
			theme={{ content: "py-0" }}
		>
			<div className="block border-b bg-gray-50 px-4 py-2 text-center font-medium text-base text-gray-700 dark:border-b-gray-600 dark:bg-gray-700 dark:text-gray-400">
				Quick Actions
			</div>
			<div className="grid grid-cols-2 gap-4 p-4">
				<Link
					to="/"
					className="block rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600"
				>
					<HiViewGrid className="mx-auto mb-1 h-7 w-7 text-gray-500 dark:text-gray-400" />
					<div className="font-medium text-gray-900 text-sm dark:text-white">
						Dashboard
					</div>
				</Link>
				<Link
					to="/settings"
					className="block rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600"
				>
					<HiCog className="mx-auto mb-1 h-7 w-7 text-gray-500 dark:text-gray-400" />
					<div className="font-medium text-gray-900 text-sm dark:text-white">
						Settings
					</div>
				</Link>
			</div>
		</Dropdown>
	);
}

interface UserDropdownProps {
	user: {
		name?: string;
		email?: string;
		pictureUrl?: string;
	} | null;
	onSignOut: () => void;
}

function UserDropdown({ user, onSignOut }: UserDropdownProps) {
	return (
		<Dropdown
			className="rounded"
			label={
				<span>
					<span className="sr-only">User menu</span>
					{user?.pictureUrl ? (
						<Avatar alt="" img={user.pictureUrl} rounded size="sm" />
					) : (
						<Avatar alt="" rounded size="sm">
							<HiUserCircle className="h-6 w-6" />
						</Avatar>
					)}
				</span>
			}
		>
			<DropdownHeader>
				<span className="block font-medium text-sm">
					{user?.name || "User"}
				</span>
				<span className="block truncate font-normal text-sm">
					{user?.email || "No email"}
				</span>
			</DropdownHeader>
			<DropdownItem>
				<HiUserCircle className="mr-2 h-4 w-4" />
				Profile
			</DropdownItem>
			<DropdownItem>
				<HiCog className="mr-2 h-4 w-4" />
				Settings
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem onClick={onSignOut}>
				<HiLogout className="mr-2 h-4 w-4" />
				Sign out
			</DropdownItem>
		</Dropdown>
	);
}
