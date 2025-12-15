/**
 * DocsWriter Agent
 * Generates comprehensive documentation for each repository in multiple formats
 */

import { AgentState, AgentStep } from './types';
import { generateDocumentationFromGitHub } from '../documentation-writer';
import { getGitHubToken } from '../github-service';
import { generateFormatDocumentation } from '../format-generators';
import { DocOutputFormat, DocSectionType, GeneratedDocs, DocSection, DocLanguage } from '../../types/core';
import { callLangChain } from '../langchain-service';
import { DocumentationPlan } from './types';

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
  const repoName = plan.repo.name;
  const repoFullName = `${plan.repo.owner}/${plan.repo.name}`;
  
  // Build context from repo analysis
  const analysisContext = repoAnalysis ? `
Repository Analysis:
- Summary: ${repoAnalysis.summary}
- Key Features: ${repoAnalysis.keyFeatures.join(', ')}
- Tech Stack: ${repoAnalysis.techStack.join(', ')}
- Frameworks: ${repoAnalysis.structure?.frameworks?.join(', ') || 'Unknown'}
- Languages: ${repoAnalysis.structure?.languages?.join(', ') || 'Unknown'}
- Complexity: ${repoAnalysis.complexity}
- Main Files: ${repoAnalysis.structure?.mainFiles?.slice(0, 10).join(', ') || 'Unknown'}
` : '';

  // Language mapping for prompts
  const languageNames: Record<DocLanguage, string> = {
    en: 'English',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    es: 'Spanish',
  };

  const languageInstruction = language !== 'en' 
    ? `\n\nIMPORTANT: Generate all content in ${languageNames[language]}. All text, descriptions, and explanations must be in ${languageNames[language]}.`
    : '';

  // Create section-specific prompts
  let sectionPrompt = '';
  
  switch (sectionType) {
    case 'README':
      sectionPrompt = `Generate a comprehensive README.md for the repository "${repoFullName}".
${languageInstruction}

${analysisContext}

Base Documentation:
${baseMarkdown.substring(0, 2000)}

Create a README that includes:
1. **Project Title and Description** - Clear, concise overview
2. **Features** - Key capabilities and highlights
3. **Installation/Setup** - Step-by-step setup instructions
4. **Usage** - How to use the project with examples
5. **Configuration** - Any configuration needed
6. **Contributing** - Guidelines for contributors
7. **License** - License information if available

Make it welcoming, clear, and comprehensive. Focus on helping new users understand and use the project.`;
      break;
      
    case 'ARCHITECTURE':
      sectionPrompt = `Generate an Architecture documentation section for "${repoFullName}".
${languageInstruction}

${analysisContext}

Base Documentation:
${baseMarkdown.substring(0, 2000)}

Create an Architecture document that includes:
1. **System Overview** - High-level architecture description
2. **Component Structure** - Breakdown of major components/modules
3. **Data Flow** - How data moves through the system
4. **Technology Stack** - Detailed tech stack explanation
5. **Directory Structure** - Key directories and their purposes
6. **Design Patterns** - Patterns and principles used
7. **Dependencies** - Key dependencies and their roles

Focus on technical depth, diagrams descriptions, and system design.`;
      break;
      
    case 'API':
      sectionPrompt = `Generate an API Reference documentation for "${repoFullName}".
${languageInstruction}

${analysisContext}

Base Documentation:
${baseMarkdown.substring(0, 2000)}

Create an API Reference that includes:
1. **API Overview** - Introduction to the API
2. **Authentication** - How to authenticate (if applicable)
3. **Base URL** - API endpoint base URL
4. **Endpoints** - Detailed endpoint documentation with:
   - HTTP Method (GET, POST, PUT, DELETE, etc.)
   - Endpoint path
   - Request parameters
   - Request body schema
   - Response schema
   - Example requests/responses
5. **Error Handling** - Error codes and messages
6. **Rate Limiting** - Rate limits if applicable

Focus on practical API usage with code examples.`;
      break;
      
    case 'COMPONENTS':
      sectionPrompt = `Generate a Components documentation section for "${repoFullName}".
${languageInstruction}

${analysisContext}

Base Documentation:
${baseMarkdown.substring(0, 2000)}

Create a Components document that includes:
1. **Component Overview** - Introduction to the component system
2. **Component List** - List of major components/modules
3. **Component Details** - For each component:
   - Purpose and responsibility
   - Props/Parameters
   - Usage examples
   - Dependencies
4. **Component Hierarchy** - How components relate to each other
5. **Props/Configuration** - Detailed prop/parameter documentation

Focus on reusability, props, and usage patterns.`;
      break;
      
    case 'TESTING_CI':
      sectionPrompt = `Generate a Testing & CI/CD documentation section for "${repoFullName}".
${languageInstruction}

${analysisContext}

Base Documentation:
${baseMarkdown.substring(0, 2000)}

Create a Testing & CI/CD document that includes:
1. **Testing Strategy** - Overview of testing approach
2. **Test Setup** - How to set up and run tests
3. **Test Types** - Unit tests, integration tests, e2e tests
4. **CI/CD Pipeline** - Continuous integration/deployment setup
5. **Running Tests** - Commands and instructions
6. **Coverage** - Test coverage information
7. **Deployment** - Deployment process and environments

Focus on practical testing and deployment workflows.`;
      break;
      
    case 'CHANGELOG':
      sectionPrompt = `Generate a Changelog documentation for "${repoFullName}".
${languageInstruction}

${analysisContext}

Base Documentation:
${baseMarkdown.substring(0, 2000)}

Create a Changelog that includes:
1. **Version History** - List of versions with dates
2. **Change Categories** - Added, Changed, Deprecated, Removed, Fixed, Security
3. **Recent Changes** - Most recent version changes in detail
4. **Migration Guides** - Breaking changes and migration steps
5. **Release Notes** - Summary of major releases

Format it as a standard changelog with version numbers and dates.`;
      break;
      
    default:
      return baseMarkdown;
  }

  try {
    const systemPrompt = language !== 'en'
      ? `You are an expert technical writer. Generate comprehensive, accurate ${sectionType} documentation in ${languageNames[language]} based on the repository information provided. Be specific, include examples, and make it practical for developers. All content must be in ${languageNames[language]}.`
      : `You are an expert technical writer. Generate comprehensive, accurate ${sectionType} documentation based on the repository information provided. Be specific, include examples, and make it practical for developers.`;
    
    const sectionContent = await callLangChain(
      sectionPrompt,
      systemPrompt,
      'gpt-4o-mini',
      0.5
    );
    
    return sectionContent;
  } catch (error) {
    console.warn(`[DocsWriter] Failed to generate section-specific content for ${sectionType}, using base markdown`);
    return baseMarkdown;
  }
}

