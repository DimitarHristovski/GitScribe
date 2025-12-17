/**
 * Cursor-Style Documentation Generator
 * Generates inline code documentation similar to Cursor AI
 */

import { callLangChain } from './langchain-service';
import { retrieveContext, getSearchResults } from '../rag/index';
import { SimpleRepo } from './github-service';
import { fetchGitHubFile, listAllFiles } from './github-service';

export interface CursorDocOptions {
  includeInlineDocs?: boolean;
  includeFunctionDocs?: boolean;
  includeClassDocs?: boolean;
  includeExamples?: boolean;
  includeTypes?: boolean;
  language?: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust';
}

/**
 * Generate Cursor-style documentation for a repository
 */
export async function generateCursorStyleDocs(
  repo: SimpleRepo,
  options: CursorDocOptions = {}
): Promise<string> {
  const {
    includeInlineDocs = true,
    includeFunctionDocs = true,
    includeClassDocs = true,
    includeExamples = true,
    includeTypes = true,
    language = 'typescript',
  } = options;

  console.log(`[CursorDocs] Generating Cursor-style docs for ${repo.fullName}`);

  // Get code files
  const files = await listAllFiles(
    repo.owner,
    repo.name,
    '',
    repo.defaultBranch,
    undefined,
    3
  );

  // Filter to relevant code files
  const codeExtensions = getCodeExtensions(language);
  const codeFiles = files.filter(file => 
    codeExtensions.some(ext => file.toLowerCase().endsWith(ext))
  ).slice(0, 20); // Limit to 20 files for performance

  let documentation = `# ${repo.name} - Code Documentation\n\n`;
  documentation += `*Generated in Cursor-style format*\n\n`;
  documentation += `---\n\n`;

  // Process each file
  for (const filePath of codeFiles) {
    try {
      const content = await fetchGitHubFile(
        repo.owner,
        repo.name,
        filePath,
        repo.defaultBranch
      );

      if (content) {
        const fileDocs = await generateFileDocumentation(
          filePath,
          content,
          repo,
          {
            includeInlineDocs,
            includeFunctionDocs,
            includeClassDocs,
            includeExamples,
            includeTypes,
            language,
          }
        );
        
        if (fileDocs) {
          documentation += fileDocs + '\n\n---\n\n';
        }
      }
    } catch (error) {
      console.warn(`[CursorDocs] Failed to process ${filePath}:`, error);
    }
  }

  return documentation;
}

/**
 * Generate documentation for a single file
 */
async function generateFileDocumentation(
  filePath: string,
  content: string,
  repo: SimpleRepo,
  options: Required<CursorDocOptions>
): Promise<string> {
  // Use RAG to get relevant context
  const context = await retrieveContext(
    `Document the code in ${filePath}`,
    repo.fullName,
    3
  ).catch(() => '');

  const language = detectLanguage(filePath, content);
  
  const prompt = `You are an expert code documentation generator (like Cursor AI). Generate comprehensive, detailed, inline-style documentation for this code file.

File: ${filePath}
Language: ${language}

${context ? `Relevant Context:\n${context}\n\n` : ''}

Code:
\`\`\`${language}
${content} // Full file content for comprehensive documentation
\`\`\`

Generate EXTENSIVE, DETAILED documentation in the following style:

1. **File-level documentation** (comprehensive):
   - Detailed overview of what this file does and its purpose
   - Explanation of the file's role in the codebase
   - Key concepts and patterns used
   - Dependencies and imports explanation
   - Architecture and design decisions
   - Usage context and when to use this file

2. **For each exported function/class/interface/module:**
   ${options.includeFunctionDocs ? `
   - **Comprehensive JSDoc/TSDoc documentation** including:
     * Detailed description of what the function/class does
     * Purpose and use cases
     * Design rationale and implementation details
     * Performance considerations (if relevant)
     * Thread safety or concurrency notes (if relevant)
     * Error handling approach
   ` : ''}
   ${options.includeTypes ? `
   - **Complete type signatures** with:
     * Full parameter types and descriptions
     * Return type with detailed explanation
     * Generic type parameters (if any)
     * Type constraints and requirements
     * Optional vs required parameters
   ` : ''}
   ${options.includeExamples ? `
   - **Multiple practical usage examples**:
     * Basic usage example
     * Advanced usage with edge cases
     * Real-world scenarios
     * Integration examples
     * Error handling examples
   ` : ''}
   ${options.includeInlineDocs ? `
   - **Detailed inline comments**:
     * Explain complex logic step-by-step
     * Algorithm explanations
     * Business logic rationale
     * Performance optimizations
     * Edge cases and special handling
   ` : ''}

3. **Additional documentation sections**:
   - Constants and configuration values explanation
   - Type definitions and interfaces with detailed descriptions
   - Utility functions and helpers
   - Internal functions (even if not exported)
   - Error types and exception handling
   - Performance notes and optimizations
   - Security considerations (if applicable)
   - Testing notes and testability

Format requirements:
- Use proper JSDoc/TSDoc format for ${language === 'typescript' || language === 'javascript' ? 'TypeScript/JavaScript' : language}
- Include ALL standard tags: @param, @returns, @throws, @example, @see, @since, @deprecated (if applicable)
- Add @remarks for important notes
- Include @see references to related functions/classes
- Provide multiple @example tags for different use cases
- Add detailed parameter descriptions explaining not just the type, but the purpose and constraints
- Include return value descriptions explaining what is returned and when
- Document all edge cases and error conditions
- Explain the "why" behind implementation choices, not just the "what"
- Make it comprehensive enough that a new developer can understand the entire file without reading the code

Generate the COMPLETE, DETAILED documented code with extensive comments and explanations. Be thorough and comprehensive - aim for documentation quality similar to professional API documentation.`;

  try {
    const systemPrompt = `You are an expert at writing comprehensive, detailed code documentation in the style of Cursor AI and professional API documentation. You generate:

- EXTENSIVE, DETAILED explanations (not brief summaries)
- Complete type information with full parameter and return descriptions
- Multiple practical examples covering different use cases
- Detailed inline comments explaining complex logic, algorithms, and design decisions
- Comprehensive JSDoc/TSDoc formatted comments with all standard tags
- Developer-friendly language that explains both "what" and "why"
- Architecture and design rationale explanations
- Performance considerations and optimization notes
- Error handling and edge case documentation
- Integration examples and real-world usage scenarios
- Complete documentation for all functions, classes, interfaces, types, and constants

Your documentation should be:
- As detailed as professional API documentation (like MDN, TypeScript Handbook, or major open-source projects)
- Comprehensive enough that developers can understand the codebase without reading the implementation
- Include context about how pieces fit together
- Explain design decisions and trade-offs
- Provide multiple examples for different scenarios
- Document internal functions and helpers, not just public APIs
- Include notes about performance, security, and best practices

Always include the actual code with extensive documentation comments added. Be thorough - aim for documentation that is as comprehensive as the code itself.`;

    const documentedCode = await callLangChain(
      prompt,
      systemPrompt,
      'gpt-4o-mini', // Use gpt-4o-mini for everything except main documentation writing
      0.2, // Lower temperature for more consistent, detailed output
      repo.fullName,
      true // Use RAG
    );

    return `## ${filePath}\n\n\`\`\`${language}\n${documentedCode}\n\`\`\``;
  } catch (error) {
    console.error(`[CursorDocs] Failed to document ${filePath}:`, error);
    return `## ${filePath}\n\n*Documentation generation failed*\n`;
  }
}

/**
 * Detect programming language from file path and content
 */
function detectLanguage(filePath: string, content: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'c': 'c',
    'h': 'c',
    'hpp': 'cpp',
  };

  return languageMap[ext] || 'typescript';
}

/**
 * Get code file extensions for a language
 */
function getCodeExtensions(language: string): string[] {
  const extensions: Record<string, string[]> = {
    typescript: ['.ts', '.tsx'],
    javascript: ['.js', '.jsx'],
    python: ['.py'],
    java: ['.java'],
    go: ['.go'],
    rust: ['.rs'],
    cpp: ['.cpp', '.hpp', '.h', '.c'],
  };

  return extensions[language] || ['.ts', '.tsx', '.js', '.jsx'];
}

/**
 * Generate inline documentation for a specific function/class
 */
export async function generateInlineDoc(
  code: string,
  repoName: string,
  language: string = 'typescript'
): Promise<string> {
  const context = await retrieveContext(
    `Document this code: ${code.substring(0, 500)}`,
    repoName,
    3
  ).catch(() => '');

  const prompt = `Generate COMPREHENSIVE, DETAILED inline documentation (JSDoc/TSDoc style) for this code:

\`\`\`${language}
${code}
\`\`\`

${context ? `Context:\n${context}\n` : ''}

Generate EXTENSIVE documentation including:

1. **Comprehensive JSDoc/TSDoc comment block** above the code with:
   - Detailed description explaining what the function/class does
   - Purpose and use cases
   - Design rationale and implementation approach
   - Performance considerations (if relevant)
   - Thread safety or concurrency notes (if relevant)
   - Error handling strategy

2. **Complete @param tags** for each parameter:
   - Full type information
   - Detailed description of purpose and constraints
   - Valid value ranges or formats
   - Optional vs required
   - Default values explanation
   - Example values

3. **Detailed @returns tag**:
   - Complete return type
   - What is returned and in what format
   - When different return values occur
   - Return value structure and properties
   - Edge cases in return values

4. **Multiple @example tags** with:
   - Basic usage example
   - Advanced usage example
   - Edge case examples
   - Error handling examples
   - Real-world integration examples

5. **Additional tags**:
   - @throws for error conditions
   - @see for related functions/classes
   - @since for version information
   - @deprecated if applicable
   - @remarks for important notes

6. **Detailed inline comments**:
   - Step-by-step explanation of complex logic
   - Algorithm explanations
   - Business logic rationale
   - Performance optimizations
   - Edge cases and special handling
   - Why certain approaches were chosen

7. **Type documentation**:
   - Complete type signatures
   - Generic type parameters with constraints
   - Interface/type definitions with detailed descriptions

Make the documentation as comprehensive and detailed as professional API documentation. Be thorough - explain not just what the code does, but why it does it that way, how to use it effectively, and what to watch out for.

Return only the documented code with extensive comments added.`;

  try {
    const documented = await callLangChain(
      prompt,
      `You are an expert at writing comprehensive, detailed inline code documentation. Generate extensive JSDoc/TSDoc comments that are:
- Thorough and detailed (not brief)
- Include complete type information with full descriptions
- Provide multiple examples covering different scenarios
- Explain design decisions and rationale
- Document edge cases and error conditions
- Include performance and security considerations
- Make it as comprehensive as professional API documentation

Be thorough and detailed - aim for documentation quality similar to MDN, TypeScript Handbook, or major open-source projects.`,
      'gpt-4o-mini', // Use gpt-4o-mini for everything except main documentation writing
      0.2, // Lower temperature for more consistent, detailed output
      repoName,
      true
    );

    return documented;
  } catch (error) {
    console.error('[CursorDocs] Failed to generate inline doc:', error);
    return code; // Return original code if documentation fails
  }
}

