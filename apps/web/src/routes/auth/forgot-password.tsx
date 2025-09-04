import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@pulse/backend";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Button, Card } from "flowbite-react";
import { useEffect, useId, useState } from "react";

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const { signIn } = useAuthActions();
	const navigate = useNavigate();
	const user = useQuery(api.users.getCurrentUser);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [email, setEmail] = useState("");

	const emailId = useId();

	// Redirect if already authenticated
	useEffect(() => {
		if (user) {
			navigate({ to: "/" });
		}
	}, [user, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) {
			setError("Please enter your email address");
			return;
		}

		try {
			setError(null);
			setSuccess(null);
			setIsSubmitting(true);

			const formData = new FormData();
			formData.append("email", email);
			formData.append("flow", "reset");

			await signIn("password", formData);

			setSuccess(
				"If an account with this email exists, we've sent you a password reset link. Please check your email and follow the instructions to reset your password.",
			);
		} catch (error) {
			console.error("Forgot password error:", error);
			setError(
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card className="w-full">
			<div className="space-y-6 p-6">
				<div className="text-center">
					<h2 className="font-bold text-2xl text-gray-900 dark:text-white">
						Reset your password
					</h2>
					<p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
						Enter your email address and we'll send you a link to reset your
						password
					</p>
				</div>

				{error && (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
						<p className="text-red-600 text-sm dark:text-red-400">{error}</p>
					</div>
				)}

				{success && (
					<div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
						<p className="text-green-600 text-sm dark:text-green-400">
							{success}
						</p>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							Email address
						</label>
						<input
							type="email"
							id={emailId}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
							placeholder="Enter your email address"
						/>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting}
						className="w-full"
						color="blue"
					>
						{isSubmitting ? (
							<div className="flex items-center">
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2" />
								Sending reset link...
							</div>
						) : (
							"Send reset link"
						)}
					</Button>
				</form>

				<div className="text-center">
					<p className="text-gray-500 text-sm dark:text-gray-400">
						Remember your password?{" "}
						<Link
							to="/auth/sign-in"
							className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
						>
							Sign in
						</Link>
					</p>
				</div>

				<div className="text-center">
					<p className="text-gray-500 text-sm dark:text-gray-400">
						Don't have an account?{" "}
						<Link
							to="/auth/sign-up"
							className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
						>
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</Card>
	);
}
