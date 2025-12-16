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
  let current = 0;
  const total = state.documentationPlans.size;

  for (const [repoFullName, plan] of state.documentationPlans.entries()) {
    let baseMarkdown = '';
    try {
      current++;
      updates.progress = {
        current,
        total,
        currentRepo: repoFullName,
        currentAgent: 'DocsWriter',
      };

      console.log(`[DocsWriter] Generating docs for ${repoFullName} (${current}/${total})`);
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
        const sectionSpecificContent = await generateSectionSpecificContent(
          sectionType,
          githubUrl,
          baseMarkdown,
          repoAnalysis,
          plan,
          selectedLanguage
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

      generatedDocsMap.set(repoFullName, generatedDocs);

      // For backward compatibility, also store as markdown string (first markdown section)
      const firstMarkdownSection = sections.find(s => s.markdown);
      if (firstMarkdownSection?.markdown) {
        docs.set(repoFullName, firstMarkdownSection.markdown);
      } else if (sections.length > 0) {
        // Fallback: use any available content
        const firstSection = sections[0];
        const content = firstSection.markdown || firstSection.html || firstSection.openapiYaml || '';
        docs.set(repoFullName, content);
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
          generatedDocsMap.set(repoFullName, generatedDocs);
          docs.set(repoFullName, baseMarkdown);
          console.log(`[DocsWriter] Using baseMarkdown fallback for ${repoFullName}`);
        } else {
          console.error(`[DocsWriter] No documentation generated for ${repoFullName} - baseMarkdown is also empty`);
          // Still create an empty entry so the workflow knows we tried
          docs.set(repoFullName, `# ${plan.repo.name}\n\n*Documentation generation failed. Please check the console for errors.*`);
        }
      }
    } catch (error: any) {
      console.error(`[DocsWriter] Error generating docs for ${repoFullName}:`, error);
      const errorKey = `writing_${repoFullName}`;
      if (!updates.errors) updates.errors = new Map();
      updates.errors.set(errorKey, error.message || 'Documentation generation failed');
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
  language: DocLanguage = 'en'
): Promise<string> {
  const repoFullName = `${plan.repo.owner}/${plan.repo.name}`;
  
  // Get RAG context for better code understanding
  let ragContext = '';
  try {
    ragContext = await retrieveContext(
      `Generate ${sectionType} documentation for ${repoFullName}`,
      repoFullName,
      5
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
      sectionPrompt = `Generate a comprehensive README.md for the repository "${repoFullName}" in Cursor-style documentation format.
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

Create an EXTENSIVE, COMPREHENSIVE README that includes (be thorough and detailed):

1. **Project Title and Description** - Detailed overview with purpose, goals, and target audience
2. **Features** - Comprehensive list of key capabilities with detailed explanations and code references
3. **Installation/Setup** - Complete step-by-step setup instructions with prerequisites, dependencies, and troubleshooting
4. **Usage** - Extensive usage guide with multiple code examples from the actual codebase, different use cases, and scenarios
5. **API/Function Examples** - Detailed documentation of key functions/classes with:
   - Complete signatures and type information
   - Multiple usage examples (basic, advanced, edge cases)
   - Parameter descriptions with constraints
   - Return value explanations
   - Error handling examples
6. **Configuration** - Comprehensive configuration guide with all options explained
7. **Architecture Overview** - System design and component relationships. If including a "Project Structure" section, use the complete directory structure provided in the context above. Display it as a simple tree format with backticks (├──, └──) and brief inline comments, NOT verbose bullet points with descriptions. Show ALL files and directories - do NOT truncate.
8. **Contributing** - Detailed guidelines for contributors with workflow and standards
9. **License** - License information and usage terms
10. **Additional Sections** - FAQ, troubleshooting, known issues, roadmap, etc.

IMPORTANT: Generate EXTENSIVE documentation - aim for 3000-5000+ words. Be thorough, detailed, and comprehensive. Include multiple examples, detailed explanations, and complete information. Do not be brief - provide comprehensive documentation similar to major open-source projects.

Style: Write in a Cursor-like style - code-focused, practical, with real examples from the codebase. Include extensive code snippets that show actual usage patterns. Make it developer-friendly and actionable.`;
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

IMPORTANT: Generate EXTENSIVE documentation - aim for 4000-6000+ words. Be thorough, detailed, and comprehensive. Document everything - don't leave anything out. Include extensive code examples and detailed explanations.

Style: Code-first approach like Cursor AI. Show actual code structures, class hierarchies, and function relationships. Include extensive code examples that demonstrate the architecture.`;
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

IMPORTANT: Generate EXTENSIVE documentation - aim for 5000-8000+ words. Document EVERY function, class, interface, and type. Be thorough, detailed, and comprehensive. Include extensive examples and detailed explanations. Do not skip any API elements.

Style: Generate documentation similar to Cursor AI - include the actual code with inline documentation comments. Show complete function signatures, detailed parameter types, return types, and extensive practical examples. Make it code-first and developer-friendly.`;
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

IMPORTANT: Generate EXTENSIVE documentation - aim for 4000-6000+ words. Document EVERY component, prop, and type. Be thorough, detailed, and comprehensive. Include extensive examples and detailed explanations.

Style: Generate like Cursor AI - show the actual code with inline documentation. Include complete type information, detailed parameter descriptions, and extensive practical examples. Make it code-focused and practical.`;
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
- Generate COMPLETELY NEW, EXTENSIVE documentation (aim for 3000-8000+ words depending on section type)
- DO NOT copy or reformat the reference documentation - generate fresh content based on actual codebase analysis
- Use RAG context and repository analysis as PRIMARY sources, not the reference documentation
- Be THOROUGH and COMPREHENSIVE - do not be brief
- Document EVERYTHING - all functions, classes, types, interfaces, constants
- Include COMPLETE JSDoc/TSDoc style comments with ALL standard tags (@param, @returns, @throws, @example, @see, @since, @deprecated, @remarks)
- Provide MULTIPLE examples for each concept (basic, advanced, edge cases, error handling)
- Include detailed type information with complete parameter descriptions
- Explain design decisions and rationale, not just what but why
- Include performance considerations, security notes, and best practices
- Document internal functions and helpers, not just public APIs
- Provide extensive code examples from the actual codebase (use RAG context to find real code)
- Include troubleshooting guides and common issues
- Make it as comprehensive as professional API documentation (MDN, TypeScript Handbook level)
- ANALYZE THE ACTUAL CODEBASE - don't rely on reference documentation

All content must be in ${languageNames[language]}. Be EXTENSIVE and DETAILED - quality over brevity. Generate NEW comprehensive content based on codebase analysis, not reference material.`
      : `You are an expert code documentation generator in the style of Cursor AI. Generate EXTENSIVE, COMPREHENSIVE, DETAILED ${sectionType} documentation.

CRITICAL REQUIREMENTS:
- Generate COMPLETELY NEW, EXTENSIVE documentation (aim for 3000-8000+ words depending on section type)
- DO NOT copy or reformat the reference documentation - generate fresh content based on actual codebase analysis
- Use RAG context and repository analysis as PRIMARY sources, not the reference documentation
- Be THOROUGH and COMPREHENSIVE - do not be brief or concise
- Document EVERYTHING - all functions, classes, types, interfaces, constants, utilities
- Include COMPLETE JSDoc/TSDoc style comments with ALL standard tags (@param, @returns, @throws, @example, @see, @since, @deprecated, @remarks)
- Provide MULTIPLE examples for each concept (basic, advanced, edge cases, error handling, integration)
- Include detailed type information with complete parameter descriptions including constraints and valid ranges
- Explain design decisions and rationale - explain both "what" and "why"
- Include performance considerations, security notes, scalability concerns, and best practices
- Document internal functions and helpers, not just public APIs
- Provide extensive code examples from the actual codebase (use RAG context to find real code)
- Include troubleshooting guides, common issues, and solutions
- Make it as comprehensive as professional API documentation (MDN, TypeScript Handbook, major open-source projects level)
- ANALYZE THE ACTUAL CODEBASE - don't rely on reference documentation

Style: Code-first, practical, developer-friendly, but EXTENSIVE and DETAILED. Quality and completeness over brevity. Generate NEW comprehensive content based on codebase analysis, not reference material.`;
    
    const sectionContent = await callLangChain(
      sectionPrompt,
      systemPrompt,
      'gpt-4o',
      0.2, // Lower temperature for more consistent, detailed output
      repoFullName,
      true // Use RAG
    );
    
    return sectionContent;
  } catch (error) {
    console.warn(`[DocsWriter] Failed to generate section-specific content for ${sectionType}, using base markdown`);
    return baseMarkdown;
  }
}

