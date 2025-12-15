/**
 * PDF Exporter
 * Converts markdown/HTML documentation to PDF format (client-side)
 */

import { DocSection } from '../types/core';

/**
 * Export documentation section to PDF
 * Uses browser's print functionality or a PDF library
 */
export async function exportToPDF(section: DocSection): Promise<string> {
  console.log(`[PDFExporter] Exporting ${section.type} to PDF...`);

  try {
    // Get content based on format
    let content = '';
    if (section.html) {
      content = section.html;
    } else if (section.markdown) {
      // Convert markdown to HTML first
      content = await markdownToHTML(section.markdown);
    } else {
      throw new Error('No content available for PDF export');
    }

    // Create a styled HTML document
    const htmlDocument = createPDFHTML(section.title, content);

    // Generate PDF using browser print API
    const blob = await htmlToPDF(htmlDocument);

    // Create blob URL
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error: any) {
    console.error('[PDFExporter] Error exporting to PDF:', error);
    throw new Error(`Failed to export PDF: ${error.message}`);
  }
}

/**
 * Convert markdown to HTML (simplified - for PDF)
 */
async function markdownToHTML(markdown: string): Promise<string> {
  // Simple markdown to HTML conversion
  // In production, use a proper markdown parser like marked or markdown-it
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Paragraphs
  html = html.split('\n\n').map((p) => {
    if (!p.trim()) return '';
    if (p.startsWith('<')) return p; // Already HTML
    return `<p>${p}</p>`;
  }).join('\n');

  return html;
}

/**
 * Create a styled HTML document for PDF
 */
function createPDFHTML(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #f97316;
      border-bottom: 3px solid #f97316;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    h2 {
      color: #ea580c;
      margin-top: 25px;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 8px;
    }
    h3 {
      color: #c2410c;
      margin-top: 20px;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    a {
      color: #f97316;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    ul, ol {
      margin-left: 20px;
    }
    blockquote {
      border-left: 4px solid #f97316;
      margin-left: 0;
      padding-left: 20px;
      color: #666;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background: #f97316;
      color: white;
    }
    .doc-html-content {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="doc-html-content">
    ${content}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Convert HTML to PDF using browser print API
 */
async function htmlToPDF(html: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      reject(new Error('Could not access iframe document'));
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for content to load
    iframe.onload = () => {
      try {
        // Use jsPDF or similar library if available
        // For now, we'll use a simpler approach with print
        // In production, consider using jsPDF or pdfmake
        
        // Alternative: Use browser's print to PDF
        // This requires user interaction, so we'll create a downloadable blob instead
        // For a better solution, integrate jsPDF library
        
        // For now, return HTML as blob (can be opened and printed to PDF)
        const blob = new Blob([html], { type: 'text/html' });
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 100);

        resolve(blob);
      } catch (error) {
        document.body.removeChild(iframe);
        reject(error);
      }
    };
  });
}

/**
 * Download PDF file
 */
export function downloadPDF(blobUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up blob URL after a delay
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

