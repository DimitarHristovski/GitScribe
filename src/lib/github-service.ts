import { Project } from '../types';

interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch?: string;
}

/**
 * Simple repository information for listing user repos
 */
export type SimpleRepo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  htmlUrl: string;
  description?: string;
  defaultBranch: string;
  lastPushedAt?: string;
  language?: string;
};

/**
 * Parse GitHub URL to extract owner, repo, and branch
 */
export function parseGitHubUrl(url: string): GitHubRepoInfo | null {
  // Support formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo/tree/branch
  // github.com/owner/repo
  // owner/repo
  
  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
    /^github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/,
    /^([^\/]+)\/([^\/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        branch: match[3] || 'main',
      };
    }
  }

  return null;
}

/**
 * Set GitHub token in localStorage
 */
export function setGitHubToken(token: string): void {
  try {
    localStorage.setItem('github_token', token);
    console.log('GitHub token stored successfully');
  } catch (e) {
    console.error('Failed to store GitHub token:', e);
    throw new Error('Could not store GitHub token in localStorage');
  }
}

/**
 * Get GitHub token from environment or localStorage
 */
export function getGitHubToken(): string | null {
  // First try environment variable (for build-time config)
  const envToken = import.meta.env.VITE_GITHUB_TOKEN;
  if (envToken) {
    return envToken;
  }
  
  // Then try localStorage (for runtime config)
  try {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
      return storedToken;
    }
  } catch (e) {
    console.warn('Could not access localStorage for GitHub token');
  }
  
  return null;
}

/**
 * List repository contents using GitHub API
 */
export async function listGitHubContents(
  owner: string,
  repo: string,
  path: string = '',
  branch: string = 'main',
  token?: string
): Promise<Array<{ name: string; type: 'file' | 'dir'; path: string; size?: number }>> {
  try {
    const githubToken = token || getGitHubToken();
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (githubToken) {
      headers.Authorization = `token ${githubToken}`;
    }

    const apiPath = path ? `contents/${path}` : 'contents';
    const url = `https://api.github.com/repos/${owner}/${repo}/${apiPath}?ref=${branch}`;
    
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to list contents: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle both single file and directory responses
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        name: item.name,
        type: item.type === 'file' ? 'file' : 'dir',
        path: item.path,
        size: item.size,
      }));
    } else if (data.type === 'file') {
      return [{
        name: data.name,
        type: 'file' as const,
        path: data.path,
        size: data.size,
      }];
    }

    return [];
  } catch (error: any) {
    console.error('Error listing GitHub contents:', error);
    throw new Error(`Failed to list repository contents: ${error.message}`);
  }
}

/**
 * Recursively list all files in a repository directory
 */
export async function listAllFiles(
  owner: string,
  repo: string,
  path: string = '',
  branch: string = 'main',
  token?: string,
  maxDepth: number = 3
): Promise<string[]> {
  if (maxDepth <= 0) return [];

  const files: string[] = [];
  try {
    const contents = await listGitHubContents(owner, repo, path, branch, token);
    
    for (const item of contents) {
      if (item.type === 'file') {
        files.push(item.path);
      } else if (item.type === 'dir' && !item.name.startsWith('.') && item.name !== 'node_modules') {
        const subFiles = await listAllFiles(owner, repo, item.path, branch, token, maxDepth - 1);
        files.push(...subFiles);
      }
    }
  } catch (error) {
    console.warn(`Failed to list files in ${path}:`, error);
  }

  return files;
}

/**
 * Fetch file content from GitHub
 */
export async function fetchGitHubFile(owner: string, repo: string, path: string, branch: string = 'main', token?: string): Promise<string | null> {
  try {
    const githubToken = token || getGitHubToken();
    
    // If we have a token, use GitHub API to avoid CORS issues
    if (githubToken) {
      try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
        console.log('Fetching GitHub file via API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${githubToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.content && data.encoding === 'base64') {
            const content = atob(data.content.replace(/\s/g, ''));
            console.log(`Successfully fetched ${path} via API, length: ${content.length}`);
            return content;
          }
        } else if (response.status === 404) {
          // Try main branch if master fails
          if (branch === 'master') {
            console.log('Trying main branch instead of master');
            return fetchGitHubFile(owner, repo, path, 'main', token);
          }
          console.log(`File not found: ${path} (404)`);
          return null;
        }
        // If API fails, fall through to raw URL method
        console.warn('GitHub API request failed, falling back to raw URL');
      } catch (apiError) {
        console.warn('GitHub API request error, falling back to raw URL:', apiError);
      }
    }
    
    // Fallback: Use GitHub Raw Content API (may have CORS issues without token)
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    console.log('Fetching GitHub file via raw URL:', url);
    
    const headers: HeadersInit = {
      'Accept': 'application/json, text/plain, */*',
    };
    
    // Add Authorization header if token is available (though raw URLs don't support auth)
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    console.log('GitHub file response status:', response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Try main branch if master fails
        if (branch === 'master') {
          console.log('Trying main branch instead of master');
          return fetchGitHubFile(owner, repo, path, 'main', token);
        }
        console.log(`File not found: ${path} (404)`);
        return null;
      }
      if (response.status === 403) {
        throw new Error('Rate limited or repository is private. Try using a GitHub personal access token.');
      }
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    console.log(`Successfully fetched ${path}, length: ${text.length}`);
    return text;
  } catch (error: any) {
    console.error('Error fetching GitHub file:', error);
    if (error.message) {
      throw error;
    }
    throw new Error(`Network error: ${error.message || 'Failed to fetch from GitHub'}`);
  }
}

/**
 * Fetch project data from GitHub repository
 */
export async function importProjectFromGitHub(githubUrl: string, token?: string): Promise<Project | null> {
  console.log('Starting GitHub import for URL:', githubUrl);
  
  const repoInfo = parseGitHubUrl(githubUrl);
  if (!repoInfo) {
    throw new Error('Invalid GitHub URL. Please use format: https://github.com/owner/repo or owner/repo');
  }

  const { owner, repo, branch = 'main' } = repoInfo;
  console.log('Parsed repo info:', { owner, repo, branch });

  // Use provided token or get from storage
  const githubToken = token || getGitHubToken();
  if (githubToken) {
    console.log('Using GitHub token for authenticated requests');
    // If we have a token, use the GitHub API method which is more reliable
    try {
      return await importProjectFromGitHubAPI(githubUrl, githubToken);
    } catch (apiError: any) {
      console.warn('GitHub API method failed, falling back to raw content:', apiError.message);
      // Fall through to raw content method
    }
  }

  try {
    // Try to fetch project.json or project.config.json
    const projectFiles = [
      'project.json',
      'project.config.json',
      '.project.json',
      'config/project.json',
    ];

    let projectData: any = null;

    for (const file of projectFiles) {
      console.log(`Trying to fetch ${file}...`);
      try {
        const content = await fetchGitHubFile(owner, repo, file, branch, githubToken || undefined);
        if (content) {
          try {
            projectData = JSON.parse(content);
            console.log(`Successfully parsed ${file}`);
            break;
          } catch (e: any) {
            console.warn(`Failed to parse ${file}:`, e.message);
          }
        }
      } catch (error: any) {
        console.warn(`Error fetching ${file}:`, error.message);
        // Continue to next file
      }
    }

    // If no project.json found, try to infer from repository structure
    if (!projectData) {
      console.log('No project.json found, creating default project structure');
      
      // Fetch README to get project name and description
      let readme: string | null = null;
      try {
        readme = await fetchGitHubFile(owner, repo, 'README.md', branch, githubToken || undefined);
      } catch (e) {
        console.warn('Could not fetch README:', e);
      }
      
      projectData = {
        name: repo,
        description: readme ? readme.split('\n')[0].replace(/^#\s*/, '') : `Imported from ${owner}/${repo}`,
        theme: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          background: '#ffffff',
          text: '#1f2937',
          fontFamily: 'Inter, sans-serif',
        },
        pages: [
          {
            id: `page_${Date.now()}`,
            project_id: `project_${Date.now()}`,
            path: '/',
            title: 'Home',
            order: 0,
            sections: [],
          },
        ],
      };

      console.log('Created default project structure:', projectData);
    }

    // Ensure the project has the correct structure
    const project: Project = {
      id: `github_${owner}_${repo}_${Date.now()}`,
      user_id: '', // Will be set when saved
      name: projectData.name || repo,
      description: projectData.description || `Imported from ${owner}/${repo}`,
      theme: projectData.theme || {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#1f2937',
        fontFamily: 'Inter, sans-serif',
      },
      pages: projectData.pages || [],
      iconName: projectData.iconName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Final project structure:', project);
    console.log('Project pages count:', project.pages?.length || 0);
    
    return project;
  } catch (error: any) {
    console.error('Error importing from GitHub:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to import project from GitHub: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Fetch project from GitHub using GitHub API (more reliable but requires token)
 */
export async function importProjectFromGitHubAPI(
  githubUrl: string,
  token?: string
): Promise<Project | null> {
  const repoInfo = parseGitHubUrl(githubUrl);
  if (!repoInfo) {
    throw new Error('Invalid GitHub URL');
  }

  const { owner, repo, branch = 'main' } = repoInfo;

  try {
    // Use GitHub API to get repository info
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    // Get repository info
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoResponse.ok) {
      throw new Error(`Repository not found: ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();

    // Try to get project.json
    const projectFiles = [
      'project.json',
      'project.config.json',
      '.project.json',
      'config/project.json',
    ];

    let projectData: any = null;

    for (const file of projectFiles) {
      try {
        const fileResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file}?ref=${branch}`,
          { headers }
        );

        if (fileResponse.ok) {
          const fileData = await fileResponse.json();
          if (fileData.content) {
            const content = atob(fileData.content.replace(/\s/g, ''));
            projectData = JSON.parse(content);
            break;
          }
        }
      } catch (e) {
        // Continue to next file
      }
    }

    // Create project from repository data
    const project: Project = {
      id: `github_${owner}_${repo}_${Date.now()}`,
      user_id: '',
      name: projectData?.name || repoData.name,
      description: projectData?.description || repoData.description || `Imported from ${owner}/${repo}`,
      theme: projectData?.theme || {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#1f2937',
        fontFamily: 'Inter, sans-serif',
      },
      pages: projectData?.pages || [],
      iconName: projectData?.iconName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return project;
  } catch (error: any) {
    console.error('Error importing from GitHub API:', error);
    throw new Error(`Failed to import project: ${error.message}`);
  }
}

/**
 * Fetch all repositories for the authenticated user
 */
export async function fetchUserRepos(options?: {
  visibility?: 'all' | 'public' | 'private';
  affiliation?: string;
  perPage?: number;
  page?: number;
}): Promise<SimpleRepo[]> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token is required.');
  }

  const {
    visibility = 'all',
    affiliation,
    perPage = 100,
    page = 1,
  } = options || {};

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${token}`,
  };

  const params = new URLSearchParams({
    per_page: perPage.toString(),
    page: page.toString(),
  });

  if (visibility !== 'all') {
    params.append('visibility', visibility);
  }

  if (affiliation) {
    params.append('affiliation', affiliation);
  }

  try {
    const url = `https://api.github.com/user/repos?${params.toString()}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid or expired GitHub token. Please check your token.');
      }
      if (response.status === 403) {
        throw new Error('Rate limited or insufficient permissions. Please check your token permissions.');
      }
      throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      htmlUrl: repo.html_url,
      description: repo.description || undefined,
      defaultBranch: repo.default_branch || 'main',
      lastPushedAt: repo.pushed_at || undefined,
      language: repo.language || undefined,
    }));
  } catch (error: any) {
    console.error('Error fetching user repositories:', error);
    if (error.message) {
      throw error;
    }
    throw new Error(`Failed to fetch repositories: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get the SHA of a file in a repository (required for updating files)
 */
export async function getFileSha(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main',
  token?: string
): Promise<string | null> {
  const githubToken = token || getGitHubToken();
  if (!githubToken) {
    throw new Error('GitHub token is required for file operations.');
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${githubToken}`,
  };

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(url, { headers });

    if (response.status === 404) {
      return null; // File doesn't exist yet
    }

    if (!response.ok) {
      throw new Error(`Failed to get file SHA: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.sha || null;
  } catch (error: any) {
    console.error('Error getting file SHA:', error);
    if (error.message && error.message.includes('Failed to get file SHA')) {
      throw error;
    }
    throw new Error(`Failed to get file SHA: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Create or update a file in a repository using GitHub API
 * This is equivalent to committing and pushing a file
 */
export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string = 'main',
  token?: string,
  committer?: { name: string; email: string }
): Promise<{ commit: { sha: string; html_url: string } }> {
  const githubToken = token || getGitHubToken();
  if (!githubToken) {
    throw new Error('GitHub token is required for file operations.');
  }

  // Get existing file SHA if it exists
  const sha = await getFileSha(owner, repo, path, branch, githubToken);

  // Encode content to base64
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${githubToken}`,
    'Content-Type': 'application/json',
  };

  const body: any = {
    message,
    content: encodedContent,
    branch,
  };

  // Include SHA if updating existing file
  if (sha) {
    body.sha = sha;
  }

  // Include committer info if provided
  if (committer) {
    body.committer = committer;
  }

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 409) {
        throw new Error('File was modified by another commit. Please try again.');
      }
      if (response.status === 403) {
        throw new Error('Insufficient permissions. Token needs repo scope.');
      }
      throw new Error(
        `Failed to create/update file: ${response.status} ${response.statusText}. ${errorData.message || ''}`
      );
    }

    const data = await response.json();
    return {
      commit: {
        sha: data.commit.sha,
        html_url: data.commit.html_url,
      },
    };
  } catch (error: any) {
    console.error('Error creating/updating file:', error);
    if (error.message && error.message.includes('Failed to create/update file')) {
      throw error;
    }
    throw new Error(`Failed to create/update file: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Delete a file from a repository
 */
export async function deleteFile(
  owner: string,
  repo: string,
  path: string,
  message: string,
  branch: string = 'main',
  token?: string,
  committer?: { name: string; email: string }
): Promise<{ commit: { sha: string; html_url: string } }> {
  const githubToken = token || getGitHubToken();
  if (!githubToken) {
    throw new Error('GitHub token is required for file operations.');
  }

  // Get existing file SHA (required for deletion)
  const sha = await getFileSha(owner, repo, path, branch, githubToken);
  if (!sha) {
    throw new Error('File does not exist and cannot be deleted.');
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${githubToken}`,
    'Content-Type': 'application/json',
  };

  const body: any = {
    message,
    sha,
    branch,
  };

  if (committer) {
    body.committer = committer;
  }

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to delete file: ${response.status} ${response.statusText}. ${errorData.message || ''}`
      );
    }

    const data = await response.json();
    return {
      commit: {
        sha: data.commit.sha,
        html_url: data.commit.html_url,
      },
    };
  } catch (error: any) {
    console.error('Error deleting file:', error);
    if (error.message && error.message.includes('Failed to delete file')) {
      throw error;
    }
    throw new Error(`Failed to delete file: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get the latest commit SHA for a branch
 */
export async function getLatestCommitSha(
  owner: string,
  repo: string,
  branch: string = 'main',
  token?: string
): Promise<string | null> {
  const githubToken = token || getGitHubToken();
  if (!githubToken) {
    throw new Error('GitHub token is required to check commits.');
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${githubToken}`,
  };

  try {
    // Get the branch reference
    const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`;
    const refResponse = await fetch(refUrl, { headers });

    if (!refResponse.ok) {
      throw new Error(`Failed to get branch ref: ${refResponse.status} ${refResponse.statusText}`);
    }

    const refData = await refResponse.json();
    return refData.object?.sha || null;
  } catch (error: any) {
    console.error('Error getting latest commit SHA:', error);
    throw new Error(`Failed to get latest commit SHA: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Check if a commit is a merge commit or push to main
 */
export async function getCommitInfo(
  owner: string,
  repo: string,
  sha: string,
  token?: string
): Promise<{ message: string; isMerge: boolean; author: string; date: string } | null> {
  const githubToken = token || getGitHubToken();
  if (!githubToken) {
    throw new Error('GitHub token is required to check commits.');
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${githubToken}`,
  };

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/commits/${sha}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to get commit info: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const isMerge = data.parents?.length > 1 || false;
    
    return {
      message: data.message || '',
      isMerge,
      author: data.author?.name || 'Unknown',
      date: data.author?.date || new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error getting commit info:', error);
    throw new Error(`Failed to get commit info: ${error.message || 'Unknown error'}`);
  }
}

