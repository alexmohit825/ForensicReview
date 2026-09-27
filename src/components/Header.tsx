import React from 'react';
import { StanceMode } from '../types/forensic';
import { 
  Scale, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  LineChart, 
  BookOpen, 
  Printer, 
  HelpCircle, 
  FolderPlus,
  Compass,
  AlertTriangle,
  Presentation,
  FolderOpen,
  Library,
  Gavel
} from 'lucide-react';

interface HeaderProps {
  stance: StanceMode;
  onToggleStance: (newStance: StanceMode) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  caseName: string;
  isGuideOpen: boolean;
  onToggleGuide: () => void;
  onNewCase: () => void;
  onOpenCaseDirectory: () => void;
  onOpenSimilarCases: () => void;
  caseCount: number;
  onLoadBenchmark: () => void;
  onLoadQuinonez?: () => void;
  hasDocuments: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stance,
  onToggleStance,
  activeTab,
  onSelectTab,
  caseName,
  isGuideOpen,
  onToggleGuide,
  onNewCase,
  onOpenCaseDirectory,
  onOpenSimilarCases,
  caseCount,
  onLoadBenchmark,
  onLoadQuinonez,
  hasDocuments
}) => {
  const isDefense = stance === 'DEFENSE';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 transition-colors duration-300">
      {/* Top Meta Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 shadow-md">
            <Scale className="w-5 h-5 text-cyan-400" />
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              isDefense ? 'bg-blue-500' : 'bg-red-500'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">Forensic<span className="text-cyan-400">Review</span></span>
              <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Medicolegal Workstation
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[280px]">
              {caseName || 'No Active Case'}
            </div>
          </div>
        </div>

        {/* Center: The Stance Pivot (Defense vs. Plaintiff Toggle) */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onToggleStance('DEFENSE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isDefense
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>DEFENSE EXPERT</span>
          </button>

          <button
            onClick={() => onToggleStance('PLAINTIFF')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              !isDefense
                ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>PLAINTIFF EXPERT</span>
          </button>
        </div>

        {/* Right Actions: Case Management & Toggleable Guide */}
        <div className="flex items-center gap-2">
          {/* Section Guide Trigger */}
          <button
            onClick={onToggleGuide}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isGuideOpen
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-900/20'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
            title="Toggle Forensic Protocol & Legal Guide"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Forensic Guide</span>
          </button>

          {/* Similar Cases Vault Trigger */}
          <button
            onClick={onOpenSimilarCases}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/70 text-purple-300 border border-purple-800/80 hover:bg-purple-900 transition-colors shadow-sm"
            title="Search Med-Mal Precedent Cases & Judicial Benchmarks"
          >
            <Gavel className="w-4 h-4 text-purple-400" />
            <span>Similar Cases Vault</span>
          </button>

          {/* Case Directory Trigger */}
          <button
            onClick={onOpenCaseDirectory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900 transition-colors shadow-sm"
            title="Open Multi-Case Directory & Patient Archives"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>Case Directory ({caseCount})</span>
          </button>

          {/* New Case Button */}
          <button
            onClick={onNewCase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-750 hover:text-white transition-colors"
            title="Start Clean Ingestion for a New Case"
          >
            <FolderPlus className="w-4 h-4 text-slate-400" />
            <span>New Case</span>
          </button>

          {/* Load Quinonez Case (MVA Spine Causation) */}
          {onLoadQuinonez && (
            <button
              onClick={onLoadQuinonez}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-900 transition-colors shadow-sm"
              title="Load Real Quinonez Spine Injury Case (Dates & Arrows Timeline, 10 Deposition Vectors, Literature Support)"
            >
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Load Quinonez Case</span>
            </button>
          )}

          {/* Load Benchmark Case (Teaching File) */}
          {!hasDocuments && (
            <button
              onClick={onLoadBenchmark}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-amber-300 border border-amber-500/30 hover:bg-amber-500/10 transition-colors"
              title="Load Benchmark Reference Case (Thoracic Aortic Dissection)"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Load Aortic Case</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-800/60 py-1.5 text-xs font-medium">
        <button
          onClick={() => onSelectTab('ingestion')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'ingestion'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>1. Records & Ingestion</span>
        </button>

        <button
          onClick={() => onSelectTab('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>2. Directional Timeline & Arrows</span>
        </button>

        <button
          onClick={() => onSelectTab('stance')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'stance'
              ? isDefense ? 'bg-blue-950/60 text-blue-300 font-semibold border border-blue-800/50' : 'bg-red-950/60 text-red-300 font-semibold border border-red-800/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>3. {isDefense ? 'Defense Anchors & Judgment' : 'Plaintiff Breaches & Deviations'}</span>
        </button>

        <button
          onClick={() => onSelectTab('synopsis')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'synopsis'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>4. Case Synopsis & Chronology</span>
        </button>

        <button
          onClick={() => onSelectTab('literature')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'literature'
              ? 'bg-slate-800 text-amber-300 font-semibold border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Library className="w-3.5 h-3.5 text-amber-400" />
          <span>5. Medical Literature & Guidelines</span>
        </button>

        <button
          onClick={() => onSelectTab('deposition')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'deposition'
              ? 'bg-slate-800 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>6. Deposition & Cross-Exam Prep</span>
        </button>

        <button
          onClick={() => onSelectTab('presentation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'presentation'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Presentation className="w-3.5 h-3.5 text-blue-300" />
          <span>7. Courtroom Presentation</span>
        </button>

        <button
          onClick={() => onSelectTab('export')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ml-auto ${
            activeTab === 'export'
              ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span>8. Formal Court Report</span>
        </button>
      </div>
    </header>
  );
};
