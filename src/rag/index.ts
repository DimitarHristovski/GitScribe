/**
 * RAG Pipeline - Main Service
 * Orchestrates indexing, retrieval, and integration with LangGraph
 */

import { SimpleRepo } from '../lib/github-service';
import { fetchGitHubFile, listAllFiles } from '../lib/github-service';
import { chunkCodeFile } from './chunker';
import { embedDocuments } from './embedder';
import { storeVectors, initVectorStore, deleteVectorsByRepo } from './vector-store';
import { search, formatResultsAsContext } from './retriever';
import { RagDocument, RagSearchResult } from './types';

/**
 * Index a repository for RAG
 */
export async function indexRepository(repo: SimpleRepo): Promise<number> {
  console.log(`[RAG] Indexing repository: ${repo.fullName}`);
  
  // Initialize vector store
  await initVectorStore();
  
  // Delete existing vectors for this repo
  await deleteVectorsByRepo(repo.fullName);
  
  // Get all files in the repository
  const files = await listAllFiles(
    repo.owner,
    repo.name,
    '',
    repo.defaultBranch,
    undefined,
    3 // max depth
  );
  
  // Filter to code files only
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h', '.hpp'];
  const codeFiles = files.filter(file => 
    codeExtensions.some(ext => file.toLowerCase().endsWith(ext))
  );
  
  console.log(`[RAG] Found ${codeFiles.length} code files to index`);
  
  // Chunk all files
  const allChunks: RagDocument[] = [];
  
  for (const filePath of codeFiles.slice(0, 50)) { // Limit to 50 files for now
    try {
      const content = await fetchGitHubFile(
        repo.owner,
        repo.name,
        filePath,
        repo.defaultBranch
      );
      
      if (content) {
        const chunks = chunkCodeFile(repo.fullName, filePath, content);
        allChunks.push(...chunks);
      }
    } catch (error) {
      console.warn(`[RAG] Failed to process ${filePath}:`, error);
    }
  }
  
  console.log(`[RAG] Created ${allChunks.length} chunks`);
  
  if (allChunks.length === 0) {
    return 0;
  }
  
  // Generate embeddings
  console.log(`[RAG] Generating embeddings...`);
  const vectors = await embedDocuments(allChunks);
  
  // Store vectors
  console.log(`[RAG] Storing ${vectors.length} vectors...`);
  await storeVectors(vectors, allChunks);
  
  console.log(`[RAG] Successfully indexed ${vectors.length} chunks for ${repo.fullName}`);
  return vectors.length;
}

/**
 * Retrieve relevant context for a query
 */
export async function retrieveContext(
  query: string,
  repoName?: string,
  topK: number = 5
): Promise<string> {
  const results = await search(query, repoName, topK);
  return formatResultsAsContext(results);
}

/**
 * Get search results (for advanced use cases)
 */
export async function getSearchResults(
  query: string,
  repoName?: string,
  topK: number = 5
): Promise<RagSearchResult[]> {
  return search(query, repoName, topK);
}

/**
 * Check if repository is indexed
 */
export async function isRepositoryIndexed(repoName: string): Promise<boolean> {
  await initVectorStore();
  const { getVectorsByRepo } = await import('./vector-store');
  const vectors = await getVectorsByRepo(repoName);
  return vectors.length > 0;
}

