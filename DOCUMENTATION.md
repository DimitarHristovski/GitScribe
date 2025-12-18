# README

# GitScribe: AI-Powered Documentation Generation Tool

## Project Title and Description

### Overview

GitScribe is an innovative web application designed to automate the generation of comprehensive documentation from GitHub repositories. By leveraging an intelligent multi-agent workflow system, GitScribe creates detailed, well-structured documentation tailored to the specific needs of developers and teams. Built with modern technologies such as React, TypeScript, and Vite, the tool harnesses the power of OpenAI's language models via LangChain, enabling it to produce documentation in various formats and languages while ensuring clarity and accuracy.

The application addresses a critical pain point in software development: maintaining up-to-date, comprehensive documentation that accurately reflects the current state of a codebase. Traditional documentation processes are often manual, time-consuming, and prone to becoming outdated as projects evolve. GitScribe solves this by automatically analyzing repository structure, code patterns, configuration files, and dependencies to generate contextually relevant documentation that grows with your project.

GitScribe's architecture is built on a sophisticated agent-based system where specialized AI agents handle different aspects of the documentation generation process. These agents work collaboratively to discover repository contents, analyze code quality and structure, plan documentation strategies, and generate comprehensive documentation sections. The system supports multiple output formats including Markdown, HTML, MDX, OpenAPI specifications, and PDF, making it versatile for different documentation needs and publishing platforms.

### Purpose and Goals

The primary purpose of GitScribe is to eliminate the often cumbersome task of manual documentation maintenance, which can lead to outdated or incomplete information being presented to users and contributors. By automating this process, GitScribe not only saves time but also enhances the quality of the documentation generated. Users can expect their documentation to be consistently up-to-date and reflective of the latest changes in their codebase, thereby improving the overall usability and accessibility of their projects.

One of the key goals of GitScribe is to democratize high-quality documentation generation. Not all developers have the time, expertise, or resources to create comprehensive documentation manually. GitScribe levels the playing field by providing an AI-powered solution that can generate professional-grade documentation regardless of team size or budget. This is particularly valuable for open-source projects, where documentation quality often determines adoption rates and community engagement.

Another important goal is to support multiple languages and formats, making documentation accessible to international audiences and compatible with various documentation platforms. GitScribe's multi-language support (English, French, German) and format flexibility (Markdown, HTML, MDX, OpenAPI, PDF) ensure that generated documentation can be easily integrated into existing workflows and documentation systems. The tool also aims to reduce the cognitive load on developers by automating repetitive documentation tasks, allowing them to focus on writing code and building features.

### Target Audience

The target audience for GitScribe primarily includes software developers, project managers, and technical writers involved in open-source or collaborative software development. By using GitScribe, users can quickly and efficiently create, update, and maintain documentation, ultimately resulting in enhanced project clarity and improved collaboration among team members. In essence, GitScribe empowers users to focus on development while ensuring that their documentation remains a reliable and informative resource.

Individual developers working on personal projects or small teams will find GitScribe particularly valuable for quickly generating professional documentation without investing significant time in manual writing. Open-source maintainers can use GitScribe to ensure their projects have comprehensive, up-to-date documentation that helps attract contributors and users. Enterprise development teams can leverage GitScribe to maintain consistent documentation standards across multiple projects and repositories, reducing the burden on individual team members.

Technical writers and documentation specialists can use GitScribe as a starting point for their work, using the AI-generated content as a foundation that they can refine and enhance. Project managers can utilize GitScribe to ensure that documentation requirements are met without requiring extensive developer time. Additionally, organizations transitioning to new codebases or onboarding new team members can use GitScribe to quickly generate comprehensive documentation that helps with knowledge transfer and reduces onboarding time.

## Features

### Core Features

1. **GitHub Repository Documentation**: Automatically generate documentation from any GitHub repository by analyzing its structure, code, and configuration files.
   
2. **Multi-Repository Support**: Select and process multiple repositories simultaneously with batch generation capabilities.

3. **AI Agent Workflow System**: An intelligent multi-agent pipeline orchestrates discovery, analysis, quality assessment, planning, writing, and Git operations.

4. **Multiple Output Formats**: Support for Markdown, Markdown with Mermaid diagrams, MDX, OpenAPI (YAML), HTML, and PDF.

5. **Documentation Sections**: Generate README, Architecture, API Reference, Components, Testing & CI/CD, and Changelog sections.

6. **Multi-Language Support**: Generate documentation in English, French, and German.

7. **AI-Powered Assistant**: An interactive AI assistant helps edit and improve generated documentation.

8. **Quality Analysis**: Automated code quality scoring with detailed metrics and recommendations.

9. **Refactor Proposals**: AI-generated suggestions for improving repository structure.

10. **Badge Generation**: Automatic generation of repository quality badges.

11. **PDF Export**: Export documentation as PDF files.

12. **Direct GitHub Integration**: Commit generated documentation directly to repositories.

13. **RAG-Enhanced Context**: Uses Retrieval-Augmented Generation (RAG) to provide AI agents with relevant code context for more accurate documentation.

14. **Customizable Documentation Styles**: Support for different documentation styles including comprehensive, technical, and basic depth levels.

### Advanced Features

1. **GitHub API Integration**: Direct integration with GitHub API for repository access and file operations.

2. **Personal Access Token Support**: Secure authentication for private repositories.

3. **Real-time Statistics**: Track documentation metrics including word count, line count, token usage, and estimated costs.

4. **Tabbed Interface**: View documentation for multiple repositories in separate tabs.

5. **Collapsible UI**: Clean, modern interface with collapsible sections for better organization.

6. **Cost Estimation**: Real-time cost calculation based on OpenAI model usage.

7. **Auto-Update**: Automatically regenerate and commit documentation when repositories are updated (pushes/merges to main branch).

8. **Progress Tracking**: Real-time progress updates for multi-repository batch operations.

9. **Model Selection**: Choose from different OpenAI models (GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo) based on your needs and budget.

10. **Translation Support**: Built-in translation system for UI elements and generated documentation in multiple languages.

11. **Vector Store Integration**: Uses vector embeddings for semantic code search and context retrieval.

12. **Directory Tree Generation**: Automatically generates complete directory structure trees for architecture documentation.

## Installation/Setup

### Prerequisites

To set up GitScribe, ensure you have the following prerequisites:

- **Node.js 18+**: The application requires Node.js version 18 or higher.
- **npm/yarn**: A package manager for installing dependencies.
- **OpenAI API Key**: Required for AI-powered features.
- **GitHub Personal Access Token**: Optional, but recommended for accessing private repositories.

### Step-by-Step Setup Instructions

1. **Clone the Repository**

   Begin by cloning the GitScribe repository to your local machine:

   ```bash
   git clone https://github.com/DimitarHristovski/GitScribe.git
   cd GitScribe
   ```

2. **Install Dependencies**

   Use npm or yarn to install the necessary dependencies:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the root directory of the project and add the following environment variables:

   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_GITHUB_TOKEN=your_github_token_here  # Optional
   ```

   - `VITE_OPENAI_API_KEY`: Your OpenAI API key for AI-powered features.
   - `VITE_GITHUB_TOKEN`: Your GitHub Personal Access Token (optional).

4. **Start the Development Server**

   Launch the development server using the following command:

   ```bash
   npm run dev
   ```

   The application will be accessible at `http://localhost:5173`.

5. **Build for Production**

   To build the application for production, run:

   ```bash
   npm run build
   ```

   The production-ready files will be located in the `dist/` directory.

### Troubleshooting

- **OpenAI API Key Error**: Ensure the `VITE_OPENAI_API_KEY` is correctly set in your `.env` file. Verify that the API key is valid and has sufficient credits. If you're still experiencing issues, check that the key starts with "sk-" and hasn't expired. You can also verify your API key by testing it directly with OpenAI's API.

- **GitHub Rate Limiting**: If you encounter rate limiting issues, add a GitHub Personal Access Token to increase rate limits. The token can be set in the UI or via `VITE_GITHUB_TOKEN`. Authenticated requests have a much higher rate limit (5,000 requests per hour) compared to unauthenticated requests (60 requests per hour).

- **Private Repository Access**: Ensure your GitHub token has the `repo` scope and access to the specific repository. For organization repositories, you may also need the `read:org` scope. Verify token permissions in GitHub Settings > Developer settings > Personal access tokens.

- **CORS Errors**: If you encounter CORS (Cross-Origin Resource Sharing) errors when fetching from GitHub, ensure you're using a GitHub Personal Access Token. The application uses a Vite proxy for OpenAI API calls, but GitHub API calls should work directly with proper authentication.

- **Build Failures**: If the build process fails, ensure you're using Node.js 18 or higher. Clear your `node_modules` folder and `package-lock.json`, then run `npm install` again. Check for any TypeScript errors by running `npm run build` and reviewing the error messages.

- **Documentation Generation Timeout**: For very large repositories, documentation generation may take longer. If you encounter timeouts, try processing repositories individually rather than in batch, or consider using a faster model like GPT-4o-mini for initial generation.

- **Memory Issues with PDF Export**: Large documentation files may cause memory issues during PDF export. If this occurs, try exporting individual sections rather than the entire documentation, or use the HTML export format instead.

## Usage

### Quick Start Guide

1. **Add Your OpenAI API Key**

   - Click the settings icon in the top right corner of the application.
   - Enter your OpenAI API key.
   - Click "Save Changes" to store the key.

2. **Select Repositories**

   - Enter a GitHub repository URL (e.g., `owner/repo` or `https://github.com/owner/repo`).
   - Alternatively, click "Select Repositories" to browse and select multiple repositories.

3. **Configure Output**

   - Select the desired output formats (Markdown, MDX, OpenAPI, etc.).
   - Choose the documentation sections you wish to generate (README, Architecture, API, etc.).
   - Select the language for the documentation (English, French, German).

4. **Run the Workflow**

   - Click "Run Workflow" to start the AI agent pipeline.
   - Monitor progress as agents analyze, plan, and generate documentation.

5. **Review and Commit**

   - Review the generated documentation.
   - Use the AI Assistant to edit and improve the content.
   - Click "Commit to Repos" to commit the documentation to GitHub.

### Detailed Usage Examples

#### Basic Example

```typescript
import { generateDocumentationFromGitHub } from './lib/documentation-writer';

async function generateDocs() {
  const githubUrl = 'https://github.com/owner/repo';
  const options = {
    format: 'markdown',
    includeCode: true,
    includeProps: true,
    includeExamples: true,
    depth: 'comprehensive',
  };

  try {
    const documentation = await generateDocumentationFromGitHub(githubUrl, options);
    console.log(documentation);
  } catch (error) {
    console.error('Error generating documentation:', error);
  }
}

generateDocs();
```

#### Advanced Example

```typescript
import { AgentManager } from './lib/agents/Manager';
import { SimpleRepo } from './lib/types';

async function runAgentWorkflow() {
  const selectedRepos: SimpleRepo[] = [
    { owner: 'owner', name: 'repo1' },
    { owner: 'owner', name: 'repo2' },
  ];

  const agentManager = new AgentManager({
    selectedRepos,
    selectedOutputFormats: ['markdown', 'html'],
    selectedSectionTypes: ['README', 'API'],
    selectedLanguage: 'en',
  });

  try {
    const finalState = await agentManager.run();
    console.log('Workflow completed successfully:', finalState);
  } catch (error) {
    console.error('Error during agent workflow:', error);
  }
}

runAgentWorkflow();
```

#### Error Handling Example

```typescript
import { createOrUpdateFile } from './lib/github-service';

async function commitDocumentation() {
  const owner = 'owner';
  const repo = 'repo';
  const path = 'docs/README.md';
  const content = '# Documentation\n\nGenerated by GitScribe.';
  const message = 'docs: Add auto-generated documentation';

  try {
    const result = await createOrUpdateFile(owner, repo, path, content, message);
    console.log('Documentation committed successfully:', result);
  } catch (error) {
    console.error('Error committing documentation:', error);
  }
}

commitDocumentation();
```

## API/Function Examples

### `generateDocumentationFromGitHub`

Generates documentation from a GitHub repository.

```typescript
async function generateDocumentationFromGitHub(
  githubUrl: string,
  options?: DocumentationOptions
): Promise<string>
```

**Parameters**:
- `githubUrl`: The URL of the GitHub repository or in `owner/repo` format.
- `options`: Optional configuration object.
  - `format`: The desired output format ('markdown' | 'html' | 'json').
  - `includeCode`: Boolean indicating whether to include code snippets.
  - `includeProps`: Boolean indicating whether to include component props.
  - `includeExamples`: Boolean indicating whether to include usage examples.
  - `depth`: The depth of the documentation ('basic' | 'detailed' | 'comprehensive').

**Returns**: A promise that resolves to a markdown documentation string.

**Example Usage**:

```typescript
const documentation = await generateDocumentationFromGitHub('owner/repo', {
  format: 'markdown',
  includeCode: true,
  depth: 'detailed',
});
console.log(documentation);
```

### `AgentManager`

Manages the agent workflow execution.

```typescript
class AgentManager {
  constructor(
    initialState: AgentState,
    onStateUpdate?: (state: AgentState) => void,
    onProgress?: (progress: AgentState['progress']) => void
  );

  async run(): Promise<AgentState>;
}
```

**Example Usage**:

```typescript
const agentManager = new AgentManager(initialState, state => {
  console.log('State updated:', state);
});

agentManager.run().then(finalState => {
  console.log('Workflow completed:', finalState);
});
```

### `createOrUpdateFile`

Creates or updates a file in a GitHub repository.

```typescript
async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch?: string,
  token?: string,
  committer?: { name: string; email: string }
): Promise<{ commit: { sha: string; html_url: string } }>
```

**Parameters**:
- `owner`: The GitHub username or organization name that owns the repository.
- `repo`: The name of the repository.
- `path`: The file path within the repository (e.g., 'docs/README.md').
- `content`: The content to write to the file (will be base64 encoded automatically).
- `message`: The commit message for this change.
- `branch`: Optional branch name (defaults to the repository's default branch).
- `token`: Optional GitHub Personal Access Token (uses stored token if not provided).
- `committer`: Optional committer information with name and email.

**Returns**: A promise that resolves to an object containing the commit SHA and HTML URL.

**Example Usage**:

```typescript
const result = await createOrUpdateFile('owner', 'repo', 'docs/README.md', '# Documentation', 'docs: Update README');
console.log('Commit URL:', result.commit.html_url);
```

**Advanced Example with Branch and Committer**:

```typescript
const result = await createOrUpdateFile(
  'myorg',
  'myrepo',
  'docs/API.md',
  '# API Documentation\n\nGenerated by GitScribe.',
  'docs: Add API documentation',
  'develop',
  'ghp_token123',
  { name: 'GitScribe Bot', email: 'bot@gitscribe.com' }
);
```

### `callLangChain`

Calls the LangChain service to interact with OpenAI models.

```typescript
async function callLangChain(
  prompt: string,
  systemPrompt?: string,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.7,
  repoName?: string,
  useRAG: boolean = true,
  maxTokens?: number
): Promise<string>
```

**Parameters**:
- `prompt`: The user prompt/question to send to the AI model.
- `systemPrompt`: Optional system prompt that defines the AI's role and behavior.
- `model`: The OpenAI model to use (default: 'gpt-4o-mini').
- `temperature`: Controls randomness in responses (0.0-1.0, default: 0.7).
- `repoName`: Optional repository name for RAG context retrieval.
- `useRAG`: Whether to use Retrieval-Augmented Generation for context (default: true).
- `maxTokens`: Maximum tokens in the response (default: model-dependent).

**Returns**: A promise that resolves to the AI-generated text response.

**Example Usage**:

```typescript
const response = await callLangChain(
  'Generate a README for a React TypeScript project',
  'You are an expert technical writer.',
  'gpt-4o',
  0.2,
  'owner/repo',
  true,
  8000
);
console.log(response);
```

### `generateFormatDocumentation`

Generates documentation in a specific output format.

```typescript
async function generateFormatDocumentation(
  githubUrl: string,
  format: DocOutputFormat,
  sectionType: DocSectionType,
  baseMarkdown: string,
  options?: DocumentationOptions,
  repoAnalysis?: any
): Promise<string>
```

**Parameters**:
- `githubUrl`: The GitHub repository URL.
- `format`: The desired output format ('markdown' | 'markdown_mermaid' | 'mdx' | 'openapi' | 'html').
- `sectionType`: The type of documentation section ('README' | 'ARCHITECTURE' | 'API' | 'COMPONENTS' | 'TESTING_CI' | 'CHANGELOG').
- `baseMarkdown`: The base markdown content to convert.
- `options`: Optional documentation options (includeCode, includeProps, includeExamples, depth).
- `repoAnalysis`: Optional repository analysis data for format-specific enhancements.

**Returns**: A promise that resolves to the formatted documentation string.

**Example Usage**:

```typescript
const htmlDoc = await generateFormatDocumentation(
  'https://github.com/owner/repo',
  'html',
  'README',
  markdownContent,
  { includeCode: true, depth: 'comprehensive' },
  repoAnalysis
);
```

## Configuration

### Environment Variables

| Variable              | Required | Description                                                  |
|-----------------------|----------|--------------------------------------------------------------|
| `VITE_OPENAI_API_KEY` | Yes      | Your OpenAI API key for AI-powered features                  |
| `VITE_GITHUB_TOKEN`   | No       | GitHub Personal Access Token (can also be set in the UI)     |

### GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens).
2. Generate a new token with the following scopes:
   - `repo` (for private repositories and commits)
   - `read:org` (if accessing organization repos)
3. Either:
   - Add it to your `.env` file as `VITE_GITHUB_TOKEN`.
   - Or enter it in the UI when prompted (stored in localStorage).

## Architecture Overview

### System Design

GitScribe is designed as a client-side application with no backend server required. It integrates directly with GitHub and OpenAI APIs to perform its operations. The architecture is modular, with each component responsible for a specific part of the workflow. This design choice ensures that users maintain full control over their API keys and data, with all processing happening in the browser environment.

The application follows a unidirectional data flow pattern, where state flows down through components and events flow up. The agent workflow system uses a state machine pattern to manage the complex multi-step process of documentation generation. Each agent in the pipeline receives the current state, performs its specific task, and returns updated state that flows to the next agent in the sequence.

The system leverages modern web technologies including React for the user interface, TypeScript for type safety, and Vite for fast development and optimized production builds. LangChain is used as an abstraction layer over OpenAI's API, providing consistent interfaces for different models and enabling features like RAG (Retrieval-Augmented Generation) for enhanced context awareness. The vector store implementation uses embeddings to enable semantic search over codebases, allowing the AI to find relevant code examples and context when generating documentation.

### Component Relationships

- **AgentWorkflow**: Manages the execution of the agent workflow, coordinating between different agents. It handles state transitions, progress tracking, and error handling throughout the documentation generation process. The component subscribes to state updates from the AgentManager and displays real-time progress to users.

- **Assistant**: Provides an interactive interface for editing and improving documentation. It uses the LangChain service to provide AI-powered suggestions and edits. The Assistant component maintains its own conversation state and can be used to refine generated documentation before committing to GitHub.

- **MultiRepoSelector**: Allows users to select multiple repositories for documentation generation. It integrates with the GitHub API to fetch user repositories and provides a searchable, filterable interface for repository selection. The component handles authentication state and token management.

- **DocumentationEditor**: The main component for generating and editing documentation. It orchestrates the interaction between repository selection, format configuration, and the agent workflow. The component manages tabbed views for multiple repositories and provides export functionality for generated documentation.

- **AgentManager**: The core orchestration class that manages the agent workflow execution. It maintains the agent state machine, coordinates agent execution, and handles transitions between workflow steps. The Manager uses the agent graph to determine execution order and dependencies.

- **DocsWriter Agent**: Responsible for generating the actual documentation content. It uses RAG to retrieve relevant code context, calls LangChain with comprehensive prompts, and formats the output according to user-selected formats and sections. The agent generates extensive documentation (4000-8000+ words) following professional documentation standards.

- **RepoAnalysis Agent**: Analyzes repository structure, technology stack, and code patterns. It provides insights that inform the documentation planning and writing process. The analysis includes framework detection, language identification, complexity assessment, and key feature extraction.

- **DocsPlanner Agent**: Creates a documentation plan based on repository analysis and user preferences. It determines which sections to generate, what depth level to use, and how to structure the documentation. The planner considers the repository's complexity and purpose when making recommendations.

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AgentWorkflow.tsx
│   ├── Assistant.tsx
│   ├── Footer.tsx
│   └── MultiRepoSelector.tsx
├── lib/                 # Core business logic
│   ├── agents/          # AI agent implementations
│   │   ├── Manager.ts
│   │   ├── RepoDiscovery.ts
│   │   ├── RepoAnalysis.ts
│   │   ├── QualityAnalyzer.ts
│   │   ├── RefactorProposal.ts
│   │   ├── DocsPlanner.ts
│   │   ├── DocsWriter.ts
│   │   └── GitOps.ts
│   ├── documentation-writer.ts
│   ├── format-generators.ts
│   ├── github-service.ts
│   ├── langchain-service.ts
│   ├── quality-analyzer.ts
│   ├── refactor-proposal.ts
│   ├── badge-generator.ts
│   ├── pdf-exporter.ts
│   ├── translations.ts
│   └── url-importer.ts
├── pages/              # Main page components
│   ├── Landing.tsx
│   ├── DocumentationEditor.tsx
│   └── InfoPage.tsx
└── types/              # TypeScript type definitions
    ├── core.ts
    └── index.ts
```

## Contributing

### Guidelines for Contributors

Contributions to GitScribe are welcome! Please follow these guidelines to ensure a smooth contribution process:

1. **Fork the Repository**: Start by forking the GitScribe repository to your GitHub account.

2. **Create a Feature Branch**: Create a new branch for your feature or bug fix:

   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit Your Changes**: Make your changes and commit them with a descriptive message:

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to Your Branch**: Push your changes to your forked repository:

   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**: Navigate to the original GitScribe repository and open a pull request.

### Development Standards

- **TypeScript Best Practices**: Ensure type safety and use TypeScript features effectively.
- **Functional Components**: Use functional components with React hooks.
- **Code Comments**: Add comments to explain complex logic.
- **Documentation**: Update documentation for any new features or changes.
- **Testing**: Test your changes with multiple repositories and formats.

## License

GitScribe is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Additional Sections

### FAQ

**Q1: How do I set up my OpenAI API key?**

A1: Add your OpenAI API key to the `.env` file as `VITE_OPENAI_API_KEY` or enter it in the application settings. The key is stored securely in your browser's localStorage when entered through the UI, or you can set it as an environment variable for build-time configuration. Make sure your API key has sufficient credits and access to the models you want to use (GPT-4o, GPT-4o-mini, etc.).

**Q2: Can I use GitScribe with private repositories?**

A2: Yes, you can use GitScribe with private repositories by providing a GitHub Personal Access Token with the `repo` scope. The token allows GitScribe to access private repository contents, commit documentation, and perform other GitHub operations. You can set the token in the UI (stored in localStorage) or via the `VITE_GITHUB_TOKEN` environment variable.

**Q3: What OpenAI models are supported?**

A3: GitScribe supports all OpenAI chat models including GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-4, and GPT-3.5-turbo. You can select the model in the UI before running the workflow. GPT-4o-mini is recommended for cost-effective generation, while GPT-4o provides the highest quality for complex documentation. The system automatically adjusts token limits based on the selected model.

**Q4: How long does documentation generation take?**

A4: Generation time depends on repository size, selected formats, number of sections, and the chosen model. Small repositories (under 50 files) typically take 2-5 minutes, medium repositories (50-200 files) take 5-15 minutes, and large repositories (200+ files) can take 15-30 minutes or more. The system processes repositories in parallel when multiple repos are selected, which can reduce total time for batch operations.

**Q5: Can I customize the documentation style and format?**

A5: Yes, GitScribe offers extensive customization options. You can choose from multiple output formats (Markdown, HTML, MDX, OpenAPI, PDF), select specific documentation sections (README, Architecture, API, Components, Testing & CI/CD, Changelog), choose documentation depth (basic, detailed, comprehensive), and select the language (English, French, German). The system also allows you to edit generated documentation using the AI Assistant before committing.

**Q6: How does the RAG (Retrieval-Augmented Generation) system work?**

A6: GitScribe uses RAG to provide AI agents with relevant code context when generating documentation. The system creates vector embeddings of your codebase, stores them in a vector database, and retrieves semantically similar code snippets when generating documentation. This allows the AI to reference actual code examples, understand project structure, and generate more accurate, context-aware documentation. The RAG system uses 10-20 code chunks per documentation section to ensure comprehensive context.

**Q7: What happens if documentation generation fails?**

A7: If generation fails, GitScribe provides detailed error messages in the console and UI. Common causes include invalid API keys, rate limiting, network issues, or repository access problems. The system includes retry logic for transient failures and allows you to resume from the last successful step. You can also generate documentation for individual repositories if batch processing fails, and the system saves progress so you don't lose work.

### Troubleshooting

- **OpenAI API Key Error**: Ensure the key is set in your `.env` file and is valid. Check that the key starts with "sk-" and hasn't expired. Verify your OpenAI account has sufficient credits. If using the UI, check that the key was saved correctly in localStorage.

- **GitHub Rate Limiting**: Use a GitHub token to increase rate limits from 60 requests/hour (unauthenticated) to 5,000 requests/hour (authenticated). Set the token in the UI or via `VITE_GITHUB_TOKEN` environment variable. If you still hit rate limits, wait for the rate limit window to reset or use a different token.

- **Private Repository Access**: Ensure your token has the `repo` scope for private repositories. For organization repos, you may need `read:org` scope. Verify token permissions in GitHub Settings and ensure the token hasn't expired or been revoked.

- **Documentation Quality Issues**: If generated documentation seems generic or inaccurate, try using GPT-4o instead of GPT-4o-mini for better quality. Ensure your repository has sufficient code and structure for the AI to analyze. You can also use the AI Assistant to refine generated content.

- **Vector Store Not Working**: If RAG context retrieval fails, check that the repository has been properly indexed. The system automatically indexes repositories during the discovery phase, but you may need to wait for indexing to complete. Large repositories may take longer to index.

- **Build Errors**: If you encounter build errors, ensure you're using Node.js 18+ and have all dependencies installed. Clear `node_modules` and reinstall if needed. Check for TypeScript errors and resolve any type mismatches. Review the build output for specific error messages.

### Known Issues

- **PDF Export Limitations**: Large documentation (over 50,000 words) may cause memory issues during PDF export in some browsers. Workaround: Export individual sections or use HTML export format instead. The system is optimized for documentation up to 30,000 words per section.

- **Agent Workflow Stuck**: If the workflow appears stuck, ensure all prerequisites are met (API keys, network connectivity) and check the browser console for detailed logs. The system includes timeout handling, but very large repositories may take longer than expected. You can cancel and restart the workflow if needed.

- **CORS Issues with GitHub API**: Some browsers may have strict CORS policies. The application handles this through proper authentication, but if issues persist, ensure you're using a modern browser (Chrome, Firefox, Safari, Edge) with JavaScript enabled.

- **Token Limit for Very Large Repositories**: Repositories with thousands of files may exceed token limits when generating comprehensive documentation. The system automatically chunks content, but for extremely large codebases, consider generating documentation for specific sections or directories rather than the entire repository.

- **Language Translation Quality**: While GitScribe supports multiple languages, the translation quality depends on the underlying AI model. English documentation typically has the highest quality, with other languages providing good but not perfect translations. Manual review is recommended for non-English documentation.

- **OpenAPI Generation Accuracy**: OpenAPI specification generation relies on code analysis and may not capture all API endpoints perfectly, especially for dynamically generated routes. Review and refine generated OpenAPI specs before using them in production.

### Roadmap

- **Additional Output Formats**: Support for AsciiDoc, reStructuredText, and DocBook formats to cover more documentation ecosystems and publishing platforms.

- **Custom Agent Workflows**: Allow users to define custom agent workflows with configurable steps, conditions, and agent sequences. This will enable teams to create documentation pipelines tailored to their specific needs and processes.

- **Integration with More Git Providers**: Support for GitLab, Bitbucket, and other Git hosting platforms. This will expand GitScribe's reach and make it accessible to teams using different version control systems.

- **Webhook Support**: Automatic documentation updates via webhooks when repositories are updated. This will enable continuous documentation generation as part of CI/CD pipelines, ensuring documentation stays synchronized with code changes.

- **Team Collaboration Features**: Enhance collaboration capabilities with features like documentation review workflows, team annotations, approval processes, and integration with project management tools.

- **Advanced Customization**: Template system for custom documentation structures, style customization options, and the ability to define custom documentation sections beyond the standard set.

- **Performance Optimizations**: Caching mechanisms for repository analysis, incremental updates for changed files only, and parallel processing optimizations for faster generation of large documentation sets.

- **Analytics and Insights**: Documentation quality metrics, usage analytics, and insights into documentation coverage and completeness across repositories.

---

**Made with ❤️ using React, TypeScript, and AI**

This comprehensive documentation aims to provide a detailed understanding of GitScribe, its features, and how to effectively use and contribute to the project. For further assistance, please open an issue on GitHub or contact the maintainers.