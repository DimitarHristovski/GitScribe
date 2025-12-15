/**
 * RepoDiscovery Agent
 * Discovers and validates repositories for documentation generation
 */

import { AgentState, AgentStep, RepoAnalysis } from './types';
import { SimpleRepo, fetchUserRepos, parseGitHubUrl } from '../github-service';

export async function repoDiscoveryAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log('[RepoDiscovery] Starting repository discovery...');
  
  const updates: Partial<AgentState> = {
    currentStep: AgentStep.DISCOVERY,
    progress: {
      current: 0,
      total: 1,
      currentAgent: 'RepoDiscovery',
    },
  };

  try {
    // If repos are already selected, validate them
    if (state.selectedRepos && state.selectedRepos.length > 0) {
      console.log('[RepoDiscovery] Validating', state.selectedRepos.length, 'selected repositories');
      
      // Validate each repo
      const validatedRepos: SimpleRepo[] = [];
      for (const repo of state.selectedRepos) {
        try {
          // Basic validation - repo should have required fields
          if (repo.fullName && repo.owner && repo.name) {
            validatedRepos.push(repo);
          }
        } catch (error) {
          console.warn(`[RepoDiscovery] Invalid repo: ${repo.fullName}`, error);
        }
      }
      
      if (validatedRepos.length > 0) {
        updates.discoveredRepos = validatedRepos;
        updates.completedSteps = new Set([AgentStep.DISCOVERY]);
        updates.progress = {
          current: 1,
          total: 1,
          currentAgent: 'RepoDiscovery',
        };
        
        console.log('[RepoDiscovery] Validated', validatedRepos.length, 'repositories');
      } else {
        // Mark as completed even with error so workflow can handle it properly
        updates.completedSteps = new Set([AgentStep.DISCOVERY]);
        updates.errors = new Map([['discovery', 'No valid repositories found']]);
        console.warn('[RepoDiscovery] No valid repositories after validation');
      }
    } else {
      // Try to fetch user repos if no repos selected
      try {
        const userRepos = await fetchUserRepos({ perPage: 100 });
        if (userRepos && userRepos.length > 0) {
          updates.discoveredRepos = userRepos;
          updates.completedSteps = new Set([AgentStep.DISCOVERY]);
          updates.progress = {
            current: 1,
            total: 1,
            currentAgent: 'RepoDiscovery',
          };
          console.log('[RepoDiscovery] Discovered', userRepos.length, 'user repositories');
        } else {
          // Mark as completed even with error so workflow can handle it properly
          updates.completedSteps = new Set([AgentStep.DISCOVERY]);
          updates.errors = new Map([['discovery', 'No repositories found']]);
          console.warn('[RepoDiscovery] No repositories found');
        }
      } catch (error: any) {
        console.error('[RepoDiscovery] Failed to fetch user repos:', error);
        // Mark as completed even with error so workflow can handle it properly
        updates.completedSteps = new Set([AgentStep.DISCOVERY]);
        updates.errors = new Map([['discovery', error.message || 'Failed to discover repositories']]);
      }
    }
  } catch (error: any) {
    console.error('[RepoDiscovery] Error:', error);
    // Mark as completed even with error so workflow can handle it properly
    updates.completedSteps = new Set([AgentStep.DISCOVERY]);
    updates.errors = new Map([['discovery', error.message || 'Discovery failed']]);
  }

  return updates;
}

