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
    <div className="card max-w-4xl w-full max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <Github className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('selectRepositories')}</h2>
          {selectedRepos.length > 0 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full text-sm font-bold shadow-sm">
              {selectedRepos.length} {t('selected')}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchRepositories')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-modern pl-12"
          />
        </div>

        {/* Visibility Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">{t('visibility')}</span>
          <div className="flex gap-2">
            {(['all', 'public', 'private'] as const).map((vis) => (
              <button
                key={vis}
                onClick={() => setFilterVisibility(vis)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  filterVisibility === vis
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
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
            className="ml-auto px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
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
        <div className="flex-1 overflow-y-auto border-2 border-gray-200 rounded-xl scrollbar-thin">
          {filteredRepos.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">{searchQuery ? t('noRepositoriesMatch') : t('noRepositoriesFound')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRepos.map((repo) => {
                const selected = isSelected(repo);
                return (
                  <div
                    key={repo.id}
                    onClick={() => toggleRepo(repo)}
                    className={`p-5 cursor-pointer transition-all hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-red-50/50 ${
                      selected ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selected
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 shadow-md'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        {selected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{repo.name}</h3>
                          {repo.private && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">
                              {t('private')}
                            </span>
                          )}
                          {repo.language && (
                            <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg">
                              {repo.language}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 font-medium">{repo.fullName}</p>
                        {repo.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                            {repo.description}
                          </p>
                        )}
                        {repo.lastPushedAt && (
                          <p className="text-xs text-gray-400 mt-2">
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
      <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm font-semibold text-gray-700">
          {selectedRepos.length > 0
            ? `${selectedRepos.length} ${selectedRepos.length !== 1 ? t('repositories') : t('repository')} ${t('selected')}`
            : t('noRepositoriesSelected')}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onSelectionChange([])}
            disabled={selectedRepos.length === 0}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('clearAll')}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="btn-primary px-6 py-2 text-sm"
            >
              {t('done')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

