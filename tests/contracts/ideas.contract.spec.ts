/**
 * Contract Test - API Shape Validation
 * Validates external API contracts with Zod schemas
 * No network calls, focuses on data shape guarantees
 */

import { describe, expect, test } from "vitest";
import { z } from "zod";

// API Contract Schemas
const IdeaSchema = z.object({
  _id: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string(),
  workspaceId: z.string().min(1),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const WorkspaceSchema = z.object({
  _id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
});

const UserSchema = z.object({
  _id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  tokenIdentifier: z.string().min(1),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
  image: z.string().url().optional(),
});

// API Response Schemas
const IdeasListResponseSchema = z.array(IdeaSchema);
const WorkspacesListResponseSchema = z.array(WorkspaceSchema);
const CreateIdeaResponseSchema = IdeaSchema;

// API Request Schemas
const CreateIdeaRequestSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string(),
  workspaceId: z.string().min(1),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const UpdateIdeaRequestSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

// Test fixtures representing real API responses
const validIdeaFixture = {
  _id: "idea_kjh2k3j4h5kjh",
  title: "Implement user authentication",
  content: "We need to add OAuth login with Google and GitHub providers",
  workspaceId: "ws_abc123def456",
  createdAt: 1704067200000, // 2024-01-01
  updatedAt: 1704067200000,
  tags: ["auth", "feature"],
  priority: "high" as const,
};

const validWorkspaceFixture = {
  _id: "ws_abc123def456",
  name: "Product Development",
  description: "Main workspace for product ideas",
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
};

const validUserFixture = {
  _id: "user_xyz789",
  name: "John Doe",
  email: "john@example.com",
  tokenIdentifier: "google|12345",
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
  image: "https://example.com/avatar.jpg",
};

describe("Ideas API Contract", () => {
  describe("Response Validation", () => {
    test("Given_ValidIdeaResponse_When_Validated_Then_PassesSchema", () => {
      // Act & Assert
      expect(() => IdeaSchema.parse(validIdeaFixture)).not.toThrow();
    });

    test("Given_IdeasListResponse_When_Validated_Then_PassesSchema", () => {
      // Arrange
      const ideasList = [validIdeaFixture, { ...validIdeaFixture, _id: "idea_2" }];

      // Act & Assert
      expect(() => IdeasListResponseSchema.parse(ideasList)).not.toThrow();
    });

    test("Given_InvalidIdeaResponse_When_Validated_Then_ThrowsValidationError", () => {
      // Arrange - Missing required field
      const invalidIdea = { ...validIdeaFixture, _id: undefined };

      // Act & Assert
      expect(() => IdeaSchema.parse(invalidIdea)).toThrow();
    });

    test("Given_IdeaWithInvalidTitle_When_Validated_Then_ThrowsValidationError", () => {
      // Arrange - Title too long
      const invalidIdea = { ...validIdeaFixture, title: "A".repeat(201) };

      // Act & Assert
      expect(() => IdeaSchema.parse(invalidIdea)).toThrow();
    });

    test("Given_IdeaWithInvalidPriority_When_Validated_Then_ThrowsValidationError", () => {
      // Arrange - Invalid priority value
      const invalidIdea = { ...validIdeaFixture, priority: "urgent" };

      // Act & Assert
      expect(() => IdeaSchema.parse(invalidIdea)).toThrow();
    });
  });

  describe("Request Validation", () => {
    test("Given_ValidCreateRequest_When_Validated_Then_PassesSchema", () => {
      // Arrange
      const request = {
        title: "New Feature Request",
        content: "Detailed description of the feature",
        workspaceId: "ws_123",
        tags: ["feature", "enhancement"],
        priority: "medium" as const,
      };

      // Act & Assert
      expect(() => CreateIdeaRequestSchema.parse(request)).not.toThrow();
    });

    test("Given_MinimalCreateRequest_When_Validated_Then_PassesSchema", () => {
      // Arrange - Only required fields
      const request = {
        title: "Minimal Idea",
        content: "Just the basics",
        workspaceId: "ws_123",
      };

      // Act & Assert
      expect(() => CreateIdeaRequestSchema.parse(request)).not.toThrow();
    });

    test("Given_InvalidCreateRequest_When_Validated_Then_ThrowsValidationError", () => {
      // Arrange - Title too short
      const request = {
        title: "AB", // Too short
        content: "Valid content",
        workspaceId: "ws_123",
      };

      // Act & Assert
      expect(() => CreateIdeaRequestSchema.parse(request)).toThrow();
    });

    test("Given_ValidUpdateRequest_When_Validated_Then_PassesSchema", () => {
      // Arrange
      const request = {
        title: "Updated Title",
        tags: ["updated", "modified"],
      };

      // Act & Assert
      expect(() => UpdateIdeaRequestSchema.parse(request)).not.toThrow();
    });

    test("Given_EmptyUpdateRequest_When_Validated_Then_PassesSchema", () => {
      // Arrange - Empty update (should be valid)
      const request = {};

      // Act & Assert
      expect(() => UpdateIdeaRequestSchema.parse(request)).not.toThrow();
    });
  });
});

describe("Workspace API Contract", () => {
  test("Given_ValidWorkspaceResponse_When_Validated_Then_PassesSchema", () => {
    // Act & Assert
    expect(() => WorkspaceSchema.parse(validWorkspaceFixture)).not.toThrow();
  });

  test("Given_WorkspaceWithoutDescription_When_Validated_Then_PassesSchema", () => {
    // Arrange - Description is optional
    const workspace = { ...validWorkspaceFixture, description: undefined };

    // Act & Assert
    expect(() => WorkspaceSchema.parse(workspace)).not.toThrow();
  });

  test("Given_WorkspacesListResponse_When_Validated_Then_PassesSchema", () => {
    // Arrange
    const workspacesList = [validWorkspaceFixture];

    // Act & Assert
    expect(() => WorkspacesListResponseSchema.parse(workspacesList)).not.toThrow();
  });

  test("Given_EmptyWorkspacesList_When_Validated_Then_PassesSchema", () => {
    // Arrange
    const emptyList: any[] = [];

    // Act & Assert
    expect(() => WorkspacesListResponseSchema.parse(emptyList)).not.toThrow();
  });
});

describe("User API Contract", () => {
  test("Given_ValidUserResponse_When_Validated_Then_PassesSchema", () => {
    // Act & Assert
    expect(() => UserSchema.parse(validUserFixture)).not.toThrow();
  });

  test("Given_UserWithoutImage_When_Validated_Then_PassesSchema", () => {
    // Arrange - Image is optional
    const user = { ...validUserFixture, image: undefined };

    // Act & Assert
    expect(() => UserSchema.parse(user)).not.toThrow();
  });

  test("Given_UserWithInvalidEmail_When_Validated_Then_ThrowsValidationError", () => {
    // Arrange
    const user = { ...validUserFixture, email: "not-an-email" };

    // Act & Assert
    expect(() => UserSchema.parse(user)).toThrow();
  });

  test("Given_UserWithInvalidImageUrl_When_Validated_Then_ThrowsValidationError", () => {
    // Arrange
    const user = { ...validUserFixture, image: "not-a-url" };

    // Act & Assert
    expect(() => UserSchema.parse(user)).toThrow();
  });
});

describe("Cross-Entity Contract Validation", () => {
  test("Given_IdeaReferencingValidWorkspace_When_Validated_Then_PassesSchema", () => {
    // Arrange
    const idea = { ...validIdeaFixture, workspaceId: validWorkspaceFixture._id };
    
    // Act & Assert
    expect(() => IdeaSchema.parse(idea)).not.toThrow();
    expect(() => WorkspaceSchema.parse(validWorkspaceFixture)).not.toThrow();
  });

  test("Given_ResponseWithTimestampConsistency_When_Validated_Then_EnsuresLogicalOrder", () => {
    // Arrange
    const createdAt = 1704067200000;
    const updatedAt = createdAt + 3600000; // 1 hour later
    const idea = { ...validIdeaFixture, createdAt, updatedAt };

    // Act & Assert
    expect(() => IdeaSchema.parse(idea)).not.toThrow();
    
    // Business logic validation (not schema, but contract behavior)
    expect(idea.updatedAt).toBeGreaterThanOrEqual(idea.createdAt);
  });
});