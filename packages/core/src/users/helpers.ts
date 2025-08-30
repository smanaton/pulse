/**
 * User Helper Functions
 */

// ============================================================================
// Display Name Helpers
// ============================================================================

export function getDisplayName(user: {
	name?: string;
	email?: string;
}): string {
	if (user.name && user.name.trim()) {
		return user.name.trim();
	}

	if (user.email) {
		// Extract name from email (e.g., "john.doe@example.com" -> "john.doe")
		const emailName = user.email.split("@")[0];
		if (emailName) {
			return emailName
				.replace(/[._-]/g, " ")
				.replace(/\b\w/g, (l) => l.toUpperCase());
		}
	}

	return "Anonymous User";
}

export function getInitials(user: { name?: string; email?: string }): string {
	const displayName = getDisplayName(user);

	const words = displayName.split(" ").filter((word) => word.length > 0);

	if (words.length === 0) {
		return "AU"; // Anonymous User
	}

	if (words.length === 1) {
		const firstWord = words[0];
		if (firstWord) {
			return firstWord.substring(0, 2).toUpperCase();
		}
	}

	const firstWord = words[0];
	const lastWord = words[words.length - 1];
	if (firstWord && lastWord && firstWord[0] && lastWord[0]) {
		return (firstWord[0] + lastWord[0]).toUpperCase();
	}

	return "AU";
}

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateEmail(email: string): {
	valid: boolean;
	error?: string;
} {
	if (!email || email.trim().length === 0) {
		return { valid: false, error: "Email is required" };
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return { valid: false, error: "Invalid email format" };
	}

	if (email.length > 254) {
		return { valid: false, error: "Email is too long" };
	}

	return { valid: true };
}

export function validateName(name: string): { valid: boolean; error?: string } {
	if (!name || name.trim().length === 0) {
		return { valid: false, error: "Name is required" };
	}

	if (name.trim().length < 1) {
		return { valid: false, error: "Name must be at least 1 character" };
	}

	if (name.trim().length > 100) {
		return { valid: false, error: "Name must be less than 100 characters" };
	}

	return { valid: true };
}

// ============================================================================
// Avatar Helpers
// ============================================================================

export function generateAvatarUrl(
	user: { name?: string; email?: string },
	size = 40,
): string {
	const initials = getInitials(user);

	// Generate a consistent color based on user data
	const seed = user.email || user.name || "anonymous";
	const colors = [
		"#FF6B6B",
		"#4ECDC4",
		"#45B7D1",
		"#96CEB4",
		"#FFEAA7",
		"#DDA0DD",
		"#98D8C8",
		"#F7DC6F",
		"#BB8FCE",
		"#85C1E9",
	];

	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = seed.charCodeAt(i) + ((hash << 5) - hash);
	}

	const colorIndex = Math.abs(hash) % colors.length;
	const bgColor = colors[colorIndex];

	// Create a data URL for the avatar
	const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bgColor}"/>
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        dominant-baseline="middle" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.4}" 
        font-weight="bold" 
        fill="white"
      >
        ${initials}
      </text>
    </svg>
  `
		.replace(/\s+/g, " ")
		.trim();

	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ============================================================================
// Token Helpers
// ============================================================================

export function parseTokenIdentifier(
	tokenIdentifier: string,
): { provider: string; id: string } | null {
	if (!tokenIdentifier || !tokenIdentifier.includes("|")) {
		return null;
	}

	const [provider, id] = tokenIdentifier.split("|", 2);
	if (provider && id) {
		return { provider, id };
	}
	return null;
}

export function isTestUser(tokenIdentifier?: string): boolean {
	return tokenIdentifier?.startsWith("testing|") ?? false;
}

// ============================================================================
// Constants
// ============================================================================

export const USER_LIMITS = {
	MAX_WORKSPACES: 10,
	MAX_NAME_LENGTH: 100,
	MAX_EMAIL_LENGTH: 254,
} as const;

export const DEFAULT_USER_PREFERENCES = {
	theme: "system" as const,
	language: "en",
	timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	emailNotifications: true,
	desktopNotifications: true,
} as const;
