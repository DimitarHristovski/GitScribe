import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import DocumentationEditor from './pages/DocumentationEditor';
import InfoPage from './pages/InfoPage';

type View = 
  | 'landing' 
  | 'documentation'
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

function App() {
  const [view, setView] = useState<View>('landing');

  // Listen for navigation events from Footer
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setView(event.detail as View);
    };
    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  // Handle info pages
  const infoPages: View[] = [
    'github-integration',
    'multi-repo-support',
    'ai-powered-generation',
    'export-commit',
    'documentation-page',
    'api-reference',
    'examples',
    'support',
    'privacy-policy',
    'terms-of-service',
    'cookie-policy',
  ];

  if (infoPages.includes(view)) {
    return (
      <InfoPage
        pageType={view as any}
        onBack={() => setView('landing')}
      />
    );
  }

  if (view === 'documentation') {
    return (
      <DocumentationEditor
        onBack={() => setView('landing')}
      />
    );
  }

  return <Landing onGenerate={() => setView('documentation')} />;
}

export default App;
