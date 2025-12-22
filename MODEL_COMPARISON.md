# Model Configuration Comparison

This document compares all AI model configurations used throughout GitScribe to identify differences that may cause varying documentation outputs.

## Summary of Model Usage

| Component | Model | Temperature | MaxTokens | RAG | Notes |
|-----------|-------|-------------|-----------|-----|-------|
| **DocsWriter** (Main) | User-selected | **0.2** | Dynamic* | ✅ Yes | Primary documentation generation |
| **RepoAnalysis** | `gpt-4o-mini` | **0.3** | Default | ✅ Yes | Repository analysis |
| **DocsPlanner** | `gpt-4o-mini` | **0.4** | Default | ❌ No | Documentation planning |
| **AI-style-docs** | `gpt-4o-mini` | **0.2** | Default | ✅ Yes | Inline code documentation |
| **documentation-writer** | `gpt-4o-mini` | **0.7** | Default | ❌ No | Base markdown generation |
| **format-generators** (Mermaid) | `gpt-4o-mini` | **0.4** | Default | ❌ No | Diagram generation |
| **format-generators** (OpenAPI) | `gpt-4o-mini` | **0.5** | Default | ❌ No | API spec generation |

\* Dynamic MaxTokens based on model:
- `gpt-4o`, `gpt-5*`: 16,384 tokens (≈12,000 words)
- `gpt-4*`: 8,192 tokens (≈6,000 words)
- `gpt-3.5*`: 4,096 tokens (≈3,000 words)

## Detailed Breakdown

### 1. DocsWriter.ts (Main Documentation Generation)
**Location**: `src/lib/agents/DocsWriter.ts:1494-1502`

```typescript
const sectionContent = await callLangChain(
  sectionPrompt,
  systemPrompt,
  modelToUse,        // User-selected model
  0.2,              // Low temperature for consistency
  repoFullName,
  true,             // Uses RAG
  maxTokens         // Dynamic based on model
);
```

**Characteristics**:
- ✅ **Respects user's model selection** (can be gpt-4o, gpt-4o-mini, gpt-4-turbo, etc.)
- ✅ **Low temperature (0.2)** - More consistent, deterministic output
- ✅ **Dynamic maxTokens** - Adjusts based on model capabilities
- ✅ **Uses RAG** - Has access to code context
- ✅ **Comprehensive prompts** - Very detailed instructions with anti-hallucination measures

**Impact**: This is the PRIMARY documentation generator. Different models will produce different outputs here.

---

### 2. RepoAnalysis.ts (Repository Analysis)
**Location**: `src/lib/agents/RepoAnalysis.ts:157-164`

```typescript
const aiAnalysis = await callLangChain(
  analysisPrompt,
  'You are a technical analyst...',
  'gpt-4o-mini',   // Hardcoded
  0.3,              // Medium-low temperature
  repo.fullName,
  true              // Uses RAG
);
```

**Characteristics**:
- ❌ **Hardcoded to gpt-4o-mini** - Not user-configurable
- ⚠️ **Temperature 0.3** - Slightly higher than DocsWriter
- ❌ **No maxTokens specified** - Uses default
- ✅ **Uses RAG** - Has code context

**Impact**: Affects initial repository analysis, which may influence documentation structure.

---

### 3. DocsPlanner.ts (Documentation Planning)
**Location**: `src/lib/agents/DocsPlanner.ts:69-74`

```typescript
const aiPlan = await callLangChain(
  planningPrompt,
  'You are a documentation planning expert...',
  'gpt-4o-mini',   // Hardcoded
  0.4              // Medium temperature
);
```

**Characteristics**:
- ❌ **Hardcoded to gpt-4o-mini** - Not user-configurable
- ⚠️ **Temperature 0.4** - Higher than DocsWriter
- ❌ **No maxTokens specified** - Uses default
- ❌ **No RAG** - Doesn't use code context
- ❌ **No repoName passed** - May affect context

**Impact**: Affects documentation planning/outline, which may influence final structure.

---

### 4. AI-style-docs.ts (Inline Code Documentation)
**Location**: `src/lib/AI-style-docs.ts:220-227`

```typescript
const documentedCode = await callLangChain(
  prompt,
  systemPrompt,
  'gpt-4o-mini',   // Hardcoded
  0.2,             // Low temperature (same as DocsWriter)
  repo.fullName,
  true             // Uses RAG
);
```

**Characteristics**:
- ❌ **Hardcoded to gpt-4o-mini** - Not user-configurable
- ✅ **Temperature 0.2** - Same as DocsWriter (consistent)
- ❌ **No maxTokens specified** - Uses default
- ✅ **Uses RAG** - Has code context

**Impact**: Only used for INLINE_CODE section type. Consistent with DocsWriter temperature.

---

### 5. documentation-writer.ts (Base Markdown)
**Location**: `src/lib/documentation-writer.ts:449`

```typescript
const aiExplanation = await callLangChain(
  userPrompt,
  systemPrompt,
  'gpt-4o-mini',   // Hardcoded
  0.7               // HIGH temperature (creative)
);
```

**Characteristics**:
- ❌ **Hardcoded to gpt-4o-mini** - Not user-configurable
- ⚠️ **Temperature 0.7** - HIGH (most creative, least consistent)
- ❌ **No maxTokens specified** - Uses default
- ❌ **No RAG** - Doesn't use code context
- ❌ **No repoName passed** - May affect context

**Impact**: Used for base markdown generation (reference only). High temperature may cause more variation.

---

### 6. format-generators.ts (Mermaid Diagrams)
**Location**: `src/lib/format-generators.ts:114-119`

```typescript
const diagramCode = await callLangChain(
  prompt,
  'You are an expert at creating Mermaid diagrams...',
  'gpt-4o-mini',   // Hardcoded
  0.4               // Medium temperature
);
```

**Characteristics**:
- ❌ **Hardcoded to gpt-4o-mini** - Not user-configurable
- ⚠️ **Temperature 0.4** - Medium
- ❌ **No maxTokens specified** - Uses default
- ❌ **No RAG** - Doesn't use code context
- ❌ **No repoName passed** - May affect context

**Impact**: Only affects diagram generation, not main documentation.

---

### 7. format-generators.ts (OpenAPI Specs)
**Location**: `src/lib/format-generators.ts:339-344`

```typescript
const yaml = await callLangChain(
  prompt,
  'You are an expert at creating OpenAPI specifications...',
  'gpt-4o-mini',   // Hardcoded
  0.5               // Medium-high temperature
);
```

**Characteristics**:
- ❌ **Hardcoded to gpt-4o-mini** - Not user-configurable
- ⚠️ **Temperature 0.5** - Medium-high
- ❌ **No maxTokens specified** - Uses default
- ❌ **No RAG** - Doesn't use code context
- ❌ **No repoName passed** - May affect context

**Impact**: Only affects OpenAPI spec generation, not main documentation.

---

## Key Differences Causing Output Variations

### 1. **Model Selection** (Primary Factor)
- **DocsWriter** uses user-selected model (can be gpt-4o, gpt-4o-mini, gpt-4-turbo, etc.)
- **All other components** hardcoded to `gpt-4o-mini`
- **Impact**: Different models have different:
  - Token limits (affects max output length)
  - Quality/accuracy levels
  - Response styles
  - Training data cutoffs

### 2. **Temperature Settings** (Consistency Factor)
- **DocsWriter**: 0.2 (most consistent)
- **RepoAnalysis**: 0.3
- **DocsPlanner**: 0.4
- **AI-style-docs**: 0.2 (same as DocsWriter)
- **documentation-writer**: 0.7 (most variable)
- **format-generators (Mermaid)**: 0.4
- **format-generators (OpenAPI)**: 0.5

**Impact**: Higher temperature = more creative/variable output. Lower temperature = more consistent/deterministic.

### 3. **MaxTokens Configuration** (Length Factor)
- **DocsWriter**: Dynamic (16,384 for gpt-4o, 8,192 for gpt-4, 4,096 for gpt-3.5)
- **All others**: Default from `callLangChain`:
  - `gpt-4o*` models: 16,384 tokens (same as DocsWriter)
  - Other models: 4,096 tokens

**Impact**: Different token limits affect maximum documentation length. Most components using `gpt-4o-mini` will get 16,384 tokens by default, which matches DocsWriter for gpt-4o models.

### 4. **RAG Usage** (Context Factor)
- **DocsWriter**: ✅ Uses RAG (has code context)
- **RepoAnalysis**: ✅ Uses RAG
- **AI-style-docs**: ✅ Uses RAG
- **DocsPlanner**: ❌ No RAG
- **documentation-writer**: ❌ No RAG
- **format-generators**: ❌ No RAG

**Impact**: Components without RAG may generate less accurate or more generic content.

---

## Recommendations

### To Get Consistent Output:

1. **Use the same model for all components**:
   - Currently only DocsWriter respects user selection
   - Consider making all components use the selected model

2. **Standardize temperature**:
   - All documentation generation should use 0.2 (like DocsWriter)
   - Higher temperatures (0.4-0.7) cause more variation

3. **Enable RAG everywhere**:
   - Components without RAG may generate less accurate content
   - Consider enabling RAG for DocsPlanner and format-generators

4. **Set explicit maxTokens**:
   - Components using default maxTokens may be limited
   - Consider setting appropriate limits based on model

### Current Behavior:

- **Main documentation (DocsWriter)**: Uses your selected model with low temperature (0.2) and RAG
- **Supporting components**: Use hardcoded gpt-4o-mini with varying temperatures and no RAG
- **Result**: Different models in DocsWriter will produce different outputs, but supporting components always use gpt-4o-mini

---

## Model-Specific Differences

### GPT-4o vs GPT-4o-mini vs GPT-4-turbo

| Model | Max Output Tokens | Quality | Speed | Cost | Best For |
|-------|------------------|---------|-------|------|----------|
| **GPT-4o** | 16,384 | Highest | Medium | High | Complex, detailed documentation |
| **GPT-4o-mini** | 16,384 | Good | Fast | Low | Cost-effective, general use |
| **GPT-4-turbo** | 8,192 | High | Medium | Medium | Balanced quality/cost |
| **GPT-4** | 8,192 | High | Slow | High | Legacy, high quality |
| **GPT-3.5-turbo** | 4,096 | Medium | Fast | Very Low | Simple documentation |

**Note**: Token limits affect maximum documentation length. GPT-4o and GPT-4o-mini can generate ~12,000 words, while GPT-3.5-turbo is limited to ~3,000 words.

