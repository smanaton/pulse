// tests/mocks/sidebar-storage.mock.ts
export const sidebarStorageMock = {
	sidebarStorage: { get: vi.fn(() => ({ isCollapsed: false })), set: vi.fn() },
};
vi.mock("@/lib/sidebar-storage", () => sidebarStorageMock);
