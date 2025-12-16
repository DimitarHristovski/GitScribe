/**
 * GitOps Agent
 * Handles Git operations (commits) for generated documentation
 */

import { AgentState, AgentStep } from './types';
import { createOrUpdateFile, getGitHubToken } from '../github-service';
import { GeneratedDocs } from '../../types/core';

export async function gitOpsAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log('[GitOps] Starting Git operations...');
  
  const updates: Partial<AgentState> = {
    currentStep: AgentStep.GITOPS,
  };

  if (!state.generatedDocsFull || state.generatedDocsFull.size === 0) {
    updates.errors = new Map([['gitops', 'No generated documentation to commit']]);
    return updates;
  }

  const token = getGitHubToken();
  if (!token) {
    updates.errors = new Map([['gitops', 'GitHub token required for Git operations']]);
    return updates;
  }

  const commits = new Map<string, { path: string; sha: string }[]>();
  let current = 0;
  const total = state.generatedDocsFull.size;

  for (const [repoFullName, generatedDocs] of state.generatedDocsFull.entries()) {
    try {
      current++;
      updates.progress = {
        current,
        total,
        currentRepo: repoFullName,
        currentAgent: 'GitOps',
      };

      console.log(`[GitOps] Committing documentation for ${repoFullName} (${current}/${total})`);

      const [owner, repoName] = repoFullName.split('/');
      const repoCommits: { path: string; sha: string }[] = [];

      // Commit all generated documentation sections
      for (const section of generatedDocs.sections) {
        let content = section.markdown || section.html || section.openapiYaml || '';
        if (!content) continue;

        let filePath = 'DOCUMENTATION.md';
        let commitMessage = `docs: Auto-generated ${section.type} documentation`;

        // Use format-specific file names
        if (section.format === 'openapi') {
          filePath = `docs/api/openapi.yaml`;
          commitMessage = `docs: Auto-generated OpenAPI spec for ${section.type}`;
        } else if (section.format === 'html') {
          filePath = `docs/${section.type.toLowerCase()}.html`;
          commitMessage = `docs: Auto-generated ${section.type} HTML documentation`;
        } else if (section.format === 'markdown_mermaid' || section.format === 'mdx') {
          filePath = `docs/${section.type.toLowerCase()}.${section.format === 'mdx' ? 'mdx' : 'md'}`;
          commitMessage = `docs: Auto-generated ${section.type} (${section.format}) documentation`;
        } else {
          filePath = `docs/${section.type.toLowerCase()}.md`;
          commitMessage = `docs: Auto-generated ${section.type} documentation`;
        }

        try {
          const result = await createOrUpdateFile(
            owner,
            repoName,
            filePath,
            content,
            commitMessage,
            'main',
            token
          );

          if (result?.commit?.sha) {
            repoCommits.push({
              path: filePath,
              sha: result.commit.sha,
            });
            console.log(`[GitOps] Committed ${filePath} for ${repoFullName} (SHA: ${result.commit.sha.substring(0, 7)})`);
          }
        } catch (err: any) {
          console.error(`[GitOps] Failed to commit ${filePath} for ${repoFullName}:`, err);
          const errorKey = `gitops_${repoFullName}_${filePath}`;
          if (!updates.errors) updates.errors = new Map();
          updates.errors.set(errorKey, err.message || 'Failed to commit file');
        }
      }

      if (repoCommits.length > 0) {
        commits.set(repoFullName, repoCommits);
        console.log(`[GitOps] Successfully committed ${repoCommits.length} files for ${repoFullName}`);
      }
    } catch (error: any) {
      console.error(`[GitOps] Error processing ${repoFullName}:`, error);
      const errorKey = `gitops_${repoFullName}`;
      if (!updates.errors) updates.errors = new Map();
      updates.errors.set(errorKey, error.message || 'Git operations failed');
    }
  }

  updates.completedSteps = new Set([...(state.completedSteps || []), AgentStep.GITOPS]);
  updates.commits = commits;
  updates.progress = {
    current: total,
    total,
    currentAgent: 'GitOps',
  };

  console.log(`[GitOps] Completed Git operations for ${commits.size} repositories`);
  return updates;
}

