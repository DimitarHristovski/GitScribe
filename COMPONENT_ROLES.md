# GitScribe Component Roles

This document explains the role and responsibilities of each major component in the GitScribe documentation generation workflow.

## Workflow Overview

The GitScribe workflow follows a sequential pipeline where each component builds upon the results of the previous one:

```
DISCOVERY → ANALYSIS → QUALITY → REFACTOR → PLANNING → WRITING → GITOPS → COMPLETE
```

---

## 1. Repository Discovery (`RepoDiscovery`)

**Location:** `src/lib/agents/RepoDiscovery.ts`

### Role
The **Repository Discovery** agent is the entry point of the workflow. It validates and prepares repositories for analysis.

### Responsibilities
- **Validates Selected Repositories**: Checks that user-selected repositories have required fields (`fullName`, `owner`, `name`)
- **Discovers User Repositories**: If no repositories are selected, fetches the user's repositories from GitHub (up to 100 repos)
- **Ensures Accessibility**: Verifies that repositories are accessible and properly formatted
- **Initializes State**: Sets up the initial agent state with discovered repositories

### Key Features
- Validates repository structure before proceeding
- Handles errors gracefully with fallback to user repo discovery
- Marks the DISCOVERY step as complete when successful
- Provides progress tracking for the discovery process

### Output
- `discoveredRepos`: Array of validated `SimpleRepo` objects ready for analysis

---

## 2. Repository Analysis (`RepoAnalysis`)

**Location:** `src/lib/agents/RepoAnalysis.ts`

### Role
The **Repository Analysis** agent performs deep structural analysis of each discovered repository to understand its codebase, technology stack, and complexity.

### Responsibilities
- **Fetches Key Files**: Retrieves important files like `README.md`, `package.json`, and root directory contents
- **Detects Technology Stack**: Identifies programming languages, frameworks (React, Vue, Angular, Next.js, Express, etc.), and dependencies
- **Analyzes Structure**: Examines file organization, main files, and project structure
- **AI-Powered Analysis**: Uses AI to generate summaries, identify key features, and assess complexity
- **Complexity Assessment**: Categorizes repositories as 'simple', 'moderate', or 'complex'

### Key Features
- Parallel file fetching for efficiency
- Framework detection from dependencies
- Language detection from file extensions and package.json
- AI-generated summaries and feature extraction
- Fallback mechanisms if AI analysis fails

### Output
- `repoAnalyses`: Map of repository names to `RepoAnalysis` objects containing:
  - Repository structure (languages, frameworks, files)
  - AI-generated summary
  - Key features list
  - Technology stack
  - Complexity level

---

## 3. Quality Analysis (`QualityAnalyzer`)

**Location:** `src/lib/agents/QualityAnalyzer.ts` and `src/lib/quality-analyzer.ts`

### Role
The **Quality Analyzer** evaluates repository quality across multiple dimensions and generates quality scores and badges.

### Responsibilities
- **Calculates Quality Metrics**: Analyzes 7 key quality dimensions:
  1. **README Quality** (15% weight) - Presence and quality of README documentation
  2. **Code Organization** (20% weight) - Folder structure and file organization
  3. **Testing** (15% weight) - Test files and CI/CD setup
  4. **Documentation** (15% weight) - Overall documentation coverage
  5. **Configuration** (10% weight) - Presence of essential config files
  6. **License & Legal** (10% weight) - License file and legal compliance
  7. **Code Quality** (15% weight) - Code structure and best practices
- **Generates Quality Scores**: Calculates weighted overall score (0-100) for each repository
- **Creates Quality Reports**: Produces detailed reports with individual metric scores
- **Generates Badges**: Creates markdown badges showing quality scores

### Key Features
- Weighted scoring system for balanced evaluation
- Multiple quality dimensions for comprehensive assessment
- Badge generation for visual quality indicators
- Detailed metric breakdowns for improvement insights

### Output
- `qualityReports`: Map of repository names to `RepoQualityReport` objects
- `badges`: Map of repository names to markdown badge strings

---

## 4. Refactor Proposal (`RefactorProposal`)

**Location:** `src/lib/agents/RefactorProposal.ts` and `src/lib/refactor-proposal.ts`

### Role
The **Refactor Proposal** agent analyzes repository structure and suggests intelligent refactoring improvements to enhance code organization.

### Responsibilities
- **Analyzes Repository Structure**: Recursively examines folder structure (up to 3 levels deep)
- **AI-Powered Proposals**: Uses AI to generate intelligent refactoring suggestions
- **Recommends Structure**: Suggests optimal folder organization following best practices
- **Proposes File Moves**: Identifies specific files that should be moved and where
- **Provides Reasoning**: Explains why each refactoring move improves organization
- **Warns About Risks**: Identifies potential breaking changes or risks

### Key Features
- Recursive structure analysis
- AI-driven refactoring recommendations
- Rule-based fallback if AI fails
- Focus on best practices for detected tech stack
- Separation of concerns (src, tests, docs, config)
- Limits to 10-15 moves for practicality

### Output
- `refactorProposals`: Map of repository names to `FolderRefactorProposal` objects containing:
  - High-level summary of refactoring goals
  - Recommended folder structure
  - Specific file moves with reasons
  - Warnings about potential issues

---

## 5. Documentation Planning (`DocsPlanner`)

**Location:** `src/lib/agents/DocsPlanner.ts`

### Role
The **Documentation Planning** agent creates a comprehensive plan for generating documentation, determining what sections to create and how to structure them.

### Responsibilities
- **Creates Documentation Plans**: Generates structured plans for each repository
- **Determines Sections**: Decides which documentation sections to generate (Overview, Features, Setup, API, Architecture, Examples, etc.)
- **Sets Priorities**: Assigns priority levels (1-10) to each section
- **Estimates Scope**: Calculates estimated token counts and documentation length
- **Identifies Focus Areas**: Determines key areas to emphasize in documentation
- **Selects Style**: Chooses documentation style (technical, user-friendly, or comprehensive)

### Key Features
- AI-powered planning based on repository analysis
- Section prioritization for efficient generation
- Token estimation for cost management
- Fallback to default plan if AI fails
- Considers repository complexity and tech stack

### Output
- `documentationPlans`: Map of repository names to `DocumentationPlan` objects containing:
  - List of sections with titles, types, priorities, and token estimates
  - Estimated total documentation length
  - Focus areas for documentation
  - Documentation style preference

---

## 6. Documentation Writing (`DocsWriter`)

**Location:** `src/lib/agents/DocsWriter.ts`

### Role
The **Documentation Writing** agent generates the actual documentation content in multiple formats and languages based on the documentation plans.

### Responsibilities
- **Generates Base Documentation**: Creates foundational markdown documentation from GitHub repository
- **Section-Specific Content**: Generates tailored content for different section types:
  - **README**: Project overview, features, installation, usage, configuration
  - **ARCHITECTURE**: System overview, components, data flow, tech stack, design patterns
  - **API**: API overview, authentication, endpoints, request/response schemas, examples
  - **COMPONENTS**: Component overview, props, usage examples, hierarchy
  - **TESTING_CI**: Testing strategy, setup, CI/CD pipeline, deployment
  - **CHANGELOG**: Version history, change categories, migration guides
- **Multi-Format Generation**: Creates documentation in multiple formats:
  - Markdown (standard)
  - Markdown with Mermaid diagrams
  - MDX (with JSX components)
  - HTML
  - OpenAPI (for API docs)
- **Language Support**: Generates documentation in multiple languages (English, French, German, Italian, Spanish)
- **Format-Specific Optimization**: Adapts content structure for each output format

### Key Features
- AI-powered content generation with section-specific prompts
- Multi-format support for different use cases
- Multi-language support
- Integration with repository analysis for context-aware generation
- Fallback mechanisms for error handling

### Output
- `generatedDocs`: Map of repository names to markdown strings (backward compatibility)
- `generatedDocsFull`: Map of repository names to `GeneratedDocs` objects containing:
  - Multiple sections with different types and formats
  - Format-specific content (markdown, HTML, OpenAPI YAML)
  - Metadata (repo name, owner, creation date)

---

## 7. Git Operations (`GitOps`)

**Location:** `src/lib/agents/GitOps.ts`

### Role
The **Git Operations** agent handles the final step of committing generated documentation back to the repositories.

### Responsibilities
- **Commits Documentation**: Creates or updates documentation files in repositories
- **Manages Branches**: Handles branch operations (defaults to 'main' branch)
- **File Management**: Creates or updates `DOCUMENTATION.md` files in each repository
- **Commit Tracking**: Tracks commit SHAs and URLs for each repository
- **Error Handling**: Manages commit failures gracefully with detailed error reporting
- **Auto-Commit Control**: Respects auto-commit settings (can be disabled)

### Key Features
- Batch commits to multiple repositories
- Configurable commit messages
- Branch selection support
- Auto-commit toggle
- Detailed success/failure tracking
- Progress tracking for multiple repositories

### Output
- `commitResults`: Map of repository names to `CommitResult` objects containing:
  - Repository reference
  - Success status
  - Commit SHA (if successful)
  - Commit URL (if successful)
  - Error message (if failed)

---

## Workflow Orchestration

The **Agent Manager** (`src/lib/agents/Manager.ts`) orchestrates the entire workflow:

- **Sequential Execution**: Ensures each step completes before moving to the next
- **State Management**: Maintains shared state across all agents
- **Condition Checking**: Verifies prerequisites before executing each step
- **Error Handling**: Manages errors and allows workflow continuation
- **Progress Tracking**: Provides real-time progress updates
- **Graph-Based Flow**: Uses a directed graph to define workflow dependencies

### Workflow Graph
```
DISCOVERY → ANALYSIS → QUALITY → REFACTOR → PLANNING → WRITING → GITOPS → COMPLETE
```

Each step has conditions that must be met:
- **DISCOVERY**: Requires selected repositories
- **ANALYSIS**: Requires completed DISCOVERY and discovered repos
- **QUALITY**: Requires completed ANALYSIS and repo analyses
- **REFACTOR**: Requires completed QUALITY and repo analyses
- **PLANNING**: Requires completed REFACTOR and repo analyses
- **WRITING**: Requires completed PLANNING and documentation plans
- **GITOPS**: Requires completed WRITING and generated docs

---

## Data Flow

```
User Selection
    ↓
RepoDiscovery → discoveredRepos
    ↓
RepoAnalysis → repoAnalyses
    ↓
QualityAnalyzer → qualityReports, badges
    ↓
RefactorProposal → refactorProposals
    ↓
DocsPlanner → documentationPlans
    ↓
DocsWriter → generatedDocs, generatedDocsFull
    ↓
GitOps → commitResults
    ↓
Complete
```

---

## Key Design Principles

1. **Modularity**: Each agent is independent and focused on a single responsibility
2. **State Sharing**: Agents share state through the `AgentState` object
3. **Error Resilience**: Each agent handles errors gracefully without breaking the workflow
4. **Progress Tracking**: All agents provide progress updates for user feedback
5. **AI Integration**: Strategic use of AI for analysis, planning, and content generation
6. **Fallback Mechanisms**: Rule-based fallbacks when AI services fail
7. **Extensibility**: Easy to add new agents or modify existing ones

---

## Summary

Each component in GitScribe plays a crucial role in transforming raw repositories into well-documented, quality-assessed codebases:

- **Discovery** validates and prepares repositories
- **Analysis** understands the codebase structure and tech stack
- **Quality** evaluates and scores repository health
- **Refactor** suggests organizational improvements
- **Planning** designs the documentation structure
- **Writing** generates comprehensive, multi-format documentation
- **GitOps** commits the documentation back to repositories

Together, these components form a complete automated documentation generation pipeline that helps developers maintain high-quality, well-documented codebases.

