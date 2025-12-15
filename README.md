# GitScribe

**AI-Powered Documentation Generation Tool**

GitScribe is a modern web application that automatically generates comprehensive documentation from GitHub repositories using an intelligent multi-agent workflow system. Built with React, TypeScript, and Vite, it leverages OpenAI's language models through LangChain to create detailed, well-structured documentation in multiple formats and languages.

## 🎯 Project Overview

GitScribe solves the problem of maintaining up-to-date, comprehensive documentation for software projects. It automates the entire documentation lifecycle—from analyzing repository structure and code quality to generating, planning, writing, and committing documentation directly to GitHub repositories.

### Key Problems Solved

- **Manual Documentation Maintenance**: Eliminates the need for developers to manually write and update documentation
- **Inconsistent Documentation**: Ensures consistent documentation structure and quality across projects
- **Multi-Repository Management**: Handles documentation for multiple repositories simultaneously
- **Code Quality Insights**: Provides automated quality analysis and refactoring suggestions
- **Multi-Format Support**: Generates documentation in various formats (Markdown, MDX, OpenAPI, HTML, PDF)

## 🚀 Features

### Core Functionality

- **GitHub Repository Documentation**: Generate documentation from any GitHub repository by analyzing its structure, code, and configuration files
- **Multi-Repository Support**: Select and process multiple repositories simultaneously with batch generation
- **AI Agent Workflow System**: Intelligent multi-agent pipeline that orchestrates discovery, analysis, quality assessment, planning, writing, and Git operations
- **Multiple Output Formats**: Support for Markdown, Markdown with Mermaid diagrams, MDX, OpenAPI (YAML), HTML, and PDF
- **Documentation Sections**: Generate README, Architecture, API Reference, Components, Testing & CI/CD, and Changelog sections
- **Multi-Language Support**: Generate documentation in English, French, and German
- **AI-Powered Assistant**: Interactive AI assistant that helps edit and improve generated documentation
- **Quality Analysis**: Automated code quality scoring with detailed metrics and recommendations
- **Refactor Proposals**: AI-generated suggestions for improving repository structure
- **Badge Generation**: Automatic generation of repository quality badges
- **PDF Export**: Export documentation as PDF files
- **Direct GitHub Integration**: Commit generated documentation directly to repositories

### Advanced Features

- **GitHub API Integration**: Direct integration with GitHub API for repository access and file operations
- **Personal Access Token Support**: Secure authentication for private repositories
- **Real-time Statistics**: Track documentation metrics including word count, line count, token usage, and estimated costs
- **Tabbed Interface**: View documentation for multiple repositories in separate tabs
- **Collapsible UI**: Clean, modern interface with collapsible sections for better organization
- **Cost Estimation**: Real-time cost calculation based on OpenAI model usage
- **Auto-Update**: Automatically regenerate and commit documentation when repositories are updated (pushes/merges to main branch)
- **Progress Tracking**: Real-time progress updates for multi-repository batch operations

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Agent Workflow System](#agent-workflow-system)
- [Output Formats](#output-formats)
- [Architecture](#architecture)
- [Components](#components)
- [API Reference](#api-reference)
- [Development](#development)
- [Contributing](#contributing)

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key
- (Optional) GitHub Personal Access Token for private repositories

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dhrist-AE.CAP.1.1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_GITHUB_TOKEN=your_github_token_here  # Optional
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

   The built files will be in the `dist/` directory.

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Yes | Your OpenAI API key for AI-powered features |
| `VITE_GITHUB_TOKEN` | No | GitHub Personal Access Token (can also be set in UI) |

### GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with the following scopes:
   - `repo` (for private repositories and commits)
   - `read:org` (if accessing organization repos)
3. Either:
   - Add it to your `.env` file as `VITE_GITHUB_TOKEN`
   - Or enter it in the UI when prompted (stored in localStorage)

## 📖 Usage

### Quick Start

1. **Add your OpenAI API key**
   - Click the settings icon in the top right
   - Enter your OpenAI API key
   - Click "Save Changes"

2. **Select repositories**
   - Enter a GitHub repository URL (e.g., `owner/repo` or `https://github.com/owner/repo`)
   - Or click "Select Repositories" to browse and select multiple repositories

3. **Configure output**
   - Select output formats (Markdown, MDX, OpenAPI, etc.)
   - Select documentation sections (README, Architecture, API, etc.)
   - Choose language (English, French, German)

4. **Run the workflow**
   - Click "Run Workflow" to start the AI agent pipeline
   - Monitor progress as agents analyze, plan, and generate documentation

5. **Review and commit**
   - Review generated documentation
   - Use the AI Assistant to edit and improve content
   - Click "Commit to Repos" to commit documentation to GitHub

### Using the Agent Workflow

The agent workflow system orchestrates the following steps:

1. **RepoDiscovery**: Validates and discovers selected repositories
2. **RepoAnalysis**: Analyzes repository structure, dependencies, and codebase
3. **QualityAnalyzer**: Assesses code quality and generates quality reports
4. **RefactorProposal**: Suggests repository structure improvements
5. **DocsPlanner**: Creates a comprehensive documentation plan
6. **DocsWriter**: Generates documentation in selected formats and sections
7. **GitOps**: Commits documentation to repositories (if auto-commit enabled)

### Using the AI Assistant

The AI Assistant sidebar provides an interactive interface to edit and improve documentation:

- **Rewrite sections** for better clarity
- **Fix grammar and spelling**
- **Add or remove content**
- **Restructure documentation**
- **Format text better**
- **Translate content** to different languages

### Committing Documentation

1. After generating documentation, review it in the editor
2. Make any edits using the AI Assistant if needed
3. Click "Commit to Repos"
4. Enter a commit message (default: "docs: Add auto-generated documentation")
5. Specify the target branch (default: `main`)
6. The documentation will be committed to each selected repository

## 🤖 Agent Workflow System

GitScribe uses an intelligent multi-agent system to automate the documentation generation process. Each agent has a specific role and the system orchestrates them in a sequential workflow.

### Agent Steps

1. **RepoDiscovery Agent**
   - Validates selected repositories
   - Discovers user repositories if needed
   - Ensures repository accessibility

2. **RepoAnalysis Agent**
   - Analyzes repository structure
   - Extracts package.json and dependencies
   - Identifies technology stack
   - Analyzes codebase patterns

3. **QualityAnalyzer Agent**
   - Calculates quality metrics
   - Generates quality scores (0-100)
   - Provides detailed quality reports
   - Identifies areas for improvement

4. **RefactorProposal Agent**
   - Analyzes folder structure
   - Suggests organizational improvements
   - Proposes file moves and restructuring
   - Provides refactoring recommendations

5. **DocsPlanner Agent**
   - Creates documentation plan for each repository
   - Determines which sections to generate
   - Plans file locations and structure
   - Optimizes documentation organization

6. **DocsWriter Agent**
   - Generates documentation content
   - Creates multiple format outputs
   - Writes section-specific content
   - Handles language translations

7. **GitOps Agent**
   - Commits documentation to repositories
   - Manages branch operations
   - Handles file creation/updates
   - Provides commit tracking

### Workflow Graph

```
DISCOVERY → ANALYSIS → QUALITY → REFACTOR → PLANNING → WRITING → GITOPS → COMPLETE
```

Each step has conditions that must be met before proceeding to the next step, ensuring data integrity and proper sequencing.

## 📄 Output Formats

GitScribe supports multiple documentation formats:

### Markdown (`markdown`)
- Standard GitHub-Flavored Markdown
- Compatible with GitHub, GitLab, and most documentation sites
- Clean, readable format

### Markdown with Mermaid (`markdown_mermaid`)
- Markdown with AI-generated Mermaid diagrams
- Architecture diagrams
- Flow charts
- Sequence diagrams

### MDX (`mdx`)
- Markdown with JSX components
- Interactive documentation
- Custom React components
- Perfect for documentation sites like Docusaurus, Next.js

### OpenAPI (`openapi`)
- YAML format for API documentation
- OpenAPI 3.0 specification
- Endpoint documentation
- Request/response schemas

### HTML (`html`)
- Fully styled HTML pages
- Ready for deployment
- Standalone documentation sites
- Export-only format

### PDF (`pdf`)
- PDF export format
- Printable documentation
- Professional formatting
- Export-only format

## 📑 Documentation Sections

GitScribe can generate the following documentation sections:

- **README**: Project overview, installation, usage, and features
- **ARCHITECTURE**: System design, component structure, and data flow
- **API**: API Reference with endpoint documentation, request/response schemas
- **COMPONENTS**: Component documentation with props and usage examples
- **TESTING_CI**: Testing setup, CI/CD pipeline, and deployment guides
- **CHANGELOG**: Version history and release notes

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI Integration**: LangChain with OpenAI
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useRef)
- **PDF Generation**: jsPDF (via pdf-exporter)
- **ZIP Handling**: JSZip

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AgentWorkflow.tsx    # Agent workflow UI and orchestration
│   ├── Assistant.tsx        # AI assistant component
│   ├── Footer.tsx          # Site footer
│   └── MultiRepoSelector.tsx  # Repository selector modal
├── lib/                 # Core business logic
│   ├── agents/          # AI agent implementations
│   │   ├── Manager.ts          # Agent orchestration and workflow management
│   │   ├── RepoDiscovery.ts    # Repository discovery agent
│   │   ├── RepoAnalysis.ts     # Repository analysis agent
│   │   ├── QualityAnalyzer.ts  # Quality assessment agent
│   │   ├── RefactorProposal.ts # Refactoring suggestions agent
│   │   ├── DocsPlanner.ts      # Documentation planning agent
│   │   ├── DocsWriter.ts       # Documentation generation agent
│   │   ├── GitOps.ts           # Git operations agent
│   │   └── types.ts            # Agent state and type definitions
│   ├── documentation-writer.ts  # Legacy documentation generation
│   ├── format-generators.ts     # Format-specific generators
│   ├── github-service.ts        # GitHub API integration
│   ├── langchain-service.ts     # AI/LLM integration
│   ├── quality-analyzer.ts      # Quality analysis logic
│   ├── refactor-proposal.ts     # Refactoring proposal generation
│   ├── badge-generator.ts       # Repository badge generation
│   ├── pdf-exporter.ts          # PDF export functionality
│   ├── translations.ts          # Multi-language translation system
│   └── url-importer.ts          # URL content import
├── pages/              # Main page components
│   ├── Landing.tsx            # Landing page
│   ├── DocumentationEditor.tsx  # Main documentation editor
│   └── InfoPage.tsx           # Information pages
└── types/              # TypeScript type definitions
    ├── core.ts         # Core types (formats, sections, etc.)
    └── index.ts        # Type exports
```

### Key Services

#### `agents/Manager.ts`
- Orchestrates the agent workflow
- Manages state transitions
- Handles agent execution order
- Provides progress tracking

#### `github-service.ts`
- GitHub API integration
- Repository listing and file fetching
- Commit operations (create/update/delete files)
- Token management
- Commit tracking for auto-update feature

#### `langchain-service.ts`
- OpenAI API integration via LangChain
- AI model configuration
- Prompt processing
- Response parsing
- JSON response handling

#### `format-generators.ts`
- Generates format-specific documentation
- Handles Markdown, MDX, OpenAPI, HTML formats
- Format-specific optimizations

#### `quality-analyzer.ts`
- Calculates repository quality metrics
- Generates quality scores
- Provides detailed quality reports
- Identifies improvement areas

#### `refactor-proposal.ts`
- Analyzes repository structure
- Generates refactoring suggestions
- Proposes file moves and reorganization
- Provides actionable recommendations

## 🧩 Components

### DocumentationEditor

The main component for generating and editing documentation.

**Features**:
- Source selection (GitHub/URL)
- Single/Multi repository modes
- Agent workflow integration
- AI Assistant integration
- Statistics display
- Export functionality
- Commit to repositories
- Multi-language support
- Format and section selection

**Props**:
```typescript
interface DocumentationEditorProps {
  onBack: () => void;
}
```

### AgentWorkflow

Component for managing and executing the agent workflow.

**Features**:
- Repository selection
- Format and section configuration
- Workflow execution
- Progress tracking
- Results display
- Commit management

**Props**:
```typescript
interface AgentWorkflowProps {
  selectedRepos: SimpleRepo[];
  selectedOutputFormats?: DocOutputFormat[];
  selectedSectionTypes?: DocSectionType[];
  selectedLanguage?: DocLanguage;
  onReposChange: (repos: SimpleRepo[]) => void;
  onComplete: (state: AgentState) => void;
}
```

### Assistant

AI-powered assistant for editing documentation.

**Features**:
- Interactive chat interface
- Documentation editing capabilities
- Model selection
- Real-time updates
- Multi-language support

**Props**:
```typescript
interface AssistantProps {
  documentation?: string;
  onUpdateDocumentation?: (updatedDocumentation: string) => void;
  model?: string;
}
```

### MultiRepoSelector

Modal component for selecting multiple GitHub repositories.

**Features**:
- Repository search and filtering
- Visibility filters (all/public/private)
- Batch selection
- Repository information display

## 📚 API Reference

### Documentation Generation

#### `generateDocumentationFromGitHub`

Generates documentation from a GitHub repository (legacy method).

```typescript
async function generateDocumentationFromGitHub(
  githubUrl: string,
  options?: DocumentationOptions
): Promise<string>
```

**Parameters**:
- `githubUrl`: Repository URL or `owner/repo` format
- `options`: Optional configuration
  - `format`: Output format ('markdown' | 'html' | 'json')
  - `includeCode`: Include code snippets
  - `includeProps`: Include component props
  - `includeExamples`: Include usage examples
  - `depth`: Documentation depth ('basic' | 'detailed' | 'comprehensive')

**Returns**: Promise resolving to markdown documentation string

### Agent System

#### `AgentManager`

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

### GitHub Service

#### `fetchUserRepos`

Fetches repositories for the authenticated user.

```typescript
async function fetchUserRepos(options?: {
  visibility?: 'all' | 'public' | 'private';
  affiliation?: string;
  perPage?: number;
  page?: number;
}): Promise<SimpleRepo[]>
```

#### `createOrUpdateFile`

Creates or updates a file in a repository.

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

#### `getLatestCommitSha`

Gets the SHA of the latest commit on a branch.

```typescript
async function getLatestCommitSha(
  owner: string,
  repo: string,
  branch?: string,
  token?: string
): Promise<string | null>
```

### LangChain Service

#### `callLangChain`

Calls the OpenAI API via LangChain.

```typescript
async function callLangChain(
  prompt: string,
  systemPrompt?: string,
  model?: string,
  temperature?: number
): Promise<string>
```

**Parameters**:
- `prompt`: User prompt
- `systemPrompt`: Optional system prompt
- `model`: Model name (default: 'gpt-4o-mini')
- `temperature`: Temperature setting (default: 0.7)

#### `callLangChainJSON`

Calls the OpenAI API and parses JSON response.

```typescript
async function callLangChainJSON<T>(
  prompt: string,
  systemPrompt?: string,
  model?: string,
  temperature?: number
): Promise<T>
```

### Quality Analysis

#### `analyzeRepoQuality`

Analyzes repository quality and generates a quality report.

```typescript
async function analyzeRepoQuality(
  repo: SimpleRepo,
  analysis: RepoAnalysis,
  token?: string
): Promise<RepoQualityReport>
```

### Refactor Proposals

#### `generateRefactorProposal`

Generates refactoring suggestions for a repository.

```typescript
async function generateRefactorProposal(
  repo: SimpleRepo,
  analysis: RepoAnalysis
): Promise<FolderRefactorProposal>
```

## 🔧 Development

### Running in Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎨 UI/UX Features

- **Modern Design**: Glassmorphism effects, gradients, and smooth animations
- **Responsive Layout**: Works on desktop and mobile devices
- **Custom Scrollbars**: Styled scrollbars for better aesthetics
- **Collapsible Sections**: Space-efficient UI with collapsible panels
- **Real-time Feedback**: Loading states, progress indicators, and error messages
- **Keyboard Shortcuts**: Enter to send messages in the assistant
- **Multi-language UI**: Interface available in English, French, and German
- **Dark Mode Ready**: UI components support dark mode styling

## 🔐 Security

- GitHub tokens are stored in `localStorage` (client-side only)
- Environment variables are used for sensitive configuration
- API keys are never exposed in client-side code
- HTTPS recommended for production deployments
- No backend server required - all operations are client-side

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure `VITE_OPENAI_API_KEY` is set in your `.env` file
   - Check that the API key is valid and has sufficient credits
   - Verify the key has access to the required models (gpt-4o-mini, gpt-4o)

2. **GitHub Rate Limiting**
   - Add a GitHub Personal Access Token to increase rate limits
   - Token can be set in the UI or via `VITE_GITHUB_TOKEN`
   - Authenticated requests have higher rate limits

3. **Private Repository Access**
   - Ensure your GitHub token has the `repo` scope
   - Token must have access to the specific repository
   - Check repository visibility settings

4. **Documentation Generation Fails**
   - Check network connectivity
   - Verify repository URL format
   - Ensure repository is accessible with your token
   - Check browser console for detailed error messages

5. **Agent Workflow Stuck**
   - Check that all prerequisites are met for each agent step
   - Verify repository access and token validity
   - Review browser console for agent execution logs
   - Try restarting the workflow

6. **PDF Export Issues**
   - Ensure sufficient browser memory
   - Check that documentation content is not too large
   - Try exporting individual sections instead of full documentation

## 📝 License

[Add your license information here]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain type safety throughout
- Add comments for complex logic
- Update documentation for new features
- Test with multiple repositories and formats

## 📧 Support

For support, please open an issue on GitHub or contact [your contact information].

## 🙏 Acknowledgments

- OpenAI for the language models
- LangChain for the AI framework
- React and Vite communities
- All contributors and users

## 🔮 Future Enhancements

Potential future features and improvements:

- Additional output formats (AsciiDoc, reStructuredText)
- More documentation section types
- Custom agent workflows
- Integration with more Git providers (GitLab, Bitbucket)
- Webhook support for automatic documentation updates
- Team collaboration features
- Documentation templates
- Custom AI model support

---

**Made with ❤️ using React, TypeScript, and AI**
