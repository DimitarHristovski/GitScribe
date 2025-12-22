# DocsWriter.ts - Detailed How It Works Explanation

## Overview

`DocsWriter.ts` is the core agent responsible for generating comprehensive documentation. It takes user selections (sections, formats, models) and generates detailed documentation using AI models with RAG (Retrieval-Augmented Generation) context.

---

## 1. Entry Point: `docsWriterAgent(state: AgentState)`

### What It Receives

The function receives an `AgentState` object containing:

```typescript
{
  selectedRepos: SimpleRepo[],           // Repositories to document
  selectedOutputFormats?: DocOutputFormat[],  // ['markdown', 'html', 'openapi', etc.]
  selectedSectionTypes?: DocSectionType[],    // ['README', 'ARCHITECTURE', 'API', etc.]
  selectedLanguage?: DocLanguage,              // 'en', 'fr', 'de'
  selectedModel?: string,                      // 'gpt-4o', 'gpt-4o-mini', etc.
  documentationPlans?: Map<string, DocumentationPlan>,  // Pre-generated plans
  repoAnalyses?: Map<string, RepoAnalysis>    // Repository analysis results
}
```

### Step 1: Extract User Selections (Lines 30-42)

```typescript
// Get selected formats, section types, and language, with defaults
const selectedFormats: DocOutputFormat[] = state.selectedOutputFormats || ['markdown'];
const selectedSectionTypes: DocSectionType[] = state.selectedSectionTypes || ['README'];
const selectedLanguage: DocLanguage = state.selectedLanguage || 'en';
const selectedModel = state.selectedModel || 'gpt-4o-mini';
```

**What this does:**
- Extracts what the user selected in the UI (formats, sections, language, model)
- Provides sensible defaults if nothing is selected
- These selections determine WHAT will be generated

### Step 2: Process Each Repository (Lines 45-212)

For each repository in `documentationPlans`:

```typescript
const writingPromises = Array.from(state.documentationPlans.entries()).map(async ([repoFullName, plan]) => {
  const modelToUse = selectedModel;  // Use user's selected model
  
  // Generate base markdown (for reference)
  baseMarkdown = await generateDocumentationFromGitHub(githubUrl, {...});
  
  // Generate each section type
  for (const sectionType of selectedSectionTypes) {
    // Generate section-specific content
    const sectionSpecificContent = await generateSectionSpecificContent(...);
    
    // Generate each format
    for (const format of selectedFormats) {
      const sectionContent = await generateFormatDocumentation(...);
      sections.push(section);
    }
  }
});
```

**What this does:**
- Processes repositories in parallel
- For each repository:
  - Generates base markdown (reference documentation)
  - For each selected section type (README, ARCHITECTURE, etc.):
    - Generates section-specific content using AI
    - For each selected format (markdown, HTML, OpenAPI, etc.):
      - Converts section content to the requested format
      - Adds to sections array

---

## 2. Core Function: `generateSectionSpecificContent()`

This is where the magic happens - it determines WHAT to generate based on section type.

### Function Signature (Lines 281-289)

```typescript
async function generateSectionSpecificContent(
  sectionType: DocSectionType,      // 'README', 'ARCHITECTURE', 'API', etc.
  githubUrl: string,
  baseMarkdown: string,             // Reference documentation
  repoAnalysis: any,                 // Repository analysis results
  plan: DocumentationPlan,
  language: DocLanguage = 'en',
  modelToUse: string = 'gpt-4o-mini' // User's selected model
): Promise<string>
```

### Step 1: Retrieve RAG Context (Lines 292-341)

**What is RAG?** Retrieval-Augmented Generation - it provides the AI with actual code from the repository.

```typescript
// Three targeted queries to get comprehensive context:

// 1. Database context (8 chunks)
const databaseQuery = `Database schema, migrations, seed data, mock data, models, entities...`;
const databaseContext = await retrieveContext(databaseQuery, repoFullName, 8);

// 2. Application purpose (8 chunks)
const purposeQuery = `What does this application do? Main purpose, role, core functionality...`;
const purposeContext = await retrieveContext(purposeQuery, repoFullName, 8);

// 3. Section-specific code (8 chunks)
const sectionQuery = `Generate ${sectionType} documentation... Code structure, architecture...`;
const sectionContext = await retrieveContext(sectionQuery, repoFullName, 8);

// Combine all contexts
ragContext = databaseContext + purposeContext + sectionContext;
```

**What this does:**
- Searches the repository's indexed code using semantic search
- Retrieves 24 chunks total (8 + 8 + 8) of relevant code
- This code becomes the "source of truth" for what to document
- If RAG fails, falls back to a single query with 20 chunks

### Step 2: Generate Directory Tree (Lines 343-354)

```typescript
directoryTree = await generateDirectoryTree(owner, repo, '', branch, token);
```

**What this does:**
- Gets the complete file structure of the repository
- Used to understand project organization
- Helps identify components, modules, and architecture

### Step 3: Build Analysis Context (Lines 356-367)

```typescript
const analysisContext = repoAnalysis ? `
Repository Analysis:
- Summary: ${repoAnalysis.summary}
- Key Features: ${repoAnalysis.keyFeatures.join(', ')}
- Tech Stack: ${repoAnalysis.techStack.join(', ')}
- Complexity: ${repoAnalysis.complexity}
- Main Files: ${repoAnalysis.structure?.mainFiles?.join(', ')}
` : '';
```

**What this does:**
- Combines repository analysis results (from previous agent)
- Provides high-level understanding of the project
- Includes key features, tech stack, complexity

### Step 4: Build Section-Specific Prompt (Lines 383-1282)

**This is the KEY part** - it determines WHAT to generate based on section type.

#### Example: README Section (Lines 384-787)

```typescript
case 'README':
  sectionPrompt = `Generate a comprehensive README.md for the repository "${repoFullName}"...
  
  ${ragContext ? `
  ================================================================================
  !!! CRITICAL: ACTUAL CODE FROM REPOSITORY - YOUR ONLY SOURCE OF TRUTH !!!
  ================================================================================
  
  ${ragContext}
  
  ================================================================================
  END OF ACTUAL CODE - DO NOT DOCUMENT ANYTHING NOT SHOWN ABOVE
  ================================================================================
  ` : 'WARNING: NO RAG CONTEXT AVAILABLE'}
  
  ${analysisContext}
  
  CRITICAL FIRST STEP: Before generating any content, you MUST:
  1. Extract features from ALL available sources (RAG, Analysis, Directory)
  2. Create a verified list
  3. Document ONLY items from this verified list
  
  Create an EXTENSIVE, COMPREHENSIVE README that MUST follow this EXACT structure:
  
  ## Project Title and Description
  ### Overview
  - Write EXACTLY 3 comprehensive paragraphs...
  
  ## Features
  ### Core Features
  - MANDATORY FIRST STEP: Extract features from ALL available sources...
  - Create a numbered list of the features you extracted and verified...
  
  ## Installation/Setup
  ### Prerequisites
  ### Step-by-Step Setup Instructions
  ### Troubleshooting
  
  ## Usage
  ### Quick Start Guide
  ### Detailed Usage Examples
  
  ## API/Function Examples
  - FIRST: Check ALL available sources to identify what functions/APIs actually exist...
  - Only document functions/APIs that you can VERIFY exist...
  
  ... (continues with detailed structure for all sections)
  
  CRITICAL LENGTH REQUIREMENT: You MUST generate AT LEAST 4500-5500 words...
  `;
```

**What this does:**
1. **Defines the structure** - Tells the AI exactly what sections to include
2. **Provides RAG context** - Shows actual code from the repository
3. **Enforces verification** - Requires AI to extract and verify features before documenting
4. **Sets word count targets** - Requires minimum 4500-5500 words for README
5. **Prevents hallucination** - Explicitly warns against inventing content

#### Other Section Types

Each section type has a similar but specialized prompt:

- **ARCHITECTURE** (Lines 790-897): Focuses on system design, components, data flow
- **API** (Lines 900-1019): Focuses on function/class documentation, type definitions
- **COMPONENTS** (Lines 1022-1138): Focuses on component props, usage examples
- **TESTING_CI** (Lines 1141-1212): Focuses on test setup, CI/CD pipeline
- **CHANGELOG** (Lines 1220-1277): Focuses on version history, migration guides

### Step 5: Build System Prompt (Lines 1338-1518)

The system prompt provides general instructions that apply to ALL section types:

```typescript
const systemPrompt = `You are an expert code documentation generator...

CRITICAL FIRST STEP - EXTRACT AND VERIFY (MANDATORY - DO NOT SKIP):
BEFORE generating any documentation, you MUST complete this verification process:

STEP 1: Extract features from ALL available sources (in priority order):
- RAG context (if available): Read line by line, extract function names, class names...
- Repository Analysis (if available): Use the keyFeatures list, tech stack...
- Directory Structure (if available): Extract file paths, directory organization...

STEP 2: Verify each element:
- For RAG context items: Verify they have actual implementation code
- For Repository Analysis items: These are pre-verified, use them directly
- For Directory Structure items: Verify file paths exist...

STEP 3: This verified list is your PRIMARY source of truth:
- You can document items from this verified list
- If the list has 5 items, document 5 items - no more

STEP 4: Only AFTER completing steps 1-3, generate documentation:
- Document items from your verified list
- For each item, cite the source and file path
- Expand on these verified items with detail - do NOT add new items

CRITICAL - DO NOT INVENT CONTENT:
- DO NOT invent features, functions, or capabilities that don't exist
- ONLY document what you can see in actual code, RAG context, and repository analysis
- If you invent even ONE feature not in your verified list, you FAIL

LENGTH ENFORCEMENT:
- You have access to ${maxTokens} output tokens (≈${estimatedWords} words)
- For ${sectionType} sections: MINIMUM ${minWords} words, TARGET ${targetWords} words
- You MUST use at least 80-90% of the available token budget
- DO NOT stop early - continue generating until you reach ${targetWords} words
`;
```

**What this does:**
- Sets the AI's role and behavior
- Enforces the 4-step verification process
- Prevents hallucination with explicit warnings
- Sets length requirements based on model and section type

### Step 6: Calculate Token Limits (Lines 1287-1299)

```typescript
const getMaxTokensForModel = (model: string): number => {
  if (model.includes('gpt-4o') || model.includes('gpt-5')) {
    return 16384; // GPT-4o/5: 16,384 tokens (≈12,000 words)
  } else if (model.startsWith('gpt-4')) {
    return 8192;  // GPT-4: 8,192 tokens (≈6,000 words)
  } else if (model.startsWith('gpt-3.5')) {
    return 4096;  // GPT-3.5: 4,096 tokens (≈3,000 words)
  }
  return 16384;   // Default
};

const maxTokens = getMaxTokensForModel(modelToUse);
```

**What this does:**
- Determines maximum output tokens based on the selected model
- Different models have different token limits
- This affects how much content can be generated

### Step 7: Call AI Model (Lines 1524-1532)

```typescript
const sectionContent = await callLangChain(
  sectionPrompt,        // Section-specific prompt (what to generate)
  systemPrompt,         // General instructions (how to generate)
  modelToUse,           // User's selected model
  0.2,                  // Temperature (low = more consistent)
  repoFullName,         // Repository name (for RAG)
  true,                 // Use RAG
  maxTokens             // Maximum output tokens
);
```

**What this does:**
- Sends the prompt to the AI model
- Uses RAG to provide code context
- Generates documentation following the prompt structure
- Returns the generated content

### Step 8: Validate and Expand (Lines 1534-1645)

```typescript
const wordCount = sectionContent.split(/\s+/).length;

if (wordCount < minWordsForValidation) {
  console.error(`[DocsWriter] ERROR: Generated content is TOO SHORT...`);
  
  // Try to expand if content is less than 95% of minimum
  if (wordCount < minWordsForValidation * 0.95) {
    const expandedContent = await callLangChain(
      expansionPrompt,  // Prompt to expand existing content
      systemPrompt,
      modelToUse,
      0.3,              // Slightly higher temperature for expansion
      repoFullName,
      true,
      maxTokens
    );
    
    if (expandedWordCount >= minWordsForValidation) {
      return expandedContent;  // Return expanded version
    }
  }
}

return sectionContent;  // Return original or expanded content
```

**What this does:**
- Checks if generated content meets minimum word count
- If too short, attempts to expand it with a follow-up request
- Ensures quality and completeness

---

## 3. How It Determines What to Generate

### Decision Flow

```
1. User selects in UI:
   - Section Types: ['README', 'ARCHITECTURE', 'API']
   - Output Formats: ['markdown', 'html']
   - Model: 'gpt-4o'
   - Language: 'en'

2. Agent receives state with selections:
   selectedSectionTypes = ['README', 'ARCHITECTURE', 'API']
   selectedOutputFormats = ['markdown', 'html']
   selectedModel = 'gpt-4o'

3. For each repository:
   For each section type (README, ARCHITECTURE, API):
     a. Retrieve RAG context (24 chunks of code)
     b. Build section-specific prompt (defines structure)
     c. Build system prompt (defines behavior)
     d. Call AI model with prompts
     e. Validate word count
     f. Expand if needed
     
     For each format (markdown, html):
       a. Convert section content to format
       b. Add to sections array

4. Return generated documentation
```

### Section-Specific Prompts

Each section type has a **different prompt** that defines:

1. **Structure** - What sections to include (Overview, Features, Installation, etc.)
2. **Content Requirements** - How many paragraphs, examples, code snippets
3. **Word Count** - Minimum and target word counts
4. **Verification Steps** - How to extract and verify features
5. **Anti-Hallucination Rules** - Explicit warnings against inventing content

### Example: README Prompt Structure

```
README Prompt:
├── RAG Context (actual code from repository)
├── Repository Analysis (key features, tech stack)
├── Directory Structure (file organization)
├── Verification Instructions (4-step process)
├── Content Structure:
│   ├── Project Title and Description
│   │   ├── Overview (3 paragraphs, 300-450 words)
│   │   ├── Purpose and Goals (3 paragraphs, 300-450 words)
│   │   └── Target Audience (3 paragraphs, 300-450 words)
│   ├── Features
│   │   ├── Core Features (numbered list with code references)
│   │   └── Advanced Features (if they exist)
│   ├── Installation/Setup
│   │   ├── Prerequisites
│   │   ├── Step-by-Step Instructions
│   │   └── Troubleshooting (5-7 items)
│   ├── Usage
│   │   ├── Quick Start Guide
│   │   └── Detailed Examples
│   ├── API/Function Examples (only if they exist)
│   ├── Configuration
│   ├── Architecture Overview
│   ├── Contributing
│   ├── License
│   └── Additional Sections (FAQ, Troubleshooting, Roadmap)
└── Length Requirements (4500-5500 words minimum)
```

---

## 4. Key Mechanisms

### A. RAG (Retrieval-Augmented Generation)

**Purpose:** Provides AI with actual code from the repository

**How it works:**
1. Repository code is indexed (embedded into vectors)
2. Semantic search finds relevant code chunks
3. 24 chunks are retrieved (8 database + 8 purpose + 8 section-specific)
4. Code is included in the prompt as "source of truth"
5. AI documents only what it sees in the code

**Why it matters:**
- Prevents hallucination
- Ensures accuracy
- Documents actual features, not invented ones

### B. Verification Process

**4-Step Mandatory Process:**

1. **Extract** - Read RAG context, analysis, directory structure
2. **Verify** - Check each item has implementation code
3. **List** - Create verified list (only source of truth)
4. **Document** - Only document items from verified list

**Why it matters:**
- Forces AI to verify before documenting
- Prevents inventing features
- Ensures accuracy

### C. Anti-Hallucination Measures

**Multiple layers of protection:**

1. **RAG Context** - Shows actual code
2. **Verification Steps** - Requires verification before documenting
3. **Explicit Warnings** - "DO NOT INVENT CONTENT" repeated throughout
4. **Citation Requirements** - Must cite file paths for features
5. **Fallback Sources** - Repository Analysis and Directory Structure if RAG fails

**Why it matters:**
- Reduces hallucination risk
- Ensures documentation accuracy
- Documents only what exists

### D. Length Enforcement

**How it works:**

1. **Token Limits** - Based on model (GPT-4o: 16,384, GPT-3.5: 4,096)
2. **Word Count Targets** - Section-specific (README: 4500-5500 words)
3. **Validation** - Checks if content meets minimum
4. **Expansion** - Automatically expands if too short

**Why it matters:**
- Ensures comprehensive documentation
- Meets user expectations
- Provides detailed content

---

## 5. Complete Flow Diagram

```
User Selections (UI)
    ↓
AgentState
    ├── selectedSectionTypes: ['README', 'ARCHITECTURE']
    ├── selectedOutputFormats: ['markdown', 'html']
    ├── selectedModel: 'gpt-4o'
    └── selectedLanguage: 'en'
    ↓
docsWriterAgent()
    ↓
For each repository:
    ├── Generate base markdown (reference)
    ├── For each section type:
    │   ├── Retrieve RAG context (24 chunks)
    │   ├── Build section-specific prompt
    │   │   ├── RAG context (actual code)
    │   │   ├── Repository analysis
    │   │   ├── Directory structure
    │   │   ├── Verification instructions
    │   │   ├── Content structure (what to include)
    │   │   └── Length requirements
    │   ├── Build system prompt
    │   │   ├── Role definition
    │   │   ├── 4-step verification process
    │   │   ├── Anti-hallucination warnings
    │   │   └── Length enforcement
    │   ├── Calculate token limits (based on model)
    │   ├── Call AI model
    │   │   ├── sectionPrompt (what to generate)
    │   │   ├── systemPrompt (how to generate)
    │   │   ├── modelToUse (which model)
    │   │   ├── RAG context (code examples)
    │   │   └── maxTokens (output limit)
    │   ├── Validate word count
    │   └── Expand if needed
    │
    └── For each format:
        ├── Convert section content to format
        └── Add to sections array
    ↓
Return GeneratedDocs
    ├── sections: [
    │   { type: 'README', format: 'markdown', markdown: '...' },
    │   { type: 'README', format: 'html', html: '...' },
    │   { type: 'ARCHITECTURE', format: 'markdown', markdown: '...' },
    │   { type: 'ARCHITECTURE', format: 'html', html: '...' }
    │ ]
    └── createdAt: '2024-01-01T00:00:00Z'
```

---

## 6. Summary

**How DocsWriter determines what to generate:**

1. **User Selections** → Determines which sections and formats to generate
2. **Section-Specific Prompts** → Define the structure and content for each section type
3. **RAG Context** → Provides actual code from the repository
4. **Verification Process** → Ensures only verified features are documented
5. **System Prompts** → Define AI behavior and anti-hallucination measures
6. **Model Selection** → Determines token limits and capabilities
7. **Length Enforcement** → Ensures comprehensive documentation
8. **Format Conversion** → Converts content to requested formats (markdown, HTML, OpenAPI)

**The key insight:** The section-specific prompts are like **templates** that tell the AI exactly what structure to follow, while the RAG context provides the **actual content** to fill in that structure.

