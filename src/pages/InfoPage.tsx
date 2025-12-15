import { useState, useEffect } from 'react';
import { ArrowLeft, Github, FolderOpen, Sparkles, Download, GitCommit, BookOpen, Code, Lightbulb, HelpCircle, Shield, FileText, Cookie, Mail } from 'lucide-react';
import Footer from '../components/Footer';
import { useTranslation } from '../lib/translations';
import { DocLanguage } from '../types/core';

type InfoPageType = 
  | 'github-integration'
  | 'multi-repo-support'
  | 'ai-powered-generation'
  | 'export-commit'
  | 'documentation-page'
  | 'api-reference'
  | 'examples'
  | 'support'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'cookie-policy';

interface InfoPageProps {
  pageType: InfoPageType;
  onBack: () => void;
}

export default function InfoPage({ pageType, onBack }: InfoPageProps) {
  // Get language from localStorage or default to 'en'
  const [selectedLanguage, setSelectedLanguage] = useState<DocLanguage>(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return (saved as DocLanguage) || 'en';
  });

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const saved = localStorage.getItem('selectedLanguage');
      if (saved) {
        setSelectedLanguage(saved as DocLanguage);
      }
    };
    
    window.addEventListener('storage', handleLanguageChange);
    // Also check periodically in case localStorage was updated in same window
    const interval = setInterval(handleLanguageChange, 100);
    
    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      clearInterval(interval);
    };
  }, []);

  const t = useTranslation(selectedLanguage);
  const getPageContent = () => {
    switch (pageType) {
      case 'github-integration':
        return {
          title: t('githubIntegration'),
          icon: <Github className="w-8 h-8" />,
          description: t('seamlesslyConnectWithGitHub'),
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('overview')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('gitScribeIntegratesDirectly')} {t('accessYourRepositories')} {t('generateComprehensiveDocumentation')}. 
                  {t('whetherPublicOrPrivate')}, {t('ourIntegrationMakesItEasy')} {t('documentYourCodebase')}.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('features')}</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-orange-100 rounded-lg mt-0.5">
                      <Github className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('repositoryAccess')}</h3>
                      <p className="text-gray-600">{t('connectToAnyRepository')} {t('usingPersonalAccessToken')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('fileAnalysis')}</h3>
                      <p className="text-gray-600">{t('automaticallyAnalyzeRepository')} {t('repositoryStructure')}, {t('codeFiles')}, {t('configuration')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                      <Code className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('codeUnderstanding')}</h3>
                      <p className="text-gray-600">{t('aiPoweredAnalysisOfCodebase')} {t('generateAccurateDocumentation')}</p>
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gettingStarted')}</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">1. {t('createGitHubToken')}</h3>
                    <p className="text-gray-600 mb-2">{t('goToGitHubSettings')} → {t('developerSettings')} → {t('personalAccessTokens')} → {t('tokensClassic')}</p>
                    <p className="text-sm text-gray-500 mb-2">{t('requiredScopes')}: <code className="bg-gray-200 px-2 py-1 rounded">repo</code> ({t('forPrivateRepos')})</p>
                    <p className="text-sm text-gray-500">{t('forPublicRepos')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">2. {t('addTokenToGitScribe')}</h3>
                    <p className="text-gray-600">{t('enterYourToken')} {t('githubTokenField')} {t('documentationEditorSettings')}. {t('clickSaveChanges')} {t('persistIt')}.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">3. {t('startGenerating')}</h3>
                    <p className="text-gray-600 mb-2">{t('enterRepositoryUrl')} ({t('egOwnerRepo')}, <code className="bg-gray-200 px-2 py-1 rounded">{t('ownerRepoPlaceholder')}</code>) {t('selectMultipleRepositories')}</p>
                    <p className="text-gray-600">{t('chooseOutputFormats')} {t('thenClickRunWorkflow')} {t('startAiAgentWorkflow')}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('supportedFormats')}</h2>
                <p className="text-gray-700 mb-3">{t('youCanUseAnyOfTheseFormats')} {t('toSpecifyRepository')}:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">https://github.com/owner/repo</code></li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">github.com/owner/repo</code></li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">owner/repo</code></li>
                </ul>
              </section>
            </div>
          ),
        };

      case 'multi-repo-support':
        return {
          title: t('multiRepoSupportTitle'),
          icon: <FolderOpen className="w-8 h-8" />,
          description: t('multiRepoSupportDescription'),
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('overview')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('gitScribeIntegratesDirectly')} {t('generateDocumentationForMultiple')} {t('simultaneously')}, 
                  {t('saveTimeProcessingMultiple')} {t('maintainConsistentFormat')}.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('keyFeatures')}</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-red-100 rounded-lg mt-0.5">
                      <FolderOpen className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('batchProcessing')}</h3>
                      <p className="text-gray-600">{t('selectAndProcessMultiple')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-red-100 rounded-lg mt-0.5">
                      <Sparkles className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('individualDocumentation')}</h3>
                      <p className="text-gray-600">{t('eachRepositoryGetsOwn')}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1.5 bg-red-100 rounded-lg mt-0.5">
                      <GitCommit className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t('batchCommit')}</h3>
                      <p className="text-gray-600">{t('commitToAllSelected')}</p>
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('howToUse')}</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('selectMultipleReposStep')}</h3>
                    <p className="text-gray-600">{t('clickSelectReposButton')} {t('browseAndSelectFromGitHub')}. {t('searchAndFilterByVisibility')}.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('chooseOutputFormatsSections')}</h3>
                    <p className="text-gray-600">{t('selectOneOrMoreFormats')} {t('markdownMdxOpenapiHtml')} {t('documentationSectionTypes')} {t('readmeArchitectureApi')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('runWorkflowStep')}</h3>
                    <p className="text-gray-600">{t('clickRunWorkflowToStart')} {t('systemWillProcessEachRepo')} {t('throughDiscoveryAnalysisPlanning')}.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('reviewCommitStep')}</h3>
                    <p className="text-gray-600">{t('reviewDocumentationInTabs')} {t('switchBetweenFormatsSections')}. {t('whenReadyClickCommitToRepos')} {t('commitAllAtOnce')}.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('benefits')}</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('saveTimeProcessingMultiple')}</li>
                  <li>{t('maintainConsistentFormat')}</li>
                  <li>{t('easyManagementWithTabs')}</li>
                  <li>{t('batchCommitFunctionality')}</li>
                </ul>
              </section>
            </div>
          ),
        };

      case 'ai-powered-generation':
        return {
          title: t('aiPoweredGenerationTitle'),
          icon: <Sparkles className="w-8 h-8" />,
          description: t('aiPoweredGenerationDescription'),
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('overview')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('aiPoweredOverview')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('aiModels')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('gitScribeSupportsMultipleModels')}. {t('chooseBasedOnNeeds')} {t('speedCostQuality')}:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('gpt4oMiniRecommended')}</h3>
                    <p className="text-sm text-gray-600 mb-2">{t('fastAndCostEffective')}</p>
                    <p className="text-xs text-gray-500">{t('bestBalanceSpeedQuality')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('gpt4o')}</h3>
                    <p className="text-sm text-gray-600 mb-2">{t('mostAdvancedModel')} {t('complexCodebases')}</p>
                    <p className="text-xs text-gray-500">{t('highestQualityHigherCost')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('gpt4Turbo')}</h3>
                    <p className="text-sm text-gray-600 mb-2">{t('balancedPerformanceAccuracy')}</p>
                    <p className="text-xs text-gray-500">{t('goodForLargeRepos')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('gpt35Turbo')}</h3>
                    <p className="text-sm text-gray-600 mb-2">{t('fastAndEconomical')} {t('simpleProjects')}</p>
                    <p className="text-xs text-gray-500">{t('lowestCostOption')}</p>
                  </div>
                </div>
                <p className="text-gray-600 mt-4 text-sm">
                  {t('youCanChangeModel')} {t('settingsPanel')}. {t('realtimeCostEstimation')} {t('statisticsSidebar')}.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('aiAssistant')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('aiAssistantFeature')} {t('interactivelyEditImprove')}:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{t('rewriteSectionsForClarity')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{t('fixGrammarSpellingErrors')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{t('addRemoveContentBasedOnNeeds')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{t('restructureDocumentation')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{t('formatTextImproveReadability')}</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('costEstimation')}</h2>
                <p className="text-gray-700 mb-3">
                  {t('gitScribeProvidesRealtime')} {t('basedOn')}:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('selectedAiModelPricing')}</li>
                  <li>{t('estimatedTokenUsage')}</li>
                  <li>{t('documentationLengthComplexity')}</li>
                </ul>
                <p className="text-gray-600 mt-4 text-sm">
                  {t('costsDisplayedInStatistics')} {t('statisticsSidebar')} {t('duringGeneration')}.
                </p>
              </section>
            </div>
          ),
        };

      case 'export-commit':
        return {
          title: t('exportCommitTitle'),
          icon: <Download className="w-8 h-8" />,
          description: t('exportCommitDescription'),
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('exportDocumentation')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('downloadGeneratedDocumentation')}
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('exportFormats')}</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>{t('formatMarkdown')}</strong> - {t('markdownStandardFormat')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>{t('formatMarkdownMermaid')}</strong> - {t('markdownMermaidDescription')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>{t('formatMdx')}</strong> - {t('mdxDescription')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>{t('formatOpenapi')}</strong> - {t('openapiDescription')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">✓</span>
                      <span><strong>{t('formatHtml')}</strong> - {t('htmlDescription')}</span>
                    </li>
                  </ul>
                  <p className="text-gray-600 mt-4 text-sm">
                    {t('eachFormatGenerated')}
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('commitToRepository')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('automaticallyCommitDocumentation')}
                </p>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('howItWorks')}</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                      <li>{t('runWorkflowGenerate')}</li>
                      <li>{t('reviewGeneratedDocumentation')}</li>
                      <li>{t('clickCommitToRepos')}</li>
                      <li>{t('enterCommitMessage')}</li>
                      <li>{t('specifyTargetBranch')}</li>
                      <li>{t('documentationCommitted')}</li>
                    </ol>
                    <p className="text-gray-600 mt-3 text-sm">
                      <strong>{t('overview')}:</strong> {t('workflowStopsAfterGeneration')} {t('controlOverCommits')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('multiRepoSupportTitle')}</h3>
                    <p className="text-gray-700 mb-2">
                      {t('whenWorkingWithMultiple')} {t('commitOperationProcesses')}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {t('documentationStoredSeparately')}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('autoUpdateFeature')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('enableAutoUpdateDescription')}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-green-600">🔄</span>
                    {t('automaticUpdates')}
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• {t('monitorsRepositories')}</li>
                    <li>• {t('detectsPushesMerges')}</li>
                    <li>• {t('automaticallyRegenerates')}</li>
                    <li>• {t('commitsUpdatedDocumentation')}</li>
                  </ul>
                </div>
              </section>
            </div>
          ),
        };

      case 'documentation-page':
        return {
          title: t('documentationTitle'),
          icon: <BookOpen className="w-8 h-8" />,
          description: t('completeGuideToUsing'),
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gettingStarted')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('welcomeToGitScribe')}
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('quickStart')}</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                    <li>{t('addOpenAiKey')}</li>
                    <li>{t('optionalAddGitHubToken')}</li>
                    <li>{t('enterRepositoryUrlOrSelect')}</li>
                    <li>{t('chooseOutputFormatsSections')}</li>
                    <li>{t('clickRunWorkflowStart')}</li>
                    <li>{t('reviewEditCommit')}</li>
                  </ol>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('coreFeatures')}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Github className="w-5 h-5 text-orange-600" />
                      {t('githubIntegration')}
                    </h3>
                    <p className="text-sm text-gray-600">{t('directIntegration')}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-orange-600" />
                      {t('multiRepoSupport')}
                    </h3>
                    <p className="text-sm text-gray-600">{t('processMultipleRepos')}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                      {t('aiAgentWorkflows')}
                    </h3>
                    <p className="text-sm text-gray-600">{t('intelligentAgentSystem')}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <GitCommit className="w-5 h-5 text-orange-600" />
                      {t('export')} & {t('commit')}
                    </h3>
                    <p className="text-sm text-gray-600">{t('multipleOutputFormats')}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('outputFormats')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('outputFormatsDescription')}
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900">{t('formatMarkdown')}</h4>
                    <p className="text-sm text-gray-600">{t('standardMarkdownFormat')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900">{t('formatMarkdownMermaid')}</h4>
                    <p className="text-sm text-gray-600">{t('markdownWithDiagrams')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900">{t('formatMdx')}</h4>
                    <p className="text-sm text-gray-600">{t('markdownWithJsx')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900">{t('formatOpenapi')}</h4>
                    <p className="text-sm text-gray-600">{t('yamlFormatForApi')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900">{t('formatHtml')}</h4>
                    <p className="text-sm text-gray-600">{t('fullyStyledHtml')}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('documentationSections')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('generateDifferentTypes')}
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>{t('sectionReadme')}</strong> - {t('readmeDescription')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>{t('sectionArchitecture')}</strong> - {t('architectureDescription')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>{t('sectionApiReference')}</strong> - {t('apiReferenceDescription')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>{t('sectionComponents')}</strong> - {t('componentsDescription')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>{t('sectionTestingCicd')}</strong> - {t('testingCicdDescription')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span><strong>{t('sectionChangelog')}</strong> - {t('changelogDescription')}</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('aiAgentWorkflow')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('gitScribeUsesIntelligent')}
                </p>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-orange-600">1. {t('repoDiscovery')}</span>
                      <span className="text-gray-700">{t('validatesAndDiscovers')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-orange-600">2. {t('repoAnalysis')}</span>
                      <span className="text-gray-700">{t('analyzesStructure')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-orange-600">3. {t('docsPlanner')}</span>
                      <span className="text-gray-700">{t('createsStructuredPlan')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-bold text-orange-600">4. {t('docsWriter')}</span>
                      <span className="text-gray-700">{t('generatesDocumentation')}</span>
                    </li>
                  </ol>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('learnMore')}</h2>
                <p className="text-gray-700">
                  {t('exploreOtherPages')}
                </p>
              </section>
            </div>
          ),
        };

      case 'api-reference':
        return {
          title: t('apiReferenceTitle'),
          icon: <Code className="w-8 h-8" />,
          description: t('completeApiDocumentation'),
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('agentWorkflowSystem')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('gitScribeUsesLangGraph')}
                </p>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto mb-4">
                  <pre className="text-sm">
{`${t('agentWorkflowSteps')}
1. ${t('repoDiscovery')} - ${t('validatesAndDiscovers')}
2. ${t('repoAnalysis')} - ${t('analyzesStructure')}
3. ${t('docsPlanner')} - ${t('createsStructuredPlan')}
4. ${t('docsWriter')} - ${t('generatesDocumentation')}`}
                  </pre>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('agentState')}</h3>
                  <p className="text-gray-700 text-sm mb-2">
                    {t('workflowMaintainsSharedState')}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-2">
                    <li>{t('discoveredRepositories')}</li>
                    <li>{t('repositoryAnalyses')}</li>
                    <li>{t('documentationPlans')}</li>
                    <li>{t('generatedDocumentationByFormat')}</li>
                    <li>{t('commitResults')}</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('githubService')}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('functionFetchUserRepos')}</h3>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm">
{`fetchUserRepos(options?: {
  visibility?: 'all' | 'public' | 'private';
  perPage?: number;
  page?: number;
}): Promise<SimpleRepo[]>`}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('functionCreateOrUpdateFile')}</h3>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm">
{`createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch?: string
): Promise<CommitResponse>`}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('langChainService')}</h2>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('functionCallLangChain')}</h3>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
{`callLangChain(
  prompt: string,
  systemPrompt?: string,
  model?: string,
  temperature?: number
): Promise<string>`}
                    </pre>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('typeDefinitions')}</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">{t('typeSimpleRepo')}</h3>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm">
{`type SimpleRepo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  htmlUrl: string;
  description?: string;
  defaultBranch: string;
}`}
                      </pre>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">{t('typeDocOutputFormat')}</h3>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm">
{`type DocOutputFormat = 
  | 'markdown'
  | 'markdown_mermaid'
  | 'mdx'
  | 'openapi'
  | 'html';`}
                      </pre>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">{t('typeDocSectionType')}</h3>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm">
{`type DocSectionType = 
  | 'README'
  | 'ARCHITECTURE'
  | 'API'
  | 'COMPONENTS'
  | 'TESTING_CI'
  | 'CHANGELOG';`}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ),
        };

      case 'examples':
        return {
          title: t('examplesTitle'),
          icon: <Lightbulb className="w-8 h-8" />,
          description: t('exampleUseCases'),
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('example1SingleRepository')}</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('scenario')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('youWantToGenerate')}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-3">{t('steps')}</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                    <li>{t('enterGitHubRepositoryUrl')} <code className="bg-gray-200 px-2 py-1 rounded">facebook/react</code></li>
                    <li>{t('selectOutputFormatsEg')}</li>
                    <li>{t('selectSectionTypesEg')}</li>
                    <li>{t('clickRunWorkflowStart')}</li>
                    <li>{t('watchWorkflowProgress')}</li>
                    <li>{t('reviewGeneratedDocumentationSwitch')}</li>
                    <li>{t('clickCommitToReposWhenReady')}</li>
                  </ol>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('example2MultipleRepositories')}</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('scenario')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('youManageMultipleMicroservices')}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-3">{t('steps')}</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                    <li>{t('clickSelectRepositories')}</li>
                    <li>{t('selectOutputFormatsEgOpenAPI')}</li>
                    <li>{t('selectSectionTypesEg')}</li>
                    <li>{t('clickRunWorkflowStart')}</li>
                    <li>{t('monitorWorkflowProgress')}</li>
                    <li>{t('reviewEachRepositoryDocumentation')}</li>
                    <li>{t('switchBetweenFormatsSectionsForEach')}</li>
                    <li>{t('commitAllRepositoriesAtOnce')}</li>
                  </ol>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('example3AutoUpdateWorkflow')}</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('scenario')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('youWantDocumentationToAutoUpdate')}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-3">{t('steps')}</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                    <li>{t('selectRepositoriesInMultiRepoMode')}</li>
                    <li>{t('enableAutoUpdateForEach')}</li>
                    <li>{t('toggleGlobalAutoUpdateSwitch')}</li>
                    <li>{t('documentationWillAutoUpdate')}</li>
                  </ol>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('example4UsingAiAssistant')}</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{t('scenario')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('youWantToImproveDocumentation')}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-3">{t('examplePrompts')}</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{t('addSectionExplainingInstallation')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{t('makeApiDocumentationMoreDetailed')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{t('fixAllGrammarErrors')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{t('restructureDocumentationForBetterFlow')}</span>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          ),
        };

      case 'support':
        return {
          title: t('supportTitle'),
          icon: <HelpCircle className="w-8 h-8" />,
          description: t('supportTitle'),
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('needHelp')}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('wereHereToHelp')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contactOptions')}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-orange-600" />
                      {t('emailSupport')}
                    </h3>
                    <p className="text-gray-600 mb-3">{t('getDirectHelpViaEmail')}</p>
                    <a href="mailto:support@GitScribe.com" className="text-orange-600 hover:text-orange-700 font-medium">
                      support@GitScribe.com
                    </a>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Github className="w-5 h-5 text-orange-600" />
                      {t('githubIssues')}
                    </h3>
                    <p className="text-gray-600 mb-3">{t('reportBugsOrRequestFeatures')}</p>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 font-medium">
                      {t('openAnIssue')}
                    </a>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('commonIssues')}</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('openaiApiKeyError')}</h3>
                    <p className="text-gray-700 text-sm mb-2">
                      {t('addOpenAiKeyInSettings')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('githubRateLimiting')}</h3>
                    <p className="text-gray-700 text-sm mb-2">
                      {t('addGitHubTokenInSettings')}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {t('requiredScopeRepo')} <code className="bg-gray-200 px-2 py-1 rounded">repo</code> ({t('forPrivateRepos')})
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('workflowNotStarting')}</h3>
                    <p className="text-gray-700 text-sm">
                      {t('ensureYouHaveSelected')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{t('documentationNotCommitting')}</h3>
                    <p className="text-gray-700 text-sm">
                      {t('makeSureGitHubTokenHasRepoScope')} <code className="bg-gray-200 px-2 py-1 rounded">repo</code> {t('requiredScopeRepo')} {t('forPrivateRepos')}.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('documentation')}</h2>
                <p className="text-gray-700">
                  {t('checkOutComprehensiveDocumentation')}
                </p>
              </section>
            </div>
          ),
        };

      case 'privacy-policy':
        return {
          title: t('privacyPolicyTitle'),
          icon: <Shield className="w-8 h-8" />,
          description: t('howWeProtectAndHandle'),
          content: (
            <div className="space-y-6">
              <section>
                <p className="text-sm text-gray-500 mb-6">{t('lastUpdated')} {new Date().toLocaleDateString()}</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('introduction')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('gitScribeCommittedToPrivacy')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('informationWeCollect')}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('personalInformation')}</h3>
                    <p className="text-gray-700">
                      {t('weMayCollectPersonalInfo')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('githubTokens')}</h3>
                    <p className="text-gray-700">
                      {t('githubTokensStoredLocally')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('usageData')}</h3>
                    <p className="text-gray-700">
                      {t('weMayCollectUsageData')}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('howWeUseYourInformation')}</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('toProvideAndImprove')}</li>
                  <li>{t('toProcessYourRequests')}</li>
                  <li>{t('toCommunicateWithYou')}</li>
                  <li>{t('toAnalyzeUsagePatterns')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dataSecurity')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('weImplementSecurityMeasures')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('thirdPartyServices')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('weUseFollowingThirdParty')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>OpenAI:</strong> {t('openaiForAiPowered')}</li>
                  <li><strong>GitHub:</strong> {t('githubForRepositoryAccess')}</li>
                  <li><strong>LocalStorage:</strong> {t('localStorageForStoring')}</li>
                </ul>
                <p className="text-gray-600 mt-4 text-sm">
                  {t('allDataStoredLocally')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('yourRights')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('youHaveRightToAccess')} support@GitScribe.com.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contactUsPrivacy')}</h2>
                <p className="text-gray-700">
                  {t('ifYouHaveQuestionsPrivacy')}{' '}
                  <a href="mailto:privacy@GitScribe.com" className="text-orange-600 hover:text-orange-700">
                    privacy@GitScribe.com
                  </a>
                </p>
              </section>
            </div>
          ),
        };

      case 'terms-of-service':
        return {
          title: t('termsOfServiceTitle'),
          icon: <FileText className="w-8 h-8" />,
          description: t('termsAndConditions'),
          content: (
            <div className="space-y-6">
              <section>
                <p className="text-sm text-gray-500 mb-6">{t('lastUpdated')} {new Date().toLocaleDateString()}</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('agreementToTerms')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('byAccessingOrUsing')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('useOfService')}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('eligibility')}</h3>
                    <p className="text-gray-700">
                      {t('youMustBeAtLeast18')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('accountResponsibility')}</h3>
                    <p className="text-gray-700">
                      {t('youAreResponsibleForMaintaining')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('acceptableUse')}</h3>
                    <p className="text-gray-700 mb-2">{t('youAgreeNotTo')}</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>{t('useServiceForIllegalPurpose')}</li>
                      <li>{t('violateLawsOrRegulations')}</li>
                      <li>{t('infringeOnIntellectualProperty')}</li>
                      <li>{t('transmitMaliciousCode')}</li>
                      <li>{t('attemptUnauthorizedAccess')}</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('apiUsageAndCosts')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('gitScribeUsesOpenAIApi')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                  <li>{t('providingYourOwnOpenAiKey')}</li>
                  <li>{t('allCostsAssociated')}</li>
                  <li>{t('managingYourApiKeySecurity')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('intellectualProperty')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('serviceOwnedByGitScribe')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('limitationOfLiability')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('gitScribeProvidedAsIs')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('changesToTerms')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('weReserveRightToModify')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contactTerms')}</h2>
                <p className="text-gray-700">
                  {t('forQuestionsAboutTerms')}{' '}
                  <a href="mailto:legal@GitScribe.com" className="text-orange-600 hover:text-orange-700">
                    legal@GitScribe.com
                  </a>
                </p>
              </section>
            </div>
          ),
        };

      case 'cookie-policy':
        return {
          title: t('cookiePolicyTitle'),
          icon: <Cookie className="w-8 h-8" />,
          description: t('howWeUseCookies'),
          content: (
            <div className="space-y-6">
              <section>
                <p className="text-sm text-gray-500 mb-6">{t('lastUpdated')} {new Date().toLocaleDateString()}</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('whatAreCookies')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('cookiesAreSmallTextFiles')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('howWeUseCookiesTitle')}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('essentialCookies')}</h3>
                    <p className="text-gray-700">
                      {t('theseCookiesAreNecessary')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('preferenceCookies')}</h3>
                    <p className="text-gray-700">
                      {t('weUseLocalStorageToStore')}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('analyticsCookies')}</h3>
                    <p className="text-gray-700">
                      {t('weMayUseAnalyticsCookies')}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('localStorageUsage')}</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {t('gitScribeUsesBrowserLocalStorage')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>{t('githubPersonalAccessTokensEncrypted')}</li>
                  <li>{t('userPreferencesAndSettings')}</li>
                  <li>{t('autoFollowRepositoryConfigurations')}</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  {t('thisDataRemainsOnDevice')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('managingCookies')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('youCanControlCookies')}
                </p>
                <p className="text-gray-700 mt-4">
                  {t('toClearLocalStorageData')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('thirdPartyCookies')}</h2>
                <p className="text-gray-700 leading-relaxed">
                  {t('weMayUseThirdPartyServices')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                  <li>{t('analyticsProviders')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contactCookiePolicy')}</h2>
                <p className="text-gray-700">
                  {t('forQuestionsAboutCookiePolicy')}{' '}
                  <a href="mailto:privacy@GitScribe.com" className="text-orange-600 hover:text-orange-700">
                    privacy@GitScribe.com
                  </a>
                </p>
              </section>
            </div>
          ),
        };

      default:
        return {
          title: t('pageNotFound'),
          icon: <FileText className="w-8 h-8" />,
          description: t('theRequestedPageCouldNotBeFound'),
          content: (
            <div>
              <p className="text-gray-700">{t('thePageYoureLookingForDoesntExist')}</p>
            </div>
          ),
        };
    }
  };

  const pageContent = getPageContent();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  {pageContent.icon}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{pageContent.title}</h1>
                  <p className="text-sm text-gray-500">{pageContent.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="prose prose-slate max-w-none">
          {pageContent.content}
        </div>
      </main>

      <Footer onNavigate={(page) => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
      }} />
    </div>
  );
}

