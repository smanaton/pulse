import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@pulse/backend";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Button, Card } from "flowbite-react";
import { useEffect, useId, useState } from "react";

interface ResetPasswordSearch {
	email?: string;
	code?: string;
}

export const Route = createFileRoute("/auth/reset-password")({
	component: ResetPasswordPage,
	validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => {
		return {
			email: typeof search.email === "string" ? search.email : undefined,
			code: typeof search.code === "string" ? search.code : undefined,
		};
	},
});

function ResetPasswordPage() {
	const { signIn } = useAuthActions();
	const navigate = useNavigate();
	const user = useQuery(api.users.getCurrentUser);
	const { email: emailFromSearch, code: codeFromSearch } = Route.useSearch();

	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [step, setStep] = useState<"code" | "password">(
		codeFromSearch ? "password" : "code",
	);

	const [email, setEmail] = useState(emailFromSearch || "");
	const [code, setCode] = useState(codeFromSearch || "");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const emailId = useId();
	const codeId = useId();
	const newPasswordId = useId();
	const confirmPasswordId = useId();

	// Redirect if already authenticated
	useEffect(() => {
		if (user) {
			navigate({ to: "/" });
		}
	}, [user, navigate]);

	const handleCodeSubmit = async (e: React.FormEvent) => {
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
				"We've sent you a verification code. Please check your email and enter the code below.",
			);
			setStep("password");
		} catch (error) {
			console.error("Send reset code error:", error);
			setError(
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePasswordReset = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!code) {
			setError("Please enter the verification code");
			return;
		}

		if (!newPassword) {
			setError("Please enter a new password");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		try {
			setError(null);
			setSuccess(null);
			setIsSubmitting(true);

			const formData = new FormData();
			formData.append("email", email);
			formData.append("code", code);
			formData.append("newPassword", newPassword);
			formData.append("flow", "reset-verification");

			await signIn("password", formData);

			setSuccess(
				"Your password has been reset successfully. You are now signed in.",
			);

			// Redirect to home after successful reset
			setTimeout(() => {
				navigate({ to: "/" });
			}, 2000);
		} catch (error) {
			console.error("Password reset error:", error);
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
						{step === "code" ? "Reset your password" : "Set new password"}
					</h2>
					<p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
						{step === "code"
							? "Enter your email address and we'll send you a verification code"
							: "Enter the verification code and your new password"}
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

				{step === "code" ? (
					<form onSubmit={handleCodeSubmit} className="space-y-4">
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
									Sending code...
								</div>
							) : (
								"Send verification code"
							)}
						</Button>
					</form>
				) : (
					<form onSubmit={handlePasswordReset} className="space-y-4">
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

						<div>
							<label
								htmlFor="code"
								className="block font-medium text-gray-700 text-sm dark:text-gray-300"
							>
								Verification code
							</label>
							<input
								type="text"
								id={codeId}
								value={code}
								onChange={(e) => setCode(e.target.value)}
								required
								className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
								placeholder="Enter the code from your email"
							/>
						</div>

						<div>
							<label
								htmlFor="newPassword"
								className="block font-medium text-gray-700 text-sm dark:text-gray-300"
							>
								New password
							</label>
							<input
								type="password"
								id={newPasswordId}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
								className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
								placeholder="Enter your new password"
								minLength={8}
							/>
							<p className="mt-1 text-gray-500 text-xs dark:text-gray-400">
								Must be at least 8 characters long
							</p>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block font-medium text-gray-700 text-sm dark:text-gray-300"
							>
								Confirm new password
							</label>
							<input
								type="password"
								id={confirmPasswordId}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
								placeholder="Confirm your new password"
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
									Resetting password...
								</div>
							) : (
								"Reset password"
							)}
						</Button>

						<Button
							type="button"
							onClick={() => setStep("code")}
							className="w-full"
							outline
						>
							Back
						</Button>
					</form>
				)}

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
