/**
 * RAG Embedding Service
 * Generates embeddings for text chunks using OpenAI API
 */

import { RagDocument, RagVector } from './types';
import { getOpenAIApiKey } from '../lib/langchain-service';

const EMBEDDING_MODEL = 'text-embedding-3-small'; // Cost-effective, good quality
const EMBEDDING_DIMENSION = 1536; // text-embedding-3-small dimension

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Generate embeddings for a batch of documents
 */
export async function embedDocuments(docs: RagDocument[]): Promise<RagVector[]> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key is required for embeddings');
  }
  
  // OpenAI embedding models have a max input of 8192 tokens per request
  // We need to batch by token count, not just document count
  const MAX_TOKENS_PER_BATCH = 7000; // Leave some margin (8192 is the limit)
  const vectors: RagVector[] = [];
  
  let currentBatch: RagDocument[] = [];
  let currentBatchTokens = 0;
  
  for (const doc of docs) {
    const docTokens = estimateTokens(doc.content);
    
    // If adding this doc would exceed the limit, process current batch first
    if (currentBatchTokens + docTokens > MAX_TOKENS_PER_BATCH && currentBatch.length > 0) {
      console.debug(`[RAG] Embedding batch: ${currentBatch.length} chunks (~${currentBatchTokens} tokens)`);
      const batchVectors = await embedBatch(currentBatch, apiKey);
      vectors.push(...batchVectors);
      currentBatch = [];
      currentBatchTokens = 0;
    }
    
    // If a single document exceeds the limit, skip it (expected for large minified files like CSS/JS)
    if (docTokens > MAX_TOKENS_PER_BATCH) {
      // Log as debug since this is expected for minified CSS/JS files
      if (import.meta.env.DEV) {
        console.debug(`[RAG] Skipping chunk that exceeds token limit: ${doc.path} (${docTokens} tokens) - this is expected for large minified files`);
      }
      continue;
    }
    
    currentBatch.push(doc);
    currentBatchTokens += docTokens;
  }
  
  // Process remaining batch
  if (currentBatch.length > 0) {
    console.debug(`[RAG] Embedding final batch: ${currentBatch.length} chunks (~${currentBatchTokens} tokens)`);
    const batchVectors = await embedBatch(currentBatch, apiKey);
    vectors.push(...batchVectors);
  }
  
  console.log(`[RAG] ✓ Generated ${vectors.length} embeddings`);
  return vectors;
}

/**
 * Embed a single batch of documents
 */
async function embedBatch(docs: RagDocument[], apiKey: string): Promise<RagVector[]> {
  try {
    // Use proxy in dev mode, direct API in production
    const isDev = typeof window !== 'undefined' && import.meta.env.DEV;
    const embeddingsUrl = isDev 
      ? '/api/openai/embeddings'  // Use Vite proxy in dev
      : 'https://api.openai.com/v1/embeddings';  // Direct in production
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (isDev) {
      // In dev, pass API key in custom header for proxy
      headers['x-api-key'] = apiKey;
    } else {
      // In production, use Authorization header directly
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(embeddingsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: docs.map(doc => doc.content),
      }),
    });
    
    if (!response.ok) {
      let errorDetails: any = null;
      try {
        errorDetails = await response.json();
      } catch (e) {
        errorDetails = { error: { message: response.statusText } };
      }
      
      const errorMessage = errorDetails.error?.message || errorDetails.error || errorDetails.message || response.statusText;
      
      // Log detailed error for 403 to help diagnose
      if (response.status === 403) {
        console.error('[RAG] 403 Forbidden - Embedding API error details:', {
          status: response.status,
          error: errorDetails,
          errorType: errorDetails.error?.type,
          errorCode: errorDetails.error?.code,
          apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING',
          endpoint: embeddingsUrl,
        });
      }
      
      if (response.status === 403) {
        throw new Error(`Embedding API access forbidden (403): ${errorMessage}. Please check: 1) Your API key is valid and active, 2) Your account has access to embeddings API (text-embedding-3-small), 3) Your account has sufficient credits/quota.`);
      }
      
      throw new Error(`Embedding API error: ${errorMessage}`);
    }
    
    const data = await response.json();
    
    return docs.map((doc, index) => ({
      id: doc.id,
      values: data.data[index].embedding,
      metadata: {
        repoName: doc.repoName,
        path: doc.path,
        startLine: doc.startLine,
        endLine: doc.endLine,
      },
    }));
  } catch (error: any) {
    console.error('Error generating embeddings:', error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
}

/**
 * Generate embedding for a single query string
 */
export async function embedQuery(query: string): Promise<number[]> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key is required for embeddings');
  }
  
  try {
    // Use proxy in dev mode, direct API in production
    const isDev = typeof window !== 'undefined' && import.meta.env.DEV;
    const embeddingsUrl = isDev 
      ? '/api/openai/embeddings'  // Use Vite proxy in dev
      : 'https://api.openai.com/v1/embeddings';  // Direct in production
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (isDev) {
      // In dev, pass API key in custom header for proxy
      headers['x-api-key'] = apiKey;
    } else {
      // In production, use Authorization header directly
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(embeddingsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: query,
      }),
    });
    
    if (!response.ok) {
      let errorDetails: any = null;
      try {
        errorDetails = await response.json();
      } catch (e) {
        errorDetails = { error: { message: response.statusText } };
      }
      
      const errorMessage = errorDetails.error?.message || errorDetails.error || errorDetails.message || response.statusText;
      
      if (response.status === 403) {
        console.error('[RAG] 403 Forbidden - Query embedding error details:', {
          status: response.status,
          error: errorDetails,
          errorType: errorDetails.error?.type,
          errorCode: errorDetails.error?.code,
          apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING',
          endpoint: embeddingsUrl,
        });
        throw new Error(`Embedding API access forbidden (403): ${errorMessage}. Please check: 1) Your API key is valid and active, 2) Your account has access to embeddings API (text-embedding-3-small), 3) Your account has sufficient credits/quota.`);
      }
      
      throw new Error(`Embedding API error: ${errorMessage}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error: any) {
    console.error('Error generating query embedding:', error);
    throw new Error(`Failed to generate query embedding: ${error.message}`);
  }
}

/**
 * Get embedding dimension
 */
export function getEmbeddingDimension(): number {
  return EMBEDDING_DIMENSION;
}

