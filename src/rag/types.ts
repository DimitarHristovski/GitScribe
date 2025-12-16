export type RagDocument = {
  id: string;
  repoName: string;
  path: string;        // file path
  content: string;     // chunk text
  startLine?: number;
  endLine?: number;
};

export type RagVector = {
  id: string;
  values: number[];
  metadata: {
    repoName: string;
    path: string;
    startLine?: number;
    endLine?: number;
  };
};

export type RagSearchResult = {
  doc: RagDocument;
  score: number;
};

