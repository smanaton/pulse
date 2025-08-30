import { createFileRoute } from "@tanstack/react-router";
import { Button, Card, TextInput } from "flowbite-react";
import { Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: ChatInterface,
});

function ChatInterface() {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([
		{
			id: 1,
			text: "Hello! How can I help you today?",
			sender: "assistant",
			timestamp: new Date(),
		},
	]);

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim()) return;

		// Add user message
		const userMessage = {
			id: messages.length + 1,
			text: message,
			sender: "user" as const,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setMessage("");

		// Simulate assistant response
		setTimeout(() => {
			const assistantMessage = {
				id: messages.length + 2,
				text: "Thanks for your message! This is a placeholder response from your Pulse chat interface.",
				sender: "assistant" as const,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, assistantMessage]);
		}, 1000);
	};

	return (
		<div className="mx-auto flex h-full max-w-4xl flex-col p-4">
			{/* Header */}
			<div className="mb-4">
				<h1 className="font-bold text-2xl text-gray-900">Pulse Chat</h1>
				<p className="text-gray-600">Your AI-powered workspace assistant</p>
			</div>

			{/* Messages Area */}
			<div className="mb-4 flex-1 space-y-4 overflow-y-auto">
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
					>
						<Card
							className={`max-w-xs md:max-w-md lg:max-w-lg ${
								msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100"
							}`}
						>
							<div className="p-3">
								<p
									className={
										msg.sender === "user" ? "text-white" : "text-gray-800"
									}
								>
									{msg.text}
								</p>
								<div
									className={`mt-2 text-xs ${
										msg.sender === "user" ? "text-blue-100" : "text-gray-500"
									}`}
								>
									{msg.timestamp.toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</div>
							</div>
						</Card>
					</div>
				))}
			</div>

			{/* Input Area */}
			<Card>
				<form onSubmit={handleSend} className="flex gap-2 p-4">
					<TextInput
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Type your message..."
						className="flex-1"
						sizing="md"
					/>
					<Button type="submit" disabled={!message.trim()}>
						<Send className="h-4 w-4" />
					</Button>
				</form>
			</Card>
		</div>
	);
}
