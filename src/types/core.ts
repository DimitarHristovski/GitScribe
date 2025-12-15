/**
 * Core Documentation Generation Types
 * Defines formats, sections, and batch processing types for documentation generation
 */

import { SimpleRepo } from '../lib/github-service';

/**
 * Documentation Language Support
 */
export type DocLanguage = 'en' | 'fr' | 'de';

/**
 * Documentation Output Formats
 */
export type DocOutputFormat =
  | 'markdown'          // plain GitHub-Flavored Markdown
  | 'markdown_mermaid'  // markdown that includes mermaid diagrams
  | 'mdx'               // markdown + JSX, for docs sites
  | 'openapi'           // OpenAPI spec (YAML)
  | 'html'              // rendered HTML docs (export only)
  | 'pdf';              // PDF export format

/**
 * Documentation Section Types
 */
export type DocSectionType =
  | 'README'
  | 'ARCHITECTURE'
  | 'API'
  | 'COMPONENTS'
  | 'TESTING_CI'
  | 'CHANGELOG';

/**
 * Documentation Section
 * Represents a single section of generated documentation
 */
export type DocSection = {
  id: string;
  type: DocSectionType;
  format: DocOutputFormat;
  language: DocLanguage;
  title: string;
  markdown?: string;       // used when format is markdown / markdown_mermaid / mdx
  openapiYaml?: string;    // used when format === 'openapi'
  html?: string;           // used when format === 'html'
  pdfBlobUrl?: string;     // for generated PDF downloads
};

/**
 * Generated Documentation
 * Complete documentation output for a repository
 */
export type GeneratedDocs = {
  repoName: string;
  owner: string;
  sections: DocSection[];
  createdAt: string;
};

/**
 * Documentation Plan Item
 * Represents a planned documentation section to be generated
 */
export type DocPlanItem = {
  id: string;
  type: DocSectionType;
  format: DocOutputFormat;
  language: DocLanguage;
  targetPath: string;   // where it will be written in the repo
  description: string;
};

/**
 * Documentation Plan
 * Complete plan for generating documentation for a repository
 */
export type DocPlan = {
  repoName: string;
  owner: string;
  items: DocPlanItem[];
};

/**
 * Repository Quality Metric
 * Individual metric contributing to overall repository quality score
 */
export type RepoQualityMetric = {
  id: string;
  label: string;
  score: number; // 0–100
  weight: number; // for overall score calculation
  description?: string;
};

/**
 * Repository Quality Report
 * Complete quality assessment for a repository
 */
export type RepoQualityReport = {
  repoName: string;
  overallScore: number; // 0–100
  metrics: RepoQualityMetric[];
};

/**
 * Refactor Move
 * Represents a file/folder move recommendation
 */
export type RefactorMove = {
  fromPath: string;
  toPath: string;
  reason: string;
};

/**
 * Folder Refactor Proposal
 * Intelligent proposal for restructuring repository folder structure
 */
export type FolderRefactorProposal = {
  repoName: string;
  highLevelSummary: string;
  recommendedStructure: {
    folder: string;
    description: string;
  }[];
  moves: RefactorMove[];
  warnings?: string[];
};

/**
 * Batch Repository Task
 * Configuration for processing a single repository in a batch
 */
export type BatchRepoTask = {
  repo: SimpleRepo;
  docTypes: DocSectionType[];
  outputFormats: DocOutputFormat[];   // formats requested by user for this repo
  language: DocLanguage;
  dryRun: boolean;
};

/**
 * Batch Result Item
 * Result of processing a single repository in a batch
 */
export type BatchResultItem = {
  repo: SimpleRepo;
  status: 'pending' | 'running' | 'success' | 'error';
  errorMessage?: string;
  docs?: GeneratedDocs;
  commits?: { path: string; sha: string }[];
  quality?: RepoQualityReport;
  refactorProposal?: FolderRefactorProposal;
  badgesMarkdown?: string;
};

