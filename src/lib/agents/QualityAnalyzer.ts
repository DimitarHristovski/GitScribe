/**
 * Quality Analyzer Agent
 * Analyzes repository quality and generates quality reports
 */

import { AgentState, AgentStep } from './types';
import { analyzeRepoQuality } from '../quality-analyzer';
import { generateBadges } from '../badge-generator';

export async function qualityAnalyzerAgent(state: AgentState): Promise<Partial<AgentState>> {
  console.log('[QualityAnalyzer] Starting quality analysis...');
  
  const updates: Partial<AgentState> = {
    currentStep: AgentStep.QUALITY,
    qualityReports: new Map(),
    badges: new Map(),
  };

  if (!state.repoAnalyses || state.repoAnalyses.size === 0) {
    console.warn('[QualityAnalyzer] No repository analyses available, skipping');
    return updates;
  }

  const qualityReports = new Map();
  const badges = new Map();
  let current = 0;
  const total = state.repoAnalyses.size;

  for (const [repoName, repoAnalysis] of state.repoAnalyses.entries()) {
    try {
      current++;
      updates.progress = {
        current,
        total,
        currentRepo: repoName,
        currentAgent: 'QualityAnalyzer',
      };

      console.log(`[QualityAnalyzer] Analyzing quality for ${repoName} (${current}/${total})`);

      // Analyze quality
      const qualityReport = await analyzeRepoQuality(repoAnalysis.repo, repoAnalysis);
      qualityReports.set(repoName, qualityReport);

      // Generate badges
      const badgeMarkdown = generateBadges(repoAnalysis.repo, qualityReport);
      badges.set(repoName, badgeMarkdown);

      console.log(`[QualityAnalyzer] Quality score for ${repoName}: ${qualityReport.overallScore}/100`);
    } catch (error: any) {
      console.error(`[QualityAnalyzer] Error analyzing ${repoName}:`, error);
      const errorKey = `quality_${repoName}`;
      if (!updates.errors) updates.errors = new Map();
      updates.errors.set(errorKey, error.message || 'Quality analysis failed');
    }
  }

  updates.qualityReports = qualityReports;
  updates.badges = badges;
  updates.completedSteps = new Set([...(state.completedSteps || []), AgentStep.QUALITY]);
  updates.progress = {
    current: total,
    total,
    currentAgent: 'QualityAnalyzer',
  };

  console.log(`[QualityAnalyzer] Completed quality analysis for ${qualityReports.size} repositories`);
  return updates;
}

