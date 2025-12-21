/**
 * Translation System
 * Provides translations for UI text based on selected language
 */

import { DocLanguage } from '../types/core';

export type TranslationKey = 
  | 'aiPoweredGeneration'
  | 'sourceSelection'
  | 'clickToCollapse'
  | 'clickToExpand'
  | 'formats'
  | 'sections'
  | 'selectAtLeastOne'
  | 'token'
  | 'add'
  | 'change'
  | 'hide'
  | 'openaiKey'
  | 'saveChanges'
  | 'edit'
  | 'save'
  | 'editDocumentation'
  | 'editDocumentationPlaceholder'
  | 'runWorkflow'
  | 'generate'
  | 'startWritingDocumentation'
  | 'generating'
  | 'documentation'
  | 'noDocumentation'
  | 'export'
  | 'commit'
  | 'settings'
  | 'statistics'
  | 'length'
  | 'modelUsed'
  | 'estTokens'
  | 'estCost'
  | 'words'
  | 'lines'
  | 'characters'
  | 'fileSize'
  | 'readingTime'
  | 'avgWordsPerLine'
  | 'headers'
  | 'codeBlocks'
  | 'links'
  | 'inputTokens'
  | 'outputTokens'
  | 'repositories'
  | 'wordCount'
  | 'lineCount'
  | 'characterCount'
  | 'estimatedTokens'
  | 'cost'
  | 'avg'
  | 'wordsPerLine'
  | 'fileSizeLabel'
  | 'lengthLabel'
  | 'input'
  | 'output'
  | 'wordsUnit'
  | 'charactersUnit'
  | 'tokensUnit'
  | 'bytesUnit'
  | 'charsUnit'
  | 'minUnit'
  | 'source'
  | 'qualityScores'
  | 'refactorProposals'
  | 'badges'
  | 'pdfExport'
  | 'clear'
  | 'formatsLocked'
  | 'runNewWorkflow'
  | 'agentWorkflow'
  | 'useAiAgents'
  | 'singleRepo'
  | 'multiRepo'
  | 'githubUrl'
  | 'selectRepos'
  | 'selectAtLeastOneRepo'
  | 'selectAtLeastOneFormat'
  | 'selectAtLeastOneSection'
  | 'pleaseProvideUrl'
  | 'reviewAndCommit'
  | 'commitToRepos'
  | 'committing'
  | 'clearDocumentation'
  | 'toChangeFormats'
  | 'gitScribe'
  | 'aiPowered'
  | 'aiPoweredDocumentationTitle'
  | 'aiPoweredDocumentationDescription'
  | 'githubIntegration'
  | 'githubIntegrationDescription'
  | 'multiRepoSupport'
  | 'multiRepoSupportDescription'
  | 'autoCommitExport'
  | 'autoCommitExportDescription'
  | 'readyToStart'
  | 'generateDocumentationFromRepos'
  | 'noAccountNeeded'
  | 'startImmediately'
  | 'whyChooseOurTool'
  | 'whyChooseOurToolDescription'
  | 'aiAgentWorkflows'
  | 'aiAgentWorkflowsDescription'
  | 'autoUpdateFollow'
  | 'autoUpdateFollowDescription'
  | 'githubIntegrationFeature'
  | 'githubIntegrationFeatureDescription'
  | 'readyToGetStarted'
  | 'joinDevelopers'
  | 'startGeneratingDocumentation'
  | 'footerDescription'
  | 'madeWith'
  | 'forDevelopers'
  | 'features'
  | 'resources'
  | 'connect'
  | 'contactUs'
  | 'Donate'
  | 'buyMeACoffee'
  | 'supportGitScribe'
  | 'supportGitScribeDevelopment'
  | 'ifYouFindGitScribeUseful'
  | 'whySupport'
  | 'gitScribeIsFreeAndOpenSource'
  | 'yourSupportHelpsUs'
  | 'newFeatures'
  | 'developNewFeaturesAndImprovements'
  | 'maintenanceAndUpdates'
  | 'keepGitScribeRunningSmoothly'
  | 'freeAndOpenSource'
  | 'maintainFreeAccessForEveryone'
  | 'otherWaysToSupport'
  | 'starOnGitHub'
  | 'starringOurRepository'
  | 'visitGitHub'
  | 'shareFeedback'
  | 'letUsKnowWhatYouThink'
  | 'thankYou'
  | 'everyContributionMatters'
  | 'whetherThroughDonations'
  | 'weAppreciateYourSupport'
  | 'allRightsReserved'
  | 'privacyPolicy'
  | 'termsOfService'
  | 'cookiePolicy'
  | 'overview'
  | 'gettingStarted'
  | 'supportedFormats'
  | 'repositoryAccess'
  | 'fileAnalysis'
  | 'codeUnderstanding'
  | 'createGitHubToken'
  | 'addTokenToGitScribe'
  | 'startGenerating'
  | 'requiredScopes'
  | 'forPrivateRepos'
  | 'forPublicRepos'
  | 'enterRepositoryUrl'
  | 'chooseOutputFormats'
  | 'clickRunWorkflow'
  | 'selectMultipleRepositories'
  | 'aiPoweredAnalysis'
  | 'automaticallyAnalyze'
  | 'connectToAnyRepository'
  | 'usingPersonalAccessToken'
  | 'goToGitHubSettings'
  | 'developerSettings'
  | 'personalAccessTokens'
  | 'tokensClassic'
  | 'enterYourToken'
  | 'githubTokenField'
  | 'documentationEditorSettings'
  | 'clickSaveChanges'
  | 'persistIt'
  | 'egOwnerRepo'
  | 'thenClickRunWorkflow'
  | 'startAiAgentWorkflow'
  | 'youCanUseAnyOfTheseFormats'
  | 'toSpecifyRepository'
  | 'seamlesslyConnectWithGitHub'
  | 'generateDocumentationFromRepositories'
  | 'gitScribeIntegratesDirectly'
  | 'accessYourRepositories'
  | 'generateComprehensiveDocumentation'
  | 'whetherPublicOrPrivate'
  | 'ourIntegrationMakesItEasy'
  | 'documentYourCodebase'
  | 'connectToAnyGitHubRepository'
  | 'automaticallyAnalyzeRepository'
  | 'repositoryStructure'
  | 'codeFiles'
  | 'configuration'
  | 'aiPoweredAnalysisOfCodebase'
  | 'generateAccurateDocumentation'
  | 'tokenOptionalButRecommended'
  | 'avoidRateLimits'
  | 'multiRepoSupportTitle'
  | 'multiRepoSupportDescription'
  | 'generateDocumentationForMultiple'
  | 'simultaneously'
  | 'selectMultipleRepositoriesTitle'
  | 'batchProcessing'
  | 'unifiedDocumentation'
  | 'individualDocumentation'
  | 'aiPoweredGenerationTitle'
  | 'aiPoweredGenerationDescription'
  | 'exportCommitTitle'
  | 'exportCommitDescription'
  | 'documentationTitle'
  | 'apiReferenceTitle'
  | 'examplesTitle'
  | 'supportTitle'
  | 'privacyPolicyTitle'
  | 'termsOfServiceTitle'
  | 'cookiePolicyTitle'
  | 'assistantGreeting'
  | 'assistantCapabilities'
  | 'assistantRewriteSections'
  | 'assistantImproveClarity'
  | 'assistantFixGrammar'
  | 'assistantAddRemoveContent'
  | 'assistantRestructure'
  | 'assistantFormatText'
  | 'assistantTellMeWhatToChange'
  | 'assistantErrorNoDocumentation'
  | 'assistantErrorUnknown'
  | 'assistantErrorApiKey'
  | 'assistantErrorParse'
  | 'assistantErrorNetwork'
  | 'assistantPlaceholderLoading'
  | 'assistantPlaceholderReady'
  | 'assistantTitleSend'
  | 'assistantTitleType'
  | 'assistantClearConversation'
  | 'selectRepositories'
  | 'selected'
  | 'close'
  | 'searchRepositories'
  | 'visibility'
  | 'all'
  | 'public'
  | 'private'
  | 'refresh'
  | 'loadingRepositories'
  | 'noRepositoriesMatch'
  | 'noRepositoriesFound'
  | 'lastPushed'
  | 'repositoriesSelected'
  | 'repositorySelected'
  | 'noRepositoriesSelected'
  | 'selectAll'
  | 'selectAllFiltered'
  | 'allFilteredReposSelected'
  | 'clearAll'
  | 'done'
  | 'repositoryDiscovery'
  | 'repositoryAnalysis'
  | 'qualityAnalysis'
  | 'refactorProposal'
  | 'documentationPlanning'
  | 'documentationWriting'
  | 'gitOperations'
  | 'complete'
  | 'running'
  | 'processing'
  | 'completed'
  | 'error'
  | 'agentWorkflow'
  | 'automatedPipeline'
  | 'runWorkflow'
  | 'generate'
  | 'outputFormats'
  | 'sectionTypes'
  | 'pleaseSelectAtLeastOneRepository'
  | 'noWorkflowState'
  | 'noDocumentationToCommit'
  | 'commitFailed'
  | 'generatedFeatures'
  | 'qualityScores'
  | 'refactorProposals'
  | 'badges'
  | 'pdfExport'
  | 'workflowComplete'
  | 'generatedDocumentationFor'
  | 'repository'
  | 'repositories'
  | 'committedTo'
  | 'backTo'
  | 'cancel'
  | 'branch'
  | 'commitMessage'
  | 'scrollToTop'
  | 'scrollToBottom'
  | 'hideAiAssistant'
  | 'showAiAssistant'
  | 'enableAutoUpdate'
  | 'disableAutoUpdate'
  | 'format'
  | 'section'
  | 'addDocumentation'
  | 'ownerRepoOrGithub'
  | 'ownerRepoPlaceholder'
  | 'keyFeatures'
  | 'selectAndProcessMultiple'
  | 'eachRepositoryGetsOwn'
  | 'batchCommit'
  | 'commitToAllSelected'
  | 'howToUse'
  | 'selectMultipleReposStep'
  | 'clickSelectReposButton'
  | 'browseAndSelectFromGitHub'
  | 'searchAndFilterByVisibility'
  | 'chooseOutputFormatsSections'
  | 'selectOneOrMoreFormats'
  | 'markdownMdxOpenapiHtml'
  | 'documentationSectionTypes'
  | 'readmeArchitectureApi'
  | 'runWorkflowStep'
  | 'clickRunWorkflowToStart'
  | 'systemWillProcessEachRepo'
  | 'throughDiscoveryAnalysisPlanning'
  | 'reviewCommitStep'
  | 'reviewDocumentationInTabs'
  | 'switchBetweenFormatsSections'
  | 'whenReadyClickCommitToRepos'
  | 'commitAllAtOnce'
  | 'benefits'
  | 'saveTimeProcessingMultiple'
  | 'maintainConsistentFormat'
  | 'easyManagementWithTabs'
  | 'batchCommitFunctionality'
  | 'aiModels'
  | 'gitScribeSupportsMultipleModels'
  | 'chooseBasedOnNeeds'
  | 'speedCostQuality'
  | 'gpt4oMiniRecommended'
  | 'fastAndCostEffective'
  | 'bestBalanceSpeedQuality'
  | 'gpt4o'
  | 'mostAdvancedModel'
  | 'complexCodebases'
  | 'highestQualityHigherCost'
  | 'gpt4Turbo'
  | 'balancedPerformanceAccuracy'
  | 'goodForLargeRepos'
  | 'gpt35Turbo'
  | 'fastAndEconomical'
  | 'simpleProjects'
  | 'lowestCostOption'
  | 'youCanChangeModel'
  | 'settingsPanel'
  | 'realtimeCostEstimation'
  | 'statisticsSidebar'
  | 'aiAssistant'
  | 'aiAssistantFeature'
  | 'interactivelyEditImprove'
  | 'rewriteSectionsForClarity'
  | 'fixGrammarSpellingErrors'
  | 'addRemoveContentBasedOnNeeds'
  | 'restructureDocumentation'
  | 'formatTextImproveReadability'
  | 'costEstimation'
  | 'gitScribeProvidesRealtime'
  | 'basedOn'
  | 'selectedAiModelPricing'
  | 'estimatedTokenUsage'
  | 'documentationLengthComplexity'
  | 'costsDisplayedInStatistics'
  | 'duringGeneration'
  | 'github'
  | 'exportDocumentation'
  | 'exportDocumentationDescription'
  | 'downloadGeneratedDocumentation'
  | 'exportFormats'
  | 'markdownStandardFormat'
  | 'markdownMermaidDescription'
  | 'mdxDescription'
  | 'openapiDescription'
  | 'htmlDescription'
  | 'eachFormatGenerated'
  | 'commitToRepository'
  | 'automaticallyCommitDocumentation'
  | 'howItWorks'
  | 'runWorkflowGenerate'
  | 'reviewGeneratedDocumentation'
  | 'clickCommitToRepos'
  | 'enterCommitMessage'
  | 'specifyTargetBranch'
  | 'documentationCommitted'
  | 'workflowStopsAfterGeneration'
  | 'controlOverCommits'
  | 'whenWorkingWithMultiple'
  | 'eachRepositoryReceives'
  | 'commitOperationProcesses'
  | 'documentationStoredSeparately'
  | 'autoUpdateFeature'
  | 'enableAutoUpdate'
  | 'enableAutoUpdateDescription'
  | 'automaticUpdates'
  | 'monitorsRepositories'
  | 'detectsPushesMerges'
  | 'automaticallyRegenerates'
  | 'commitsUpdatedDocumentation'
  | 'multiRepoOverview'
  | 'completeGuideToUsing'
  | 'welcomeToGitScribe'
  | 'aiPoweredDocumentationTool'
  | 'quickStart'
  | 'addOpenAiKey'
  | 'optionalAddGitHubToken'
  | 'enterRepositoryUrlOrSelect'
  | 'chooseOutputFormatsSections'
  | 'clickRunWorkflowStart'
  | 'reviewEditCommit'
  | 'coreFeatures'
  | 'directIntegration'
  | 'processMultipleRepos'
  | 'intelligentAgentSystem'
  | 'multipleOutputFormats'
  | 'outputFormatsDescription'
  | 'standardMarkdownFormat'
  | 'markdownWithDiagrams'
  | 'markdownWithJsx'
  | 'yamlFormatForApi'
  | 'fullyStyledHtml'
  | 'documentationSections'
  | 'generateDifferentTypes'
  | 'readmeDescription'
  | 'architectureDescription'
  | 'apiReferenceDescription'
  | 'componentsDescription'
  | 'testingCicdDescription'
  | 'changelogDescription'
  | 'aiAgentWorkflow'
  | 'gitScribeUsesIntelligent'
  | 'repoDiscovery'
  | 'validatesAndDiscovers'
  | 'repoAnalysis'
  | 'analyzesStructure'
  | 'docsPlanner'
  | 'createsStructuredPlan'
  | 'docsWriter'
  | 'generatesDocumentation'
  | 'learnMore'
  | 'exploreOtherPages'
  | 'aiPoweredOverview'
  | 'gitScribeUsesOpenAI'
  | 'completeApiDocumentation'
  | 'agentWorkflowSystem'
  | 'gitScribeUsesLangGraph'
  | 'agentWorkflowSteps'
  | 'agentState'
  | 'workflowMaintainsSharedState'
  | 'discoveredRepositories'
  | 'repositoryAnalyses'
  | 'documentationPlans'
  | 'generatedDocumentationByFormat'
  | 'commitResults'
  | 'githubService'
  | 'langChainService'
  | 'typeDefinitions'
  | 'exampleUseCases'
  | 'example1SingleRepository'
  | 'scenario'
  | 'youWantToGenerate'
  | 'steps'
  | 'enterGitHubRepositoryUrl'
  | 'selectOutputFormatsEg'
  | 'selectSectionTypesEg'
  | 'clickRunWorkflowStart'
  | 'watchWorkflowProgress'
  | 'reviewGeneratedDocumentationSwitch'
  | 'clickCommitToReposWhenReady'
  | 'example2MultipleRepositories'
  | 'youManageMultipleMicroservices'
  | 'clickSelectRepositories'
  | 'selectOutputFormatsEgOpenAPI'
  | 'monitorWorkflowProgress'
  | 'reviewEachRepositoryDocumentation'
  | 'switchBetweenFormatsSectionsForEach'
  | 'commitAllRepositoriesAtOnce'
  | 'example3AutoUpdateWorkflow'
  | 'youWantDocumentationToAutoUpdate'
  | 'selectRepositoriesInMultiRepoMode'
  | 'enableAutoUpdateForEach'
  | 'toggleGlobalAutoUpdateSwitch'
  | 'documentationWillAutoUpdate'
  | 'example4UsingAiAssistant'
  | 'youWantToImproveDocumentation'
  | 'examplePrompts'
  | 'addSectionExplainingInstallation'
  | 'makeApiDocumentationMoreDetailed'
  | 'fixAllGrammarErrors'
  | 'restructureDocumentationForBetterFlow'
  | 'needHelp'
  | 'wereHereToHelp'
  | 'contactOptions'
  | 'emailSupport'
  | 'getDirectHelpViaEmail'
  | 'githubIssues'
  | 'reportBugsOrRequestFeatures'
  | 'openAnIssue'
  | 'commonIssues'
  | 'openaiApiKeyError'
  | 'addOpenAiKeyInSettings'
  | 'githubRateLimiting'
  | 'addGitHubTokenInSettings'
  | 'requiredScopeRepo'
  | 'workflowNotStarting'
  | 'ensureYouHaveSelected'
  | 'documentationNotCommitting'
  | 'makeSureGitHubTokenHasRepoScope'
  | 'checkOutComprehensiveDocumentation'
  | 'howWeProtectAndHandle'
  | 'lastUpdated'
  | 'introduction'
  | 'gitScribeCommittedToPrivacy'
  | 'informationWeCollect'
  | 'personalInformation'
  | 'weMayCollectPersonalInfo'
  | 'githubTokens'
  | 'githubTokensStoredLocally'
  | 'usageData'
  | 'weMayCollectUsageData'
  | 'howWeUseYourInformation'
  | 'toProvideAndImprove'
  | 'toProcessYourRequests'
  | 'toCommunicateWithYou'
  | 'toAnalyzeUsagePatterns'
  | 'dataSecurity'
  | 'weImplementSecurityMeasures'
  | 'thirdPartyServices'
  | 'weUseFollowingThirdParty'
  | 'openaiForAiPowered'
  | 'githubForRepositoryAccess'
  | 'localStorageForStoring'
  | 'allDataStoredLocally'
  | 'yourRights'
  | 'youHaveRightToAccess'
  | 'contactUsPrivacy'
  | 'ifYouHaveQuestionsPrivacy'
  | 'termsAndConditions'
  | 'agreementToTerms'
  | 'byAccessingOrUsing'
  | 'useOfService'
  | 'eligibility'
  | 'youMustBeAtLeast18'
  | 'accountResponsibility'
  | 'youAreResponsibleForMaintaining'
  | 'acceptableUse'
  | 'youAgreeNotTo'
  | 'useServiceForIllegalPurpose'
  | 'violateLawsOrRegulations'
  | 'infringeOnIntellectualProperty'
  | 'transmitMaliciousCode'
  | 'attemptUnauthorizedAccess'
  | 'apiUsageAndCosts'
  | 'gitScribeUsesOpenAIApi'
  | 'youAreResponsibleFor'
  | 'providingYourOwnOpenAiKey'
  | 'allCostsAssociated'
  | 'managingYourApiKeySecurity'
  | 'intellectualProperty'
  | 'serviceOwnedByGitScribe'
  | 'limitationOfLiability'
  | 'gitScribeProvidedAsIs'
  | 'changesToTerms'
  | 'weReserveRightToModify'
  | 'contactTerms'
  | 'forQuestionsAboutTerms'
  | 'howWeUseCookies'
  | 'whatAreCookies'
  | 'cookiesAreSmallTextFiles'
  | 'howWeUseCookiesTitle'
  | 'essentialCookies'
  | 'theseCookiesAreNecessary'
  | 'preferenceCookies'
  | 'weUseLocalStorageToStore'
  | 'analyticsCookies'
  | 'weMayUseAnalyticsCookies'
  | 'localStorageUsage'
  | 'gitScribeUsesBrowserLocalStorage'
  | 'githubPersonalAccessTokensEncrypted'
  | 'userPreferencesAndSettings'
  | 'autoFollowRepositoryConfigurations'
  | 'thisDataRemainsOnDevice'
  | 'managingCookies'
  | 'youCanControlCookies'
  | 'toClearLocalStorageData'
  | 'thirdPartyCookies'
  | 'weMayUseThirdPartyServices'
  | 'analyticsProviders'
  | 'contactCookiePolicy'
  | 'forQuestionsAboutCookiePolicy'
  | 'pageNotFound'
  | 'theRequestedPageCouldNotBeFound'
  | 'thePageYoureLookingForDoesntExist'
  | 'formatMarkdown'
  | 'formatMarkdownMermaid'
  | 'formatMdx'
  | 'formatOpenapi'
  | 'formatHtml'
  | 'sectionReadme'
  | 'sectionArchitecture'
  | 'sectionApiReference'
  | 'sectionComponents'
  | 'sectionTestingCicd'
  | 'sectionChangelog'
  | 'sectionReadmeShort'
  | 'sectionArchitectureShort'
  | 'sectionApiReferenceShort'
  | 'sectionComponentsShort'
  | 'sectionTestingCicdShort'
  | 'sectionChangelogShort'
  | 'aiPoweredDocumentationGenerationForGitHub'
  | 'requiredForAiPoweredDocumentationGeneration'
  | 'functionFetchUserRepos'
  | 'functionCreateOrUpdateFile'
  | 'functionCallLangChain'
  | 'typeSimpleRepo'
  | 'typeDocOutputFormat'
  | 'typeDocSectionType'
  | 'pleaseProvideCommitMessage'
  | 'githubTokenRequiredForCommitting'
  | 'documentationNotFoundForRepository'
  | 'successfullyCommittedToRepository'
  | 'successfullyCommittedToRepositories'
  | 'failedToCommitToRepository'
  | 'failedToCommitToRepositories'
  | 'failedToCommitDocumentation'
  | 'aiAssistant'
  | 'documentationHelper'
  | 'clearConversationHistoryConfirm'
  | 'readyToHelp'
  | 'iCanHelpEditDocumentation'
  | 'editSections'
  | 'improveClarity'
  | 'fixGrammar'
  | 'aiIsThinking'
  | 'send'
  | 'beSpecificForBetterResults'
  | 'pressEnterToSend'
  | 'errorEditingDocumentation'
  | 'unknownErrorOccurred'
  | 'workflowFailed'
  | 'commitResults'
  | 'viewCommit'
  | 'repositoryQualityScores'
  | 'folderStructureRefactorProposals'
  | 'recommendedStructure'
  | 'proposedMoves'
  | 'moreMoves'
  | 'warnings'
  | 'generatedRepositoryBadges'
  | 'badgeMarkdownCopiedToClipboard'
  | 'copyBadgeMarkdown'
  | 'pdfExportFailed';

const translations: Record<DocLanguage, Record<TranslationKey, string>> = {
  en: {
    aiPoweredGeneration: 'AI-powered documentation generation',
    sourceSelection: 'Source Selection',
    clickToCollapse: 'Click to collapse',
    clickToExpand: 'Click to expand',
    formats: 'Formats',
    sections: 'Sections',
    selectAtLeastOne: 'Select at least one format and section',
    token: 'Token',
    add: 'Add',
    change: 'Change',
    hide: 'Hide',
    openaiKey: 'OpenAI Key',
    saveChanges: 'Save Changes',
    edit: 'Edit',
    save: 'Save',
    editDocumentation: 'Edit Documentation',
    editDocumentationPlaceholder: 'Edit your documentation here...',
    runWorkflow: 'Run Workflow',
    generate: 'Generate',
    startWritingDocumentation: 'Start Writing Documentation',
    generating: 'Generating...',
    documentation: 'Documentation',
    noDocumentation: 'No documentation generated yet',
    export: 'Export',
    commit: 'Commit',
    settings: 'Settings',
    statistics: 'Statistics',
    length: 'Length',
    modelUsed: 'Model Used',
    estTokens: 'Est. Tokens',
    estCost: 'Est. Cost',
    words: 'Words',
    lines: 'Lines',
    characters: 'Characters',
    fileSize: 'File Size',
    readingTime: 'Reading Time',
    avgWordsPerLine: 'Avg Words/Line',
    headers: 'Headers',
    codeBlocks: 'Code Blocks',
    links: 'Links',
    inputTokens: 'Input Tokens',
    outputTokens: 'Output Tokens',
    wordCount: 'Word Count',
    lineCount: 'Line Count',
    characterCount: 'Characters',
    estimatedTokens: 'Estimated Tokens',
    cost: 'Cost',
    avg: 'Avg',
    wordsPerLine: 'words/line',
    fileSizeLabel: 'File size',
    lengthLabel: 'Length',
    input: 'Input',
    output: 'Output',
    wordsUnit: 'words',
    charactersUnit: 'characters',
    tokensUnit: 'tokens',
    bytesUnit: 'bytes',
    charsUnit: 'chars',
    minUnit: 'min',
    source: 'Source',
    qualityScores: 'Quality Scores',
    refactorProposals: 'Refactor Proposals',
    badges: 'Badges',
    pdfExport: 'PDF Export',
    clear: 'Clear',
    formatsLocked: 'Formats and sections are locked after generation.',
    runNewWorkflow: 'Run a new workflow to change them.',
    agentWorkflow: 'Agent Workflow',
    useAiAgents: 'Use AI agents for automated pipeline',
    singleRepo: 'Single Repository',
    multiRepo: 'Multi-Repository',
    githubUrl: 'GitHub URL',
    selectRepos: 'Select Repositories',
    selectAtLeastOneRepo: 'Please select at least one repository',
    selectAtLeastOneFormat: 'Please select at least one output format',
    selectAtLeastOneSection: 'Please select at least one documentation section type',
    pleaseProvideUrl: 'Please provide a GitHub URL',
    reviewAndCommit: 'Review the documentation below, then click "Commit to Repos" if you want to commit it.',
    commitToRepos: 'Commit to Repos',
    committing: 'Committing...',
    clearDocumentation: 'Clear documentation to change formats/sections',
    toChangeFormats: 'to change formats/sections',
    gitScribe: 'GitScribe',
    aiPowered: 'AI-POWERED',
    aiPoweredDocumentationTitle: 'AI-Powered Documentation for GitHub Repositories',
    aiPoweredDocumentationDescription: 'Automatically generate comprehensive documentation from single or multiple GitHub repositories. Powered by AI agents that analyze, plan, and write documentation for your codebase.',
    githubIntegration: 'GitHub Integration',
    githubIntegrationDescription: 'Generate documentation from any GitHub repository',
    multiRepoSupport: 'Multi-Repo Support',
    multiRepoSupportDescription: 'Generate documentation for multiple repositories simultaneously',
    autoCommitExport: 'Auto-Commit & Export',
    autoCommitExportDescription: 'Automatically commit documentation to repos or download as Markdown',
    readyToStart: 'Ready to start?',
    generateDocumentationFromRepos: 'Generate documentation from GitHub repositories',
    noAccountNeeded: 'No account needed - Start immediately!',
    startImmediately: 'Start immediately!',
    whyChooseOurTool: 'Why Choose Our Documentation Tool',
    whyChooseOurToolDescription: 'Streamline your documentation workflow with AI-powered generation',
    aiAgentWorkflows: 'AI Agent Workflows',
    aiAgentWorkflowsDescription: 'Automated agent system that discovers, analyzes, plans, and writes documentation for your repositories.',
    autoUpdateFollow: 'Auto-Update & Follow',
    autoUpdateFollowDescription: 'Automatically detect changes and regenerate documentation when repositories are updated.',
    githubIntegrationFeature: 'GitHub Integration',
    githubIntegrationFeatureDescription: 'Seamless commit integration and direct repository access for your documentation workflow.',
    readyToGetStarted: 'Ready to get started?',
    joinDevelopers: 'Join developers and teams automating their documentation workflow',
    startGeneratingDocumentation: 'Start Generating Documentation',
    footerDescription: 'AI-powered documentation generation for GitHub repositories with multi-repo support, agent workflows, and auto-update features.',
    madeWith: 'Made with',
    forDevelopers: 'for developers',
    features: 'Features',
    resources: 'Resources',
    connect: 'Connect',
    contactUs: 'Contact Us',
    Donate: 'Donate',
    buyMeACoffee: 'Buy me a coffee',
    supportGitScribe: 'Support GitScribe',
    supportGitScribeDevelopment: 'Help us continue developing and improving GitScribe',
    ifYouFindGitScribeUseful: 'If you find GitScribe useful and would like to support its development, consider buying us a coffee!',
    whySupport: 'Why Support GitScribe?',
    gitScribeIsFreeAndOpenSource: 'GitScribe is free and open-source, built with passion for the developer community.',
    yourSupportHelpsUs: 'Your support helps us:',
    newFeatures: 'New Features',
    developNewFeaturesAndImprovements: 'Develop new features and improvements based on user feedback',
    maintenanceAndUpdates: 'Maintenance & Updates',
    keepGitScribeRunningSmoothly: 'Keep GitScribe running smoothly with regular updates and bug fixes',
    freeAndOpenSource: 'Free & Open Source',
    maintainFreeAccessForEveryone: 'Maintain free access for everyone while improving the tool',
    otherWaysToSupport: 'Other Ways to Support',
    starOnGitHub: 'Star on GitHub',
    starringOurRepository: 'Starring our repository helps others discover GitScribe',
    visitGitHub: 'Visit GitHub',
    shareFeedback: 'Share Feedback',
    letUsKnowWhatYouThink: 'Let us know what you think and how we can improve',
    thankYou: 'Thank You!',
    everyContributionMatters: 'Every contribution matters, no matter how small.',
    whetherThroughDonations: 'Whether through donations, GitHub stars, or feedback,',
    weAppreciateYourSupport: 'we appreciate your support in making GitScribe better for everyone.',
    allRightsReserved: 'All rights reserved',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    overview: 'Overview',
    gettingStarted: 'Getting Started',
    supportedFormats: 'Supported Formats',
    repositoryAccess: 'Repository Access',
    fileAnalysis: 'File Analysis',
    codeUnderstanding: 'Code Understanding',
    createGitHubToken: 'Create a GitHub Personal Access Token',
    addTokenToGitScribe: 'Add Token to GitScribe',
    startGenerating: 'Start Generating',
    requiredScopes: 'Required scopes',
    forPrivateRepos: 'for private repos and commits',
    forPublicRepos: 'For public repos, a token is optional but recommended to avoid rate limits',
    enterRepositoryUrl: 'Enter your repository URL',
    chooseOutputFormats: 'Choose output formats and section types',
    clickRunWorkflow: 'Click "Run Workflow"',
    selectMultipleRepositories: 'Select Multiple Repositories',
    aiPoweredAnalysis: 'AI-powered analysis',
    automaticallyAnalyze: 'Automatically analyze',
    connectToAnyRepository: 'Connect to any GitHub repository',
    usingPersonalAccessToken: 'using your Personal Access Token',
    goToGitHubSettings: 'Go to GitHub Settings',
    developerSettings: 'Developer settings',
    personalAccessTokens: 'Personal access tokens',
    tokensClassic: 'Tokens (classic)',
    enterYourToken: 'Enter your token',
    githubTokenField: 'in the GitHub Token field',
    documentationEditorSettings: 'in the documentation editor settings',
    clickSaveChanges: 'Click "Save Changes"',
    persistIt: 'to persist it',
    egOwnerRepo: 'e.g., owner/repo',
    thenClickRunWorkflow: 'then click "Run Workflow"',
    startAiAgentWorkflow: 'to start the AI agent workflow',
    youCanUseAnyOfTheseFormats: 'You can use any of these formats to specify a repository',
    toSpecifyRepository: 'to specify a repository',
    seamlesslyConnectWithGitHub: 'Seamlessly connect with GitHub to generate documentation from your repositories',
    generateDocumentationFromRepositories: 'generate documentation from your repositories',
    gitScribeIntegratesDirectly: 'GitScribe integrates directly with GitHub\'s API',
    accessYourRepositories: 'to access your repositories',
    generateComprehensiveDocumentation: 'and generate comprehensive documentation',
    whetherPublicOrPrivate: 'Whether you\'re working with public or private repositories',
    ourIntegrationMakesItEasy: 'our integration makes it easy',
    documentYourCodebase: 'to document your codebase',
    connectToAnyGitHubRepository: 'Connect to any GitHub repository',
    automaticallyAnalyzeRepository: 'Automatically analyze repository',
    repositoryStructure: 'repository structure',
    codeFiles: 'code files',
    configuration: 'and configuration',
    aiPoweredAnalysisOfCodebase: 'AI-powered analysis of your codebase',
    generateAccurateDocumentation: 'to generate accurate documentation',
    tokenOptionalButRecommended: 'For public repos, a token is optional but recommended',
    avoidRateLimits: 'to avoid rate limits',
    multiRepoSupportTitle: 'Multi-Repository Support',
    generateDocumentationForMultiple: 'Generate documentation for multiple',
    simultaneously: 'simultaneously',
    selectMultipleRepositoriesTitle: 'Select Multiple Repositories',
    batchProcessing: 'Batch Processing',
    unifiedDocumentation: 'Unified Documentation',
    individualDocumentation: 'Individual Documentation',
    aiPoweredGenerationTitle: 'AI-Powered Generation',
    aiPoweredGenerationDescription: 'Leverage advanced AI to create comprehensive, accurate documentation',
    exportCommitTitle: 'Export & Commit',
    exportCommitDescription: 'Export documentation or commit directly to your repositories',
    documentationTitle: 'Documentation',
    apiReferenceTitle: 'API Reference',
    examplesTitle: 'Examples',
    supportTitle: 'Support',
    privacyPolicyTitle: 'Privacy Policy',
    termsOfServiceTitle: 'Terms of Service',
    cookiePolicyTitle: 'Cookie Policy',
    assistantGreeting: 'Hi! I\'m your AI assistant. I can help you edit and improve your documentation! 📚',
    assistantCapabilities: 'I can:',
    assistantRewriteSections: 'Rewrite sections',
    assistantImproveClarity: 'Improve clarity and readability',
    assistantFixGrammar: 'Fix grammar and spelling',
    assistantAddRemoveContent: 'Add or remove content',
    assistantRestructure: 'Restructure the documentation',
    assistantFormatText: 'Format text better',
    assistantTellMeWhatToChange: 'Just tell me what you\'d like to change!',
    assistantErrorNoDocumentation: 'Documentation editing mode requires documentation to be loaded. Please generate documentation first.',
    assistantErrorUnknown: 'Sorry, I encountered an error',
    assistantErrorApiKey: 'Configuration error: OpenAI API key is missing. Please check your environment variables.',
    assistantErrorParse: 'I had trouble understanding that request. Could you try rephrasing it? For example:\n• "Add a pricing section"\n• "Change the primary color to blue"\n• "Update the hero title"',
    assistantErrorNetwork: 'Network error: Please check your internet connection and try again.',
    assistantPlaceholderLoading: 'AI is generating your request...',
    assistantPlaceholderReady: 'Ask me anything about your documentation...',
    assistantTitleSend: 'Send message',
    assistantTitleType: 'Type a message to send',
    assistantClearConversation: 'Clear conversation',
    selectRepositories: 'Select Repositories',
    selected: 'selected',
    close: 'Close',
    searchRepositories: 'Search repositories...',
    visibility: 'Visibility:',
    all: 'All',
    public: 'Public',
    private: 'Private',
    refresh: 'Refresh',
    loadingRepositories: 'Loading repositories...',
    noRepositoriesMatch: 'No repositories match your search.',
    noRepositoriesFound: 'No repositories found.',
    lastPushed: 'Last pushed:',
    repositoriesSelected: 'repositories selected',
    repositorySelected: 'repository selected',
    noRepositoriesSelected: 'No repositories selected',
    selectAll: 'Select All',
    selectAllFiltered: 'Select all filtered repositories',
    allFilteredReposSelected: 'All filtered repositories are already selected',
    clearAll: 'Clear All',
    done: 'Done',
    repositoryDiscovery: 'Repository Discovery',
    repositoryAnalysis: 'Repository Analysis',
    qualityAnalysis: 'Quality Analysis',
    refactorProposal: 'Refactor Proposal',
    documentationPlanning: 'Documentation Planning',
    documentationWriting: 'Documentation Writing',
    gitOperations: 'Git Operations',
    complete: 'Complete',
    running: 'Running...',
    processing: 'Processing:',
    completed: '✓ Completed',
    error: 'Error:',
    automatedPipeline: 'Automated documentation generation pipeline',
    outputFormats: 'Output Formats',
    sectionTypes: 'Section Types',
    pleaseSelectAtLeastOneRepository: 'Please select at least one repository',
    noWorkflowState: 'No workflow state available',
    noDocumentationToCommit: 'No documentation to commit',
    commitFailed: 'Commit failed',
    generatedFeatures: 'Generated Features',
    workflowComplete: 'Workflow Complete!',
    generatedDocumentationFor: 'Generated documentation for',
    repository: 'repository',
    repositories: 'repositories',
    committedTo: 'Committed to',
    backTo: 'Back to',
    cancel: 'Cancel',
    branch: 'Branch',
    commitMessage: 'Commit Message',
    scrollToTop: 'Scroll to top',
    scrollToBottom: 'Scroll to bottom',
    hideAiAssistant: 'Hide AI Assistant',
    showAiAssistant: 'Show AI Assistant',
    enableAutoUpdate: 'Enable auto-update on push/merge',
    disableAutoUpdate: 'Disable auto-update',
    format: 'Format:',
    section: 'Section:',
    addDocumentation: 'Add documentation',
    ownerRepoOrGithub: 'owner/repo or github.com/owner/repo',
    ownerRepoPlaceholder: 'owner/repo',
    keyFeatures: 'Key Features',
    selectAndProcessMultiple: 'Select and process multiple repositories in a single operation',
    eachRepositoryGetsOwn: 'Each repository gets its own dedicated documentation file',
    batchCommit: 'Batch Commit',
    commitToAllSelected: 'Commit documentation to all selected repositories with one click',
    howToUse: 'How to Use',
    selectMultipleReposStep: '1. Select Multiple Repositories',
    clickSelectReposButton: 'Click "Select repositories" button to browse and select from your GitHub repositories. You can search and filter by visibility.',
    browseAndSelectFromGitHub: 'browse and select from your GitHub repositories',
    searchAndFilterByVisibility: 'You can search and filter by visibility',
    chooseOutputFormatsSections: '2. Choose Output Formats & Sections',
    selectOneOrMoreFormats: 'Select one or more output formats',
    markdownMdxOpenapiHtml: '(Markdown, MDX, OpenAPI, HTML)',
    documentationSectionTypes: 'and documentation section types',
    readmeArchitectureApi: '(README, Architecture, API, etc.)',
    runWorkflowStep: '3. Run Workflow',
    clickRunWorkflowToStart: 'Click "Run Workflow" to start the AI agent workflow',
    systemWillProcessEachRepo: 'The system will process each repository',
    throughDiscoveryAnalysisPlanning: 'through discovery, analysis, planning, and writing stages',
    reviewCommitStep: '4. Review & Commit',
    reviewDocumentationInTabs: 'Review documentation in separate tabs for each repository',
    switchBetweenFormatsSections: 'Switch between formats and sections',
    whenReadyClickCommitToRepos: 'When ready, click "Commit to Repos"',
    commitAllAtOnce: 'to commit all at once',
    benefits: 'Benefits',
    saveTimeProcessingMultiple: 'Save time by processing multiple repositories simultaneously',
    maintainConsistentFormat: 'Maintain consistent documentation format across projects',
    easyManagementWithTabs: 'Easy management with tabbed interface for each repository',
    batchCommitFunctionality: 'Batch commit functionality for efficient workflow',
    aiModels: 'AI Models',
    gitScribeSupportsMultipleModels: 'GitScribe supports multiple OpenAI models',
    chooseBasedOnNeeds: 'Choose based on your needs',
    speedCostQuality: 'for speed, cost, and quality',
    gpt4oMiniRecommended: 'GPT-4o Mini (Recommended)',
    fastAndCostEffective: 'Fast and cost-effective for most documentation tasks',
    bestBalanceSpeedQuality: 'Best balance of speed and quality',
    gpt4o: 'GPT-4o',
    mostAdvancedModel: 'Most advanced model',
    complexCodebases: 'for complex codebases',
    highestQualityHigherCost: 'Highest quality, higher cost',
    gpt4Turbo: 'GPT-4 Turbo',
    balancedPerformanceAccuracy: 'Balanced performance and accuracy',
    goodForLargeRepos: 'Good for large repositories',
    gpt35Turbo: 'GPT-3.5 Turbo',
    fastAndEconomical: 'Fast and economical',
    simpleProjects: 'for simple projects',
    lowestCostOption: 'Lowest cost option',
    youCanChangeModel: 'You can change the model',
    settingsPanel: 'in the Settings panel',
    realtimeCostEstimation: 'Real-time cost estimation',
    statisticsSidebar: 'is displayed in the Statistics sidebar',
    aiAssistant: 'AI Assistant',
    aiAssistantFeature: 'The AI Assistant feature allows you',
    interactivelyEditImprove: 'to interactively edit and improve your documentation',
    rewriteSectionsForClarity: 'Rewrite sections for better clarity',
    fixGrammarSpellingErrors: 'Fix grammar and spelling errors',
    addRemoveContentBasedOnNeeds: 'Add or remove content based on your needs',
    restructureDocumentation: 'Restructure documentation for better flow',
    formatTextImproveReadability: 'Format text and improve readability',
    costEstimation: 'Cost Estimation',
    gitScribeProvidesRealtime: 'GitScribe provides real-time cost estimation',
    basedOn: 'based on',
    selectedAiModelPricing: 'Selected AI model pricing',
    estimatedTokenUsage: 'Estimated token usage',
    documentationLengthComplexity: 'Documentation length and complexity',
    costsDisplayedInStatistics: 'Costs are displayed',
    duringGeneration: 'during generation',
    github: 'GitHub',
    exportDocumentation: 'Export Documentation',
    exportDocumentationDescription: 'Export your generated documentation in multiple formats including Markdown, HTML, PDF, and more. Download documentation files or commit them directly to your GitHub repositories.',
    downloadGeneratedDocumentation: 'Download your generated documentation in multiple formats for use in documentation sites, wikis, or version control systems.',
    exportFormats: 'Export Formats',
    markdownStandardFormat: 'Markdown - Standard .md format for GitHub, GitLab, and documentation sites',
    markdownMermaidDescription: 'Markdown + Mermaid - Markdown with AI-generated diagrams',
    mdxDescription: 'MDX - Markdown with JSX components for interactive docs',
    openapiDescription: 'OpenAPI - YAML format for API documentation',
    htmlDescription: 'HTML - Fully styled HTML pages ready for deployment',
    eachFormatGenerated: 'Each format is generated with section-specific content tailored to the selected section types.',
    commitToRepository: 'Commit to Repository',
    automaticallyCommitDocumentation: 'Automatically commit generated documentation directly to your GitHub repositories. Perfect for keeping documentation in sync with your codebase.',
    howItWorks: 'How It Works',
    runWorkflowGenerate: 'Run the workflow to generate documentation for your repository(ies)',
    reviewGeneratedDocumentation: 'Review the generated documentation in the viewer',
    clickCommitToRepos: 'Click "Commit to Repos" button (appears after workflow completes)',
    enterCommitMessage: 'Enter a commit message (e.g., "docs: Add comprehensive documentation")',
    specifyTargetBranch: 'Specify the target branch (default: main)',
    documentationCommitted: 'Documentation is committed with the selected format and section types',
    workflowStopsAfterGeneration: 'The workflow stops after generation, allowing you to review before committing.',
    controlOverCommits: 'This ensures you have control over what gets committed to your repositories.',
    whenWorkingWithMultiple: 'When working with multiple repositories, each repository receives its own dedicated documentation files based on your selected formats and sections.',
    eachRepositoryReceives: 'Each repository receives its own dedicated documentation files based on your selected formats and sections.',
    commitOperationProcesses: 'The commit operation processes all selected repositories in batch.',
    documentationStoredSeparately: 'Each repository\'s documentation is stored separately and committed to the correct repository.',
    autoUpdateFeature: 'Auto-Update Feature',
    enableAutoUpdateDescription: 'Enable auto-update to automatically regenerate and commit documentation when your repository receives new commits or merges to the main branch.',
    automaticUpdates: 'Automatic Updates',
    monitorsRepositories: 'Monitors repositories every 5 minutes',
    detectsPushesMerges: 'Detects pushes and merges to main branch',
    automaticallyRegenerates: 'Automatically regenerates documentation',
    commitsUpdatedDocumentation: 'Commits updated documentation with timestamp',
    multiRepoOverview: 'GitScribe\'s multi-repository support allows you to process multiple GitHub repositories at once, saving time and effort when documenting multiple projects.',
    completeGuideToUsing: 'Complete guide to using GitScribe',
    welcomeToGitScribe: 'Welcome to GitScribe! An AI-powered documentation generation tool that automatically creates comprehensive documentation for your GitHub repositories using advanced AI agent workflows.',
    aiPoweredDocumentationTool: 'AI-powered documentation generation tool',
    quickStart: 'Quick Start',
    addOpenAiKey: 'Add your OpenAI API key in the settings',
    optionalAddGitHubToken: '(Optional) Add a GitHub Personal Access Token for private repos',
    enterRepositoryUrlOrSelect: 'Enter a GitHub repository URL or select multiple repositories',
    clickRunWorkflowStart: 'Click "Run Workflow" to start the AI agent workflow',
    reviewEditCommit: 'Review generated documentation, edit with AI Assistant, and commit',
    coreFeatures: 'Core Features',
    directIntegration: 'Direct integration with GitHub API for repository access and commits',
    processMultipleRepos: 'Process multiple repositories simultaneously with batch operations',
    intelligentAgentSystem: 'Intelligent agent system for automated documentation generation',
    multipleOutputFormats: 'Multiple output formats and direct GitHub commits',
    outputFormatsDescription: 'GitScribe supports multiple documentation formats to suit different needs:',
    standardMarkdownFormat: 'Standard markdown format for GitHub, GitLab, and documentation sites',
    markdownWithDiagrams: 'Markdown with AI-generated Mermaid diagrams for architecture and flows',
    markdownWithJsx: 'Markdown with JSX components for interactive documentation',
    yamlFormatForApi: 'YAML format for API documentation with endpoint specifications',
    fullyStyledHtml: 'Fully styled HTML pages ready for deployment',
    documentationSections: 'Documentation Sections',
    generateDifferentTypes: 'Generate different types of documentation sections:',
    readmeDescription: 'README - Project overview, installation, usage, and features',
    architectureDescription: 'Architecture - System design, component structure, and data flow',
    apiReferenceDescription: 'API Reference - Endpoint documentation, request/response schemas',
    componentsDescription: 'Components - Component documentation with props and usage examples',
    testingCicdDescription: 'Testing & CI/CD - Test setup, CI/CD pipeline, and deployment',
    changelogDescription: 'Changelog - Version history and release notes',
    aiAgentWorkflow: 'AI Agent Workflow',
    gitScribeUsesIntelligent: 'GitScribe uses an intelligent agent system that processes repositories through multiple stages:',
    repoDiscovery: 'RepoDiscovery',
    validatesAndDiscovers: '- Validates and discovers repositories',
    repoAnalysis: 'RepoAnalysis',
    analyzesStructure: '- Analyzes structure, tech stack, and complexity',
    docsPlanner: 'DocsPlanner',
    createsStructuredPlan: '- Creates structured documentation plan',
    docsWriter: 'DocsWriter',
    generatesDocumentation: '- Generates documentation in selected formats',
    learnMore: 'Learn More',
    exploreOtherPages: 'Explore the other pages in this documentation section for detailed information about each feature and how to use them effectively.',
    aiPoweredOverview: 'GitScribe uses OpenAI\'s advanced language models to analyze your codebase and generate comprehensive, well-structured documentation. Our AI understands code context, relationships, and best practices to create documentation that\'s both accurate and readable.',
    gitScribeUsesOpenAI: 'GitScribe uses OpenAI\'s advanced language models',
    completeApiDocumentation: 'Complete API documentation for developers',
    agentWorkflowSystem: 'Agent Workflow System',
    gitScribeUsesLangGraph: 'GitScribe uses a LangGraph-style agent system for automated documentation generation:',
    agentWorkflowSteps: '// Agent Workflow Steps',
    agentState: 'Agent State',
    workflowMaintainsSharedState: 'The workflow maintains shared state between agents, including:',
    discoveredRepositories: 'Discovered repositories',
    repositoryAnalyses: 'Repository analyses',
    documentationPlans: 'Documentation plans',
    generatedDocumentationByFormat: 'Generated documentation (by format and section)',
    commitResults: 'Commit results',
    githubService: 'GitHub Service',
    langChainService: 'LangChain Service',
    typeDefinitions: 'Type Definitions',
    exampleUseCases: 'Example use cases and workflows',
    example1SingleRepository: 'Example 1: Single Repository',
    scenario: 'Scenario',
    youWantToGenerate: 'You want to generate comprehensive documentation for a single React project with multiple formats.',
    steps: 'Steps',
    enterGitHubRepositoryUrl: 'Enter GitHub repository URL:',
    selectOutputFormatsEg: 'Select output formats (e.g., Markdown, MDX, HTML)',
    selectSectionTypesEg: 'Select section types (e.g., README, Architecture, API)',
    watchWorkflowProgress: 'Watch the workflow progress through discovery, analysis, planning, and writing',
    reviewGeneratedDocumentationSwitch: 'Review generated documentation, switch between formats and sections',
    clickCommitToReposWhenReady: 'Click "Commit to Repos" when ready to commit',
    example2MultipleRepositories: 'Example 2: Multiple Repositories',
    youManageMultipleMicroservices: 'You manage multiple microservices and want to document them all at once with consistent formatting.',
    clickSelectRepositories: 'Click "Select repositories" and choose multiple repos from your GitHub account',
    selectOutputFormatsEgOpenAPI: 'Select output formats (e.g., Markdown + OpenAPI for API docs)',
    monitorWorkflowProgress: 'Monitor workflow progress for each repository',
    reviewEachRepositoryDocumentation: 'Review each repository\'s documentation in separate tabs',
    switchBetweenFormatsSectionsForEach: 'Switch between formats and sections for each repo',
    commitAllRepositoriesAtOnce: 'Commit all repositories at once with "Commit to Repos"',
    example3AutoUpdateWorkflow: 'Example 3: Auto-Update Workflow',
    youWantDocumentationToAutoUpdate: 'You want documentation to automatically update when code changes.',
    selectRepositoriesInMultiRepoMode: 'Select repositories in multi-repo mode',
    enableAutoUpdateForEach: 'Enable auto-update for each repository (bell icon)',
    toggleGlobalAutoUpdateSwitch: 'Toggle global auto-update switch',
    documentationWillAutoUpdate: 'Documentation will auto-update on every push/merge to main',
    example4UsingAiAssistant: 'Example 4: Using AI Assistant',
    youWantToImproveDocumentation: 'You want to improve the generated documentation with AI help.',
    examplePrompts: 'Example Prompts',
    addSectionExplainingInstallation: '"Add a section explaining the installation process"',
    makeApiDocumentationMoreDetailed: '"Make the API documentation section more detailed"',
    fixAllGrammarErrors: '"Fix all grammar errors"',
    restructureDocumentationForBetterFlow: '"Restructure the documentation for better flow"',
    needHelp: 'Need Help?',
    wereHereToHelp: 'We\'re here to help! If you\'re experiencing issues or have questions about GitScribe, here are the best ways to get support.',
    contactOptions: 'Contact Options',
    emailSupport: 'Email Support',
    getDirectHelpViaEmail: 'Get direct help via email',
    githubIssues: 'GitHub Issues',
    reportBugsOrRequestFeatures: 'Report bugs or request features',
    openAnIssue: 'Open an issue',
    commonIssues: 'Common Issues',
    openaiApiKeyError: 'OpenAI API Key Error',
    addOpenAiKeyInSettings: 'Add your OpenAI API key in the Settings panel. Click the Settings icon, enter your key, and click "Save Changes".',
    githubRateLimiting: 'GitHub Rate Limiting',
    addGitHubTokenInSettings: 'Add a GitHub Personal Access Token in the Settings panel to increase rate limits and access private repositories.',
    requiredScopeRepo: 'Required scope:',
    workflowNotStarting: 'Workflow Not Starting',
    ensureYouHaveSelected: 'Ensure you have selected at least one output format and one section type. The "Run Workflow" button requires both to be enabled.',
    documentationNotCommitting: 'Documentation Not Committing',
    makeSureGitHubTokenHasRepoScope: 'Make sure your GitHub token has the',
    checkOutComprehensiveDocumentation: 'Check out our comprehensive documentation for detailed guides and API references.',
    howWeProtectAndHandle: 'How we protect and handle your data',
    lastUpdated: 'Last updated:',
    introduction: 'Introduction',
    gitScribeCommittedToPrivacy: 'GitScribe ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.',
    informationWeCollect: 'Information We Collect',
    personalInformation: 'Personal Information',
    weMayCollectPersonalInfo: 'We may collect personal information such as email addresses when you create an account or contact us for support.',
    githubTokens: 'GitHub Tokens',
    githubTokensStoredLocally: 'GitHub Personal Access Tokens are stored locally in your browser\'s localStorage. We do not transmit or store these tokens on our servers.',
    usageData: 'Usage Data',
    weMayCollectUsageData: 'We may collect information about how you use our service, including repository URLs and documentation generation preferences.',
    howWeUseYourInformation: 'How We Use Your Information',
    toProvideAndImprove: 'To provide and improve our documentation generation service',
    toProcessYourRequests: 'To process your requests and generate documentation',
    toCommunicateWithYou: 'To communicate with you about your account or support requests',
    toAnalyzeUsagePatterns: 'To analyze usage patterns and improve our service',
    dataSecurity: 'Data Security',
    weImplementSecurityMeasures: 'We implement appropriate security measures to protect your information. GitHub tokens are stored locally in your browser and never transmitted to our servers. All API communications are encrypted using HTTPS.',
    thirdPartyServices: 'Third-Party Services',
    weUseFollowingThirdParty: 'We use the following third-party services:',
    openaiForAiPowered: 'OpenAI: For AI-powered documentation generation using GPT models',
    githubForRepositoryAccess: 'GitHub: For repository access, file operations, and commits via GitHub API',
    localStorageForStoring: 'LocalStorage: For storing user preferences, tokens, and project history locally in your browser',
    allDataStoredLocally: 'All data is stored locally in your browser. GitHub tokens and API keys are never transmitted to our servers.',
    yourRights: 'Your Rights',
    youHaveRightToAccess: 'You have the right to access, update, or delete your personal information. You can manage your account settings or contact us at',
    contactUsPrivacy: 'Contact Us',
    ifYouHaveQuestionsPrivacy: 'If you have questions about this Privacy Policy, please contact us at',
    termsAndConditions: 'Terms and conditions for using GitScribe',
    agreementToTerms: 'Agreement to Terms',
    byAccessingOrUsing: 'By accessing or using GitScribe ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.',
    useOfService: 'Use of Service',
    eligibility: 'Eligibility',
    youMustBeAtLeast18: 'You must be at least 18 years old or have parental consent to use this Service.',
    accountResponsibility: 'Account Responsibility',
    youAreResponsibleForMaintaining: 'You are responsible for maintaining the security of your account and any API keys or tokens you use with the Service.',
    acceptableUse: 'Acceptable Use',
    youAgreeNotTo: 'You agree not to:',
    useServiceForIllegalPurpose: 'Use the Service for any illegal purpose',
    violateLawsOrRegulations: 'Violate any laws or regulations',
    infringeOnIntellectualProperty: 'Infringe on intellectual property rights',
    transmitMaliciousCode: 'Transmit malicious code or viruses',
    attemptUnauthorizedAccess: 'Attempt to gain unauthorized access to the Service',
    apiUsageAndCosts: 'API Usage and Costs',
    gitScribeUsesOpenAIApi: 'GitScribe uses OpenAI\'s API for AI-powered features. You are responsible for:',
    youAreResponsibleFor: 'You are responsible for:',
    providingYourOwnOpenAiKey: 'Providing your own OpenAI API key',
    allCostsAssociated: 'All costs associated with API usage',
    managingYourApiKeySecurity: 'Managing your API key security',
    intellectualProperty: 'Intellectual Property',
    serviceOwnedByGitScribe: 'The Service and its original content, features, and functionality are owned by GitScribe and are protected by international copyright, trademark, and other intellectual property laws.',
    limitationOfLiability: 'Limitation of Liability',
    gitScribeProvidedAsIs: 'GitScribe is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service, including but not limited to data loss, documentation errors, or API costs.',
    changesToTerms: 'Changes to Terms',
    weReserveRightToModify: 'We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.',
    contactTerms: 'Contact',
    forQuestionsAboutTerms: 'For questions about these Terms, contact us at',
    howWeUseCookies: 'How we use cookies and similar technologies',
    whatAreCookies: 'What Are Cookies',
    cookiesAreSmallTextFiles: 'Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.',
    howWeUseCookiesTitle: 'How We Use Cookies',
    essentialCookies: 'Essential Cookies',
    theseCookiesAreNecessary: 'These cookies are necessary for the Service to function. They include authentication tokens and session information.',
    preferenceCookies: 'Preference Cookies',
    weUseLocalStorageToStore: 'We use localStorage to store your preferences, such as GitHub tokens and UI settings. This data is stored locally in your browser and never transmitted to our servers.',
    analyticsCookies: 'Analytics Cookies',
    weMayUseAnalyticsCookies: 'We may use analytics cookies to understand how users interact with our Service and improve our features.',
    localStorageUsage: 'LocalStorage Usage',
    gitScribeUsesBrowserLocalStorage: 'GitScribe uses browser localStorage (not cookies) to store:',
    githubPersonalAccessTokensEncrypted: 'GitHub Personal Access Tokens (encrypted locally)',
    userPreferencesAndSettings: 'User preferences and settings',
    autoFollowRepositoryConfigurations: 'Auto-follow repository configurations',
    thisDataRemainsOnDevice: 'This data remains on your device and is never shared with third parties.',
    managingCookies: 'Managing Cookies',
    youCanControlCookies: 'You can control cookies through your browser settings. However, disabling essential cookies may affect the functionality of the Service.',
    toClearLocalStorageData: 'To clear localStorage data, you can use your browser\'s developer tools or clear browsing data.',
    thirdPartyCookies: 'Third-Party Cookies',
    weMayUseThirdPartyServices: 'We may use third-party services that set their own cookies. These services include:',
    analyticsProviders: 'Analytics providers (if applicable)',
    contactCookiePolicy: 'Contact',
    forQuestionsAboutCookiePolicy: 'For questions about our Cookie Policy, contact us at',
    pageNotFound: 'Page Not Found',
    theRequestedPageCouldNotBeFound: 'The requested page could not be found',
    thePageYoureLookingForDoesntExist: 'The page you\'re looking for doesn\'t exist.',
    formatMarkdown: 'Markdown',
    formatMarkdownMermaid: 'Markdown + Mermaid',
    formatMdx: 'MDX',
    formatOpenapi: 'OpenAPI',
    formatHtml: 'HTML',
    sectionReadme: 'README',
    sectionArchitecture: 'Architecture',
    sectionApiReference: 'API Reference',
    sectionComponents: 'Components',
    sectionTestingCicd: 'Testing & CI/CD',
    sectionChangelog: 'Changelog',
    sectionReadmeShort: 'README',
    sectionArchitectureShort: 'ARCH',
    sectionApiReferenceShort: 'API',
    sectionComponentsShort: 'COMP',
    sectionTestingCicdShort: 'TEST',
    sectionChangelogShort: 'CHG',
    aiPoweredDocumentationGenerationForGitHub: 'AI-powered documentation generation for GitHub repositories',
    requiredForAiPoweredDocumentationGeneration: 'Required for AI-powered documentation generation.',
    functionFetchUserRepos: 'fetchUserRepos',
    functionCreateOrUpdateFile: 'createOrUpdateFile',
    functionCallLangChain: 'callLangChain',
    typeSimpleRepo: 'SimpleRepo',
    typeDocOutputFormat: 'DocOutputFormat',
    typeDocSectionType: 'DocSectionType',
    pleaseProvideCommitMessage: 'Please provide a commit message',
    githubTokenRequiredForCommitting: 'GitHub token is required for committing files',
    documentationNotFoundForRepository: 'Documentation not found for this repository. Please generate documentation first.',
    successfullyCommittedToRepository: 'Successfully committed documentation to 1 repository!',
    successfullyCommittedToRepositories: 'Successfully committed documentation to {count} repositories!',
    failedToCommitToRepository: 'Failed to commit to 1 repository',
    failedToCommitToRepositories: 'Failed to commit to {count} repositories',
    failedToCommitDocumentation: 'Failed to commit documentation',
    documentationHelper: 'Documentation helper',
    clearConversationHistoryConfirm: 'Clear conversation history?',
    readyToHelp: 'Ready to help!',
    iCanHelpEditDocumentation: 'I can help you edit and improve your documentation',
    editSections: 'Edit sections',
    improveClarity: 'Improve clarity',
    fixGrammar: 'Fix grammar',
    aiIsThinking: 'AI is thinking...',
    send: 'Send',
    beSpecificForBetterResults: 'Be specific for better results',
    pressEnterToSend: 'Press Enter to send',
    errorEditingDocumentation: 'Error editing documentation',
    unknownErrorOccurred: 'Unknown error occurred',
    workflowFailed: 'Workflow failed',
    viewCommit: 'View commit',
    repositoryQualityScores: 'Repository Quality Scores',
    folderStructureRefactorProposals: 'Folder Structure Refactor Proposals',
    recommendedStructure: 'Recommended Structure:',
    proposedMoves: 'Proposed Moves',
    moreMoves: 'more moves...',
    warnings: 'Warnings',
    generatedRepositoryBadges: 'Generated Repository Badges',
    badgeMarkdownCopiedToClipboard: 'Badge markdown copied to clipboard!',
    copyBadgeMarkdown: 'Copy Badge Markdown',
    pdfExportFailed: 'PDF export failed',
  },
  fr: {
    aiPoweredGeneration: 'Génération de documentation alimentée par IA',
    sourceSelection: 'Sélection de Source',
    clickToCollapse: 'Cliquez pour réduire',
    clickToExpand: 'Cliquez pour développer',
    formats: 'Formats',
    sections: 'Sections',
    selectAtLeastOne: 'Sélectionnez au moins un format et une section',
    token: 'Jeton',
    add: 'Ajouter',
    change: 'Changer',
    hide: 'Masquer',
    openaiKey: 'Clé OpenAI',
    saveChanges: 'Enregistrer les Modifications',
    edit: 'Modifier',
    save: 'Enregistrer',
    editDocumentation: 'Modifier la Documentation',
    editDocumentationPlaceholder: 'Modifiez votre documentation ici...',
    runWorkflow: 'Exécuter le Workflow',
    generate: 'Générer',
    startWritingDocumentation: 'Commencer à Écrire la Documentation',
    generating: 'Génération...',
    documentation: 'Documentation',
    noDocumentation: 'Aucune documentation générée pour le moment',
    export: 'Exporter',
    commit: 'Valider',
    settings: 'Paramètres',
    statistics: 'Statistiques',
    length: 'Longueur',
    modelUsed: 'Modèle Utilisé',
    estTokens: 'Tokens Est.',
    estCost: 'Coût Est.',
    words: 'Mots',
    lines: 'Lignes',
    characters: 'Caractères',
    fileSize: 'Taille du Fichier',
    readingTime: 'Temps de Lecture',
    avgWordsPerLine: 'Mots Moy./Ligne',
    headers: 'En-têtes',
    codeBlocks: 'Blocs de Code',
    links: 'Liens',
    inputTokens: 'Tokens d\'Entrée',
    outputTokens: 'Tokens de Sortie',
    wordCount: 'Nombre de Mots',
    lineCount: 'Nombre de Lignes',
    characterCount: 'Caractères',
    estimatedTokens: 'Tokens Estimés',
    cost: 'Coût',
    avg: 'Moy.',
    wordsPerLine: 'mots/ligne',
    fileSizeLabel: 'Taille du fichier',
    lengthLabel: 'Longueur',
    input: 'Entrée',
    output: 'Sortie',
    wordsUnit: 'mots',
    charactersUnit: 'caractères',
    tokensUnit: 'tokens',
    bytesUnit: 'octets',
    charsUnit: 'caractères',
    minUnit: 'min',
    source: 'Source',
    qualityScores: 'Scores de Qualité',
    refactorProposals: 'Propositions de Refactorisation',
    badges: 'Badges',
    pdfExport: 'Export PDF',
    clear: 'Effacer',
    formatsLocked: 'Les formats et sections sont verrouillés après génération.',
    runNewWorkflow: 'Exécutez un nouveau workflow pour les modifier.',
    agentWorkflow: 'Workflow d\'Agent',
    useAiAgents: 'Utiliser des agents IA pour le pipeline automatisé',
    singleRepo: 'Dépôt Unique',
    multiRepo: 'Multi-Dépôts',
    githubUrl: 'URL GitHub',
    selectRepos: 'Sélectionner les Dépôts',
    selectAtLeastOneRepo: 'Veuillez sélectionner au moins un dépôt',
    selectAtLeastOneFormat: 'Veuillez sélectionner au moins un format de sortie',
    selectAtLeastOneSection: 'Veuillez sélectionner au moins un type de section de documentation',
    pleaseProvideUrl: 'Veuillez fournir une URL GitHub',
    reviewAndCommit: 'Examinez la documentation ci-dessous, puis cliquez sur "Valider dans les Dépôts" si vous souhaitez la valider.',
    commitToRepos: 'Valider dans les Dépôts',
    committing: 'Validation...',
    clearDocumentation: 'Effacer la documentation pour modifier les formats/sections',
    toChangeFormats: 'pour modifier les formats/sections',
    gitScribe: 'GitScribe',
    aiPowered: 'ALIMENTÉ PAR IA',
    aiPoweredDocumentationTitle: 'Documentation Alimentée par IA pour les Dépôts GitHub',
    aiPoweredDocumentationDescription: 'Générez automatiquement une documentation complète à partir d\'un ou plusieurs dépôts GitHub. Alimenté par des agents IA qui analysent, planifient et rédigent la documentation pour votre base de code.',
    githubIntegration: 'Intégration GitHub',
    githubIntegrationDescription: 'Générer de la documentation à partir de n\'importe quel dépôt GitHub',
    multiRepoSupport: 'Support Multi-Dépôts',
    multiRepoSupportDescription: 'Générer de la documentation pour plusieurs dépôts simultanément',
    autoCommitExport: 'Validation & Export Automatiques',
    autoCommitExportDescription: 'Valider automatiquement la documentation dans les dépôts ou la télécharger en Markdown',
    readyToStart: 'Prêt à commencer?',
    generateDocumentationFromRepos: 'Générer de la documentation à partir de dépôts GitHub',
    noAccountNeeded: 'Aucun compte requis - Commencez immédiatement!',
    startImmediately: 'Commencez immédiatement!',
    whyChooseOurTool: 'Pourquoi Choisir Notre Outil de Documentation',
    whyChooseOurToolDescription: 'Rationalisez votre flux de travail de documentation avec une génération alimentée par IA',
    aiAgentWorkflows: 'Workflows d\'Agents IA',
    aiAgentWorkflowsDescription: 'Système d\'agents automatisé qui découvre, analyse, planifie et rédige la documentation pour vos dépôts.',
    autoUpdateFollow: 'Mise à Jour & Suivi Automatiques',
    autoUpdateFollowDescription: 'Détecter automatiquement les changements et régénérer la documentation lorsque les dépôts sont mis à jour.',
    githubIntegrationFeature: 'Intégration GitHub',
    githubIntegrationFeatureDescription: 'Intégration de validation transparente et accès direct aux dépôts pour votre flux de travail de documentation.',
    readyToGetStarted: 'Prêt à commencer?',
    joinDevelopers: 'Rejoignez les développeurs et les équipes qui automatisent leur flux de travail de documentation',
    startGeneratingDocumentation: 'Commencer à Générer la Documentation',
    footerDescription: 'Génération de documentation alimentée par IA pour les dépôts GitHub avec support multi-dépôts, workflows d\'agents et fonctionnalités de mise à jour automatique.',
    madeWith: 'Fait avec',
    forDevelopers: 'pour les développeurs',
    features: 'Fonctionnalités',
    resources: 'Ressources',
    connect: 'Se Connecter',
    contactUs: 'Nous Contacter',
    Donate: 'Faire un don',
    buyMeACoffee: 'Offrez-moi un café',
    supportGitScribe: 'Soutenez GitScribe',
    supportGitScribeDevelopment: 'Aidez-nous à continuer à développer et améliorer GitScribe',
    ifYouFindGitScribeUseful: 'Si vous trouvez GitScribe utile et souhaitez soutenir son développement, pensez à nous offrir un café!',
    whySupport: 'Pourquoi soutenir GitScribe?',
    gitScribeIsFreeAndOpenSource: 'GitScribe est gratuit et open-source, construit avec passion pour la communauté des développeurs.',
    yourSupportHelpsUs: 'Votre soutien nous aide à:',
    newFeatures: 'Nouvelles Fonctionnalités',
    developNewFeaturesAndImprovements: 'Développer de nouvelles fonctionnalités et améliorations basées sur les commentaires des utilisateurs',
    maintenanceAndUpdates: 'Maintenance & Mises à Jour',
    keepGitScribeRunningSmoothly: 'Maintenir GitScribe en bon fonctionnement avec des mises à jour régulières et des corrections de bugs',
    freeAndOpenSource: 'Gratuit & Open Source',
    maintainFreeAccessForEveryone: 'Maintenir l\'accès gratuit pour tous tout en améliorant l\'outil',
    otherWaysToSupport: 'Autres Façons de Soutenir',
    starOnGitHub: 'Étoile sur GitHub',
    starringOurRepository: 'Étoiler notre dépôt aide les autres à découvrir GitScribe',
    visitGitHub: 'Visiter GitHub',
    shareFeedback: 'Partager des Commentaires',
    letUsKnowWhatYouThink: 'Faites-nous savoir ce que vous pensez et comment nous pouvons nous améliorer',
    thankYou: 'Merci!',
    everyContributionMatters: 'Chaque contribution compte, aussi petite soit-elle.',
    whetherThroughDonations: 'Que ce soit par des dons, des étoiles GitHub ou des commentaires,',
    weAppreciateYourSupport: 'nous apprécions votre soutien pour rendre GitScribe meilleur pour tous.',
    allRightsReserved: 'Tous droits réservés',
    privacyPolicy: 'Politique de Confidentialité',
    termsOfService: 'Conditions d\'Utilisation',
    cookiePolicy: 'Politique des Cookies',
    overview: 'Aperçu',
    gettingStarted: 'Pour Commencer',
    supportedFormats: 'Formats Pris en Charge',
    repositoryAccess: 'Accès au Dépôt',
    fileAnalysis: 'Analyse de Fichiers',
    codeUnderstanding: 'Compréhension du Code',
    createGitHubToken: 'Créer un Jeton d\'Accès Personnel GitHub',
    addTokenToGitScribe: 'Ajouter le Jeton à GitScribe',
    startGenerating: 'Commencer la Génération',
    requiredScopes: 'Portées requises',
    forPrivateRepos: 'pour les dépôts privés et les commits',
    forPublicRepos: 'Pour les dépôts publics, un jeton est facultatif mais recommandé pour éviter les limites de débit',
    enterRepositoryUrl: 'Entrez l\'URL de votre dépôt',
    chooseOutputFormats: 'Choisissez les formats de sortie et les types de sections',
    clickRunWorkflow: 'Cliquez sur "Exécuter le Workflow"',
    selectMultipleRepositories: 'Sélectionner Plusieurs Dépôts',
    aiPoweredAnalysis: 'Analyse alimentée par IA',
    automaticallyAnalyze: 'Analyser automatiquement',
    connectToAnyRepository: 'Se connecter à n\'importe quel dépôt GitHub',
    usingPersonalAccessToken: 'en utilisant votre Jeton d\'Accès Personnel',
    goToGitHubSettings: 'Allez dans les Paramètres GitHub',
    developerSettings: 'Paramètres du développeur',
    personalAccessTokens: 'Jetons d\'accès personnels',
    tokensClassic: 'Jetons (classique)',
    enterYourToken: 'Entrez votre jeton',
    githubTokenField: 'dans le champ Jeton GitHub',
    documentationEditorSettings: 'dans les paramètres de l\'éditeur de documentation',
    clickSaveChanges: 'Cliquez sur "Enregistrer les Modifications"',
    persistIt: 'pour le conserver',
    egOwnerRepo: 'par ex., propriétaire/dépôt',
    thenClickRunWorkflow: 'puis cliquez sur "Exécuter le Workflow"',
    startAiAgentWorkflow: 'pour démarrer le workflow de l\'agent IA',
    youCanUseAnyOfTheseFormats: 'Vous pouvez utiliser l\'un de ces formats pour spécifier un dépôt',
    toSpecifyRepository: 'pour spécifier un dépôt',
    seamlesslyConnectWithGitHub: 'Connectez-vous facilement à GitHub pour générer de la documentation à partir de vos dépôts',
    generateDocumentationFromRepositories: 'générer de la documentation à partir de vos dépôts',
    gitScribeIntegratesDirectly: 'GitScribe s\'intègre directement avec l\'API GitHub',
    accessYourRepositories: 'pour accéder à vos dépôts',
    generateComprehensiveDocumentation: 'et générer une documentation complète',
    whetherPublicOrPrivate: 'Que vous travailliez avec des dépôts publics ou privés',
    ourIntegrationMakesItEasy: 'notre intégration facilite',
    documentYourCodebase: 'la documentation de votre base de code',
    connectToAnyGitHubRepository: 'Se connecter à n\'importe quel dépôt GitHub',
    automaticallyAnalyzeRepository: 'Analyser automatiquement le dépôt',
    repositoryStructure: 'structure du dépôt',
    codeFiles: 'fichiers de code',
    configuration: 'et configuration',
    aiPoweredAnalysisOfCodebase: 'Analyse alimentée par IA de votre base de code',
    generateAccurateDocumentation: 'pour générer une documentation précise',
    tokenOptionalButRecommended: 'Pour les dépôts publics, un jeton est facultatif mais recommandé',
    avoidRateLimits: 'pour éviter les limites de débit',
    multiRepoSupportTitle: 'Support Multi-Dépôts',
    generateDocumentationForMultiple: 'Générer de la documentation pour plusieurs',
    simultaneously: 'simultanément',
    selectMultipleRepositoriesTitle: 'Sélectionner Plusieurs Dépôts',
    batchProcessing: 'Traitement par Lots',
    unifiedDocumentation: 'Documentation Unifiée',
    individualDocumentation: 'Documentation Individuelle',
    aiPoweredGenerationTitle: 'Génération Alimentée par IA',
    aiPoweredGenerationDescription: 'Exploitez l\'IA avancée pour créer une documentation complète et précise',
    exportCommitTitle: 'Export & Commit',
    exportCommitDescription: 'Exporter la documentation ou la committer directement dans vos dépôts',
    documentationTitle: 'Documentation',
    apiReferenceTitle: 'Référence API',
    examplesTitle: 'Exemples',
    supportTitle: 'Support',
    privacyPolicyTitle: 'Politique de Confidentialité',
    termsOfServiceTitle: 'Conditions d\'Utilisation',
    cookiePolicyTitle: 'Politique des Cookies',
    assistantGreeting: 'Salut! Je suis votre assistant IA. Je peux vous aider à modifier et améliorer votre documentation! 📚',
    assistantCapabilities: 'Je peux:',
    assistantRewriteSections: 'Réécrire des sections',
    assistantImproveClarity: 'Améliorer la clarté et la lisibilité',
    assistantFixGrammar: 'Corriger la grammaire et l\'orthographe',
    assistantAddRemoveContent: 'Ajouter ou supprimer du contenu',
    assistantRestructure: 'Restructurer la documentation',
    assistantFormatText: 'Mieux formater le texte',
    assistantTellMeWhatToChange: 'Dites-moi simplement ce que vous aimeriez changer!',
    assistantErrorNoDocumentation: 'Le mode d\'édition de documentation nécessite que la documentation soit chargée. Veuillez d\'abord générer la documentation.',
    assistantErrorUnknown: 'Désolé, j\'ai rencontré une erreur',
    assistantErrorApiKey: 'Erreur de configuration: La clé API OpenAI est manquante. Veuillez vérifier vos variables d\'environnement.',
    assistantErrorParse: 'J\'ai eu du mal à comprendre cette demande. Pourriez-vous essayer de la reformuler? Par exemple:\n• "Ajouter une section de tarification"\n• "Changer la couleur principale en bleu"\n• "Mettre à jour le titre principal"',
    assistantErrorNetwork: 'Erreur réseau: Veuillez vérifier votre connexion Internet et réessayer.',
    assistantPlaceholderLoading: 'L\'IA génère votre demande...',
    assistantPlaceholderReady: 'Demandez-moi n\'importe quoi sur votre documentation...',
    assistantTitleSend: 'Envoyer le message',
    assistantTitleType: 'Tapez un message à envoyer',
    assistantClearConversation: 'Effacer la conversation',
    selectRepositories: 'Sélectionner les Dépôts',
    selected: 'sélectionné',
    close: 'Fermer',
    searchRepositories: 'Rechercher des dépôts...',
    visibility: 'Visibilité:',
    all: 'Tous',
    public: 'Public',
    private: 'Privé',
    refresh: 'Actualiser',
    loadingRepositories: 'Chargement des dépôts...',
    noRepositoriesMatch: 'Aucun dépôt ne correspond à votre recherche.',
    noRepositoriesFound: 'Aucun dépôt trouvé.',
    lastPushed: 'Dernière mise à jour:',
    repositoriesSelected: 'dépôts sélectionnés',
    repositorySelected: 'dépôt sélectionné',
    noRepositoriesSelected: 'Aucun dépôt sélectionné',
    selectAll: 'Tout Sélectionner',
    selectAllFiltered: 'Sélectionner tous les dépôts filtrés',
    allFilteredReposSelected: 'Tous les dépôts filtrés sont déjà sélectionnés',
    clearAll: 'Tout Effacer',
    done: 'Terminé',
    repositoryDiscovery: 'Découverte de Dépôt',
    repositoryAnalysis: 'Analyse de Dépôt',
    qualityAnalysis: 'Analyse de Qualité',
    refactorProposal: 'Proposition de Refactorisation',
    documentationPlanning: 'Planification de Documentation',
    documentationWriting: 'Rédaction de Documentation',
    gitOperations: 'Opérations Git',
    complete: 'Terminé',
    running: 'En cours...',
    processing: 'Traitement:',
    completed: '✓ Terminé',
    error: 'Erreur:',
    automatedPipeline: 'Pipeline automatisé de génération de documentation',
    outputFormats: 'Formats de Sortie',
    sectionTypes: 'Types de Sections',
    pleaseSelectAtLeastOneRepository: 'Veuillez sélectionner au moins un dépôt',
    noWorkflowState: 'Aucun état de workflow disponible',
    noDocumentationToCommit: 'Aucune documentation à committer',
    commitFailed: 'Échec du commit',
    generatedFeatures: 'Fonctionnalités Générées',
    workflowComplete: 'Workflow Terminé!',
    generatedDocumentationFor: 'Documentation générée pour',
    repository: 'dépôt',
    repositories: 'Dépôts',
    committedTo: 'Committé dans',
    backTo: 'Retour à',
    cancel: 'Annuler',
    branch: 'Branche',
    commitMessage: 'Message de Commit',
    scrollToTop: 'Faire défiler vers le haut',
    scrollToBottom: 'Faire défiler vers le bas',
    hideAiAssistant: 'Masquer l\'Assistant IA',
    showAiAssistant: 'Afficher l\'Assistant IA',
    enableAutoUpdate: 'Activer la mise à jour automatique lors du push/merge',
    disableAutoUpdate: 'Désactiver la mise à jour automatique',
    format: 'Format:',
    section: 'Section:',
    addDocumentation: 'Ajouter de la documentation',
    ownerRepoOrGithub: 'propriétaire/dépôt ou github.com/propriétaire/dépôt',
    ownerRepoPlaceholder: 'propriétaire/dépôt',
    keyFeatures: 'Fonctionnalités Clés',
    selectAndProcessMultiple: 'Sélectionner et traiter plusieurs dépôts en une seule opération',
    eachRepositoryGetsOwn: 'Chaque dépôt obtient son propre fichier de documentation dédié',
    batchCommit: 'Commit par Lots',
    commitToAllSelected: 'Committer la documentation dans tous les dépôts sélectionnés en un clic',
    howToUse: 'Comment Utiliser',
    selectMultipleReposStep: '1. Sélectionner Plusieurs Dépôts',
    clickSelectReposButton: 'Cliquez sur le bouton "Sélectionner les dépôts" pour parcourir et sélectionner parmi vos dépôts GitHub. Vous pouvez rechercher et filtrer par visibilité.',
    browseAndSelectFromGitHub: 'parcourir et sélectionner parmi vos dépôts GitHub',
    searchAndFilterByVisibility: 'Vous pouvez rechercher et filtrer par visibilité',
    chooseOutputFormatsSections: '2. Choisir les Formats de Sortie et Sections',
    selectOneOrMoreFormats: 'Sélectionnez un ou plusieurs formats de sortie',
    markdownMdxOpenapiHtml: '(Markdown, MDX, OpenAPI, HTML)',
    documentationSectionTypes: 'et types de sections de documentation',
    readmeArchitectureApi: '(README, Architecture, API, etc.)',
    runWorkflowStep: '3. Exécuter le Workflow',
    clickRunWorkflowToStart: 'Cliquez sur "Exécuter le Workflow" pour démarrer le workflow de l\'agent IA',
    systemWillProcessEachRepo: 'Le système traitera chaque dépôt',
    throughDiscoveryAnalysisPlanning: 'à travers les étapes de découverte, analyse, planification et rédaction',
    reviewCommitStep: '4. Examiner et Committer',
    reviewDocumentationInTabs: 'Examinez la documentation dans des onglets séparés pour chaque dépôt',
    switchBetweenFormatsSections: 'Basculez entre les formats et sections',
    whenReadyClickCommitToRepos: 'Lorsque vous êtes prêt, cliquez sur "Committer dans les Dépôts"',
    commitAllAtOnce: 'pour tout committer en une fois',
    benefits: 'Avantages',
    saveTimeProcessingMultiple: 'Gagnez du temps en traitant plusieurs dépôts simultanément',
    maintainConsistentFormat: 'Maintenez un format de documentation cohérent entre les projets',
    easyManagementWithTabs: 'Gestion facile avec interface à onglets pour chaque dépôt',
    batchCommitFunctionality: 'Fonctionnalité de commit par lots pour un workflow efficace',
    aiModels: 'Modèles IA',
    gitScribeSupportsMultipleModels: 'GitScribe prend en charge plusieurs modèles OpenAI',
    chooseBasedOnNeeds: 'Choisissez selon vos besoins',
    speedCostQuality: 'pour la vitesse, le coût et la qualité',
    gpt4oMiniRecommended: 'GPT-4o Mini (Recommandé)',
    fastAndCostEffective: 'Rapide et rentable pour la plupart des tâches de documentation',
    bestBalanceSpeedQuality: 'Meilleur équilibre entre vitesse et qualité',
    gpt4o: 'GPT-4o',
    mostAdvancedModel: 'Modèle le plus avancé',
    complexCodebases: 'pour les bases de code complexes',
    highestQualityHigherCost: 'Qualité maximale, coût plus élevé',
    gpt4Turbo: 'GPT-4 Turbo',
    balancedPerformanceAccuracy: 'Performance et précision équilibrées',
    goodForLargeRepos: 'Bon pour les grands dépôts',
    gpt35Turbo: 'GPT-3.5 Turbo',
    fastAndEconomical: 'Rapide et économique',
    simpleProjects: 'pour les projets simples',
    lowestCostOption: 'Option la moins chère',
    youCanChangeModel: 'Vous pouvez changer le modèle',
    settingsPanel: 'dans le panneau Paramètres',
    realtimeCostEstimation: 'Estimation des coûts en temps réel',
    statisticsSidebar: 'est affiché dans la barre latérale Statistiques',
    aiAssistant: 'Assistant IA',
    aiAssistantFeature: 'La fonctionnalité Assistant IA vous permet',
    interactivelyEditImprove: 'de modifier et améliorer votre documentation de manière interactive',
    rewriteSectionsForClarity: 'Réécrire des sections pour plus de clarté',
    fixGrammarSpellingErrors: 'Corriger les erreurs de grammaire et d\'orthographe',
    addRemoveContentBasedOnNeeds: 'Ajouter ou supprimer du contenu selon vos besoins',
    restructureDocumentation: 'Restructurer la documentation pour un meilleur flux',
    formatTextImproveReadability: 'Formater le texte et améliorer la lisibilité',
    costEstimation: 'Estimation des Coûts',
    gitScribeProvidesRealtime: 'GitScribe fournit une estimation des coûts en temps réel',
    basedOn: 'basé sur',
    selectedAiModelPricing: 'Tarification du modèle IA sélectionné',
    estimatedTokenUsage: 'Utilisation estimée des tokens',
    documentationLengthComplexity: 'Longueur et complexité de la documentation',
    costsDisplayedInStatistics: 'Les coûts sont affichés',
    duringGeneration: 'pendant la génération',
    github: 'GitHub',
    exportDocumentation: 'Exporter la Documentation',
    exportDocumentationDescription: 'Exportez votre documentation générée dans plusieurs formats, notamment Markdown, HTML, PDF et plus encore. Téléchargez les fichiers de documentation ou commitez-les directement dans vos dépôts GitHub.',
    downloadGeneratedDocumentation: 'Téléchargez votre documentation générée dans plusieurs formats pour une utilisation dans des sites de documentation, wikis ou systèmes de contrôle de version.',
    exportFormats: 'Formats d\'Export',
    markdownStandardFormat: 'Markdown - Format .md standard pour GitHub, GitLab et sites de documentation',
    markdownMermaidDescription: 'Markdown + Mermaid - Markdown avec diagrammes générés par IA',
    mdxDescription: 'MDX - Markdown avec composants JSX pour une documentation interactive',
    openapiDescription: 'OpenAPI - Format YAML pour la documentation API',
    htmlDescription: 'HTML - Pages HTML entièrement stylisées prêtes pour le déploiement',
    eachFormatGenerated: 'Chaque format est généré avec un contenu spécifique à la section adapté aux types de sections sélectionnés.',
    commitToRepository: 'Valider dans le Dépôt',
    automaticallyCommitDocumentation: 'Validez automatiquement la documentation générée directement dans vos dépôts GitHub. Parfait pour garder la documentation synchronisée avec votre base de code.',
    howItWorks: 'Comment Ça Marche',
    runWorkflowGenerate: 'Exécutez le workflow pour générer la documentation pour votre/vos dépôt(s)',
    reviewGeneratedDocumentation: 'Examinez la documentation générée dans la visionneuse',
    clickCommitToRepos: 'Cliquez sur le bouton "Valider dans les Dépôts" (apparaît après la fin du workflow)',
    enterCommitMessage: 'Entrez un message de commit (par ex., "docs: Ajouter une documentation complète")',
    specifyTargetBranch: 'Spécifiez la branche cible (par défaut: main)',
    documentationCommitted: 'La documentation est validée avec le format et les types de sections sélectionnés',
    workflowStopsAfterGeneration: 'Le workflow s\'arrête après la génération, vous permettant de réviser avant de valider.',
    controlOverCommits: 'Cela garantit que vous avez le contrôle sur ce qui est validé dans vos dépôts.',
    whenWorkingWithMultiple: 'Lorsque vous travaillez avec plusieurs dépôts, chaque dépôt reçoit ses propres fichiers de documentation dédiés basés sur vos formats et sections sélectionnés.',
    eachRepositoryReceives: 'Chaque dépôt reçoit ses propres fichiers de documentation dédiés basés sur vos formats et sections sélectionnés.',
    commitOperationProcesses: 'L\'opération de commit traite tous les dépôts sélectionnés par lots.',
    documentationStoredSeparately: 'La documentation de chaque dépôt est stockée séparément et validée dans le bon dépôt.',
    autoUpdateFeature: 'Fonctionnalité de Mise à Jour Automatique',
    enableAutoUpdateDescription: 'Activez la mise à jour automatique pour régénérer et valider automatiquement la documentation lorsque votre dépôt reçoit de nouveaux commits ou fusions vers la branche principale.',
    automaticUpdates: 'Mises à Jour Automatiques',
    monitorsRepositories: 'Surveille les dépôts toutes les 5 minutes',
    detectsPushesMerges: 'Détecte les push et fusions vers la branche principale',
    automaticallyRegenerates: 'Régénère automatiquement la documentation',
    commitsUpdatedDocumentation: 'Valide la documentation mise à jour avec horodatage',
    multiRepoOverview: 'Le support multi-dépôts de GitScribe vous permet de traiter plusieurs dépôts GitHub à la fois, économisant du temps et des efforts lors de la documentation de plusieurs projets.',
    completeGuideToUsing: 'Guide complet pour utiliser GitScribe',
    welcomeToGitScribe: 'Bienvenue sur GitScribe! Un outil de génération de documentation alimenté par IA qui crée automatiquement une documentation complète pour vos dépôts GitHub en utilisant des workflows d\'agents IA avancés.',
    aiPoweredDocumentationTool: 'Outil de génération de documentation alimenté par IA',
    quickStart: 'Démarrage Rapide',
    addOpenAiKey: 'Ajoutez votre clé API OpenAI dans les paramètres',
    optionalAddGitHubToken: '(Optionnel) Ajoutez un Token d\'Accès Personnel GitHub pour les dépôts privés',
    enterRepositoryUrlOrSelect: 'Entrez une URL de dépôt GitHub ou sélectionnez plusieurs dépôts',
    clickRunWorkflowStart: 'Cliquez sur "Exécuter le Workflow" pour démarrer le workflow de l\'agent IA',
    reviewEditCommit: 'Examinez la documentation générée, modifiez avec l\'Assistant IA et validez',
    coreFeatures: 'Fonctionnalités Principales',
    directIntegration: 'Intégration directe avec l\'API GitHub pour l\'accès aux dépôts et les commits',
    processMultipleRepos: 'Traiter plusieurs dépôts simultanément avec des opérations par lots',
    intelligentAgentSystem: 'Système d\'agents intelligent pour la génération automatisée de documentation',
    multipleOutputFormats: 'Plusieurs formats de sortie et commits GitHub directs',
    outputFormatsDescription: 'GitScribe prend en charge plusieurs formats de documentation pour répondre à différents besoins:',
    standardMarkdownFormat: 'Format markdown standard pour GitHub, GitLab et sites de documentation',
    markdownWithDiagrams: 'Markdown avec diagrammes Mermaid générés par IA pour l\'architecture et les flux',
    markdownWithJsx: 'Markdown avec composants JSX pour une documentation interactive',
    yamlFormatForApi: 'Format YAML pour la documentation API avec spécifications d\'endpoints',
    fullyStyledHtml: 'Pages HTML entièrement stylisées prêtes pour le déploiement',
    documentationSections: 'Sections de Documentation',
    generateDifferentTypes: 'Générer différents types de sections de documentation:',
    readmeDescription: 'README - Aperçu du projet, installation, utilisation et fonctionnalités',
    architectureDescription: 'Architecture - Conception du système, structure des composants et flux de données',
    apiReferenceDescription: 'Référence API - Documentation des endpoints, schémas de requête/réponse',
    componentsDescription: 'Composants - Documentation des composants avec props et exemples d\'utilisation',
    testingCicdDescription: 'Tests & CI/CD - Configuration des tests, pipeline CI/CD et déploiement',
    changelogDescription: 'Changelog - Historique des versions et notes de version',
    aiAgentWorkflow: 'Workflow d\'Agent IA',
    gitScribeUsesIntelligent: 'GitScribe utilise un système d\'agents intelligent qui traite les dépôts à travers plusieurs étapes:',
    repoDiscovery: 'RepoDiscovery',
    validatesAndDiscovers: '- Valide et découvre les dépôts',
    repoAnalysis: 'RepoAnalysis',
    analyzesStructure: '- Analyse la structure, la pile technologique et la complexité',
    docsPlanner: 'DocsPlanner',
    createsStructuredPlan: '- Crée un plan de documentation structuré',
    docsWriter: 'DocsWriter',
    generatesDocumentation: '- Génère la documentation dans les formats sélectionnés',
    learnMore: 'En Savoir Plus',
    exploreOtherPages: 'Explorez les autres pages de cette section de documentation pour des informations détaillées sur chaque fonctionnalité et comment les utiliser efficacement.',
    aiPoweredOverview: 'GitScribe utilise les modèles de langage avancés d\'OpenAI pour analyser votre base de code et générer une documentation complète et bien structurée. Notre IA comprend le contexte du code, les relations et les meilleures pratiques pour créer une documentation à la fois précise et lisible.',
    gitScribeUsesOpenAI: 'GitScribe utilise les modèles de langage avancés d\'OpenAI',
    completeApiDocumentation: 'Documentation API complète pour les développeurs',
    agentWorkflowSystem: 'Système de Workflow d\'Agents',
    gitScribeUsesLangGraph: 'GitScribe utilise un système d\'agents de style LangGraph pour la génération automatisée de documentation:',
    agentWorkflowSteps: '// Étapes du Workflow d\'Agents',
    agentState: 'État de l\'Agent',
    workflowMaintainsSharedState: 'Le workflow maintient un état partagé entre les agents, incluant:',
    discoveredRepositories: 'Dépôts découverts',
    repositoryAnalyses: 'Analyses de dépôts',
    documentationPlans: 'Plans de documentation',
    generatedDocumentationByFormat: 'Documentation générée (par format et section)',
    commitResults: 'Résultats des commits',
    githubService: 'Service GitHub',
    langChainService: 'Service LangChain',
    typeDefinitions: 'Définitions de Types',
    exampleUseCases: 'Cas d\'utilisation et workflows d\'exemple',
    example1SingleRepository: 'Exemple 1: Dépôt Unique',
    scenario: 'Scénario',
    youWantToGenerate: 'Vous souhaitez générer une documentation complète pour un projet React unique avec plusieurs formats.',
    steps: 'Étapes',
    enterGitHubRepositoryUrl: 'Entrez l\'URL du dépôt GitHub:',
    selectOutputFormatsEg: 'Sélectionnez les formats de sortie (par ex., Markdown, MDX, HTML)',
    selectSectionTypesEg: 'Sélectionnez les types de sections (par ex., README, Architecture, API)',
    watchWorkflowProgress: 'Suivez la progression du workflow à travers la découverte, l\'analyse, la planification et la rédaction',
    reviewGeneratedDocumentationSwitch: 'Examinez la documentation générée, basculez entre les formats et sections',
    clickCommitToReposWhenReady: 'Cliquez sur "Committer dans les Dépôts" lorsque vous êtes prêt à committer',
    example2MultipleRepositories: 'Exemple 2: Plusieurs Dépôts',
    youManageMultipleMicroservices: 'Vous gérez plusieurs microservices et souhaitez les documenter tous en même temps avec un formatage cohérent.',
    clickSelectRepositories: 'Cliquez sur "Sélectionner les dépôts" et choisissez plusieurs dépôts de votre compte GitHub',
    selectOutputFormatsEgOpenAPI: 'Sélectionnez les formats de sortie (par ex., Markdown + OpenAPI pour la documentation API)',
    monitorWorkflowProgress: 'Surveillez la progression du workflow pour chaque dépôt',
    reviewEachRepositoryDocumentation: 'Examinez la documentation de chaque dépôt dans des onglets séparés',
    switchBetweenFormatsSectionsForEach: 'Basculez entre les formats et sections pour chaque dépôt',
    commitAllRepositoriesAtOnce: 'Committer tous les dépôts en une fois avec "Committer dans les Dépôts"',
    example3AutoUpdateWorkflow: 'Exemple 3: Workflow de Mise à Jour Automatique',
    youWantDocumentationToAutoUpdate: 'Vous souhaitez que la documentation se mette à jour automatiquement lorsque le code change.',
    selectRepositoriesInMultiRepoMode: 'Sélectionnez les dépôts en mode multi-dépôts',
    enableAutoUpdateForEach: 'Activez la mise à jour automatique pour chaque dépôt (icône de cloche)',
    toggleGlobalAutoUpdateSwitch: 'Basculez l\'interrupteur de mise à jour automatique globale',
    documentationWillAutoUpdate: 'La documentation se mettra à jour automatiquement à chaque push/merge vers main',
    example4UsingAiAssistant: 'Exemple 4: Utilisation de l\'Assistant IA',
    youWantToImproveDocumentation: 'Vous souhaitez améliorer la documentation générée avec l\'aide de l\'IA.',
    examplePrompts: 'Exemples de Prompts',
    addSectionExplainingInstallation: '"Ajouter une section expliquant le processus d\'installation"',
    makeApiDocumentationMoreDetailed: '"Rendre la section de documentation API plus détaillée"',
    fixAllGrammarErrors: '"Corriger toutes les erreurs de grammaire"',
    restructureDocumentationForBetterFlow: '"Restructurer la documentation pour un meilleur flux"',
    needHelp: 'Besoin d\'Aide?',
    wereHereToHelp: 'Nous sommes là pour vous aider! Si vous rencontrez des problèmes ou avez des questions sur GitScribe, voici les meilleures façons d\'obtenir de l\'aide.',
    contactOptions: 'Options de Contact',
    emailSupport: 'Support par Email',
    getDirectHelpViaEmail: 'Obtenez de l\'aide directe par email',
    githubIssues: 'Problèmes GitHub',
    reportBugsOrRequestFeatures: 'Signaler des bugs ou demander des fonctionnalités',
    openAnIssue: 'Ouvrir un problème',
    commonIssues: 'Problèmes Courants',
    openaiApiKeyError: 'Erreur de Clé API OpenAI',
    addOpenAiKeyInSettings: 'Ajoutez votre clé API OpenAI dans le panneau Paramètres. Cliquez sur l\'icône Paramètres, entrez votre clé et cliquez sur "Enregistrer les Modifications".',
    githubRateLimiting: 'Limitation de Débit GitHub',
    addGitHubTokenInSettings: 'Ajoutez un Token d\'Accès Personnel GitHub dans le panneau Paramètres pour augmenter les limites de débit et accéder aux dépôts privés.',
    requiredScopeRepo: 'Portée requise:',
    workflowNotStarting: 'Workflow Ne Démarre Pas',
    ensureYouHaveSelected: 'Assurez-vous d\'avoir sélectionné au moins un format de sortie et un type de section. Le bouton "Exécuter le Workflow" nécessite que les deux soient activés.',
    documentationNotCommitting: 'Documentation Ne Committe Pas',
    makeSureGitHubTokenHasRepoScope: 'Assurez-vous que votre token GitHub a la',
    checkOutComprehensiveDocumentation: 'Consultez notre documentation complète pour des guides détaillés et des références API.',
    howWeProtectAndHandle: 'Comment nous protégeons et gérons vos données',
    lastUpdated: 'Dernière mise à jour:',
    introduction: 'Introduction',
    gitScribeCommittedToPrivacy: 'GitScribe ("nous", "notre" ou "nos") s\'engage à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre service.',
    informationWeCollect: 'Informations que Nous Collectons',
    personalInformation: 'Informations Personnelles',
    weMayCollectPersonalInfo: 'Nous pouvons collecter des informations personnelles telles que les adresses email lorsque vous créez un compte ou nous contactez pour obtenir de l\'aide.',
    githubTokens: 'Tokens GitHub',
    githubTokensStoredLocally: 'Les Tokens d\'Accès Personnel GitHub sont stockés localement dans le localStorage de votre navigateur. Nous ne transmettons ni ne stockons ces tokens sur nos serveurs.',
    usageData: 'Données d\'Utilisation',
    weMayCollectUsageData: 'Nous pouvons collecter des informations sur la façon dont vous utilisez notre service, y compris les URLs des dépôts et les préférences de génération de documentation.',
    howWeUseYourInformation: 'Comment Nous Utilisons Vos Informations',
    toProvideAndImprove: 'Pour fournir et améliorer notre service de génération de documentation',
    toProcessYourRequests: 'Pour traiter vos demandes et générer de la documentation',
    toCommunicateWithYou: 'Pour communiquer avec vous concernant votre compte ou vos demandes d\'aide',
    toAnalyzeUsagePatterns: 'Pour analyser les modèles d\'utilisation et améliorer notre service',
    dataSecurity: 'Sécurité des Données',
    weImplementSecurityMeasures: 'Nous mettons en place des mesures de sécurité appropriées pour protéger vos informations. Les tokens GitHub sont stockés localement dans votre navigateur et ne sont jamais transmis à nos serveurs. Toutes les communications API sont cryptées en utilisant HTTPS.',
    thirdPartyServices: 'Services Tiers',
    weUseFollowingThirdParty: 'Nous utilisons les services tiers suivants:',
    openaiForAiPowered: 'OpenAI: Pour la génération de documentation alimentée par IA en utilisant les modèles GPT',
    githubForRepositoryAccess: 'GitHub: Pour l\'accès aux dépôts, les opérations sur fichiers et les commits via l\'API GitHub',
    localStorageForStoring: 'LocalStorage: Pour stocker les préférences utilisateur, tokens et historique de projet localement dans votre navigateur',
    allDataStoredLocally: 'Toutes les données sont stockées localement dans votre navigateur. Les tokens GitHub et les clés API ne sont jamais transmis à nos serveurs.',
    yourRights: 'Vos Droits',
    youHaveRightToAccess: 'Vous avez le droit d\'accéder, de mettre à jour ou de supprimer vos informations personnelles. Vous pouvez gérer les paramètres de votre compte ou nous contacter à',
    contactUsPrivacy: 'Nous Contacter',
    ifYouHaveQuestionsPrivacy: 'Si vous avez des questions concernant cette Politique de Confidentialité, veuillez nous contacter à',
    termsAndConditions: 'Termes et conditions d\'utilisation de GitScribe',
    agreementToTerms: 'Acceptation des Termes',
    byAccessingOrUsing: 'En accédant ou en utilisant GitScribe ("le Service"), vous acceptez d\'être lié par ces Conditions d\'Utilisation. Si vous n\'êtes pas d\'accord avec une partie de ces termes, vous ne pouvez pas accéder au Service.',
    useOfService: 'Utilisation du Service',
    eligibility: 'Éligibilité',
    youMustBeAtLeast18: 'Vous devez avoir au moins 18 ans ou avoir le consentement parental pour utiliser ce Service.',
    accountResponsibility: 'Responsabilité du Compte',
    youAreResponsibleForMaintaining: 'Vous êtes responsable de maintenir la sécurité de votre compte et de toutes les clés API ou tokens que vous utilisez avec le Service.',
    acceptableUse: 'Utilisation Acceptable',
    youAgreeNotTo: 'Vous acceptez de ne pas:',
    useServiceForIllegalPurpose: 'Utiliser le Service à des fins illégales',
    violateLawsOrRegulations: 'Violer toute loi ou réglementation',
    infringeOnIntellectualProperty: 'Porter atteinte aux droits de propriété intellectuelle',
    transmitMaliciousCode: 'Transmettre du code malveillant ou des virus',
    attemptUnauthorizedAccess: 'Tenter d\'obtenir un accès non autorisé au Service',
    apiUsageAndCosts: 'Utilisation et Coûts de l\'API',
    gitScribeUsesOpenAIApi: 'GitScribe utilise l\'API d\'OpenAI pour les fonctionnalités alimentées par IA. Vous êtes responsable de:',
    youAreResponsibleFor: 'Vous êtes responsable de:',
    providingYourOwnOpenAiKey: 'Fournir votre propre clé API OpenAI',
    allCostsAssociated: 'Tous les coûts associés à l\'utilisation de l\'API',
    managingYourApiKeySecurity: 'Gérer la sécurité de votre clé API',
    intellectualProperty: 'Propriété Intellectuelle',
    serviceOwnedByGitScribe: 'Le Service et son contenu original, fonctionnalités et fonctionnalités sont la propriété de GitScribe et sont protégés par les lois internationales sur le droit d\'auteur, les marques de commerce et autres lois sur la propriété intellectuelle.',
    limitationOfLiability: 'Limitation de Responsabilité',
    gitScribeProvidedAsIs: 'GitScribe est fourni "tel quel" sans garanties d\'aucune sorte. Nous ne sommes pas responsables des dommages résultant de votre utilisation du Service, y compris mais sans s\'y limiter, la perte de données, les erreurs de documentation ou les coûts de l\'API.',
    changesToTerms: 'Modifications des Termes',
    weReserveRightToModify: 'Nous nous réservons le droit de modifier ces termes à tout moment. L\'utilisation continue du Service après les modifications constitue une acceptation des nouveaux termes.',
    contactTerms: 'Contact',
    forQuestionsAboutTerms: 'Pour des questions concernant ces Termes, contactez-nous à',
    howWeUseCookies: 'Comment nous utilisons les cookies et technologies similaires',
    whatAreCookies: 'Que Sont les Cookies',
    cookiesAreSmallTextFiles: 'Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web. Ils aident les sites web à se souvenir de vos préférences et à améliorer votre expérience de navigation.',
    howWeUseCookiesTitle: 'Comment Nous Utilisons les Cookies',
    essentialCookies: 'Cookies Essentiels',
    theseCookiesAreNecessary: 'Ces cookies sont nécessaires au fonctionnement du Service. Ils incluent les tokens d\'authentification et les informations de session.',
    preferenceCookies: 'Cookies de Préférence',
    weUseLocalStorageToStore: 'Nous utilisons localStorage pour stocker vos préférences, telles que les tokens GitHub et les paramètres de l\'interface utilisateur. Ces données sont stockées localement dans votre navigateur et ne sont jamais transmises à nos serveurs.',
    analyticsCookies: 'Cookies d\'Analyse',
    weMayUseAnalyticsCookies: 'Nous pouvons utiliser des cookies d\'analyse pour comprendre comment les utilisateurs interagissent avec notre Service et améliorer nos fonctionnalités.',
    localStorageUsage: 'Utilisation de LocalStorage',
    gitScribeUsesBrowserLocalStorage: 'GitScribe utilise le localStorage du navigateur (pas les cookies) pour stocker:',
    githubPersonalAccessTokensEncrypted: 'Tokens d\'Accès Personnel GitHub (cryptés localement)',
    userPreferencesAndSettings: 'Préférences et paramètres utilisateur',
    autoFollowRepositoryConfigurations: 'Configurations de suivi automatique des dépôts',
    thisDataRemainsOnDevice: 'Ces données restent sur votre appareil et ne sont jamais partagées avec des tiers.',
    managingCookies: 'Gestion des Cookies',
    youCanControlCookies: 'Vous pouvez contrôler les cookies via les paramètres de votre navigateur. Cependant, désactiver les cookies essentiels peut affecter la fonctionnalité du Service.',
    toClearLocalStorageData: 'Pour effacer les données localStorage, vous pouvez utiliser les outils de développement de votre navigateur ou effacer les données de navigation.',
    thirdPartyCookies: 'Cookies Tiers',
    weMayUseThirdPartyServices: 'Nous pouvons utiliser des services tiers qui définissent leurs propres cookies. Ces services incluent:',
    analyticsProviders: 'Fournisseurs d\'analyse (le cas échéant)',
    contactCookiePolicy: 'Contact',
    forQuestionsAboutCookiePolicy: 'Pour des questions concernant notre Politique des Cookies, contactez-nous à',
    pageNotFound: 'Page Non Trouvée',
    theRequestedPageCouldNotBeFound: 'La page demandée n\'a pas pu être trouvée',
    thePageYoureLookingForDoesntExist: 'La page que vous recherchez n\'existe pas.',
    formatMarkdown: 'Markdown',
    formatMarkdownMermaid: 'Markdown + Mermaid',
    formatMdx: 'MDX',
    formatOpenapi: 'OpenAPI',
    formatHtml: 'HTML',
    sectionReadme: 'README',
    sectionArchitecture: 'Architecture',
    sectionApiReference: 'Référence API',
    sectionComponents: 'Composants',
    sectionTestingCicd: 'Tests & CI/CD',
    sectionChangelog: 'Changelog',
    sectionReadmeShort: 'README',
    sectionArchitectureShort: 'ARCH',
    sectionApiReferenceShort: 'API',
    sectionComponentsShort: 'COMP',
    sectionTestingCicdShort: 'TEST',
    sectionChangelogShort: 'CHG',
    aiPoweredDocumentationGenerationForGitHub: 'Génération de documentation alimentée par IA pour les dépôts GitHub',
    requiredForAiPoweredDocumentationGeneration: 'Requis pour la génération de documentation alimentée par IA.',
    functionFetchUserRepos: 'fetchUserRepos',
    functionCreateOrUpdateFile: 'createOrUpdateFile',
    functionCallLangChain: 'callLangChain',
    typeSimpleRepo: 'SimpleRepo',
    typeDocOutputFormat: 'DocOutputFormat',
    typeDocSectionType: 'DocSectionType',
    pleaseProvideCommitMessage: 'Veuillez fournir un message de commit',
    githubTokenRequiredForCommitting: 'Le token GitHub est requis pour committer les fichiers',
    documentationNotFoundForRepository: 'Documentation introuvable pour ce dépôt. Veuillez d\'abord générer la documentation.',
    successfullyCommittedToRepository: 'Documentation committée avec succès dans 1 dépôt!',
    successfullyCommittedToRepositories: 'Documentation committée avec succès dans {count} dépôts!',
    failedToCommitToRepository: 'Échec du commit dans 1 dépôt',
    failedToCommitToRepositories: 'Échec du commit dans {count} dépôts',
    failedToCommitDocumentation: 'Échec du commit de la documentation',
    documentationHelper: 'Assistant de documentation',
    clearConversationHistoryConfirm: 'Effacer l\'historique de conversation?',
    readyToHelp: 'Prêt à aider!',
    iCanHelpEditDocumentation: 'Je peux vous aider à modifier et améliorer votre documentation',
    editSections: 'Modifier les sections',
    improveClarity: 'Améliorer la clarté',
    fixGrammar: 'Corriger la grammaire',
    aiIsThinking: 'L\'IA réfléchit...',
    send: 'Envoyer',
    beSpecificForBetterResults: 'Soyez spécifique pour de meilleurs résultats',
    pressEnterToSend: 'Appuyez sur Entrée pour envoyer',
    errorEditingDocumentation: 'Erreur lors de l\'édition de la documentation',
    unknownErrorOccurred: 'Une erreur inconnue s\'est produite',
    workflowFailed: 'Le workflow a échoué',
    viewCommit: 'Voir le commit',
    repositoryQualityScores: 'Scores de Qualité des Dépôts',
    folderStructureRefactorProposals: 'Propositions de Refactorisation de la Structure de Dossiers',
    recommendedStructure: 'Structure Recommandée:',
    proposedMoves: 'Déplacements Proposés',
    moreMoves: 'plus de déplacements...',
    warnings: 'Avertissements',
    generatedRepositoryBadges: 'Badges de Dépôt Générés',
    badgeMarkdownCopiedToClipboard: 'Markdown du badge copié dans le presse-papiers!',
    copyBadgeMarkdown: 'Copier le Markdown du Badge',
    pdfExportFailed: 'Échec de l\'export PDF',
  },
  de: {
    aiPoweredGeneration: 'KI-gestützte Dokumentationsgenerierung',
    sourceSelection: 'Quellenauswahl',
    clickToCollapse: 'Zum Reduzieren klicken',
    clickToExpand: 'Zum Erweitern klicken',
    formats: 'Formate',
    sections: 'Abschnitte',
    selectAtLeastOne: 'Wählen Sie mindestens ein Format und einen Abschnitt',
    token: 'Token',
    add: 'Hinzufügen',
    change: 'Ändern',
    hide: 'Ausblenden',
    openaiKey: 'OpenAI-Schlüssel',
    saveChanges: 'Änderungen Speichern',
    edit: 'Bearbeiten',
    save: 'Speichern',
    editDocumentation: 'Dokumentation Bearbeiten',
    editDocumentationPlaceholder: 'Bearbeiten Sie Ihre Dokumentation hier...',
    runWorkflow: 'Workflow Ausführen',
    generate: 'Generieren',
    startWritingDocumentation: 'Dokumentation Schreiben Beginnen',
    generating: 'Wird generiert...',
    documentation: 'Dokumentation',
    noDocumentation: 'Noch keine Dokumentation generiert',
    export: 'Exportieren',
    commit: 'Übernehmen',
    settings: 'Einstellungen',
    statistics: 'Statistiken',
    length: 'Länge',
    modelUsed: 'Verwendetes Modell',
    estTokens: 'Geschätzte Tokens',
    estCost: 'Geschätzte Kosten',
    words: 'Wörter',
    lines: 'Zeilen',
    characters: 'Zeichen',
    fileSize: 'Dateigröße',
    readingTime: 'Lesezeit',
    avgWordsPerLine: 'Ø Wörter/Zeile',
    headers: 'Überschriften',
    codeBlocks: 'Code-Blöcke',
    links: 'Links',
    inputTokens: 'Eingabe-Tokens',
    outputTokens: 'Ausgabe-Tokens',
    wordCount: 'Wortanzahl',
    lineCount: 'Zeilenanzahl',
    characterCount: 'Zeichen',
    estimatedTokens: 'Geschätzte Tokens',
    cost: 'Kosten',
    avg: 'Ø',
    wordsPerLine: 'Wörter/Zeile',
    fileSizeLabel: 'Dateigröße',
    lengthLabel: 'Länge',
    input: 'Eingabe',
    output: 'Ausgabe',
    wordsUnit: 'Wörter',
    charactersUnit: 'Zeichen',
    tokensUnit: 'Tokens',
    bytesUnit: 'Bytes',
    charsUnit: 'Zeichen',
    minUnit: 'Min',
    source: 'Quelle',
    qualityScores: 'Qualitätsbewertungen',
    refactorProposals: 'Refaktorisierungsvorschläge',
    badges: 'Abzeichen',
    pdfExport: 'PDF-Export',
    clear: 'Löschen',
    formatsLocked: 'Formate und Abschnitte sind nach der Generierung gesperrt.',
    runNewWorkflow: 'Führen Sie einen neuen Workflow aus, um sie zu ändern.',
    agentWorkflow: 'Agent-Workflow',
    useAiAgents: 'KI-Agenten für automatisierte Pipeline verwenden',
    singleRepo: 'Einzelnes Repository',
    multiRepo: 'Multi-Repository',
    githubUrl: 'GitHub-URL',
    selectRepos: 'Repositories Auswählen',
    selectAtLeastOneRepo: 'Bitte wählen Sie mindestens ein Repository aus',
    selectAtLeastOneFormat: 'Bitte wählen Sie mindestens ein Ausgabeformat aus',
    selectAtLeastOneSection: 'Bitte wählen Sie mindestens einen Dokumentationsabschnittstyp aus',
    pleaseProvideUrl: 'Bitte geben Sie eine GitHub-URL an',
    reviewAndCommit: 'Überprüfen Sie die Dokumentation unten und klicken Sie dann auf "In Repositories Übernehmen", wenn Sie sie übernehmen möchten.',
    commitToRepos: 'In Repositories Übernehmen',
    committing: 'Wird übernommen...',
    clearDocumentation: 'Dokumentation löschen, um Formate/Abschnitte zu ändern',
    toChangeFormats: 'um Formate/Abschnitte zu ändern',
    gitScribe: 'GitScribe',
    aiPowered: 'KI-GESTÜTZT',
    aiPoweredDocumentationTitle: 'KI-gestützte Dokumentation für GitHub-Repositories',
    aiPoweredDocumentationDescription: 'Generieren Sie automatisch umfassende Dokumentation aus einzelnen oder mehreren GitHub-Repositories. Angetrieben von KI-Agenten, die Dokumentation für Ihre Codebasis analysieren, planen und schreiben.',
    githubIntegration: 'GitHub-Integration',
    githubIntegrationDescription: 'Generieren Sie Dokumentation aus jedem GitHub-Repository',
    multiRepoSupport: 'Multi-Repository-Unterstützung',
    multiRepoSupportDescription: 'Generieren Sie Dokumentation für mehrere Repositories gleichzeitig',
    autoCommitExport: 'Automatische Übernahme & Export',
    autoCommitExportDescription: 'Automatisch Dokumentation in Repositories übernehmen oder als Markdown herunterladen',
    readyToStart: 'Bereit zu starten?',
    generateDocumentationFromRepos: 'Generieren Sie Dokumentation aus GitHub-Repositories',
    noAccountNeeded: 'Kein Konto erforderlich - Sofort starten!',
    startImmediately: 'Sofort starten!',
    whyChooseOurTool: 'Warum Unser Dokumentationstool Wählen',
    whyChooseOurToolDescription: 'Optimieren Sie Ihren Dokumentations-Workflow mit KI-gestützter Generierung',
    aiAgentWorkflows: 'KI-Agent-Workflows',
    aiAgentWorkflowsDescription: 'Automatisiertes Agentensystem, das Dokumentation für Ihre Repositories entdeckt, analysiert, plant und schreibt.',
    autoUpdateFollow: 'Automatische Aktualisierung & Verfolgung',
    autoUpdateFollowDescription: 'Automatisch Änderungen erkennen und Dokumentation neu generieren, wenn Repositories aktualisiert werden.',
    githubIntegrationFeature: 'GitHub-Integration',
    githubIntegrationFeatureDescription: 'Nahtlose Commit-Integration und direkter Repository-Zugriff für Ihren Dokumentations-Workflow.',
    readyToGetStarted: 'Bereit zu starten?',
    joinDevelopers: 'Treten Sie Entwicklern und Teams bei, die ihren Dokumentations-Workflow automatisieren',
    startGeneratingDocumentation: 'Dokumentation Generieren Starten',
    footerDescription: 'KI-gestützte Dokumentationsgenerierung für GitHub-Repositories mit Multi-Repository-Unterstützung, Agent-Workflows und Auto-Update-Funktionen.',
    madeWith: 'Gemacht mit',
    forDevelopers: 'für Entwickler',
    features: 'Funktionen',
    resources: 'Ressourcen',
    connect: 'Verbinden',
    contactUs: 'Kontaktieren Sie uns',
    Donate: 'Spenden',
    buyMeACoffee: 'Kauf mir einen Kaffee',
    supportGitScribe: 'GitScribe unterstützen',
    supportGitScribeDevelopment: 'Helfen Sie uns, GitScribe weiterzuentwickeln und zu verbessern',
    ifYouFindGitScribeUseful: 'Wenn Sie GitScribe nützlich finden und dessen Entwicklung unterstützen möchten, erwägen Sie, uns einen Kaffee zu kaufen!',
    whySupport: 'Warum GitScribe unterstützen?',
    gitScribeIsFreeAndOpenSource: 'GitScribe ist kostenlos und Open-Source, mit Leidenschaft für die Entwicklergemeinschaft gebaut.',
    yourSupportHelpsUs: 'Ihre Unterstützung hilft uns:',
    newFeatures: 'Neue Funktionen',
    developNewFeaturesAndImprovements: 'Neue Funktionen und Verbesserungen basierend auf Benutzerfeedback entwickeln',
    maintenanceAndUpdates: 'Wartung & Updates',
    keepGitScribeRunningSmoothly: 'GitScribe mit regelmäßigen Updates und Fehlerbehebungen reibungslos am Laufen halten',
    freeAndOpenSource: 'Kostenlos & Open Source',
    maintainFreeAccessForEveryone: 'Kostenlosen Zugang für alle aufrechterhalten und gleichzeitig das Tool verbessern',
    otherWaysToSupport: 'Andere Wege zur Unterstützung',
    starOnGitHub: 'Auf GitHub bewerten',
    starringOurRepository: 'Das Bewerten unseres Repositories hilft anderen, GitScribe zu entdecken',
    visitGitHub: 'GitHub besuchen',
    shareFeedback: 'Feedback teilen',
    letUsKnowWhatYouThink: 'Lassen Sie uns wissen, was Sie denken und wie wir uns verbessern können',
    thankYou: 'Vielen Dank!',
    everyContributionMatters: 'Jeder Beitrag zählt, egal wie klein.',
    whetherThroughDonations: 'Ob durch Spenden, GitHub-Bewertungen oder Feedback,',
    weAppreciateYourSupport: 'wir schätzen Ihre Unterstützung, um GitScribe für alle besser zu machen.',
    allRightsReserved: 'Alle Rechte vorbehalten',
    privacyPolicy: 'Datenschutzrichtlinie',
    termsOfService: 'Nutzungsbedingungen',
    cookiePolicy: 'Cookie-Richtlinie',
    overview: 'Übersicht',
    gettingStarted: 'Erste Schritte',
    supportedFormats: 'Unterstützte Formate',
    repositoryAccess: 'Repository-Zugriff',
    fileAnalysis: 'Dateianalyse',
    codeUnderstanding: 'Code-Verständnis',
    createGitHubToken: 'GitHub Personal Access Token erstellen',
    addTokenToGitScribe: 'Token zu GitScribe hinzufügen',
    startGenerating: 'Generierung starten',
    requiredScopes: 'Erforderliche Berechtigungen',
    forPrivateRepos: 'für private Repositories und Commits',
    forPublicRepos: 'Für öffentliche Repositories ist ein Token optional, aber empfohlen, um Rate-Limits zu vermeiden',
    enterRepositoryUrl: 'Geben Sie Ihre Repository-URL ein',
    chooseOutputFormats: 'Wählen Sie Ausgabeformate und Abschnittstypen',
    clickRunWorkflow: 'Klicken Sie auf "Workflow Ausführen"',
    selectMultipleRepositories: 'Mehrere Repositories Auswählen',
    aiPoweredAnalysis: 'KI-gestützte Analyse',
    automaticallyAnalyze: 'Automatisch analysieren',
    connectToAnyRepository: 'Verbinden Sie sich mit jedem GitHub-Repository',
    usingPersonalAccessToken: 'mit Ihrem Personal Access Token',
    goToGitHubSettings: 'Gehen Sie zu GitHub-Einstellungen',
    developerSettings: 'Entwicklereinstellungen',
    personalAccessTokens: 'Personal Access Tokens',
    tokensClassic: 'Tokens (klassisch)',
    enterYourToken: 'Geben Sie Ihren Token ein',
    githubTokenField: 'im GitHub-Token-Feld',
    documentationEditorSettings: 'in den Dokumentations-Editor-Einstellungen',
    clickSaveChanges: 'Klicken Sie auf "Änderungen Speichern"',
    persistIt: 'um es zu speichern',
    egOwnerRepo: 'z.B. Eigentümer/Repository',
    thenClickRunWorkflow: 'dann klicken Sie auf "Workflow Ausführen"',
    startAiAgentWorkflow: 'um den KI-Agent-Workflow zu starten',
    youCanUseAnyOfTheseFormats: 'Sie können eines dieser Formate verwenden, um ein Repository anzugeben',
    toSpecifyRepository: 'um ein Repository anzugeben',
    seamlesslyConnectWithGitHub: 'Verbinden Sie sich nahtlos mit GitHub, um Dokumentation aus Ihren Repositories zu generieren',
    generateDocumentationFromRepositories: 'Dokumentation aus Ihren Repositories generieren',
    gitScribeIntegratesDirectly: 'GitScribe integriert sich direkt mit der GitHub-API',
    accessYourRepositories: 'um auf Ihre Repositories zuzugreifen',
    generateComprehensiveDocumentation: 'und umfassende Dokumentation zu generieren',
    whetherPublicOrPrivate: 'Ob Sie mit öffentlichen oder privaten Repositories arbeiten',
    ourIntegrationMakesItEasy: 'unsere Integration macht es einfach',
    documentYourCodebase: 'Ihre Codebasis zu dokumentieren',
    connectToAnyGitHubRepository: 'Verbinden Sie sich mit jedem GitHub-Repository',
    automaticallyAnalyzeRepository: 'Repository automatisch analysieren',
    repositoryStructure: 'Repository-Struktur',
    codeFiles: 'Codedateien',
    configuration: 'und Konfiguration',
    aiPoweredAnalysisOfCodebase: 'KI-gestützte Analyse Ihrer Codebasis',
    generateAccurateDocumentation: 'um genaue Dokumentation zu generieren',
    tokenOptionalButRecommended: 'Für öffentliche Repositories ist ein Token optional, aber empfohlen',
    avoidRateLimits: 'um Rate-Limits zu vermeiden',
    multiRepoSupportTitle: 'Multi-Repository-Unterstützung',
    generateDocumentationForMultiple: 'Generieren Sie Dokumentation für mehrere',
    simultaneously: 'gleichzeitig',
    selectMultipleRepositoriesTitle: 'Mehrere Repositories Auswählen',
    batchProcessing: 'Stapelverarbeitung',
    unifiedDocumentation: 'Einheitliche Dokumentation',
    individualDocumentation: 'Individuelle Dokumentation',
    aiPoweredGenerationTitle: 'KI-gestützte Generierung',
    aiPoweredGenerationDescription: 'Nutzen Sie fortschrittliche KI, um umfassende, genaue Dokumentation zu erstellen',
    exportCommitTitle: 'Export & Commit',
    exportCommitDescription: 'Exportieren Sie Dokumentation oder committen Sie direkt in Ihre Repositories',
    documentationTitle: 'Dokumentation',
    apiReferenceTitle: 'API-Referenz',
    examplesTitle: 'Beispiele',
    supportTitle: 'Support',
    privacyPolicyTitle: 'Datenschutzrichtlinie',
    termsOfServiceTitle: 'Nutzungsbedingungen',
    cookiePolicyTitle: 'Cookie-Richtlinie',
    assistantGreeting: 'Hallo! Ich bin Ihr KI-Assistent. Ich kann Ihnen beim Bearbeiten und Verbessern Ihrer Dokumentation helfen! 📚',
    assistantCapabilities: 'Ich kann:',
    assistantRewriteSections: 'Abschnitte umschreiben',
    assistantImproveClarity: 'Klarheit und Lesbarkeit verbessern',
    assistantFixGrammar: 'Grammatik und Rechtschreibung korrigieren',
    assistantAddRemoveContent: 'Inhalte hinzufügen oder entfernen',
    assistantRestructure: 'Dokumentation umstrukturieren',
    assistantFormatText: 'Text besser formatieren',
    assistantTellMeWhatToChange: 'Sagen Sie mir einfach, was Sie ändern möchten!',
    assistantErrorNoDocumentation: 'Der Dokumentationsbearbeitungsmodus erfordert, dass die Dokumentation geladen ist. Bitte generieren Sie zuerst die Dokumentation.',
    assistantErrorUnknown: 'Entschuldigung, es ist ein Fehler aufgetreten',
    assistantErrorApiKey: 'Konfigurationsfehler: OpenAI API-Schlüssel fehlt. Bitte überprüfen Sie Ihre Umgebungsvariablen.',
    assistantErrorParse: 'Ich hatte Schwierigkeiten, diese Anfrage zu verstehen. Könnten Sie versuchen, sie umzuformulieren? Zum Beispiel:\n• "Fügen Sie einen Preisabschnitt hinzu"\n• "Ändern Sie die Hauptfarbe zu blau"\n• "Aktualisieren Sie den Haupttitel"',
    assistantErrorNetwork: 'Netzwerkfehler: Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
    assistantPlaceholderLoading: 'KI generiert Ihre Anfrage...',
    assistantPlaceholderReady: 'Fragen Sie mich alles über Ihre Dokumentation...',
    assistantTitleSend: 'Nachricht senden',
    assistantTitleType: 'Geben Sie eine Nachricht ein, um sie zu senden',
    assistantClearConversation: 'Konversation löschen',
    selectRepositories: 'Repositories Auswählen',
    selected: 'ausgewählt',
    close: 'Schließen',
    searchRepositories: 'Repositories suchen...',
    visibility: 'Sichtbarkeit:',
    all: 'Alle',
    public: 'Öffentlich',
    private: 'Privat',
    refresh: 'Aktualisieren',
    loadingRepositories: 'Repositories werden geladen...',
    noRepositoriesMatch: 'Keine Repositories entsprechen Ihrer Suche.',
    noRepositoriesFound: 'Keine Repositories gefunden.',
    lastPushed: 'Zuletzt aktualisiert:',
    repositoriesSelected: 'Repositories ausgewählt',
    repositorySelected: 'Repository ausgewählt',
    noRepositoriesSelected: 'Keine Repositories ausgewählt',
    selectAll: 'Alle Auswählen',
    selectAllFiltered: 'Alle gefilterten Repositories auswählen',
    allFilteredReposSelected: 'Alle gefilterten Repositories sind bereits ausgewählt',
    clearAll: 'Alle Löschen',
    done: 'Fertig',
    repositoryDiscovery: 'Repository-Entdeckung',
    repositoryAnalysis: 'Repository-Analyse',
    qualityAnalysis: 'Qualitätsanalyse',
    refactorProposal: 'Refaktorisierungsvorschlag',
    documentationPlanning: 'Dokumentationsplanung',
    documentationWriting: 'Dokumentationserstellung',
    gitOperations: 'Git-Operationen',
    complete: 'Abgeschlossen',
    running: 'Läuft...',
    processing: 'Verarbeitung:',
    completed: '✓ Abgeschlossen',
    error: 'Fehler:',
    automatedPipeline: 'Automatisierte Dokumentationsgenerierungs-Pipeline',
    outputFormats: 'Ausgabeformate',
    sectionTypes: 'Abschnittstypen',
    pleaseSelectAtLeastOneRepository: 'Bitte wählen Sie mindestens ein Repository aus',
    noWorkflowState: 'Kein Workflow-Zustand verfügbar',
    noDocumentationToCommit: 'Keine Dokumentation zum Committen',
    commitFailed: 'Commit fehlgeschlagen',
    generatedFeatures: 'Generierte Funktionen',
    workflowComplete: 'Workflow Abgeschlossen!',
    generatedDocumentationFor: 'Dokumentation generiert für',
    repository: 'Repository',
    repositories: 'Repositories',
    committedTo: 'Committet in',
    backTo: 'Zurück zu',
    cancel: 'Abbrechen',
    branch: 'Branch',
    commitMessage: 'Commit-Nachricht',
    scrollToTop: 'Nach oben scrollen',
    scrollToBottom: 'Nach unten scrollen',
    hideAiAssistant: 'KI-Assistenten ausblenden',
    showAiAssistant: 'KI-Assistenten anzeigen',
    enableAutoUpdate: 'Automatische Aktualisierung bei Push/Merge aktivieren',
    disableAutoUpdate: 'Automatische Aktualisierung deaktivieren',
    format: 'Format:',
    section: 'Abschnitt:',
    addDocumentation: 'Dokumentation hinzufügen',
    ownerRepoOrGithub: 'Eigentümer/Repository oder github.com/Eigentümer/Repository',
    ownerRepoPlaceholder: 'Eigentümer/Repository',
    keyFeatures: 'Hauptfunktionen',
    selectAndProcessMultiple: 'Mehrere Repositories in einem einzigen Vorgang auswählen und verarbeiten',
    eachRepositoryGetsOwn: 'Jedes Repository erhält seine eigene dedizierte Dokumentationsdatei',
    batchCommit: 'Stapel-Commit',
    commitToAllSelected: 'Dokumentation mit einem Klick in alle ausgewählten Repositories committen',
    howToUse: 'So Verwenden Sie Es',
    selectMultipleReposStep: '1. Mehrere Repositories Auswählen',
    clickSelectReposButton: 'Klicken Sie auf die Schaltfläche "Repositories auswählen", um in Ihren GitHub-Repositories zu suchen und auszuwählen. Sie können nach Sichtbarkeit suchen und filtern.',
    browseAndSelectFromGitHub: 'in Ihren GitHub-Repositories suchen und auswählen',
    searchAndFilterByVisibility: 'Sie können nach Sichtbarkeit suchen und filtern',
    chooseOutputFormatsSections: '2. Ausgabeformate & Abschnitte Wählen',
    selectOneOrMoreFormats: 'Wählen Sie ein oder mehrere Ausgabeformate',
    markdownMdxOpenapiHtml: '(Markdown, MDX, OpenAPI, HTML)',
    documentationSectionTypes: 'und Dokumentationsabschnittstypen',
    readmeArchitectureApi: '(README, Architektur, API, etc.)',
    runWorkflowStep: '3. Workflow Ausführen',
    clickRunWorkflowToStart: 'Klicken Sie auf "Workflow Ausführen", um den KI-Agent-Workflow zu starten',
    systemWillProcessEachRepo: 'Das System verarbeitet jedes Repository',
    throughDiscoveryAnalysisPlanning: 'durch Entdeckungs-, Analyse-, Planungs- und Schreibphasen',
    reviewCommitStep: '4. Überprüfen & Committen',
    reviewDocumentationInTabs: 'Überprüfen Sie die Dokumentation in separaten Tabs für jedes Repository',
    switchBetweenFormatsSections: 'Zwischen Formaten und Abschnitten wechseln',
    whenReadyClickCommitToRepos: 'Wenn Sie bereit sind, klicken Sie auf "In Repositories Committen"',
    commitAllAtOnce: 'um alles auf einmal zu committen',
    benefits: 'Vorteile',
    saveTimeProcessingMultiple: 'Sparen Sie Zeit, indem Sie mehrere Repositories gleichzeitig verarbeiten',
    maintainConsistentFormat: 'Konsistentes Dokumentationsformat über Projekte hinweg beibehalten',
    easyManagementWithTabs: 'Einfache Verwaltung mit Tab-Interface für jedes Repository',
    batchCommitFunctionality: 'Stapel-Commit-Funktionalität für effizienten Workflow',
    aiModels: 'KI-Modelle',
    gitScribeSupportsMultipleModels: 'GitScribe unterstützt mehrere OpenAI-Modelle',
    chooseBasedOnNeeds: 'Wählen Sie basierend auf Ihren Bedürfnissen',
    speedCostQuality: 'für Geschwindigkeit, Kosten und Qualität',
    gpt4oMiniRecommended: 'GPT-4o Mini (Empfohlen)',
    fastAndCostEffective: 'Schnell und kosteneffektiv für die meisten Dokumentationsaufgaben',
    bestBalanceSpeedQuality: 'Beste Balance aus Geschwindigkeit und Qualität',
    gpt4o: 'GPT-4o',
    mostAdvancedModel: 'Fortgeschrittenstes Modell',
    complexCodebases: 'für komplexe Codebasen',
    highestQualityHigherCost: 'Höchste Qualität, höhere Kosten',
    gpt4Turbo: 'GPT-4 Turbo',
    balancedPerformanceAccuracy: 'Ausgewogene Leistung und Genauigkeit',
    goodForLargeRepos: 'Gut für große Repositories',
    gpt35Turbo: 'GPT-3.5 Turbo',
    fastAndEconomical: 'Schnell und wirtschaftlich',
    simpleProjects: 'für einfache Projekte',
    lowestCostOption: 'Günstigste Option',
    youCanChangeModel: 'Sie können das Modell ändern',
    settingsPanel: 'im Einstellungsbereich',
    realtimeCostEstimation: 'Echtzeit-Kostenschätzung',
    statisticsSidebar: 'wird in der Statistik-Sidebar angezeigt',
    aiAssistant: 'KI-Assistent',
    aiAssistantFeature: 'Die KI-Assistent-Funktion ermöglicht es Ihnen',
    interactivelyEditImprove: 'Ihre Dokumentation interaktiv zu bearbeiten und zu verbessern',
    rewriteSectionsForClarity: 'Abschnitte für bessere Klarheit umschreiben',
    fixGrammarSpellingErrors: 'Grammatik- und Rechtschreibfehler korrigieren',
    addRemoveContentBasedOnNeeds: 'Inhalte basierend auf Ihren Bedürfnissen hinzufügen oder entfernen',
    restructureDocumentation: 'Dokumentation für besseren Fluss umstrukturieren',
    formatTextImproveReadability: 'Text formatieren und Lesbarkeit verbessern',
    costEstimation: 'Kostenschätzung',
    gitScribeProvidesRealtime: 'GitScribe bietet Echtzeit-Kostenschätzung',
    basedOn: 'basierend auf',
    selectedAiModelPricing: 'Preisgestaltung des ausgewählten KI-Modells',
    estimatedTokenUsage: 'Geschätzter Token-Verbrauch',
    documentationLengthComplexity: 'Dokumentationslänge und -komplexität',
    costsDisplayedInStatistics: 'Kosten werden angezeigt',
    duringGeneration: 'während der Generierung',
    github: 'GitHub',
    exportDocumentation: 'Dokumentation Exportieren',
    exportDocumentationDescription: 'Exportieren Sie Ihre generierte Dokumentation in mehreren Formaten, einschließlich Markdown, HTML, PDF und mehr. Laden Sie Dokumentationsdateien herunter oder committen Sie sie direkt in Ihre GitHub-Repositories.',
    downloadGeneratedDocumentation: 'Laden Sie Ihre generierte Dokumentation in mehreren Formaten für die Verwendung in Dokumentationsseiten, Wikis oder Versionskontrollsystemen herunter.',
    exportFormats: 'Exportformate',
    markdownStandardFormat: 'Markdown - Standard .md Format für GitHub, GitLab und Dokumentationsseiten',
    markdownMermaidDescription: 'Markdown + Mermaid - Markdown mit KI-generierten Diagrammen',
    mdxDescription: 'MDX - Markdown mit JSX-Komponenten für interaktive Dokumentation',
    openapiDescription: 'OpenAPI - YAML-Format für API-Dokumentation',
    htmlDescription: 'HTML - Vollständig gestylte HTML-Seiten bereit für die Bereitstellung',
    eachFormatGenerated: 'Jedes Format wird mit abschnittsspezifischem Inhalt generiert, der auf die ausgewählten Abschnittstypen zugeschnitten ist.',
    commitToRepository: 'In Repository Committen',
    automaticallyCommitDocumentation: 'Committen Sie automatisch generierte Dokumentation direkt in Ihre GitHub-Repositories. Perfekt, um die Dokumentation mit Ihrer Codebasis synchron zu halten.',
    howItWorks: 'Wie Es Funktioniert',
    runWorkflowGenerate: 'Führen Sie den Workflow aus, um Dokumentation für Ihr(e) Repository(s) zu generieren',
    reviewGeneratedDocumentation: 'Überprüfen Sie die generierte Dokumentation im Viewer',
    clickCommitToRepos: 'Klicken Sie auf die Schaltfläche "In Repositories Committen" (erscheint nach Abschluss des Workflows)',
    enterCommitMessage: 'Geben Sie eine Commit-Nachricht ein (z.B. "docs: Umfassende Dokumentation hinzufügen")',
    specifyTargetBranch: 'Geben Sie den Zielbranch an (Standard: main)',
    documentationCommitted: 'Die Dokumentation wird mit dem ausgewählten Format und den Abschnittstypen committet',
    workflowStopsAfterGeneration: 'Der Workflow stoppt nach der Generierung, sodass Sie vor dem Committen überprüfen können.',
    controlOverCommits: 'Dies stellt sicher, dass Sie die Kontrolle darüber haben, was in Ihre Repositories committet wird.',
    whenWorkingWithMultiple: 'Bei der Arbeit mit mehreren Repositories erhält jedes Repository seine eigenen dedizierten Dokumentationsdateien basierend auf Ihren ausgewählten Formaten und Abschnitten.',
    eachRepositoryReceives: 'Jedes Repository erhält seine eigenen dedizierten Dokumentationsdateien basierend auf Ihren ausgewählten Formaten und Abschnitten.',
    commitOperationProcesses: 'Die Commit-Operation verarbeitet alle ausgewählten Repositories stapelweise.',
    documentationStoredSeparately: 'Die Dokumentation jedes Repositories wird separat gespeichert und im richtigen Repository committet.',
    autoUpdateFeature: 'Auto-Update-Funktion',
    enableAutoUpdateDescription: 'Aktivieren Sie Auto-Update, um die Dokumentation automatisch zu regenerieren und zu committen, wenn Ihr Repository neue Commits oder Merges zur Hauptbranch erhält.',
    automaticUpdates: 'Automatische Updates',
    monitorsRepositories: 'Überwacht Repositories alle 5 Minuten',
    detectsPushesMerges: 'Erkennt Pushes und Merges zur Hauptbranch',
    automaticallyRegenerates: 'Regeneriert automatisch die Dokumentation',
    commitsUpdatedDocumentation: 'Committet aktualisierte Dokumentation mit Zeitstempel',
    multiRepoOverview: 'Die Multi-Repository-Unterstützung von GitScribe ermöglicht es Ihnen, mehrere GitHub-Repositories gleichzeitig zu verarbeiten und spart Zeit und Aufwand bei der Dokumentation mehrerer Projekte.',
    completeGuideToUsing: 'Vollständiger Leitfaden zur Verwendung von GitScribe',
    welcomeToGitScribe: 'Willkommen bei GitScribe! Ein KI-gestütztes Dokumentationsgenerierungstool, das automatisch umfassende Dokumentation für Ihre GitHub-Repositories mit fortgeschrittenen KI-Agent-Workflows erstellt.',
    aiPoweredDocumentationTool: 'KI-gestütztes Dokumentationsgenerierungstool',
    quickStart: 'Schnellstart',
    addOpenAiKey: 'Fügen Sie Ihren OpenAI API-Schlüssel in den Einstellungen hinzu',
    optionalAddGitHubToken: '(Optional) Fügen Sie ein GitHub Personal Access Token für private Repos hinzu',
    enterRepositoryUrlOrSelect: 'Geben Sie eine GitHub-Repository-URL ein oder wählen Sie mehrere Repositories aus',
    clickRunWorkflowStart: 'Klicken Sie auf "Workflow Ausführen", um den KI-Agent-Workflow zu starten',
    reviewEditCommit: 'Überprüfen Sie die generierte Dokumentation, bearbeiten Sie sie mit dem KI-Assistenten und committen Sie',
    coreFeatures: 'Kernfunktionen',
    directIntegration: 'Direkte Integration mit der GitHub-API für Repository-Zugriff und Commits',
    processMultipleRepos: 'Verarbeiten Sie mehrere Repositories gleichzeitig mit Stapeloperationen',
    intelligentAgentSystem: 'Intelligentes Agentensystem für automatisierte Dokumentationsgenerierung',
    multipleOutputFormats: 'Mehrere Ausgabeformate und direkte GitHub-Commits',
    outputFormatsDescription: 'GitScribe unterstützt mehrere Dokumentationsformate für verschiedene Bedürfnisse:',
    standardMarkdownFormat: 'Standard-Markdown-Format für GitHub, GitLab und Dokumentationsseiten',
    markdownWithDiagrams: 'Markdown mit KI-generierten Mermaid-Diagrammen für Architektur und Flows',
    markdownWithJsx: 'Markdown mit JSX-Komponenten für interaktive Dokumentation',
    yamlFormatForApi: 'YAML-Format für API-Dokumentation mit Endpoint-Spezifikationen',
    fullyStyledHtml: 'Vollständig gestylte HTML-Seiten bereit für die Bereitstellung',
    documentationSections: 'Dokumentationsabschnitte',
    generateDifferentTypes: 'Generieren Sie verschiedene Arten von Dokumentationsabschnitten:',
    readmeDescription: 'README - Projektübersicht, Installation, Verwendung und Funktionen',
    architectureDescription: 'Architektur - Systemdesign, Komponentenstruktur und Datenfluss',
    apiReferenceDescription: 'API-Referenz - Endpoint-Dokumentation, Request/Response-Schemas',
    componentsDescription: 'Komponenten - Komponentendokumentation mit Props und Verwendungsbeispielen',
    testingCicdDescription: 'Tests & CI/CD - Test-Setup, CI/CD-Pipeline und Bereitstellung',
    changelogDescription: 'Changelog - Versionsverlauf und Release-Notes',
    aiAgentWorkflow: 'KI-Agent-Workflow',
    gitScribeUsesIntelligent: 'GitScribe verwendet ein intelligentes Agentensystem, das Repositories in mehreren Phasen verarbeitet:',
    repoDiscovery: 'RepoDiscovery',
    validatesAndDiscovers: '- Validiert und entdeckt Repositories',
    repoAnalysis: 'RepoAnalysis',
    analyzesStructure: '- Analysiert Struktur, Tech-Stack und Komplexität',
    docsPlanner: 'DocsPlanner',
    createsStructuredPlan: '- Erstellt einen strukturierten Dokumentationsplan',
    docsWriter: 'DocsWriter',
    generatesDocumentation: '- Generiert Dokumentation in ausgewählten Formaten',
    learnMore: 'Mehr Erfahren',
    exploreOtherPages: 'Erkunden Sie die anderen Seiten in diesem Dokumentationsabschnitt für detaillierte Informationen zu jeder Funktion und wie Sie sie effektiv verwenden.',
    aiPoweredOverview: 'GitScribe nutzt die fortgeschrittenen Sprachmodelle von OpenAI, um Ihre Codebasis zu analysieren und umfassende, gut strukturierte Dokumentation zu generieren. Unsere KI versteht Code-Kontext, Beziehungen und Best Practices, um Dokumentation zu erstellen, die sowohl genau als auch lesbar ist.',
    gitScribeUsesOpenAI: 'GitScribe nutzt die fortgeschrittenen Sprachmodelle von OpenAI',
    completeApiDocumentation: 'Vollständige API-Dokumentation für Entwickler',
    agentWorkflowSystem: 'Agent-Workflow-System',
    gitScribeUsesLangGraph: 'GitScribe nutzt ein LangGraph-ähnliches Agentensystem für die automatisierte Dokumentationsgenerierung:',
    agentWorkflowSteps: '// Agent-Workflow-Schritte',
    agentState: 'Agent-Status',
    workflowMaintainsSharedState: 'Der Workflow verwaltet einen gemeinsamen Status zwischen Agenten, einschließlich:',
    discoveredRepositories: 'Entdeckte Repositories',
    repositoryAnalyses: 'Repository-Analysen',
    documentationPlans: 'Dokumentationspläne',
    generatedDocumentationByFormat: 'Generierte Dokumentation (nach Format und Abschnitt)',
    commitResults: 'Commit-Ergebnisse',
    githubService: 'GitHub-Service',
    langChainService: 'LangChain-Service',
    typeDefinitions: 'Typdefinitionen',
    exampleUseCases: 'Beispiel-Anwendungsfälle und Workflows',
    example1SingleRepository: 'Beispiel 1: Einzelnes Repository',
    scenario: 'Szenario',
    youWantToGenerate: 'Sie möchten umfassende Dokumentation für ein einzelnes React-Projekt mit mehreren Formaten generieren.',
    steps: 'Schritte',
    enterGitHubRepositoryUrl: 'GitHub-Repository-URL eingeben:',
    selectOutputFormatsEg: 'Ausgabeformate auswählen (z.B. Markdown, MDX, HTML)',
    selectSectionTypesEg: 'Abschnittstypen auswählen (z.B. README, Architektur, API)',
    watchWorkflowProgress: 'Beobachten Sie den Workflow-Fortschritt durch Entdeckung, Analyse, Planung und Schreiben',
    reviewGeneratedDocumentationSwitch: 'Überprüfen Sie die generierte Dokumentation, wechseln Sie zwischen Formaten und Abschnitten',
    clickCommitToReposWhenReady: 'Klicken Sie auf "In Repositories Committen", wenn Sie bereit sind zu committen',
    example2MultipleRepositories: 'Beispiel 2: Mehrere Repositories',
    youManageMultipleMicroservices: 'Sie verwalten mehrere Microservices und möchten sie alle auf einmal mit konsistentem Format dokumentieren.',
    clickSelectRepositories: 'Klicken Sie auf "Repositories auswählen" und wählen Sie mehrere Repos aus Ihrem GitHub-Konto aus',
    selectOutputFormatsEgOpenAPI: 'Ausgabeformate auswählen (z.B. Markdown + OpenAPI für API-Dokumentation)',
    monitorWorkflowProgress: 'Überwachen Sie den Workflow-Fortschritt für jedes Repository',
    reviewEachRepositoryDocumentation: 'Überprüfen Sie die Dokumentation jedes Repositories in separaten Tabs',
    switchBetweenFormatsSectionsForEach: 'Wechseln Sie zwischen Formaten und Abschnitten für jedes Repo',
    commitAllRepositoriesAtOnce: 'Committen Sie alle Repositories auf einmal mit "In Repositories Committen"',
    example3AutoUpdateWorkflow: 'Beispiel 3: Auto-Update-Workflow',
    youWantDocumentationToAutoUpdate: 'Sie möchten, dass die Dokumentation automatisch aktualisiert wird, wenn sich der Code ändert.',
    selectRepositoriesInMultiRepoMode: 'Repositories im Multi-Repo-Modus auswählen',
    enableAutoUpdateForEach: 'Auto-Update für jedes Repository aktivieren (Glocken-Symbol)',
    toggleGlobalAutoUpdateSwitch: 'Globalen Auto-Update-Schalter umschalten',
    documentationWillAutoUpdate: 'Die Dokumentation wird bei jedem Push/Merge zu main automatisch aktualisiert',
    example4UsingAiAssistant: 'Beispiel 4: KI-Assistent verwenden',
    youWantToImproveDocumentation: 'Sie möchten die generierte Dokumentation mit KI-Hilfe verbessern.',
    examplePrompts: 'Beispiel-Prompts',
    addSectionExplainingInstallation: '"Fügen Sie einen Abschnitt hinzu, der den Installationsprozess erklärt"',
    makeApiDocumentationMoreDetailed: '"Machen Sie den API-Dokumentationsabschnitt detaillierter"',
    fixAllGrammarErrors: '"Korrigieren Sie alle Grammatikfehler"',
    restructureDocumentationForBetterFlow: '"Strukturieren Sie die Dokumentation für einen besseren Fluss um"',
    needHelp: 'Brauchen Sie Hilfe?',
    wereHereToHelp: 'Wir sind hier, um zu helfen! Wenn Sie Probleme haben oder Fragen zu GitScribe haben, finden Sie hier die besten Möglichkeiten, Unterstützung zu erhalten.',
    contactOptions: 'Kontaktoptionen',
    emailSupport: 'E-Mail-Support',
    getDirectHelpViaEmail: 'Erhalten Sie direkte Hilfe per E-Mail',
    githubIssues: 'GitHub-Issues',
    reportBugsOrRequestFeatures: 'Fehler melden oder Funktionen anfordern',
    openAnIssue: 'Ein Issue öffnen',
    commonIssues: 'Häufige Probleme',
    openaiApiKeyError: 'OpenAI API-Schlüssel-Fehler',
    addOpenAiKeyInSettings: 'Fügen Sie Ihren OpenAI API-Schlüssel im Einstellungsbereich hinzu. Klicken Sie auf das Einstellungssymbol, geben Sie Ihren Schlüssel ein und klicken Sie auf "Änderungen Speichern".',
    githubRateLimiting: 'GitHub-Ratenbegrenzung',
    addGitHubTokenInSettings: 'Fügen Sie ein GitHub Personal Access Token im Einstellungsbereich hinzu, um Ratenbegrenzungen zu erhöhen und auf private Repositories zuzugreifen.',
    requiredScopeRepo: 'Erforderlicher Bereich:',
    workflowNotStarting: 'Workflow startet nicht',
    ensureYouHaveSelected: 'Stellen Sie sicher, dass Sie mindestens ein Ausgabeformat und einen Abschnittstyp ausgewählt haben. Die Schaltfläche "Workflow Ausführen" erfordert, dass beide aktiviert sind.',
    documentationNotCommitting: 'Dokumentation wird nicht committet',
    makeSureGitHubTokenHasRepoScope: 'Stellen Sie sicher, dass Ihr GitHub-Token den',
    checkOutComprehensiveDocumentation: 'Schauen Sie sich unsere umfassende Dokumentation für detaillierte Anleitungen und API-Referenzen an.',
    howWeProtectAndHandle: 'Wie wir Ihre Daten schützen und verwalten',
    lastUpdated: 'Zuletzt aktualisiert:',
    introduction: 'Einführung',
    gitScribeCommittedToPrivacy: 'GitScribe ("wir", "unser" oder "uns") ist dem Schutz Ihrer Privatsphäre verpflichtet. Diese Datenschutzrichtlinie erklärt, wie wir Ihre Informationen sammeln, verwenden und schützen, wenn Sie unseren Service nutzen.',
    informationWeCollect: 'Informationen, die wir sammeln',
    personalInformation: 'Persönliche Informationen',
    weMayCollectPersonalInfo: 'Wir können persönliche Informationen wie E-Mail-Adressen sammeln, wenn Sie ein Konto erstellen oder uns für Support kontaktieren.',
    githubTokens: 'GitHub-Tokens',
    githubTokensStoredLocally: 'GitHub Personal Access Tokens werden lokal im localStorage Ihres Browsers gespeichert. Wir übertragen oder speichern diese Tokens nicht auf unseren Servern.',
    usageData: 'Nutzungsdaten',
    weMayCollectUsageData: 'Wir können Informationen darüber sammeln, wie Sie unseren Service nutzen, einschließlich Repository-URLs und Dokumentationsgenerierungspräferenzen.',
    howWeUseYourInformation: 'Wie wir Ihre Informationen verwenden',
    toProvideAndImprove: 'Um unseren Dokumentationsgenerierungsservice bereitzustellen und zu verbessern',
    toProcessYourRequests: 'Um Ihre Anfragen zu verarbeiten und Dokumentation zu generieren',
    toCommunicateWithYou: 'Um mit Ihnen über Ihr Konto oder Support-Anfragen zu kommunizieren',
    toAnalyzeUsagePatterns: 'Um Nutzungsmuster zu analysieren und unseren Service zu verbessern',
    dataSecurity: 'Datensicherheit',
    weImplementSecurityMeasures: 'Wir implementieren angemessene Sicherheitsmaßnahmen zum Schutz Ihrer Informationen. GitHub-Tokens werden lokal in Ihrem Browser gespeichert und niemals an unsere Server übertragen. Alle API-Kommunikationen werden mit HTTPS verschlüsselt.',
    thirdPartyServices: 'Drittanbieter-Services',
    weUseFollowingThirdParty: 'Wir verwenden die folgenden Drittanbieter-Services:',
    openaiForAiPowered: 'OpenAI: Für KI-gestützte Dokumentationsgenerierung mit GPT-Modellen',
    githubForRepositoryAccess: 'GitHub: Für Repository-Zugriff, Dateioperationen und Commits über die GitHub-API',
    localStorageForStoring: 'LocalStorage: Zum lokalen Speichern von Benutzereinstellungen, Tokens und Projektverlauf in Ihrem Browser',
    allDataStoredLocally: 'Alle Daten werden lokal in Ihrem Browser gespeichert. GitHub-Tokens und API-Schlüssel werden niemals an unsere Server übertragen.',
    yourRights: 'Ihre Rechte',
    youHaveRightToAccess: 'Sie haben das Recht, auf Ihre persönlichen Informationen zuzugreifen, sie zu aktualisieren oder zu löschen. Sie können Ihre Kontoeinstellungen verwalten oder uns kontaktieren unter',
    contactUsPrivacy: 'Kontaktieren Sie uns',
    ifYouHaveQuestionsPrivacy: 'Wenn Sie Fragen zu dieser Datenschutzrichtlinie haben, kontaktieren Sie uns bitte unter',
    termsAndConditions: 'Nutzungsbedingungen für GitScribe',
    agreementToTerms: 'Zustimmung zu den Bedingungen',
    byAccessingOrUsing: 'Durch den Zugriff auf oder die Nutzung von GitScribe ("der Service") stimmen Sie zu, an diese Nutzungsbedingungen gebunden zu sein. Wenn Sie mit einem Teil dieser Bedingungen nicht einverstanden sind, dürfen Sie möglicherweise nicht auf den Service zugreifen.',
    useOfService: 'Nutzung des Services',
    eligibility: 'Berechtigung',
    youMustBeAtLeast18: 'Sie müssen mindestens 18 Jahre alt sein oder die Zustimmung der Eltern haben, um diesen Service zu nutzen.',
    accountResponsibility: 'Kontoverantwortung',
    youAreResponsibleForMaintaining: 'Sie sind verantwortlich für die Sicherheit Ihres Kontos und aller API-Schlüssel oder Tokens, die Sie mit dem Service verwenden.',
    acceptableUse: 'Akzeptable Nutzung',
    youAgreeNotTo: 'Sie stimmen zu, nicht:',
    useServiceForIllegalPurpose: 'Den Service für illegale Zwecke zu nutzen',
    violateLawsOrRegulations: 'Gesetze oder Vorschriften zu verletzen',
    infringeOnIntellectualProperty: 'Geistiges Eigentum zu verletzen',
    transmitMaliciousCode: 'Bösartigen Code oder Viren zu übertragen',
    attemptUnauthorizedAccess: 'Unbefugten Zugriff auf den Service zu erlangen',
    apiUsageAndCosts: 'API-Nutzung und Kosten',
    gitScribeUsesOpenAIApi: 'GitScribe nutzt die OpenAI-API für KI-gestützte Funktionen. Sie sind verantwortlich für:',
    youAreResponsibleFor: 'Sie sind verantwortlich für:',
    providingYourOwnOpenAiKey: 'Bereitstellung Ihres eigenen OpenAI API-Schlüssels',
    allCostsAssociated: 'Alle mit der API-Nutzung verbundenen Kosten',
    managingYourApiKeySecurity: 'Verwaltung der Sicherheit Ihres API-Schlüssels',
    intellectualProperty: 'Geistiges Eigentum',
    serviceOwnedByGitScribe: 'Der Service und sein ursprünglicher Inhalt, Funktionen und Funktionalität gehören GitScribe und sind durch internationale Urheberrechts-, Marken- und andere Gesetze zum geistigen Eigentum geschützt.',
    limitationOfLiability: 'Haftungsbeschränkung',
    gitScribeProvidedAsIs: 'GitScribe wird "wie besehen" ohne Gewährleistung jeglicher Art bereitgestellt. Wir haften nicht für Schäden, die aus Ihrer Nutzung des Services entstehen, einschließlich, aber nicht beschränkt auf Datenverlust, Dokumentationsfehler oder API-Kosten.',
    changesToTerms: 'Änderungen der Bedingungen',
    weReserveRightToModify: 'Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Die fortgesetzte Nutzung des Services nach Änderungen stellt eine Annahme der neuen Bedingungen dar.',
    contactTerms: 'Kontakt',
    forQuestionsAboutTerms: 'Bei Fragen zu diesen Bedingungen kontaktieren Sie uns unter',
    howWeUseCookies: 'Wie wir Cookies und ähnliche Technologien verwenden',
    whatAreCookies: 'Was sind Cookies',
    cookiesAreSmallTextFiles: 'Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie eine Website besuchen. Sie helfen Websites, sich an Ihre Präferenzen zu erinnern und Ihr Browsing-Erlebnis zu verbessern.',
    howWeUseCookiesTitle: 'Wie wir Cookies verwenden',
    essentialCookies: 'Wesentliche Cookies',
    theseCookiesAreNecessary: 'Diese Cookies sind für die Funktionalität des Services erforderlich. Sie umfassen Authentifizierungstokens und Sitzungsinformationen.',
    preferenceCookies: 'Präferenz-Cookies',
    weUseLocalStorageToStore: 'Wir verwenden localStorage, um Ihre Präferenzen zu speichern, wie z.B. GitHub-Tokens und UI-Einstellungen. Diese Daten werden lokal in Ihrem Browser gespeichert und niemals an unsere Server übertragen.',
    analyticsCookies: 'Analyse-Cookies',
    weMayUseAnalyticsCookies: 'Wir können Analyse-Cookies verwenden, um zu verstehen, wie Benutzer mit unserem Service interagieren und unsere Funktionen zu verbessern.',
    localStorageUsage: 'LocalStorage-Nutzung',
    gitScribeUsesBrowserLocalStorage: 'GitScribe verwendet Browser-LocalStorage (nicht Cookies) zum Speichern von:',
    githubPersonalAccessTokensEncrypted: 'GitHub Personal Access Tokens (lokal verschlüsselt)',
    userPreferencesAndSettings: 'Benutzereinstellungen und Präferenzen',
    autoFollowRepositoryConfigurations: 'Auto-Follow-Repository-Konfigurationen',
    thisDataRemainsOnDevice: 'Diese Daten verbleiben auf Ihrem Gerät und werden niemals mit Dritten geteilt.',
    managingCookies: 'Cookies verwalten',
    youCanControlCookies: 'Sie können Cookies über Ihre Browser-Einstellungen steuern. Das Deaktivieren wesentlicher Cookies kann jedoch die Funktionalität des Services beeinträchtigen.',
    toClearLocalStorageData: 'Um LocalStorage-Daten zu löschen, können Sie die Entwicklertools Ihres Browsers verwenden oder Browsing-Daten löschen.',
    thirdPartyCookies: 'Drittanbieter-Cookies',
    weMayUseThirdPartyServices: 'Wir können Drittanbieter-Services verwenden, die ihre eigenen Cookies setzen. Diese Services umfassen:',
    analyticsProviders: 'Analyse-Anbieter (falls zutreffend)',
    contactCookiePolicy: 'Kontakt',
    forQuestionsAboutCookiePolicy: 'Bei Fragen zu unserer Cookie-Richtlinie kontaktieren Sie uns unter',
    pageNotFound: 'Seite nicht gefunden',
    theRequestedPageCouldNotBeFound: 'Die angeforderte Seite konnte nicht gefunden werden',
    thePageYoureLookingForDoesntExist: 'Die Seite, die Sie suchen, existiert nicht.',
    formatMarkdown: 'Markdown',
    formatMarkdownMermaid: 'Markdown + Mermaid',
    formatMdx: 'MDX',
    formatOpenapi: 'OpenAPI',
    formatHtml: 'HTML',
    sectionReadme: 'README',
    sectionArchitecture: 'Architektur',
    sectionApiReference: 'API-Referenz',
    sectionComponents: 'Komponenten',
    sectionTestingCicd: 'Tests & CI/CD',
    sectionChangelog: 'Changelog',
    sectionReadmeShort: 'README',
    sectionArchitectureShort: 'ARCH',
    sectionApiReferenceShort: 'API',
    sectionComponentsShort: 'COMP',
    sectionTestingCicdShort: 'TEST',
    sectionChangelogShort: 'CHG',
    aiPoweredDocumentationGenerationForGitHub: 'KI-gestützte Dokumentationsgenerierung für GitHub-Repositories',
    requiredForAiPoweredDocumentationGeneration: 'Erforderlich für KI-gestützte Dokumentationsgenerierung.',
    functionFetchUserRepos: 'fetchUserRepos',
    functionCreateOrUpdateFile: 'createOrUpdateFile',
    functionCallLangChain: 'callLangChain',
    typeSimpleRepo: 'SimpleRepo',
    typeDocOutputFormat: 'DocOutputFormat',
    typeDocSectionType: 'DocSectionType',
    pleaseProvideCommitMessage: 'Bitte geben Sie eine Commit-Nachricht an',
    githubTokenRequiredForCommitting: 'GitHub-Token ist für das Committen von Dateien erforderlich',
    documentationNotFoundForRepository: 'Dokumentation für dieses Repository nicht gefunden. Bitte generieren Sie zuerst die Dokumentation.',
    successfullyCommittedToRepository: 'Dokumentation erfolgreich in 1 Repository committet!',
    successfullyCommittedToRepositories: 'Dokumentation erfolgreich in {count} Repositories committet!',
    failedToCommitToRepository: 'Fehler beim Committen in 1 Repository',
    failedToCommitToRepositories: 'Fehler beim Committen in {count} Repositories',
    failedToCommitDocumentation: 'Fehler beim Committen der Dokumentation',
    documentationHelper: 'Dokumentationsassistent',
    clearConversationHistoryConfirm: 'Konversationsverlauf löschen?',
    readyToHelp: 'Bereit zu helfen!',
    iCanHelpEditDocumentation: 'Ich kann Ihnen beim Bearbeiten und Verbessern Ihrer Dokumentation helfen',
    editSections: 'Abschnitte bearbeiten',
    improveClarity: 'Klarheit verbessern',
    fixGrammar: 'Grammatik korrigieren',
    aiIsThinking: 'KI denkt nach...',
    send: 'Senden',
    beSpecificForBetterResults: 'Seien Sie spezifisch für bessere Ergebnisse',
    pressEnterToSend: 'Drücken Sie Enter zum Senden',
    errorEditingDocumentation: 'Fehler beim Bearbeiten der Dokumentation',
    unknownErrorOccurred: 'Unbekannter Fehler aufgetreten',
    workflowFailed: 'Workflow fehlgeschlagen',
    viewCommit: 'Commit anzeigen',
    repositoryQualityScores: 'Repository-Qualitätsbewertungen',
    folderStructureRefactorProposals: 'Ordnerstruktur-Refaktorisierungsvorschläge',
    recommendedStructure: 'Empfohlene Struktur:',
    proposedMoves: 'Vorgeschlagene Verschiebungen',
    moreMoves: 'weitere Verschiebungen...',
    warnings: 'Warnungen',
    generatedRepositoryBadges: 'Generierte Repository-Badges',
    badgeMarkdownCopiedToClipboard: 'Badge-Markdown in die Zwischenablage kopiert!',
    copyBadgeMarkdown: 'Badge-Markdown kopieren',
    pdfExportFailed: 'PDF-Export fehlgeschlagen',
  },
};

/**
 * Get translation for a key in the specified language
 */
export function t(key: TranslationKey, language: DocLanguage = 'en'): string {
  return translations[language]?.[key] || translations.en[key] || key;
}

/**
 * Translation hook for React components
 */
export function useTranslation(language: DocLanguage) {
  return (key: TranslationKey) => t(key, language);
}
