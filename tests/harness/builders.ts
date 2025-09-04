/**
 * Test Data Builders
 * Deterministic test data factories with minimal faker usage
 * Provides realistic but predictable test data
 */

import { faker } from "@faker-js/faker";

// Seed faker for deterministic results
faker.seed(12345);

// Base types matching your domain
type IdeaData = {
  _id: string;
  title: string;
  content: string;
  workspaceId: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  priority?: "low" | "medium" | "high";
};

type WorkspaceData = {
  _id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

type UserData = {
  _id: string;
  name: string;
  email: string;
  tokenIdentifier: string;
  createdAt: number;
  updatedAt: number;
  image?: string;
};

type WorkspaceMemberData = {
  _id: string;
  workspaceId: string;
  userId: string;
  role: "admin" | "member" | "viewer";
  createdAt: number;
};

/**
 * Idea Builder
 * Creates realistic idea data for testing
 */
export class IdeaBuilder {
  private data: Partial<IdeaData> = {};

  static create(overrides?: Partial<IdeaData>): IdeaData {
    return new IdeaBuilder().build(overrides);
  }

  withTitle(title: string): IdeaBuilder {
    this.data.title = title;
    return this;
  }

  withContent(content: string): IdeaBuilder {
    this.data.content = content;
    return this;
  }

  withWorkspace(workspaceId: string): IdeaBuilder {
    this.data.workspaceId = workspaceId;
    return this;
  }

  withTags(tags: string[]): IdeaBuilder {
    this.data.tags = tags;
    return this;
  }

  withPriority(priority: "low" | "medium" | "high"): IdeaBuilder {
    this.data.priority = priority;
    return this;
  }

  withTimestamp(timestamp: number): IdeaBuilder {
    this.data.createdAt = timestamp;
    this.data.updatedAt = timestamp;
    return this;
  }

  build(overrides?: Partial<IdeaData>): IdeaData {
    const now = Date.now();
    
    return {
      _id: faker.string.alphanumeric({ length: 12, casing: "lower" }),
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      content: faker.lorem.paragraphs({ min: 1, max: 3 }, "\n\n"),
      workspaceId: faker.string.alphanumeric({ length: 10, casing: "lower" }),
      createdAt: now - faker.number.int({ min: 0, max: 86400000 }), // Within last day
      updatedAt: now,
      tags: faker.helpers.maybe(() => [
        faker.helpers.arrayElement(["feature", "bug", "improvement", "docs", "test"]),
        faker.helpers.arrayElement(["frontend", "backend", "api", "ui", "ux"]),
      ], { probability: 0.7 }),
      priority: faker.helpers.arrayElement(["low", "medium", "high"]),
      ...this.data,
      ...overrides,
    };
  }
}

/**
 * Workspace Builder
 * Creates realistic workspace data for testing
 */
export class WorkspaceBuilder {
  private data: Partial<WorkspaceData> = {};

  static create(overrides?: Partial<WorkspaceData>): WorkspaceData {
    return new WorkspaceBuilder().build(overrides);
  }

  withName(name: string): WorkspaceBuilder {
    this.data.name = name;
    return this;
  }

  withDescription(description: string): WorkspaceBuilder {
    this.data.description = description;
    return this;
  }

  build(overrides?: Partial<WorkspaceData>): WorkspaceData {
    const now = Date.now();
    
    return {
      _id: `ws_${faker.string.alphanumeric({ length: 8, casing: "lower" })}`,
      name: faker.company.name(),
      description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }),
      createdAt: now - faker.number.int({ min: 0, max: 2592000000 }), // Within last month
      updatedAt: now - faker.number.int({ min: 0, max: 86400000 }), // Within last day
      ...this.data,
      ...overrides,
    };
  }
}

/**
 * User Builder
 * Creates realistic user data for testing
 */
export class UserBuilder {
  private data: Partial<UserData> = {};

  static create(overrides?: Partial<UserData>): UserData {
    return new UserBuilder().build(overrides);
  }

  withName(name: string): UserBuilder {
    this.data.name = name;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.data.email = email;
    return this;
  }

  withTokenIdentifier(tokenIdentifier: string): UserBuilder {
    this.data.tokenIdentifier = tokenIdentifier;
    return this;
  }

  withImage(image: string): UserBuilder {
    this.data.image = image;
    return this;
  }

  build(overrides?: Partial<UserData>): UserData {
    const now = Date.now();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    return {
      _id: `user_${faker.string.alphanumeric({ length: 8, casing: "lower" })}`,
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      tokenIdentifier: `${faker.helpers.arrayElement(["google", "github"])}|${faker.string.alphanumeric({ length: 10 })}`,
      createdAt: now - faker.number.int({ min: 0, max: 7776000000 }), // Within last 90 days
      updatedAt: now - faker.number.int({ min: 0, max: 86400000 }), // Within last day
      image: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.8 }),
      ...this.data,
      ...overrides,
    };
  }
}

/**
 * Workspace Member Builder
 * Creates workspace membership data for testing
 */
export class WorkspaceMemberBuilder {
  private data: Partial<WorkspaceMemberData> = {};

  static create(overrides?: Partial<WorkspaceMemberData>): WorkspaceMemberData {
    return new WorkspaceMemberBuilder().build(overrides);
  }

  withWorkspace(workspaceId: string): WorkspaceMemberBuilder {
    this.data.workspaceId = workspaceId;
    return this;
  }

  withUser(userId: string): WorkspaceMemberBuilder {
    this.data.userId = userId;
    return this;
  }

  withRole(role: "admin" | "member" | "viewer"): WorkspaceMemberBuilder {
    this.data.role = role;
    return this;
  }

  build(overrides?: Partial<WorkspaceMemberData>): WorkspaceMemberData {
    const now = Date.now();
    
    return {
      _id: `member_${faker.string.alphanumeric({ length: 8, casing: "lower" })}`,
      workspaceId: `ws_${faker.string.alphanumeric({ length: 8, casing: "lower" })}`,
      userId: `user_${faker.string.alphanumeric({ length: 8, casing: "lower" })}`,
      role: faker.helpers.arrayElement(["admin", "member", "viewer"]),
      createdAt: now - faker.number.int({ min: 0, max: 86400000 }), // Within last day
      ...this.data,
      ...overrides,
    };
  }
}

/**
 * Scenario Builders
 * Pre-built scenarios for common test setups
 */
export class ScenarioBuilder {
  /**
   * Creates a complete workspace with admin user and ideas
   */
  static workspaceWithIdeas(ideaCount = 3) {
    const workspace = WorkspaceBuilder.create({
      name: "Test Workspace",
    });

    const admin = UserBuilder.create({
      name: "Admin User",
      email: "admin@test.com",
      tokenIdentifier: "test|admin123",
    });

    const membership = WorkspaceMemberBuilder.create({
      workspaceId: workspace._id,
      userId: admin._id,
      role: "admin",
    });

    const ideas = Array.from({ length: ideaCount }, (_, index) =>
      IdeaBuilder.create({
        workspaceId: workspace._id,
        title: `Test Idea ${index + 1}`,
        createdAt: Date.now() - (ideaCount - index) * 3600000, // Spread over hours
      })
    );

    return {
      workspace,
      admin,
      membership,
      ideas,
    };
  }

  /**
   * Creates a workspace with multiple users and different roles
   */
  static workspaceWithTeam() {
    const workspace = WorkspaceBuilder.create({
      name: "Team Workspace",
    });

    const admin = UserBuilder.create({
      name: "Team Admin",
      tokenIdentifier: "test|admin123",
    });

    const member = UserBuilder.create({
      name: "Team Member",
      tokenIdentifier: "test|member123",
    });

    const viewer = UserBuilder.create({
      name: "Team Viewer",
      tokenIdentifier: "test|viewer123",
    });

    const memberships = [
      WorkspaceMemberBuilder.create({
        workspaceId: workspace._id,
        userId: admin._id,
        role: "admin",
      }),
      WorkspaceMemberBuilder.create({
        workspaceId: workspace._id,
        userId: member._id,
        role: "member",
      }),
      WorkspaceMemberBuilder.create({
        workspaceId: workspace._id,
        userId: viewer._id,
        role: "viewer",
      }),
    ];

    return {
      workspace,
      users: { admin, member, viewer },
      memberships,
    };
  }

  /**
   * Creates ideas with different priorities and tags
   */
  static ideasWithPriorities(workspaceId: string) {
    return [
      IdeaBuilder.create({
        workspaceId,
        title: "Critical Bug Fix",
        priority: "high",
        tags: ["bug", "critical", "backend"],
      }),
      IdeaBuilder.create({
        workspaceId,
        title: "Feature Enhancement",
        priority: "medium",
        tags: ["feature", "enhancement", "frontend"],
      }),
      IdeaBuilder.create({
        workspaceId,
        title: "Documentation Update",
        priority: "low",
        tags: ["docs", "improvement"],
      }),
    ];
  }
}

/**
 * Test Data Factory
 * Simple factory methods for one-off test data
 */
export const TestDataFactory = {
  idea: (overrides?: Partial<IdeaData>) => IdeaBuilder.create(overrides),
  workspace: (overrides?: Partial<WorkspaceData>) => WorkspaceBuilder.create(overrides),
  user: (overrides?: Partial<UserData>) => UserBuilder.create(overrides),
  workspaceMember: (overrides?: Partial<WorkspaceMemberData>) => WorkspaceMemberBuilder.create(overrides),
  
  // Predefined common test data
  testUser: () => UserBuilder.create({
    name: "Test User",
    email: "test@example.com",
    tokenIdentifier: "test|user123",
  }),

  testWorkspace: () => WorkspaceBuilder.create({
    name: "Test Workspace",
  }),

  testIdea: (workspaceId?: string) => IdeaBuilder.create({
    title: "Test Idea",
    content: "This is a test idea",
    workspaceId: workspaceId || "test_workspace",
  }),
};

// Re-export builders for convenience
export {
  IdeaBuilder as Idea,
  WorkspaceBuilder as Workspace,
  UserBuilder as User,
  WorkspaceMemberBuilder as WorkspaceMember,
  ScenarioBuilder as Scenario,
};