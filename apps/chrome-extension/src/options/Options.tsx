import { Check, Globe, Key, Settings, User, X } from "lucide-react";
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
	apiUrl: string;
}

const Options: React.FC = () => {
	const [auth, setAuth] = useState<AuthState>({
		isAuthenticated: false,
		apiUrl: "http://127.0.0.1:3210", // Default for Convex development
	});
	const [patToken, _setPatToken] = useState("");
	const [customApiUrl, setCustomApiUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [debugInfo, setDebugInfo] = useState<any>(null);
	const [lastError, setLastError] = useState<string | null>(null);
	const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const result = await browser.storage.local.get([
				"pulseAuth",
				"pulseApiUrl",
			]);
			setDebugInfo(result); // Store debug info

			if (result.pulseAuth?.token) {
				setAuth({
					isAuthenticated: true,
					user: result.pulseAuth.user,
					workspace: result.pulseAuth.workspace,
					apiUrl: result.pulseApiUrl || "http://127.0.0.1:3210",
				});
			}

			setCustomApiUrl(result.pulseApiUrl || "http://127.0.0.1:3210");
		} catch (error) {
			console.error("Failed to load settings:", error);
		}
	};

	const handlePatLogin = async () => {
		setIsLoading(true);
		setMessage(null);

		try {
			// Send auth message to background script to open web app
			const response = await browser.runtime.sendMessage({
				action: "auth",
				data: {
					type: "pat",
					token: patToken.trim() || "web-auth", // Token not needed for web auth
					apiUrl: customApiUrl,
				},
			});

			if (response?.success) {
				if (response.result.type === "redirect") {
					setMessage({
						type: "success",
						text: response.result.message,
					});

					// Show manual confirmation button after opening web app
					setMessage({
						type: "success",
						text: 'Web app opened! After signing in, click "I\'m signed in" below.',
					});
					setAwaitingConfirmation(true);
					setIsLoading(false);
				} else {
					await loadSettings();
					setMessage({ type: "success", text: "Successfully authenticated!" });
				}
			} else {
				const errorMsg = response?.error || "Authentication failed";
				setLastError(`Background script error: ${errorMsg}`);
				throw new Error(errorMsg);
			}
		} catch (error) {
			console.error("Authentication failed:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Authentication failed";
			setLastError(`Full error: ${errorMessage}`);
			setMessage({
				type: "error",
				text: errorMessage,
			});
			setIsLoading(false);
		}
	};

	const handleConfirmAuth = async () => {
		setIsLoading(true);
		try {
			const response = await browser.runtime.sendMessage({
				action: "auth",
				data: { type: "confirm_auth" },
			});

			if (response?.success) {
				await loadSettings();
				setAwaitingConfirmation(false);
				setMessage({ type: "success", text: "Successfully authenticated!" });
			} else {
				throw new Error(response?.error || "Confirmation failed");
			}
		} catch (error) {
			console.error("Confirmation failed:", error);
			setMessage({
				type: "error",
				text: "Confirmation failed. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await browser.runtime.sendMessage({
				action: "auth",
				data: { type: "logout" },
			});

			setAuth({
				isAuthenticated: false,
				apiUrl: customApiUrl,
			});
			setAwaitingConfirmation(false);

			setMessage({ type: "success", text: "Successfully logged out" });
		} catch (error) {
			console.error("Logout failed:", error);
			setMessage({ type: "error", text: "Logout failed" });
		}
	};

	const handleApiUrlSave = async () => {
		try {
			await browser.storage.local.set({ pulseApiUrl: customApiUrl });
			setAuth((prev) => ({ ...prev, apiUrl: customApiUrl }));
			setMessage({ type: "success", text: "API URL saved" });
		} catch (error) {
			console.error("Failed to save API URL:", error);
			setMessage({ type: "error", text: "Failed to save API URL" });
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="mx-auto max-w-2xl px-4">
				<div className="rounded-lg border border-gray-200 bg-white shadow-sm">
					{/* Header */}
					<div className="border-gray-200 border-b px-6 py-4">
						<h1 className="flex items-center gap-2 font-semibold text-gray-900 text-xl">
							<Settings size={24} className="text-blue-600" />
							Pulse Web Clipper Settings
						</h1>
						<p className="mt-1 text-gray-600 text-sm">
							Configure your connection to Pulse
						</p>
					</div>

					<div className="px-6 py-6">
						{/* Message */}
						{message && (
							<div
								className={`mb-6 flex items-center gap-2 rounded-md p-4 ${
									message.type === "success"
										? "border border-green-200 bg-green-50 text-green-800"
										: "border border-red-200 bg-red-50 text-red-800"
								}`}
							>
								{message.type === "success" ? (
									<Check size={16} />
								) : (
									<X size={16} />
								)}
								{message.text}
							</div>
						)}

						{/* API URL Configuration */}
						<div className="mb-8">
							<h2 className="mb-4 flex items-center gap-2 font-medium text-gray-900 text-lg">
								<Globe size={20} />
								Pulse API URL
							</h2>
							<div className="space-y-4">
								<div>
									<label className="mb-2 block font-medium text-gray-700 text-sm">
										API Base URL
									</label>
									<div className="flex gap-2">
										<input
											type="url"
											value={customApiUrl}
											onChange={(e) => setCustomApiUrl(e.target.value)}
											className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
											placeholder="http://127.0.0.1:3210"
										/>
										<button
											onClick={handleApiUrlSave}
											className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
										>
											Save
										</button>
									</div>
									<p className="mt-1 text-gray-500 text-xs">
										Use http://127.0.0.1:3210 for development or your Pulse
										instance URL
									</p>
								</div>
							</div>
						</div>

						{/* Authentication Status */}
						<div className="mb-8">
							<h2 className="mb-4 flex items-center gap-2 font-medium text-gray-900 text-lg">
								<User size={20} />
								Authentication Status
							</h2>

							{auth.isAuthenticated ? (
								<div className="rounded-lg border border-green-200 bg-green-50 p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-green-800 text-sm">
												✓ Connected to Pulse
											</p>
											{auth.user && (
												<p className="mt-1 text-green-600 text-sm">
													Signed in as {auth.user.name} ({auth.user.email})
												</p>
											)}
											{auth.workspace && (
												<p className="text-green-600 text-sm">
													Workspace: {auth.workspace.name}
												</p>
											)}
										</div>
										<button
											onClick={handleLogout}
											className="rounded-md border border-red-300 px-3 py-1 text-red-600 text-sm hover:bg-red-50 hover:text-red-800"
										>
											Disconnect
										</button>
									</div>
								</div>
							) : (
								<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
									<p className="font-medium text-sm text-yellow-800">
										⚠ Not connected to Pulse
									</p>
									<p className="mt-1 text-sm text-yellow-600">
										Please authenticate below to start clipping content
									</p>
								</div>
							)}
						</div>

						{/* Web App Authentication */}
						{!auth.isAuthenticated && (
							<div className="mb-8">
								<h2 className="mb-4 flex items-center gap-2 font-medium text-gray-900 text-lg">
									<Key size={20} />
									Connect to Pulse
								</h2>
								<div className="space-y-4">
									<p className="text-gray-600 text-sm">
										Click the button below to authenticate with your Pulse
										account. This will open the Pulse web app where you can sign
										in.
									</p>
									{!awaitingConfirmation ? (
										<button
											onClick={handlePatLogin}
											disabled={isLoading}
											className={`w-full rounded-md px-4 py-2 font-medium ${
												isLoading
													? "cursor-not-allowed bg-gray-300 text-gray-500"
													: "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
											}`}
										>
											{isLoading ? "Opening web app..." : "Sign in to Pulse"}
										</button>
									) : (
										<button
											onClick={handleConfirmAuth}
											disabled={isLoading}
											className={`w-full rounded-md px-4 py-2 font-medium ${
												isLoading
													? "cursor-not-allowed bg-gray-300 text-gray-500"
													: "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
											}`}
										>
											{isLoading ? "Confirming..." : "I'm signed in to Pulse"}
										</button>
									)}
								</div>
							</div>
						)}

						{/* Usage Instructions */}
						<div>
							<h2 className="mb-4 font-medium text-gray-900 text-lg">
								How to Use
							</h2>
							<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
								<ol className="space-y-2 text-blue-800 text-sm">
									<li>
										1. Click "Sign in to Pulse" above to authenticate with your
										account
									</li>
									<li>2. Sign in to Pulse in the opened web app tab</li>
									<li>
										3. Return to this extension page - it will automatically
										detect your authentication
									</li>
									<li>4. Navigate to any webpage you want to clip</li>
									<li>
										5. Click the Pulse extension icon or use the context menu
									</li>
									<li>6. Choose your capture options and destination</li>
									<li>7. Click "Capture to Pulse" to save the content</li>
								</ol>
							</div>
						</div>
					</div>

					{/* Debug Section */}
					<div className="mt-8 border-t pt-8">
						<h2 className="mb-4 font-medium text-gray-900 text-lg">
							Debug Information
						</h2>
						<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
							<h3 className="mb-2 font-medium text-sm">Storage Contents:</h3>
							<pre className="mb-4 whitespace-pre-wrap text-gray-600 text-xs">
								{JSON.stringify(debugInfo, null, 2)}
							</pre>

							{lastError && (
								<div>
									<h3 className="mb-2 font-medium text-red-600 text-sm">
										Last Error:
									</h3>
									<pre className="mb-4 whitespace-pre-wrap rounded bg-red-50 p-2 text-red-600 text-xs">
										{lastError}
									</pre>
								</div>
							)}

							<div className="flex gap-2">
								<button
									onClick={loadSettings}
									className="rounded bg-gray-200 px-3 py-1 text-gray-700 text-xs hover:bg-gray-300"
								>
									Refresh Debug Info
								</button>

								<button
									onClick={async () => {
										try {
											const response = await fetch(
												`${customApiUrl}/api/clipper/auth`,
												{
													method: "POST",
													headers: {
														"Content-Type": "application/json",
														Authorization: "Bearer test-token",
													},
												},
											);
											const text = await response.text();
											setLastError(
												`Direct fetch test: Status ${response.status}, Body: ${text}`,
											);
										} catch (error) {
											console.error("Direct fetch test failed:", error);
											setLastError(
												`Direct fetch test failed: ${error instanceof Error ? error.message : error}`,
											);
										}
									}}
									className="rounded bg-blue-200 px-3 py-1 text-blue-700 text-xs hover:bg-blue-300"
								>
									Test API Endpoint
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Options;
