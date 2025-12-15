/**
 * Refactor Proposal Agent
 * Generates intelligent folder structure refactor proposals
 */

import { AgentState, AgentStep } from './types';
import { generateRefactorProposal } from '../refactor-proposal';

export async function refactorProposalAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log('[RefactorProposal] Starting refactor proposal generation...');
  
  const updates: Partial<AgentState> = {
    currentStep: AgentStep.REFACTOR,
    refactorProposals: new Map(),
  };

  if (!state.repoAnalyses || state.repoAnalyses.size === 0) {
    console.warn('[RefactorProposal] No repository analyses available, skipping');
    return updates;
  }

  const refactorProposals = new Map();
  let current = 0;
  const total = state.repoAnalyses.size;

  for (const [repoName, repoAnalysis] of state.repoAnalyses.entries()) {
    try {
      current++;
      updates.progress = {
        current,
        total,
        currentRepo: repoName,
        currentAgent: 'RefactorProposal',
      };

      console.log(`[RefactorProposal] Generating proposal for ${repoName} (${current}/${total})`);

      // Generate refactor proposal
      const proposal = await generateRefactorProposal(repoAnalysis.repo, repoAnalysis);
      refactorProposals.set(repoName, proposal);

      console.log(`[RefactorProposal] Generated ${proposal.moves.length} moves for ${repoName}`);
    } catch (error: any) {
      console.error(`[RefactorProposal] Error generating proposal for ${repoName}:`, error);
      const errorKey = `refactor_${repoName}`;
      if (!updates.errors) updates.errors = new Map();
      updates.errors.set(errorKey, error.message || 'Refactor proposal generation failed');
    }
  }

  updates.refactorProposals = refactorProposals;
  updates.completedSteps = new Set([...(state.completedSteps || []), AgentStep.REFACTOR]);
  updates.progress = {
    current: total,
    total,
    currentAgent: 'RefactorProposal',
  };

  console.log(`[RefactorProposal] Completed proposals for ${refactorProposals.size} repositories`);
  return updates;
}

