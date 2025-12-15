/**
 * Folder Refactor Proposal Generator
 * Analyzes repository structure and proposes intelligent refactoring moves
 */

import { SimpleRepo } from './github-service';
import { FolderRefactorProposal, RefactorMove } from '../types/core';
import { listGitHubContents, getGitHubToken } from './github-service';
import { callLangChainJSON } from './langchain-service';

/**
 * Generate a refactor proposal for a repository
 */
export async function generateRefactorProposal(
  repo: SimpleRepo,
  repoAnalysis?: any
): Promise<FolderRefactorProposal> {
  console.log(`[RefactorProposal] Generating proposal for ${repo.fullName}...`);

  const token = getGitHubToken();

  try {
    // Get repository structure
    const structure = await analyzeRepositoryStructure(repo, token);

    // Use AI to generate intelligent refactor proposal
    const proposal = await generateAIProposal(repo, structure, repoAnalysis);

    return proposal;
  } catch (error: any) {
    console.error(`[RefactorProposal] Error generating proposal:`, error);
    return {
      repoName: repo.fullName,
      highLevelSummary: 'Unable to generate refactor proposal due to analysis error.',
      recommendedStructure: [],
      moves: [],
      warnings: [error.message || 'Analysis failed'],
    };
  }
}

/**
 * Analyze repository structure recursively
 */
async function analyzeRepositoryStructure(
  repo: SimpleRepo,
  token: string | null,
  path: string = '',
  depth: number = 0,
  maxDepth: number = 3
): Promise<{ path: string; type: 'file' | 'dir'; size?: number; children?: any[] }[]> {
  if (depth > maxDepth) return [];

  try {
    const contents = await listGitHubContents(repo.owner, repo.name, path, repo.defaultBranch, token);
    const structure: any[] = [];

    for (const item of contents) {
      const itemPath = path ? `${path}/${item.name}` : item.name;
      const itemData: any = {
        path: itemPath,
        type: item.type,
        size: item.size,
      };

      if (item.type === 'dir' && depth < maxDepth) {
        itemData.children = await analyzeRepositoryStructure(
          repo,
          token,
          itemPath,
          depth + 1,
          maxDepth
        );
      }

      structure.push(itemData);
    }

    return structure;
  } catch (error) {
    console.warn(`[RefactorProposal] Error analyzing path ${path}:`, error);
    return [];
  }
}

/**
 * Generate AI-powered refactor proposal
 */
async function generateAIProposal(
  repo: SimpleRepo,
  structure: any[],
  repoAnalysis?: any
): Promise<FolderRefactorProposal> {
  const structureJson = JSON.stringify(structure, null, 2);
  const analysisJson = repoAnalysis ? JSON.stringify(repoAnalysis, null, 2) : 'N/A';

  const prompt = `Analyze this GitHub repository structure and generate an intelligent refactor proposal.

Repository: ${repo.fullName}
${repo.description ? `Description: ${repo.description}` : ''}

Current Structure:
${structureJson}

${repoAnalysis ? `Repository Analysis:\n${analysisJson}` : ''}

Generate a refactor proposal that:
1. Improves code organization and maintainability
2. Follows best practices for the detected tech stack
3. Groups related files logically
4. Separates concerns (src, tests, docs, config)
5. Makes the repository more intuitive for new contributors

Return a JSON object with this structure:
{
  "highLevelSummary": "Brief summary of the refactoring goals",
  "recommendedStructure": [
    {
      "folder": "src/components",
      "description": "Purpose of this folder"
    }
  ],
  "moves": [
    {
      "fromPath": "old/path/file.js",
      "toPath": "new/path/file.js",
      "reason": "Why this move improves organization"
    }
  ],
  "warnings": ["Any warnings about breaking changes or risks"]
}

Focus on:
- Moving files to appropriate folders (src/, lib/, tests/, docs/, etc.)
- Grouping related functionality
- Separating configuration from code
- Improving discoverability
- Following language/framework conventions

Be specific and actionable. Limit to 10-15 moves maximum.`;

  const systemPrompt = `You are an expert software architect specializing in repository structure and code organization. 
Generate practical, actionable refactoring proposals that improve maintainability without breaking functionality.`;

  try {
    const response = await callLangChainJSON<FolderRefactorProposal>(
      prompt,
      systemPrompt,
      'gpt-4o-mini',
      0.7
    );

    // Validate and ensure required fields
    return {
      repoName: repo.fullName,
      highLevelSummary: response.highLevelSummary || 'Repository structure refactoring proposal',
      recommendedStructure: Array.isArray(response.recommendedStructure)
        ? response.recommendedStructure
        : [],
      moves: Array.isArray(response.moves) ? response.moves : [],
      warnings: Array.isArray(response.warnings) ? response.warnings : [],
    };
  } catch (error: any) {
    // Fallback to rule-based proposal if AI fails
    return generateRuleBasedProposal(repo, structure);
  }
}

/**
 * Generate a rule-based refactor proposal (fallback)
 */
function generateRuleBasedProposal(
  repo: SimpleRepo,
  structure: any[]
): FolderRefactorProposal {
  const moves: RefactorMove[] = [];
  const recommendedStructure: { folder: string; description: string }[] = [];
  const warnings: string[] = [];

  // Analyze current structure
  const rootFiles = structure.filter((s) => s.type === 'file');
  const rootDirs = structure.filter((s) => s.type === 'dir');

  // Check if src/ exists
  const hasSrc = rootDirs.some((d) => d.path.toLowerCase() === 'src');
  const hasLib = rootDirs.some((d) => d.path.toLowerCase() === 'lib' || d.path.toLowerCase() === 'libs');
  const hasTests = rootDirs.some((d) => d.path.toLowerCase().includes('test'));

  // Recommend src/ if missing and there are source files in root
  if (!hasSrc && rootFiles.length > 5) {
    recommendedStructure.push({
      folder: 'src',
      description: 'Main source code directory',
    });

    // Suggest moving source files to src/
    rootFiles.forEach((file) => {
      if (
        file.path.match(/\.(js|ts|jsx|tsx|py|java|go|rs|rb|php)$/i) &&
        !file.path.includes('test') &&
        !file.path.includes('spec')
      ) {
        moves.push({
          fromPath: file.path,
          toPath: `src/${file.path}`,
          reason: 'Organize source code into src/ directory',
        });
      }
    });
  }

  // Recommend tests/ if missing
  if (!hasTests) {
    recommendedStructure.push({
      folder: 'tests',
      description: 'Test files directory',
    });
  }

  // Recommend docs/ if missing
  const hasDocs = rootDirs.some((d) => d.path.toLowerCase().includes('doc'));
  if (!hasDocs) {
    recommendedStructure.push({
      folder: 'docs',
      description: 'Documentation directory',
    });
  }

  return {
    repoName: repo.fullName,
    highLevelSummary:
      moves.length > 0
        ? `Proposed ${moves.length} file moves to improve organization and follow best practices.`
        : 'Repository structure is already well-organized.',
    recommendedStructure,
    moves: moves.slice(0, 15), // Limit to 15 moves
    warnings: moves.length > 0 ? ['Review moves carefully before applying'] : [],
  };
}

