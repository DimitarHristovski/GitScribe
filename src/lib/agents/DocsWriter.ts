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
        const sectionSpecificContent = await generateSectionSpecificContent(
          sectionType,
          githubUrl,
          baseMarkdown,
          repoAnalysis,
          plan,
          selectedLanguage,
          modelToUse // Always use the user's selected model
        );

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
    ragContext = await retrieveContext(
      `Generate ${sectionType} documentation for ${repoFullName}`,
      repoFullName,
      20 // Increased to 20 chunks for comprehensive Cursor-style documentation with extensive code examples
    );
  } catch (error) {
    console.warn(`[DocsWriter] RAG context retrieval failed for ${repoFullName}:`, error);
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
      sectionPrompt = `Generate a comprehensive README.md for the repository "${repoFullName}" following the EXACT structure and style of professional open-source project documentation (like the GitScribe DOCUMENTATION.md example - 400-500+ lines, comprehensive and detailed).
${languageInstruction}

${ragContext ? `\nRelevant Code Context:\n${ragContext}\n` : ''}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 2000)}${baseMarkdown.length > 2000 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE README content. DO NOT simply reformat or copy the reference documentation above. Instead:
- Analyze the actual codebase using the RAG context and repository analysis
- Generate fresh, detailed documentation based on the actual code structure
- Create comprehensive content that goes FAR BEYOND the reference documentation
- Use the reference only to understand the project's purpose, not to copy content
- Follow the EXACT structure and style of professional documentation (like GitScribe's DOCUMENTATION.md - comprehensive, detailed, 400-500+ lines)

Create an EXTENSIVE, COMPREHENSIVE README that MUST follow this EXACT structure (be thorough and detailed, match the style of DOCUMENTATION.md):

Start with:
# README

# [Project Name]: [Brief Description]

Then follow this EXACT structure (matching DOCUMENTATION.md style):

## Project Title and Description

### Overview
- Write 2-3 comprehensive paragraphs explaining what the project does
- Describe the technology stack and key technologies used
- Explain the main purpose and what problems it solves
- Be detailed and thorough (150-200 words minimum)

### Purpose and Goals
- Explain the primary purpose of the project
- Describe the goals and objectives
- Explain why the project exists and what value it provides
- Be detailed and thorough (100-150 words minimum)

### Target Audience
- Describe who would use this project
- Explain the use cases and scenarios
- Describe the benefits for different user types
- Be detailed and thorough (100-150 words minimum)

## Features

### Core Features
- Create a numbered list (1-12 items) of core features
- Each feature should have:
  - **Bold feature name** followed by a colon
  - 1-2 detailed sentences explaining what it does and why it's useful
- Format exactly like:
  1. **Feature Name**: Detailed description explaining what it does and its benefits.
   
  2. **Another Feature**: Another detailed description...

### Advanced Features
- Create a numbered list (1-8 items) of advanced features
- Same format as Core Features
- Focus on more sophisticated capabilities

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
  - **Bold issue name**: Detailed solution
- Include at least 3-5 troubleshooting items

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

For each major function/class, document with:

### \`functionName\`
- Function signature with TypeScript types
- **Parameters**: Table or detailed list with:
  - Parameter name, type, description, constraints, examples
- **Returns**: Detailed explanation of return value
- **Example Usage**:
  \`\`\`typescript
  // Complete code example
  \`\`\`
- Include 2-3 usage examples (basic, advanced, edge cases)

Document at least 3-5 major functions/classes from the codebase.

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
- 2-3 paragraphs explaining high-level architecture
- Describe design decisions and patterns
- Reference actual components from the codebase

### Component Relationships
- Describe how components interact
- Explain data flow and dependencies
- Reference actual component names from the codebase

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
  A1: Detailed answer (2-3 sentences minimum)
- Include 3-5 FAQ items

### Troubleshooting
- Bullet list with:
  - **Issue Name**: Detailed solution (2-3 sentences)

### Known Issues
- Bullet list of current limitations
- Each with brief description

### Roadmap
- Bullet list of planned features
- Each with brief description

CRITICAL LENGTH REQUIREMENT: You MUST generate AT LEAST 4000-6000 words (approximately 400-500+ lines like DOCUMENTATION.md). This is NOT optional. The documentation MUST be comprehensive and extensive. Do NOT stop early or be brief. Continue generating until you have covered ALL aspects thoroughly.

Length Enforcement:
- Minimum: 4000 words / 400+ lines (approximately 5500-7000 tokens)
- Target: 5000-6000 words / 450-500+ lines (approximately 7000-8500 tokens)
- Maximum: Use the full token budget available (up to 12,000 words / 1000+ lines if needed)

STRUCTURE REQUIREMENTS:
- Follow the EXACT structure provided above
- Use proper markdown formatting (## for main sections, ### for subsections)
- Include ALL subsections listed (Overview, Purpose and Goals, Target Audience, etc.)
- Use numbered lists for features (1., 2., 3.)
- Use code blocks for all code examples
- Use tables for configuration (Environment Variables)
- Use tree format for Project Structure
- Each section should be substantial (not just 1-2 sentences)

If you find yourself being brief or concise, STOP and expand. Add more:
- More detailed explanations in each section (each paragraph should be 3-5 sentences)
- More code examples (at least 3-5 per major function)
- More use cases and scenarios
- More troubleshooting items (5-7 items minimum)
- More FAQ entries (5-7 questions minimum)
- More detailed architecture descriptions
- More features in both Core and Advanced sections (12+ core, 8+ advanced)

Style: Write in a professional, comprehensive style EXACTLY like the DOCUMENTATION.md example. Be thorough, detailed, and developer-friendly. Include extensive code snippets that show actual usage patterns from the codebase. Make it actionable and complete. Match the tone, structure, and level of detail of professional open-source project documentation.`;
      break;
      
    case 'ARCHITECTURE':
      sectionPrompt = `Generate an Architecture documentation section for "${repoFullName}" in Cursor-style format.
${languageInstruction}

${ragContext ? `\nRelevant Code Context:\n${ragContext}\n` : ''}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 2000)}${baseMarkdown.length > 2000 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE Architecture content. DO NOT simply reformat or copy the reference documentation above. Instead:
- Analyze the actual codebase using the RAG context and repository analysis
- Generate fresh, detailed documentation based on the actual code structure
- Create comprehensive content that goes FAR BEYOND the reference documentation
- Use the reference only to understand the project's purpose, not to copy content

Create an EXTENSIVE, COMPREHENSIVE Architecture document in Cursor-style that includes (be thorough and detailed):

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

CRITICAL LENGTH REQUIREMENT: You MUST generate AT LEAST 4000-6000 words. This is NOT optional. The documentation MUST be comprehensive and extensive. Do NOT stop early or be brief. Continue generating until you have covered ALL aspects thoroughly.

Length Enforcement:
- Minimum: 4000 words (approximately 5500-7000 tokens)
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
      sectionPrompt = `Generate an API Reference documentation for "${repoFullName}" in Cursor-style format.
${languageInstruction}

${ragContext ? `\nRelevant Code Context:\n${ragContext}\n` : ''}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 2000)}${baseMarkdown.length > 2000 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE API Reference content. DO NOT simply reformat or copy the reference documentation above. Instead:
- Analyze the actual codebase using the RAG context and repository analysis
- Generate fresh, detailed documentation based on the actual code structure
- Create comprehensive content that goes FAR BEYOND the reference documentation
- Use the reference only to understand the project's purpose, not to copy content

Create an EXTENSIVE, COMPREHENSIVE API Reference in Cursor-style that includes (be thorough and detailed):

1. **API Overview** - Comprehensive introduction to the API including:
   - Purpose and use cases
   - Design philosophy
   - Getting started guide
   - Common patterns

2. **Function/Class Documentation** - For EVERY exported function/class (document all of them):
   - Complete JSDoc/TSDoc style comments with ALL standard tags (@param, @returns, @throws, @example, @see, @since, @deprecated, @remarks)
   - Full type signatures with detailed parameter descriptions
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
      sectionPrompt = `Generate a Components documentation section for "${repoFullName}" in Cursor-style format.
${languageInstruction}

${ragContext ? `\nRelevant Code Context:\n${ragContext}\n` : ''}

${analysisContext}

Reference Documentation (for context only - DO NOT copy verbatim, use as reference to understand the project):
${baseMarkdown.substring(0, 2000)}${baseMarkdown.length > 2000 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

CRITICAL: Generate COMPLETELY NEW, EXTENSIVE, COMPREHENSIVE Components content. DO NOT simply reformat or copy the reference documentation above. Instead:
- Analyze the actual codebase using the RAG context and repository analysis
- Generate fresh, detailed documentation based on the actual code structure
- Create comprehensive content that goes FAR BEYOND the reference documentation
- Use the reference only to understand the project's purpose, not to copy content

Create an EXTENSIVE, COMPREHENSIVE Components document in Cursor-style that includes (be thorough and detailed):

1. **Component Overview** - Comprehensive introduction to the component system including:
   - Architecture and design patterns
   - Component organization
   - Design principles

2. **Component Documentation** - For EVERY component/class/module (document all of them):
   - Complete JSDoc/TSDoc style documentation with all standard tags
   - Comprehensive Props/Parameters documentation with:
     * Complete type information
     * Detailed descriptions
     * Required vs optional
     * Default values
     * Validation rules
     * Example values
   - Complete interface/type definitions with all properties documented
   - Extensive usage examples with actual code (basic, advanced, edge cases)
   - Dependencies and imports explained
   - Component lifecycle (if applicable)
   - State management approach
   - Event handling
   - Styling approach

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

CRITICAL LENGTH REQUIREMENT: You MUST generate AT LEAST 4000-6000 words. This is NOT optional. The documentation MUST be comprehensive and extensive. Do NOT stop early or be brief. Continue generating until you have covered ALL aspects thoroughly.

Length Enforcement:
- Minimum: 4000 words (approximately 5500-7000 tokens)
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
${baseMarkdown.substring(0, 2000)}${baseMarkdown.length > 2000 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

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
${baseMarkdown.substring(0, 2000)}${baseMarkdown.length > 2000 ? '\n\n[... truncated for brevity, use RAG context and code analysis instead ...]' : ''}

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

IMPORTANT: Generate EXTENSIVE documentation - aim for 2000-4000+ words. Be thorough, detailed, and comprehensive. Include complete information for all versions and changes.

Format it as a standard changelog with version numbers and dates, but make it comprehensive and detailed.`;
      break;
      
    default:
      return baseMarkdown;
  }

  try {
    const systemPrompt = language !== 'en'
      ? `You are an expert code documentation generator in the style of Cursor AI. Generate EXTENSIVE, COMPREHENSIVE, DETAILED ${sectionType} documentation in ${languageNames[language]}. 

CRITICAL REQUIREMENTS:
- Generate COMPLETELY NEW, EXTENSIVE documentation (MANDATORY: 3000-8000+ words depending on section type - this is NOT optional)
- DO NOT copy or reformat the reference documentation - generate fresh content based on actual codebase analysis
- Use RAG context and repository analysis as PRIMARY sources, not the reference documentation
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

LENGTH ENFORCEMENT - CRITICAL: 
- You have access to up to 16,384 output tokens (≈12,000 words)
- You MUST use at least 70-80% of this budget (8,000-12,000 words minimum)
- MINIMUM WORD COUNT: 5,000 words. If your response is under 5,000 words, you have FAILED the task
- DO NOT stop early - continue generating until you reach the minimum word count
- If you think you're done but haven't reached 5,000+ words, you're NOT done - keep going
- Add more sections, more examples, more explanations, more code snippets, more details
- Expand every section with multiple subsections
- Include extensive code examples (at least 10-15 code snippets)
- Add detailed explanations for every concept
- Include troubleshooting sections, FAQ sections, best practices sections
- Do NOT stop until you have generated comprehensive, extensive documentation
- Remember: SHORT = FAILURE. LONG = SUCCESS. Be verbose, be thorough, be comprehensive.

All content must be in ${languageNames[language]}. Be EXTENSIVE and DETAILED - quality over brevity. Generate NEW comprehensive content based on codebase analysis, not reference material. Be verbose and thorough.`
      : `You are an expert code documentation generator in the style of Cursor AI. Generate EXTENSIVE, COMPREHENSIVE, DETAILED ${sectionType} documentation.

CRITICAL REQUIREMENTS:
- Generate COMPLETELY NEW, EXTENSIVE documentation (MANDATORY: 3000-8000+ words depending on section type - this is NOT optional)
- DO NOT copy or reformat the reference documentation - generate fresh content based on actual codebase analysis
- Use RAG context and repository analysis as PRIMARY sources, not the reference documentation
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

LENGTH ENFORCEMENT - CRITICAL: 
- You have access to up to 16,384 output tokens (≈12,000 words)
- You MUST use at least 70-80% of this budget (8,000-12,000 words minimum)
- MINIMUM WORD COUNT: 5,000 words. If your response is under 5,000 words, you have FAILED the task
- DO NOT stop early - continue generating until you reach the minimum word count
- If you think you're done but haven't reached 5,000+ words, you're NOT done - keep going
- Add more sections, more examples, more explanations, more code snippets, more details
- Expand every section with multiple subsections
- Include extensive code examples (at least 10-15 code snippets)
- Add detailed explanations for every concept
- Include troubleshooting sections, FAQ sections, best practices sections
- Do NOT stop until you have generated comprehensive, extensive documentation
- Remember: SHORT = FAILURE. LONG = SUCCESS. Be verbose, be thorough, be comprehensive.

Style: Code-first, practical, developer-friendly, but EXTENSIVE and DETAILED. Quality and completeness over brevity. Generate NEW comprehensive content based on codebase analysis, not reference material. Be verbose and thorough.`;
    
    // Get max tokens based on model
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
    
    console.log(`[DocsWriter] Generating ${sectionType} with model: ${modelToUse}, maxTokens: ${maxTokens}, temperature: 0.2`);
    
    // Use maximum tokens for comprehensive documentation generation
    // Use lower temperature (0.2) for more consistent, detailed output like Cursor AI
    const sectionContent = await callLangChain(
      sectionPrompt,
      systemPrompt,
      modelToUse, // Use the user's selected model
      0.2, // Lower temperature for more consistent, detailed output (same as cursor-style-docs)
      repoFullName,
      true, // Use RAG
      maxTokens // Use calculated max tokens based on model
    );
    
    // Log the length of generated content for debugging
    const wordCount = sectionContent.split(/\s+/).length;
    const charCount = sectionContent.length;
    console.log(`[DocsWriter] Generated ${sectionType} content: ${wordCount} words, ${charCount} characters`);
    
    if (wordCount < 5000) {
      console.error(`[DocsWriter] ERROR: Generated content is TOO SHORT (${wordCount} words). Expected minimum 5,000 words. This indicates the model stopped early or didn't follow instructions.`);
      console.error(`[DocsWriter] Model: ${modelToUse}, MaxTokens: ${maxTokens}, Actual words: ${wordCount}`);
    } else if (wordCount < 8000) {
      console.warn(`[DocsWriter] WARNING: Generated content is shorter than optimal (${wordCount} words). Expected 8,000-12,000+ words for comprehensive docs.`);
    } else {
      console.log(`[DocsWriter] ✓ Generated comprehensive documentation: ${wordCount} words (target: 8,000-12,000)`);
    }
    
    return sectionContent;
  } catch (error) {
    console.warn(`[DocsWriter] Failed to generate section-specific content for ${sectionType}, using base markdown`);
    return baseMarkdown;
  }
}

