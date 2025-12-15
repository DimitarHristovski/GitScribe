/**
 * Format-Specific Documentation Generators
 * Generates documentation in different output formats based on user selection
 */

import { DocOutputFormat, DocSectionType, DocSection } from '../types/core';
import { generateDocumentationFromGitHub, DocumentationOptions } from './documentation-writer';
import { callLangChain } from './langchain-service';
import { listGitHubContents, fetchGitHubFile, parseGitHubUrl, getGitHubToken } from './github-service';

/**
 * Generate documentation in a specific format
 */
export async function generateFormatDocumentation(
  githubUrl: string,
  format: DocOutputFormat,
  sectionType: DocSectionType,
  baseMarkdown: string,
  options: DocumentationOptions = {},
  repoAnalysis?: any // Optional repo analysis data
): Promise<string> {
  switch (format) {
    case 'markdown':
      return generateMarkdownDocumentation(sectionType, baseMarkdown);
    
    case 'markdown_mermaid':
      return await generateMarkdownMermaidDocumentation(sectionType, baseMarkdown, githubUrl, repoAnalysis);
    
    case 'mdx':
      return await generateMDXDocumentation(sectionType, baseMarkdown, githubUrl, repoAnalysis);
    
    case 'openapi':
      return await generateOpenAPIDocumentation(sectionType, baseMarkdown, githubUrl, repoAnalysis);
    
    case 'html':
      return generateHTMLDocumentation(sectionType, baseMarkdown);
    
    default:
      return baseMarkdown;
  }
}

/**
 * Generate plain Markdown documentation
 */
function generateMarkdownDocumentation(sectionType: DocSectionType, baseMarkdown: string): string {
  // For markdown, return the base markdown with section-specific headers
  const sectionHeader = getSectionHeader(sectionType);
  return `${sectionHeader}\n\n${baseMarkdown}`;
}

/**
 * Generate Markdown with Mermaid diagrams
 */
async function generateMarkdownMermaidDocumentation(
  sectionType: DocSectionType,
  baseMarkdown: string,
  githubUrl: string,
  repoAnalysis?: any
): Promise<string> {
  const sectionHeader = getSectionHeader(sectionType);
  
  // Generate meaningful Mermaid diagrams using AI based on repository structure
  let mermaidDiagram = '';
  
  try {
    const repoInfo = parseGitHubUrl(githubUrl);
    if (repoInfo) {
      const { owner, repo, branch = 'main' } = repoInfo;
      const token = getGitHubToken();
      
      // Get repository structure for better diagram generation
      let structureInfo = '';
      try {
        const contents = await listGitHubContents(owner, repo, '', branch, token || undefined);
        const dirs = contents.filter(item => item.type === 'dir').map(item => item.name).slice(0, 10);
        structureInfo = `Repository structure: ${dirs.join(', ')}`;
      } catch (e) {
        // Continue without structure info
      }
      
      const analysisContext = repoAnalysis 
        ? `Tech Stack: ${repoAnalysis.techStack?.join(', ') || 'Unknown'}\nFrameworks: ${repoAnalysis.structure?.frameworks?.join(', ') || 'Unknown'}\nLanguages: ${repoAnalysis.structure?.languages?.join(', ') || 'Unknown'}`
        : '';
      
      const prompt = `Based on this repository documentation and structure, generate a detailed Mermaid diagram for a ${sectionType} section.

${analysisContext}
${structureInfo}

Repository Documentation:
${baseMarkdown.substring(0, 2000)}

Generate a Mermaid diagram that accurately represents:
${sectionType === 'ARCHITECTURE' ? 'The system architecture, component relationships, and data flow' :
  sectionType === 'API' ? 'API endpoints, request/response flow, and data models' :
  sectionType === 'COMPONENTS' ? 'Component hierarchy, props flow, and component relationships' :
  'The structure and relationships'}

Return ONLY the Mermaid diagram code (without markdown code fences). Make it detailed and accurate based on the repository structure.`;

      const diagramCode = await callLangChain(
        prompt,
        'You are an expert at creating Mermaid diagrams for software documentation. Generate accurate, detailed diagrams based on repository structure.',
        'gpt-4o-mini',
        0.4
      );
      
      // Clean up the response (remove markdown code fences if present)
      const cleanDiagram = diagramCode
        .replace(/```mermaid\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      mermaidDiagram = `\n\`\`\`mermaid
${cleanDiagram}
\`\`\`\n\n`;
    }
  } catch (error) {
    console.warn('[FormatGenerator] Failed to generate Mermaid diagram, using fallback:', error);
    // Fallback to simple diagram
    mermaidDiagram = getFallbackMermaidDiagram(sectionType);
  }
  
  return `${sectionHeader}\n\n${mermaidDiagram}${baseMarkdown}`;
}

function getFallbackMermaidDiagram(sectionType: DocSectionType): string {
  switch (sectionType) {
    case 'ARCHITECTURE':
      return `\n\`\`\`mermaid
graph TB
    A[Application] --> B[Components]
    A --> C[Services]
    A --> D[Utilities]
    B --> E[UI Components]
    C --> F[API Layer]
    D --> G[Helpers]
\`\`\`\n\n`;
    case 'API':
      return `\n\`\`\`mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: Request
    API->>Database: Query
    Database-->>API: Response
    API-->>Client: Result
\`\`\`\n\n`;
    case 'COMPONENTS':
      return `\n\`\`\`mermaid
graph LR
    A[Component] --> B[Props]
    A --> C[State]
    A --> D[Methods]
    B --> E[Inputs]
    C --> F[Data]
\`\`\`\n\n`;
    default:
      return '';
  }
}

/**
 * Generate MDX documentation (Markdown + JSX)
 */
async function generateMDXDocumentation(
  sectionType: DocSectionType,
  baseMarkdown: string,
  githubUrl: string,
  repoAnalysis?: any
): Promise<string> {
  const sectionHeader = getSectionHeader(sectionType);
  
  // Add MDX-specific imports and components
  const mdxHeader = `import { CodeBlock, Callout, Tabs, TabItem, Card, Grid } from '@mdx/components';
import { Info, Warning, CheckCircle, AlertCircle } from 'lucide-react';

export const meta = {
  title: '${getSectionTitle(sectionType)}',
  description: '${sectionType} documentation',
};

`;

  // Convert markdown to MDX with enhanced components
  let mdxContent = baseMarkdown;
  
  // Convert code blocks to MDX CodeBlock components
  mdxContent = mdxContent.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match, lang, code) => {
      return `<CodeBlock language="${lang || 'text'}" showLineNumbers>
${code.trim()}
</CodeBlock>`;
    }
  );
  
  // Convert blockquotes to Callout components
  mdxContent = mdxContent.replace(
    /^> (.+)$/gm,
    (match, content) => {
      return `<Callout type="info">
${content.trim()}
</Callout>`;
    }
  );
  
  // Add interactive tabs for different sections
  if (sectionType === 'API' || sectionType === 'COMPONENTS') {
    mdxContent = `\n<Tabs>
  <TabItem label="Overview" value="overview">
${mdxContent.split('\n').slice(0, 20).join('\n')}
  </TabItem>
  <TabItem label="Examples" value="examples">
    <Card>
      <h3>Usage Examples</h3>
      <p>See the code examples below for practical usage.</p>
    </Card>
  </TabItem>
  <TabItem label="Reference" value="reference">
${mdxContent}
  </TabItem>
</Tabs>\n\n`;
  }
  
  // Wrap in Grid layout for better presentation
  if (sectionType === 'COMPONENTS') {
    mdxContent = `<Grid cols={2}>
  <Card>
    <h3>Component Overview</h3>
    ${mdxContent.substring(0, 500)}
  </Card>
  <Card>
    <h3>Props & Usage</h3>
    ${mdxContent.substring(500)}
  </Card>
</Grid>`;
  }
  
  return `${mdxHeader}${sectionHeader}\n\n${mdxContent}`;
}

/**
 * Generate OpenAPI specification
 */
async function generateOpenAPIDocumentation(
  sectionType: DocSectionType,
  baseMarkdown: string,
  githubUrl: string,
  repoAnalysis?: any
): Promise<string> {
  if (sectionType !== 'API') {
    // OpenAPI is only relevant for API sections
    return `# ${getSectionTitle(sectionType)}\n\nThis section does not contain API documentation.`;
  }
  
  const repoInfo = parseGitHubUrl(githubUrl);
  if (!repoInfo) {
    return `# API Reference\n\nInvalid repository URL.`;
  }
  
  const { owner, repo, branch = 'main' } = repoInfo;
  const token = getGitHubToken();
  
  // Try to find API route files
  let apiFiles: string[] = [];
  try {
    const contents = await listGitHubContents(owner, repo, '', branch, token || undefined);
    // Look for common API file patterns
    const apiPatterns = ['api', 'routes', 'endpoints', 'controllers', 'handlers'];
    for (const item of contents) {
      if (item.type === 'dir' && apiPatterns.some(pattern => item.name.toLowerCase().includes(pattern))) {
        try {
          const apiContents = await listGitHubContents(owner, repo, item.path, branch, token || undefined);
          apiFiles.push(...apiContents.filter(f => f.type === 'file' && (f.name.endsWith('.ts') || f.name.endsWith('.js'))).map(f => f.path));
        } catch (e) {
          // Skip this directory
        }
      }
    }
  } catch (e) {
    // Continue without API files
  }
  
  // Use AI to extract and structure API endpoints
  try {
    const apiFilesContext = apiFiles.length > 0 
      ? `\n\nFound potential API files: ${apiFiles.slice(0, 5).join(', ')}`
      : '';
    
    const analysisContext = repoAnalysis
      ? `\nTech Stack: ${repoAnalysis.techStack?.join(', ') || 'Unknown'}\nFrameworks: ${repoAnalysis.structure?.frameworks?.join(', ') || 'Unknown'}`
      : '';
    
    const prompt = `Analyze this repository documentation and generate a complete OpenAPI 3.0 specification.

Repository: ${owner}/${repo}
${analysisContext}
${apiFilesContext}

Documentation:
${baseMarkdown.substring(0, 3000)}

Generate a complete OpenAPI 3.0 YAML specification with:
- Info section with proper title, version, and description
- Servers array (infer from documentation or use common patterns)
- Paths section with actual endpoints extracted from the documentation
- Request/response schemas
- Parameters, request bodies, and responses
- Proper HTTP methods (GET, POST, PUT, DELETE, etc.)

Return ONLY valid OpenAPI 3.0 YAML. Be specific and detailed. Include at least 3-5 endpoints if possible.`;

    const yaml = await callLangChain(
      prompt,
      'You are an expert at creating OpenAPI specifications. Generate complete, valid OpenAPI 3.0 YAML with detailed endpoints, schemas, and examples.',
      'gpt-4o-mini',
      0.5
    );
    
    // Clean up the response
    let cleanYaml = yaml
      .replace(/```yaml\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Ensure it starts with openapi: 3.0.0
    if (!cleanYaml.startsWith('openapi:')) {
      cleanYaml = `openapi: 3.0.0\n${cleanYaml}`;
    }
    
    return cleanYaml;
  } catch (error) {
    console.warn('[FormatGenerator] Failed to generate OpenAPI spec:', error);
    // Fallback to structured OpenAPI
    return `openapi: 3.0.0
info:
  title: ${repo} API
  version: 1.0.0
  description: Auto-generated API documentation for ${owner}/${repo}
servers:
  - url: https://api.example.com
    description: Production server
  - url: https://api-staging.example.com
    description: Staging server
paths:
  /api/v1/health:
    get:
      summary: Health check endpoint
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: "ok"
components:
  schemas:
    Error:
      type: object
      properties:
        message:
          type: string
        code:
          type: integer
`;
  }
}

/**
 * Generate HTML documentation
 * Returns only the body content with scoped styles for embedding in the app
 */
function generateHTMLDocumentation(sectionType: DocSectionType, baseMarkdown: string): string {
  const sectionHeader = getSectionHeader(sectionType);
  
  // Generate scoped HTML content (no <html>, <head>, <body> tags)
  // Styles are scoped to .doc-html-content to prevent affecting the parent page
  const html = `
<style>
.doc-html-content * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
}
.doc-html-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; 
    line-height: 1.8; 
    color: #1a1a1a;
    background: white;
    border-radius: 16px;
    overflow: hidden;
}
.doc-html-content .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    text-align: center;
    margin: -40px -40px 40px -40px;
}
.doc-html-content .header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
    font-weight: 700;
}
.doc-html-content .header p {
    opacity: 0.9;
    font-size: 1.1em;
}
.doc-html-content .content {
    padding: 0;
}
.doc-html-content h1 { 
    color: #667eea; 
    font-size: 2em;
    margin: 30px 0 20px 0;
    border-bottom: 3px solid #667eea;
    padding-bottom: 10px;
}
.doc-html-content h2 { 
    color: #764ba2; 
    font-size: 1.6em;
    margin: 25px 0 15px 0;
}
.doc-html-content h3 { 
    color: #555; 
    font-size: 1.3em;
    margin: 20px 0 10px 0;
}
.doc-html-content p {
    margin: 15px 0;
    color: #333;
}
.doc-html-content code { 
    background: #f4f4f4; 
    padding: 3px 8px; 
    border-radius: 4px; 
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: #e83e8c;
}
.doc-html-content pre { 
    background: #1e1e1e; 
    color: #d4d4d4;
    padding: 20px; 
    border-radius: 8px; 
    overflow-x: auto;
    margin: 20px 0;
    border-left: 4px solid #667eea;
}
.doc-html-content pre code {
    background: transparent;
    color: #d4d4d4;
    padding: 0;
}
.doc-html-content blockquote { 
    border-left: 4px solid #667eea; 
    padding-left: 20px; 
    margin-left: 0;
    margin: 20px 0;
    padding: 15px 20px;
    background: #f8f9fa;
    border-radius: 4px;
    font-style: italic;
}
.doc-html-content ul, 
.doc-html-content ol {
    margin: 15px 0;
    padding-left: 30px;
}
.doc-html-content li {
    margin: 8px 0;
}
.doc-html-content a {
    color: #667eea;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s;
}
.doc-html-content a:hover {
    border-bottom-color: #667eea;
}
.doc-html-content .footer {
    background: #f8f9fa;
    padding: 20px 40px;
    text-align: center;
    color: #666;
    font-size: 0.9em;
    margin: 40px -40px -40px -40px;
}
.doc-html-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}
.doc-html-content th, 
.doc-html-content td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}
.doc-html-content th {
    background: #667eea;
    color: white;
    font-weight: 600;
}
.doc-html-content tr:hover {
    background: #f8f9fa;
}
</style>
<div class="doc-html-content">
    <div class="header">
        <h1>${getSectionTitle(sectionType)}</h1>
        <p>Comprehensive Documentation</p>
    </div>
    <div class="content">
        ${markdownToHTML(`${sectionHeader}\n\n${baseMarkdown}`)}
    </div>
    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} • Auto-generated documentation</p>
    </div>
</div>`;
  
  return html;
}

/**
 * Convert markdown to HTML (enhanced)
 */
function markdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Headers (process in order from most specific to least)
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Code blocks (must come before inline code)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
  
  // Lists
  html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.+)$/gim, '<li>$2</li>');
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  
  // Paragraphs (split by double newlines)
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    // Don't wrap if it's already a block element
    if (p.startsWith('<') && (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<blockquote'))) {
      return p;
    }
    return `<p>${p}</p>`;
  }).join('\n\n');
  
  // Wrap consecutive list items in ul/ol
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  
  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Get section header based on type
 */
function getSectionHeader(sectionType: DocSectionType): string {
  return `# ${getSectionTitle(sectionType)}`;
}

/**
 * Get section title
 */
function getSectionTitle(sectionType: DocSectionType): string {
  switch (sectionType) {
    case 'README':
      return 'README';
    case 'ARCHITECTURE':
      return 'Architecture';
    case 'API':
      return 'API Reference';
    case 'COMPONENTS':
      return 'Components';
    case 'TESTING_CI':
      return 'Testing & CI/CD';
    case 'CHANGELOG':
      return 'Changelog';
    default:
      return 'Documentation';
  }
}

