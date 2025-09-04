import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Button } from "flowbite-react";
import { CheckCircle, Copy, Key, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { AppLayout } from "@/components/layouts/dashboard/layout";
import { useWorkspace } from "@/hooks/useWorkspace";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const user = useQuery(api.users.getCurrentUser);
	const { currentWorkspace, isLoading } = useWorkspace();
	const apiKeys = useQuery(
		api.apiKeys.list,
		currentWorkspace ? { workspaceId: currentWorkspace._id } : "skip",
	);
	const deviceId = useId();
	const nameId = useId();

	const generateApiKey = useMutation(api.apiKeys.generate);
	const revokeApiKey = useMutation(api.apiKeys.revoke);

	const [isGenerating, setIsGenerating] = useState(false);
	const [showKeyModal, setShowKeyModal] = useState(false);
	const [newKey, setNewKey] = useState<{ key: string; name: string } | null>(
		null,
	);
	const [copiedKey, setCopiedKey] = useState(false);
	const [keyForm, setKeyForm] = useState({
		name: "",
		device: "chrome_extension",
		scopes: ["clipper:write", "workspace:read", "ideas:read", "ideas:write"],
	});

	// Show loading while checking auth status
	if (user === undefined || isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-32 w-32 animate-spin rounded-full border-blue-600 border-b-2" />
			</div>
		);
	}

	// If not authenticated, redirect to sign-in
	if (!user || !currentWorkspace) {
		return <Navigate to="/auth/sign-in" replace />;
	}

	const handleGenerateKey = async () => {
		if (!keyForm.name.trim()) return;

		setIsGenerating(true);
		try {
			const result = await generateApiKey({
				workspaceId: currentWorkspace._id,
				name: keyForm.name.trim(),
				device: keyForm.device,
				scopes: keyForm.scopes,
			});

			setNewKey({ key: result.key, name: keyForm.name });
			setShowKeyModal(true);
			setKeyForm({ ...keyForm, name: "" });
		} catch (error) {
			console.error("Failed to generate API key:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCopyKey = () => {
		if (newKey?.key) {
			navigator.clipboard.writeText(newKey.key);
			setCopiedKey(true);
			setTimeout(() => setCopiedKey(false), 2000);
		}
	};

	const handleRevokeKey = async (keyId: string) => {
		if (
			confirm(
				"Are you sure you want to revoke this API key? This action cannot be undone.",
			)
		) {
			try {
				await revokeApiKey({ apiKeyId: keyId as Id<"apiKeys"> });
			} catch (error) {
				console.error("Failed to revoke API key:", error);
			}
		}
	};

	const formatLastUsed = (timestamp?: number) => {
		if (!timestamp) return "Never";
		const date = new Date(timestamp);
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	};

	return (
		<AppLayout>
			<div className="space-y-8 p-6">
				{/* Header */}
				<div>
					<h1 className="mb-2 font-bold text-3xl text-gray-900 dark:text-white">
						Settings
					</h1>
					<p className="text-gray-600 text-lg dark:text-gray-400">
						Manage your account and application settings
					</p>
				</div>

				{/* API Keys Section */}
				<div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
					<div className="border-gray-200 border-b p-6 dark:border-gray-700">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
									<Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<h2 className="font-semibold text-gray-900 text-xl dark:text-white">
										API Keys
									</h2>
									<p className="text-gray-600 text-sm dark:text-gray-400">
										Manage API keys for integrations and extensions
									</p>
								</div>
							</div>
							<Button
								onClick={() =>
									setKeyForm({ ...keyForm, name: "Chrome Extension" })
								}
							>
								<Plus className="h-4 w-4" />
								Generate Key
							</Button>
						</div>
					</div>

					{/* Generate Key Form */}
					{keyForm.name && (
						<div className="border-gray-200 border-b bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
							<div className="space-y-4">
								<div>
									<label
										htmlFor="{nameId}"
										className="mb-2 block font-medium text-gray-900 text-sm dark:text-white"
									>
										Key Name
									</label>
									<input
										id={nameId}
										type="text"
										value={keyForm.name}
										onChange={(e) =>
											setKeyForm({ ...keyForm, name: e.target.value })
										}
										className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
										placeholder="e.g., Chrome Extension, Mobile App"
									/>
								</div>

								<div>
									<label
										htmlFor="{deviceId}"
										className="mb-2 block font-medium text-gray-900 text-sm dark:text-white"
									>
										Device Type
									</label>
									<select
										id={deviceId}
										value={keyForm.device}
										onChange={(e) =>
											setKeyForm({ ...keyForm, device: e.target.value })
										}
										className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
									>
										<option value="chrome_extension">Chrome Extension</option>
										<option value="mobile_app">Mobile App</option>
										<option value="cli">Command Line</option>
										<option value="other">Other</option>
									</select>
								</div>

								<div className="flex gap-3">
									<Button
										onClick={handleGenerateKey}
										disabled={isGenerating || !keyForm.name.trim()}
										className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-medium text-sm text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-400 dark:bg-blue-600 dark:focus:ring-blue-800 dark:hover:bg-blue-700"
									>
										{isGenerating ? (
											<>
												<div className="h-4 w-4 animate-spin rounded-full border-white border-b-2" />
												Generating...
											</>
										) : (
											<>
												<Key className="h-4 w-4" />
												Generate API Key
											</>
										)}
									</Button>
									<Button
										onClick={() => setKeyForm({ ...keyForm, name: "" })}
										className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-900 text-sm hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:focus:ring-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
									>
										Cancel
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* API Keys List */}
					<div className="p-6">
						{apiKeys === undefined ? (
							<div className="flex items-center justify-center py-8">
								<div className="h-6 w-6 animate-spin rounded-full border-blue-600 border-b-2" />
							</div>
						) : apiKeys.length === 0 ? (
							<div className="py-8 text-center">
								<Key className="mx-auto h-12 w-12 text-gray-400" />
								<h3 className="mt-2 font-medium text-gray-900 text-sm dark:text-white">
									No API keys
								</h3>
								<p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
									Generate your first API key to start using integrations.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-gray-500 text-sm dark:text-gray-400">
									<thead className="bg-gray-50 text-gray-700 text-xs uppercase dark:bg-gray-700 dark:text-gray-400">
										<tr>
											<th className="px-4 py-3">Name</th>
											<th className="px-4 py-3">Key</th>
											<th className="px-4 py-3">Device</th>
											<th className="px-4 py-3">Last Used</th>
											<th className="px-4 py-3">Created</th>
											<th className="px-4 py-3">Actions</th>
										</tr>
									</thead>
									<tbody>
										{apiKeys.map((key) => (
											<tr
												key={key.id}
												className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
											>
												<td className="whitespace-nowrap px-4 py-4 font-medium text-gray-900 dark:text-white">
													{key.name}
												</td>
												<td className="px-4 py-4">
													<code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">
														{key.prefix}...
													</code>
												</td>
												<td className="px-4 py-4">
													<span className="rounded bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-300">
														{key.device.replace("_", " ")}
													</span>
												</td>
												<td className="px-4 py-4 text-sm">
													{formatLastUsed(key.lastUsed)}
												</td>
												<td className="px-4 py-4 text-sm">
													{new Date(key.createdAt).toLocaleDateString()}
												</td>
												<td className="px-4 py-4">
													<Button
														onClick={() => handleRevokeKey(key.id)}
														className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
													>
														<Trash2 className="h-4 w-4" />
														Revoke
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>

				{/* Usage Instructions */}
				<div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-4 font-semibold text-gray-900 text-lg dark:text-white">
						Using API Keys
					</h3>
					<div className="space-y-3 text-gray-600 text-sm dark:text-gray-400">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
								<span className="font-medium text-blue-600 text-xs dark:text-blue-400">
									1
								</span>
							</div>
							<p>
								<strong>Chrome Extension:</strong> Copy your API key and paste
								it into the extension settings page
							</p>
						</div>
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
								<span className="font-medium text-blue-600 text-xs dark:text-blue-400">
									2
								</span>
							</div>
							<p>
								<strong>API Requests:</strong> Include the key in the
								Authorization header:{" "}
								<code className="rounded bg-gray-100 px-1 dark:bg-gray-700">
									Bearer pk_live_...
								</code>
							</p>
						</div>
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
								<span className="font-medium text-blue-600 text-xs dark:text-blue-400">
									3
								</span>
							</div>
							<p>
								<strong>Security:</strong> Keep your API keys secure and revoke
								them if compromised
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* New Key Modal */}
			{showKeyModal && newKey && (
				<div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
					<div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg dark:bg-gray-800">
						<div className="mt-3 text-center">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
								<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="mt-4 font-medium text-gray-900 text-lg leading-6 dark:text-white">
								API Key Generated!
							</h3>
							<div className="mt-4 px-7 py-3">
								<p className="mb-4 text-gray-500 text-sm dark:text-gray-400">
									<strong>Important:</strong> Copy this key now. You won't be
									able to see it again.
								</p>
								<div className="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
									<div className="flex items-center justify-between">
										<code className="break-all font-mono text-gray-900 text-sm dark:text-white">
											{newKey.key}
										</code>
										<Button
											onClick={handleCopyKey}
											className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
										>
											{copiedKey ? (
												<CheckCircle className="h-4 w-4 text-green-600" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>
								<div className="flex gap-3">
									<Button
										onClick={handleCopyKey}
										className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 font-medium text-sm text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
									>
										<Copy className="h-4 w-4" />
										{copiedKey ? "Copied!" : "Copy Key"}
									</Button>
									<Button
										onClick={() => {
											setShowKeyModal(false);
											setNewKey(null);
											setCopiedKey(false);
										}}
										className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-900 text-sm hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
									>
										Close
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</AppLayout>
	);
}
