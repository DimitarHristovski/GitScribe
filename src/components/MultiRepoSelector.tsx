import { useState, useEffect } from 'react';
import { Github, Search, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { fetchUserRepos, SimpleRepo } from '../lib/github-service';
import { useTranslation } from '../lib/translations';
import { DocLanguage } from '../types/core';

interface MultiRepoSelectorProps {
  selectedRepos: SimpleRepo[];
  onSelectionChange: (repos: SimpleRepo[]) => void;
  onClose?: () => void;
}

export default function MultiRepoSelector({
  selectedRepos,
  onSelectionChange,
  onClose,
}: MultiRepoSelectorProps) {
  const [repos, setRepos] = useState<SimpleRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'public' | 'private'>('all');
  
  // Get language from localStorage
  const [selectedLanguage] = useState<DocLanguage>(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return (saved as DocLanguage) || 'en';
  });
  const t = useTranslation(selectedLanguage);

  // Load repositories on mount
  useEffect(() => {
    loadRepos();
  }, [filterVisibility]);

  const loadRepos = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedRepos = await fetchUserRepos({
        visibility: filterVisibility,
        perPage: 100,
      });
      setRepos(fetchedRepos);
    } catch (err: any) {
      setError(err.message || 'Failed to load repositories');
      console.error('Error loading repos:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRepo = (repo: SimpleRepo) => {
    const isSelected = selectedRepos.some((r) => r.id === repo.id);
    if (isSelected) {
      onSelectionChange(selectedRepos.filter((r) => r.id !== repo.id));
    } else {
      onSelectionChange([...selectedRepos, repo]);
    }
  };

  const isSelected = (repo: SimpleRepo) => {
    return selectedRepos.some((r) => r.id === repo.id);
  };

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-4xl w-full max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">{t('selectRepositories')}</h2>
          {selectedRepos.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {selectedRepos.length} {t('selected')}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchRepositories')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Visibility Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t('visibility')}</span>
          <div className="flex gap-2">
            {(['all', 'public', 'private'] as const).map((vis) => (
              <button
                key={vis}
                onClick={() => setFilterVisibility(vis)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterVisibility === vis
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {vis === 'all' ? t('all') : vis === 'public' ? t('public') : t('private')}
              </button>
            ))}
          </div>
          <button
            onClick={loadRepos}
            disabled={loading}
            className="ml-auto px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">{t('loadingRepositories')}</span>
        </div>
      )}

      {/* Repository List */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredRepos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? t('noRepositoriesMatch') : t('noRepositoriesFound')}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRepos.map((repo) => {
                const selected = isSelected(repo);
                return (
                  <div
                    key={repo.id}
                    onClick={() => toggleRepo(repo)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selected
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{repo.name}</h3>
                          {repo.private && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {t('private')}
                            </span>
                          )}
                          {repo.language && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {repo.language}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{repo.fullName}</p>
                        {repo.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        {repo.lastPushedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {t('lastPushed')} {new Date(repo.lastPushedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {selectedRepos.length > 0
            ? `${selectedRepos.length} ${selectedRepos.length !== 1 ? t('repositories') : t('repository')} ${t('selected')}`
            : t('noRepositoriesSelected')}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSelectionChange([])}
            disabled={selectedRepos.length === 0}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('clearAll')}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t('done')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

