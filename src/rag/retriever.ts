/**
 * RAG Retrieval Service
 * Searches for relevant chunks using cosine similarity
 */

import { RagVector, RagSearchResult, RagDocument } from './types';
import { StoredVector } from './vector-store';
import { embedQuery } from './embedder';
import { getAllVectors, getVectorsByRepo } from './vector-store';

/**
 * Search for relevant documents using semantic similarity
 */
export async function search(
  query: string,
  repoName?: string,
  topK: number = 5
): Promise<RagSearchResult[]> {
  // Get query embedding
  const queryEmbedding = await embedQuery(query);
  
  // Get vectors to search
  const vectors = repoName 
    ? await getVectorsByRepo(repoName)
    : await getAllVectors();
  
  if (vectors.length === 0) {
    return [];
  }
  
  // Calculate cosine similarity for each vector
  const results: RagSearchResult[] = vectors.map((vector) => {
    const score = cosineSimilarity(queryEmbedding, vector.values);
    return {
      doc: vectorToDocument(vector),
      score,
    };
  });
  
  // Sort by score (highest first) and return top K
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(result => result.score > 0.5); // Minimum similarity threshold
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }
  
  return dotProduct / denominator;
}

/**
 * Convert vector back to document
 */
function vectorToDocument(vector: StoredVector): RagDocument {
  return {
    id: vector.id,
    repoName: vector.metadata.repoName,
    path: vector.metadata.path,
    content: vector.content,
    startLine: vector.metadata.startLine,
    endLine: vector.metadata.endLine,
  };
}

/**
 * Format search results as context for LLM
 */
export function formatResultsAsContext(results: RagSearchResult[]): string {
  if (results.length === 0) {
    return '';
  }
  
  const contextParts = results.map((result, index) => {
    const { doc } = result;
    const location = doc.startLine && doc.endLine
      ? `lines ${doc.startLine}-${doc.endLine}`
      : 'file';
    
    return `[Context ${index + 1}] ${doc.path} (${location}):
${doc.content}`;
  });
  
  return `\n\nRelevant code context:\n${contextParts.join('\n\n')}\n`;
}

