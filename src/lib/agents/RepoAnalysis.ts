/**
 * RepoAnalysis Agent
 * Analyzes repository structure, tech stack, and complexity
 */

import { AgentState, AgentStep, RepoAnalysis as RepoAnalysisType } from './types';
import { fetchGitHubFile, listGitHubContents } from '../github-service';
import { getGitHubToken } from '../github-service';
import { callLangChain } from '../langchain-service';
import { indexRepository } from '../../rag/index';

export async function repoAnalysisAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log('[RepoAnalysis] Starting repository analysis...');
  
  const updates: Partial<AgentState> = {
    currentStep: AgentStep.ANALYSIS,
    repoAnalyses: new Map(),
  };

  if (!state.discoveredRepos || state.discoveredRepos.length === 0) {
    updates.errors = new Map([['analysis', 'No repositories to analyze']]);
    return updates;
  }

  const token = getGitHubToken();
  const analyses = new Map<string, RepoAnalysisType>();
  const total = state.discoveredRepos.length;
  let completed = 0;

  // Process all repositories in parallel
  const analysisPromises = state.discoveredRepos.map(async (repo) => {
    try {
      console.log(`[RepoAnalysis] Starting analysis for ${repo.fullName}`);

      const [owner, repoName] = repo.fullName.split('/');
      const branch = repo.defaultBranch || 'main';

      // Fetch key files
      const [readme, packageJson, rootContents] = await Promise.all([
        fetchGitHubFile(owner, repoName, 'README.md', branch, token || undefined).catch(() => null),
        fetchGitHubFile(owner, repoName, 'package.json', branch, token || undefined).catch(() => null),
        listGitHubContents(owner, repoName, '', branch, token || undefined).catch(() => []),
      ]);

      // Parse package.json if available
      let packageData: any = null;
      if (packageJson) {
        try {
          packageData = JSON.parse(packageJson);
        } catch (e) {
          console.warn(`[RepoAnalysis] Failed to parse package.json for ${repo.fullName}`);
        }
      }

      // Analyze structure
      const languages: string[] = [];
      const frameworks: string[] = [];
      const mainFiles: string[] = [];

      if (packageData) {
        if (packageData.dependencies) {
          const deps = Object.keys(packageData.dependencies);
          // Detect frameworks
          if (deps.includes('react')) frameworks.push('React');
          if (deps.includes('vue')) frameworks.push('Vue');
          if (deps.includes('angular')) frameworks.push('Angular');
          if (deps.includes('next')) frameworks.push('Next.js');
          if (deps.includes('express')) frameworks.push('Express');
          if (deps.includes('fastify')) frameworks.push('Fastify');
        }
        languages.push(packageData.language || 'JavaScript');
      }

      // Detect languages from file extensions
      const fileExtensions = new Set<string>();
      rootContents.forEach((item) => {
        if (item.type === 'file') {
          const ext = item.name.split('.').pop()?.toLowerCase();
          if (ext) fileExtensions.add(ext);
        }
      });

      if (fileExtensions.has('ts') || fileExtensions.has('tsx')) languages.push('TypeScript');
      if (fileExtensions.has('js') || fileExtensions.has('jsx')) languages.push('JavaScript');
      if (fileExtensions.has('py')) languages.push('Python');
      if (fileExtensions.has('java')) languages.push('Java');
      if (fileExtensions.has('go')) languages.push('Go');
      if (fileExtensions.has('rs')) languages.push('Rust');

      // Get main files
      rootContents.forEach((item) => {
        if (item.type === 'file' && !item.name.startsWith('.')) {
          mainFiles.push(item.name);
        }
      });

      // Use AI to generate summary and key features
      let summary = '';
      let keyFeatures: string[] = [];
      let techStack: string[] = [...languages, ...frameworks];
      let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';

      try {
        const analysisPrompt = `Analyze this GitHub repository and provide insights:

Repository: ${repo.fullName}
Description: ${repo.description || 'No description'}
Language: ${repo.language || languages.join(', ') || 'Unknown'}
Has README: ${readme ? 'Yes' : 'No'}
Has package.json: ${packageData ? 'Yes' : 'No'}
Main files: ${mainFiles.slice(0, 10).join(', ')}

${packageData ? `Package.json dependencies: ${Object.keys(packageData.dependencies || {}).slice(0, 20).join(', ')}` : ''}

Provide:
1. A brief summary (2-3 sentences) of what this repository does
2. 3-5 key features or capabilities
3. The primary tech stack
4. Complexity level (simple/moderate/complex)

Format as JSON:
{
  "summary": "...",
  "keyFeatures": ["...", "..."],
  "techStack": ["...", "..."],
  "complexity": "simple|moderate|complex"
}`;

        // Index repository for RAG (async, don't wait)
        indexRepository(repo).catch(err => 
          console.warn(`[RepoAnalysis] RAG indexing failed for ${repo.fullName}:`, err)
        );

        const aiAnalysis = await callLangChain(
          analysisPrompt,
          'You are a technical analyst. Provide concise, accurate analysis of code repositories.',
          'gpt-4o-mini',
          0.3,
          repo.fullName,
          true // Use RAG
        );

        // Parse AI response
        try {
          const parsed = JSON.parse(aiAnalysis);
          summary = parsed.summary || '';
          keyFeatures = parsed.keyFeatures || [];
          if (parsed.techStack) techStack = [...new Set([...techStack, ...parsed.techStack])];
          complexity = parsed.complexity || 'moderate';
        } catch (e) {
          // Fallback parsing
          summary = aiAnalysis.split('\n')[0] || `A ${repo.language || 'software'} project`;
        }
      } catch (error) {
        console.warn(`[RepoAnalysis] AI analysis failed for ${repo.fullName}, using fallback`);
        summary = repo.description || `A ${repo.language || 'software'} project`;
        keyFeatures = frameworks.length > 0 ? frameworks : ['General purpose'];
      }

      // Determine complexity based on structure
      if (!complexity || complexity === 'moderate') {
        const fileCount = rootContents.length;
        const hasTests = rootContents.some((f) => f.name.includes('test') || f.name.includes('spec'));
        const hasConfig = rootContents.some((f) => 
          f.name.includes('config') || f.name.includes('.json') || f.name.includes('.yaml')
        );

        if (fileCount < 10 && !hasTests && !hasConfig) {
          complexity = 'simple';
        } else if (fileCount > 50 || (hasTests && hasConfig && packageData)) {
          complexity = 'complex';
        } else {
          complexity = 'moderate';
        }
      }

      const analysis: RepoAnalysisType = {
        repo,
        structure: {
          languages: [...new Set(languages)],
          frameworks: [...new Set(frameworks)],
          hasReadme: !!readme,
          hasPackageJson: !!packageData,
          hasConfigFiles: rootContents.some((f) => f.name.includes('config')),
          mainFiles: mainFiles.slice(0, 20),
        },
        summary: summary || repo.description || `A ${repo.language || 'software'} project`,
        keyFeatures: keyFeatures.length > 0 ? keyFeatures : ['General purpose application'],
        techStack: [...new Set(techStack)],
        complexity,
      };

      completed++;
      updates.progress = {
        current: completed,
        total,
        currentRepo: repo.fullName,
        currentAgent: 'RepoAnalysis',
      };
      console.log(`[RepoAnalysis] Completed analysis for ${repo.fullName} (${completed}/${total})`);

      return { repoFullName: repo.fullName, analysis, error: null };
    } catch (error: any) {
      completed++;
      console.error(`[RepoAnalysis] Error analyzing ${repo.fullName}:`, error);
      updates.progress = {
        current: completed,
        total,
        currentRepo: repo.fullName,
        currentAgent: 'RepoAnalysis',
      };
      return { 
        repoFullName: repo.fullName, 
        analysis: null, 
        error: { key: `analysis_${repo.fullName}`, message: error.message || 'Analysis failed' }
      };
    }
  });

  // Wait for all analyses to complete
  const results = await Promise.all(analysisPromises);

  // Process results
  for (const result of results) {
    if (result.analysis) {
      analyses.set(result.repoFullName, result.analysis);
    } else if (result.error) {
      if (!updates.errors) updates.errors = new Map();
      updates.errors.set(result.error.key, result.error.message);
    }
  }

  updates.repoAnalyses = analyses;
  updates.completedSteps = new Set([...(state.completedSteps || []), AgentStep.ANALYSIS]);
  updates.progress = {
    current: state.discoveredRepos.length,
    total: state.discoveredRepos.length,
    currentAgent: 'RepoAnalysis',
  };

  console.log(`[RepoAnalysis] Completed analysis for ${analyses.size} repositories`);
  return updates;
}

