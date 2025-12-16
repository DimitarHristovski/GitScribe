/**
 * RAG Chunking Service
 * Splits code files into meaningful chunks for embedding
 */

import { RagDocument } from './types';

const MAX_CHUNK_SIZE = 1000; // characters
const OVERLAP_SIZE = 200; // characters for overlap between chunks

/**
 * Chunk a code file into smaller pieces
 */
export function chunkCodeFile(
  repoName: string,
  path: string,
  content: string
): RagDocument[] {
  const chunks: RagDocument[] = [];
  const lines = content.split('\n');
  
  // Try to chunk by code structure first (functions, classes, etc.)
  const structureChunks = chunkByStructure(repoName, path, content, lines);
  if (structureChunks.length > 0) {
    return structureChunks;
  }
  
  // Fallback to fixed-size chunks with overlap
  return chunkBySize(repoName, path, content, lines);
}

/**
 * Chunk by code structure (functions, classes, methods)
 */
function chunkByStructure(
  repoName: string,
  path: string,
  content: string,
  lines: string[]
): RagDocument[] {
  const chunks: RagDocument[] = [];
  const extension = path.split('.').pop()?.toLowerCase() || '';
  
  // Detect language-specific patterns
  const patterns = getLanguagePatterns(extension);
  if (!patterns) return [];
  
  let currentChunk: string[] = [];
  let startLine = 1;
  let braceCount = 0;
  let inStructure = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Check for structure start
    const structureMatch = line.match(patterns.start);
    if (structureMatch && !inStructure) {
      // Save previous chunk if exists
      if (currentChunk.length > 0) {
        chunks.push(createChunk(repoName, path, currentChunk.join('\n'), startLine, lineNum - 1));
      }
      // Start new chunk
      currentChunk = [line];
      startLine = lineNum;
      inStructure = true;
      braceCount = countBraces(line);
      continue;
    }
    
    if (inStructure) {
      currentChunk.push(line);
      braceCount += countBraces(line);
      
      // Check if structure is complete
      if (braceCount === 0 && currentChunk.length > 1) {
        const chunkContent = currentChunk.join('\n');
        if (chunkContent.length > 50) { // Minimum chunk size
          chunks.push(createChunk(repoName, path, chunkContent, startLine, lineNum));
        }
        currentChunk = [];
        inStructure = false;
      }
    }
  }
  
  // Add remaining content
  if (currentChunk.length > 0) {
    chunks.push(createChunk(repoName, path, currentChunk.join('\n'), startLine, lines.length));
  }
  
  return chunks.length > 0 ? chunks : [];
}

/**
 * Chunk by fixed size with overlap
 */
function chunkBySize(
  repoName: string,
  path: string,
  content: string,
  lines: string[]
): RagDocument[] {
  const chunks: RagDocument[] = [];
  let currentChunk: string[] = [];
  let currentSize = 0;
  let startLine = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineSize = line.length + 1; // +1 for newline
    
    if (currentSize + lineSize > MAX_CHUNK_SIZE && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(createChunk(repoName, path, currentChunk.join('\n'), startLine, i));
      
      // Start new chunk with overlap
      const overlapLines = currentChunk.slice(-Math.floor(OVERLAP_SIZE / 50));
      currentChunk = overlapLines;
      currentSize = overlapLines.join('\n').length;
      startLine = i - overlapLines.length + 1;
    }
    
    currentChunk.push(line);
    currentSize += lineSize;
  }
  
  // Add final chunk
  if (currentChunk.length > 0) {
    chunks.push(createChunk(repoName, path, currentChunk.join('\n'), startLine, lines.length));
  }
  
  return chunks;
}

/**
 * Get language-specific patterns for structure detection
 */
function getLanguagePatterns(extension: string): { start: RegExp } | null {
  const patterns: Record<string, { start: RegExp }> = {
    'js': { start: /^(export\s+)?(async\s+)?(function|class|const|let|var)\s+\w+/ },
    'ts': { start: /^(export\s+)?(async\s+)?(function|class|const|let|var|interface|type|enum)\s+\w+/ },
    'jsx': { start: /^(export\s+)?(function|const|class)\s+\w+|^const\s+\w+\s*=\s*(\(|async\s*\()/ },
    'tsx': { start: /^(export\s+)?(function|const|class|interface|type)\s+\w+|^const\s+\w+\s*[:=]\s*(\(|async\s*\()/ },
    'py': { start: /^(def|class|async\s+def)\s+\w+/ },
    'java': { start: /^(public|private|protected)?\s*(static\s+)?(class|interface|enum)\s+\w+/ },
    'go': { start: /^(func|type|const|var)\s+\w+/ },
    'rs': { start: /^(pub\s+)?(fn|struct|enum|impl|trait|mod)\s+\w+/ },
    'cpp': { start: /^(class|struct|namespace|template)\s+\w+|^\w+\s*::\s*\w+\s*\(/ },
    'c': { start: /^(struct|typedef|enum)\s+\w+|^\w+\s+\w+\s*\(/ },
  };
  
  return patterns[extension] || null;
}

/**
 * Count braces to track structure depth
 */
function countBraces(line: string): number {
  const open = (line.match(/\{/g) || []).length;
  const close = (line.match(/\}/g) || []).length;
  return open - close;
}

/**
 * Create a chunk document
 */
function createChunk(
  repoName: string,
  path: string,
  content: string,
  startLine: number,
  endLine: number
): RagDocument {
  return {
    id: `${repoName}:${path}:${startLine}:${endLine}`,
    repoName,
    path,
    content: content.trim(),
    startLine,
    endLine,
  };
}

