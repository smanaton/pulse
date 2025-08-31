# @pulse/ideas-logic

Pure business logic for idea management in the Pulse platform.

## Overview

The `@pulse/ideas-logic` package contains all business logic for idea management without any Convex dependencies. This allows for independent testing, reuse across different contexts, and clear separation of concerns.

## Features

- ✅ **Idea Management**: Create, update, and process ideas
- ✅ **Content Validation**: Sanitization and safety checks
- ✅ **Folder Organization**: Hierarchical folder management
- ✅ **Tag System**: Flexible tagging and suggestions
- ✅ **Search Processing**: Query parsing and result ranking
- ✅ **Export/Import**: Multiple format support
- ✅ **Pure Functions**: No side effects, easy to test

## Installation

```bash
pnpm add @pulse/ideas-logic
```

## Usage

### Idea Management

```typescript
import { processIdeaCreation, processIdeaUpdate } from '@pulse/ideas-logic/services';

// Create new idea
const creationResult = await processIdeaCreation({
  workspaceId: 'workspace123',
  title: 'My Great Idea',
  contentMD: '# Details\nThis is my idea...',
  createdBy: 'user123',
});

if (creationResult.success) {
  // Use creationResult.data for database insertion
  await db.insert('ideas', creationResult.data);
}

// Update existing idea
const updateResult = await processIdeaUpdate(
  { title: 'Updated Title', status: 'active' },
  existingIdeaData
);
```

### Content Enhancement

```typescript
import { enhanceIdeaMetadata } from '@pulse/ideas-logic/services';

const enhancement = enhanceIdeaMetadata(
  'JavaScript Performance Tips',
  'Here are some ways to optimize your JavaScript code...'
);

console.log(enhancement.keywords);        // ['javascript', 'performance', 'optimize']
console.log(enhancement.suggestedTags);   // ['JavaScript', 'Performance', 'Optimize']
console.log(enhancement.readingTime);     // 2 (minutes)
console.log(enhancement.wordCount);       // 350
```

### Folder Management

```typescript
import { 
  processFolderCreation, 
  buildFolderHierarchy,
  processFolderMove 
} from '@pulse/ideas-logic/services';

// Create folder
const folderResult = await processFolderCreation({
  workspaceId: 'workspace123',
  name: 'Project Ideas',
  parentId: 'parent-folder',
  createdBy: 'user123',
});

// Build hierarchy for display
const hierarchy = buildFolderHierarchy(folders, ideaCounts);

// Move folder (with circular dependency check)
const moveResult = processFolderMove(
  'folder-to-move',
  'new-parent-folder',
  currentHierarchyMap
);
```

### Tag Management

```typescript
import { 
  processTagCreation,
  generateTagSuggestions,
  calculateTagAnalytics 
} from '@pulse/ideas-logic/services';

// Create tag
const tagResult = await processTagCreation({
  workspaceId: 'workspace123',
  name: 'JavaScript',
  color: '#F7DF1E',
  createdBy: 'user123',
});

// Generate AI suggestions
const suggestions = generateTagSuggestions(
  'This is about React components and TypeScript interfaces',
  existingTags,
  { maxSuggestions: 5 }
);

// Analytics
const analytics = calculateTagAnalytics(tags, tagUsageMap);
```

### Search Processing

```typescript
import { 
  processSearchQuery,
  rankSearchResults,
  generateSearchSuggestions 
} from '@pulse/ideas-logic/services';

// Process search query
const processedQuery = processSearchQuery({
  workspaceId: 'workspace123',
  query: 'JavaScript React performance',
  status: 'active',
});

// Rank results
const rankedResults = rankSearchResults(
  ideas,
  processedQuery.searchTerms,
  { prioritizeRecent: true }
);

// Generate suggestions
const suggestions = generateSearchSuggestions(
  'java', // partial query
  searchHistory,
  10 // max suggestions
);
```

## API Reference

### Services

#### Idea Service (`@pulse/ideas-logic/services/idea-service`)

**processIdeaCreation(input)**
- Validates and processes idea creation
- Returns: `IdeaCreationResult`

**processIdeaUpdate(input, existingIdea)**
- Validates and processes idea updates
- Returns: `IdeaUpdateResult`

**enhanceIdeaMetadata(title, content)**
- Generates metadata for ideas
- Returns: `IdeaEnhancement`

**processStatusChange(currentStatus, newStatus, ideaData)**
- Validates status transitions
- Returns: `StatusChangeResult`

**processDuplicateIdea(originalIdea, createdBy, options?)**
- Creates idea copy with modifications
- Returns: `IdeaDuplicationResult`

#### Folder Service (`@pulse/ideas-logic/services/folder-service`)

**processFolderCreation(input, existingNames?)**
- Creates new folder with validation
- Returns: `FolderCreationResult`

**buildFolderHierarchy(folders, ideaCounts?)**
- Builds tree structure from flat list
- Returns: `FolderHierarchy[]`

**processFolderMove(folderId, targetParent, hierarchy)**
- Moves folder with circular dependency check
- Returns: `FolderMoveResult`

**buildFolderPath(folderId, foldersMap)**
- Generates breadcrumb path
- Returns: `FolderPath`

#### Tag Service (`@pulse/ideas-logic/services/tag-service`)

**processTagCreation(input, existingNames?)**
- Creates tag with normalization
- Returns: `TagCreationResult`

**generateTagSuggestions(content, existingTags, options?)**
- AI-powered tag suggestions
- Returns: `TagSuggestion[]`

**calculateTagAnalytics(tags, usage)**
- Tag usage statistics
- Returns: `TagAnalytics`

#### Search Service (`@pulse/ideas-logic/services/search-service`)

**processSearchQuery(input)**
- Parses and cleans search input
- Returns: `ProcessedSearchQuery`

**rankSearchResults(ideas, searchTerms, options?)**
- Scores and ranks search results
- Returns: `SearchResult[]`

**generateSearchSuggestions(partialQuery, history, maxSuggestions?)**
- Search autocomplete suggestions
- Returns: `SearchSuggestion[]`

### Transformers

#### Data Transformers (`@pulse/ideas-logic/transformers`)

**transformCreateIdeaInput(input)**
- Sanitizes and normalizes creation data
- Returns: `ProcessedIdeaData`

**transformUpdateIdeaInput(input, existing)**
- Processes update data
- Returns: `Partial<ProcessedIdeaData>`

**extractKeywordsFromContent(content, maxKeywords?)**
- NLP keyword extraction
- Returns: `string[]`

**transformSearchQuery(query)**
- Cleans search queries
- Returns: `string`

### Validators

#### Input Validation (`@pulse/ideas-logic/validators`)

**validateCreateIdeaInput(input)**
- Validates idea creation
- Returns: `ValidationResult`

**validateUpdateIdeaInput(input)**  
- Validates idea updates
- Returns: `ValidationResult`

**validateContent(content)**
- Checks for XSS and dangerous content
- Returns: `ValidationResult`

**validateBulkCreateIdeas(inputs)**
- Batch validation
- Returns: `ValidationResult[]`

## Testing

The package includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch
```

### Test Examples

```typescript
import { processIdeaCreation } from '@pulse/ideas-logic/services';

test('should create valid idea', async () => {
  const input = {
    workspaceId: 'workspace123',
    title: 'Test Idea',
    contentMD: 'Test content',
    createdBy: 'user123',
  };

  const result = await processIdeaCreation(input);

  expect(result.success).toBe(true);
  expect(result.data?.title).toBe('Test Idea');
  expect(result.data?.status).toBe('draft');
});
```

## Architecture

### Design Principles

1. **Pure Functions**: No side effects or external dependencies
2. **Validation First**: Strict input validation before processing
3. **Error Handling**: Comprehensive error reporting
4. **Testability**: Easy to test in isolation
5. **Type Safety**: Full TypeScript coverage

### Data Flow

```
Input → Validation → Transformation → Processing → Output
```

### Dependencies

- `@pulse/core` - Shared types and utilities
- No Convex dependencies (by design)
- No database dependencies
- No framework dependencies

## Examples

### Custom Business Logic

```typescript
import { 
  validateCreateIdeaInput,
  transformCreateIdeaInput 
} from '@pulse/ideas-logic';

async function customIdeaProcessor(rawInput: any) {
  // Custom validation
  const validation = validateCreateIdeaInput(rawInput);
  if (!validation.valid) {
    return { error: validation.errors[0].message };
  }

  // Transform data
  const processedData = transformCreateIdeaInput(rawInput);

  // Add custom fields
  const customData = {
    ...processedData,
    customField: 'custom value',
    processedAt: Date.now(),
  };

  return { success: true, data: customData };
}
```

### Integration with Other Systems

```typescript
import { enhanceIdeaMetadata } from '@pulse/ideas-logic/services';

// Use with different databases
async function saveToMongoDB(ideaData: any) {
  const enhancement = enhanceIdeaMetadata(ideaData.title, ideaData.content);
  
  await mongoCollection.insertOne({
    ...ideaData,
    keywords: enhancement.keywords,
    readingTime: enhancement.readingTime,
    aiSuggestedTags: enhancement.suggestedTags,
  });
}

// Use in different contexts
function processIdeaForAPI(ideaData: any) {
  const enhancement = enhanceIdeaMetadata(ideaData.title, ideaData.content);
  
  return {
    id: ideaData.id,
    title: ideaData.title,
    summary: enhancement.summary,
    metadata: {
      wordCount: enhancement.wordCount,
      readingTime: enhancement.readingTime,
      suggestedTags: enhancement.suggestedTags,
    },
  };
}
```

## Contributing

1. Keep functions pure (no side effects)
2. Add comprehensive tests for new features
3. Follow existing patterns and conventions
4. Update type definitions as needed
5. Document public APIs

## License

MIT - See LICENSE file for details.