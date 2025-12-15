/**
 * URL Importer Service
 * Fetches content from hosted pages and converts it to documentation
 */

/**
 * Fetch content from a hosted page URL
 */
export async function fetchPageContent(url: string): Promise<string> {
  try {
    // Use a CORS proxy or backend endpoint to fetch the page
    // For now, we'll try direct fetch (may fail due to CORS)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return html;
  } catch (error: any) {
    // If direct fetch fails due to CORS, we'll need a backend proxy
    throw new Error(`Failed to fetch page content: ${error.message}. CORS may be blocking the request. Consider using a backend proxy.`);
  }
}

/**
 * Extract text content from HTML
 */
export function extractTextFromHTML(html: string): string {
  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style');
  scripts.forEach((el) => el.remove());

  // Extract text content
  const body = doc.body;
  if (!body) return '';

  // Get all text nodes
  const textContent = body.innerText || body.textContent || '';

  // Extract title
  const title = doc.querySelector('title')?.textContent || '';
  const h1 = doc.querySelector('h1')?.textContent || '';

  // Extract meta description
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  // Build documentation
  let documentation = '';

  if (title) {
    documentation += `# ${title}\n\n`;
  }

  if (metaDescription) {
    documentation += `${metaDescription}\n\n`;
  }

  if (h1 && h1 !== title) {
    documentation += `## ${h1}\n\n`;
  }

  // Extract headings
  const headings = body.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent?.trim();
    if (text && !text.includes(title) && !text.includes(h1)) {
      documentation += `${'#'.repeat(level + 1)} ${text}\n\n`;
    }
  });

  // Extract paragraphs
  const paragraphs = body.querySelectorAll('p');
  paragraphs.forEach((p) => {
    const text = p.textContent?.trim();
    if (text && text.length > 20) {
      documentation += `${text}\n\n`;
    }
  });

  // Extract lists
  const lists = body.querySelectorAll('ul, ol');
  lists.forEach((list) => {
    const items = list.querySelectorAll('li');
    items.forEach((item) => {
      const text = item.textContent?.trim();
      if (text) {
        documentation += `- ${text}\n`;
      }
    });
    documentation += '\n';
  });

  return documentation || textContent;
}

/**
 * Generate documentation from a hosted page URL
 */
export async function generateDocumentationFromUrl(
  url: string,
  options: {
    format?: 'markdown' | 'html' | 'json';
    includeCode?: boolean;
    includeProps?: boolean;
    includeExamples?: boolean;
    depth?: 'basic' | 'detailed' | 'comprehensive';
  } = {}
): Promise<string> {
  try {
    const html = await fetchPageContent(url);
    const documentation = extractTextFromHTML(html);

    let doc = `# Documentation for ${url}\n\n`;
    doc += `**Source URL:** ${url}\n`;
    doc += `**Generated:** ${new Date().toISOString()}\n\n`;
    doc += `---\n\n`;
    doc += documentation;

    return doc;
  } catch (error: any) {
    throw new Error(`Failed to generate documentation from URL: ${error.message}`);
  }
}

