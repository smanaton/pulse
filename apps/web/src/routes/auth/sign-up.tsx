import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@pulse/backend";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Button, Card } from "flowbite-react";
import { useState } from "react";

export const Route = createFileRoute("/auth/sign-up")({
	component: SignUpPage,
});

function SignUpPage() {
	const { signIn } = useAuthActions();
	const _navigate = useNavigate();
	const _user = useQuery(api.users.getCurrentUser);
	const [error, setError] = useState<string | null>(null);
	const [isSigningUp, setIsSigningUp] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// Redirect if already authenticated - handled by __root.tsx

	const handleOAuthSignUp = async (provider: string) => {
		try {
			setError(null);
			setIsSigningUp(provider);
			await signIn(provider);
		} catch (error) {
			console.error("OAuth sign up error:", error);
			setError(
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
			setIsSigningUp(null);
		}
	};

	const handlePasswordSignUp = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		try {
			setError(null);
			setIsSigningUp("password");

			const formData = new FormData();
			formData.append("email", email);
			formData.append("password", password);
			formData.append("flow", "signUp");

			await signIn("password", formData);
		} catch (error) {
			console.error("Password sign up error:", error);
			setError(
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
			setIsSigningUp(null);
		}
	};

	return (
		<Card className="w-full">
			<div className="space-y-6 p-6">
				<div className="text-center">
					<h2 className="font-bold text-2xl text-gray-900 dark:text-white">
						Sign up for Pulse
					</h2>
					<p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
						Create your account to get started
					</p>
				</div>

				{error && (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
						<p className="text-red-600 text-sm dark:text-red-400">{error}</p>
					</div>
				)}

				<div className="space-y-4">
					<Button
						onClick={() => handleOAuthSignUp("google")}
						disabled={!!isSigningUp}
						className="w-full"
						outline
					>
						{isSigningUp === "google" ? (
							<div className="flex items-center">
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-gray-600 border-b-2" />
								Signing up...
							</div>
						) : (
							<>
								<svg
									className="mr-2 h-4 w-4"
									viewBox="0 0 24 24"
									aria-label="Google logo"
									role="img"
								>
									<title>Google</title>
									<path
										fill="currentColor"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="currentColor"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="currentColor"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="currentColor"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								Continue with Google
							</>
						)}
					</Button>

					<Button
						onClick={() => handleOAuthSignUp("github")}
						disabled={!!isSigningUp}
						className="w-full"
						outline
					>
						{isSigningUp === "github" ? (
							<div className="flex items-center">
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-gray-600 border-b-2" />
								Signing up...
							</div>
						) : (
							<>
								<svg
									className="mr-2 h-4 w-4"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-label="GitHub logo"
									role="img"
								>
									<title>GitHub</title>
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
								Continue with GitHub
							</>
						)}
					</Button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-gray-300 border-t dark:border-gray-600" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-white px-2 text-gray-500 dark:bg-gray-900">
								Or sign up with email
							</span>
						</div>
					</div>

					<form onSubmit={handlePasswordSignUp} className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block font-medium text-gray-700 text-sm dark:text-gray-300"
							>
								Email address
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
								placeholder="Enter your email"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block font-medium text-gray-700 text-sm dark:text-gray-300"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
								placeholder="Enter your password"
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
								Confirm Password
							</label>
							<input
								type="password"
								id="confirmPassword"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
								placeholder="Confirm your password"
							/>
						</div>

						<Button
							type="submit"
							disabled={!!isSigningUp}
							className="w-full"
							color="blue"
						>
							{isSigningUp === "password" ? (
								<div className="flex items-center">
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2" />
									Creating account...
								</div>
							) : (
								"Create Account"
							)}
						</Button>
					</form>
				</div>

				<div className="text-center">
					<p className="text-gray-500 text-sm dark:text-gray-400">
						Already have an account?{" "}
						<Link
							to="/auth/sign-in"
							className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
						>
							Sign in
						</Link>
					</p>
				</div>

				<div className="text-center">
					<p className="text-gray-500 text-xs dark:text-gray-400">
						By creating an account, you agree to our Terms of Service and
						Privacy Policy
					</p>
				</div>
			</div>
		</Card>
	);
}
