// tests/mocks/convex-auth.mock.tsx
import { vi } from "vitest";
import type { FC } from "react";
import type { WithChildren } from "./_types";

const PassThrough: FC<WithChildren> = ({ children }) => <>{children}</>;

export const authMock = {
	useAuthActions: vi.fn(() => ({ signIn: vi.fn(), signOut: vi.fn() })),
	ConvexAuthProvider: vi.fn(PassThrough),
};

vi.mock("@convex-dev/auth/react", () => authMock);
