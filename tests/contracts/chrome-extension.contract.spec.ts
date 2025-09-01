/**
 * Contract Test - Chrome Extension API
 * Validates message passing contracts between extension and webapp
 * Ensures data shape consistency across extension boundaries
 */

import { describe, expect, test } from "vitest";
import { z } from "zod";

// Extension Message Schemas
const ExtensionMessageBaseSchema = z.object({
  type: z.string(),
  timestamp: z.number().positive(),
  requestId: z.string().uuid().optional(),
});

// Web Clipper Message Types
const ClipRequestSchema = ExtensionMessageBaseSchema.extend({
  type: z.literal("CLIP_REQUEST"),
  data: z.object({
    url: z.string().url(),
    title: z.string().min(1),
    content: z.string(),
    selectedText: z.string().optional(),
    metadata: z.object({
      favicon: z.string().url().optional(),
      description: z.string().optional(),
      author: z.string().optional(),
      publishDate: z.string().datetime().optional(),
    }).optional(),
  }),
});

const ClipResponseSchema = ExtensionMessageBaseSchema.extend({
  type: z.literal("CLIP_RESPONSE"),
  success: z.boolean(),
  data: z.object({
    ideaId: z.string().min(1),
    workspaceId: z.string().min(1),
  }).optional(),
  error: z.object({
    message: z.string(),
    code: z.enum(["AUTH_REQUIRED", "WORKSPACE_NOT_FOUND", "NETWORK_ERROR", "UNKNOWN"]),
  }).optional(),
});

// Auth Message Types
const AuthCheckRequestSchema = ExtensionMessageBaseSchema.extend({
  type: z.literal("AUTH_CHECK_REQUEST"),
});

const AuthCheckResponseSchema = ExtensionMessageBaseSchema.extend({
  type: z.literal("AUTH_CHECK_RESPONSE"),
  data: z.object({
    isAuthenticated: z.boolean(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
    }).optional(),
  }),
});

// Configuration Message Types
const ConfigRequestSchema = ExtensionMessageBaseSchema.extend({
  type: z.literal("CONFIG_REQUEST"),
});

const ConfigResponseSchema = ExtensionMessageBaseSchema.extend({
  type: z.literal("CONFIG_RESPONSE"),
  data: z.object({
    defaultWorkspaceId: z.string().min(1).optional(),
    autoClip: z.boolean(),
    clipShortcut: z.string().optional(),
    apiEndpoint: z.string().url(),
  }),
});

// Test Fixtures
const validClipRequestFixture = {
  type: "CLIP_REQUEST",
  timestamp: Date.now(),
  requestId: "123e4567-e89b-12d3-a456-426614174000",
  data: {
    url: "https://example.com/article",
    title: "Interesting Article",
    content: "This is the main content of the article...",
    selectedText: "Important highlighted text",
    metadata: {
      favicon: "https://example.com/favicon.ico",
      description: "A really interesting article about testing",
      author: "Jane Doe",
      publishDate: "2024-01-15T10:30:00Z",
    },
  },
};

const validClipResponseFixture = {
  type: "CLIP_RESPONSE",
  timestamp: Date.now(),
  requestId: "123e4567-e89b-12d3-a456-426614174000",
  success: true,
  data: {
    ideaId: "idea_abc123",
    workspaceId: "ws_def456",
  },
};

const errorClipResponseFixture = {
  type: "CLIP_RESPONSE",
  timestamp: Date.now(),
  requestId: "123e4567-e89b-12d3-a456-426614174000",
  success: false,
  error: {
    message: "User not authenticated",
    code: "AUTH_REQUIRED",
  },
};

describe("Chrome Extension - Web Clipper Contract", () => {
  describe("Clip Request Messages", () => {
    test("Given_ValidClipRequest_When_Validated_Then_PassesSchema", () => {
      // Act & Assert
      expect(() => ClipRequestSchema.parse(validClipRequestFixture)).not.toThrow();
    });

    test("Given_MinimalClipRequest_When_Validated_Then_PassesSchema", () => {
      // Arrange - Only required fields
      const minimalRequest = {
        type: "CLIP_REQUEST",
        timestamp: Date.now(),
        data: {
          url: "https://example.com",
          title: "Page Title",
          content: "Page content",
        },
      };

      // Act & Assert
      expect(() => ClipRequestSchema.parse(minimalRequest)).not.toThrow();
    });

    test("Given_ClipRequestWithInvalidUrl_When_Validated_Then_ThrowsValidationError", () => {
      // Arrange
      const invalidRequest = {
        ...validClipRequestFixture,
        data: {
          ...validClipRequestFixture.data,
          url: "not-a-valid-url",
        },
      };

      // Act & Assert
      expect(() => ClipRequestSchema.parse(invalidRequest)).toThrow();
    });

    test("Given_ClipRequestWithEmptyTitle_When_Validated_Then_ThrowsValidationError", () => {
      // Arrange
      const invalidRequest = {
        ...validClipRequestFixture,
        data: {
          ...validClipRequestFixture.data,
          title: "",
        },
      };

      // Act & Assert
      expect(() => ClipRequestSchema.parse(invalidRequest)).toThrow();
    });

    test("Given_ClipRequestWithInvalidMetadata_When_Validated_Then_ThrowsValidationError", () => {
      // Arrange - Invalid favicon URL
      const invalidRequest = {
        ...validClipRequestFixture,
        data: {
          ...validClipRequestFixture.data,
          metadata: {
            ...validClipRequestFixture.data.metadata,
            favicon: "not-a-url",
          },
        },
      };

      // Act & Assert
      expect(() => ClipRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe("Clip Response Messages", () => {
    test("Given_SuccessfulClipResponse_When_Validated_Then_PassesSchema", () => {
      // Act & Assert
      expect(() => ClipResponseSchema.parse(validClipResponseFixture)).not.toThrow();
    });

    test("Given_ErrorClipResponse_When_Validated_Then_PassesSchema", () => {
      // Act & Assert
      expect(() => ClipResponseSchema.parse(errorClipResponseFixture)).not.toThrow();
    });

    test("Given_ClipResponseWithInvalidErrorCode_When_Validated_Then_ThrowsValidationError", () => {
      // Arrange
      const invalidResponse = {
        ...errorClipResponseFixture,
        error: {
          ...errorClipResponseFixture.error!,
          code: "INVALID_CODE",
        },
      };

      // Act & Assert
      expect(() => ClipResponseSchema.parse(invalidResponse)).toThrow();
    });

    test("Given_SuccessResponseWithoutData_When_Validated_Then_AllowsOptionalData", () => {
      // Arrange
      const response = {
        type: "CLIP_RESPONSE",
        timestamp: Date.now(),
        success: true,
        // No data field - should be allowed
      };

      // Act & Assert
      expect(() => ClipResponseSchema.parse(response)).not.toThrow();
    });
  });
});

describe("Chrome Extension - Authentication Contract", () => {
  test("Given_AuthCheckRequest_When_Validated_Then_PassesSchema", () => {
    // Arrange
    const request = {
      type: "AUTH_CHECK_REQUEST",
      timestamp: Date.now(),
    };

    // Act & Assert
    expect(() => AuthCheckRequestSchema.parse(request)).not.toThrow();
  });

  test("Given_AuthenticatedUserResponse_When_Validated_Then_PassesSchema", () => {
    // Arrange
    const response = {
      type: "AUTH_CHECK_RESPONSE",
      timestamp: Date.now(),
      data: {
        isAuthenticated: true,
        user: {
          id: "user_123",
          name: "John Doe",
          email: "john@example.com",
        },
      },
    };

    // Act & Assert
    expect(() => AuthCheckResponseSchema.parse(response)).not.toThrow();
  });

  test("Given_UnauthenticatedUserResponse_When_Validated_Then_PassesSchema", () => {
    // Arrange
    const response = {
      type: "AUTH_CHECK_RESPONSE",
      timestamp: Date.now(),
      data: {
        isAuthenticated: false,
        // user field should be optional when not authenticated
      },
    };

    // Act & Assert
    expect(() => AuthCheckResponseSchema.parse(response)).not.toThrow();
  });

  test("Given_AuthResponseWithInvalidEmail_When_Validated_Then_ThrowsValidationError", () => {
    // Arrange
    const response = {
      type: "AUTH_CHECK_RESPONSE",
      timestamp: Date.now(),
      data: {
        isAuthenticated: true,
        user: {
          id: "user_123",
          name: "John Doe",
          email: "not-an-email",
        },
      },
    };

    // Act & Assert
    expect(() => AuthCheckResponseSchema.parse(response)).toThrow();
  });
});

describe("Chrome Extension - Configuration Contract", () => {
  test("Given_ConfigRequest_When_Validated_Then_PassesSchema", () => {
    // Arrange
    const request = {
      type: "CONFIG_REQUEST",
      timestamp: Date.now(),
    };

    // Act & Assert
    expect(() => ConfigRequestSchema.parse(request)).not.toThrow();
  });

  test("Given_FullConfigResponse_When_Validated_Then_PassesSchema", () => {
    // Arrange
    const response = {
      type: "CONFIG_RESPONSE",
      timestamp: Date.now(),
      data: {
        defaultWorkspaceId: "ws_abc123",
        autoClip: true,
        clipShortcut: "Ctrl+Shift+C",
        apiEndpoint: "https://api.pulse.app",
      },
    };

    // Act & Assert
    expect(() => ConfigResponseSchema.parse(response)).not.toThrow();
  });

  test("Given_MinimalConfigResponse_When_Validated_Then_PassesSchema", () => {
    // Arrange - Only required fields
    const response = {
      type: "CONFIG_RESPONSE",
      timestamp: Date.now(),
      data: {
        autoClip: false,
        apiEndpoint: "https://api.pulse.app",
      },
    };

    // Act & Assert
    expect(() => ConfigResponseSchema.parse(response)).not.toThrow();
  });

  test("Given_ConfigResponseWithInvalidApiEndpoint_When_Validated_Then_ThrowsValidationError", () => {
    // Arrange
    const response = {
      type: "CONFIG_RESPONSE",
      timestamp: Date.now(),
      data: {
        autoClip: true,
        apiEndpoint: "not-a-valid-url",
      },
    };

    // Act & Assert
    expect(() => ConfigResponseSchema.parse(response)).toThrow();
  });
});

describe("Message Contract Integration", () => {
  test("Given_RequestResponsePair_When_Validated_Then_EnsuresConsistentRequestId", () => {
    // Arrange
    const requestId = "123e4567-e89b-12d3-a456-426614174000";
    const request = { ...validClipRequestFixture, requestId };
    const response = { ...validClipResponseFixture, requestId };

    // Act & Assert
    expect(() => ClipRequestSchema.parse(request)).not.toThrow();
    expect(() => ClipResponseSchema.parse(response)).not.toThrow();
    expect(request.requestId).toBe(response.requestId);
  });

  test("Given_MessageWithTimestamp_When_Validated_Then_EnsuresValidTimestamp", () => {
    // Arrange
    const now = Date.now();
    const message = { ...validClipRequestFixture, timestamp: now };

    // Act & Assert
    expect(() => ClipRequestSchema.parse(message)).not.toThrow();
    expect(message.timestamp).toBe(now);
    expect(message.timestamp).toBeGreaterThan(0);
  });
});