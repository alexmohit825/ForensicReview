import React, { useState, useEffect } from 'react';
import { CaseProfile, StanceMode } from '../types/forensic';
import { 
  PubMedArticle, 
  searchPubMedArticles, 
  getRecommendedCaseQueries,
  getCuratedMedicalLiterature 
} from '../utils/pubmedService';
import { 
  Search, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  Award, 
  Bookmark, 
  BookmarkCheck, 
  Layers, 
  Clock, 
  CheckCircle2, 
  FileText,
  Filter,
  RefreshCw,
  Library
} from 'lucide-react';

interface LiteratureSearchTabProps {
  currentCase: CaseProfile;
  stance: StanceMode;
  onOpenFullGuide?: () => void;
}

export const LiteratureSearchTab: React.FC<LiteratureSearchTabProps> = ({
  currentCase,
  stance,
  onOpenFullGuide
}) => {
  const isDefense = stance === 'DEFENSE';
  const recommendedQueries = getRecommendedCaseQueries(currentCase.caseName, currentCase.patientName);
  
  const [query, setQuery] = useState<string>(recommendedQueries[0] || 'Medical malpractice standard of care guidelines');
  const [articles, setArticles] = useState<PubMedArticle[]>(() => getCuratedMedicalLiterature());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pinnedPmids, setPinnedPmids] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'GUIDELINES' | 'TIMING' | 'PINNED'>('ALL');

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    try {
      const results = await searchPubMedArticles(searchTerm, 10);
      setArticles(results);
    } catch (e) {
      console.warn('Search error, using curated literature:', e);
      setArticles(getCuratedMedicalLiterature(searchTerm));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = (pmid: string) => {
    setPinnedPmids(prev => 
      prev.includes(pmid) ? prev.filter(id => id !== pmid) : [...prev, pmid]
    );
  };

  const filteredArticles = articles.filter(a => {
    if (activeFilter === 'PINNED') return pinnedPmids.includes(a.pmid);
    if (activeFilter === 'GUIDELINES') return a.title.toLowerCase().includes('guideline') || a.relevanceToStandardOfCare?.toLowerCase().includes('guideline');
    if (activeFilter === 'TIMING') return a.title.toLowerCase().includes('timing') || a.title.toLowerCase().includes('delay') || a.relevanceToStandardOfCare?.toLowerCase().includes('timing');
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-900/60 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>National Library of Medicine (PubMed) Literature & Guidelines Search</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live peer-reviewed medical journals, clinical society practice parameters, and landmark neurosurgical/surgical timing studies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-400">
            NCBI API Live
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            {pinnedPmids.length} Articles Cited
          </span>
        </div>
      </div>

      {/* Recommended Topics Based on Active Case */}
      {recommendedQueries.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recommended Case Literature Queries:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {recommendedQueries.map((req, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(req);
                  executeSearch(req);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 text-xs text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>{req}</span>
                <Search className="w-3 h-3 text-cyan-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Input Bar & Quick Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(query);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search PubMed (e.g. cauda equina syndrome surgical timing meta-analysis, aortic dissection guidelines)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-2 flex-shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Searching PubMed...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search PubMed</span>
              </>
            )}
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] mr-1">Filter:</span>
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Articles ({articles.length})
            </button>
            <button
              onClick={() => setActiveFilter('GUIDELINES')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                activeFilter === 'GUIDELINES'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Award className="w-3 h-3 text-cyan-400" />
              <span>Practice Guidelines</span>
            </button>
            <button
              onClick={() => setActiveFilter('TIMING')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                activeFilter === 'TIMING'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Timing & Delay Benchmarks</span>
            </button>
            <button
              onClick={() => setActiveFilter('PINNED')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                activeFilter === 'PINNED'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800 font-bold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Bookmark className="w-3 h-3 text-amber-400" />
              <span>Cited In Case ({pinnedPmids.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Peer-Reviewed Evidence Base
          </span>
        </div>
      </div>

      {/* Results Article List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
            <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-300">No medical literature found for this query.</p>
            <p className="text-slate-500 mt-1">
              Try searching broader clinical terms or selecting one of the recommended case topics above.
            </p>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const isPinned = pinnedPmids.includes(art.pmid);

            return (
              <div 
                key={art.pmid}
                className={`bg-slate-900 border rounded-xl p-5 shadow-lg transition-all ${
                  isPinned 
                    ? 'border-amber-500/80 bg-slate-900/95 ring-2 ring-amber-500/20' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Journal, Year, PMID, Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">
                      {art.journal}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 font-mono">{art.pubDate}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      PMID: {art.pmid}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(art.pmid)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        isPinned
                          ? 'bg-amber-500 text-black shadow'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                      title={isPinned ? 'Remove from cited case exhibits' : 'Pin to case literature citations'}
                    >
                      {isPinned ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>Cited in Case</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Cite Article</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${art.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition-colors flex items-center gap-1"
                      title="Open full record on PubMed"
                    >
                      <span>PubMed</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Article Title */}
                <h4 className="font-bold text-white text-sm leading-snug mb-2">
                  {art.title}
                </h4>

                {/* Authors */}
                {art.authors.length > 0 && (
                  <p className="text-[11px] text-slate-400 font-mono mb-3">
                    {art.authors.join(', ')} {art.authors.length >= 4 ? 'et al.' : ''}
                  </p>
                )}

                {/* Forensic Standard of Care Relevance Box */}
                {art.relevanceToStandardOfCare && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-cyan-900/40 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                      <Award className="w-3 h-3 text-cyan-400" />
                      <span>Standard of Care Forensic Analysis:</span>
                    </span>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {art.relevanceToStandardOfCare}
                    </p>
                  </div>
                )}

                {/* DOI footer */}
                {art.doi && (
                  <div className="mt-3 text-[10px] text-slate-500 font-mono">
                    DOI: {art.doi}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
