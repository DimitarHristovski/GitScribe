/**
 * GitOps Agent
 * Handles Git operations - commits documentation to repositories
 */

import { AgentState, AgentStep, CommitResult } from './types';
import { createOrUpdateFile } from '../github-service';
import { getGitHubToken } from '../github-service';

export async function gitOpsAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log('[GitOps] Starting Git operations...');
  
  const updates: Partial<AgentState> = {
    currentStep: AgentStep.GITOPS,
    commitResults: new Map(),
  };

  if (!state.generatedDocs || state.generatedDocs.size === 0) {
    updates.errors = new Map([['gitops', 'No generated documentation to commit']]);
    return updates;
  }

  const token = getGitHubToken();
  if (!token) {
    updates.errors = new Map([['gitops', 'GitHub token required for commits']]);
    return updates;
  }

  const options = state.options || {};
  const commitMessage = options.commitMessage || 'docs: Add auto-generated documentation';
  const branch = options.branch || 'main';
  const autoCommit = options.autoCommit !== false; // Default to true

  if (!autoCommit) {
    console.log('[GitOps] Auto-commit disabled, skipping Git operations');
    updates.completedSteps = new Set([...(state.completedSteps || []), AgentStep.GITOPS]);
    return updates;
  }

  const results = new Map<string, CommitResult>();
  let current = 0;
  const total = state.generatedDocs.size;

  for (const [repoFullName, documentation] of state.generatedDocs.entries()) {
    try {
      current++;
      updates.progress = {
        current,
        total,
        currentRepo: repoFullName,
        currentAgent: 'GitOps',
      };

      console.log(`[GitOps] Committing docs to ${repoFullName} (${current}/${total})`);

      // Find the repo object
      const repo = state.discoveredRepos?.find((r) => r.fullName === repoFullName);
      if (!repo) {
        throw new Error('Repository not found');
      }

      const [owner, repoName] = repoFullName.split('/');

      // Commit documentation
      const result = await createOrUpdateFile(
        owner,
        repoName,
        'DOCUMENTATION.md',
        documentation,
        commitMessage,
        branch,
        token
      );

      results.set(repoFullName, {
        repo,
        success: true,
        commitSha: result.commit.sha,
        commitUrl: result.commit.html_url,
      });

      console.log(`[GitOps] Successfully committed to ${repoFullName}: ${result.commit.html_url}`);
    } catch (error: any) {
      console.error(`[GitOps] Error committing to ${repoFullName}:`, error);
      const repo = state.discoveredRepos?.find((r) => r.fullName === repoFullName);
      results.set(repoFullName, {
        repo: repo!,
        success: false,
        error: error.message || 'Commit failed',
      });
    }
  }

  updates.commitResults = results;
  updates.completedSteps = new Set([...(state.completedSteps || []), AgentStep.GITOPS]);
  updates.progress = {
    current: total,
    total,
    currentAgent: 'GitOps',
  };

  const successCount = Array.from(results.values()).filter((r) => r.success).length;
  console.log(`[GitOps] Completed: ${successCount}/${total} successful commits`);
  return updates;
}

