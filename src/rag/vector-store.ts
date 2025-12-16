/**
 * RAG Vector Store
 * Stores and retrieves vectors using IndexedDB for persistence
 */

import { RagVector, RagDocument } from './types';

// Extended vector type that includes content
export type StoredVector = RagVector & {
  content: string; // Store content for retrieval
};

const DB_NAME = 'gitscribe-rag';
const DB_VERSION = 1;
const STORE_NAME = 'vectors';

let db: IDBDatabase | null = null;

/**
 * Initialize the IndexedDB database
 */
export async function initVectorStore(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('repoName', 'metadata.repoName', { unique: false });
        store.createIndex('path', 'metadata.path', { unique: false });
      }
    };
  });
}

/**
 * Store vectors in the database
 */
export async function storeVectors(vectors: RagVector[], documents: RagDocument[]): Promise<void> {
  if (!db) {
    await initVectorStore();
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    let completed = 0;
    let hasError = false;
    
    // Create a map of document content by ID
    const contentMap = new Map(documents.map(doc => [doc.id, doc.content]));
    
    vectors.forEach((vector) => {
      const storedVector: StoredVector = {
        ...vector,
        content: contentMap.get(vector.id) || '',
      };
      const request = store.put(storedVector);
      request.onsuccess = () => {
        completed++;
        if (completed === vectors.length && !hasError) {
          resolve();
        }
      };
      request.onerror = () => {
        if (!hasError) {
          hasError = true;
          reject(new Error('Failed to store vector'));
        }
      };
    });
    
    if (vectors.length === 0) {
      resolve();
    }
  });
}

/**
 * Get all vectors for a repository
 */
export async function getVectorsByRepo(repoName: string): Promise<StoredVector[]> {
  if (!db) {
    await initVectorStore();
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('repoName');
    const request = index.getAll(repoName);
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to retrieve vectors'));
    };
  });
}

/**
 * Get all vectors
 */
export async function getAllVectors(): Promise<StoredVector[]> {
  if (!db) {
    await initVectorStore();
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to retrieve vectors'));
    };
  });
}

/**
 * Delete vectors for a repository
 */
export async function deleteVectorsByRepo(repoName: string): Promise<void> {
  if (!db) {
    await initVectorStore();
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('repoName');
    const request = index.openCursor(IDBKeyRange.only(repoName));
    
    let deleted = 0;
    let total = 0;
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        total++;
        const deleteRequest = cursor.delete();
        deleteRequest.onsuccess = () => {
          deleted++;
          cursor.continue();
        };
        deleteRequest.onerror = () => {
          reject(new Error('Failed to delete vector'));
        };
      } else {
        // All vectors processed
        if (total === 0 || deleted === total) {
          resolve();
        } else {
          reject(new Error('Some vectors failed to delete'));
        }
      }
    };
    
    request.onerror = () => {
      reject(new Error('Failed to delete vectors'));
    };
  });
}

/**
 * Clear all vectors
 */
export async function clearVectorStore(): Promise<void> {
  if (!db) {
    await initVectorStore();
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear vector store'));
  });
}

/**
 * Get vector count
 */
export async function getVectorCount(): Promise<number> {
  if (!db) {
    await initVectorStore();
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to count vectors'));
    };
  });
}

