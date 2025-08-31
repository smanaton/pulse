import {
	Bookmark,
	Camera,
	ChevronDown,
	Folder,
	Globe,
	LogOut,
	Plus,
	Type,
	User,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

interface AuthState {
	isAuthenticated: boolean;
	user?: {
		name: string;
		email: string;
	};
	workspace?: {
		id: string;
		name: string;
	};
}

interface CaptureState {
	type: "bookmark" | "article" | "selection" | "screenshot";
	destination: "new" | "existing";
	selectedNote?: string;
	selectedWorkspace?: string;
	tags: string[];
	isProcessing: boolean;
}

interface Workspace {
	_id: string;
	name: string;
	isDefault?: boolean;
}

interface RecentIdea {
	_id: string;
	title: string;
	createdAt: number;
}

const Popup: React.FC = () => {
	const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false });
	const [capture, setCapture] = useState<CaptureState>({
		type: "bookmark",
		destination: "new",
		tags: [],
		isProcessing: false,
	});
	const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [recentIdeas, setRecentIdeas] = useState<RecentIdea[]>([]);

	useEffect(() => {
		// Load current tab info
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]) {
				setCurrentTab(tabs[0]);
			}
		});

		// Check authentication status
		checkAuthStatus();

		// Listen for storage changes (when user authenticates in options page)
		const handleStorageChange = (changes: any, areaName: string) => {
			if (areaName === "local" && changes.pulseAuth) {
				checkAuthStatus();
			}
		};

		browser.storage.onChanged.addListener(handleStorageChange);

		// Cleanup listener on unmount
		return () => {
			browser.storage.onChanged.removeListener(handleStorageChange);
		};
	}, []);

	// Load workspaces and recent ideas when authenticated
	useEffect(() => {
		if (auth.isAuthenticated) {
			loadWorkspaces();
			if (capture.selectedWorkspace) {
				loadRecentIdeas(capture.selectedWorkspace);
			}
		}
	}, [auth.isAuthenticated, capture.selectedWorkspace]);

	const checkAuthStatus = async () => {
		try {
			const result = await browser.storage.local.get(["pulseAuth"]);

			// Check for web app authentication
			if (result.pulseAuth?.fromWebApp) {
				// Check if session is still valid
				const sessionValidUntil = result.pulseAuth.sessionValidUntil || 0;
				if (Date.now() < sessionValidUntil) {
					setAuth({
						isAuthenticated: true,
						user: result.pulseAuth.user,
						workspace: result.pulseAuth.workspace,
					});
					return;
				}
				await browser.storage.local.remove(["pulseAuth"]);
				setAuth({ isAuthenticated: false });
				return;
			}

			// Check for API key auth
			if (result.pulseAuth?.token) {
				setAuth({
					isAuthenticated: true,
					user: result.pulseAuth.user,
					workspace: result.pulseAuth.workspace,
				});
				return;
			}

			// If no stored auth, user needs to authenticate via options page

			setAuth({ isAuthenticated: false });
		} catch (error) {
			console.error("Auth check failed:", error);
			setAuth({ isAuthenticated: false });
		}
	};

	const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

	const handleLogin = async () => {
		try {
			const response = await browser.runtime.sendMessage({
				action: "auth",
				data: {
					type: "pat",
					token: "web-auth",
				},
			});


			if (response && response.success && response.result.type === "redirect") {
				setAwaitingConfirmation(true);
			}
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	const handleApiKeyAuth = async (token: string) => {
		if (!token.trim()) return;

		setIsConnecting(true);
		try {
			const response = await browser.runtime.sendMessage({
				action: "auth",
				data: {
					type: "api_key",
					token: token.trim(),
				},
			});

			if (response && response.success) {
				await checkAuthStatus();
				setApiKey("");
			} else {
				console.error("API key authentication failed:", response?.error);
			}
		} catch (error) {
			console.error("API key authentication failed:", error);
		} finally {
			setIsConnecting(false);
		}
	};

	const handleLogout = async () => {
		await browser.storage.local.remove(["pulseAuth"]);
		setAuth({ isAuthenticated: false });
		setAwaitingConfirmation(false);
	};

	const handleCapture = async () => {
		if (!auth.isAuthenticated || !currentTab) return;

		setCapture((prev) => ({ ...prev, isProcessing: true }));

		try {
				url: currentTab.url,
				title: currentTab.title,
				type: capture.type,
				destination: capture.destination,
				selectedNote: capture.selectedNote,
				selectedWorkspace: capture.selectedWorkspace,
				tags: capture.tags,
			});

			// Send message to background script to handle capture
			const response = await browser.runtime.sendMessage({
				action: "capture",
				data: {
					url: currentTab.url,
					title: currentTab.title,
					type: capture.type,
					destination: capture.destination,
					selectedNote: capture.selectedNote,
					selectedWorkspace: capture.selectedWorkspace,
					tags: capture.tags,
				},
			});


			if (response && response.success) {
				// Close popup after successful capture
				window.close();
			} else {
				console.error("Capture failed with response:", response);
				alert(`Capture failed: ${response?.error || "Unknown error"}`);
				setCapture((prev) => ({ ...prev, isProcessing: false }));
			}
		} catch (error) {
			console.error("Capture failed:", error);
			alert(
				`Capture failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			setCapture((prev) => ({ ...prev, isProcessing: false }));
		}
	};

	const addTag = (tag: string) => {
		if (tag && !capture.tags.includes(tag)) {
			setCapture((prev) => ({
				...prev,
				tags: [...prev.tags, tag],
			}));
		}
	};

	const removeTag = (tag: string) => {
		setCapture((prev) => ({
			...prev,
			tags: prev.tags.filter((t) => t !== tag),
		}));
	};

	const [apiKey, setApiKey] = useState("");
	const [isConnecting, setIsConnecting] = useState(false);

	const loadWorkspaces = async () => {
		try {
			const authResult = await browser.storage.local.get(["pulseAuth"]);
			if (!authResult.pulseAuth?.token) return;

			const response = await browser.runtime.sendMessage({
				action: "getWorkspaces",
			});

			if (response && response.success) {
				setWorkspaces(response.workspaces || []);

				// Set default workspace if not already selected
				if (!capture.selectedWorkspace && response.workspaces?.length > 0) {
					// Prioritize finding a personal/default workspace first
					const personalWorkspace = response.workspaces.find(
						(w: Workspace) =>
							w.name.toLowerCase().includes("personal") || w.isDefault,
					);
					const selectedWorkspace = personalWorkspace || response.workspaces[0];
					setCapture((prev) => ({
						...prev,
						selectedWorkspace: selectedWorkspace._id,
					}));
				}
			}
		} catch (error) {
			console.error("Failed to load workspaces:", error);
		}
	};

	const loadRecentIdeas = async (workspaceId: string) => {
		try {
			const response = await browser.runtime.sendMessage({
				action: "getRecentIdeas",
				data: { workspaceId, limit: 10 },
			});

			if (response && response.success) {
				setRecentIdeas(response.ideas || []);
			}
		} catch (error) {
			console.error("Failed to load recent ideas:", error);
		}
	};

	if (!auth.isAuthenticated) {
		return (
			<div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
				<div className="gradient-auth-header p-6 text-center">
					<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
						<Bookmark className="h-7 w-7 text-white" />
					</div>
					<h1 className="font-semibold text-white text-xl">
						Pulse Web Clipper
					</h1>
					<p className="mt-2 text-blue-100 text-sm">
						Connect your extension to Pulse using an API key
					</p>
				</div>

				<div className="space-y-5 p-6">
					<div>
						<label className="mb-2 block font-medium text-gray-700 text-sm">
							API Key
						</label>
						<input
							type="password"
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="pk_live_..."
						/>
					</div>

					<button
						onClick={() => handleApiKeyAuth(apiKey)}
						disabled={isConnecting || !apiKey.trim()}
						className={`capture-button w-full ${isConnecting ? "animate-pulse-subtle" : ""}`}
					>
						{isConnecting ? "Connecting..." : "Connect to Pulse"}
					</button>

					<div className="border-gray-200 border-t pt-4 text-center">
						<p className="mb-3 text-gray-500 text-xs">Don't have an API key?</p>
						<button
							onClick={() =>
								chrome.tabs.create({ url: "http://localhost:3003/settings" })
							}
							className="font-medium text-blue-600 text-sm transition-colors hover:text-blue-800 hover:underline"
						>
							Generate API key in Pulse →
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
			{/* Header */}
			<div className="gradient-header p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
							<Bookmark className="h-5 w-5 text-white" />
						</div>
						<div>
							<h1 className="font-semibold text-sm text-white">
								Pulse Clipper
							</h1>
							<p className="flex items-center gap-1 text-blue-100 text-xs">
								<Globe className="h-3 w-3" />
								{workspaces.find((w) => w._id === capture.selectedWorkspace)
									?.name ||
									auth.workspace?.name ||
									"Default Workspace"}
							</p>
						</div>
					</div>
					<button
						onClick={handleLogout}
						className="rounded-lg p-2 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
						title="Sign out"
					>
						<LogOut className="h-4 w-4" />
					</button>
				</div>
			</div>

			<div className="p-4">
				{/* Current page info */}
				{currentTab && (
					<div className="page-info-gradient mb-4 rounded-xl border border-gray-200 p-3">
						<div className="mb-1 truncate font-semibold text-gray-900 text-sm">
							{currentTab.title || "Untitled"}
						</div>
						<div className="flex items-center gap-1 truncate text-gray-600 text-xs">
							<Globe className="h-3 w-3" />
							{new URL(currentTab.url || "").hostname}
						</div>
					</div>
				)}

				{/* Capture options */}
				<div className="space-y-4">
					<div>
						<label className="mb-2 block font-semibold text-gray-900 text-sm">
							Capture Mode
						</label>
						<div className="grid grid-cols-2 gap-2">
							{[
								{
									value: "bookmark",
									label: "Bookmark",
									icon: Bookmark,
									desc: "Save URL & title",
								},
								{
									value: "article",
									label: "Article",
									icon: Type,
									desc: "Extract content",
								},
								{
									value: "selection",
									label: "Selection",
									icon: User,
									desc: "Selected text",
								},
								{
									value: "screenshot",
									label: "Screenshot",
									icon: Camera,
									desc: "Visible area",
								},
							].map(({ value, label, icon: Icon, desc }) => (
								<button
									key={value}
									onClick={() =>
										setCapture((prev) => ({ ...prev, type: value as any }))
									}
									className={`rounded-lg border-2 p-2 text-left transition-all duration-200 ${
										capture.type === value
											? "border-blue-500 bg-blue-50 shadow-sm"
											: "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
									}`}
								>
									<div className="flex items-start gap-2">
										<Icon
											className={`h-4 w-4 flex-shrink-0 ${
												capture.type === value
													? "text-blue-600"
													: "text-gray-600"
											}`}
										/>
										<div>
											<div
												className={`font-medium text-xs ${
													capture.type === value
														? "text-blue-900"
														: "text-gray-900"
												}`}
											>
												{label}
											</div>
											<div
												className={`text-xs ${
													capture.type === value
														? "text-blue-600"
														: "text-gray-600"
												}`}
											>
												{desc}
											</div>
										</div>
									</div>
								</button>
							))}
						</div>
					</div>

					{/* Workspace Selection - only show if multiple workspaces */}
					{workspaces.length > 1 && (
						<div>
							<label className="mb-2 block font-semibold text-gray-900 text-sm">
								Workspace
							</label>
							<div className="relative">
								<select
									value={capture.selectedWorkspace || ""}
									onChange={(e) =>
										setCapture((prev) => ({
											...prev,
											selectedWorkspace: e.target.value,
										}))
									}
									className="block w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 p-2 pr-8 text-gray-900 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								>
									<option value="">Select workspace...</option>
									{workspaces.map((workspace) => (
										<option key={workspace._id} value={workspace._id}>
											{workspace.name} {workspace.isDefault ? "(Default)" : ""}
										</option>
									))}
								</select>
								<ChevronDown className="pointer-events-none absolute top-2.5 right-2 h-4 w-4 text-gray-400" />
							</div>
						</div>
					)}

					<div>
						<label className="mb-2 block font-semibold text-gray-900 text-sm">
							Save to
						</label>
						<div className="flex overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
							{[
								{ value: "new", label: "New Idea" },
								{ value: "existing", label: "Existing Note" },
							].map(({ value, label }, index) => (
								<button
									key={value}
									onClick={() =>
										setCapture((prev) => ({
											...prev,
											destination: value as any,
										}))
									}
									className={`flex-1 px-3 py-2 font-medium text-sm transition-all duration-200 ${
										index === 0 ? "border-gray-200 border-r" : ""
									} ${
										capture.destination === value
											? "bg-blue-600 text-white shadow-sm"
											: "bg-transparent text-gray-700 hover:bg-white hover:shadow-sm"
									}`}
								>
									{label}
								</button>
							))}
						</div>
					</div>

					{/* Existing Note Selection */}
					{capture.destination === "existing" && (
						<div>
							<label className="mb-2 block font-semibold text-gray-900 text-sm">
								Select Existing Note
							</label>
							<div className="relative">
								<select
									value={capture.selectedNote || ""}
									onChange={(e) =>
										setCapture((prev) => ({
											...prev,
											selectedNote: e.target.value,
										}))
									}
									className="block w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 p-2 pr-8 pl-8 text-gray-900 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
									disabled={!recentIdeas.length}
								>
									<option value="">Select note...</option>
									{recentIdeas.map((idea) => (
										<option key={idea._id} value={idea._id}>
											{idea.title}
										</option>
									))}
								</select>
								<Folder className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
								<ChevronDown className="pointer-events-none absolute top-2.5 right-2 h-4 w-4 text-gray-400" />
							</div>
							{!recentIdeas.length && capture.selectedWorkspace && (
								<p className="mt-1 text-gray-500 text-xs">
									No recent notes found in this workspace
								</p>
							)}
						</div>
					)}

					{/* Tags */}
					<div>
						<label className="mb-2 block font-semibold text-gray-900 text-sm">
							Tags
						</label>
						<div className="mb-2 flex flex-wrap gap-1">
							{capture.tags.map((tag) => (
								<span key={tag} className="tag-badge">
									{tag}
									<button
										onClick={() => removeTag(tag)}
										className="tag-remove-btn"
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							))}
						</div>
						<div className="relative">
							<input
								type="text"
								placeholder="Add tags (press Enter)"
								className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-8 text-gray-900 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										const target = e.target as HTMLInputElement;
										addTag(target.value.trim());
										target.value = "";
									}
								}}
							/>
							<Plus className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
						</div>
					</div>

					{/* Capture button */}
					<button
						onClick={handleCapture}
						disabled={capture.isProcessing}
						className={`capture-button w-full ${capture.isProcessing ? "animate-pulse-subtle" : ""}`}
					>
						{capture.isProcessing ? "Capturing..." : "Capture to Pulse"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Popup;
