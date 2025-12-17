import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Heart, MessageCircle, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <motion.header 
        className="glass sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="p-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Flame className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-black gradient-text">{t('gitScribe')}</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Language Selector */}
            <motion.select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as DocLanguage)}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl glass text-slate-700 hover:bg-white/90 border border-slate-200/50 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              title="Translate page"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
            </motion.select>
          </motion.div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div 
                className="mb-6 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.div 
                  className="h-1.5 w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: 64 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
                <span className="text-orange-600 font-bold text-sm uppercase tracking-wide">{t('aiPowered')}</span>
              </motion.div>

              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <span className="gradient-text">{t('aiPoweredDocumentationTitle')}</span>
              </motion.h1>

              <motion.p 
                className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {t('aiPoweredDocumentationDescription')}
              </motion.p>

              <motion.div 
                className="space-y-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {[
                  { icon: Flame, title: t('githubIntegration'), desc: t('githubIntegrationDescription') },
                  { icon: Heart, title: t('multiRepoSupport'), desc: t('multiRepoSupportDescription') },
                  { icon: MessageCircle, title: t('autoCommitExport'), desc: t('autoCommitExportDescription') }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <motion.div 
                      className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl shadow-sm"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <item.icon className="w-6 h-6 text-orange-600" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-orange-200/50 to-red-200/50 rounded-3xl blur-3xl opacity-60"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.6, 0.7, 0.6]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="relative card-gradient p-8 lg:p-10"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('readyToStart')}</h2>
                  <p className="text-gray-600 mt-1">{t('generateDocumentationFromRepos')}</p>
                  <motion.div 
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-700"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>✨</span>
                    <span>{t('noAccountNeeded')}</span>
                  </motion.div>
                </motion.div>

                <div className="space-y-4">
                  <motion.button
                    onClick={onGenerate}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 40px rgba(249, 115, 22, 0.5)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    {t('startWritingDocumentation')}
                  </motion.button>
                  
                  <motion.p 
                    className="text-xs text-gray-500 text-center mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    ✨ {t('aiPoweredDocumentationGenerationForGitHub')}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 lg:py-24 border-t border-gray-200/50">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              <span className="gradient-text">{t('whyChooseOurTool')}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('whyChooseOurToolDescription')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: Zap, title: t('aiAgentWorkflows'), desc: t('aiAgentWorkflowsDescription'), color: 'orange' },
              { icon: MessageCircle, title: t('githubIntegrationFeature'), desc: t('githubIntegrationFeatureDescription'), color: 'orange' }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="group card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <motion.div 
                  className={`relative mb-6 h-40 bg-gradient-to-br from-${item.color}-50 to-${item.color === 'orange' ? 'red' : 'orange'}-50 rounded-2xl overflow-hidden flex items-center justify-center shadow-md`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <item.icon className={`w-16 h-16 text-${item.color}-500`} />
                  </motion.div>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-20 lg:py-24">
          <motion.div 
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 lg:p-12 text-center text-white relative overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Flame className="w-32 h-32 absolute top-0 right-0" />
              </motion.div>
              <motion.div
                animate={{ 
                  rotate: [360, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                  scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Heart className="w-24 h-24 absolute bottom-0 left-0" />
              </motion.div>
            </div>
            <motion.div 
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h2 className="text-4xl font-black mb-4">{t('readyToGetStarted')}</h2>
              <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                {t('joinDevelopers')}
              </p>
              <motion.button
                onClick={onGenerate}
                className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg inline-block flex items-center gap-2 mx-auto shadow-xl hover:shadow-2xl"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 40px rgba(255, 255, 255, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                {t('startGeneratingDocumentation')}
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        <Footer onNavigate={(page) => {
          // This will be handled by App.tsx via custom event
          window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
        }} />
      </main>
    </div>
  );
}
