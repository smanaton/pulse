// Content script for Pulse Web Clipper

interface PageMetadata {
	url: string;
	title: string;
	description: string;
	image: string;
	author: string;
	publishedTime: string;
	canonical: string;
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	switch (message.action) {
		case "getSelection":
			sendResponse({
				selection: window.getSelection()?.toString(),
				url: window.location.href,
				title: document.title,
			});
			break;
		case "extractContent":
			try {
				const content = {
					url: window.location.href,
					title: document.title,
					content: extractMainContent(),
					selection: window.getSelection()?.toString().trim() || "",
					metadata: getPageMetadata(),
				};
				sendResponse({ success: true, content });
			} catch (error) {
				console.error("Content extraction failed:", error);
				sendResponse({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
			break;
		case "captureScreenshot":
			captureScreenshot().then(sendResponse);
			return true; // Will respond asynchronously
		case "highlightSelection":
			highlightSelection();
			break;
		default:
			console.warn("Unknown content script action:", message.action);
	}
});

// Function to capture screenshot of visible area
async function captureScreenshot(): Promise<string | null> {
	try {
		// This will be handled by the background script using chrome.tabs.captureVisibleTab
		const response = await chrome.runtime.sendMessage({
			action: "captureVisibleTab",
		});
		return response.dataUrl;
	} catch (error) {
		console.error("Screenshot capture failed:", error);
		return null;
	}
}

// Function to highlight current selection
function highlightSelection() {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0) return;

	const range = selection.getRangeAt(0);
	if (range.collapsed) return;

	// Create highlight element
	const highlight = document.createElement("span");
	highlight.style.backgroundColor = "#3b82f6";
	highlight.style.color = "white";
	highlight.style.padding = "2px 4px";
	highlight.style.borderRadius = "4px";
	highlight.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";

	try {
		range.surroundContents(highlight);

		// Remove highlight after 2 seconds
		setTimeout(() => {
			if (highlight.parentNode) {
				const parent = highlight.parentNode;
				parent.replaceChild(
					document.createTextNode(highlight.textContent || ""),
					highlight,
				);
				parent.normalize();
			}
		}, 2000);
	} catch (error) {
		console.error("Could not highlight selection:", error);
	}
}

// Function to get page metadata
function getPageMetadata() {
	const metadata: PageMetadata = {
		url: window.location.href,
		title: document.title,
		description: "",
		image: "",
		author: "",
		publishedTime: "",
		canonical: window.location.href,
	};

	// Get meta description
	const metaDescription = document.querySelector(
		'meta[name="description"]',
	) as HTMLMetaElement;
	if (metaDescription) {
		metadata.description = metaDescription.content;
	}

	// Get Open Graph data
	const ogTitle = document.querySelector(
		'meta[property="og:title"]',
	) as HTMLMetaElement;
	const ogDescription = document.querySelector(
		'meta[property="og:description"]',
	) as HTMLMetaElement;
	const ogImage = document.querySelector(
		'meta[property="og:image"]',
	) as HTMLMetaElement;
	const ogUrl = document.querySelector(
		'meta[property="og:url"]',
	) as HTMLMetaElement;

	if (ogTitle) metadata.title = ogTitle.content;
	if (ogDescription) metadata.description = ogDescription.content;
	if (ogImage) metadata.image = ogImage.content;
	if (ogUrl) metadata.canonical = ogUrl.content;

	// Get article metadata
	const articleAuthor = document.querySelector(
		'meta[name="author"]',
	) as HTMLMetaElement;
	const articlePublishedTime = document.querySelector(
		'meta[property="article:published_time"]',
	) as HTMLMetaElement;

	if (articleAuthor) metadata.author = articleAuthor.content;
	if (articlePublishedTime)
		metadata.publishedTime = articlePublishedTime.content;

	// Get canonical URL
	const canonicalLink = document.querySelector(
		'link[rel="canonical"]',
	) as HTMLLinkElement;
	if (canonicalLink) {
		metadata.canonical = canonicalLink.href;
	}

	return metadata;
}

// Function to extract main content
function extractMainContent(): string {
	// Try to find main content area
	const contentSelectors = [
		"main",
		'[role="main"]',
		".content",
		".post-content",
		".entry-content",
		".article-content",
		"article",
		".main-content",
	];

	for (const selector of contentSelectors) {
		const element = document.querySelector(selector);
		if (element) {
			return cleanContent(element as HTMLElement);
		}
	}

	// Fallback to body if no main content found
	return cleanContent(document.body);
}

// Function to clean and extract text content
function cleanContent(element: HTMLElement): string {
	// Clone the element to avoid modifying the original
	const clone = element.cloneNode(true) as HTMLElement;

	// Remove unwanted elements
	const unwantedSelectors = [
		"script",
		"style",
		"nav",
		"header",
		"footer",
		".advertisement",
		".ads",
		".social-share",
		".comments",
		".sidebar",
	];

	unwantedSelectors.forEach((selector) => {
		const elements = clone.querySelectorAll(selector);
		for (const el of elements) {
			el.remove();
		}
	});

	// Convert to markdown-like format
	let content = "";

	// Process headings
	const headings = clone.querySelectorAll("h1, h2, h3, h4, h5, h6");
	headings.forEach((heading) => {
		const level = Number.parseInt(heading.tagName.slice(1), 10);
		const hashes = "#".repeat(level);
		heading.textContent = `${hashes} ${heading.textContent}`;
	});

	// Process code blocks
	const codeBlocks = clone.querySelectorAll("pre code, pre");
	codeBlocks.forEach((block) => {
		const text = block.textContent || "";
		block.textContent = `\`\`\`\n${text}\n\`\`\``;
	});

	// Process inline code
	const inlineCode = clone.querySelectorAll("code");
	inlineCode.forEach((code) => {
		if (!code.closest("pre")) {
			code.textContent = `\`${code.textContent}\``;
		}
	});

	// Process links
	const links = clone.querySelectorAll("a[href]");
	links.forEach((link) => {
		const href = (link as HTMLAnchorElement).href;
		const text = link.textContent || "";
		if (href && href !== text) {
			link.textContent = `[${text}](${href})`;
		}
	});

	// Get final text content
	content = clone.textContent || "";

	// Clean up extra whitespace
	content = content
		.replace(/\n\s*\n\s*\n/g, "\n\n")
		.replace(/^\s+|\s+$/g, "")
		.trim();

	return content;
}

// Make functions available globally for background script access
declare global {
	interface Window {
		pulseClipper: {
			getPageMetadata: () => PageMetadata;
			extractMainContent: () => string;
			getSelection: () => string;
			highlightSelection: () => void;
		};
	}
}

window.pulseClipper = {
	getPageMetadata,
	extractMainContent,
	getSelection: () => window.getSelection()?.toString() || "",
	highlightSelection,
};
