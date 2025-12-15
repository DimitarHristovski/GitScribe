import { useState, useEffect } from 'react';
import { Sparkles, Flame, Heart, MessageCircle, Zap, GitBranch } from 'lucide-react';
import Footer from '../components/Footer';
import { useTranslation } from '../lib/translations';
import { DocLanguage } from '../types/core';

interface LandingProps {
  onGenerate: () => void;
}

export default function Landing({ onGenerate }: LandingProps) {
  // Get language from localStorage or default to 'en'
  const [selectedLanguage, setSelectedLanguage] = useState<DocLanguage>(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return (saved as DocLanguage) || 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
    // Dispatch custom event so Assistant component can react to language changes
    window.dispatchEvent(new Event('languageChanged'));
  }, [selectedLanguage]);

  const t = useTranslation(selectedLanguage);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{t('gitScribe')}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as DocLanguage)}
              className="px-3 py-2 text-sm font-semibold rounded-xl bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white border border-slate-200 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              title="Translate page"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        <section className="py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                <span className="text-orange-600 font-semibold text-sm">{t('aiPowered')}</span>
              </div>

              <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight">
                {t('aiPoweredDocumentationTitle')}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t('aiPoweredDocumentationDescription')}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('githubIntegration')}</p>
                    <p className="text-gray-600">{t('githubIntegrationDescription')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Heart className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('multiRepoSupport')}</p>
                    <p className="text-gray-600">{t('multiRepoSupportDescription')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t('autoCommitExport')}</p>
                    <p className="text-gray-600">{t('autoCommitExportDescription')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-red-100 rounded-3xl blur-2xl opacity-50"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('readyToStart')}</h2>
                  <p className="text-gray-600 mt-1">{t('generateDocumentationFromRepos')}</p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700">
                    <span>✨</span>
                    <span>{t('noAccountNeeded')}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={onGenerate}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    {t('startWritingDocumentation')}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-4">
                    ✨ {t('aiPoweredDocumentationGenerationForGitHub')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-t border-gray-100">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              {t('whyChooseOurTool')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('whyChooseOurToolDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <div className="relative mb-6 h-40 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl overflow-hidden flex items-center justify-center">
                <Zap className="w-16 h-16 text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('aiAgentWorkflows')}</h3>
              <p className="text-gray-600">
                {t('aiAgentWorkflowsDescription')}
              </p>
            </div>

            <div className="group">
              <div className="relative mb-6 h-40 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl overflow-hidden flex items-center justify-center">
                <GitBranch className="w-16 h-16 text-red-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('autoUpdateFollow')}</h3>
              <p className="text-gray-600">
                {t('autoUpdateFollowDescription')}
              </p>
            </div>

            <div className="group">
              <div className="relative mb-6 h-40 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl overflow-hidden flex items-center justify-center">
                <MessageCircle className="w-16 h-16 text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('githubIntegrationFeature')}</h3>
              <p className="text-gray-600">
                {t('githubIntegrationFeatureDescription')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <Flame className="w-32 h-32 absolute top-0 right-0" />
              <Heart className="w-24 h-24 absolute bottom-0 left-0" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4">{t('readyToGetStarted')}</h2>
              <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                {t('joinDevelopers')}
              </p>
              <button
                onClick={onGenerate}
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 inline-block flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                {t('startGeneratingDocumentation')}
              </button>
            </div>
          </div>
        </section>

        <Footer onNavigate={(page) => {
          // This will be handled by App.tsx via custom event
          window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
        }} />
      </main>
    </div>
  );
}
