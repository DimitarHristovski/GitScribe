/**
 * Agent Workflow UI Component
 * Provides UI for repo selection and agent workflow execution
 */

import { useState, useEffect } from 'react';
import { Play, CheckCircle2, XCircle, Loader2, Github, FileText, GitCommit, Sparkles, ArrowRight, BarChart3, FolderTree, Award, Download, Copy } from 'lucide-react';
import { SimpleRepo } from '../lib/github-service';
import { AgentState, AgentStep } from '../lib/agents/types';
import { AgentManager } from '../lib/agents/Manager';
import { DocOutputFormat, DocSectionType, DocLanguage } from '../types/core';
import { useTranslation } from '../lib/translations';

interface AgentWorkflowProps {
  selectedRepos: SimpleRepo[];
  selectedOutputFormats?: DocOutputFormat[];
  selectedSectionTypes?: DocSectionType[];
  selectedLanguage?: DocLanguage;
  onReposChange: (repos: SimpleRepo[]) => void;
  onComplete: (state: AgentState) => void;
}

export default function AgentWorkflow({
  selectedRepos,
  selectedOutputFormats = ['markdown'],
  selectedSectionTypes = ['README'],
  selectedLanguage: propSelectedLanguage = 'en',
  onReposChange,
  onComplete,
}: AgentWorkflowProps) {
  const [running, setRunning] = useState(false);
  const [currentState, setCurrentState] = useState<AgentState | null>(null);
  const [error, setError] = useState<string>('');
  const [committing, setCommitting] = useState(false);
  const [managerInstance, setManagerInstance] = useState<AgentManager | null>(null);
  
  // Get language from localStorage or use prop
  const [selectedLanguage] = useState<DocLanguage>(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return (saved as DocLanguage) || propSelectedLanguage;
  });
  const t = useTranslation(selectedLanguage);

  const handleRun = async () => {
    if (selectedRepos.length === 0) {
      setError(t('pleaseSelectAtLeastOneRepository'));
      return;
    }
    
    setError('');

    setRunning(true);
    setError('');
    setCurrentState(null);

    const initialState: AgentState = {
      selectedRepos,
      selectedOutputFormats,
      selectedSectionTypes,
      selectedLanguage,
      options: {
        commitMessage: 'docs: Add auto-generated documentation',
        branch: 'main',
        autoCommit: false, // Don't auto-commit, let user review first
      },
      completedSteps: new Set(),
    };

    try {
      const manager = new AgentManager(
        initialState,
        (state) => {
          setCurrentState(state);
        },
        (progress) => {
          // Progress updates handled via state
        }
      );
      
      setManagerInstance(manager);
      
      const finalState = await manager.run();

      setCurrentState(finalState);
      onComplete(finalState);
    } catch (err: any) {
      setError(err.message || t('workflowFailed'));
      console.error('Agent workflow error:', err);
    } finally {
      setRunning(false);
    }
  };

  const handleCommit = async () => {
    if (!currentState || !managerInstance) {
      setError(t('noWorkflowState'));
      return;
    }

    if (!currentState.generatedDocs || currentState.generatedDocs.size === 0) {
      setError(t('noDocumentationToCommit'));
      return;
    }

    setCommitting(true);
    setError('');

    try {
      // Enable auto-commit for this run
      const updatedState = {
        ...currentState,
        options: {
          ...currentState.options,
          autoCommit: true,
        },
      };

      // Update manager state
      managerInstance.reset(updatedState);

      // Execute GitOps step
      await managerInstance.executeStep(AgentStep.GITOPS);

      // Get updated state
      const finalState = managerInstance.getState();
      setCurrentState(finalState);
      
      // Notify parent of completion
      onComplete(finalState);
    } catch (err: any) {
      setError(err.message || t('commitFailed'));
      console.error('Commit error:', err);
    } finally {
      setCommitting(false);
    }
  };

  const getStepStatus = (step: AgentStep): 'pending' | 'running' | 'completed' | 'error' => {
    if (!currentState) return 'pending';
    
    if (currentState.currentStep === step) return 'running';
    if (currentState.completedSteps?.has(step)) return 'completed';
    if (currentState.errors?.has(`manager_${step}`)) return 'error';
    
    return 'pending';
  };

  const getStepIcon = (step: AgentStep, status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepName = (step: AgentStep): string => {
    switch (step) {
      case AgentStep.DISCOVERY:
        return t('repositoryDiscovery');
      case AgentStep.ANALYSIS:
        return t('repositoryAnalysis');
      case AgentStep.QUALITY:
        return t('qualityAnalysis');
      case AgentStep.REFACTOR:
        return t('refactorProposal');
      case AgentStep.PLANNING:
        return t('documentationPlanning');
      case AgentStep.WRITING:
        return t('documentationWriting');
      case AgentStep.GITOPS:
        return t('gitOperations');
      case AgentStep.COMPLETE:
        return t('complete');
      default:
        return step;
    }
  };

  const steps: AgentStep[] = [
    AgentStep.DISCOVERY,
    AgentStep.ANALYSIS,
    AgentStep.QUALITY,
    AgentStep.REFACTOR,
    AgentStep.PLANNING,
    AgentStep.WRITING,
    AgentStep.GITOPS,
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            {t('agentWorkflow')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('automatedPipeline')}
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={running || selectedRepos.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          {running ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('running')}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>{t('runWorkflow')}</span>
            </>
          )}
        </button>
      </div>

      {/* Selected Configuration Display */}
      <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200/50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              {t('outputFormats')}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedOutputFormats.map((format) => (
                <span
                  key={format}
                  className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                >
                  {format === 'markdown' ? 'MD' :
                   format === 'markdown_mermaid' ? 'MD+Mermaid' :
                   format === 'mdx' ? 'MDX' :
                   format === 'openapi' ? 'OpenAPI' :
                   'HTML'}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              {t('sectionTypes')}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedSectionTypes.map((type) => (
                <span
                  key={type}
                  className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Workflow Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                {getStepIcon(step, status)}
                {!isLast && (
                  <div
                    className={`w-0.5 h-12 mt-2 ${
                      status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{getStepName(step)}</h4>
                  {currentState?.progress &&
                    currentState.progress.currentAgent === step.replace('_', '') && (
                      <span className="text-xs text-gray-500">
                        {currentState.progress.current}/{currentState.progress.total}
                        {currentState.progress.currentRepo && (
                          <span className="ml-2 text-red-600">
                            {currentState.progress.currentRepo.split('/')[1]}
                          </span>
                        )}
                      </span>
                    )}
                </div>
                {status === 'running' && currentState?.progress?.currentRepo && (
                  <p className="text-sm text-gray-600 mt-1">
                    {t('processing')} {currentState.progress.currentRepo}
                  </p>
                )}
                {status === 'completed' && (
                  <p className="text-sm text-green-600 mt-1">{t('completed')}</p>
                )}
                {status === 'error' && (
                  <p className="text-sm text-red-600 mt-1">
                    {t('error')} {currentState?.errors?.get(`manager_${step}`)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Results Summary - Show as data becomes available */}
      {(currentState?.currentStep === AgentStep.COMPLETE || 
        currentState?.qualityReports || 
        currentState?.refactorProposals || 
        currentState?.badges || 
        currentState?.generatedDocsFull) && (
        <div className="mt-6 space-y-4">
          {/* Features Summary Banner */}
          <div className="p-4 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              {t('generatedFeatures')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {currentState.qualityReports && currentState.qualityReports.size > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{t('qualityScores')}</span>
                </div>
              )}
              {currentState.refactorProposals && currentState.refactorProposals.size > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>{t('refactorProposals')}</span>
                </div>
              )}
              {currentState.badges && currentState.badges.size > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                  <Award className="w-3.5 h-3.5" />
                  <span>{t('badges')}</span>
                </div>
              )}
              {currentState.generatedDocsFull && currentState.generatedDocsFull.size > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded">
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('pdfExport')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Status Summary */}
          {currentState?.currentStep === AgentStep.COMPLETE && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {t('workflowComplete')}
              </h4>
              <div className="space-y-2 text-sm text-green-800">
                {currentState.generatedDocs && (
                  <p>
                    {t('generatedDocumentationFor')} {currentState.generatedDocs.size} {currentState.generatedDocs.size !== 1 ? t('repositories') : t('repository')}
                  </p>
                )}
                {currentState.commitResults && currentState.commitResults.size > 0 ? (
                  <p>
                    {t('committedTo')}{' '}
                    {Array.from(currentState.commitResults.values()).filter((r) => r.success).length}{' '}
                    {Array.from(currentState.commitResults.values()).filter((r) => r.success).length !== 1
                      ? t('repositories')
                      : t('repository')}
                  </p>
                ) : currentState.generatedDocs && currentState.generatedDocs.size > 0 && (
                  <p className="text-amber-700 font-medium">
                    {t('reviewAndCommit')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Commit Button - Only show if docs are generated but not yet committed */}
          {currentState?.generatedDocs && 
           currentState.generatedDocs.size > 0 && 
           (!currentState.commitResults || currentState.commitResults.size === 0) && (
            <button
              onClick={handleCommit}
              disabled={committing}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
            >
              {committing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('committing')}</span>
                </>
              ) : (
                <>
                  <GitCommit className="w-5 h-5" />
                  <span>{t('commitToRepos')}</span>
                </>
              )}
            </button>
          )}

          {/* Commit Results */}
          {currentState.commitResults && currentState.commitResults.size > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <GitCommit className="w-5 h-5" />
                {t('commitResults')}
              </h4>
              <div className="space-y-2 text-sm">
                {Array.from(currentState.commitResults.values()).map((result) => (
                  <div
                    key={result.repo.fullName}
                    className={`p-2 rounded ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.repo.name}</span>
                      {result.success ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    {result.success && result.commitUrl && (
                      <a
                        href={result.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:underline mt-1 block"
                      >
                        {t('viewCommit')} →
                      </a>
                    )}
                    {!result.success && result.error && (
                      <p className="text-xs mt-1">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Scores */}
          {currentState.qualityReports && currentState.qualityReports.size > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t('repositoryQualityScores')}
              </h4>
              <div className="space-y-3">
                {Array.from(currentState.qualityReports.entries()).map(([repoName, quality]) => {
                  const score = quality.overallScore;
                  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600';
                  return (
                    <div key={repoName} className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{repoName.split('/')[1]}</span>
                        <span className={`text-2xl font-bold ${scoreColor}`}>{score}/100</span>
                      </div>
                      <div className="space-y-1.5">
                        {quality.metrics && quality.metrics.map((metric) => (
                          <div key={metric.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    metric.score >= 80 ? 'bg-green-500' :
                                    metric.score >= 60 ? 'bg-blue-500' :
                                    metric.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${metric.score}%` }}
                                />
                              </div>
                              <span className="text-gray-700 font-medium min-w-[80px]">{metric.label}</span>
                            </div>
                            <span className="text-gray-600 min-w-[40px] text-right">{metric.score}/100</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Refactor Proposals */}
          {currentState.refactorProposals && currentState.refactorProposals.size > 0 && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <FolderTree className="w-5 h-5" />
                {t('folderStructureRefactorProposals')}
              </h4>
              <div className="space-y-3">
                {Array.from(currentState.refactorProposals.entries()).map(([repoName, proposal]) => (
                  <div key={repoName} className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="font-semibold text-gray-900 mb-2">{repoName.split('/')[1]}</div>
                    <p className="text-sm text-gray-700 mb-3">{proposal.highLevelSummary}</p>
                    
                    {proposal.recommendedStructure && proposal.recommendedStructure.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1.5">{t('recommendedStructure')}</h5>
                        <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                          {proposal.recommendedStructure.map((folder, idx) => (
                            <li key={idx}>
                              <span className="font-mono text-purple-600">{folder.folder}</span> - {folder.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {proposal.moves && proposal.moves.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-gray-700 mb-1.5">{t('proposedMoves')} ({proposal.moves.length}):</h5>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {proposal.moves.slice(0, 5).map((move, idx) => (
                            <div key={idx} className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
                              <div className="flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-mono text-purple-700 truncate">{move.fromPath}</div>
                                  <div className="font-mono text-green-700 truncate">{move.toPath}</div>
                                  <div className="text-gray-600 mt-0.5">{move.reason}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {proposal.moves.length > 5 && (
                            <p className="text-xs text-gray-500 italic">+ {proposal.moves.length - 5} {t('moreMoves')}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {proposal.warnings && proposal.warnings.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <strong>⚠️ {t('warnings')}:</strong> {proposal.warnings.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {currentState.badges && currentState.badges.size > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                {t('generatedRepositoryBadges')}
              </h4>
              <div className="space-y-3">
                {Array.from(currentState.badges.entries()).map(([repoName, badgeMarkdown]) => (
                  <div key={repoName} className="bg-white rounded-lg p-3 border border-yellow-100">
                    <div className="font-semibold text-gray-900 mb-2">{repoName.split('/')[1]}</div>
                    <div className="bg-gray-900 text-gray-100 rounded p-3 font-mono text-xs overflow-x-auto mb-2">
                      <pre className="whitespace-pre-wrap">{badgeMarkdown}</pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(badgeMarkdown);
                        alert(t('badgeMarkdownCopiedToClipboard'));
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      {t('copyBadgeMarkdown')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF Export */}
          {currentState.generatedDocsFull && currentState.generatedDocsFull.size > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <Download className="w-5 h-5" />
                {t('pdfExport')}
              </h4>
              <div className="space-y-2">
                {Array.from(currentState.generatedDocsFull.entries()).map(([repoName, docs]) => (
                  <div key={repoName} className="bg-white rounded-lg p-3 border border-red-100">
                    <div className="font-semibold text-gray-900 mb-2">{repoName.split('/')[1]}</div>
                    <div className="flex flex-wrap gap-2">
                      {docs.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={async () => {
                            try {
                              const { exportToPDF, downloadPDF } = await import('../lib/pdf-exporter');
                              const blobUrl = await exportToPDF(section);
                              downloadPDF(blobUrl, `${repoName.split('/')[1]}_${section.type}_${section.format}.pdf`);
                            } catch (error: any) {
                              alert(`${t('pdfExportFailed')}: ${error.message}`);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {section.type} ({section.format})
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

