/**
 * DocsPlanner Agent
 * Plans the documentation structure for each repository
 */

import { AgentState, AgentStep, DocumentationPlan, DocumentationSection } from './types';
import { callLangChain } from '../langchain-service';

export async function docsPlannerAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log('[DocsPlanner] Starting documentation planning...');
  
  const updates: Partial<AgentState> = {
    currentStep: AgentStep.PLANNING,
    documentationPlans: new Map(),
  };

  if (!state.repoAnalyses || state.repoAnalyses.size === 0) {
    updates.errors = new Map([['planning', 'No repository analyses available']]);
    return updates;
  }

  const plans = new Map<string, DocumentationPlan>();
  let current = 0;
  const total = state.repoAnalyses.size;

  for (const [repoFullName, analysis] of state.repoAnalyses.entries()) {
    try {
      current++;
      updates.progress = {
        current,
        total,
        currentRepo: repoFullName,
        currentAgent: 'DocsPlanner',
      };

      console.log(`[DocsPlanner] Planning docs for ${repoFullName} (${current}/${total})`);

      // Generate documentation plan using AI
      const planningPrompt = `Create a documentation plan for this repository:

Repository: ${repoFullName}
Summary: ${analysis.summary}
Key Features: ${analysis.keyFeatures.join(', ')}
Tech Stack: ${analysis.techStack.join(', ')}
Complexity: ${analysis.complexity}
Has README: ${analysis.structure.hasReadme}
Has package.json: ${analysis.structure.hasPackageJson}
Main Files: ${analysis.structure.mainFiles.slice(0, 10).join(', ')}

Create a comprehensive documentation plan with sections. Consider:
- Overview/Introduction
- Features and capabilities
- Setup/Installation instructions
- API documentation (if applicable)
- Architecture/Structure
- Examples/Usage

Return JSON format:
{
  "sections": [
    {
      "title": "Section Title",
      "type": "overview|features|setup|api|architecture|examples",
      "priority": 1-10,
      "estimatedTokens": 500
    }
  ],
  "estimatedLength": 5000,
  "focusAreas": ["area1", "area2"],
  "style": "technical|user-friendly|comprehensive"
}`;

      let plan: DocumentationPlan;

      try {
        const aiPlan = await callLangChain(
          planningPrompt,
          'You are a documentation planning expert. Create detailed, structured documentation plans.',
          'gpt-4o-mini',
          0.4
        );

        const parsed = JSON.parse(aiPlan);
        
        plan = {
          repo: analysis.repo,
          sections: parsed.sections.map((s: any) => ({
            title: s.title,
            type: s.type || 'overview',
            priority: s.priority || 5,
            estimatedTokens: s.estimatedTokens || 500,
          })) as DocumentationSection[],
          estimatedLength: parsed.estimatedLength || 5000,
          focusAreas: parsed.focusAreas || analysis.keyFeatures,
          style: parsed.style || 'comprehensive',
        };
      } catch (error) {
        console.warn(`[DocsPlanner] AI planning failed for ${repoFullName}, using default plan`);
        // Fallback plan
        plan = {
          repo: analysis.repo,
          sections: [
            { title: 'Overview', type: 'overview', priority: 10, estimatedTokens: 300 },
            { title: 'Features', type: 'features', priority: 9, estimatedTokens: 500 },
            { title: 'Setup', type: 'setup', priority: 8, estimatedTokens: 400 },
            { title: 'Architecture', type: 'architecture', priority: 7, estimatedTokens: 600 },
            { title: 'Examples', type: 'examples', priority: 6, estimatedTokens: 400 },
          ],
          estimatedLength: 3000,
          focusAreas: analysis.keyFeatures,
          style: 'comprehensive',
        };
      }

      // Sort sections by priority
      plan.sections.sort((a, b) => b.priority - a.priority);

      plans.set(repoFullName, plan);
    } catch (error: any) {
      console.error(`[DocsPlanner] Error planning for ${repoFullName}:`, error);
      const errorKey = `planning_${repoFullName}`;
      if (!updates.errors) updates.errors = new Map();
      updates.errors.set(errorKey, error.message || 'Planning failed');
    }
  }

  updates.documentationPlans = plans;
  updates.completedSteps = new Set([...(state.completedSteps || []), AgentStep.PLANNING]);
  updates.progress = {
    current: total,
    total,
    currentAgent: 'DocsPlanner',
  };

  console.log(`[DocsPlanner] Completed planning for ${plans.size} repositories`);
  return updates;
}

