import React, { useState } from 'react';
import { PrecedentCase, searchPrecedentCases } from '../data/precedentCases';
import { 
  X, 
  Search, 
  Scale, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Filter, 
  Award, 
  Building, 
  DollarSign,
  BookOpen,
  Copy,
  Check,
  ChevronRight,
  Gavel
} from 'lucide-react';

interface SimilarCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCaseTopic?: string;
  onApplyPrecedentToCase?: (precedent: PrecedentCase) => void;
}

export const SimilarCasesModal: React.FC<SimilarCasesModalProps> = ({
  isOpen,
  onClose,
  currentCaseTopic = '',
  onApplyPrecedentToCase
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(currentCaseTopic);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [selectedCase, setSelectedCase] = useState<PrecedentCase | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawResults = searchPrecedentCases(searchTerm);
  const filteredCases = rawResults.filter(c => {
    if (selectedSpecialty !== 'ALL' && c.specialty !== selectedSpecialty) return false;
    if (selectedOutcome !== 'ALL' && c.outcomeDetermination !== selectedOutcome) return false;
    return true;
  });

  const handleCopyCitation = (c: PrecedentCase) => {
    const text = `${c.caption}, ${c.docketNumber} (${c.jurisdiction}). Issue: ${c.allegationType}. Benchmark: ${c.standardOfCareBenchmark}. Takeaway: ${c.keyLegalTakeaway}`;
    navigator.clipboard.writeText(text);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'DEFENSE_VERDICT':
        return { label: 'Defense Verdict', bg: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'PLAINTIFF_VERDICT':
        return { label: 'Plaintiff Verdict', bg: 'bg-red-950 text-red-300 border-red-800' };
      case 'DISMISSED_SUMMARY_JUDGMENT':
        return { label: 'Summary Judgment', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      default:
        return { label: 'Settlement', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-md">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-sm tracking-tight">
                  Medicolegal Case Precedent Vault & Verdict Index
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {filteredCases.length} Precedents Indexed
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Identify similar past cases, compare judicial standard of care benchmarks, and evaluate verdict outcomes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="relative md:col-span-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by diagnosis, procedure, delay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Medical Specialties</option>
              <option value="NEUROSURGERY">Neurosurgery</option>
              <option value="SPINE_SURGERY">Spine Surgery</option>
              <option value="EMERGENCY_MEDICINE">Emergency Medicine</option>
              <option value="CRITICAL_CARE">Critical Care / ICU</option>
              <option value="CARDIOTHORACIC">Cardiothoracic Surgery</option>
            </select>
          </div>

          <div>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Case Outcomes</option>
              <option value="DEFENSE_VERDICT">Defense Verdicts</option>
              <option value="PLAINTIFF_VERDICT">Plaintiff Verdicts</option>
              <option value="CONFIDENTIAL_SETTLEMENT">Settlements</option>
              <option value="DISMISSED_SUMMARY_JUDGMENT">Dismissed on Summary Judgment</option>
            </select>
          </div>
        </div>

        {/* Main Split Body: List on Left, Case Brief on Right */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Precedent Cards List */}
          <div className="w-full md:w-1/2 border-r border-slate-800 overflow-y-auto p-4 space-y-3">
            {filteredCases.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Gavel className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p>No precedent cases match the current query.</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedSpecialty('ALL'); setSelectedOutcome('ALL'); }}
                  className="mt-2 text-cyan-400 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                const outcome = getOutcomeBadge(c.outcomeDetermination);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${outcome.bg}`}>
                        {outcome.label}
                      </span>
                      {c.verdictAmount && (
                        <span className="font-mono text-[11px] font-bold text-amber-400">
                          {c.verdictAmount}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-xs line-clamp-1 mb-1">
                      {c.caption}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                      <span className="text-cyan-400 font-semibold">{c.specialty.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="truncate">{c.clinicalCondition}</span>
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {c.synopsis}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{c.docketNumber}</span>
                      <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                        <span>View Brief</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: In-Depth Precedent Analysis Brief */}
          <div className="hidden md:flex flex-1 flex-col overflow-y-auto p-6 bg-slate-950">
            {selectedCase ? (
              <div className="space-y-5 text-xs">
                
                {/* Header Section */}
                <div className="pb-4 border-b border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      {selectedCase.specialty.replace('_', ' ')} • {selectedCase.allegationType.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleCopyCitation(selectedCase)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors flex items-center gap-1.5"
                      title="Copy full legal citation to clipboard"
                    >
                      {copiedId === selectedCase.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Citation Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {selectedCase.caption}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedCase.docketNumber} • {selectedCase.jurisdiction}
                  </p>
                </div>

                {/* Clinical Condition & Synopsis */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Factual Summary & Presentation
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedCase.synopsis}
                  </p>
                </div>

                {/* Standard of Care Judicial Benchmark */}
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>Established Standard of Care Benchmark</span>
                  </span>
                  <p className="text-cyan-100 leading-relaxed font-semibold">
                    {selectedCase.standardOfCareBenchmark}
                  </p>
                </div>

                {/* Dual Stance Comparative Arguments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Plaintiff Theory */}
                  <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Plaintiff Breach & Causation Theory</span>
                    </span>
                    <p className="text-red-200 leading-relaxed text-[11px]">
                      {selectedCase.plaintiffTheory}
                    </p>
                  </div>

                  {/* Defense Anchor */}
                  <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Defense Judgment & Causation Shield</span>
                    </span>
                    <p className="text-blue-200 leading-relaxed text-[11px]">
                      {selectedCase.defenseTheme}
                    </p>
                  </div>
                </div>

                {/* Outcome & Ruling */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Court Determination / Outcome
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {selectedCase.outcomeDetermination.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {selectedCase.verdictAmount && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Damages / Settlement
                      </span>
                      <span className="text-sm font-mono font-bold text-amber-400 mt-0.5 block">
                        {selectedCase.verdictAmount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Key Legal Takeaway */}
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">
                    Forensic Rule of Law Takeaway
                  </span>
                  <p className="text-purple-100 font-mono text-[11px] leading-relaxed">
                    "{selectedCase.keyLegalTakeaway}"
                  </p>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <Gavel className="w-12 h-12 text-slate-700 mb-3" />
                <h4 className="font-bold text-slate-300">Select a precedent case on the left</h4>
                <p className="text-slate-500 mt-1 max-w-sm">
                  Review the factual scenario, standard of care benchmark, plaintiff breach theories, defense judgment anchors, and verdict outcomes.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
