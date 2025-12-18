/**
 * Agent System Types
 * Defines the state machine and agent interfaces for the LangGraph-style agent system
 */

import { SimpleRepo } from '../github-service';
import { DocOutputFormat, DocSectionType, GeneratedDocs, DocLanguage } from '../../types/core';

/**
 * Agent State - represents the current state of the agent workflow
 */
export interface AgentState {
  // Input
  selectedRepos: SimpleRepo[];
  selectedOutputFormats?: DocOutputFormat[];
  selectedSectionTypes?: DocSectionType[];
  selectedLanguage?: DocLanguage;
  selectedModel?: string; // AI model to use for generation
  
  // Discovery
  discoveredRepos?: SimpleRepo[];
  
  // Analysis
  repoAnalyses?: Map<string, RepoAnalysis>;
  
  // Planning
  documentationPlans?: Map<string, DocumentationPlan>;
  
  // Writing
  generatedDocs?: Map<string, string>; // Backward compatibility - first markdown section
  generatedDocsFull?: Map<string, GeneratedDocs>; // Full format-specific documentation
  
  // Status
  currentStep?: AgentStep;
  completedSteps?: Set<AgentStep>;
  errors?: Map<string, string>;
  
  // Progress
  progress?: {
    current: number;
    total: number;
    currentRepo?: string;
    currentAgent?: string;
  };
}

/**
 * Agent Steps
 */
export enum AgentStep {
  DISCOVERY = 'discovery',
  ANALYSIS = 'analysis',
  PLANNING = 'planning',
  WRITING = 'writing',
  COMPLETE = 'complete',
}

/**
 * Repository Analysis Result
 */
export interface RepoAnalysis {
  repo: SimpleRepo;
  structure: {
    languages: string[];
    frameworks: string[];
    hasReadme: boolean;
    hasPackageJson: boolean;
    hasConfigFiles: boolean;
    mainFiles: string[];
  };
  summary: string;
  keyFeatures: string[];
  techStack: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Documentation Plan
 */
export interface DocumentationPlan {
  repo: SimpleRepo;
  sections: DocumentationSection[];
  estimatedLength: number;
  focusAreas: string[];
  style: 'technical' | 'user-friendly' | 'comprehensive';
}

export interface DocumentationSection {
  title: string;
  type: 'overview' | 'features' | 'setup' | 'api' | 'architecture' | 'examples';
  priority: number;
  estimatedTokens: number;
}

/**
 * Agent Node - represents an agent in the graph
 */
export interface AgentNode {
  name: string;
  execute: (state: AgentState) => Promise<Partial<AgentState>>;
  shouldRun?: (state: AgentState) => boolean;
}

/**
 * Graph Edge - defines transitions between agents
 */
export interface GraphEdge {
  from: AgentStep;
  to: AgentStep;
  condition?: (state: AgentState) => boolean;
}

