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
  console.log(`[RAG] Indexing: ${repo.fullName}`);
  
  // Initialize vector store
  await initVectorStore();
  
  // Delete existing vectors for this repo
  await deleteVectorsByRepo(repo.fullName);
  
  // Get GitHub token first to ensure we have it for all API calls
  const { getGitHubToken } = await import('../lib/github-service');
  const githubToken = getGitHubToken();
  
  if (!githubToken) {
    console.warn(`[RAG] ⚠️ No GitHub token found. Indexing will fail for private repositories or may hit rate limits.`);
    console.warn(`[RAG] Please configure a GitHub token in Settings to enable RAG indexing.`);
  } else {
    console.debug(`[RAG] ✓ GitHub token found, using authenticated requests`);
  }
  
  // Get all files in the repository (increased depth to capture more files)
  // Pass GitHub token to ensure authenticated requests
  const files = await listAllFiles(
    repo.owner,
    repo.name,
    '',
    repo.defaultBranch,
    githubToken || undefined, // Pass token explicitly
    5 // max depth (increased from 3 to capture more nested files)
  );
  
  if (files.length === 0) {
    console.warn(`[RAG] ⚠️ No files found for ${repo.fullName}. This may indicate:`);
    console.warn(`[RAG] 1. GitHub API access failed (401/403 errors) - check token validity`);
    console.warn(`[RAG] 2. Repository is empty or has no code files`);
    console.warn(`[RAG] 3. All files were filtered out (binary, minified, etc.)`);
    if (githubToken) {
      console.warn(`[RAG] Token is present but may be invalid or expired. Check token permissions (repo scope required).`);
    }
  } else {
    console.debug(`[RAG] Found ${files.length} files to process`);
  }
  
  // Files to exclude (too large, binary, or not useful)
  const excludePatterns = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'node_modules',
    '.git',
    '.vscode',
    '.idea',
    'dist',
    'build',
    '.next',
    '.nuxt',
    '.cache',
    '.DS_Store',
    'Thumbs.db'
  ];
  
  // Binary file extensions to exclude (can't be meaningfully indexed)
  // Note: We allow .db, .sqlite, .sqlite3 files - they'll be checked for text content
  const binaryExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', // Images
    '.woff', '.woff2', '.ttf', '.eot', '.otf', // Fonts
    '.mp4', '.mp3', '.avi', '.mov', '.wmv', // Media
    '.zip', '.tar', '.gz', '.rar', '.7z', // Archives
    '.exe', '.dll', '.so', '.dylib', '.bin', // Binaries
    '.pdf', // PDFs (would need special parsing)
    '.xlsx', '.xls', '.docx', '.doc' // Office files
    // Note: .db, .sqlite, .sqlite3 are NOT excluded - they may contain text-based schemas or SQL
  ];
  
  // Minified file patterns to exclude (too large and not useful for RAG)
  const minifiedFilePatterns = [
    /\.min\.(css|js)$/i,        // .min.css, .min.js
    /\.bundle\.(css|js)$/i,     // .bundle.css, .bundle.js
    /vendor\.(css|js)$/i,       // vendor.css, vendor.js
    /bootstrap\.min\.(css|js)$/i, // bootstrap.min.css, bootstrap.min.js
  ];
  
  // Database-related file patterns to prioritize (these are important for understanding the app)
  const databaseFilePatterns = [
    /\.sql$/i,           // SQL files
    /migration/i,        // Migration files
    /seed/i,             // Seed data files
    /schema/i,           // Schema files
    /fixture/i,          // Test fixtures
    /mock.*data/i,       // Mock data
    /\.db$/i,            // Database files (may contain text)
    /\.sqlite$/i,        // SQLite files
    /\.sqlite3$/i,       // SQLite3 files
    /prisma/i,           // Prisma schema files
    /typeorm/i,          // TypeORM entities
    /sequelize/i,        // Sequelize models
    /drizzle/i,          // Drizzle schema
    /knex/i,             // Knex migrations
    /database/i,         // Database-related files
    /models?\.(ts|js|py|java|go|rs)$/i  // Model files
  ];
  
  // Filter files: include all text-based files, exclude build artifacts and binaries
  const filesToIndex = files.filter(file => {
    const lowerFile = file.toLowerCase();
    
    // Exclude files matching exclude patterns (build artifacts, etc.)
    if (excludePatterns.some(pattern => lowerFile.includes(pattern.toLowerCase()))) {
      return false;
    }
    
    // Exclude minified files (too large and not useful for RAG)
    if (minifiedFilePatterns.some(pattern => pattern.test(file))) {
      return false;
    }
    
    // Check if it's a database-related file (always include these)
    const isDatabaseFile = databaseFilePatterns.some(pattern => pattern.test(file));
    if (isDatabaseFile) {
      return true; // Include database files even if they have binary extensions
    }
    
    // Exclude binary files (but database files are already handled above)
    if (binaryExtensions.some(ext => lowerFile.endsWith(ext))) {
      return false;
    }
    
    // Include all other files (code, config, markdown, text, etc.)
    return true;
  });
  
  // Sort files to prioritize database-related files
  const sortedFiles = filesToIndex.sort((a, b) => {
    const aIsDb = databaseFilePatterns.some(pattern => pattern.test(a));
    const bIsDb = databaseFilePatterns.some(pattern => pattern.test(b));
    if (aIsDb && !bIsDb) return -1;
    if (!aIsDb && bIsDb) return 1;
    return 0;
  });
  
  console.debug(`[RAG] Found ${sortedFiles.length} files to index (out of ${files.length} total)`);
  
  // Chunk all files
  const allChunks: RagDocument[] = [];
  
  // Process all files (no limit, but skip very large files)
  const MAX_FILE_SIZE = 500000; // 500KB max per file to avoid memory issues
  
  for (const filePath of sortedFiles) {
    try {
      const content = await fetchGitHubFile(
        repo.owner,
        repo.name,
        filePath,
        repo.defaultBranch,
        githubToken || undefined // Pass token explicitly
      );
      
      if (content) {
        // Skip very large files (likely binary or minified)
        if (content.length > MAX_FILE_SIZE) {
          console.warn(`[RAG] Skipping large file: ${filePath} (${content.length} chars)`);
          continue;
        }
        
        // Try to detect if it's binary (contains null bytes or too many non-printable chars)
        const nullByteCount = (content.match(/\0/g) || []).length;
        const nonPrintableCount = (content.match(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g) || []).length;
        if (nullByteCount > 0 || (nonPrintableCount / content.length) > 0.1) {
          console.warn(`[RAG] Skipping binary file: ${filePath}`);
          continue;
        }
        
        const chunks = chunkCodeFile(repo.fullName, filePath, content);
        allChunks.push(...chunks);
      }
    } catch (error) {
      console.warn(`[RAG] Failed to process ${filePath}:`, error);
    }
  }
  
  console.debug(`[RAG] Created ${allChunks.length} chunks`);
  
  if (allChunks.length === 0) {
    console.warn(`[RAG] ⚠️ No chunks created for ${repo.fullName}. This means no files were successfully processed.`);
    if (githubToken) {
      console.warn(`[RAG] Token is present. Check if files were fetched successfully or if they were all filtered out.`);
    } else {
      console.warn(`[RAG] No token present. This is likely why indexing failed.`);
    }
    return 0;
  }
  
  // Generate embeddings
  console.debug(`[RAG] Generating embeddings...`);
  const vectors = await embedDocuments(allChunks);
  
  // Store vectors
  console.debug(`[RAG] Storing ${vectors.length} vectors...`);
  await storeVectors(vectors, allChunks);
  
  console.log(`[RAG] ✓ Indexed ${vectors.length} chunks for ${repo.fullName}`);
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

