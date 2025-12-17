import { useState, useEffect } from 'react';
import { Flame, Github, Mail, Heart } from 'lucide-react';
import { useTranslation } from '../lib/translations';
import { DocLanguage } from '../types/core';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    } else {
      // Fallback: use window location or state management
      window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
    }
  };

  return (
    <footer className="bg-gradient-to-br from-white to-slate-50 border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black gradient-text">{t('gitScribe')}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {t('footerDescription')}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span>{t('madeWith')}</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>{t('forDevelopers')}</span>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h3 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">{t('features')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleLinkClick(e, 'github-integration')}
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  {t('githubIntegration')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleLinkClick(e, 'multi-repo-support')}
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  {t('multiRepoSupport')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleLinkClick(e, 'ai-powered-generation')}
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  {t('aiPoweredGeneration')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleLinkClick(e, 'export-commit')}
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  {t('export')} & {t('commit')}
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">{t('resources')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleLinkClick(e, 'documentation-page')}
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  {t('documentation')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleLinkClick(e, 'api-reference')}
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  {t('apiReferenceTitle')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleLinkClick(e, 'examples')}
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  {t('examplesTitle')}
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => handleLinkClick(e, 'support')}
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  {t('supportTitle')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-bold text-gray-900 mb-5 text-sm uppercase tracking-wider">{t('connect')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  <Github className="w-4 h-4" />
                  <span>{t('github')}</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@GitScribe.com"
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  <span>{t('contactUs')}</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => handleLinkClick(e, 'Donate')}
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium hover:underline"
                >
                  <Heart className="w-4 h-4" />
                  <span>{t('Donate')}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 font-medium">
            © {currentYear} {t('gitScribe')}. {t('allRightsReserved')}.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a 
              href="#" 
              onClick={(e) => handleLinkClick(e, 'privacy-policy')}
              className="hover:text-orange-600 transition-colors font-medium hover:underline"
            >
              {t('privacyPolicy')}
            </a>
            <a 
              href="#" 
              onClick={(e) => handleLinkClick(e, 'terms-of-service')}
              className="hover:text-orange-600 transition-colors font-medium hover:underline"
            >
              {t('termsOfService')}
            </a>
            <a 
              href="#" 
              onClick={(e) => handleLinkClick(e, 'cookie-policy')}
              className="hover:text-orange-600 transition-colors font-medium hover:underline"
            >
              {t('cookiePolicy')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

