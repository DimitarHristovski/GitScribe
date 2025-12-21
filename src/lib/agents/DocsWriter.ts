/**
 * DocsWriter Agent
 * Generates comprehensive documentation for each repository in multiple formats
 */

import { AgentState, AgentStep } from './types';
import { generateDocumentationFromGitHub } from '../documentation-writer';
import { generateFormatDocumentation } from '../format-generators';
import { DocOutputFormat, DocSectionType, GeneratedDocs, DocSection, DocLanguage } from '../../types/core';
import { callLangChain } from '../langchain-service';
import { DocumentationPlan } from './types';
import { retrieveContext } from '../../rag/index';
import { generateDirectoryTree, parseGitHubUrl, getGitHubToken } from '../github-service';

export async function docsWriterAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log('[DocsWriter] Starting documentation generation...');
  
  const updates: Partial<AgentState> = {
    currentStep: AgentStep.WRITING,
    generatedDocs: new Map(),
  };

  if (!state.documentationPlans || state.documentationPlans.size === 0) {
    updates.errors = new Map([['writing', 'No documentation plans available']]);
    return updates;
  }

  // Get selected formats, section types, and language, with defaults
  const selectedFormats: DocOutputFormat[] = state.selectedOutputFormats || ['markdown'];
  const selectedSectionTypes: DocSectionType[] = state.selectedSectionTypes || ['README'];
  const selectedLanguage: DocLanguage = state.selectedLanguage || 'en';

  const docs = new Map<string, string>();
  const generatedDocsMap = new Map<string, GeneratedDocs>();
  const total = state.documentationPlans.size;
  let completed = 0;

  // Get selected model from state, default to gpt-4o-mini
  // For documentation writing, always respect the user's model choice
  const selectedModel = state.selectedModel || 'gpt-4o-mini';

  // Process all repositories in parallel
  const writingPromises = Array.from(state.documentationPlans.entries()).map(async ([repoFullName, plan]) => {
    // Always use the user's selected model for documentation writing
    // User can choose from: gpt-4o-mini, gpt-4o, gpt-4-turbo, gpt-3.5-turbo, etc.
    const modelToUse = selectedModel;
    let baseMarkdown = '';
    try {
      console.log(`[DocsWriter] Starting generation for ${repoFullName}`);
      console.log(`[DocsWriter] Formats: ${selectedFormats.join(', ')}, Sections: ${selectedSectionTypes.join(', ')}`);

      // Generate base markdown documentation (for reference)
      const githubUrl = plan.repo.htmlUrl || `${plan.repo.owner}/${plan.repo.name}`;
      
      try {
        baseMarkdown = await generateDocumentationFromGitHub(githubUrl, {
          format: 'markdown',
          includeCode: true,
          includeProps: true,
          includeExamples: true,
          depth: plan.style === 'comprehensive' ? 'comprehensive' : 
                 plan.style === 'technical' ? 'detailed' : 'basic',
        });
        console.log(`[DocsWriter] Base markdown generated for ${repoFullName}, length: ${baseMarkdown.length}`);
      } catch (baseError: any) {
        console.error(`[DocsWriter] Failed to generate base markdown for ${repoFullName}:`, baseError);
        baseMarkdown = `# ${plan.repo.name}\n\n${plan.repo.description || 'Documentation for ' + repoFullName}\n\n*Note: Base documentation generation failed. Please check repository access.*`;
      }

      // Generate documentation sections in different formats
      const sections: DocSection[] = [];

      // Get repo analysis for format-specific generation
      const repoAnalysis = state.repoAnalyses?.get(repoFullName);

      for (const sectionType of selectedSectionTypes) {
        // Generate section-specific content using AI
        // Use the user's selected model (no auto-upgrade)
        console.log(`[DocsWriter] Generating ${sectionType} content for ${repoFullName}...`);
        const sectionSpecificContent = await generateSectionSpecificContent(
          sectionType,
          githubUrl,
          baseMarkdown,
          repoAnalysis,
          plan,
          selectedLanguage,
          modelToUse // Always use the user's selected model
        );
        
        const sectionWordCount = sectionSpecificContent.split(/\s+/).length;
        const sectionCharCount = sectionSpecificContent.length;
        console.log(`[DocsWriter] Generated ${sectionType} content: ${sectionWordCount} words, ${sectionCharCount} characters`);
        
        if (sectionWordCount < 1000) {
          console.error(`[DocsWriter] WARNING: ${sectionType} content is very short (${sectionWordCount} words). Expected 0-6000+ words.`);
        }

        for (const format of selectedFormats) {
          try {
            const sectionContent = await generateFormatDocumentation(
              githubUrl,
              format,
              sectionType,
              sectionSpecificContent, // Use section-specific content instead of baseMarkdown
              {
                includeCode: true,
                includeProps: true,
                includeExamples: true,
                depth: plan.style === 'comprehensive' ? 'comprehensive' : 'detailed',
              },
              repoAnalysis
            );

            const section: DocSection = {
              id: `${sectionType}_${format}_${Date.now()}`,
              type: sectionType,
              format: format,
              language: selectedLanguage,
              title: `${getSectionTitle(sectionType)} (${format})`,
            };

            // Set format-specific content
            if (format === 'openapi') {
              section.openapiYaml = sectionContent;
            } else if (format === 'html') {
              section.html = sectionContent;
            } else {
              section.markdown = sectionContent;
            }

            sections.push(section);
          } catch (error: any) {
            console.error(`[DocsWriter] Error generating ${format} for ${sectionType}:`, error);
          }
        }
      }

      // Create GeneratedDocs object
      const generatedDocs: GeneratedDocs = {
        repoName: plan.repo.name,
        owner: plan.repo.owner,
        sections: sections,
        createdAt: new Date().toISOString(),
      };

      // For backward compatibility, also store as markdown string (first markdown section)
      let markdownContent = '';
      const firstMarkdownSection = sections.find(s => s.markdown);
      if (firstMarkdownSection?.markdown) {
        markdownContent = firstMarkdownSection.markdown;
      } else if (sections.length > 0) {
        // Fallback: use any available content
        const firstSection = sections[0];
        markdownContent = firstSection.markdown || firstSection.html || firstSection.openapiYaml || '';
      } else {
        // If no sections were generated, use baseMarkdown as fallback
        console.warn(`[DocsWriter] No sections generated for ${repoFullName}, using baseMarkdown as fallback`);
        if (baseMarkdown && baseMarkdown.trim().length > 0) {
          // Create a fallback section with baseMarkdown
          const fallbackSection: DocSection = {
            id: `fallback_${Date.now()}`,
            type: selectedSectionTypes[0] || 'README',
            format: selectedFormats[0] || 'markdown',
            language: selectedLanguage,
            title: 'Documentation',
            markdown: baseMarkdown,
          };
          sections.push(fallbackSection);
          generatedDocs.sections = sections;
          markdownContent = baseMarkdown;
          console.log(`[DocsWriter] Using baseMarkdown fallback for ${repoFullName}`);
        } else {
          console.error(`[DocsWriter] No documentation generated for ${repoFullName} - baseMarkdown is also empty`);
          // Still create an empty entry so the workflow knows we tried
          markdownContent = `# ${plan.repo.name}\n\n*Documentation generation failed. Please check the console for errors.*`;
        }
      }

      completed++;
      updates.progress = {
        current: completed,
        total,
        currentRepo: repoFullName,
        currentAgent: 'DocsWriter',
      };
      console.log(`[DocsWriter] Completed generation for ${repoFullName} (${completed}/${total})`);

      return { 
        repoFullName, 
        generatedDocs, 
        markdown: markdownContent, 
        error: null 
      };
    } catch (error: any) {
      completed++;
      console.error(`[DocsWriter] Error generating docs for ${repoFullName}:`, error);
      updates.progress = {
        current: completed,
        total,
        currentRepo: repoFullName,
        currentAgent: 'DocsWriter',
      };
      return { 
        repoFullName, 
        generatedDocs: null, 
        markdown: '', 
        error: { key: `writing_${repoFullName}`, message: error.message || 'Documentation generation failed' }
      };
    }
  });

  // Wait for all documentation generation to complete
  const results = await Promise.all(writingPromises);

  // Process results
  for (const result of results) {
    if (result.generatedDocs) {
      generatedDocsMap.set(result.repoFullName, result.generatedDocs);
      if (result.markdown) {
        docs.set(result.repoFullName, result.markdown);
      }
    } else if (result.error) {
      if (!updates.errors) updates.errors = new Map();
      updates.errors.set(result.error.key, result.error.message);
    }
  }

  updates.generatedDocs = docs;
  updates.generatedDocsFull = generatedDocsMap;
  
  updates.completedSteps = new Set([...(state.completedSteps || []), AgentStep.WRITING]);
  updates.progress = {
    current: total,
    total,
    currentAgent: 'DocsWriter',
  };

  console.log(`[DocsWriter] Completed generation for ${docs.size} repositories`);
  console.log(`[DocsWriter] Generated docs map size: ${docs.size}, Full docs map size: ${generatedDocsMap.size}`);
  
  if (docs.size === 0 && generatedDocsMap.size === 0) {
    console.error('[DocsWriter] WARNING: No documentation was generated for any repository!');
    console.error('[DocsWriter] State check:', {
      hasDocumentationPlans: !!state.documentationPlans && state.documentationPlans.size > 0,
      plansCount: state.documentationPlans?.size || 0,
      selectedFormats: selectedFormats,
      selectedSectionTypes: selectedSectionTypes,
      errors: Array.from(updates.errors?.entries() || []),
    });
  }
  
  return updates;
}

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

/**
 * Generate section-specific content based on section type
 */
async function generateSectionSpecificContent(
  sectionType: DocSectionType,
  githubUrl: string,
  baseMarkdown: string,
  repoAnalysis: any,
  plan: DocumentationPlan,
  language: DocLanguage = 'en',
  modelToUse: string = 'gpt-4o-mini' // User's selected model for documentation writing
): Promise<string> {
  const repoFullName = `${plan.repo.owner}/${plan.repo.name}`;
  
  // Get RAG context for better code understanding
  // Use more chunks for comprehensive documentation (like Cursor AI style)
  // More chunks = more code examples, better context, more detailed documentation
  let ragContext = '';
  try {
    console.log(`[DocsWriter] Retrieving RAG context for ${repoFullName} (${sectionType})...`);
    
    // First, get database context - schemas, migrations, seed data, mock data
    // This is crucial for understanding what the application does
    const databaseQuery = `Database schema, migrations, seed data, mock data, models, entities. What data does this application store and manage? What are the main entities, tables, or data models?`;
    const databaseContext = await retrieveContext(databaseQuery, repoFullName, 8);
    console.log(`[DocsWriter] Database context retrieved: ${databaseContext ? `${databaseContext.length} chars` : 'EMPTY'}`);
    
    // Second, get context about the app's purpose and main functionality
    const purposeQuery = `What does this application do? What is its main purpose, role, and core functionality? Main entry points, app initialization, and primary features.`;
    const purposeContext = await retrieveContext(purposeQuery, repoFullName, 8);
    console.log(`[DocsWriter] Purpose context retrieved: ${purposeContext ? `${purposeContext.length} chars` : 'EMPTY'}`);
    
    // Third, get general code context for the specific section
    const sectionQuery = `Generate ${sectionType} documentation for ${repoFullName}. Code structure, architecture, components, APIs, and implementation details.`;
    const sectionContext = await retrieveContext(sectionQuery, repoFullName, 8);
    console.log(`[DocsWriter] Section context retrieved: ${sectionContext ? `${sectionContext.length} chars` : 'EMPTY'}`);
    
    // Combine all contexts (database context is most important for understanding the app)
    // Note: retrieveContext already includes "Relevant code context:" header, so we don't duplicate it
    ragContext = (databaseContext ? `Database and Data Models:${databaseContext}\n\n` : '') +
                 (purposeContext ? `Application Purpose:${purposeContext}\n\n` : '') +
                 (sectionContext ? `Code Structure:${sectionContext}` : '');
    
    console.log(`[DocsWriter] Combined RAG context: ${ragContext ? `${ragContext.length} chars` : 'EMPTY'}`);
    
    if (!ragContext || ragContext.trim().length < 100) {
      console.error(`[DocsWriter] WARNING: RAG context is empty or too short (${ragContext.length} chars). The repository may not be indexed, or similarity search returned no results.`);
      console.error(`[DocsWriter] This will cause the AI to invent content instead of documenting actual code.`);
    }
  } catch (error) {
    console.error(`[DocsWriter] RAG context retrieval failed for ${repoFullName}:`, error);
    // Fallback to single query if separate queries fail
    try {
      ragContext = await retrieveContext(
        `What does this application do? Database schema, data models, main purpose, functionality, entry points, and code structure for ${sectionType} documentation`,
        repoFullName,
        20
      );
      console.log(`[DocsWriter] Fallback RAG context: ${ragContext ? `${ragContext.length} chars` : 'EMPTY'}`);
    } catch (fallbackError) {
      console.error(`[DocsWriter] Fallback RAG context retrieval also failed:`, fallbackError);
      ragContext = '';
    }
  }
  
  // Generate complete directory tree structure
  let directoryTree = '';
  try {
    const repoInfo = parseGitHubUrl(githubUrl);
    if (repoInfo) {
      const { owner, repo, branch = 'main' } = repoInfo;
      const token = getGitHubToken();
      directoryTree = await generateDirectoryTree(owner, repo, '', branch, token || undefined);
    }
  } catch (error) {
    console.warn(`[DocsWriter] Failed to generate directory tree for ${repoFullName}:`, error);
  }

  // Build context from repo analysis
  const analysisContext = repoAnalysis ? `
Repository Analysis:
- Summary: ${repoAnalysis.summary}
- Key Features: ${repoAnalysis.keyFeatures.join(', ')}
- Tech Stack: ${repoAnalysis.techStack.join(', ')}
- Frameworks: ${repoAnalysis.structure?.frameworks?.join(', ') || 'Unknown'}
- Languages: ${repoAnalysis.structure?.languages?.join(', ') || 'Unknown'}
- Complexity: ${repoAnalysis.complexity}
- Main Files: ${repoAnalysis.structure?.mainFiles?.join(', ') || 'Unknown'}
${directoryTree ? `\nComplete Directory Structure:\n\`\`\`\n${directoryTree}\`\`\`\n` : ''}
` : directoryTree ? `\nComplete Directory Structure:\n\`\`\`\n${directoryTree}\`\`\`\n` : '';

  // Language mapping for prompts
  const languageNames: Record<DocLanguage, string> = {
    en: 'English',
    fr: 'French',
    de: 'German',
  };

  const languageInstruction = language !== 'en' 
    ? `\n\nIMPORTANT: Generate all content in ${languageNames[language]}. All text, descriptions, and explanations must be in ${languageNames[language]}.`
    : '';

  // Create section-specific prompts
  let sectionPrompt = '';
  
  switch (sectionType) {
    case 'README':
      sectionPrompt = `Generate a comprehensive README.md for the repository "${repoFullName}" following the EXACT structure and style of professional open-source project documentation (like the GitScribe DOCUMENTATION.md example - 600-700+ lines, 4500-5000+ words, comprehensive and detailed).
${languageInstruction}

${ragContext ? `\n\n=== CRITICAL: ACTUAL CODE FROM REPOSITORY (YOUR ONLY SOURCE OF TRUTH) ===\n${ragContext}\n=== END OF ACTUAL CODE ===\n\n` : '\n\n⚠️ WARNING: NO RAG CONTEXT AVAILABLE - Repository may not be indexed. You MUST NOT invent content. Only document what you can verify from repository analysis.\n\n'}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 0)}${baseMarkdown.length > 0 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL FIRST STEP: Before generating any content, you MUST:
1. Read the RAG context VERY CAREFULLY - this contains the ACTUAL code from the repository
2. Identify what ACTUALLY exists in the code:
   - Look for actual file paths, function names, class names, component names in the RAG context
   - Find actual API endpoints, routes, handlers in the code
   - Identify actual features by finding their implementation in the code
   - Note the actual tech stack from the code (not assumptions)
3. Create a list of ONLY the features/components/APIs you can VERIFY exist in the RAG context
4. DO NOT proceed until you have a verified list of what actually exists

CRITICAL - YOU MUST FOLLOW THESE RULES STRICTLY:
1. FOR EVERY FEATURE YOU DOCUMENT:
   - You MUST be able to point to specific code in the RAG context that implements it
   - You MUST cite the file path or function name where it exists
   - If you cannot find the code, DO NOT document it as a feature

2. WHEN LISTING FEATURES:
   - Go through the RAG context line by line
   - Extract ONLY features that have actual code implementations
   - For each feature, note which file/function implements it
   - DO NOT list features based on assumptions, names, or examples

3. WHEN DESCRIBING FUNCTIONALITY:
   - Base descriptions ONLY on what the code actually does
   - If the code shows a function that does X, document that it does X
   - DO NOT assume it also does Y unless the code shows Y
   - DO NOT add capabilities that aren't in the code

4. TO REACH WORD COUNT:
   - Expand on REAL features with more detail about how they work (based on code)
   - Add more code examples from the RAG context
   - Explain the implementation details you see in the code
   - Add more subsections explaining existing features in depth
   - DO NOT invent new features to reach word count

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE README content based ONLY on what exists in the RAG context. DO NOT simply reformat or copy the reference documentation above. Instead:
- FIRST: Extract a list of actual features from the RAG context (with file paths/function names)
- THEN: Document ONLY those verified features with details from the code
- Generate fresh, detailed documentation based on the actual code structure and purpose
- Create comprehensive content that accurately describes what the application does and how it works
- Use the reference only to understand documentation structure, not to copy content
- Follow the EXACT structure and style of professional documentation (like GitScribe's DOCUMENTATION.md - comprehensive, detailed, 600-700+ lines, 4500-5000+ words)
- MOST IMPORTANT: The Overview section MUST accurately explain what this application does based on the code context, not generic descriptions

CRITICAL - DOCUMENT ONLY WHAT EXISTS:
- DO NOT invent features, APIs, or components that don't exist in the codebase
- ONLY list features that you can verify exist in the RAG context with specific code references
- When describing "Core Features", ONLY include features that actually exist in the code (cite the code location)
- When describing "Advanced Features", ONLY include features that actually exist in the code (cite the code location)
- If you cannot find evidence of a feature in the RAG context, DO NOT include it - skip it entirely
- Base ALL feature descriptions on actual code, not assumptions or examples from other projects
- To reach the word count, expand on REAL features with more detail, examples, and explanations - do NOT invent new features
- If the repository has fewer features than the target count, document those features in EXTREME detail rather than inventing new ones

Create an EXTENSIVE, COMPREHENSIVE README that MUST follow this EXACT structure (be thorough and detailed, match the style of DOCUMENTATION.md):

Start with:
# README

# [Project Name]: [Brief Description]

Then follow this EXACT structure (matching DOCUMENTATION.md style):

## Project Title and Description

### Overview
- Write EXACTLY 3 comprehensive paragraphs explaining what the project does
- First paragraph: Describe the project, its purpose, and key technologies (100-150 words)
- Second paragraph: Explain the problem it solves and how it addresses pain points (100-150 words)
- Third paragraph: Describe the architecture, approach, and key capabilities (100-150 words)
- Be detailed and thorough (300-450 words total minimum)

### Purpose and Goals
- Write EXACTLY 3 comprehensive paragraphs
- First paragraph: Explain the primary purpose and what problems it solves (100-150 words)
- Second paragraph: Describe key goals, democratization, and accessibility (100-150 words)
- Third paragraph: Explain additional goals like multi-language support and reducing cognitive load (100-150 words)
- Be detailed and thorough (300-450 words total minimum)

### Target Audience
- Write EXACTLY 3 comprehensive paragraphs
- First paragraph: Describe primary audience (developers, PMs, technical writers) and main benefits (100-150 words)
- Second paragraph: Explain benefits for individual developers, open-source maintainers, and enterprise teams (100-150 words)
- Third paragraph: Describe benefits for technical writers, project managers, and organizations onboarding (100-150 words)
- Be detailed and thorough (300-450 words total minimum)

## Features

### Core Features
- MANDATORY FIRST STEP: Extract features from RAG context before writing anything:
  1. Go through the RAG context and list every function, class, component, API endpoint, or feature you can find
  2. For each item, note the file path where it exists
  3. Verify each item actually has implementation code (not just a name)
  4. This verified list is the ONLY source of features you can document
- Create a numbered list of ONLY the features you extracted and verified (could be 3, could be 20 - list exactly what exists)
- DO NOT aim for a specific number - list what actually exists in the codebase
- Each feature should have:
  - **Bold feature name** (the actual name from the code)
  - File path in parentheses: (src/path/to/file.ts)
  - 2-4 detailed sentences explaining what the code actually does (based on the implementation you see in RAG context)
  - Why it's useful (based on how it's used in the codebase)
- Format exactly like:
  1. **Feature Name** (src/path/to/file.ts): Detailed description explaining what the code actually does based on the implementation you see. [Additional sentences with more detail about how it works, what it does, examples from the code, etc.]
   
  2. **Another Feature** (src/another/path.ts): Another detailed description based on actual code implementation...
- CRITICAL: If you cannot find a feature in the RAG context with its implementation, DO NOT include it. Skip it entirely.
- IMPORTANT: If the repository has very few features (e.g., only 2-3), document those in EXTREME detail rather than inventing more. It's better to have 3 well-documented features than 10 invented ones.
- To reach word count: Expand each verified feature with extensive detail about its implementation, usage, examples, edge cases, etc. - do NOT add invented features.

### Advanced Features
- FIRST: Check the RAG context to see if there are any advanced/sophisticated features:
  - Look for complex functions, advanced modules, sophisticated implementations
  - Look for advanced configurations, optimizations, integrations
  - Look for advanced patterns, architectures, or capabilities in the code
- CRITICAL: If you find advanced features, create a numbered list of ONLY the advanced features you can verify exist in the code
- If you find 3 advanced features, list 3. If you find 8, list 8. If you find 0, SKIP THIS SECTION ENTIRELY.
- If there are no advanced features in the codebase, DO NOT create this section. Simply skip it and move on to the next section.
- Same format as Core Features (with code references) if features exist
- CRITICAL: ONLY include features that you can VERIFY exist in the RAG context. If you cannot find any advanced features, DO NOT create this section - skip it completely.

## Installation/Setup

### Prerequisites
- Start with: "To set up [project name], ensure you have the following prerequisites:"
- Create a bullet list with bold items:
  - **Item Name**: Description
  - **Another Item**: Description

### Step-by-Step Setup Instructions
- Number each step (1., 2., 3., etc.)
- Each step should have:
  - **Bold step title** (e.g., "Clone the Repository")
  - Brief description
  - Code blocks with actual commands
- Include steps for:
  1. Clone the Repository (with git clone command)
  2. Install Dependencies (with npm install command)
  3. Configure Environment Variables (with .env example)
  4. Start the Development Server (with npm run dev command)
  5. Build for Production (with npm run build command)

### Troubleshooting
- Create a bullet list of common issues
- Each item should have:
  - **Bold issue name**: Detailed solution with 2-3 sentences explaining the problem and how to fix it
- Include AT LEAST 5-7 troubleshooting items with comprehensive solutions
- Cover: API Key errors, Rate Limiting, Private Repository Access, CORS Issues, Build Failures, Timeout Issues, Memory Issues, etc.

## Usage

### Quick Start Guide
- Numbered steps (1., 2., 3., etc.) for getting started quickly
- Each step should be clear and actionable
- Include 5-7 steps covering the basic workflow

### Detailed Usage Examples
- **Basic Example** subsection with:
  - Complete code example in code blocks
  - Explanation of what the code does
  - Expected output or result
- **Advanced Example** subsection with:
  - More complex code example
  - Explanation of advanced features
- **Error Handling Example** subsection with:
  - Code showing error handling
  - Explanation of error scenarios

## API/Function Examples

- FIRST: Check the RAG context to identify what functions, classes, or APIs actually exist in the codebase
- CRITICAL: Only document functions/classes/APIs that you can VERIFY exist in the RAG context
- If the repository has NO exported functions or APIs (e.g., it's a static website, a configuration repo, etc.), SKIP THIS SECTION ENTIRELY or note that this is not applicable
- If the repository has functions/APIs, document them following this format:

For each major function/class that EXISTS, document with:

### \`functionName\`
- Function signature with TypeScript types (or JavaScript if that's what the code uses)
- **Parameters**: Table or detailed list with:
  - Parameter name, type, description, constraints, examples
- **Returns**: Detailed explanation of return value
- **Example Usage**:
  \`\`\`typescript
  // Complete code example
  \`\`\`
- Include 2-3 usage examples (basic, advanced, edge cases)

- Document ALL major functions/classes that you can verify exist (could be 2, could be 20 - document what actually exists)
- DO NOT aim for a specific number - document what's actually in the codebase
- If there are only 2-3 functions, document those in EXTREME detail rather than inventing more
- For each function, include:
  - Complete function signature with full types (as they appear in the code)
  - Detailed parameter documentation table or list
  - Comprehensive return value explanation
  - Multiple usage examples (basic, advanced, edge cases, error handling)
  - Performance considerations if applicable
  - Related functions or dependencies

## Configuration

### Environment Variables
- Create a table with columns:
  | Variable | Required | Description |
  |---------|----------|-------------|
  | VAR_NAME | Yes/No | Description |
- Include example values in descriptions

### GitHub Token Setup (if applicable)
- Numbered steps for setting up tokens
- Include links and detailed instructions

## Architecture Overview

### System Design
- FIRST: Check the RAG context to understand what the actual architecture is
- Write comprehensive paragraphs explaining the high-level architecture based on what ACTUALLY exists in the codebase
- DO NOT describe architectures that don't exist (e.g., don't mention "agent-based system" or "LangChain" if they're not in the code)
- Describe what the code actually shows:
  - If it's a web app, describe the web architecture
  - If it's a CLI tool, describe the CLI architecture
  - If it's a library, describe the library structure
  - If it's a static site, describe the static site architecture
- Reference actual components, services, and patterns from the RAG context
- Write 2-4 paragraphs (100-150 words each) based on what the code actually shows

### Component Relationships
- FIRST: Extract actual component/module names from the RAG context
- Only document components/modules that you can VERIFY exist in the codebase
- If the repository has no clear component structure (e.g., it's a simple script or single-file project), adapt this section accordingly or skip it
- Create a detailed bullet list describing each major component that EXISTS
- For each component that exists, explain:
  - Its role and responsibility (based on the code)
  - How it interacts with other components (if applicable)
  - Data flow and dependencies (if applicable)
  - Key methods or functions it provides (from the actual code)
- Reference actual component names, file paths, and class/function names from the RAG context
- DO NOT list components that don't exist - only document what you can verify

### Project Structure
- Use the complete directory structure provided in the context above
- Display as a code block with tree format:
  \`\`\`
  src/
  ├── components/          # Reusable React components
  │   ├── Component1.tsx
  │   └── Component2.tsx
  ├── lib/                 # Core business logic
  │   ├── service1.ts
  │   └── service2.ts
  └── pages/               # Main page components
      └── Page1.tsx
  \`\`\`
- Show ALL files and directories - do NOT truncate
- Include brief inline comments (using #) for directory purposes

## Contributing

### Guidelines for Contributors
- Numbered steps (1., 2., 3., etc.) for:
  1. Fork the Repository (with description)
  2. Create a Feature Branch (with git command example)
  3. Commit Your Changes (with git commit example)
  4. Push to Your Branch (with git push example)
  5. Open a Pull Request (with description)

### Development Standards
- Bullet list with:
  - **Standard Name**: Description
  - Include: TypeScript Best Practices, Functional Components, Code Comments, Documentation, Testing

## License
- License information
- Usage terms
- Attribution if applicable

## Additional Sections

### FAQ
- **Q1: Question?**
  A1: Detailed answer with 3-5 sentences explaining the solution comprehensively
- Include AT LEAST 5-7 FAQ items covering:
  - Setup and configuration questions
  - Usage and workflow questions
  - Technical questions about features
  - Troubleshooting questions
  - Best practices questions
  - Integration questions
  - Cost and performance questions

### Troubleshooting
- Bullet list with AT LEAST 5-7 troubleshooting items
- Each item should have:
  - **Issue Name**: Detailed solution with 2-3 sentences explaining both the problem and the fix
- Cover common issues like: API errors, authentication problems, rate limiting, build issues, performance problems, etc.

### Known Issues
- Bullet list with AT LEAST 5-6 known issues
- Each issue should have:
  - **Issue Name**: Detailed description (2-3 sentences) explaining the limitation and any workarounds
- Include issues like: PDF export limitations, workflow timeouts, CORS issues, token limits, translation quality, API generation accuracy, etc.

### Roadmap
- FIRST: Check the RAG context, repository analysis, and any issues/PRs mentioned to see if there are actual roadmap items
- CRITICAL: ONLY include roadmap items that are ACTUALLY mentioned in:
  - The codebase (comments, TODOs, issues)
  - Repository analysis (if it mentions future plans)
  - Any visible planning documents
- If there are roadmap items, create a bullet list with:
  - **Feature Name**: Detailed description (2-3 sentences) explaining what it will do and why it's valuable
- If there are NO roadmap items mentioned anywhere:
  - Either SKIP THIS SECTION ENTIRELY, OR
  - Create a section titled "Potential Future Improvements" and clearly state these are SUGGESTIONS based on current limitations, NOT planned features
  - Label them clearly as "Potential improvements" or "Suggestions" not "Planned features"
- DO NOT invent roadmap items to reach a target number
- It's better to skip this section or have fewer items than to invent features

CRITICAL LENGTH REQUIREMENT: You MUST generate AT LEAST 4500-5500 words (approximately 600-700+ lines like DOCUMENTATION.md). This is NOT optional. The documentation MUST be comprehensive and extensive. Do NOT stop early or be brief. Continue generating until you have covered ALL aspects thoroughly.

Length Enforcement:
- Minimum: 4500 words / 600+ lines (approximately 6000-7500 tokens)
- Target: 5000-5500 words / 650-700+ lines (approximately 7000-8500 tokens)
- Maximum: Use the full token budget available (up to 12,000 words / 1000+ lines if needed)

STRUCTURE REQUIREMENTS:
- Follow the structure provided above, but ADAPT it based on what actually exists in the repository
- Use proper markdown formatting (## for main sections, ### for subsections)
- Include core sections (Overview, Purpose and Goals, Target Audience, Installation/Setup, Usage, etc.)
- For optional sections (Advanced Features, API/Function Examples, Component Relationships, Roadmap):
  - ONLY include them if the repository actually has those elements
  - If a section doesn't apply (e.g., no APIs, no components, no advanced features), SKIP IT or note that it's not applicable
  - It's better to skip a section than to invent content for it
- Use numbered lists for features (1., 2., 3.)
- Use code blocks for all code examples
- Use tables for configuration (Environment Variables) - only if the repo has configuration
- Use tree format for Project Structure
- Each section should be substantial (not just 1-2 sentences)
- CRITICAL: Document what EXISTS, not what you think should exist

If you find yourself being brief or concise, STOP and expand. Add more:
- More detailed explanations in each section (each paragraph should be 3-5 sentences, Overview/Purpose/Target Audience should have 3 paragraphs each)
- More code examples (at least 3-5 per major function, document 5-7 functions total)
- More use cases and scenarios
- More troubleshooting items (7 items minimum with detailed solutions)
- More FAQ entries (7 questions minimum with comprehensive answers)
- More detailed architecture descriptions (3 paragraphs for System Design, detailed component list for Component Relationships)
- More features in both Core and Advanced sections (14+ core features, 12+ advanced features)
- More known issues (6 items minimum with workarounds)
- More roadmap items (8 items minimum with detailed descriptions)

Style: Write in a professional, comprehensive style EXACTLY like the DOCUMENTATION.md example. Be thorough, detailed, and developer-friendly. Include extensive code snippets that show actual usage patterns from the codebase. Make it actionable and complete. Match the tone, structure, and level of detail of professional open-source project documentation.`;
      break;
      
    case 'ARCHITECTURE':
      sectionPrompt = `Generate an Architecture documentation section for "${repoFullName}" in Ai-Style format.
${languageInstruction}

${ragContext ? `\n\n=== CRITICAL: ACTUAL CODE FROM REPOSITORY (YOUR ONLY SOURCE OF TRUTH) ===\n${ragContext}\n=== END OF ACTUAL CODE ===\n\n` : '\n\n⚠️ WARNING: NO RAG CONTEXT AVAILABLE - Repository may not be indexed. You MUST NOT invent content. Only document what you can verify from repository analysis.\n\n'}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 0)}${baseMarkdown.length > 0 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE Architecture content. DO NOT simply reformat or copy the reference documentation above. Instead:
- Analyze the actual codebase using the RAG context and repository analysis
- Generate fresh, detailed documentation based on the actual code structure
- Create comprehensive content that goes FAR BEYOND the reference documentation
- Use the reference only to understand the project's purpose, not to copy content

Create an EXTENSIVE, COMPREHENSIVE Architecture document in Ai-Style that includes (be thorough and detailed):

1. **System Overview** - Detailed high-level architecture description with diagrams descriptions, design decisions, and code references
2. **Component Structure** - Complete breakdown of ALL major components/modules with:
   - Detailed purpose and responsibility
   - Complete code examples
   - Interaction patterns
   - Dependencies between components
3. **Key Classes/Functions** - Comprehensive documentation of important classes and functions with:
   - Complete JSDoc/TSDoc comments
   - Full type signatures with detailed parameter descriptions
   - Purpose, responsibility, and design rationale
   - How they fit in the architecture
   - Multiple usage examples
   - Performance considerations
4. **Data Flow** - Detailed explanation of how data moves through the system with:
   - Step-by-step flow descriptions
   - Reference to actual functions
   - State management approach
   - Data transformation points
5. **Technology Stack** - Comprehensive tech stack documentation with:
   - Detailed explanations of each technology
   - Why each was chosen
   - Code examples showing usage
   - Version information
6. **Project Structure** - Display the COMPLETE directory structure of the entire repository (especially the src/ directory) as a simple tree format using backticks and tree characters (├──, └──). The complete directory structure is provided in the context above. You MUST include ALL files and subdirectories. Format it like this example:

\`\`\`
src/
├── components/
│   ├── Component1.tsx
│   └── Component2.tsx
├── pages/
│   └── Page1.tsx
└── lib/
    └── utils.ts
\`\`\`

IMPORTANT: Use the complete directory structure provided in the context above. Show ALL files and directories - do NOT truncate or summarize. Use ONLY the simple tree format with brief inline comments (using #) for directory purposes. Keep it concise and clean but COMPLETE.
7. **Design Patterns** - Detailed documentation of patterns used with:
   - Pattern explanations
   - Code examples
   - When and why patterns are used
8. **Dependencies** - Comprehensive dependency documentation with:
   - Key dependencies and their roles
   - Version requirements
   - Why each dependency is needed
9. **System Interactions** - How different parts interact
10. **Scalability and Performance** - Architecture considerations

CRITICAL LENGTH REQUIREMENT: You MUST generate AT LEAST 0-6000 words. This is NOT optional. The documentation MUST be comprehensive and extensive. Do NOT stop early or be brief. Continue generating until you have covered ALL aspects thoroughly.

Length Enforcement:
- Minimum: 0 words (approximately 5500-7000 tokens)
- Target: 5000-6000 words (approximately 7000-8500 tokens)
- Maximum: Use the full token budget available (up to 12,000 words if needed)

If you find yourself being brief or concise, STOP and expand. Add more:
- Detailed component breakdowns
- Complete code examples for every component
- Architecture diagrams descriptions
- Design pattern explanations with code
- Data flow descriptions
- Performance considerations
- More detailed explanations of each section

Style: Code-first approach like Cursor AI. Show actual code structures, class hierarchies, and function relationships. Include extensive code examples that demonstrate the architecture. Be EXTENSIVE and THOROUGH.`;
      break;
      
    case 'API':
      sectionPrompt = `Generate an API Reference documentation for "${repoFullName}" in Ai-Style format.
${languageInstruction}

${ragContext ? `\n\n=== CRITICAL: ACTUAL CODE FROM REPOSITORY (YOUR ONLY SOURCE OF TRUTH) ===\n${ragContext}\n=== END OF ACTUAL CODE ===\n\n` : '\n\n⚠️ WARNING: NO RAG CONTEXT AVAILABLE - Repository may not be indexed. You MUST NOT invent content. Only document what you can verify from repository analysis.\n\n'}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 0)}${baseMarkdown.length > 0 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE API Reference content. DO NOT simply reformat or copy the reference documentation above. Instead:
- Analyze the actual codebase using the RAG context and repository analysis
- Generate fresh, detailed documentation based on the actual code structure
- Create comprehensive content that goes FAR BEYOND the reference documentation
- Use the reference only to understand the project's purpose, not to copy content

Create an EXTENSIVE, COMPREHENSIVE API Reference in Ai-Style that includes (be thorough and detailed):

1. **API Overview** - Comprehensive introduction to the API including:
   - Purpose and use cases
   - Design philosophy
   - Getting started guide
   - Common patterns

2. **Function/Class Documentation** - For EVERY exported function/class that EXISTS in the codebase:
   - FIRST: Extract all exported functions/classes from the RAG context
   - Only document functions/classes that you can VERIFY exist in the code
   - If the repository has NO exported functions/classes (e.g., it's a static site, config repo, etc.), adapt this section or note that APIs are not applicable
   - For each function/class that EXISTS, include:
     - Complete JSDoc/TSDoc style comments with ALL standard tags (@param, @returns, @throws, @example, @see, @since, @deprecated, @remarks)
     - Full type signatures with detailed parameter descriptions (as they appear in the code)
     - Complete parameter documentation including:
       * Type information
       * Purpose and constraints
       * Valid value ranges
       * Default values
       * Example values
     - Comprehensive return type documentation including:
       * What is returned
       * Return value structure
       * Edge cases
     - Multiple practical usage examples (basic, advanced, edge cases, error handling)
     - Performance considerations
     - Error conditions and handling
     - Related functions/classes
   - Document ALL that exist - could be 2, could be 50 - document what's actually there

3. **Code Examples** - Extensive real code examples showing:
   - Basic usage
   - Advanced usage patterns
   - Integration examples
   - Error handling
   - Best practices
   - Anti-patterns to avoid

4. **Type Definitions** - Complete interface/type documentation with:
   - All properties documented
   - Type constraints explained
   - Usage examples
   - Related types

5. **Error Handling** - Comprehensive error documentation including:
   - All error codes and messages
   - When errors occur
   - How to handle errors
   - Error recovery strategies

6. **Authentication** - Complete authentication guide (if applicable)

7. **Additional Sections**:
   - Rate limiting
   - Versioning
   - Migration guides
   - Deprecation notices

CRITICAL LENGTH REQUIREMENT: You MUST generate AT LEAST 5000-8000 words. This is NOT optional. The documentation MUST be comprehensive and extensive. Do NOT stop early or be brief. Continue generating until you have covered ALL aspects thoroughly.

Length Enforcement:
- Minimum: 5000 words (approximately 7000-8500 tokens)
- Target: 6000-8000 words (approximately 8500-11,000 tokens)
- Maximum: Use the full token budget available (up to 12,000 words if needed)

If you find yourself being brief or concise, STOP and expand. Add more:
- Complete documentation for EVERY exported function/class
- Multiple examples for each function (basic, advanced, edge cases)
- Detailed parameter documentation for EVERY parameter
- Complete return type documentation
- Error handling examples for each function
- Integration examples
- More code snippets showing actual usage

Style: Generate documentation similar to Cursor AI - include the actual code with inline documentation comments. Show complete function signatures, detailed parameter types, return types, and extensive practical examples. Make it code-first and developer-friendly. Be EXTENSIVE and THOROUGH.`;
      break;
      
    case 'COMPONENTS':
      sectionPrompt = `Generate a Components documentation section for "${repoFullName}" in Ai-Style format.
${languageInstruction}

${ragContext ? `\n\n=== CRITICAL: ACTUAL CODE FROM REPOSITORY (YOUR ONLY SOURCE OF TRUTH) ===\n${ragContext}\n=== END OF ACTUAL CODE ===\n\n` : '\n\n⚠️ WARNING: NO RAG CONTEXT AVAILABLE - Repository may not be indexed. You MUST NOT invent content. Only document what you can verify from repository analysis.\n\n'}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 0)}${baseMarkdown.length > 0 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE Components content. DO NOT simply reformat or copy the reference documentation above. Instead:
- Analyze the actual codebase using the RAG context and repository analysis
- Generate fresh, detailed documentation based on the actual code structure
- Create comprehensive content that goes FAR BEYOND the reference documentation
- Use the reference only to understand the project's purpose, not to copy content

Create an EXTENSIVE, COMPREHENSIVE Components document in Ai-Style that includes (be thorough and detailed):

1. **Component Overview** - Comprehensive introduction to the component system including:
   - Architecture and design patterns
   - Component organization
   - Design principles

2. **Component Documentation** - For EVERY component/class/module that EXISTS in the codebase:
   - FIRST: Extract all components/modules from the RAG context
   - Only document components/modules that you can VERIFY exist in the code
   - If the repository has NO components (e.g., it's a backend API, CLI tool, library without UI, etc.), adapt this section accordingly or note that UI components are not applicable
   - For each component/module that EXISTS, include:
     - Complete JSDoc/TSDoc style documentation with all standard tags
     - Comprehensive Props/Parameters documentation with:
       * Complete type information (as it appears in the code)
       * Detailed descriptions
       * Required vs optional
       * Default values
       * Validation rules
       * Example values
     - Complete interface/type definitions with all properties documented
     - Extensive usage examples with actual code (basic, advanced, edge cases)
     - Dependencies and imports explained
     - Component lifecycle (if applicable)
     - State management approach (if applicable)
     - Event handling (if applicable)
     - Styling approach (if applicable)
   - Document ALL that exist - could be 1, could be 100 - document what's actually there

3. **Code Examples** - Extensive examples showing:
   - Actual component code with complete documentation comments
   - Multiple usage scenarios
   - Integration examples
   - Composition patterns
   - Best practices

4. **Component Hierarchy** - Detailed explanation of:
   - How components relate to each other
   - Component tree structure
   - Data flow between components
   - Communication patterns

5. **Props/Configuration** - Comprehensive prop/parameter documentation with:
   - Complete type information
   - Detailed descriptions
   - Validation rules
   - Default values
   - Usage examples

6. **Additional Sections**:
   - Styling guide
   - Theming
   - Accessibility considerations
   - Performance optimization
   - Testing strategies

CRITICAL LENGTH REQUIREMENT: You MUST generate AT LEAST 0-6000 words. This is NOT optional. The documentation MUST be comprehensive and extensive. Do NOT stop early or be brief. Continue generating until you have covered ALL aspects thoroughly.

Length Enforcement:
- Minimum: 0 words (approximately 5500-7000 tokens)
- Target: 5000-6000 words (approximately 7000-8500 tokens)
- Maximum: Use the full token budget available (up to 12,000 words if needed)

If you find yourself being brief or concise, STOP and expand. Add more:
- Complete documentation for EVERY component
- Detailed prop documentation for EVERY prop
- Multiple usage examples for each component
- Composition patterns
- Styling examples
- Accessibility considerations
- More code examples showing real usage

Style: Generate like Cursor AI - show the actual code with inline documentation. Include complete type information, detailed parameter descriptions, and extensive practical examples. Make it code-focused and practical. Be EXTENSIVE and THOROUGH.`;
      break;
      
    case 'TESTING_CI':
      sectionPrompt = `Generate a Testing & CI/CD documentation section for "${repoFullName}".
${languageInstruction}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 0)}${baseMarkdown.length > 0 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE Testing & CI/CD content. DO NOT simply reformat or copy the reference documentation above. Instead:
- Analyze the actual codebase using the RAG context and repository analysis
- Generate fresh, detailed documentation based on the actual code structure
- Create comprehensive content that goes FAR BEYOND the reference documentation
- Use the reference only to understand the project's purpose, not to copy content

Create an EXTENSIVE, COMPREHENSIVE Testing & CI/CD document that includes (be thorough and detailed):

1. **Testing Strategy** - Comprehensive overview of testing approach including:
   - Testing philosophy and principles
   - Testing pyramid explanation
   - Coverage goals
   - Quality metrics

2. **Test Setup** - Complete guide on how to set up and run tests including:
   - Prerequisites and dependencies
   - Configuration files
   - Environment setup
   - Troubleshooting common issues

3. **Test Types** - Detailed documentation of all test types:
   - Unit tests (with examples)
   - Integration tests (with examples)
   - E2E tests (with examples)
   - Performance tests
   - Security tests
   - Visual regression tests

4. **CI/CD Pipeline** - Comprehensive CI/CD documentation including:
   - Complete pipeline configuration
   - All stages explained
   - Build process
   - Deployment process
   - Rollback procedures

5. **Running Tests** - Extensive commands and instructions:
   - All test commands
   - Options and flags
   - Running specific test suites
   - Debugging tests

6. **Coverage** - Complete test coverage information:
   - Coverage reports
   - Coverage goals
   - Improving coverage

7. **Deployment** - Comprehensive deployment documentation:
   - Deployment process step-by-step
   - All environments explained
   - Deployment strategies
   - Monitoring and rollback

8. **Additional Sections**:
   - Best practices
   - Common issues and solutions
   - Performance optimization
   - Security considerations

IMPORTANT: Generate EXTENSIVE documentation - aim for 3000-5000+ words. Be thorough, detailed, and comprehensive. Include extensive examples and detailed explanations.

Focus on practical testing and deployment workflows with complete information.`;
      break;
      
    case 'CHANGELOG':
      sectionPrompt = `Generate a Changelog documentation for "${repoFullName}".
${languageInstruction}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 0)}${baseMarkdown.length > 0 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE Changelog content. DO NOT simply reformat or copy the reference documentation above. Instead:
- Analyze the actual codebase using the RAG context and repository analysis
- Generate fresh, detailed documentation based on the actual code structure
- Create comprehensive content that goes FAR BEYOND the reference documentation
- Use the reference only to understand the project's purpose, not to copy content

Create an EXTENSIVE, COMPREHENSIVE Changelog that includes (be thorough and detailed):

1. **Version History** - Complete list of ALL versions with:
   - Dates
   - Release notes
   - Key highlights

2. **Change Categories** - Detailed documentation for each category:
   - Added (with descriptions)
   - Changed (with before/after explanations)
   - Deprecated (with migration paths)
   - Removed (with alternatives)
   - Fixed (with issue descriptions)
   - Security (with severity and impact)

3. **Recent Changes** - Comprehensive documentation of most recent version changes:
   - Detailed descriptions
   - Impact analysis
   - Migration requirements
   - Breaking changes highlighted

4. **Migration Guides** - Complete migration guides for:
   - All breaking changes
   - Step-by-step migration instructions
   - Code examples
   - Common issues and solutions

5. **Release Notes** - Detailed summaries of major releases including:
   - Feature highlights
   - Performance improvements
   - Bug fixes
   - Security updates

6. **Additional Sections**:
   - Timeline visualization
   - Contributor acknowledgments
   - Statistics

IMPORTANT: Generate EXTENSIVE documentation - aim for 0-0+ words. Be thorough, detailed, and comprehensive. Include complete information for all versions and changes.

Format it as a standard changelog with version numbers and dates, but make it comprehensive and detailed.`;
      break;
      
    default:
      return baseMarkdown;
  }

  try {
    // Get max tokens based on model FIRST, so we can use it in the prompt
    // GPT-4o and GPT-4o-mini both support up to 16,384 output tokens
    const getMaxTokensForModel = (model: string): number => {
      if (model.includes('gpt-4o') || model.includes('gpt-5')) {
        return 16384; // Max output tokens for GPT-4o/5 models (≈12,000 words)
      } else if (model.startsWith('gpt-4')) {
        return 8192; // Max output tokens for GPT-4 models (≈6,000 words)
      } else if (model.startsWith('gpt-3.5')) {
        return 4096; // Max output tokens for GPT-3.5 models (≈3,000 words)
      }
      return 16384; // Default to maximum for unknown models (likely newer GPT-4o variants)
    };
    
    const maxTokens = getMaxTokensForModel(modelToUse);
    const estimatedWords = Math.floor(maxTokens * 0.75); // Rough estimate: 1 token ≈ 0.75 words
    
    // Define word count targets based on section type
    const wordCountTargets: Record<DocSectionType, { min: number; target: number }> = {
      'README': { min: 4500, target: 5000 },
      'ARCHITECTURE': { min: 0, target: 4500 },
      'API': { min: 0, target: 4500 },
      'COMPONENTS': { min: 5000, target: 6000 },
      'TESTING_CI': { min: 3000, target: 0 },
      'CHANGELOG': { min: 0, target: 3000 },
    };
    
    const { min: minWords, target: targetWords } = wordCountTargets[sectionType] || { min: 0, target: 4500 };
    
    // Build system prompt with dynamic token and word count information
    const lengthEnforcementSection = `LENGTH ENFORCEMENT - CRITICAL - READ THIS CAREFULLY: 
- You have access to ${maxTokens} output tokens (≈${estimatedWords} words)
- For ${sectionType} sections: MINIMUM ${minWords} words, TARGET ${targetWords} words, MAXIMUM: Use the full token budget (${maxTokens} tokens)
- You MUST use at least 80-90% of the available token budget (${Math.floor(maxTokens * 0.8)} tokens minimum)
- CRITICAL: If your response is under ${minWords} words, you have FAILED the task and will need to regenerate
- DO NOT stop early - continue generating until you reach at least ${targetWords} words
- DO NOT use stop sequences or finish tokens until you reach ${targetWords} words
- If you think you're done but haven't reached ${targetWords} words, you're NOT done - keep going
- Count your words as you generate - aim for ${targetWords} words, not just ${minWords} words
- Add more sections, more examples, more explanations, more code snippets, more details
- Expand every section with multiple subsections (at least 3-5 subsections per major section)
- Include extensive code examples (at least 15-20 code snippets for README, 20-30 for COMPONENTS)
- Add detailed explanations for every concept (5-7 sentences per paragraph, not 2-3)
- Include troubleshooting sections (10+ items), FAQ sections (10+ items), best practices sections (10+ items)
- Add "Additional Resources", "Related Topics", "See Also" sections to expand content
- Include multiple "Example" subsections under each major section (at least 3-5 examples per concept)
- Add "Common Patterns", "Advanced Usage", "Edge Cases" subsections
- Add "Performance Considerations", "Security Notes", "Scalability", "Best Practices" sections
- Do NOT stop until you have generated comprehensive, extensive documentation matching professional standards
- Remember: SHORT = FAILURE. LONG = SUCCESS. Be verbose, be thorough, be comprehensive.
- Your goal is to generate ${targetWords} words - keep generating until you reach this target.
- IMPORTANT: The model will automatically stop at ${maxTokens} tokens, so use them all - don't stop early!`;

    const systemPrompt = language !== 'en'
      ? `You are an expert code documentation generator in the style of Cursor AI. Generate EXTENSIVE, COMPREHENSIVE, DETAILED ${sectionType} documentation in ${languageNames[language]}. 

CRITICAL FIRST STEP - EXTRACT AND VERIFY (MANDATORY - DO NOT SKIP):
BEFORE generating any documentation, you MUST complete this verification process:

STEP 1: Extract actual code elements from RAG context:
- Read the RAG context line by line
- Extract: function names, class names, component names, API routes, file paths
- Create a list: "Feature X found in file Y"
- DO NOT proceed if you haven't created this list

STEP 2: Verify each element:
- For each item in your list, verify it has actual implementation code in the RAG context
- Remove any items you cannot verify
- Your final list contains ONLY verified, existing features

STEP 3: This verified list is your ONLY source of truth:
- You can ONLY document items from this verified list
- If it's not in the list, it doesn't exist - DO NOT document it
- If the list has 5 items, document 5 items - no more

STEP 4: Only AFTER completing steps 1-3, generate documentation:
- Document ONLY items from your verified list
- For each item, cite the file path and explain what the code actually does
- Expand on these verified items with detail - do NOT add new items

CRITICAL: If you skip this extraction and start documenting, you WILL invent content. This step is MANDATORY.

MANDATORY: Before writing documentation, you MUST:
1. List all verified features/components/APIs you found in RAG context (with file paths)
2. Show this list in your response before the documentation (format: "Verified Features: 1. FeatureA (src/path.ts), 2. FeatureB (src/path2.ts)...")
3. Document ONLY items from this list
4. For each item, cite the exact file path and code location

CRITICAL - DO NOT INVENT CONTENT:
- DO NOT invent features, functions, or capabilities that don't exist in the codebase
- DO NOT make up API endpoints, components, or modules that aren't in the actual code
- DO NOT describe functionality that you cannot verify exists in the RAG context or code analysis
- ONLY document what you can see in the actual code, RAG context, and repository analysis
- If a feature is mentioned in reference docs but not in the code, DO NOT include it
- If you're unsure if something exists, DO NOT include it - only document what you can verify
- When listing features, ONLY list features that actually exist in the codebase
- When describing APIs, ONLY describe APIs that actually exist in the code
- When listing components, ONLY list components that actually exist in the code
- Base ALL content on the RAG context, code analysis, and actual repository structure
- If the code doesn't show a feature, DO NOT document it as if it exists
- To reach the word count, expand on REAL features with more detail, examples, and explanations - do NOT invent new features

CRITICAL REQUIREMENTS:
- Generate COMPLETELY NEW, EXTENSIVE documentation (MANDATORY: ${minWords}-${targetWords}+ words - this is NOT optional)
- DO NOT copy or reformat the reference documentation - generate fresh content based on actual codebase analysis
- Use RAG context and repository analysis as PRIMARY sources, not the reference documentation
- MOST IMPORTANT: The documentation MUST accurately explain what this application does based on the code context - do NOT generate generic or vague descriptions
- Be THOROUGH and COMPREHENSIVE - do not be brief or concise - CONTINUE GENERATING until you reach the word count
- Document EVERYTHING - all functions, classes, types, interfaces, constants, utilities - leave nothing out
- Include COMPLETE JSDoc/TSDoc style comments with ALL standard tags (@param, @returns, @throws, @example, @see, @since, @deprecated, @remarks)
- Provide MULTIPLE examples for each concept (basic, advanced, edge cases, error handling, integration) - at least 3-5 examples per major function/class
- Include detailed type information with complete parameter descriptions including constraints and valid ranges
- Explain design decisions and rationale - explain both "what" and "why" - be verbose in explanations
- Include performance considerations, security notes, scalability concerns, and best practices
- Document internal functions and helpers, not just public APIs
- Provide extensive code examples from the actual codebase (use RAG context to find real code) - include actual code snippets
- Include troubleshooting guides, common issues, and solutions - expand on these sections
- Make it as comprehensive as professional API documentation (MDN, TypeScript Handbook, major open-source projects level)
- ANALYZE THE ACTUAL CODEBASE - don't rely on reference documentation

${lengthEnforcementSection}

All content must be in ${languageNames[language]}. Be EXTENSIVE and DETAILED - quality over brevity. Generate NEW comprehensive content based on codebase analysis, not reference material. Be verbose and thorough. Match the structure and detail level of professional documentation like GitScribe's DOCUMENTATION.md (4,500-5,500 words, 600-700+ lines).`
      : `You are an expert code documentation generator in the style of Cursor AI. Generate EXTENSIVE, COMPREHENSIVE, DETAILED ${sectionType} documentation.

CRITICAL FIRST STEP - EXTRACT AND VERIFY (MANDATORY - DO NOT SKIP):
BEFORE generating any documentation, you MUST complete this verification process:

STEP 1: Extract actual code elements from RAG context:
- Read the RAG context line by line
- Extract: function names, class names, component names, API routes, file paths
- Create a list: "Feature X found in file Y"
- DO NOT proceed if you haven't created this list

STEP 2: Verify each element:
- For each item in your list, verify it has actual implementation code in the RAG context
- Remove any items you cannot verify
- Your final list contains ONLY verified, existing features

STEP 3: This verified list is your ONLY source of truth:
- You can ONLY document items from this verified list
- If it's not in the list, it doesn't exist - DO NOT document it
- If the list has 5 items, document 5 items - no more

STEP 4: Only AFTER completing steps 1-3, generate documentation:
- Document ONLY items from your verified list
- For each item, cite the file path and explain what the code actually does
- Expand on these verified items with detail - do NOT add new items

CRITICAL: If you skip this extraction and start documenting, you WILL invent content. This step is MANDATORY.

MANDATORY: Before writing documentation, you MUST:
1. List all verified features/components/APIs you found in RAG context (with file paths)
2. Show this list in your response before the documentation (format: "Verified Features: 1. FeatureA (src/path.ts), 2. FeatureB (src/path2.ts)...")
3. Document ONLY items from this list
4. For each item, cite the exact file path and code location

CRITICAL - DO NOT INVENT CONTENT:
- DO NOT invent features, functions, or capabilities that don't exist in the codebase
- DO NOT make up API endpoints, components, or modules that aren't in the actual code
- DO NOT describe functionality that you cannot verify exists in the RAG context or code analysis
- ONLY document what you can see in the actual code, RAG context, and repository analysis
- If a feature is mentioned in reference docs but not in the code, DO NOT include it
- If you're unsure if something exists, DO NOT include it - only document what you can verify
- When listing features, ONLY list features that actually exist in the codebase
- When describing APIs, ONLY describe APIs that actually exist in the code
- When listing components, ONLY list components that actually exist in the code
- Base ALL content on the RAG context, code analysis, and actual repository structure
- If the code doesn't show a feature, DO NOT document it as if it exists
- To reach the word count, expand on REAL features with more detail, examples, and explanations - do NOT invent new features

CRITICAL REQUIREMENTS:
- Generate COMPLETELY NEW, EXTENSIVE documentation (MANDATORY: ${minWords}-${targetWords}+ words - this is NOT optional)
- DO NOT copy or reformat the reference documentation - generate fresh content based on actual codebase analysis
- Use RAG context and repository analysis as PRIMARY sources, not the reference documentation
- MOST IMPORTANT: The documentation MUST accurately explain what this application does based on the code context - do NOT generate generic or vague descriptions
- Be THOROUGH and COMPREHENSIVE - do not be brief or concise - CONTINUE GENERATING until you reach the word count
- Document EVERYTHING - all functions, classes, types, interfaces, constants, utilities - leave nothing out
- Include COMPLETE JSDoc/TSDoc style comments with ALL standard tags (@param, @returns, @throws, @example, @see, @since, @deprecated, @remarks)
- Provide MULTIPLE examples for each concept (basic, advanced, edge cases, error handling, integration) - at least 3-5 examples per major function/class
- Include detailed type information with complete parameter descriptions including constraints and valid ranges
- Explain design decisions and rationale - explain both "what" and "why" - be verbose in explanations
- Include performance considerations, security notes, scalability concerns, and best practices
- Document internal functions and helpers, not just public APIs
- Provide extensive code examples from the actual codebase (use RAG context to find real code) - include actual code snippets
- Include troubleshooting guides, common issues, and solutions - expand on these sections
- Make it as comprehensive as professional API documentation (MDN, TypeScript Handbook, major open-source projects level)
- ANALYZE THE ACTUAL CODEBASE - don't rely on reference documentation

${lengthEnforcementSection}

Style: Code-first, practical, developer-friendly, but EXTENSIVE and DETAILED. Quality and completeness over brevity. Generate NEW comprehensive content based on codebase analysis, not reference material. Be verbose and thorough. Match the structure and detail level of professional documentation like GitScribe's DOCUMENTATION.md (4,500-5,500 words, 600-700+ lines).`;
    
    console.log(`[DocsWriter] Generating ${sectionType} with model: ${modelToUse}, maxTokens: ${maxTokens}, temperature: 0.2`);
    
    // Use maximum tokens for comprehensive documentation generation
    // Use lower temperature (0.2) for more consistent, detailed output like Cursor AI
    const sectionContent = await callLangChain(
      sectionPrompt,
      systemPrompt,
      modelToUse, // Use the user's selected model
      0.2, // Lower temperature for more consistent, detailed output (same as Ai-Style-docs)
      repoFullName,
      true, // Use RAG
      maxTokens // Use calculated max tokens based on model
    );
    
    // Log the length of generated content for debugging
    const wordCount = sectionContent.split(/\s+/).length;
    const charCount = sectionContent.length;
    const lineCount = sectionContent.split('\n').length;
    console.log(`[DocsWriter] Generated ${sectionType} content: ${wordCount} words, ${charCount} characters, ${lineCount} lines`);
    
    // Get word count targets (same as defined above)
    const wordCountTargetsForValidation: Record<DocSectionType, { min: number; target: number }> = {
      'README': { min: 4500, target: 5000 },
      'ARCHITECTURE': { min: 0, target: 4500 },
      'API': { min: 0, target: 4500 },
      'COMPONENTS': { min: 5000, target: 6000 },
      'TESTING_CI': { min: 3000, target: 0 },
      'CHANGELOG': { min: 0, target: 3000 },
    };
    
    const { min: minWordsForValidation, target: targetWordsForValidation } = wordCountTargetsForValidation[sectionType] || { min: 0, target: 4500 };
    
    if (wordCount < minWordsForValidation) {
      console.error(`[DocsWriter] ERROR: Generated content is TOO SHORT (${wordCount} words). Expected minimum ${minWordsForValidation} words for ${sectionType}. This indicates the model stopped early or didn't follow instructions.`);
      console.error(`[DocsWriter] Model: ${modelToUse}, MaxTokens: ${maxTokens}, Actual words: ${wordCount}, Expected: ${minWordsForValidation}-${targetWordsForValidation}`);
      console.error(`[DocsWriter] Content preview (first 500 chars): ${sectionContent.substring(0, 500)}...`);
      
      // If content is too short, try to enhance it with a follow-up request
      // Changed threshold from 70% to 95% to catch more cases (e.g., 3889 words when minimum is 4500)
      if (wordCount < minWordsForValidation * 0.95) { // If less than 95% of minimum, try to expand
        console.warn(`[DocsWriter] Attempting to expand content (${wordCount} words < ${minWordsForValidation} minimum)`);
        try {
          const expansionPrompt = `The previous documentation generation for ${sectionType} was too short (${wordCount} words). You MUST expand it to at least ${minWordsForValidation} words (target: ${targetWordsForValidation} words). You are currently ${minWordsForValidation - wordCount} words SHORT.

Current content:
${sectionContent}

CRITICAL EXPANSION REQUIREMENTS:
- You MUST add at least ${minWordsForValidation - wordCount} more words (target: ${targetWordsForValidation - wordCount} more words)
- DO NOT just add filler - expand meaningfully with real content
- Add more detailed explanations, more examples, more code snippets, more subsections
- Expand every existing section with additional details, examples, and explanations
- Add new sections if needed: "Advanced Usage", "Common Patterns", "Edge Cases", "Best Practices", "Troubleshooting", "FAQ"
- For each major section, add 2-3 more subsections with detailed content
- Add more code examples (at least 5-10 more code snippets)
- Expand explanations to 5-7 sentences per paragraph instead of 2-3
- Add "See Also", "Related Topics", "Additional Resources" sections

You MUST expand this content significantly. Add:
- More detailed explanations (expand each section with 3-5 additional paragraphs)
- More code examples (add 5-10 additional code snippets)
- More subsections (break down existing sections into more detailed subsections)
- More troubleshooting items (add 5+ more troubleshooting scenarios)
- More FAQ items (add 5+ more FAQ questions and answers)
- More examples (add 3-5 more usage examples per major concept)
- More detailed API documentation (expand parameter descriptions, add more examples)
- More architecture details (add diagrams descriptions, more design patterns)
- More best practices (add 5+ more best practice recommendations)

CRITICAL - DO NOT INVENT CONTENT WHEN EXPANDING:
- DO NOT invent new features, APIs, or components to reach the word count
- ONLY expand on features and content that already exist in the current documentation
- Add more detail, examples, explanations, and code snippets to EXISTING features
- Add more subsections to EXISTING sections
- Add more troubleshooting items, FAQs, and best practices based on EXISTING functionality
- DO NOT make up new functionality that wasn't in the original content
- Base all expansions on what's already documented, just with more detail

DO NOT just add filler text. Expand meaningfully with real, useful content based on what EXISTS. The final documentation MUST be at least ${minWordsForValidation} words (target: ${targetWordsForValidation} words). Continue generating until you reach this length.`;

          const expandedContent = await callLangChain(
            expansionPrompt,
            `You are a documentation expert. CRITICAL TASK: Expand and enhance documentation to meet minimum length requirements.

CURRENT STATUS: ${wordCount} words
REQUIRED MINIMUM: ${minWordsForValidation} words  
TARGET: ${targetWordsForValidation} words
WORDS NEEDED: At least ${minWordsForValidation - wordCount} more words (target: ${targetWordsForValidation - wordCount} more words)

CRITICAL - DO NOT INVENT CONTENT:
- DO NOT invent new features, APIs, or components that don't exist in the current documentation
- ONLY expand on features and content that are already documented
- Add more detail, examples, and explanations to EXISTING features
- Add more subsections to EXISTING sections
- DO NOT make up new functionality

You MUST:
- Expand the existing content with more details, examples, and explanations
- Add new meaningful sections and subsections based on EXISTING content
- Include more code examples and snippets for EXISTING features
- Add troubleshooting guides, FAQs, best practices for EXISTING functionality
- Be thorough, comprehensive, and detailed about what EXISTS
- DO NOT stop until you reach at least ${minWordsForValidation} words
- Aim for ${targetWordsForValidation} words total

This is NOT optional - you MUST reach the minimum word count. Continue generating until you have at least ${minWordsForValidation} words.`,
            modelToUse,
            0.3, // Slightly higher temperature for more creative expansion
            repoFullName,
            true,
            maxTokens // Use full token budget for expansion
          );
          
          const expandedWordCount = expandedContent.split(/\s+/).length;
          console.log(`[DocsWriter] Expanded content: ${expandedWordCount} words (was ${wordCount})`);
          
          if (expandedWordCount >= minWordsForValidation) {
            return expandedContent;
    } else {
            console.warn(`[DocsWriter] Expansion still insufficient (${expandedWordCount} < ${minWordsForValidation}), returning original`);
          }
        } catch (expandError) {
          console.error(`[DocsWriter] Failed to expand content:`, expandError);
        }
      }
    } else if (wordCount < targetWordsForValidation) {
      console.warn(`[DocsWriter] WARNING: Generated content is shorter than target (${wordCount} words). Target: ${targetWordsForValidation} words for ${sectionType}.`);
    } else {
      console.log(`[DocsWriter] ✓ Generated comprehensive documentation: ${wordCount} words (target: ${targetWordsForValidation})`);
    }
    
    return sectionContent;
  } catch (error) {
    console.warn(`[DocsWriter] Failed to generate section-specific content for ${sectionType}, using base markdown`);
    return baseMarkdown;
  }
}

