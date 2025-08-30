/**
 * User Types
 */

import type { Id } from "../types";

export interface CreateUserInput {
	email?: string;
	name?: string;
	image?: string;
	tokenIdentifier?: string;
}

export interface UpdateUserInput {
	name?: string;
	image?: string;
	email?: string;
}

export interface UserProfile {
	_id: Id<"users">;
	name?: string;
	email?: string;
	image?: string;
	createdAt: number;
	updatedAt: number;
}

export interface UserPreferences {
	theme: "light" | "dark" | "system";
	language: string;
	timezone: string;
	emailNotifications: boolean;
	desktopNotifications: boolean;
}
