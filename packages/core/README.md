# @pulse/core

Core platform layer for Pulse - shared types, validators, and utilities.

## Overview

The `@pulse/core` package provides the foundational elements used across all Pulse modules:
- TypeScript type definitions for all entities
- Convex validators for input validation  
- Authentication guard interfaces and helpers
- Common utility functions
- Shared constants and configurations

## Installation

```bash
pnpm add @pulse/core
```

## Usage

### Types

```typescript
import type { 
  User, 
  Workspace, 
  Idea, 
  WorkspaceRole 
} from '@pulse/core/types';

const user: User = {
  _id: 'user123' as Id<"users">,
  _creationTime: Date.now(),
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
```

### Validators

```typescript
import { 
  usersValidator, 
  workspacesValidator,
  ideaCreateArgs 
} from '@pulse/core/validators';

export const createIdea = mutation({
  args: ideaCreateArgs,
  handler: async (ctx, args) => {
    // args are automatically validated
  },
});
```

### Authentication Guards

```typescript
import { 
  PERMISSIONS, 
  hasPermission, 
  canAccess 
} from '@pulse/core/auth';

// Check if role has permission
if (hasPermission('editor', PERMISSIONS.IDEAS_WRITE)) {
  // Allow action
}

// Check role hierarchy
if (canAccess('admin', 'editor')) {
  // Admin can perform editor actions
}
```

### Utilities

```typescript
import { 
  sanitizeContent,
  formatDate,
  isValidEmail,
  slugify 
} from '@pulse/core/shared';

// Content sanitization
const safeContent = sanitizeContent(userInput);

// Date formatting
const formatted = formatDate(timestamp);

// Validation
const isValid = isValidEmail('test@example.com');

// Text processing
const slug = slugify('My Article Title'); // 'my-article-title'
```

### Error Handling

```typescript
import { 
  AuthenticationError,
  ValidationError,
  WorkspaceNotFoundError 
} from '@pulse/core/auth/errors';

if (!userId) {
  throw new AuthenticationError('Login required');
}

if (!isValidInput(data)) {
  throw new ValidationError('Invalid data provided', 'fieldName');
}
```

## API Reference

### Types Module (`@pulse/core/types`)

#### Core Entities
- `User` - User account information
- `Workspace` - Workspace/organization entity
- `WorkspaceMember` - User membership in workspace
- `Idea` - Content/idea entity
- `Folder` - Hierarchical organization
- `Tag` - Content categorization

#### Utility Types
- `Optional<T, K>` - Make specific fields optional
- `RequireFields<T, K>` - Make specific fields required
- `DeepPartial<T>` - Recursive partial type
- `EntityId<T>` - Extract ID types

### Validators Module (`@pulse/core/validators`)

#### Entity Validators
- `usersValidator` - User table validation
- `workspacesValidator` - Workspace table validation
- `ideasValidator` - Idea table validation
- `foldersValidator` - Folder table validation
- `tagsValidator` - Tag table validation

#### Argument Validators
- `ideaCreateArgs` - Create idea arguments
- `ideaUpdateArgs` - Update idea arguments
- `folderCreateArgs` - Create folder arguments
- `tagCreateArgs` - Create tag arguments

### Auth Module (`@pulse/core/auth`)

#### Permission System
- `PERMISSIONS` - All available permissions
- `ROLE_HIERARCHY` - Role priority levels
- `ROLE_PERMISSIONS` - Role to permission mapping

#### Guard Functions
- `hasPermission(role, permission)` - Check role permissions
- `canAccess(userRole, minRole)` - Check role hierarchy
- `getRolePermissions(role)` - Get all role permissions

#### Mock Guards
- `createMockAuthGuards()` - For testing purposes

### Shared Module (`@pulse/core/shared`)

#### Content Processing
- `sanitizeContent(content)` - Remove dangerous HTML
- `sanitizeTitle(title)` - Clean and truncate titles
- `extractPlainText(markdown)` - Convert markdown to plain text

#### Date/Time
- `formatDate(timestamp, locale?)` - Format date
- `formatDateTime(timestamp, locale?)` - Format date with time
- `getTimeAgo(timestamp)` - Relative time (e.g., "2h ago")

#### String Utilities
- `truncate(text, length, suffix?)` - Truncate with ellipsis
- `capitalize(text)` - Capitalize first letter
- `slugify(text)` - Create URL-friendly slug

#### Validation
- `isValidUrl(url)` - URL validation
- `isValidEmail(email)` - Email validation
- `isValidSlug(slug)` - Slug format validation

#### Array/Object Utilities
- `unique(array)` - Remove duplicates
- `groupBy(array, keyFn)` - Group array elements
- `sortBy(array, keyFn)` - Sort by key function
- `pick(obj, keys)` - Select object properties
- `omit(obj, keys)` - Exclude object properties

### Constants (`@pulse/core/shared/constants`)

#### Limits
- `LIMITS.IDEA_TITLE_MAX_LENGTH`
- `LIMITS.WORKSPACE_MEMBERS_FREE`
- `LIMITS.API_REQUEST_TIMEOUT`

#### Status Values
- `IDEA_STATUS` - Valid idea statuses
- `WORKSPACE_TYPE` - Workspace types
- `WORKSPACE_ROLE` - Available roles

#### Features
- `FEATURES.AI_SUGGESTIONS`
- `FEATURES.WEB_CLIPPER`

## Development

### Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Building

```bash
# Build TypeScript
pnpm build

# Type checking
pnpm check
```

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new functionality
3. Update type definitions as needed
4. Document public APIs
5. Maintain backward compatibility

## Examples

### Custom Validation

```typescript
import { ValidationError } from '@pulse/core/auth/errors';

function validateCustomData(data: unknown): asserts data is ValidData {
  if (!isValidCustomData(data)) {
    throw new ValidationError('Invalid custom data format');
  }
}
```

### Permission Checking

```typescript
import { PERMISSIONS, getRolePermissions } from '@pulse/core/auth';

function checkUserAccess(userRole: WorkspaceRole, requiredPermission: string): boolean {
  const permissions = getRolePermissions(userRole);
  return permissions.includes(requiredPermission as any);
}
```

### Content Processing

```typescript
import { sanitizeContent, extractPlainText } from '@pulse/core/shared';

function processUserContent(markdown: string) {
  // Sanitize HTML
  const safeContent = sanitizeContent(markdown);
  
  // Extract for search indexing
  const plainText = extractPlainText(safeContent);
  
  return { safeContent, plainText };
}
```

## License

MIT - See LICENSE file for details.