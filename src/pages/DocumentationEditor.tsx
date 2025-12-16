import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, Github, X, Download, Sparkles, Link as LinkIcon, BarChart3, Cpu, Code, FolderOpen, GitCommit, DollarSign, Hash, BookOpen, Settings, Zap, CheckCircle2, RefreshCw, Bell, BellOff, MessageSquare, ChevronDown, ChevronUp, ArrowUp, Clock, TrendingUp, Activity, Layers, Pencil, Save } from 'lucide-react';
import Assistant from '../components/Assistant';
import MultiRepoSelector from '../components/MultiRepoSelector';
import AgentWorkflow from '../components/AgentWorkflow';
import Footer from '../components/Footer';
import { generateDocumentationFromGitHub, exportDocumentation } from '../lib/documentation-writer';
import { parseGitHubUrl, setGitHubToken as saveGitHubToken, getGitHubToken, SimpleRepo, createOrUpdateFile, getLatestCommitSha, getCommitInfo } from '../lib/github-service';
import { setOpenAIApiKey, getOpenAIApiKey } from '../lib/langchain-service';
import { DocOutputFormat, DocSectionType, GeneratedDocs, DocLanguage } from '../types/core';
import { useTranslation } from '../lib/translations';
import { AgentState, AgentStep } from '../lib/agents/types';

interface DocumentationEditorProps {
  onBack: () => void;
}

export default function DocumentationEditor({ onBack }: DocumentationEditorProps) {
  const [githubUrl, setGithubUrl] = useState('');
  const [documentation, setDocumentation] = useState<string>('');
  const [repoDocumentations, setRepoDocumentations] = useState<Map<string, string>>(new Map());
  const [repoDocumentationsFull, setRepoDocumentationsFull] = useState<Map<string, GeneratedDocs>>(new Map());
  const [selectedFormat, setSelectedFormat] = useState<DocOutputFormat>('markdown');
  const [selectedSectionType, setSelectedSectionType] = useState<DocSectionType>('README');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [githubMode, setGithubMode] = useState<'single' | 'multi'>('single');
  const [selectedRepos, setSelectedRepos] = useState<SimpleRepo[]>([]);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [githubToken, setGithubToken] = useState<string>(getGitHubToken() || '');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [openAIApiKey, setOpenAIApiKeyState] = useState<string>(getOpenAIApiKey() || '');
  const [showOpenAIKeyInput, setShowOpenAIKeyInput] = useState(false);
  const [openAIKeySaved, setOpenAIKeySaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedToken, setSavedToken] = useState<string>(getGitHubToken() || '');
  const [savedOpenAIKey, setSavedOpenAIKey] = useState<string>(getOpenAIApiKey() || '');
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; repo?: string } | null>(null);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitBranch, setCommitBranch] = useState('main');
  const [activeTab, setActiveTab] = useState<string>('combined');
  const [showSettings, setShowSettings] = useState(false);
  const [showAssistant, setShowAssistant] = useState<boolean>(true);
  const [showSourceSelection, setShowSourceSelection] = useState<boolean>(true);
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
  const [useAgentWorkflow, setUseAgentWorkflow] = useState<boolean>(false);
  const [showAgentWorkflowModal, setShowAgentWorkflowModal] = useState<boolean>(false);
  const [selectedOutputFormats, setSelectedOutputFormats] = useState<DocOutputFormat[]>(['markdown']);
  const [selectedSectionTypes, setSelectedSectionTypes] = useState<DocSectionType[]>(['README']);
  const [selectedLanguage, setSelectedLanguage] = useState<DocLanguage>(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return (saved as DocLanguage) || 'en';
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedDocumentation, setEditedDocumentation] = useState<string>('');
  const [showExportFormatDialog, setShowExportFormatDialog] = useState<boolean>(false);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
    // Dispatch custom event so Assistant component can react to language changes
    window.dispatchEvent(new Event('languageChanged'));
  }, [selectedLanguage]);

  // Translation hook
  const t = useTranslation(selectedLanguage);

  const [autoFollowRepos, setAutoFollowRepos] = useState<Set<string>>(new Set());
  const [autoFollowEnabled, setAutoFollowEnabled] = useState<boolean>(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCommitShasRef = useRef<Map<string, string>>(new Map());

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      setShowScrollToTop(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Load auto-follow preferences from localStorage
  useEffect(() => {
    const savedAutoFollow = localStorage.getItem('autoFollowRepos');
    const savedEnabled = localStorage.getItem('autoFollowEnabled');
    if (savedAutoFollow) {
      setAutoFollowRepos(new Set(JSON.parse(savedAutoFollow)));
    }
    if (savedEnabled === 'true') {
      setAutoFollowEnabled(true);
    }
  }, []);

  // Save auto-follow preferences to localStorage
  useEffect(() => {
    localStorage.setItem('autoFollowRepos', JSON.stringify(Array.from(autoFollowRepos)));
  }, [autoFollowRepos]);

  useEffect(() => {
    localStorage.setItem('autoFollowEnabled', autoFollowEnabled.toString());
  }, [autoFollowEnabled]);

  // Polling function to check for new commits
  const checkForUpdates = async () => {
    if (!autoFollowEnabled || autoFollowRepos.size === 0) return;

    const token = getGitHubToken();
    if (!token) {
      console.warn('GitHub token required for auto-follow');
      return;
    }

    for (const repoFullName of autoFollowRepos) {
      try {
        const [owner, repo] = repoFullName.split('/');
        const latestSha = await getLatestCommitSha(owner, repo, 'main', token);
        const lastSha = lastCommitShasRef.current.get(repoFullName);

        if (latestSha && latestSha !== lastSha) {
          // New commit detected on main branch
          const commitInfo = await getCommitInfo(owner, repo, latestSha, token);
          
          // Trigger on ANY push or merge to main (not just merges)
          // This includes regular pushes, merges, and any commits to main
          const isPushOrMerge = true; // Any commit to main is a push or merge
          
          if (commitInfo && isPushOrMerge) {
            const commitType = commitInfo.isMerge ? 'merge' : 'push';
            console.log(`New ${commitType} detected for ${repoFullName} (SHA: ${latestSha.substring(0, 7)}), regenerating documentation...`);
            
            // Find the repo in selectedRepos
            const repoObj = selectedRepos.find(r => r.fullName === repoFullName);
            if (repoObj && repoObj.name) {
              // Regenerate documentation using agent workflow
              try {
                console.log(`[Auto-Update] Starting documentation regeneration for ${repoFullName}...`);
                
                // Use agent workflow to regenerate documentation with same settings
                // Enable autoCommit for auto-update scenarios
                const initialState: AgentState = {
                  currentStep: AgentStep.DISCOVERY,
                  selectedRepos: [repoObj],
                  selectedOutputFormats: selectedOutputFormats,
                  selectedSectionTypes: selectedSectionTypes,
                  selectedLanguage: selectedLanguage,
                  autoCommit: true, // Enable GitOps agent for auto-update
                  completedSteps: new Set(),
                };

                // Import AgentManager dynamically
                const { AgentManager } = await import('../lib/agents/Manager');
                const manager = new AgentManager(initialState);
                
                // Run the workflow
                const finalState = await manager.run();
                
                if (finalState.generatedDocsFull && finalState.generatedDocsFull.has(repoFullName)) {
                  const generatedDocs = finalState.generatedDocsFull.get(repoFullName)!;
                  
                  // Update the documentation maps
                  setRepoDocumentationsFull(prev => {
                    const newMap = new Map(prev);
                    newMap.set(repoFullName, generatedDocs);
                    return newMap;
                  });
                  
                  // Get the first markdown section for backward compatibility
                  const firstMarkdownSection = generatedDocs.sections.find(s => s.markdown);
                  if (firstMarkdownSection?.markdown) {
                    const markdownContent = firstMarkdownSection.markdown;
                    if (markdownContent) {
                      setRepoDocumentations(prev => {
                        const newMap = new Map(prev);
                        newMap.set(repoFullName, markdownContent);
                        return newMap;
                      });
                    }
                  }

                  // GitOps agent has already committed the documentation
                  // Check if commits were successful
                  if (finalState.commits && finalState.commits.has(repoFullName)) {
                    const repoCommits = finalState.commits.get(repoFullName)!;
                    console.log(`[Auto-Update] GitOps agent committed ${repoCommits.length} files for ${repoFullName}`);
                    repoCommits.forEach(commit => {
                      console.log(`[Auto-Update] ✓ Committed ${commit.path} (SHA: ${commit.sha.substring(0, 7)})`);
                    });
                  } else {
                    console.warn(`[Auto-Update] No commits found for ${repoFullName} - GitOps may have been skipped or failed`);
                  }

                  console.log(`[Auto-Update] Documentation successfully auto-updated for ${repoFullName}`);
                } else {
                  console.warn(`[Auto-Update] No documentation generated for ${repoFullName}`);
                }
              } catch (err) {
                console.error(`[Auto-Update] Failed to auto-update documentation for ${repoFullName}:`, err);
              }
            } else {
              console.warn(`[Auto-Update] Repository ${repoFullName} not found in selectedRepos or missing name`);
            }
          }

          // Update last known SHA (regardless of whether we processed it)
          lastCommitShasRef.current.set(repoFullName, latestSha);
        }
      } catch (err) {
        console.error(`[Auto-Update] Error checking updates for ${repoFullName}:`, err);
      }
    }
  };

  // Set up polling when auto-follow is enabled
  useEffect(() => {
    if (autoFollowEnabled && autoFollowRepos.size > 0) {
      // Initial check
      checkForUpdates();

      // Set up polling every 2 minutes (more frequent for better responsiveness)
      pollingIntervalRef.current = setInterval(() => {
        checkForUpdates();
      }, 2 * 60 * 1000); // 2 minutes

    return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, [autoFollowEnabled, autoFollowRepos, selectedRepos]);

  // Initialize commit SHAs when repos are selected
  useEffect(() => {
    const initializeCommitShas = async () => {
      const token = getGitHubToken();
      if (!token) return;

      for (const repo of selectedRepos) {
        if (autoFollowRepos.has(repo.fullName) && !lastCommitShasRef.current.has(repo.fullName)) {
          try {
            const [owner, repoName] = repo.fullName.split('/');
            const sha = await getLatestCommitSha(owner, repoName, 'main', token);
            if (sha) {
              lastCommitShasRef.current.set(repo.fullName, sha);
            }
          } catch (err) {
            console.error(`Failed to get initial commit SHA for ${repo.fullName}:`, err);
          }
        }
      }
    };

    if (selectedRepos.length > 0 && autoFollowEnabled) {
      initializeCommitShas();
    }
  }, [selectedRepos, autoFollowRepos, autoFollowEnabled]);

  // Update documentation display based on selected format and section
  const updateDocumentationDisplay = (
    repoFullName: string,
    format: DocOutputFormat,
    sectionType: DocSectionType
  ) => {
    console.log(`[updateDocumentationDisplay] Updating for ${repoFullName}, format: ${format}, section: ${sectionType}`);
    
    const fullDocs = repoDocumentationsFull.get(repoFullName);
    console.log(`[updateDocumentationDisplay] Full docs available: ${!!fullDocs}, sections: ${fullDocs?.sections.length || 0}`);
    
    if (fullDocs && fullDocs.sections.length > 0) {
      // Find the matching section
      const section = fullDocs.sections.find(
        s => s.format === format && s.type === sectionType
      );
      
      console.log(`[updateDocumentationDisplay] Matching section found: ${!!section}`);
      
      if (section) {
        // Get the content based on format
        const content = section.markdown || section.html || section.openapiYaml || '';
        console.log(`[updateDocumentationDisplay] Setting content from section, length: ${content.length}`);
        setDocumentation(content);
        return;
      } else {
        // Fallback to first available section or markdown
        const fallbackSection = fullDocs.sections.find(s => s.format === format) ||
                                fullDocs.sections.find(s => s.type === sectionType) ||
                                fullDocs.sections[0];
        if (fallbackSection) {
          const content = fallbackSection.markdown || fallbackSection.html || fallbackSection.openapiYaml || '';
          console.log(`[updateDocumentationDisplay] Using fallback section, length: ${content.length}`);
          setDocumentation(content);
          return;
        }
      }
    }
    
    // Fallback to simple markdown map
    const simpleDoc = repoDocumentations.get(repoFullName);
    console.log(`[updateDocumentationDisplay] Using simple doc, available: ${!!simpleDoc}, length: ${simpleDoc?.length || 0}`);
    if (simpleDoc) {
      setDocumentation(simpleDoc);
    } else {
      console.warn(`[updateDocumentationDisplay] No documentation found for ${repoFullName}`);
    }
  };

  // Convert single repo URL to SimpleRepo format for agent workflow
  const getReposForWorkflow = (): SimpleRepo[] => {
    if (githubMode === 'multi' && selectedRepos.length > 0) {
      return selectedRepos;
    } else if (githubMode === 'single' && githubUrl.trim()) {
      const repoInfo = parseGitHubUrl(githubUrl.trim());
      if (repoInfo) {
        // Convert to SimpleRepo format
        return [{
          id: Date.now(), // Temporary ID
          name: repoInfo.repo,
          fullName: `${repoInfo.owner}/${repoInfo.repo}`,
          owner: repoInfo.owner,
          private: false, // We don't know, default to false
          htmlUrl: `https://github.com/${repoInfo.owner}/${repoInfo.repo}`,
          defaultBranch: repoInfo.branch || 'main',
        }];
      }
    }
    return [];
  };

  const handleCommitToRepos = async () => {
    // Save any unsaved changes first
    if (isEditing) {
      handleSaveDocumentation();
    }
    
    if (selectedRepos.length === 0) {
      setError(t('noRepositoriesSelected'));
      return;
    }

    if (!commitMessage.trim()) {
      setError(t('pleaseProvideCommitMessage'));
      return;
    }

    setGenerating(true);
    setError('');
    setBatchProgress(null);

    try {
      const token = getGitHubToken();
      if (!token) {
        throw new Error(t('githubTokenRequiredForCommitting'));
      }

      const results: Array<{ repo: string; success: boolean; error?: string; commitUrl?: string }> = [];

      for (let i = 0; i < selectedRepos.length; i++) {
        const repo = selectedRepos[i];
        setBatchProgress({ current: i + 1, total: selectedRepos.length, repo: repo.fullName });

        try {
          const repoDoc = repoDocumentations.get(repo.fullName);
          
          if (!repoDoc) {
            throw new Error(t('documentationNotFoundForRepository'));
          }

          const [owner, repoName] = repo.fullName.split('/');
          const result = await createOrUpdateFile(
            owner,
            repoName,
            'DOCUMENTATION.md',
            repoDoc,
            commitMessage,
            commitBranch,
            token
          );

          results.push({
            repo: repo.fullName,
            success: true,
            commitUrl: result.commit.html_url,
          });
        } catch (err: any) {
          results.push({
            repo: repo.fullName,
            success: false,
            error: err.message,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (failCount === 0) {
        setError('');
        alert(successCount === 1 ? t('successfullyCommittedToRepository') : t('successfullyCommittedToRepositories').replace('{count}', successCount.toString()));
        setShowCommitDialog(false);
      } else {
        const failedRepos = results.filter((r) => !r.success).map((r) => `${r.repo}: ${r.error}`).join('\n');
        setError(failCount === 1 ? `${t('failedToCommitToRepository')}\n${failedRepos}` : `${t('failedToCommitToRepositories').replace('{count}', failCount.toString())}\n${failedRepos}`);
      }
    } catch (err: any) {
      setError(err.message || t('failedToCommitDocumentation'));
      console.error('Commit error:', err);
    } finally {
      setGenerating(false);
      setBatchProgress(null);
    }
  };

  // Save documentation updates (used by both manual editing and AI Assistant)
  const saveDocumentationUpdate = (updatedDoc: string, source: 'manual' | 'assistant' = 'manual') => {
    setDocumentation(updatedDoc);
    
    // If editing manually, exit edit mode
    if (source === 'manual' && isEditing) {
      setIsEditing(false);
    }
    
    // Update the repository documentation maps
    const currentRepo = activeTab !== 'combined' ? activeTab : selectedRepos[0]?.fullName;
    if (currentRepo) {
      // Update simple markdown map
      setRepoDocumentations(prev => {
        const newMap = new Map(prev);
        newMap.set(currentRepo, updatedDoc);
        console.log(`[DocumentationEditor] Updated repoDocumentations for ${currentRepo}`);
        return newMap;
      });
      
      // Also update full docs if available
      setRepoDocumentationsFull(prev => {
        const newMap = new Map(prev);
        const fullDocs = prev.get(currentRepo);
        if (fullDocs) {
          // Update the matching section
          const updatedSections = fullDocs.sections.map(section => {
            if (section.format === selectedFormat && section.type === selectedSectionType) {
              if (selectedFormat === 'openapi') {
                return { ...section, openapiYaml: updatedDoc };
              } else if (selectedFormat === 'html') {
                return { ...section, html: updatedDoc };
              } else {
                return { ...section, markdown: updatedDoc };
              }
            }
            return section;
          });
          
          newMap.set(currentRepo, {
            ...fullDocs,
            sections: updatedSections,
          });
          console.log(`[DocumentationEditor] Updated repoDocumentationsFull for ${currentRepo}, format: ${selectedFormat}, section: ${selectedSectionType}`);
        } else {
          // If no full docs exist, create a basic entry
          console.log(`[DocumentationEditor] No full docs found for ${currentRepo}, creating basic entry`);
        }
        return newMap;
      });
    } else {
      // In single repo mode without selected repos, just update the documentation state
      console.log('[DocumentationEditor] No current repo found, updating documentation state only');
    }
    
    // Mark as saved (no unsaved changes after AI assistant updates)
    if (source === 'assistant') {
      setHasUnsavedChanges(false);
    } else {
      setHasUnsavedChanges(false);
    }
  };

  // Save edited documentation (manual editing)
  const handleSaveDocumentation = () => {
    if (isEditing && editedDocumentation !== documentation) {
      saveDocumentationUpdate(editedDocumentation, 'manual');
    }
  };

  // Handle AI Assistant documentation updates
  const handleAssistantUpdate = (updatedDocumentation: string) => {
    console.log('[DocumentationEditor] Assistant update received, saving to repository maps...');
    saveDocumentationUpdate(updatedDocumentation, 'assistant');
    console.log('[DocumentationEditor] Assistant update saved successfully');
  };

  const handleExport = () => {
    // Save any unsaved changes first
    if (isEditing) {
      handleSaveDocumentation();
    }
    
    if (!documentation) return;

    // Show format selection dialog
    setShowExportFormatDialog(true);
  };

  const handleExportWithFormat = async (format: 'md' | 'pdf' | 'html' | 'txt') => {
    if (!documentation) return;

    const source = githubUrl;
    const baseFilename = source
      ? `documentation-${source.split('/').pop() || 'source'}`
      : 'documentation';

    switch (format) {
      case 'md':
        exportDocumentation(documentation, `${baseFilename}.md`);
        break;
      case 'txt':
        exportDocumentation(documentation, `${baseFilename}.txt`);
        break;
      case 'html':
        // Convert markdown to HTML (basic conversion)
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; }
    code { background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre { background-color: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
    pre code { background-color: transparent; padding: 0; }
  </style>
</head>
<body>
${documentation.split('\n').map(line => {
  // Basic markdown to HTML conversion
  if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
  if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
  if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
  if (line.startsWith('#### ')) return `<h4>${line.substring(5)}</h4>`;
  if (line.startsWith('```')) return line.includes('```') ? '</pre>' : '<pre>';
  if (line.trim() === '') return '<br>';
  return `<p>${line.replace(/`([^`]+)`/g, '<code>$1</code>')}</p>`;
}).join('\n')}
</body>
</html>`;
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlA = document.createElement('a');
        htmlA.href = htmlUrl;
        htmlA.download = `${baseFilename}.html`;
        document.body.appendChild(htmlA);
        htmlA.click();
        document.body.removeChild(htmlA);
        URL.revokeObjectURL(htmlUrl);
        break;
      case 'pdf':
        try {
          // Use the PDF exporter from the workflow
          const { exportToPDF, downloadPDF } = await import('../lib/pdf-exporter');
          // Create a temporary DocSection for PDF export
          const tempSection = {
            id: 'export',
            type: selectedSectionType,
            format: 'markdown' as DocOutputFormat,
            language: selectedLanguage,
            title: 'Documentation',
            markdown: documentation,
          };
          const blobUrl = await exportToPDF(tempSection);
          downloadPDF(blobUrl, `${baseFilename}.pdf`);
        } catch (error: any) {
          alert(`PDF export failed: ${error.message}`);
        }
        break;
    }

    setShowExportFormatDialog(false);
  };

  // Calculate statistics
  const estimatedTokens = documentation
    ? Math.round(documentation.length / 4)
    : 0;
  
  const wordCount = documentation
    ? documentation.split(/\s+/).filter(word => word.length > 0).length
    : 0;
  
  const lineCount = documentation
    ? documentation.split('\n').length
    : 0;

  // Additional statistics
  const charCount = documentation ? documentation.length : 0;
  const avgWordsPerLine = lineCount > 0 ? (wordCount / lineCount).toFixed(1) : '0';
  const readingTimeMinutes = wordCount > 0 ? Math.ceil(wordCount / 200) : 0; // Average reading speed: 200 words/min
  const fileSizeKB = (charCount / 1024).toFixed(2);
  
  // Markdown-specific statistics
  const sectionsCount = documentation ? (documentation.match(/^##+\s/gm) || []).length : 0;
  const codeBlocksCount = documentation ? (documentation.match(/```[\s\S]*?```/g) || []).length : 0;
  const linksCount = documentation ? (documentation.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length : 0;
  const headersCount = documentation ? (documentation.match(/^#+\s/gm) || []).length : 0;
  
  const modelPricing: Record<string, { input: number; output: number; }> = {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-2024-08-06': { input: 2.50, output: 10.00 },
    'gpt-4-turbo': { input: 10.00, output: 30.00  },
    'gpt-4-turbo-preview': { input: 10.00, output: 30.00  },
    'gpt-4': { input: 30.00, output: 60.00  },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50   },
    'o1-preview': { input: 15.00, output: 60.00   },
    'o1-mini': { input: 3.00, output: 12.00 },
    'gpt-5.2': { input: 5.00, output: 15.00 },
    'gpt-5-codex': { input: 8.00, output: 24.00 },
  };
  
  const pricing = modelPricing[selectedModel] || modelPricing['gpt-4o-mini'];
  const estimatedInputTokens = Math.round(estimatedTokens * 0.3);
  const estimatedOutputTokens = Math.round(estimatedTokens * 0.7);
  
  const estimatedCost = documentation
    ? (estimatedInputTokens / 1_000_000) * pricing.input + (estimatedOutputTokens / 1_000_000) * pricing.output
    : 0;

  return (
    <div className="hidden md:flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/30">
      {/* Beautiful Header with Glassmorphism */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5 flex-shrink-0 sticky top-0 z-50">
        <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 lg:gap-5 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="p-2 md:p-2.5 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-600 group-hover:text-orange-600 group-hover:-translate-x-1 transition-all" />
              </button>
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="p-2 md:p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/30 flex-shrink-0">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              <div className="min-w-0">
                  <h1 className="text-lg md:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent truncate">
                    {t('startWritingDocumentation')}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-medium truncate">
                    {t('aiPoweredGeneration')}
                </p>
              </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as DocLanguage)}
                className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-semibold rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white border border-slate-200 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                title="Translate page"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="de">🇩🇪 DE</option>
              </select>
              <button
                onClick={() => setShowAssistant(!showAssistant)}
                className="p-2 md:p-2.5 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md relative group"
                title={showAssistant ? t('hideAiAssistant') : t('showAiAssistant')}
              >
                <MessageSquare className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${showAssistant ? 'text-orange-600' : 'text-slate-400'}`} />
                {showAssistant && (
                  <span className="absolute -top-1 -right-1 w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 md:p-2.5 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Assistant with Beautiful Design */}
        {showAssistant && (
          <aside className="w-64 md:w-72 lg:w-80 sticky top-0 self-start h-screen bg-white/60 backdrop-blur-xl border-r border-white/30 shadow-2xl shadow-black/5 overflow-hidden flex flex-col transition-all duration-300 flex-shrink-0">
          <Assistant
              documentation={documentation}
              onUpdateDocumentation={handleAssistantUpdate}
            model={selectedModel}
          />
        </aside>
        )}

        {/* Center - Source Selection & Documentation */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-orange-50/20 to-red-50/20">
          {/* Compact Source Selection Section */}
          <div className="bg-white/40 backdrop-blur-xl border-b border-white/30 shadow-lg shadow-black/5 flex-shrink-0">
            {/* Header with Toggle */}
            <div className="p-3 md:p-4 border-b border-white/20">
                <button
                onClick={() => setShowSourceSelection(!showSourceSelection)}
                className="w-full flex items-center justify-between group hover:bg-white/30 rounded-lg p-2 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {t('sourceSelection')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {showSourceSelection ? t('clickToCollapse') : t('clickToExpand')}
                    </p>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-white/50 group-hover:bg-white/80 transition-all duration-300">
                  {showSourceSelection ? (
                    <ChevronUp className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                  )}
                </div>
              </button>
            </div>
            
            {/* Collapsible Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showSourceSelection ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="p-3 md:p-4">
                <div className="max-w-4xl mx-auto">
              {/* GitHub Source Selection */}
              <div>
                <div className="space-y-3">
                  {/* Mode Selector - Compact Card */}
                  <div className="bg-gradient-to-br from-white/90 to-orange-50/50 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-lg shadow-orange-500/10">
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-orange-500" />
                      Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setGithubMode('single');
                          setSelectedRepos([]);
                          setRepoDocumentations(new Map());
                          setActiveTab('combined');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-300 ${
                          githubMode === 'single'
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/40 scale-105 transform'
                            : 'bg-white text-slate-700 hover:bg-orange-50 hover:shadow-md border border-slate-200 hover:border-orange-300'
                        }`}
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>{t('singleRepo')}</span>
                </button>
                <button
                        onClick={() => {
                          setGithubMode('multi');
                          setGithubUrl('');
                          setDocumentation('');
                          setRepoDocumentations(new Map());
                          setActiveTab('combined');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-300 ${
                          githubMode === 'multi'
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/40 scale-105 transform'
                            : 'bg-white text-slate-700 hover:bg-orange-50 hover:shadow-md border border-slate-200 hover:border-orange-300'
                        }`}
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>{t('multiRepo')}</span>
                </button>
                    </div>
              </div>

                  {githubMode === 'single' ? (
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-lg shadow-orange-500/10">
                      <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <Github className="w-3 h-3 text-orange-500" />
                        {t('githubUrl')}
                  </label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder={t('ownerRepoOrGithub')}
                        className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all bg-white/50 backdrop-blur-sm text-slate-700 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md"
                  />
                </div>
              ) : (
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-lg shadow-orange-500/10">
                      <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <FolderOpen className="w-3 h-3 text-orange-500" />
                        {t('selectRepos')}
                      </label>
                      <button
                        onClick={() => setShowRepoSelector(true)}
                        className="w-full px-3 py-2.5 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-400 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 transition-all text-left group shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                              <FolderOpen className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="text-xs text-slate-700 font-medium">
                              {selectedRepos.length > 0
                                ? `${selectedRepos.length} repo${selectedRepos.length !== 1 ? 's' : ''}`
                                : t('selectRepos')}
                            </span>
                          </div>
                          <Zap className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </button>
                      {selectedRepos.length > 0 && (
                        <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
                          {selectedRepos.map((repo) => {
                            const isAutoFollowed = autoFollowRepos.has(repo.fullName);
                            return (
                              <div
                                key={repo.id}
                                className="flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-r from-orange-50/80 to-red-50/80 backdrop-blur-sm border border-orange-200/50 rounded-lg shadow-sm hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  <Github className="w-3 h-3 text-orange-600" />
                                  <span className="text-xs text-slate-700 font-bold truncate max-w-[120px]">{repo.name}</span>
                                  {isAutoFollowed && (
                                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-green-200">
                                      <Bell className="w-2.5 h-2.5" />
                                      Auto
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      const newSet = new Set(autoFollowRepos);
                                      if (isAutoFollowed) {
                                        newSet.delete(repo.fullName);
                                        lastCommitShasRef.current.delete(repo.fullName);
                                      } else {
                                        newSet.add(repo.fullName);
                                      }
                                      setAutoFollowRepos(newSet);
                                    }}
                                    className={`p-1 rounded transition-all duration-300 ${
                                      isAutoFollowed
                                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title={isAutoFollowed ? t('disableAutoUpdate') : t('enableAutoUpdate')}
                                  >
                                    {isAutoFollowed ? (
                                      <Bell className="w-3 h-3" />
                                    ) : (
                                      <BellOff className="w-3 h-3" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setSelectedRepos(selectedRepos.filter((r) => r.id !== repo.id))}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-300"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Auto-Follow Toggle - Compact Design */}
                      {selectedRepos.length > 0 && (
                        <div className="mt-3 p-3 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm border border-green-200/50 rounded-xl shadow-md shadow-green-500/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded-lg ${autoFollowEnabled ? 'bg-green-100 animate-pulse' : 'bg-slate-100'}`}>
                                <RefreshCw className={`w-3.5 h-3.5 ${autoFollowEnabled ? 'text-green-600 animate-spin' : 'text-slate-400'}`} />
                              </div>
                <div>
                                <label className="text-xs font-bold text-slate-700 cursor-pointer block">
                                  Auto-Update
                  </label>
                                <p className="text-[10px] text-slate-600">
                                  Auto-regenerate on push/merge
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setAutoFollowEnabled(!autoFollowEnabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-md ${
                                autoFollowEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                  autoFollowEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Agent Workflow Toggle */}
                      {selectedRepos.length > 0 && (
                        <div className="mt-3 p-3 bg-gradient-to-br from-red-50/80 to-orange-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg ${useAgentWorkflow ? 'bg-red-100' : 'bg-slate-100'}`}>
                                <Sparkles className={`w-4 h-4 ${useAgentWorkflow ? 'text-red-600' : 'text-slate-400'}`} />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-700 cursor-pointer block">
                                  Agent Workflow
                                </label>
                                <p className="text-[10px] text-slate-600">
                                  Use AI agents for automated pipeline
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setUseAgentWorkflow(!useAgentWorkflow)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-md ${
                                useAgentWorkflow ? 'bg-gradient-to-r from-red-500 to-orange-600' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                  useAgentWorkflow ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Output Formats & Sections - Compact Combined Design */}
                      <div className="mt-3 p-2.5 bg-gradient-to-br from-orange-50/80 via-red-50/80 to-orange-50/80 backdrop-blur-sm border border-orange-200/50 rounded-xl shadow-md">
                        {/* Check if documentation has been generated */}
                        {repoDocumentationsFull.size > 0 && (
                          <div className="mb-2 p-1.5 bg-amber-50 border border-amber-200 rounded text-[9px] text-amber-700 flex items-center justify-between">
                            <span>⚠️ {t('formatsLocked')}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setRepoDocumentationsFull(new Map());
                                setRepoDocumentations(new Map());
                                setDocumentation('');
                                setActiveTab('combined');
                              }}
                              className="ml-2 px-2 py-0.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-[8px] font-semibold"
                              title={t('clearDocumentation')}
                            >
                              {t('clear')}
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Formats - Compact */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                              <FileText className="w-2.5 h-2.5 text-orange-500" />
                              {t('formats')}
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {(['markdown', 'markdown_mermaid', 'mdx', 'openapi', 'html'] as DocOutputFormat[]).map((format) => {
                                const isSelected = selectedOutputFormats.includes(format);
                                const isDisabled = repoDocumentationsFull.size > 0;
                                return (
                                  <button
                                    key={format}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                      if (isDisabled) return;
                                      if (isSelected) {
                                        if (selectedOutputFormats.length > 1) {
                                          setSelectedOutputFormats(selectedOutputFormats.filter(f => f !== format));
                                        }
                                      } else {
                                        setSelectedOutputFormats([...selectedOutputFormats, format]);
                                      }
                                    }}
                                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-all ${
                                      isDisabled
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                        : isSelected
                                        ? 'bg-orange-600 text-white shadow-sm'
                                        : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200'
                                    }`}
                                    title={format === 'markdown' ? 'Markdown' :
                                           format === 'markdown_mermaid' ? 'Markdown + Mermaid' :
                                           format === 'mdx' ? 'MDX (Markdown + JSX)' :
                                           format === 'openapi' ? 'OpenAPI (YAML)' :
                                           'HTML'}
                                  >
                                    {format === 'markdown' ? 'MD' :
                                     format === 'markdown_mermaid' ? 'MD+M' :
                                     format === 'mdx' ? 'MDX' :
                                     format === 'openapi' ? 'OAPI' :
                                     'HTML'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Sections - Compact */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                              <Layers className="w-2.5 h-2.5 text-orange-500" />
                              {t('sections')}
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {(['README', 'ARCHITECTURE', 'API', 'COMPONENTS', 'TESTING_CI', 'CHANGELOG'] as DocSectionType[]).map((sectionType) => {
                                const isSelected = selectedSectionTypes.includes(sectionType);
                                const isDisabled = repoDocumentationsFull.size > 0 || generating;
                                return (
                                  <button
                                    key={sectionType}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                      if (isDisabled) return;
                                      if (isSelected) {
                                        if (selectedSectionTypes.length > 1) {
                                          setSelectedSectionTypes(selectedSectionTypes.filter(s => s !== sectionType));
                                        }
                                      } else {
                                        setSelectedSectionTypes([...selectedSectionTypes, sectionType]);
                                      }
                                    }}
                                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-all ${
                                      isDisabled
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                        : isSelected
                                        ? 'bg-orange-600 text-white shadow-sm'
                                        : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-slate-200'
                                    }`}
                                    title={sectionType === 'README' ? t('sectionReadme') :
                                           sectionType === 'ARCHITECTURE' ? t('sectionArchitecture') :
                                           sectionType === 'API' ? t('sectionApiReference') :
                                           sectionType === 'COMPONENTS' ? t('sectionComponents') :
                                           sectionType === 'TESTING_CI' ? t('sectionTestingCicd') :
                                           t('sectionChangelog')}
                                  >
                                    {sectionType === 'README' ? t('sectionReadmeShort') :
                                     sectionType === 'ARCHITECTURE' ? t('sectionArchitectureShort') :
                                     sectionType === 'API' ? t('sectionApiReferenceShort') :
                                     sectionType === 'COMPONENTS' ? t('sectionComponentsShort') :
                                     sectionType === 'TESTING_CI' ? t('sectionTestingCicdShort') :
                                     t('sectionChangelogShort')}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        {(selectedOutputFormats.length === 0 || selectedSectionTypes.length === 0) && (
                          <p className="text-[9px] text-red-500 mt-1.5 text-center">{t('selectAtLeastOne')}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* GitHub Token Section - Compact Design */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-lg shadow-orange-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Code className="w-3 h-3 text-orange-500" />
                        {t('token')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (showTokenInput && hasUnsavedChanges) {
                            // Reset to saved value when hiding with unsaved changes
                            setGithubToken(savedToken);
                            // Recalculate unsaved changes after reset (only check OpenAI key now)
                            const newHasChanges = openAIApiKey.trim() !== savedOpenAIKey;
                            setHasUnsavedChanges(newHasChanges);
                          }
                          setShowTokenInput(!showTokenInput);
                        }}
                        className="text-[10px] text-orange-600 hover:text-orange-700 font-bold px-2 py-1 rounded hover:bg-orange-50 transition-all duration-300 border border-orange-200 hover:border-orange-300"
                      >
                        {showTokenInput ? t('hide') : githubToken ? t('change') : t('add')}
                      </button>
                    </div>
                    {showTokenInput && (
                      <div className="space-y-2">
                  <input
                          type="password"
                          value={githubToken}
                          onChange={(e) => {
                            setGithubToken(e.target.value);
                            setTokenSaved(false);
                            // Check if there are unsaved changes
                            const hasChanges = e.target.value.trim() !== savedToken || openAIApiKey.trim() !== savedOpenAIKey;
                            setHasUnsavedChanges(hasChanges);
                          }}
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                          className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                        {tokenSaved && (
                          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Token saved successfully!
                </div>
              )}
                        <p className="text-xs text-gray-500">
                          Required for private repos or to avoid rate limits.{' '}
                          <a
                            href="https://github.com/settings/tokens"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-700 underline"
                          >
                            Create a token
                          </a>
                        </p>
                      </div>
                    )}
                    {!showTokenInput && githubToken && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        Token configured (hidden)
                      </p>
                    )}
                    {!showTokenInput && !githubToken && (
                      <p className="text-xs text-gray-500">
                        No token set. Public repos work without a token.
                      </p>
                    )}
                  </div>
                  
                  {/* OpenAI API Key Section - Compact Design */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-lg shadow-red-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-red-500" />
                        {t('openaiKey')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (showOpenAIKeyInput && hasUnsavedChanges) {
                            // Reset to saved value when hiding with unsaved changes
                            setOpenAIApiKeyState(savedOpenAIKey);
                            // Recalculate unsaved changes after reset (only check GitHub token now)
                            const newHasChanges = githubToken.trim() !== savedToken;
                            setHasUnsavedChanges(newHasChanges);
                          }
                          setShowOpenAIKeyInput(!showOpenAIKeyInput);
                        }}
                        className="text-[10px] text-red-600 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50 transition-all duration-300 border border-red-200 hover:border-red-300"
                      >
                        {showOpenAIKeyInput ? t('hide') : openAIApiKey ? t('change') : t('add')}
                      </button>
                    </div>
                    {showOpenAIKeyInput && (
                      <div className="space-y-2">
                        <input
                          type="password"
                          value={openAIApiKey}
                          onChange={(e) => {
                            setOpenAIApiKeyState(e.target.value);
                            setOpenAIKeySaved(false);
                            // Check if there are unsaved changes
                            const hasChanges = e.target.value.trim() !== savedOpenAIKey || githubToken.trim() !== savedToken;
                            setHasUnsavedChanges(hasChanges);
                          }}
                          placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                          className="w-full px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                        {openAIKeySaved && (
                          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            API key saved successfully!
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          {t('requiredForAiPoweredDocumentationGeneration')}{' '}
                          <a
                            href="https://platform.openai.com/api-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 underline"
                          >
                            Get your API key
                          </a>
                        </p>
                      </div>
                    )}
                    {!showOpenAIKeyInput && openAIApiKey && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        API key configured (hidden)
                      </p>
                    )}
                    {!showOpenAIKeyInput && !openAIApiKey && (
                      <p className="text-xs text-gray-500">
                        No API key set. Required for AI features.
                      </p>
                    )}
                  </div>
                  
                  {/* Save Changes Button */}
                  {hasUnsavedChanges && (showTokenInput || showOpenAIKeyInput) && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          try {
                            // Save GitHub token if changed
                            if (githubToken.trim() !== savedToken) {
                              saveGitHubToken(githubToken.trim());
                              setSavedToken(githubToken.trim());
                              setTokenSaved(true);
                              setTimeout(() => setTokenSaved(false), 3000);
                            }
                            
                            // Save OpenAI API key if changed
                            if (openAIApiKey.trim() !== savedOpenAIKey) {
                              setOpenAIApiKey(openAIApiKey.trim());
                              setSavedOpenAIKey(openAIApiKey.trim());
                              setOpenAIKeySaved(true);
                              setTimeout(() => setOpenAIKeySaved(false), 3000);
                            }
                            
                            setHasUnsavedChanges(false);
                            setError('');
                          } catch (err) {
                            setError('Failed to save changes. Please try again.');
                          }
                        }}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {t('saveChanges')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
                </div>
              </div>
            </div>
            </div>

            {/* Documentation Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 min-h-0 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
              {error && (
              <div className="max-w-5xl mx-auto mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-2xl text-red-700 shadow-xl shadow-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-bold">{error}</span>
                </div>
                </div>
              )}

              {!documentation && !generating && (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-3xl mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative p-8 bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 rounded-3xl shadow-2xl">
                    <FileText className="w-20 h-20 text-orange-600 mx-auto" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                    Ready to Generate Documentation
                  </h3>
                <p className="text-slate-600 text-lg font-medium max-w-xl">
                    Enter a GitHub repository URL to generate comprehensive documentation from its structure and code.
                  </p>
                </div>
              )}

              {generating && (
                <div className="flex flex-col items-center justify-center h-full">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                  <div className="relative animate-spin w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-orange-600 animate-pulse" />
                  </div>
                </div>
                <p className="text-slate-700 font-bold text-xl mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {t('generating')}
                </p>
                {batchProgress && (
                  <div className="mt-6 text-center max-w-md bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                    <p className="text-sm text-slate-600 mb-3 font-medium">
                      Processing <span className="font-bold text-orange-600 text-lg">{batchProgress.current}</span> of{' '}
                      <span className="font-bold text-slate-700">{batchProgress.total}</span>
                    </p>
                    {batchProgress.repo && (
                      <p className="text-xs text-slate-500 mb-4 font-mono bg-slate-50 px-3 py-2 rounded-lg">{batchProgress.repo}</p>
                    )}
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                </div>
              )}

              {documentation && (
              <div className="h-full flex flex-col max-w-6xl mx-auto min-h-0">
                {/* Tabs for Multi-Repo Mode - Beautiful Design */}
                {githubMode === 'multi' && repoDocumentations.size > 0 && selectedRepos.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl mb-6 flex-shrink-0 shadow-2xl shadow-black/5 overflow-hidden">
                    <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-thin">
                      {selectedRepos.map((repo) => {
                        const hasDoc = repoDocumentations.has(repo.fullName);
                        const isActive = activeTab === repo.fullName;
                        return (
                          <button
                            key={repo.id}
                            onClick={() => {
                              setActiveTab(repo.fullName);
                              updateDocumentationDisplay(repo.fullName, selectedFormat, selectedSectionType);
                            }}
                            className={`px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3 text-xs md:text-sm font-bold border-b-2 transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 md:gap-2 rounded-t-lg md:rounded-t-xl ${
                              isActive
                                ? 'border-orange-500 text-orange-600 bg-gradient-to-b from-orange-50 to-white shadow-lg'
                                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <Github className={`w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 ${isActive ? 'text-orange-600' : 'text-slate-500'}`} />
                            <span className="truncate max-w-[120px] md:max-w-[150px] lg:max-w-[200px]">{repo.name}</span>
                            {hasDoc && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs flex-shrink-0 font-bold border border-green-200">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
              
              {/* Format and Section Selector - Compact */}
              {repoDocumentationsFull.size > 0 && (
                <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-lg md:rounded-xl mb-3 md:mb-4 flex-shrink-0 shadow-lg shadow-black/5 p-2 md:p-2.5">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <div className="flex items-center gap-1 md:gap-1.5 flex-1 min-w-0">
                      <FileText className="w-3 h-3 md:w-3.5 md:h-3.5 text-orange-500 flex-shrink-0" />
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-600 flex-shrink-0">{t('format')}</span>
                      <div className="flex gap-0.5 md:gap-1 flex-wrap min-w-0">
                        {selectedOutputFormats.map((format) => (
                          <button
                            key={format}
                            onClick={() => {
                              setSelectedFormat(format);
                              const currentRepo = activeTab !== 'combined' ? activeTab : selectedRepos[0]?.fullName;
                              if (currentRepo) {
                                updateDocumentationDisplay(currentRepo, format, selectedSectionType);
                              }
                            }}
                            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all whitespace-nowrap ${
                              selectedFormat === format
                                ? 'bg-orange-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-700 hover:shadow-md hover:scale-105 cursor-pointer'
                            }`}
                            title={format === 'markdown' ? t('markdownStandardFormat') :
                                   format === 'markdown_mermaid' ? t('markdownMermaidDescription') :
                                   format === 'mdx' ? t('mdxDescription') :
                                   format === 'openapi' ? t('openapiDescription') :
                                   t('htmlDescription')}
                          >
                            {format === 'markdown' ? 'MD' :
                             format === 'markdown_mermaid' ? 'MD+M' :
                             format === 'mdx' ? 'MDX' :
                             format === 'openapi' ? 'OAPI' :
                             'HTML'}
                          </button>
                        ))}
            </div>
          </div>
                    <div className="w-px h-6 bg-slate-300"></div>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Layers className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-slate-600 flex-shrink-0">{t('section')}</span>
                      <div className="flex gap-1 flex-wrap min-w-0">
                        {selectedSectionTypes.map((sectionType) => (
              <button
                            key={sectionType}
                            onClick={() => {
                              setSelectedSectionType(sectionType);
                              const currentRepo = activeTab !== 'combined' ? activeTab : selectedRepos[0]?.fullName;
                              if (currentRepo) {
                                updateDocumentationDisplay(currentRepo, selectedFormat, sectionType);
                              }
                            }}
                            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all whitespace-nowrap ${
                              selectedSectionType === sectionType
                                ? 'bg-orange-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-700 hover:shadow-md hover:scale-105 cursor-pointer'
                            }`}
                            title={sectionType === 'README' ? t('sectionReadme') :
                                   sectionType === 'ARCHITECTURE' ? t('sectionArchitecture') :
                                   sectionType === 'API' ? t('sectionApiReference') :
                                   sectionType === 'COMPONENTS' ? t('sectionComponents') :
                                   sectionType === 'TESTING_CI' ? t('sectionTestingCicd') :
                                   t('sectionChangelog')}
                          >
                            {sectionType === 'README' ? t('sectionReadmeShort') :
                             sectionType === 'ARCHITECTURE' ? t('sectionArchitectureShort') :
                             sectionType === 'API' ? t('sectionApiReferenceShort') :
                             sectionType === 'COMPONENTS' ? t('sectionComponentsShort') :
                             sectionType === 'TESTING_CI' ? t('sectionTestingCicdShort') :
                             t('sectionChangelogShort')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

                {/* Documentation Content - Beautiful Card with Overflow */}
                <div className="flex-1 min-h-0 overflow-hidden relative">
                  <div className="h-full bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/50 shadow-2xl shadow-black/10 p-4 md:p-6 lg:p-10 overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
                    {/* Edit Button - Top Right Corner */}
                    {documentation && !isEditing && (
                      <button
                        onClick={() => {
                          setEditedDocumentation(documentation);
                          setIsEditing(true);
                          setHasUnsavedChanges(true);
                        }}
                        className="absolute top-2 md:top-3 lg:top-4 right-2 md:right-3 lg:right-4 z-10 flex items-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-xs md:text-sm"
                        title={t('editDocumentation')}
                      >
                        <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden md:inline">{t('edit')}</span>
                      </button>
                    )}

                    {/* Save/Cancel Buttons - Top Right Corner (when editing) */}
                    {isEditing && (
                      <div className="absolute top-2 md:top-3 lg:top-4 right-2 md:right-3 lg:right-4 z-10 flex items-center gap-1.5 md:gap-2">
                        <button
                          onClick={handleSaveDocumentation}
                          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-xs md:text-sm"
                          title={t('saveChanges')}
                        >
                          <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span className="hidden md:inline">{t('save')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedDocumentation('');
                            setHasUnsavedChanges(false);
                          }}
                          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-xs md:text-sm"
                          title={t('cancel')}
                        >
                          <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span className="hidden md:inline">{t('cancel')}</span>
                        </button>
                      </div>
                    )}

                    {/* Save Button - Shows when there are unsaved changes (not in edit mode) */}
                    {!isEditing && hasUnsavedChanges && documentation && (
                      <div className="absolute top-2 md:top-3 lg:top-4 right-2 md:right-3 lg:right-4 z-10">
                        <button
                          onClick={handleSaveDocumentation}
                          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-xs md:text-sm animate-pulse"
                          title={t('saveChanges')}
                        >
                          <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span className="hidden lg:inline">{t('saveChanges')}</span>
                          <span className="lg:hidden">{t('save')}</span>
                        </button>
                      </div>
                    )}

                    {/* Documentation Display/Edit */}
                    {isEditing ? (
                      <textarea
                        value={editedDocumentation}
                        onChange={(e) => {
                          setEditedDocumentation(e.target.value);
                          setHasUnsavedChanges(e.target.value !== documentation);
                        }}
                        className="w-full h-full min-h-[400px] md:min-h-[500px] p-3 md:p-4 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 font-mono text-xs md:text-sm resize-none"
                        placeholder={t('editDocumentationPlaceholder')}
                      />
                    ) : selectedFormat === 'html' ? (
                      <div 
                        className="prose prose-slate max-w-none prose-sm md:prose-base"
                        dangerouslySetInnerHTML={{ __html: documentation }}
                      />
                    ) : selectedFormat === 'openapi' ? (
                      <pre className="whitespace-pre-wrap text-xs md:text-sm font-mono bg-slate-900 text-slate-100 p-4 md:p-6 rounded-lg overflow-x-auto">
                        <code>{documentation}</code>
                      </pre>
                    ) : (
                      <div className="whitespace-pre-wrap text-xs md:text-sm prose prose-slate max-w-none prose-sm md:prose-base prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-orange-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:overflow-x-auto prose-pre:max-w-full">
                        {documentation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          </main>

        {/* Right Sidebar - Actions & Statistics - Beautiful Design */}
        <aside className="w-64 md:w-72 lg:w-80 bg-white/70 backdrop-blur-xl border-l border-white/30 shadow-2xl shadow-black/5 overflow-y-auto flex-shrink-0">
            <div className="p-4 md:p-5 lg:p-6">
            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              {/* Run Workflow Button - Available for both single and multi-repo modes */}
              <button
                onClick={() => {
                  const repos = getReposForWorkflow();
                  if (repos.length === 0) {
                    setError(githubMode === 'single' 
                      ? t('pleaseProvideUrl')
                      : t('selectAtLeastOneRepo'));
                    return;
                  }
                  if (selectedOutputFormats.length === 0) {
                    setError(t('selectAtLeastOneFormat'));
                    return;
                  }
                  if (selectedSectionTypes.length === 0) {
                    setError(t('selectAtLeastOneSection'));
                    return;
                  }
                  setShowAgentWorkflowModal(true);
                }}
                disabled={
                  generating || 
                  (githubMode === 'single' ? !githubUrl.trim() : selectedRepos.length === 0) ||
                  selectedOutputFormats.length === 0 ||
                  selectedSectionTypes.length === 0
                }
                className="w-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 lg:px-5 py-3 md:py-3.5 lg:py-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white rounded-xl md:rounded-2xl hover:from-red-700 hover:via-orange-700 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm md:text-base shadow-2xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.03] disabled:hover:scale-100 transform"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                <span className="truncate">{t('runWorkflow')}</span>
              </button>
              
              {documentation && (
                <>
                  {/* Save Button - Shows when there are unsaved changes */}
                  {(isEditing || hasUnsavedChanges) && (
                    <button
                      onClick={handleSaveDocumentation}
                      className="w-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 lg:px-5 py-3 md:py-3.5 lg:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl md:rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-bold text-sm md:text-base shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.03] transform"
                    >
                      <Save className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="truncate">{t('saveChanges')}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleExport}
                    disabled={isEditing}
                    className="w-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 lg:px-5 py-3 md:py-3.5 lg:py-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl md:rounded-2xl hover:from-slate-800 hover:to-black transition-all duration-300 font-bold text-sm md:text-base shadow-xl shadow-slate-500/30 hover:shadow-2xl hover:shadow-slate-500/40 hover:scale-[1.03] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="truncate">{t('export')}</span>
                  </button>
                  
                  {githubMode === 'multi' && selectedRepos.length > 0 && (
                    <button
                      onClick={() => setShowCommitDialog(true)}
                      disabled={isEditing}
                      className="w-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 lg:px-5 py-3 md:py-3.5 lg:py-4 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-xl md:rounded-2xl hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 font-bold text-sm md:text-base shadow-2xl shadow-green-500/40 hover:shadow-2xl hover:shadow-green-500/50 hover:scale-[1.03] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <GitCommit className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="truncate">{t('commitToRepos')}</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Statistics Card - Beautiful Design */}
            <div className="bg-gradient-to-br from-white/90 to-orange-50/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/50 p-4 md:p-5 lg:p-6 shadow-xl shadow-orange-500/10">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-5">
                <div className="p-2 md:p-2.5 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl shadow-md">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                </div>
                <h3 className="text-sm md:text-base font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{t('statistics')}</h3>
              </div>
              <div className="space-y-3">
                {/* Documentation Length */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Length</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {documentation ? `${documentation.length.toLocaleString()}` : '0'}
                  </span>
                </div>

                {/* AI Model Selector */}
                {showSettings && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Model</span>
                    </div>
                  </div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                      <option value="gpt-4o-mini">GPT-4o Mini </option>
                    <option value="gpt-4o">GPT-4o </option>
                    <option value="gpt-4-turbo">GPT-4 Turbo </option>
                    <option value="gpt-4">GPT-4 - Standard</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo </option>
                    <option value="gpt-5.2">GPT-5.2 </option>
                    <option value="gpt-5-codex">GPT-5 Codex </option>
                    
                  </select>
                </div>
                )}

                {/* Estimated Tokens */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Est. Tokens</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {estimatedTokens > 1000 
                      ? `${(estimatedTokens / 1000).toFixed(1)}K` 
                      : estimatedTokens.toString()}
                  </span>
                </div>

                {/* Estimated Cost */}
                {documentation && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Est. Cost</span>
                  </div>
                    <span className="font-bold text-green-600">
                      ${estimatedCost < 0.01 ? '<0.01' : estimatedCost.toFixed(4)}
                  </span>
                </div>
                )}

                {/* Word Count */}
                {documentation && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Words</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {wordCount.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Line Count */}
                {documentation && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash className="w-3.5 h-3.5" />
                      <span>Lines</span>
              </div>
                    <span className="font-bold text-gray-900">
                      {lineCount.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Character Count */}
                {documentation && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Code className="w-3.5 h-3.5" />
                      <span>Characters</span>
                  </div>
                    <span className="font-bold text-gray-900">
                      {charCount.toLocaleString()}
                  </span>
                </div>
                )}

                {/* File Size */}
                {documentation && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-3.5 h-3.5" />
                      <span>File Size</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {fileSizeKB} KB
                    </span>
                  </div>
                )}

                {/* Reading Time */}
                {documentation && readingTimeMinutes > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Reading Time</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      ~{readingTimeMinutes} min
                    </span>
                  </div>
                )}

                {/* Average Words per Line */}
                {documentation && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Avg Words/Line</span>
              </div>
                    <span className="font-bold text-gray-900">
                      {avgWordsPerLine}
                    </span>
                  </div>
                )}

                {/* Sections Count */}
                {documentation && sectionsCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Sections</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {sectionsCount}
                    </span>
                  </div>
                )}

                {/* Headers Count */}
                {documentation && headersCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash className="w-3.5 h-3.5" />
                      <span>Headers</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {headersCount}
                    </span>
                  </div>
                )}

                {/* Code Blocks Count */}
                {documentation && codeBlocksCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Code className="w-3.5 h-3.5" />
                      <span>Code Blocks</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {codeBlocksCount}
                    </span>
                  </div>
                )}

                {/* Links Count */}
                {documentation && linksCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Links</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {linksCount}
                    </span>
                  </div>
                )}

                {/* Token Breakdown */}
                {documentation && (
                  <div className="pt-2 border-t border-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Input Tokens</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {estimatedInputTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Output Tokens</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {estimatedOutputTokens.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Repository Count */}
                {githubMode === 'multi' && selectedRepos.length > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Repositories</span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {selectedRepos.length}
                    </span>
                  </div>
                )}

                {/* Source Type */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Code className="w-3.5 h-3.5" />
                    <span>Source</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    GitHub
                  </span>
                </div>

              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer at Bottom */}
      <div className="mt-auto">
        <Footer onNavigate={(page) => {
          window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
        }} />
      </div>

      {/* Agent Workflow Modal */}
      {showAgentWorkflowModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-5 lg:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg flex-shrink-0">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">Agent Workflow</h3>
                  <p className="text-xs md:text-sm text-gray-600 truncate">Automated documentation generation pipeline</p>
                </div>
              </div>
              <button
                onClick={() => setShowAgentWorkflowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label={t('close')}
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
              <AgentWorkflow
                selectedRepos={getReposForWorkflow()}
                selectedOutputFormats={selectedOutputFormats}
                selectedSectionTypes={selectedSectionTypes}
                selectedLanguage={selectedLanguage}
                onReposChange={(repos) => {
                  if (githubMode === 'single') {
                    // In single mode, update the URL from the repo
                    if (repos.length > 0) {
                      setGithubUrl(repos[0].htmlUrl);
                    }
                  } else {
                    setSelectedRepos(repos);
                  }
                }}
                onComplete={(state) => {
                  console.log('[DocumentationEditor] onComplete called with state:', {
                    hasGeneratedDocs: !!state.generatedDocs,
                    generatedDocsSize: state.generatedDocs?.size || 0,
                    hasGeneratedDocsFull: !!state.generatedDocsFull,
                    generatedDocsFullSize: state.generatedDocsFull?.size || 0,
                  });
                  
                  
                  // Update documentation from agent results
                  if (state.generatedDocs && state.generatedDocs.size > 0) {
                    const newDocs = new Map<string, string>();
                    state.generatedDocs.forEach((doc, repoFullName) => {
                      console.log(`[DocumentationEditor] Setting docs for ${repoFullName}, length: ${doc.length}`);
                      newDocs.set(repoFullName, doc);
                    });
                    setRepoDocumentations(newDocs);
                    
                    // Store full format-specific documentation
                    if (state.generatedDocsFull && state.generatedDocsFull.size > 0) {
                      console.log(`[DocumentationEditor] Setting full docs, size: ${state.generatedDocsFull.size}`);
                      state.generatedDocsFull.forEach((docs, repoFullName) => {
                        console.log(`[DocumentationEditor] Full docs for ${repoFullName}:`, {
                          sectionsCount: docs.sections.length,
                          sections: docs.sections.map(s => `${s.type}_${s.format}`),
                        });
                      });
                      setRepoDocumentationsFull(state.generatedDocsFull);
                    }
                    
                    // Set active tab to first repo
                    const repos = getReposForWorkflow();
                    console.log(`[DocumentationEditor] Repos for workflow: ${repos.length}`);
                    if (repos.length > 0) {
                      const firstRepo = repos[0];
                      console.log(`[DocumentationEditor] Setting active tab to: ${firstRepo.fullName}`);
                      setActiveTab(firstRepo.fullName);
                      
                      // Update display with selected format and section
                      console.log(`[DocumentationEditor] Updating display with format: ${selectedFormat}, section: ${selectedSectionType}`);
                      updateDocumentationDisplay(firstRepo.fullName, selectedFormat, selectedSectionType);
                      
                      // Also set documentation directly as fallback
                      const directDoc = newDocs.get(firstRepo.fullName);
                      if (directDoc) {
                        console.log(`[DocumentationEditor] Setting documentation directly, length: ${directDoc.length}`);
                        setDocumentation(directDoc);
                      }
                    }
                    
                    // If single mode, update selectedRepos for display
                    if (githubMode === 'single' && repos.length > 0) {
                      setSelectedRepos(repos);
                    }
                  } else {
                    console.warn('[DocumentationEditor] No generated docs in state!');
                  }
                  
                  setShowAgentWorkflowModal(false);
                  setUseAgentWorkflow(false);
                }}
              />
            </div>
          </div>
        </div>
      )}


      {/* Export Format Selection Dialog */}
      {showExportFormatDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full">
            <div className="flex items-center justify-between p-4 md:p-5 lg:p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <Download className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('export')} {t('documentation')}</h3>
                  <p className="text-xs md:text-sm text-gray-600">Choose export format</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportFormatDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t('close')}
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 md:p-5 lg:p-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExportWithFormat('md')}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
                >
                  <FileText className="w-8 h-8 text-gray-600 group-hover:text-orange-600" />
                  <span className="font-semibold text-gray-900">Markdown</span>
                  <span className="text-xs text-gray-500">.md</span>
                </button>
                <button
                  onClick={() => handleExportWithFormat('pdf')}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
                >
                  <FileText className="w-8 h-8 text-gray-600 group-hover:text-red-600" />
                  <span className="font-semibold text-gray-900">PDF</span>
                  <span className="text-xs text-gray-500">.pdf</span>
                </button>
                <button
                  onClick={() => handleExportWithFormat('html')}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <FileText className="w-8 h-8 text-gray-600 group-hover:text-blue-600" />
                  <span className="font-semibold text-gray-900">HTML</span>
                  <span className="text-xs text-gray-500">.html</span>
                </button>
                <button
                  onClick={() => handleExportWithFormat('txt')}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-500 hover:bg-gray-50 transition-all group"
                >
                  <FileText className="w-8 h-8 text-gray-600 group-hover:text-gray-700" />
                  <span className="font-semibold text-gray-900">Text</span>
                  <span className="text-xs text-gray-500">.txt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Repo Selector Modal */}
      {showRepoSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <MultiRepoSelector
            selectedRepos={selectedRepos}
            onSelectionChange={setSelectedRepos}
            onClose={() => setShowRepoSelector(false)}
          />
        </div>
      )}

      {/* Commit Dialog */}
      {showCommitDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('commit')} {t('documentation')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('commitMessage')}
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder={t('addDocumentation')}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('branch')}
                </label>
                <input
                  type="text"
                  value={commitBranch}
                  onChange={(e) => setCommitBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-gray-600">
                This will commit <code className="bg-white px-1.5 py-0.5 rounded font-mono text-xs">DOCUMENTATION.md</code> to{' '}
                {selectedRepos.length} repository{selectedRepos.length !== 1 ? 'ies' : ''}.
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCommitDialog(false);
                  setCommitMessage('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCommitToRepos}
                disabled={!commitMessage.trim() || generating}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
              >
                {generating ? t('committing') : t('commit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label={t('scrollToTop')}
        >
          <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}
