import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@pulse/backend";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Button, Card, Checkbox, Label, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/auth/sign-in")({
	component: SignInPage,
});

function SignInPage() {
	const { signIn } = useAuthActions();
	const navigate = useNavigate();
	const user = useQuery(api.users.getCurrentUser);
	const [error, setError] = useState<string | null>(null);
	const [isSigningIn, setIsSigningIn] = useState<string | null>(null);
	const [showEmailForm, setShowEmailForm] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	// Redirect if already authenticated - handled by __root.tsx

	const handleSignIn = async (provider: string) => {
		try {
			setError(null);
			setIsSigningIn(provider);
			await signIn(provider);
		} catch (error) {
			console.error("Sign in error:", error);
			setError(
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
			setIsSigningIn(null);
		}
	};

	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			setError(null);
			setIsSigningIn("password");

			const formData = new FormData();
			formData.append("email", email);
			formData.append("password", password);
			formData.append("flow", "signIn");

			await signIn("password", formData);
			// After successful sign-in, __root.tsx will handle the redirect
		} catch (error) {
			console.error("Email sign in error:", error);
			setError(
				error instanceof Error ? error.message : "Invalid email or password",
			);
			setIsSigningIn(null);
		}
	};

	return (
		<div className="mx-auto flex flex-col items-center justify-center px-6 pt-8 md:h-screen">
			<Link
				to="/"
				className="mb-8 flex items-center justify-center font-semibold text-2xl lg:mb-10 dark:text-white"
			>
				<span className="self-center whitespace-nowrap font-semibold text-2xl dark:text-white">
					Pulse
				</span>
			</Link>
			<Card className="w-full overflow-hidden md:max-w-4xl">
				<div className="flex min-h-[600px] flex-col md:flex-row">
					{/* Image section - hidden on mobile, visible on desktop */}
					<div className="hidden bg-gradient-to-br from-blue-600 to-purple-700 md:block md:w-1/2">
						<div className="flex h-full items-center justify-center p-8">
							<div className="text-center text-white">
								<h3 className="mb-4 font-bold text-2xl">Welcome to Pulse</h3>
								<p className="text-blue-100">
									Your modern dashboard experience starts here
								</p>
							</div>
						</div>
					</div>
					{/* Form section */}
					<div className="flex w-full flex-col justify-center p-6 sm:p-8 md:w-1/2 lg:p-12">
						<div className="space-y-8">
							<h2 className="font-bold text-2xl text-gray-900 lg:text-3xl dark:text-white">
								Sign in to platform
							</h2>

							{error && (
								<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
									<p className="text-red-600 text-sm dark:text-red-400">
										{error}
									</p>
								</div>
							)}

							<div className="space-y-6">
								{!showEmailForm ? (
									<div className="space-y-4">
										<div className="text-center">
											<p className="text-gray-600 text-sm dark:text-gray-400">
												Choose your preferred sign-in method
											</p>
										</div>

										<Button
											onClick={() => handleSignIn("google")}
											disabled={!!isSigningIn}
											className="w-full"
											outline
										>
											{isSigningIn === "google" ? (
												<div className="flex items-center">
													<div className="mr-2 h-4 w-4 animate-spin rounded-full border-gray-600 border-b-2" />
													Signing in...
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
											onClick={() => handleSignIn("github")}
											disabled={!!isSigningIn}
											className="w-full"
											outline
										>
											{isSigningIn === "github" ? (
												<div className="flex items-center">
													<div className="mr-2 h-4 w-4 animate-spin rounded-full border-gray-600 border-b-2" />
													Signing in...
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
												<span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
													Or
												</span>
											</div>
										</div>

										<Button
											onClick={() => setShowEmailForm(true)}
											disabled={!!isSigningIn}
											size="lg"
											color="blue"
											className="w-full"
										>
											Continue with Email
										</Button>
									</div>
								) : (
									<form onSubmit={handleEmailSignIn} className="space-y-6">
										<div className="flex flex-col gap-y-2">
											<Label htmlFor="email">Your email</Label>
											<TextInput
												id="email"
												name="email"
												placeholder="name@company.com"
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												required
											/>
										</div>
										<div className="flex flex-col gap-y-2">
											<Label htmlFor="password">Your password</Label>
											<TextInput
												id="password"
												name="password"
												placeholder="••••••••"
												type="password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												required
											/>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-x-3">
												<Checkbox id="rememberMe" name="rememberMe" />
												<Label htmlFor="rememberMe">Remember me</Label>
											</div>
											<Link
												to="/auth/forgot-password"
												className="text-right text-primary-700 text-sm hover:underline dark:text-primary-500"
											>
												Lost Password?
											</Link>
										</div>
										<div className="mb-6">
											<Button
												type="submit"
												disabled={!!isSigningIn}
												size="lg"
												color="blue"
												className="w-full"
											>
												{isSigningIn === "password" ? (
													<div className="flex items-center">
														<div className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2" />
														Signing in...
													</div>
												) : (
													"Login to your account"
												)}
											</Button>
										</div>
										<p className="font-medium text-gray-500 text-sm dark:text-gray-400">
											Not registered?&nbsp;
											<Link
												to="/auth/sign-up"
												className="text-primary-700 hover:underline dark:text-primary-500"
											>
												Create account
											</Link>
										</p>
										<div className="text-center">
											<Button
												onClick={() => setShowEmailForm(false)}
												outline
												size="sm"
											>
												Back to options
											</Button>
										</div>
									</form>
								)}
							</div>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
