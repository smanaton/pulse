import "@testing-library/jest-dom";

// Integration test setup: avoid mocking the router to test real routing
// Import only the mocks that don't interfere with router internals
import "@/test/mocks/convex.mock";
import "@/test/mocks/convex-auth.mock";
import "@/test/mocks/sonner.mock";
import "@/test/mocks/flowbite.mock";
import "@/test/mocks/framer-motion.mock";
import "@/test/mocks/ui-card.mock";
import "@/test/mocks/react-query.mock";
import "@/test/mocks/backend.mock";
import "@/test/mocks/sidebar-context.mock";
import "@/test/mocks/sidebar-storage.mock";
import "@/test/mocks/use-media-query.mock";
