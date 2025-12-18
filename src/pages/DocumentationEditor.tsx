import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Github, X, Download, Sparkles, Link as LinkIcon, BarChart3, Cpu, Code, FolderOpen, GitCommit, DollarSign, Hash, BookOpen, Settings, Zap, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, ArrowUp, Clock, TrendingUp, Activity, Layers, Pencil, Save, CheckCircle } from 'lucide-react';
import Assistant from '../components/Assistant';
import MultiRepoSelector from '../components/MultiRepoSelector';
import AgentWorkflow from '../components/AgentWorkflow';
import Footer from '../components/Footer';
import { exportDocumentation } from '../lib/documentation-writer';
import { setGitHubToken as saveGitHubToken, getGitHubToken, SimpleRepo, createOrUpdateFile } from '../lib/github-service';
import { setOpenAIApiKey, getOpenAIApiKey } from '../lib/langchain-service';
import { DocOutputFormat, DocSectionType, GeneratedDocs, DocLanguage } from '../types/core';
import { useTranslation } from '../lib/translations';

interface DocumentationEditorProps {
  onBack: () => void;
}

export default function DocumentationEditor({ onBack }: DocumentationEditorProps) {
  const [documentation, setDocumentation] = useState<string>('');
  const [repoDocumentations, setRepoDocumentations] = useState<Map<string, string>>(new Map());
  const [repoDocumentationsFull, setRepoDocumentationsFull] = useState<Map<string, GeneratedDocs>>(new Map());
  const [selectedFormat, setSelectedFormat] = useState<DocOutputFormat>('markdown');
  const [selectedSectionType, setSelectedSectionType] = useState<DocSectionType>('README');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedRepos, setSelectedRepos] = useState<SimpleRepo[]>([]);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [modelUsedForGeneration, setModelUsedForGeneration] = useState<string>('');
  const [githubToken, setGithubToken] = useState<string>(getGitHubToken() || '');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [openAIApiKey, setOpenAIApiKeyState] = useState<string>(getOpenAIApiKey() || '');
  const [openAIKeySaved, setOpenAIKeySaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedToken, setSavedToken] = useState<string>(getGitHubToken() || '');
  const [savedOpenAIKey, setSavedOpenAIKey] = useState<string>(getOpenAIApiKey() || '');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; repo?: string } | null>(null);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitBranch, setCommitBranch] = useState('main');
  const [activeTab, setActiveTab] = useState<string>('combined');
  const [showSettings, setShowSettings] = useState(false);
  const [showAssistant, setShowAssistant] = useState<boolean>(false);
  const [showSourceSelection, setShowSourceSelection] = useState<boolean>(true);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(false);
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
  const [showAgentWorkflowModal, setShowAgentWorkflowModal] = useState<boolean>(false);
  const [showFormatSectionModal, setShowFormatSectionModal] = useState<boolean>(false);
  const [showRemoveRepoConfirm, setShowRemoveRepoConfirm] = useState<boolean>(false);
  const [repoToRemove, setRepoToRemove] = useState<SimpleRepo | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info'; repoName?: string } | null>(null);
  const [selectedOutputFormats, setSelectedOutputFormats] = useState<DocOutputFormat[]>(['markdown']);
  const [selectedSectionTypes, setSelectedSectionTypes] = useState<DocSectionType[]>(['README']);
  const [tempSelectedFormats, setTempSelectedFormats] = useState<DocOutputFormat[]>(['markdown']);
  const [tempSelectedSections, setTempSelectedSections] = useState<DocSectionType[]>(['README']);
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

  // Hide assistant when documentation is cleared
  useEffect(() => {
    if (!documentation && showAssistant) {
      setShowAssistant(false);
    }
  }, [documentation, showAssistant]);

  // Translation hook
  const t = useTranslation(selectedLanguage);


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
    return selectedRepos;
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

    const source = selectedRepos.length > 0 ? selectedRepos[0].fullName : 'documentation';
    const baseFilename = source
      ? `documentation-${source.replace('/', '-')}`
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/30">
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
                onClick={() => {
                  if (documentation) {
                    setShowAssistant(!showAssistant);
                  }
                }}
                className={`p-2 md:p-2.5 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md relative group ${!documentation ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!documentation ? t('assistantErrorNoDocumentation') : (showAssistant ? t('hideAiAssistant') : t('showAiAssistant'))}
                disabled={!documentation}
              >
                <MessageSquare className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${showAssistant ? 'text-orange-600' : 'text-slate-400'}`} />
                {showAssistant && (
                  <span className="absolute -top-1 -right-1 w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="hidden md:flex p-2 md:p-2.5 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
              </button>
              {/* Mobile: Actions & Settings Toggle */}
              <button
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className="md:hidden p-2.5 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md relative"
                aria-label="Toggle actions and settings"
              >
                <BarChart3 className={`w-5 h-5 transition-colors ${showRightSidebar ? 'text-orange-600' : 'text-slate-600'}`} />
                {showRightSidebar && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Sidebar - Assistant with Beautiful Design (Desktop) */}
        {showAssistant && (
          <>
            {/* Mobile: Modal/Overlay */}
            <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowAssistant(false)}>
              <aside 
                className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl border-r border-white/30 shadow-2xl shadow-black/5 overflow-hidden flex flex-col transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">{t('aiAssistant')}</h2>
                  <button
                    onClick={() => setShowAssistant(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={t('close')}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
          <Assistant
              documentation={documentation}
              onUpdateDocumentation={handleAssistantUpdate}
            model={selectedModel}
          />
                </div>
        </aside>
            </div>
            {/* Desktop: Sidebar */}
            <aside className="hidden md:flex w-64 md:w-72 lg:w-80 sticky top-0 self-start h-screen bg-white/60 backdrop-blur-xl border-r border-white/30 shadow-2xl shadow-black/5 overflow-hidden flex-col transition-all duration-300 flex-shrink-0">
              <Assistant
                documentation={documentation}
                onUpdateDocumentation={handleAssistantUpdate}
                model={selectedModel}
              />
            </aside>
          </>
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
              <div className="space-y-3">
                  {/* Repository Selector */}
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
                            return (
                              <div
                                key={repo.id}
                                className="flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-r from-orange-50/80 to-red-50/80 backdrop-blur-sm border border-orange-200/50 rounded-lg shadow-sm hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  <Github className="w-3 h-3 text-orange-600" />
                                  <span className="text-xs text-slate-700 font-bold truncate max-w-[120px]">{repo.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setRepoToRemove(repo);
                                      setShowRemoveRepoConfirm(true);
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-300"
                                    title="Remove repository"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Clear All Button */}
                      {selectedRepos.length > 0 && (
                        <button
                          onClick={() => setShowClearAllConfirm(true)}
                          className="mt-2 w-full px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <X className="w-3 h-3" />
                          Clear All
                        </button>
                      )}
                    </div>
                  
                  {/* Settings Button - Opens Modal */}
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {t('settings')} - {t('token')} & {t('openaiKey')}
                  </button>
                  
                  {/* Settings Status Indicators */}
                  <div className="flex items-center gap-3 text-xs">
                    {githubToken && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>GitHub Token</span>
                      </div>
                    )}
                    {openAIApiKey && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>OpenAI Key</span>
                      </div>
                    )}
                    {!githubToken && !openAIApiKey && (
                      <span className="text-gray-500">No credentials configured</span>
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
                {repoDocumentations.size > 0 && selectedRepos.length > 0 && (
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
        {/* Mobile: Bottom Sheet/Drawer */}
        {showRightSidebar && (
          <div 
            className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRightSidebar(false)}
          >
            <aside 
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white/95 backdrop-blur-xl border-t border-white/30 shadow-2xl shadow-black/5 rounded-t-3xl overflow-hidden flex flex-col transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Actions & Settings</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Toggle statistics"
                  >
                    <Settings className={`w-5 h-5 transition-colors ${showSettings ? 'text-orange-600' : 'text-gray-600'}`} />
                  </button>
                  <button
                    onClick={() => setShowRightSidebar(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            <div className="p-4 md:p-5 lg:p-6">
            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              {/* Run Workflow Button */}
              <button
                onClick={() => {
                  const repos = getReposForWorkflow();
                  if (repos.length === 0) {
                    setError(t('selectAtLeastOneRepo'));
                    return;
                  }
                  // Initialize temp selections with current selections
                  setTempSelectedFormats(selectedOutputFormats.length > 0 ? selectedOutputFormats : ['markdown']);
                  setTempSelectedSections(selectedSectionTypes.length > 0 ? selectedSectionTypes : ['README']);
                  setShowFormatSectionModal(true);
                  setShowRightSidebar(false); // Close mobile bottom sheet
                }}
                disabled={
                  generating || 
                  selectedRepos.length === 0
                }
                className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-4 lg:px-5 py-3.5 md:py-3.5 lg:py-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white rounded-xl md:rounded-2xl hover:from-red-700 hover:via-orange-700 hover:to-red-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm md:text-base shadow-2xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] disabled:hover:scale-100 transform touch-manipulation"
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
                      className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-4 lg:px-5 py-3.5 md:py-3.5 lg:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl md:rounded-2xl hover:from-orange-600 hover:to-red-600 active:scale-95 transition-all duration-300 font-bold text-sm md:text-base shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.02] transform touch-manipulation"
                    >
                      <Save className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="truncate">{t('saveChanges')}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleExport}
                    disabled={isEditing}
                    className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-4 lg:px-5 py-3.5 md:py-3.5 lg:py-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl md:rounded-2xl hover:from-slate-800 hover:to-black active:scale-95 transition-all duration-300 font-bold text-sm md:text-base shadow-xl shadow-slate-500/30 hover:shadow-2xl hover:shadow-slate-500/40 hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="truncate">{t('export')}</span>
                  </button>
                  
                  {selectedRepos.length > 0 && (
                    <button
                      onClick={() => setShowCommitDialog(true)}
                      disabled={isEditing}
                      className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-4 lg:px-5 py-3.5 md:py-3.5 lg:py-4 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-xl md:rounded-2xl hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 active:scale-95 transition-all duration-300 font-bold text-sm md:text-base shadow-2xl shadow-green-500/40 hover:shadow-2xl hover:shadow-green-500/50 hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
                    >
                      <GitCommit className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="truncate">{t('commitToRepos')}</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Statistics Card - Beautiful Design */}
            {showSettings && (
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

                {/* Model Used for Generation */}
                {modelUsedForGeneration && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Model Used</span>
                    </div>
                    <span className="font-bold text-gray-900 text-[10px] truncate max-w-[120px]" title={modelUsedForGeneration}>
                      {modelUsedForGeneration.replace('gpt-', '').replace(/-/g, ' ').toUpperCase()}
                    </span>
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
                {selectedRepos.length > 0 && (
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
            )}
                </div>
              </div>
            </aside>
          </div>
        )}
        
        {/* Desktop: Right Sidebar - Always Visible */}
        <aside className="hidden md:block w-64 md:w-72 lg:w-80 bg-white/70 backdrop-blur-xl border-l border-white/30 shadow-2xl shadow-black/5 overflow-y-auto flex-shrink-0">
            <div className="p-4 md:p-5 lg:p-6">
            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              {/* Run Workflow Button */}
              <button
                onClick={() => {
                  const repos = getReposForWorkflow();
                  if (repos.length === 0) {
                    setError(t('selectAtLeastOneRepo'));
                    return;
                  }
                  // Initialize temp selections with current selections
                  setTempSelectedFormats(selectedOutputFormats.length > 0 ? selectedOutputFormats : ['markdown']);
                  setTempSelectedSections(selectedSectionTypes.length > 0 ? selectedSectionTypes : ['README']);
                  setShowFormatSectionModal(true);
                }}
                disabled={
                  generating || 
                  selectedRepos.length === 0
                }
                className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-4 lg:px-5 py-3.5 md:py-3.5 lg:py-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white rounded-xl md:rounded-2xl hover:from-red-700 hover:via-orange-700 hover:to-red-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm md:text-base shadow-2xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] disabled:hover:scale-100 transform touch-manipulation"
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
                      className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-4 lg:px-5 py-3.5 md:py-3.5 lg:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl md:rounded-2xl hover:from-orange-600 hover:to-red-600 active:scale-95 transition-all duration-300 font-bold text-sm md:text-base shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.02] transform touch-manipulation"
                    >
                      <Save className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="truncate">{t('saveChanges')}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleExport}
                    disabled={isEditing}
                    className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-4 lg:px-5 py-3.5 md:py-3.5 lg:py-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl md:rounded-2xl hover:from-slate-800 hover:to-black active:scale-95 transition-all duration-300 font-bold text-sm md:text-base shadow-xl shadow-slate-500/30 hover:shadow-2xl hover:shadow-slate-500/40 hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="truncate">{t('export')}</span>
                  </button>
                  
                  {selectedRepos.length > 0 && (
                    <button
                      onClick={() => setShowCommitDialog(true)}
                      disabled={isEditing}
                      className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-4 lg:px-5 py-3.5 md:py-3.5 lg:py-4 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-xl md:rounded-2xl hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 active:scale-95 transition-all duration-300 font-bold text-sm md:text-base shadow-2xl shadow-green-500/40 hover:shadow-2xl hover:shadow-green-500/50 hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
                    >
                      <GitCommit className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="truncate">{t('commitToRepos')}</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Statistics Card - Beautiful Design */}
            {showSettings && (
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

                {/* Model Used for Generation */}
                {modelUsedForGeneration && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Model Used</span>
                    </div>
                    <span className="font-bold text-gray-900 text-[10px] truncate max-w-[120px]" title={modelUsedForGeneration}>
                      {modelUsedForGeneration.replace('gpt-', '').replace(/-/g, ' ').toUpperCase()}
                    </span>
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
                {selectedRepos.length > 0 && (
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
            )}
          </div>
        </aside>
      </div>

      {/* Footer at Bottom */}
      <div className="mt-auto">
        <Footer onNavigate={(page) => {
          window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
        }} />
      </div>

      {/* Settings Modal - Token & OpenAI Key */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                {t('settings')}
              </h2>
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    // Reset to saved values when closing with unsaved changes
                    setGithubToken(savedToken);
                    setOpenAIApiKeyState(savedOpenAIKey);
                    setHasUnsavedChanges(false);
                  }
                  setShowSettingsModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* GitHub Token Section */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4 text-orange-500" />
                  {t('token')}
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => {
                    setGithubToken(e.target.value);
                    setTokenSaved(false);
                    const hasChanges = e.target.value.trim() !== savedToken || openAIApiKey.trim() !== savedOpenAIKey;
                    setHasUnsavedChanges(hasChanges);
                  }}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                {tokenSaved && (
                  <div className="flex items-center gap-2 text-xs text-green-600 font-medium mt-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Token saved successfully!
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
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
              
              {/* OpenAI API Key Section */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  {t('openaiKey')}
                </label>
                <input
                  type="password"
                  value={openAIApiKey}
                  onChange={(e) => {
                    setOpenAIApiKeyState(e.target.value);
                    setOpenAIKeySaved(false);
                    const hasChanges = e.target.value.trim() !== savedOpenAIKey || githubToken.trim() !== savedToken;
                    setHasUnsavedChanges(hasChanges);
                  }}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
                {openAIKeySaved && (
                  <div className="flex items-center gap-2 text-xs text-green-600 font-medium mt-2">
                    <CheckCircle2 className="w-4 h-4" />
                    API key saved successfully!
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
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
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    // Reset to saved values
                    setGithubToken(savedToken);
                    setOpenAIApiKeyState(savedOpenAIKey);
                    setHasUnsavedChanges(false);
                  }
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {hasUnsavedChanges ? 'Cancel' : 'Close'}
              </button>
              {hasUnsavedChanges && (
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
                      // Close modal after a short delay to show success message
                      setTimeout(() => {
                        setShowSettingsModal(false);
                      }, 500);
                    } catch (err) {
                      setError('Failed to save changes. Please try again.');
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('saveChanges')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Format & Section Selection Modal */}
      {showFormatSectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-5 lg:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="p-1.5 md:p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg flex-shrink-0">
                  <Layers className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">Select Formats & Sections</h3>
                  <p className="text-xs md:text-sm text-gray-600 truncate">Choose output formats and documentation sections</p>
                </div>
              </div>
              <button
                onClick={() => setShowFormatSectionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label={t('close')}
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
              <div className="space-y-6">
                {/* Output Formats Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    {t('formats')}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(['markdown', 'markdown_mermaid', 'mdx', 'openapi', 'html'] as DocOutputFormat[]).map((format) => {
                      const isSelected = tempSelectedFormats.includes(format);
                      return (
                        <button
                          key={format}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (tempSelectedFormats.length > 1) {
                                setTempSelectedFormats(tempSelectedFormats.filter(f => f !== format));
                              }
                            } else {
                              setTempSelectedFormats([...tempSelectedFormats, format]);
                            }
                          }}
                          className={`px-4 py-3 rounded-lg border-2 transition-all font-semibold text-sm ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500 shadow-lg shadow-orange-500/30'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          {format === 'markdown' ? 'Markdown' :
                           format === 'markdown_mermaid' ? 'Markdown + Mermaid' :
                           format === 'mdx' ? 'MDX' :
                           format === 'openapi' ? 'OpenAPI' :
                           'HTML'}
                        </button>
                      );
                    })}
                  </div>
                  {tempSelectedFormats.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">Please select at least one format</p>
                  )}
                </div>

                {/* Section Types Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-orange-500" />
                    {t('sections')}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(['README', 'ARCHITECTURE', 'API', 'COMPONENTS', 'TESTING_CI', 'CHANGELOG'] as DocSectionType[]).map((sectionType) => {
                      const isSelected = tempSelectedSections.includes(sectionType);
                      return (
                        <button
                          key={sectionType}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (tempSelectedSections.length > 1) {
                                setTempSelectedSections(tempSelectedSections.filter(s => s !== sectionType));
                              }
                            } else {
                              setTempSelectedSections([...tempSelectedSections, sectionType]);
                            }
                          }}
                          className={`px-4 py-3 rounded-lg border-2 transition-all font-semibold text-sm ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500 shadow-lg shadow-orange-500/30'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          {sectionType === 'README' ? t('sectionReadme') :
                           sectionType === 'ARCHITECTURE' ? t('sectionArchitecture') :
                           sectionType === 'API' ? t('sectionApiReference') :
                           sectionType === 'COMPONENTS' ? t('sectionComponents') :
                           sectionType === 'TESTING_CI' ? t('sectionTestingCicd') :
                           t('sectionChangelog')}
                        </button>
                      );
                    })}
                  </div>
                  {tempSelectedSections.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">Please select at least one section</p>
                  )}
                </div>

                {/* Model Selector */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-orange-500" />
                    AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white font-semibold"
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-4">GPT-4 - Standard</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-5.2">GPT-5.2</option>
                    <option value="gpt-5-codex">GPT-5 Codex</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Select the AI model to use for documentation generation. GPT-4o Mini is recommended for faster and cost-effective generation.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-5 lg:p-6 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowFormatSectionModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (tempSelectedFormats.length === 0) {
                    setError(t('selectAtLeastOneFormat'));
                    return;
                  }
                  if (tempSelectedSections.length === 0) {
                    setError(t('selectAtLeastOneSection'));
                    return;
                  }
                  // Update the actual selections
                  setSelectedOutputFormats(tempSelectedFormats);
                  setSelectedSectionTypes(tempSelectedSections);
                  // Close this modal and open the workflow modal with auto-start
                  setShowFormatSectionModal(false);
                  setShowAgentWorkflowModal(true);
                  // Set flag to auto-start workflow
                  setTimeout(() => {
                    const event = new CustomEvent('autoStartWorkflow');
                    window.dispatchEvent(event);
                  }, 100);
                }}
                disabled={tempSelectedFormats.length === 0 || tempSelectedSections.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Documentation
              </button>
            </div>
          </div>
        </div>
      )}

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
                selectedModel={selectedModel}
                onReposChange={(repos) => {
                  setSelectedRepos(repos);
                }}
                onComplete={(state) => {
                  // Store the model used for this generation
                  setModelUsedForGeneration(selectedModel);
                  console.log('[DocumentationEditor] onComplete called with state:', {
                    hasGeneratedDocs: !!state.generatedDocs,
                    generatedDocsSize: state.generatedDocs?.size || 0,
                    hasGeneratedDocsFull: !!state.generatedDocsFull,
                    generatedDocsFullSize: state.generatedDocsFull?.size || 0,
                    hasErrors: !!state.errors && state.errors.size > 0,
                    errorsCount: state.errors?.size || 0,
                  });
                  
                  // Update documentation from agent results
                  if (state.generatedDocs && state.generatedDocs.size > 0) {
                    const newDocs = new Map<string, string>();
                    const repoNames: string[] = [];
                    state.generatedDocs.forEach((doc, repoFullName) => {
                      console.log(`[DocumentationEditor] Setting docs for ${repoFullName}, length: ${doc.length}`);
                      newDocs.set(repoFullName, doc);
                      repoNames.push(repoFullName);
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
                        // Enable assistant once documentation is generated
                        setShowAssistant(true);
                      }
                    }
                    
                    // Show success notification (even if there were some errors)
                    const hasErrors = state.errors && state.errors.size > 0;
                    const notificationMessage = repoNames.length === 1
                      ? `Documentation generated successfully for ${repoNames[0]}${hasErrors ? ' (some errors occurred)' : ''}`
                      : `Documentation generated successfully for ${repoNames.length} repositories${hasErrors ? ' (some errors occurred)' : ''}`;
                    
                    setNotification({
                      message: notificationMessage,
                      type: hasErrors ? 'info' : 'success', // Use 'info' if there were errors, 'success' if all good
                      repoName: repoNames.length === 1 ? repoNames[0] : repoNames.join(', '),
                    });
                    
                    // Auto-dismiss notification after 5 seconds (7 seconds if there were errors)
                    setTimeout(() => {
                      setNotification(null);
                    }, hasErrors ? 7000 : 5000);
                    
                  } else {
                    console.warn('[DocumentationEditor] No generated docs in state!');
                    // Show error notification
                    setNotification({
                      message: 'Documentation generation completed but no documentation was generated. Please check the console for errors.',
                      type: 'error',
                    });
                    setTimeout(() => {
                      setNotification(null);
                    }, 5000);
                  }
                  
                  setShowAgentWorkflowModal(false);
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

      {/* Clear All Repositories Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Clear All Repositories</h3>
                  <p className="text-sm text-gray-600">Are you sure?</p>
                </div>
              </div>
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to remove all <span className="font-semibold text-gray-900">{selectedRepos.length}</span> selected {selectedRepos.length === 1 ? 'repository' : 'repositories'}?
              </p>
              {(documentation || repoDocumentations.size > 0) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    Clearing all repositories will also remove all generated documentation.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  // Clear all selected repos
                  setSelectedRepos([]);
                  // Clear all documentation
                  setRepoDocumentations(new Map());
                  setRepoDocumentationsFull(new Map());
                  // Reset active tab and documentation
                  setActiveTab('combined');
                  setDocumentation('');
                  // Close modal
                  setShowClearAllConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Repository Confirmation Modal */}
      {showRemoveRepoConfirm && repoToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Remove Repository</h3>
                  <p className="text-sm text-gray-600">Are you sure?</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRemoveRepoConfirm(false);
                  setRepoToRemove(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to remove <span className="font-semibold text-gray-900">{repoToRemove.fullName}</span> from the selected repositories?
              </p>
              {documentation && repoDocumentations.has(repoToRemove.fullName) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    Removing this repository will also remove its generated documentation.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRemoveRepoConfirm(false);
                  setRepoToRemove(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (repoToRemove) {
                    setSelectedRepos(selectedRepos.filter((r) => r.id !== repoToRemove.id));
                    // Remove documentation for this repo if it exists
                    if (repoDocumentations.has(repoToRemove.fullName)) {
                      const newDocs = new Map(repoDocumentations);
                      newDocs.delete(repoToRemove.fullName);
                      setRepoDocumentations(newDocs);
                    }
                    if (repoDocumentationsFull.has(repoToRemove.fullName)) {
                      const newDocsFull = new Map(repoDocumentationsFull);
                      newDocsFull.delete(repoToRemove.fullName);
                      setRepoDocumentationsFull(newDocsFull);
                    }
                    // If this was the active tab, switch to combined or first repo
                    if (activeTab === repoToRemove.fullName) {
                      const remainingRepos = selectedRepos.filter((r) => r.id !== repoToRemove.id);
                      if (remainingRepos.length > 0) {
                        setActiveTab(remainingRepos[0].fullName);
                      } else {
                        setActiveTab('combined');
                        setDocumentation('');
                      }
                    }
                  }
                  setShowRemoveRepoConfirm(false);
                  setRepoToRemove(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-5 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-50 border-green-200' :
          notification.type === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        } border-2 rounded-xl shadow-2xl p-4 backdrop-blur-sm`}>
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 p-2 rounded-lg ${
              notification.type === 'success' ? 'bg-green-100' :
              notification.type === 'error' ? 'bg-red-100' :
              'bg-blue-100'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className={`w-5 h-5 ${notification.type === 'success' ? 'text-green-600' : ''}`} />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-bold text-sm ${
                notification.type === 'success' ? 'text-green-900' :
                'text-red-900'
              }`}>
                {notification.type === 'success' ? 'Documentation Generated' :
                 'Generation Failed'}
              </h4>
              <p className={`text-xs mt-1 ${
                notification.type === 'success' ? 'text-green-700' :
                'text-red-700'
              }`}>
                {notification.message}
              </p>
              {notification.repoName && (
                <p className="text-xs mt-1 text-gray-600 font-mono">
                  {notification.repoName}
                </p>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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
