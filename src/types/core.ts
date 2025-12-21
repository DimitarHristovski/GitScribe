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
  | 'CHANGELOG'
  | 'INLINE_CODE';

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

