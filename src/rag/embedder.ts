/**
 * RAG Embedding Service
 * Generates embeddings for text chunks using OpenAI API
 */

import { RagDocument, RagVector } from './types';
import { getOpenAIApiKey } from '../lib/langchain-service';

const EMBEDDING_MODEL = 'text-embedding-3-small'; // Cost-effective, good quality
const EMBEDDING_DIMENSION = 1536; // text-embedding-3-small dimension

/**
 * Generate embeddings for a batch of documents
 */
export async function embedDocuments(docs: RagDocument[]): Promise<RagVector[]> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key is required for embeddings');
  }
  
  // Batch process to avoid rate limits (OpenAI allows up to 2048 inputs per request)
  const batchSize = 100;
  const vectors: RagVector[] = [];
  
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    const batchVectors = await embedBatch(batch, apiKey);
    vectors.push(...batchVectors);
  }
  
  return vectors;
}

/**
 * Embed a single batch of documents
 */
async function embedBatch(docs: RagDocument[], apiKey: string): Promise<RagVector[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: docs.map(doc => doc.content),
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Embedding API error: ${error.error?.message || response.statusText}`);
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
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: query,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Embedding API error: ${error.error?.message || response.statusText}`);
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

