# Model Usage and Hallucination Analysis in DocsWriter.ts

## How Models Are Used

### Model Selection
```typescript
// Line 42: Gets user-selected model from state
const selectedModel = state.selectedModel || 'gpt-4o-mini';

// Line 48: Uses selected model for all documentation generation
const modelToUse = selectedModel;

// Line 1527: Passes model to callLangChain
modelToUse, // Use the user's selected model
```

**Key Point**: All models use the **EXACT SAME** prompts, anti-hallucination measures, and temperature (0.2).

### Model-Specific Differences

| Model | MaxTokens | Temperature | Anti-Hallucination | RAG Context | Prompts |
|-------|-----------|-------------|-------------------|-------------|---------|
| **GPT-4o** | 16,384 | 0.2 | ✅ Same | ✅ Same | ✅ Same |
| **GPT-4o-mini** | 16,384 | 0.2 | ✅ Same | ✅ Same | ✅ Same |
| **GPT-4-turbo** | 8,192 | 0.2 | ✅ Same | ✅ Same | ✅ Same |
| **GPT-4** | 8,192 | 0.2 | ✅ Same | ✅ Same | ✅ Same |
| **GPT-3.5-turbo** | 4,096 | 0.2 | ✅ Same | ✅ Same | ✅ Same |

**Only Difference**: `maxTokens` limit (affects maximum output length, not hallucination)

---

## Anti-Hallucination Measures (Applied to ALL Models)

### 1. **4-Step Verification Process** (Same for all models)
```typescript
STEP 1: Extract features from ALL available sources (RAG, Analysis, Directory)
STEP 2: Verify each element
STEP 3: Create verified list (PRIMARY source of truth)
STEP 4: Only AFTER verification, generate documentation
```

### 2. **Mandatory Feature List** (Same for all models)
```typescript
MANDATORY: Before writing documentation, you MUST:
1. Extract features from available sources
2. Create verified list
3. Document ONLY items from this list
4. Cite sources (RAG context, analysis, or directory structure)
5. If ALL sources are empty, then state "No features found"
```

### 3. **Explicit Anti-Invention Warnings** (Same for all models)
```typescript
CRITICAL - DO NOT INVENT CONTENT:
- DO NOT invent features, functions, or capabilities
- DO NOT make up API endpoints, components, or modules
- ONLY document what you can see in actual code, RAG context, and repository analysis
- If you invent even ONE feature not in your verified list, you FAIL
```

### 4. **RAG Context** (Same for all models)
- 24 chunks of context (8 database + 8 purpose + 8 section-specific)
- Fallback to 20 chunks if separate queries fail
- Same RAG retrieval for all models

### 5. **Temperature** (Same for all models)
- **0.2** for all models (low temperature = more consistent, less creative/hallucinatory)

---

## Are All Models Hallucinating?

### Short Answer: **No, but some models are MORE LIKELY to hallucinate**

### Model-Specific Hallucination Risk

| Model | Hallucination Risk | Why |
|-------|-------------------|-----|
| **GPT-4o** | ⭐ **LOWEST** | Best at following complex instructions, most accurate |
| **GPT-4o-mini** | ⭐⭐ **LOW** | Good at following instructions, but less capable than GPT-4o |
| **GPT-4-turbo** | ⭐⭐ **LOW** | Good accuracy, follows instructions well |
| **GPT-4** | ⭐⭐ **LOW** | Good accuracy, but older than GPT-4o |
| **GPT-3.5-turbo** | ⭐⭐⭐ **MODERATE** | Older model, may struggle with complex verification steps |

### Why Some Models May Still Hallucinate

1. **Instruction Following Capability**
   - GPT-4o: Best at following complex multi-step verification
   - GPT-3.5-turbo: May struggle with complex verification steps
   - All models receive the same instructions, but execution varies

2. **Context Window Understanding**
   - GPT-4o: Better at understanding and using RAG context
   - GPT-3.5-turbo: May have difficulty processing 24 chunks effectively
   - All models get the same RAG context, but utilization varies

3. **Token Limits**
   - GPT-4o/GPT-4o-mini: 16,384 tokens (can generate comprehensive docs)
   - GPT-3.5-turbo: 4,096 tokens (may be cut off mid-generation)
   - Lower token limits may cause incomplete verification

4. **Training Data**
   - GPT-4o: Newer training, better at code understanding
   - GPT-3.5-turbo: Older training, may rely more on training data patterns
   - All models have the same anti-hallucination prompts, but base behavior differs

---

## Current Anti-Hallucination Measures (Applied Equally)

### ✅ What's Working for ALL Models

1. **Same Prompts**: All models receive identical anti-hallucination instructions
2. **Same Verification Steps**: 4-step process applied to all models
3. **Same RAG Context**: 24 chunks of context for all models
4. **Same Temperature**: 0.2 for all models (low = less hallucination)
5. **Same Fallback Sources**: Repository Analysis and Directory Structure for all models

### ⚠️ Potential Issues

1. **Model Capability Differences**
   - GPT-3.5-turbo may struggle with complex verification steps
   - GPT-4o is better at following instructions precisely

2. **Token Limit Constraints**
   - GPT-3.5-turbo (4,096 tokens) may be cut off before completing verification
   - GPT-4o (16,384 tokens) has more room for comprehensive verification

3. **RAG Context Utilization**
   - Better models (GPT-4o) use RAG context more effectively
   - Older models (GPT-3.5-turbo) may ignore or misuse RAG context

---

## Recommendations

### To Reduce Hallucination Across ALL Models:

1. **Strengthen Verification for Weaker Models**
   - Add model-specific instructions for GPT-3.5-turbo
   - Simplify verification steps for models with lower capabilities

2. **Increase RAG Context for Weaker Models**
   - GPT-3.5-turbo may need more explicit RAG context
   - Add explicit "USE THIS CONTEXT" instructions

3. **Add Model-Specific Prompts**
   ```typescript
   const modelSpecificInstructions = modelToUse.includes('gpt-3.5') 
     ? 'CRITICAL: You are using GPT-3.5-turbo. Pay EXTRA attention to the verification steps. DO NOT skip them.'
     : '';
   ```

4. **Monitor Model Performance**
   - Log which model generated which documentation
   - Track hallucination rates by model
   - Adjust prompts based on model performance

### Current State

- ✅ **All models use the same anti-hallucination measures**
- ✅ **All models get the same RAG context**
- ✅ **All models use the same temperature (0.2)**
- ⚠️ **Model capabilities differ** - better models follow instructions better
- ⚠️ **Token limits differ** - may affect verification completeness

---

## Conclusion

**Are all models hallucinating?**
- **No** - All models have the same anti-hallucination measures
- **But** - Some models (GPT-3.5-turbo) are MORE LIKELY to hallucinate due to:
  - Lower instruction-following capability
  - Smaller token limits (may cut off verification)
  - Older training data
  - Less effective RAG context utilization

**Best Practice**: Use **GPT-4o** or **GPT-4o-mini** for best accuracy and lowest hallucination risk.

