import { api } from "@pulse/backend";
import type { Id } from "@pulse/backend/dataModel";
import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

// Local typed alias for backend action to avoid `any` and satisfy lint rules
type ProcessCommandAction = (args: {
	workspaceId: Id<"workspaces">;
	command: string;
}) => Promise<{ message: string }>;

import {
	Accordion,
	AccordionContent,
	AccordionPanel,
	AccordionTitle,
	Badge,
	Button,
	Card,
	Textarea,
	Tooltip,
} from "flowbite-react";
import {
	Bell,
	Brain,
	CalendarDays,
	ClipboardList,
	FolderKanban,
	Mail,
	MessageCircle,
	MessageSquare,
	Send,
	Stars,
	Target,
} from "lucide-react";

interface AICommandCenterProps {
	workspaceId: Id<"workspaces">;
	onCommandExecuted?: () => void;
}

export function AICommandCenter({
	workspaceId,
	onCommandExecuted,
}: AICommandCenterProps) {
	const [command, setCommand] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [lastResult, setLastResult] = useState<string | null>(null);

	// Hook to backend if available
	const processCommand = useAction(api.ai.processCommand);

	async function handleSubmit(e?: React.FormEvent | React.KeyboardEvent) {
		e?.preventDefault();
		if (!command.trim() || isProcessing) return;

		setIsProcessing(true);
		setLastResult(null);

		try {
			if (processCommand && api.ai?.processCommand) {
				const result = await processCommand({
					workspaceId,
					command: command.trim(),
				});
				setLastResult(result.message || result.text);
			} else {
				setLastResult(generateMockResponse(command.trim()));
			}
			onCommandExecuted?.();
			setCommand("");
		} catch (err) {
			toast.error("Failed to process command");
			setLastResult(generateMockResponse(command.trim()));
			// eslint-disable-next-line no-console
			console.error(err);
		} finally {
			setIsProcessing(false);
		}
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter") handleSubmit(e);
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
			e.preventDefault();
			toast.message(
				"Command palette (mock). Try: 'Go to Projects', 'New idea…'",
			);
		}
	}

	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 px-4">
			{/* Command bar */}
			<form onSubmit={handleSubmit}>
				<div className="relative">
					<Textarea
						placeholder="Ask Pulse anything..."
						value={command}
						onChange={(e) => setCommand(e.target.value)}
						rows={4}
						onKeyDown={onKeyDown}
						className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/80 px-5 py-4 text-base text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700"
						disabled={isProcessing}
					/>
					<Button
						type="submit"
						color="dark"
						className="!absolute -translate-y-1/2 right-4 bottom-0 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
						disabled={!command.trim() || isProcessing}
					>
						{isProcessing ? (
							<Stars className="h-4 w-4 animate-spin" />
						) : (
							<Send className="h-4 w-4" />
						)}
					</Button>
				</div>
			</form>

			{/* Quiet status line */}
			<div className="flex items-center gap-4 text-neutral-500 text-sm">
				<div className="flex items-center gap-2">
					<MessageSquare className="h-4 w-4" />
					<span>3 messages</span>
				</div>
				<div className="flex items-center gap-2">
					<Bell className="h-4 w-4" />
					<span>7 notifications</span>
				</div>
				<div className="flex items-center gap-2">
					<CalendarDays className="h-4 w-4" />
					<span>2 deadlines today</span>
				</div>
				<div className="ml-auto">
					<Tooltip content="Minimal focus mode (mock)">
						<Button
							color="dark"
							className="rounded-2xl border border-neutral-700 bg-neutral-900 px-4 hover:bg-neutral-800"
							onClick={() => toast.message("Focus mode (mock) engaged")}
						>
							<Target className="mr-2 h-4 w-4" />
							Focus me up
						</Button>
					</Tooltip>
				</div>
			</div>

			{/* Important Reminders (collapsed by default, minimal) */}
			<Accordion
				collapseAll
				className="[&>div>h2>button]:bg-neutral-950 [&>div>h2>button]:text-neutral-200"
			>
				<AccordionPanel>
					<AccordionTitle className="rounded-xl border border-neutral-800">
						<div className="flex items-center gap-2">
							<Bell className="h-4 w-4 text-neutral-400" />
							Important reminders
							<Badge
								color="dark"
								className="ml-2 border border-neutral-700 bg-neutral-900 text-neutral-300"
							>
								4
							</Badge>
						</div>
					</AccordionTitle>
					<AccordionContent className="rounded-b-xl border border-neutral-800 border-t-0 bg-neutral-950">
						<ul className="space-y-2">
							{[
								{ id: "1", text: "Finish proposal draft", meta: "Today 16:00" },
								{ id: "2", text: "Follow up with Alex (email)" },
								{
									id: "3",
									text: "Prep talking points for client call",
									meta: "Tomorrow 10:00",
								},
								{ id: "4", text: "Review 3 new ideas & tag" },
							].map((r) => (
								<li
									key={r.id}
									className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-neutral-200"
								>
									<span className="truncate">{r.text}</span>
									{r.meta && (
										<span className="ml-3 text-neutral-500 text-xs">
											{r.meta}
										</span>
									)}
								</li>
							))}
						</ul>
					</AccordionContent>
				</AccordionPanel>
			</Accordion>

			{/* Button bar (fixed, centered, wrapping) */}
			<nav
				aria-label="quick-actions"
				className="-translate-x-1/2 fixed bottom-4 left-1/2 z-50 w-full max-w-4xl px-4"
			>
				<div className="mx-auto flex w-full flex-wrap items-center justify-center gap-4">
					<Tile
						icon={<Brain className="h-6 w-6" />}
						label="Ideas / Second Brain"
					/>
					<Tile icon={<FolderKanban className="h-6 w-6" />} label="Projects" />
					<Tile icon={<ClipboardList className="h-6 w-6" />} label="To-do" />
					<Tile icon={<Mail className="h-6 w-6" />} label="E-mail" badge="13" />
					<Tile
						icon={<MessageCircle className="h-6 w-6" />}
						label="Chat"
						badge="3"
					/>
					<Tile icon={<CalendarDays className="h-6 w-6" />} label="Calendar" />
				</div>
			</nav>

			{/* Result (only if present) */}
			{lastResult && (
				<Card className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
					<div className="whitespace-pre-wrap text-neutral-300 text-sm">
						{lastResult}
					</div>
				</Card>
			)}
		</div>
	);
}

/* --- Minimal tile --- */
function Tile({
	icon,
	label,
	badge,
}: {
	icon: React.ReactNode;
	label: string;
	badge?: string;
}) {
	return (
		<div className="relative">
			<Button
				color="dark"
				className="flex min-h-[64px] min-w-[140px] max-w-[220px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-4 py-3 text-neutral-200"
				type="button"
			>
				<div className="mb-1 text-neutral-300">{icon}</div>
				<div className="text-center text-neutral-200 text-sm">{label}</div>
			</Button>
			{badge ? (
				<div className="-translate-y-1/2 absolute top-0 right-0 translate-x-1/4">
					<Badge
						color="dark"
						size="sm"
						className="border border-neutral-700 bg-neutral-900 text-neutral-300"
					>
						{badge}
					</Badge>
				</div>
			) : null}
		</div>
	);
}

/* --- Mock response --- */
function generateMockResponse(input: string): string {
	const q = input.toLowerCase();
	if (q.includes("idea")) {
		return `✨ Idea helper (mock)
• "${extractTopic(input)}" — Implementation strategy
• "${extractTopic(input)}" — UX improvements

Next: say "promote to project" or "tag suggestions".`;
	}
	if (q.includes("summary") || q.includes("summarize")) {
		return "📊 Summary (mock)\nActive ideas: 5 · New this week: 3\nThemes: UX, tech debt, ops\nTip: group similar ideas and review on Friday.";
	}
	if (q.includes("tag")) {
		return "🏷️ Tag suggestions (mock)\n#user-experience · #technical-debt · #research\nGuideline: 3–5 tags max.";
	}
	if (q.includes("focus")) {
		return "🎯 Focus (mock)\nSingle task: Finish proposal draft\nBlock: 25m, then 5m break\nMuted: email + chat.";
	}
	return `OK — "${input}" (mock processed). Try: "new idea about onboarding", "summarize ideas", "focus me up".`;
}

function extractTopic(s: string) {
	const stop = new Set([
		"new",
		"idea",
		"about",
		"for",
		"the",
		"and",
		"a",
		"an",
		"on",
		"to",
		"of",
	]);
	return (
		s
			.split(/\s+/)
			.filter((w) => !stop.has(w.toLowerCase()) && w.length > 2)
			.slice(0, 3)
			.join(" ") || "Project"
	);
}
