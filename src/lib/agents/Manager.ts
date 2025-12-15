/**
 * Manager Agent & Graph Orchestration
 * Manages the agent workflow and state transitions
 */

import { AgentState, AgentStep, AgentNode, GraphEdge } from './types';
import { repoDiscoveryAgent } from './RepoDiscovery';
import { repoAnalysisAgent } from './RepoAnalysis';
import { qualityAnalyzerAgent } from './QualityAnalyzer';
import { refactorProposalAgent } from './RefactorProposal';
import { docsPlannerAgent } from './DocsPlanner';
import { docsWriterAgent } from './DocsWriter';
import { gitOpsAgent } from './GitOps';

/**
 * Agent Graph Definition
 */
export const agentGraph: GraphEdge[] = [
  { from: AgentStep.DISCOVERY, to: AgentStep.ANALYSIS },
  { from: AgentStep.ANALYSIS, to: AgentStep.QUALITY },
  { from: AgentStep.QUALITY, to: AgentStep.REFACTOR },
  { from: AgentStep.REFACTOR, to: AgentStep.PLANNING },
  { from: AgentStep.PLANNING, to: AgentStep.WRITING },
  { from: AgentStep.WRITING, to: AgentStep.GITOPS },
  { from: AgentStep.GITOPS, to: AgentStep.COMPLETE },
];

/**
 * Agent Nodes
 */
export const agentNodes: Map<AgentStep, AgentNode> = new Map([
  [
    AgentStep.DISCOVERY,
    {
      name: 'RepoDiscovery',
      execute: repoDiscoveryAgent,
      shouldRun: (state) => {
        // Always run DISCOVERY if it hasn't been completed and we have repos
        const hasCompleted = state.completedSteps?.has(AgentStep.DISCOVERY) || false;
        const hasRepos = state.selectedRepos && state.selectedRepos.length > 0;
        console.log(`[Manager] DISCOVERY shouldRun check:`, { hasCompleted, hasRepos, selectedReposCount: state.selectedRepos?.length || 0 });
        return !hasCompleted && hasRepos;
      },
    },
  ],
  [
    AgentStep.ANALYSIS,
    {
      name: 'RepoAnalysis',
      execute: repoAnalysisAgent,
      shouldRun: (state) => 
        state.completedSteps?.has(AgentStep.DISCOVERY) && 
        !state.completedSteps?.has(AgentStep.ANALYSIS) &&
        !!state.discoveredRepos && state.discoveredRepos.length > 0,
    },
  ],
  [
    AgentStep.QUALITY,
    {
      name: 'QualityAnalyzer',
      execute: qualityAnalyzerAgent,
      shouldRun: (state) =>
        state.completedSteps?.has(AgentStep.ANALYSIS) &&
        !state.completedSteps?.has(AgentStep.QUALITY) &&
        !!state.repoAnalyses && state.repoAnalyses.size > 0,
    },
  ],
  [
    AgentStep.REFACTOR,
    {
      name: 'RefactorProposal',
      execute: refactorProposalAgent,
      shouldRun: (state) =>
        state.completedSteps?.has(AgentStep.QUALITY) &&
        !state.completedSteps?.has(AgentStep.REFACTOR) &&
        !!state.repoAnalyses && state.repoAnalyses.size > 0,
    },
  ],
  [
    AgentStep.PLANNING,
    {
      name: 'DocsPlanner',
      execute: docsPlannerAgent,
      shouldRun: (state) =>
        state.completedSteps?.has(AgentStep.REFACTOR) &&
        !state.completedSteps?.has(AgentStep.PLANNING) &&
        !!state.repoAnalyses && state.repoAnalyses.size > 0,
    },
  ],
  [
    AgentStep.WRITING,
    {
      name: 'DocsWriter',
      execute: docsWriterAgent,
      shouldRun: (state) =>
        state.completedSteps?.has(AgentStep.PLANNING) &&
        !state.completedSteps?.has(AgentStep.WRITING) &&
        !!state.documentationPlans && state.documentationPlans.size > 0,
    },
  ],
  [
    AgentStep.GITOPS,
    {
      name: 'GitOps',
      execute: gitOpsAgent,
      shouldRun: (state) =>
        state.completedSteps?.has(AgentStep.WRITING) &&
        !state.completedSteps?.has(AgentStep.GITOPS) &&
        !!state.generatedDocs && state.generatedDocs.size > 0,
    },
  ],
]);

/**
 * Get next step in the workflow
 */
export function getNextStep(currentStep: AgentStep, state: AgentState): AgentStep | null {
  const edge = agentGraph.find((e) => e.from === currentStep);
  if (!edge) return null;

  // Check condition if present
  if (edge.condition && !edge.condition(state)) {
    return null;
  }

  return edge.to;
}

/**
 * Manager Agent - Orchestrates the entire workflow
 */
export class AgentManager {
  private state: AgentState;
  private onStateUpdate?: (state: AgentState) => void;
  private onProgress?: (progress: AgentState['progress']) => void;

  constructor(
    initialState: AgentState,
    onStateUpdate?: (state: AgentState) => void,
    onProgress?: (progress: AgentState['progress']) => void
  ) {
    this.state = { ...initialState };
    this.onStateUpdate = onStateUpdate;
    this.onProgress = onProgress;
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<AgentState>): void {
    this.state = {
      ...this.state,
      ...updates,
      completedSteps: new Set([
        ...(this.state.completedSteps || []),
        ...(updates.completedSteps || []),
      ]),
      errors: new Map([
        ...(this.state.errors || []),
        ...(updates.errors || []),
      ]),
    };

    if (this.onStateUpdate) {
      this.onStateUpdate(this.state);
    }

    if (this.onProgress && updates.progress) {
      this.onProgress(updates.progress);
    }
  }

  /**
   * Execute a single agent step
   */
  async executeStep(step: AgentStep): Promise<boolean> {
    const node = agentNodes.get(step);
    if (!node) {
      throw new Error(`No agent node found for step: ${step}`);
    }

    // Check if should run
    if (node.shouldRun && !node.shouldRun(this.state)) {
      console.log(`[Manager] Skipping ${node.name} - conditions not met`);
      console.log(`[Manager] State check:`, {
        completedSteps: Array.from(this.state.completedSteps || []),
        hasDiscoveredRepos: !!this.state.discoveredRepos && this.state.discoveredRepos.length > 0,
        hasRepoAnalyses: !!this.state.repoAnalyses && this.state.repoAnalyses.size > 0,
      });
      return false; // Return false to indicate step was skipped
    }

    console.log(`[Manager] Executing ${node.name}...`);
    const updates = await node.execute(this.state);
    this.updateState(updates);
    return true; // Return true to indicate step was executed
  }

  /**
   * Run the complete workflow
   */
  async run(): Promise<AgentState> {
    console.log('[Manager] Starting agent workflow...');
    console.log('[Manager] Initial state:', {
      selectedRepos: this.state.selectedRepos?.length || 0,
      completedSteps: Array.from(this.state.completedSteps || []),
    });
    
    // Initialize with DISCOVERY step
    this.updateState({
      currentStep: AgentStep.DISCOVERY,
    });
    
    let currentStep: AgentStep | null = AgentStep.DISCOVERY;
    let previousStep: AgentStep | null = null;
    let iterations = 0;
    const maxIterations = 20; // Prevent infinite loops

    while (currentStep && currentStep !== AgentStep.COMPLETE && iterations < maxIterations) {
      try {
        iterations++;
        previousStep = currentStep;
        
        console.log(`[Manager] === Iteration ${iterations}: Executing step ${currentStep} ===`);
        console.log(`[Manager] State before step:`, {
          completedSteps: Array.from(this.state.completedSteps || []),
          hasDiscoveredRepos: !!this.state.discoveredRepos && this.state.discoveredRepos.length > 0,
          hasRepoAnalyses: !!this.state.repoAnalyses && this.state.repoAnalyses.size > 0,
        });
        
        const stepExecuted = await this.executeStep(currentStep);
        
        console.log(`[Manager] Step ${currentStep} executed: ${stepExecuted}`);
        console.log(`[Manager] State after step:`, {
          completedSteps: Array.from(this.state.completedSteps || []),
          hasDiscoveredRepos: !!this.state.discoveredRepos && this.state.discoveredRepos.length > 0,
          hasRepoAnalyses: !!this.state.repoAnalyses && this.state.repoAnalyses.size > 0,
        });
        
        // Get next step based on current state
        const nextStep = getNextStep(currentStep, this.state);
        console.log(`[Manager] Next step from ${currentStep}:`, nextStep);
        
        // If step was executed and we have a next step, move forward
        if (stepExecuted && nextStep) {
          // Check if we're stuck (same step twice in a row)
          if (nextStep === currentStep) {
            console.warn(`[Manager] Workflow stuck at ${currentStep}, breaking`);
            break;
          }
          
          currentStep = nextStep;
          
          // Update state with new current step
          this.updateState({
            currentStep: currentStep,
          });
        } else if (!stepExecuted) {
          // Step was skipped - this shouldn't happen for DISCOVERY on first run
          console.error(`[Manager] Step ${currentStep} was skipped! This may indicate a problem.`);
          console.error(`[Manager] Current state:`, {
            completedSteps: Array.from(this.state.completedSteps || []),
            selectedRepos: this.state.selectedRepos?.length || 0,
          });
          
          // For DISCOVERY, if it was skipped, we have a problem
          if (currentStep === AgentStep.DISCOVERY) {
            throw new Error('DISCOVERY step was skipped - this should never happen on first run. Check that selectedRepos are provided.');
          }
          
          // For other steps, try to continue if we have a next step
          if (nextStep && nextStep !== currentStep) {
            console.log(`[Manager] Attempting to continue to ${nextStep} despite skip`);
            currentStep = nextStep;
            this.updateState({
              currentStep: currentStep,
            });
          } else {
            console.warn(`[Manager] Cannot proceed from ${currentStep}, breaking`);
            break;
          }
        } else {
          // Step executed but no next step - workflow complete
          console.log(`[Manager] No next step from ${currentStep}, completing workflow`);
          break;
        }
        
      } catch (error: any) {
        console.error(`[Manager] Error in step ${currentStep}:`, error);
        const errorKey = `manager_${currentStep}`;
        this.updateState({
          errors: new Map([[errorKey, error.message || 'Workflow error']]),
        });
        break;
      }
    }

    if (iterations >= maxIterations) {
      console.error('[Manager] Workflow exceeded max iterations, stopping');
      this.updateState({
        errors: new Map([['manager', 'Workflow exceeded maximum iterations']]),
      });
    }

    // Mark as complete
    this.updateState({
      currentStep: AgentStep.COMPLETE,
      completedSteps: new Set([...(this.state.completedSteps || []), AgentStep.COMPLETE]),
    });

    console.log('[Manager] Workflow completed');
    return this.state;
  }

  /**
   * Get current state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Reset workflow
   */
  reset(newState: Partial<AgentState>): void {
    this.state = {
      ...this.state,
      ...newState,
      currentStep: undefined,
      completedSteps: new Set(),
      errors: new Map(),
    };
  }
}

/**
 * Create and run agent workflow
 */
export async function runAgentWorkflow(
  initialState: AgentState,
  onStateUpdate?: (state: AgentState) => void,
  onProgress?: (progress: AgentState['progress']) => void
): Promise<AgentState> {
  const manager = new AgentManager(initialState, onStateUpdate, onProgress);
  return await manager.run();
}

