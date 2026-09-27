import React, { useState } from 'react';
import { CaseProfile, StanceMode, IngestedDocument, ClinicalMilestone } from '../types/forensic';
import { DocumentManager } from './DocumentManager';
import { ClinicalNarrative } from './ClinicalNarrative';
import { 
  FileText, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  FolderOpen, 
  Printer, 
  CheckCircle2, 
  Layers,
  Scale
} from 'lucide-react';

interface RecordsAndSummaryViewProps {
  currentCase: CaseProfile;
  stance: StanceMode;
  onUpdateCase: (updated: Partial<CaseProfile>) => void;
  onAnalyzeRecords: () => void;
  onSelectDocumentForView: (doc: IngestedDocument, page?: number) => void;
  onNavigateToTimeline: () => void;
  onNavigateToPresentation: () => void;
  onNavigateToLiterature: () => void;
  onOpenSimilarCases?: () => void;
  onOpenAiImport: () => void;
  onLoadQuinonez?: () => void;
  onLoadBenchmark?: () => void;
  onOpenFullGuide: (section: string) => void;
}

export const RecordsAndSummaryView: React.FC<RecordsAndSummaryViewProps> = ({
  currentCase,
  stance,
  onUpdateCase,
  onAnalyzeRecords,
  onSelectDocumentForView,
  onNavigateToTimeline,
  onNavigateToPresentation,
  onNavigateToLiterature,
  onOpenSimilarCases,
  onOpenAiImport,
  onLoadQuinonez,
  onLoadBenchmark,
  onOpenFullGuide
}) => {
  const hasDocuments = currentCase.documents.length > 0;
  const hasSummary = Boolean(currentCase.synopsisExecutive || currentCase.synopsisNarrative);
  
  // Default to summary if summary exists, otherwise records
  const [activeSubTab, setActiveSubTab] = useState<'RECORDS' | 'SUMMARY'>('RECORDS');

  const handleGenerateAndShowSummary = () => {
    onAnalyzeRecords();
    setActiveSubTab('SUMMARY');
  };

  return (
    <div className="space-y-6">
      {/* Top Workflow Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase tracking-wide">
              Step 1 of 4
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Read, Organize & Summarize Medical Records
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ingest patient charts, organize Bates-stamped exhibits, and generate an evidence-based clinical synopsis.
          </p>
        </div>

        {/* Sub-view switcher */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('RECORDS')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'RECORDS'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Organized Records ({currentCase.documents.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SUMMARY')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'SUMMARY'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Medical Summary & Opinion</span>
            {hasSummary && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Organized Records */}
      {activeSubTab === 'RECORDS' && (
        <div className="space-y-6">
          <DocumentManager
            currentCase={currentCase}
            onUpdateCase={onUpdateCase}
            onAnalyzeRecords={handleGenerateAndShowSummary}
            onSelectDocumentForView={onSelectDocumentForView}
            onNavigateToPresentation={onNavigateToPresentation}
            onNavigateToTimeline={onNavigateToTimeline}
            onNavigateToSynopsis={() => setActiveSubTab('SUMMARY')}
            onNavigateToLiterature={onNavigateToLiterature}
            onOpenSimilarCases={onOpenSimilarCases}
            onOpenAiImport={onOpenAiImport}
            onLoadQuinonez={onLoadQuinonez}
            onLoadBenchmark={onLoadBenchmark}
          />

          {hasDocuments && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs text-slate-400">
                {currentCase.documents.length} records organized ({currentCase.documents.reduce((acc, d) => acc + d.pageCount, 0)} total pages).
              </span>
              <button
                onClick={() => setActiveSubTab('SUMMARY')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <span>View Medical Summary & Opinion</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Medical Summary & Findings */}
      {activeSubTab === 'SUMMARY' && (
        <div className="space-y-6">
          <ClinicalNarrative
            currentCase={currentCase}
            stance={stance}
            onOpenFullGuide={() => onOpenFullGuide('synopsis')}
            onUpdateCase={onUpdateCase}
            onSynthesizeRecords={onAnalyzeRecords}
            onOpenAiImport={onOpenAiImport}
          />

          {/* Direct Pipeline to Step 2: Timeline */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-800/40 shadow-xl gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Medical Summary Complete</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Proceed to visualize the chronological chain of events with dates, military times, and directional flow arrows (↓).
              </p>
            </div>
            <button
              onClick={onNavigateToTimeline}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950 transition-all flex-shrink-0"
            >
              <span>Step 2: View Timeline of Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
