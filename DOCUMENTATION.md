# README

# GitScribe: AI-Powered Documentation Generation Tool

## Project Title and Description

### Overview

GitScribe is an innovative web application designed to automate the generation of comprehensive documentation from GitHub repositories. By leveraging an intelligent multi-agent workflow system, GitScribe creates detailed, well-structured documentation tailored to the specific needs of developers and teams. Built with modern technologies such as React, TypeScript, and Vite, the tool harnesses the power of OpenAI’s language models via LangChain, enabling it to produce documentation in various formats and languages while ensuring clarity and accuracy.

### Purpose and Goals

The primary purpose of GitScribe is to eliminate the often cumbersome task of manual documentation maintenance, which can lead to outdated or incomplete information being presented to users and contributors. By automating this process, GitScribe not only saves time but also enhances the quality of the documentation generated. Users can expect their documentation to be consistently up-to-date and reflective of the latest changes in their codebase, thereby improving the overall usability and accessibility of their projects.

### Target Audience

The target audience for GitScribe primarily includes software developers, project managers, and technical writers involved in open-source or collaborative software development. By using GitScribe, users can quickly and efficiently create, update, and maintain documentation, ultimately resulting in enhanced project clarity and improved collaboration among team members. In essence, GitScribe empowers users to focus on development while ensuring that their documentation remains a reliable and informative resource.

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

### Advanced Features

1. **GitHub API Integration**: Direct integration with GitHub API for repository access and file operations.

2. **Personal Access Token Support**: Secure authentication for private repositories.

3. **Real-time Statistics**: Track documentation metrics including word count, line count, token usage, and estimated costs.

4. **Tabbed Interface**: View documentation for multiple repositories in separate tabs.

5. **Collapsible UI**: Clean, modern interface with collapsible sections for better organization.

6. **Cost Estimation**: Real-time cost calculation based on OpenAI model usage.

7. **Auto-Update**: Automatically regenerate and commit documentation when repositories are updated (pushes/merges to main branch).

8. **Progress Tracking**: Real-time progress updates for multi-repository batch operations.

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

- **OpenAI API Key Error**: Ensure the `VITE_OPENAI_API_KEY` is correctly set in your `.env` file. Verify that the API key is valid and has sufficient credits.
- **GitHub Rate Limiting**: If you encounter rate limiting issues, add a GitHub Personal Access Token to increase rate limits. The token can be set in the UI or via `VITE_GITHUB_TOKEN`.
- **Private Repository Access**: Ensure your GitHub token has the `repo` scope and access to the specific repository.

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

**Example Usage**:

```typescript
const result = await createOrUpdateFile('owner', 'repo', 'docs/README.md', '# Documentation', 'docs: Update README');
console.log('Commit URL:', result.commit.html_url);
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

GitScribe is designed as a client-side application with no backend server required. It integrates directly with GitHub and OpenAI APIs to perform its operations. The architecture is modular, with each component responsible for a specific part of the workflow.

### Component Relationships

- **AgentWorkflow**: Manages the execution of the agent workflow, coordinating between different agents.
- **Assistant**: Provides an interactive interface for editing and improving documentation.
- **MultiRepoSelector**: Allows users to select multiple repositories for documentation generation.
- **DocumentationEditor**: The main component for generating and editing documentation.

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

A1: Add your OpenAI API key to the `.env` file as `VITE_OPENAI_API_KEY` or enter it in the application settings.

**Q2: Can I use GitScribe with private repositories?**

A2: Yes, you can use GitScribe with private repositories by providing a GitHub Personal Access Token with the `repo` scope.

### Troubleshooting

- **OpenAI API Key Error**: Ensure the key is set in your `.env` file and is valid.
- **GitHub Rate Limiting**: Use a GitHub token to increase rate limits.
- **Private Repository Access**: Ensure your token has the necessary scopes.

### Known Issues

- **PDF Export Limitations**: Large documentation may cause memory issues during PDF export.
- **Agent Workflow Stuck**: Ensure all prerequisites are met and check the console for logs.

### Roadmap

- **Additional Output Formats**: Support for AsciiDoc and reStructuredText.
- **Custom Agent Workflows**: Allow users to define custom workflows.
- **Integration with More Git Providers**: Support for GitLab and Bitbucket.
- **Webhook Support**: Automatic documentation updates via webhooks.
- **Team Collaboration Features**: Enhance collaboration capabilities.

---

**Made with ❤️ using React, TypeScript, and AI**

This comprehensive documentation aims to provide a detailed understanding of GitScribe, its features, and how to effectively use and contribute to the project. For further assistance, please open an issue on GitHub or contact the maintainers.