import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@pulse/backend";
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
import {
	HiBell,
	HiCog,
	HiLogout,
	HiMenuAlt1,
	HiSearch,
	HiUserCircle,
	HiViewGrid,
} from "react-icons/hi";
import { RouterLink } from "@/components/primitives/RouterLink";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ThemeToggle } from "./theme-toggle";

interface DashboardNavbarProps {
	hideSearch?: boolean;
}

export function DashboardNavbar({ hideSearch = false }: DashboardNavbarProps) {
	const _isDesktop = useMediaQuery("(min-width: 1024px)");
	const user = useQuery(api.users.getCurrentUser);
	const { signOut } = useAuthActions();

	// This function is only used when sidebar exists (hideSearch = false)
	function handleToggleSidebar() {
		// This will only be called from SidebarLayout context
	}

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	return (
		<Navbar
			fluid
			className={`fixed top-0 z-30 w-full border-0 p-0 sm:p-0 ${hideSearch ? "bg-gray-900 dark:bg-gray-900" : "border-gray-200 border-b bg-white dark:border-gray-700 dark:bg-gray-800"}`}
		>
			<div className="w-full p-3 pr-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						{!hideSearch && (
							<button
								type="button"
								onClick={handleToggleSidebar}
								className="mr-3 cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
							>
								<span className="sr-only">Toggle sidebar</span>
								{/* mobile */}
								<div className="lg:hidden">
									<HiMenuAlt1 className="h-6 w-6" />
								</div>
								{/* desktop */}
								<div className="hidden lg:block">
									<HiMenuAlt1 className="h-6 w-6" />
								</div>
							</button>
						)}
						<NavbarBrand as={RouterLink} href="/" className="mr-14">
							<span
								className={`self-center whitespace-nowrap font-semibold text-2xl ${hideSearch ? "text-white" : "dark:text-white"}`}
							>
								Pulse
							</span>
						</NavbarBrand>
						{!hideSearch && (
							<form className="hidden lg:block lg:pl-2">
								<Label htmlFor="search" className="sr-only">
									Search
								</Label>
								<TextInput
									className="w-full lg:w-96"
									icon={HiSearch}
									id="search"
									name="search"
									placeholder="Search"
									required
									type="search"
								/>
							</form>
						)}
					</div>
					<div className="flex items-center lg:gap-3">
						<div className="flex items-center">
							{!hideSearch && (
								<button className="cursor-pointer rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 lg:hidden dark:text-gray-400 dark:focus:bg-gray-700 dark:focus:ring-gray-700 dark:hover:bg-gray-700 dark:hover:text-white">
									<span className="sr-only">Search</span>
									<HiSearch className="h-6 w-6" />
								</button>
							)}
							<NotificationBellDropdown hideSearch={hideSearch} />
							<AppDrawerDropdown hideSearch={hideSearch} />
							<ThemeToggle hideSearch={hideSearch} />
							<div className="ml-3 flex items-center">
								<UserDropdown
									user={user}
									onSignOut={handleSignOut}
									hideSearch={hideSearch}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Navbar>
	);
}

/**
 * Custom Dashboard Navbar - Minimal design for dashboard
 * Only logo on left, user menu/notifications/dark mode on right
 * No border, integrates with dashboard background
 */
export function CustomDashboardNavbar({
	hideSearch = true,
}: {
	hideSearch?: boolean;
} = {}) {
	const user = useQuery(api.users.getCurrentUser);
	const { signOut } = useAuthActions();

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	return (
		<div className="fixed top-0 right-0 left-0 z-30 bg-gray-50 dark:bg-gray-900">
			<div className="w-full px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Logo on left */}
					<div className="flex items-center">
						<RouterLink
							href="/"
							className="font-semibold text-2xl text-gray-900 dark:text-white"
						>
							Pulse
						</RouterLink>
					</div>

					{/* User menu, notifications, dark mode on right */}
					<div className="flex items-center gap-4">
						<NotificationBellDropdown hideSearch={true} />
						<ThemeToggle hideSearch={true} />
						<UserDropdown
							user={user}
							onSignOut={handleSignOut}
							hideSearch={true}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

interface NotificationBellDropdownProps {
	hideSearch?: boolean;
}

function NotificationBellDropdown({
	hideSearch = false,
}: NotificationBellDropdownProps) {
	return (
		<Dropdown
			className="rounded"
			arrowIcon={false}
			inline
			label={
				<span
					className={`rounded-lg p-2 transition-colors ${hideSearch ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"}`}
				>
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

interface AppDrawerDropdownProps {
	hideSearch?: boolean;
}

function AppDrawerDropdown({ hideSearch = false }: AppDrawerDropdownProps) {
	return (
		<Dropdown
			className="rounded"
			arrowIcon={false}
			inline
			label={
				<span
					className={`rounded-lg p-2 transition-colors ${hideSearch ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"}`}
				>
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
	user: any;
	onSignOut: () => void;
	hideSearch?: boolean;
}

function UserDropdown({
	user,
	onSignOut,
	hideSearch = false,
}: UserDropdownProps) {
	return (
		<Dropdown
			className="rounded"
			arrowIcon={false}
			inline
			label={
				<span>
					<span className="sr-only">User menu</span>
					{user?.image ? (
						<Avatar alt="" img={user.image} rounded size="sm" />
					) : (
						<Avatar alt="" rounded size="sm">
							<HiUserCircle className="h-6 w-6" />
						</Avatar>
					)}
				</span>
			}
		>
			<DropdownHeader className="px-4 py-3">
				<span className="block text-sm">{user?.name || "User"}</span>
				<span className="block truncate font-medium text-sm">
					{user?.email || "user@example.com"}
				</span>
			</DropdownHeader>
			<DropdownItem as={Link} to="/">
				Dashboard
			</DropdownItem>
			<DropdownItem as={Link} to="/settings">
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
