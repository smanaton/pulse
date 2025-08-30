# Pulse Web Clipper Extension

A Chrome extension for capturing web content directly to your Pulse workspace with one click.

## Features

- **Quick Capture**: Capture URL and title with one click
- **Selection Capture**: Capture highlighted text with context
- **Screenshot Capture**: Capture visible area of the webpage
- **Smart Organization**: Automatically organize clips by workspace and folders
- **Tag Support**: Add tags to categorize your clips
- **Offline Support**: Queue clips when offline and sync when connected

## Installation

### Development

1. Install dependencies:
```bash
cd apps/chrome-extension
pnpm install
```

2. Build the extension:
```bash
pnpm run build
```

3. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Production

The extension will be available in the Chrome Web Store once published.

## Setup

1. Open the extension options page
2. Enter your Pulse API URL (default: http://localhost:3000 for development)
3. Generate a Personal Access Token from your Pulse account settings
4. Enter the token in the extension settings
5. Click "Connect to Pulse"

## Usage

### Quick Capture
1. Navigate to any webpage
2. Click the Pulse extension icon
3. Select "Quick" capture type
4. Choose destination (new note or existing note)
5. Add tags if desired
6. Click "Capture to Pulse"

### Selection Capture
1. Highlight text on any webpage
2. Right-click and select "Clip to Pulse" from context menu
3. Or use the extension popup with "Selection" capture type

### Keyboard Shortcuts
- `Alt+Shift+S`: Quick save current page

## Configuration

### API Settings
- **API URL**: Your Pulse instance URL
- **Personal Access Token**: Generated from Pulse account settings

### Capture Settings
- **Default capture type**: Quick, Selection, or Screenshot
- **Default destination**: New note or existing note
- **Auto-tags**: Automatically applied tags

## Development

### Project Structure

```
apps/chrome-extension/
├── manifest.json          # Extension manifest
├── src/
│   ├── popup/            # Extension popup UI
│   │   ├── Popup.tsx
│   │   └── index.html
│   ├── content/          # Content scripts
│   │   └── index.ts
│   ├── background/       # Service worker
│   │   └── index.ts
│   └── options/          # Settings page
│       ├── Options.tsx
│       └── index.html
└── public/
    └── icons/           # Extension icons
```

### Building

- `pnpm run dev`: Development mode with hot reload
- `pnpm run build`: Production build
- `pnpm run build:firefox`: Build for Firefox (future)

### Testing

The extension integrates with the Pulse backend API using:
- Personal Access Tokens for authentication
- HTTP endpoints for web clipping
- Real-time status updates

## API Integration

### Authentication
The extension uses Personal Access Tokens to authenticate with Pulse:

```typescript
POST /api/clipper/auth
Authorization: Bearer pk_live_...
```

### Capture
Web content is captured via the clipper API:

```typescript
POST /api/clipper/capture
Authorization: Bearer pk_live_...
Content-Type: application/json

{
  "url": "https://example.com",
  "title": "Page Title",
  "type": "quick",
  "destination": "new",
  "tags": ["web", "article"]
}
```

### Task Status
Check capture progress:

```typescript
GET /api/clipper/task/:taskId
Authorization: Bearer pk_live_...
```

## Security

- API keys are stored securely in Chrome's local storage
- Keys are scoped per device and workspace
- All requests use HTTPS in production
- Content is sanitized before storage

## Privacy

- Only captures content you explicitly select
- No automatic tracking or data collection
- All data stays within your Pulse workspace
- Source URLs are logged for organization only

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details