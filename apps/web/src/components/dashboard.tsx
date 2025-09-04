import { api } from "@pulse/backend";
import { useNavigate } from "@tanstack/react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { Kbd, Spinner, Textarea } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";
import {
	Calendar,
	CheckSquare,
	CloudSun,
	FolderOpen,
	Gauge,
	Lightbulb,
	Mail,
	MapPin,
	MessageCircle,
	Mic,
	Paperclip,
	Plus,
	Send,
	Sparkles,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useCurrentWorkspaceId } from "@/hooks/useWorkspace";
import Loader from "./loader";
import { NavigationCard } from "./primitives/NavigationCard";

// Message interface for type safety
interface MessageData {
	message: string;
}

// Message Bubble Component - moved outside to avoid recreation on every render
const MessageBubble = ({
	message,
	type,
}: {
	message: MessageData;
	type: "user" | "ai";
}) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.2, ease: "easeOut" }}
		className={`flex ${type === "user" ? "justify-end" : "justify-start"} mb-3`}
	>
		<div
			className={`max-w-[70%] rounded-xl px-3 py-2 ${
				type === "user"
					? "bg-blue-500 text-sm text-white"
					: "border border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
			}`}
		>
			{type === "ai" && (
				<div className="mb-1 flex items-center gap-1">
					<Sparkles className="h-3 w-3 text-blue-400" />
					<span className="font-medium text-blue-400 text-xs">Pulse AI</span>
				</div>
			)}
			<div className="whitespace-pre-wrap text-sm leading-relaxed">
				{message.message}
			</div>
		</div>
	</motion.div>
);

// Typing Indicator Component - moved outside to avoid recreation
const TypingIndicator = () => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		exit={{ opacity: 0, y: -10 }}
		transition={{ duration: 0.2 }}
		className="mb-3 flex justify-start"
	>
		<div className="rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
			<div className="mb-1 flex items-center gap-1">
				<Sparkles className="h-3 w-3 text-blue-400" />
				<span className="font-medium text-blue-400 text-xs">Pulse AI</span>
			</div>
			<div className="flex items-center gap-1">
				<motion.div
					animate={{ y: [0, -3, 0] }}
					transition={{
						duration: 0.6,
						repeat: Number.POSITIVE_INFINITY,
						delay: 0,
					}}
					className="h-1.5 w-1.5 rounded-full bg-gray-400"
				/>
				<motion.div
					animate={{ y: [0, -3, 0] }}
					transition={{
						duration: 0.6,
						repeat: Number.POSITIVE_INFINITY,
						delay: 0.1,
					}}
					className="h-1.5 w-1.5 rounded-full bg-gray-400"
				/>
				<motion.div
					animate={{ y: [0, -3, 0] }}
					transition={{
						duration: 0.6,
						repeat: Number.POSITIVE_INFINITY,
						delay: 0.2,
					}}
					className="h-1.5 w-1.5 rounded-full bg-gray-400"
				/>
			</div>
		</div>
	</motion.div>
);

export function Dashboard() {
	const user = useQuery(api.users.getCurrentUser);
	const workspaceId = useCurrentWorkspaceId();
	const processMessage = useAction(api.ai.processMessage);
	const navigate = useNavigate();

	// Mutation for updating navigation preferences - moved here to fix hook order
	const updateNavPreferences = useMutation(
		api.navigationPreferences.updateNavigationPreferences,
	);

	// Conversation State
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const [conversationHistory, setConversationHistory] = useState<
		Array<{
			id: string;
			type: "user" | "ai";
			message: string;
			timestamp: number;
		}>
	>([]);
	const [isConversing, setIsConversing] = useState(false);
	const [_showWelcome, setShowWelcome] = useState(true);

	// Refs
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// Icon mapping for dynamic icons - memoized to prevent recreation
	const iconMap = React.useMemo(
		() => ({
			Gauge,
			Lightbulb,
			FolderOpen,
			CheckSquare,
			Calendar,
			Mail,
			MessageCircle,
			Plus,
		}),
		[],
	);

	// Get user navigation preferences from database
	const navigationPreferences = useQuery(
		api.navigationPreferences.getUserNavigationPreferences,
		workspaceId ? { workspaceId } : "skip",
	);

	// Navigation items - dynamic from database or fallback to defaults
	const navigationItems = React.useMemo(() => {
		if (!navigationPreferences) {
			// Fallback to default items while loading
			return [
				{ id: "dashboard", name: "Dashboard", icon: Gauge, href: "/dashboard" },
				{ id: "ideas", name: "Ideas", icon: Lightbulb, href: "/ideas" },
				{
					id: "projects",
					name: "Projects",
					icon: FolderOpen,
					href: "/projects",
				},
				{ id: "todo", name: "To-do", icon: CheckSquare, href: "/todo" },
				{ id: "calendar", name: "Calendar", icon: Calendar, href: "/calendar" },
				{ id: "email", name: "E-mail", icon: Mail, badge: 13, href: "/email" },
				{
					id: "chat",
					name: "Chat",
					icon: MessageCircle,
					badge: 3,
					href: "/chat",
				},
			];
		}

		// Map database applications to navigation items
		return navigationPreferences.applications
			.filter((app) => app.isVisible)
			.sort((a, b) => a.sortOrder - b.sortOrder)
			.map((app) => ({
				id: app.id,
				name: app.name,
				icon: iconMap[app.icon as keyof typeof iconMap] || Gauge, // Fallback to Gauge if icon not found
				href: app.href,
				badge: app.badge ? Number.parseInt(app.badge, 10) : undefined,
			}));
	}, [navigationPreferences, iconMap]);

	// Show loading if we don't have a workspace yet
	if (!workspaceId) {
		return <Loader />;
	}

	// Intent detection for navigation
	const detectIntent = (message: string, aiResponse: string) => {
		const lowerMessage = message.toLowerCase();
		const _lowerResponse = aiResponse.toLowerCase();

		// Navigation intents
		if (
			lowerMessage.includes("task") ||
			lowerMessage.includes("todo") ||
			lowerMessage.includes("to-do")
		) {
			return { type: "navigate", target: "/tasks" };
		}
		if (lowerMessage.includes("idea") || lowerMessage.includes("brainstorm")) {
			return { type: "navigate", target: "/ideas" };
		}
		if (
			lowerMessage.includes("calendar") ||
			lowerMessage.includes("schedule") ||
			lowerMessage.includes("meeting")
		) {
			return { type: "navigate", target: "/calendar" };
		}
		if (lowerMessage.includes("project")) {
			return { type: "navigate", target: "/projects" };
		}
		if (lowerMessage.includes("email") || lowerMessage.includes("mail")) {
			return { type: "navigate", target: "/email" };
		}

		// Stay in conversation for general chat
		return { type: "conversation" };
	};

	// Auto-scroll to bottom of chat
	const scrollToBottom = () => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTo({
				top: chatContainerRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	};

	// Handle AI message submission
	const handleSend = async () => {
		if (!input.trim() || loading) return;

		const userMessage = input.trim();
		const messageId = Date.now().toString();

		// Add user message to history
		const userMessageObj = {
			id: messageId,
			type: "user" as const,
			message: userMessage,
			timestamp: Date.now(),
		};

		setConversationHistory((prev) => [...prev, userMessageObj]);
		setInput("");
		setLoading(true);

		// Trigger welcome screen animation if first message
		if (!isConversing) {
			setIsConversing(true);
			setShowWelcome(false);
		}

		// Show typing indicator
		setIsTyping(true);

		try {
			const result = await processMessage({
				message: userMessage,
				workspaceId,
			});

			setIsTyping(false);

			// Add AI response to history
			const aiMessageObj = {
				id: `${messageId}_ai`,
				type: "ai" as const,
				message: result.text,
				timestamp: Date.now(),
			};

			setConversationHistory((prev) => [...prev, aiMessageObj]);

			// Detect intent and handle navigation
			const intent = detectIntent(userMessage, result.text);

			if (intent.type === "navigate" && intent.target) {
				// Brief delay to show response before navigating
				setTimeout(() => {
					navigate({ to: intent.target });
				}, 1500);
			}

			// Scroll to bottom
			setTimeout(scrollToBottom, 100);
		} catch (error) {
			console.error("AI Error:", error);
			setIsTyping(false);

			const errorMessage = {
				id: `${messageId}_error`,
				type: "ai" as const,
				message:
					"Sorry, I encountered an error processing your request. Please try again.",
				timestamp: Date.now(),
			};

			setConversationHistory((prev) => [...prev, errorMessage]);
		} finally {
			setLoading(false);
		}
	};

	// Handle suggested prompt clicks
	const _handlePromptClick = (prompt: string) => {
		setInput(prompt);
	};

	// Handle customize button click
	const handleCustomizeClick = () => {
		// TODO: Implement customization modal/drawer
		// For now, let's toggle visibility of analytics as a demo
		if (workspaceId && navigationPreferences) {
			const updatedApps = navigationPreferences.applications.map((app) =>
				app.id === "analytics" ? { ...app, isVisible: !app.isVisible } : app,
			);

			updateNavPreferences({
				workspaceId,
				applications: updatedApps,
			}).catch((error) => {
				console.error("Failed to update navigation preferences:", error);
			});
		}
	};

	// Handle Enter key submission
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
			handleSend();
		}
	};

	// Weather data
	const currentDate = new Date();
	const temperature = 31;

	return (
		<>
			{/* Weather Widget - Fixed in top-right corner */}
			<div className="fixed top-24 right-6 z-10 flex items-center gap-4 rounded-lg border border-gray-300 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
				<CloudSun className="h-12 w-12 flex-shrink-0 text-yellow-400" />
				<div className="space-y-1 text-right">
					<div className="font-light text-2xl text-gray-900 dark:text-white">
						{temperature}°C
					</div>
					<div className="text-gray-600 text-sm dark:text-gray-400">
						{currentDate.toLocaleDateString("en-US", {
							weekday: "long",
						})}
					</div>
					<div className="text-gray-500 text-xs dark:text-gray-500">
						{currentDate.toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
						})}
					</div>
					<div className="flex items-center justify-end gap-1 text-gray-500 text-xs dark:text-gray-500">
						<MapPin className="h-3 w-3" />
						<span>New York</span>
					</div>
				</div>
			</div>

			{/* Main Content Layout - Dynamic based on conversation state */}
			<motion.div layout className="flex flex-col">
				{/* Chat Container - Only visible when conversing */}
				<AnimatePresence mode="wait">
					{isConversing && (
						<motion.div
							key="chat-container"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.4, ease: "easeOut" }}
							className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden px-6"
						>
							{/* Chat History */}
							<div
								ref={chatContainerRef}
								className="flex-1 space-y-2 overflow-y-auto pt-8 pb-4"
							>
								<AnimatePresence>
									{conversationHistory.map((message) => (
										<MessageBubble
											key={message.id}
											message={message}
											type={message.type}
										/>
									))}
									{isTyping && <TypingIndicator />}
								</AnimatePresence>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Welcome Screen - Only visible when not conversing */}
				<AnimatePresence mode="wait">
					{!isConversing && (
						<motion.div
							key="welcome-screen"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.4, ease: "easeOut" }}
							className="w-full"
						>
							<div className="w-full space-y-8">
								{/* Welcome Section */}
								<motion.div
									className="text-center"
									initial={{ opacity: 1, y: 0 }}
									animate={{ opacity: 1, y: 0 }}
								>
									<h1 className="mb-6 font-semibold text-3xl text-gray-900 dark:text-white">
										Welcome back
										{user?.name ? `, ${user.name}` : ", Shane Manaton"}!
									</h1>
								</motion.div>

								{/* Input Area in Welcome Screen */}
								<motion.div
									layout
									transition={{
										type: "spring",
										stiffness: 200,
										damping: 20,
									}}
									className="w-full"
								>
									<div className="relative">
										{/* Keyboard shortcuts in top-right */}
										<div className="absolute top-3 right-3 z-10 flex items-center gap-1">
											<Kbd>Ctrl</Kbd>
											<span className="text-gray-400">+</span>
											<Kbd>R</Kbd>
										</div>
										{/* File upload and microphone icons in bottom-left */}
										<div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
											<button
												type="button"
												className="rounded p-1 text-gray-400 transition-all hover:scale-110 hover:text-white"
												title="Attach file"
											>
												<Paperclip className="h-4 w-4" />
											</button>
											<button
												type="button"
												className="rounded p-1 text-gray-400 transition-all hover:scale-110 hover:text-white"
												title="Voice input"
											>
												<Mic className="h-4 w-4" />
											</button>
										</div>
										{/* Submit button in bottom-right */}
										<div className="absolute right-3 bottom-3 z-10">
											<motion.button
												type="button"
												onClick={handleSend}
												disabled={loading || !input.trim()}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className="flex items-center gap-1 rounded px-3 py-1.5 text-gray-400 text-sm transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
											>
												{loading ? (
													<Spinner size="sm" />
												) : (
													<Send className="h-4 w-4" />
												)}
												{loading ? "Processing..." : "Send"}
											</motion.button>
										</div>
										<Textarea
											placeholder="Input for Pulse..."
											className="w-full resize-none pr-20 pb-12 pl-20 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
											rows={3}
											value={input}
											onChange={(e) => setInput(e.target.value)}
											onKeyDown={handleKeyPress}
											disabled={loading}
										/>
									</div>
								</motion.div>

								{/* Navigation Cards */}
								<motion.div className="flex flex-wrap justify-center gap-4">
									{navigationItems.map((item, index) => (
										<NavigationCard
											key={item.id}
											id={item.id}
											name={item.name}
											icon={item.icon}
											badge={item.badge}
											href={item.href}
											index={index}
										/>
									))}
									{/* Customize Navigation Button */}
									<motion.button
										onClick={handleCustomizeClick}
										className="group relative flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-gray-300 border-dashed bg-transparent text-gray-400 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.2,
											delay: navigationItems.length * 0.1,
										}}
										title="Customize navigation"
									>
										<Plus className="mb-1 h-6 w-6" />
										<span className="font-medium text-xs">Customize</span>
									</motion.button>
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Input Area - Only visible when conversing */}
				<AnimatePresence mode="wait">
					{isConversing && (
						<motion.div
							key="chat-input"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							transition={{
								type: "spring" as const,
								stiffness: 200,
								damping: 20,
							}}
							className="mx-auto w-full max-w-4xl px-6 pb-6"
						>
							<div className="relative">
								{/* Keyboard shortcuts in top-right */}
								<div className="absolute top-3 right-3 z-10 flex items-center gap-1">
									<Kbd>Ctrl</Kbd>
									<span className="text-gray-400">+</span>
									<Kbd>R</Kbd>
								</div>
								{/* File upload and microphone icons in bottom-left */}
								<div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
									<button
										type="button"
										className="rounded p-1 text-gray-400 transition-all hover:scale-110 hover:text-white"
										title="Attach file"
									>
										<Paperclip className="h-4 w-4" />
									</button>
									<button
										type="button"
										className="rounded p-1 text-gray-400 transition-all hover:scale-110 hover:text-white"
										title="Voice input"
									>
										<Mic className="h-4 w-4" />
									</button>
								</div>
								{/* Submit button in bottom-right */}
								<div className="absolute right-3 bottom-3 z-10">
									<motion.button
										type="button"
										onClick={handleSend}
										disabled={loading || !input.trim()}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="flex items-center gap-1 rounded px-3 py-1.5 text-gray-400 text-sm transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
									>
										{loading ? (
											<Spinner size="sm" />
										) : (
											<Send className="h-4 w-4" />
										)}
										{loading ? "Processing..." : "Send"}
									</motion.button>
								</div>
								<Textarea
									placeholder="Input for Pulse..."
									className="w-full resize-none pr-20 pb-12 pl-20 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
									rows={3}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyPress}
									disabled={loading}
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</>
	);
}
