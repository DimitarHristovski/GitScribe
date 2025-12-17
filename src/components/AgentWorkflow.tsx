/**
 * Agent Workflow UI Component
 * Provides UI for repo selection and agent workflow execution
 */

import { useState, useEffect, useCallback } from 'react';
import { Play, CheckCircle2, XCircle, Loader2, Github, FileText, Sparkles, ArrowRight, BarChart3, FolderTree, Award, Download, Copy } from 'lucide-react';
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
  selectedModel?: string;
  onReposChange: (repos: SimpleRepo[]) => void;
  onComplete: (state: AgentState) => void;
}

export default function AgentWorkflow({
  selectedRepos,
  selectedOutputFormats = ['markdown'],
  selectedSectionTypes = ['README'],
  selectedLanguage: propSelectedLanguage = 'en',
  selectedModel = 'gpt-4o-mini',
  onReposChange,
  onComplete,
}: AgentWorkflowProps) {
  const [running, setRunning] = useState(false);
  const [currentState, setCurrentState] = useState<AgentState | null>(null);
  const [error, setError] = useState<string>('');
  const [managerInstance, setManagerInstance] = useState<AgentManager | null>(null);
  
  // Get language from localStorage or use prop
  const [selectedLanguage] = useState<DocLanguage>(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return (saved as DocLanguage) || propSelectedLanguage;
  });
  const t = useTranslation(selectedLanguage);

  const handleRun = useCallback(async () => {
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
      selectedModel: selectedModel,
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
  }, [selectedRepos, selectedOutputFormats, selectedSectionTypes, selectedLanguage, selectedModel, onComplete, t]);

  // Auto-start workflow when event is dispatched
  useEffect(() => {
    const handleAutoStart = () => {
      if (!running && selectedRepos.length > 0) {
        handleRun();
      }
    };

    window.addEventListener('autoStartWorkflow', handleAutoStart);
    return () => {
      window.removeEventListener('autoStartWorkflow', handleAutoStart);
    };
  }, [running, selectedRepos.length, handleRun]);

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
      case AgentStep.PLANNING:
        return t('documentationPlanning');
      case AgentStep.WRITING:
        return t('documentationWriting');
      case AgentStep.COMPLETE:
        return t('complete');
      default:
        return step;
    }
  };

  const steps: AgentStep[] = [
    AgentStep.DISCOVERY,
    AgentStep.ANALYSIS,
    AgentStep.PLANNING,
    AgentStep.WRITING,
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
        {running && (
          <div className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('running')}</span>
          </div>
          )}
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
        currentState?.generatedDocsFull) && (
        <div className="mt-6 space-y-4">
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

