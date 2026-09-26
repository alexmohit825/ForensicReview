import React from 'react';
import { FORENSIC_GUIDES } from '../data/forensicGuides';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  AlertOctagon, 
  Gavel, 
  Award, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SectionGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
}

export const SectionGuideDrawer: React.FC<SectionGuideDrawerProps> = ({
  isOpen,
  onClose,
  activeSectionId,
  onSelectSection
}) => {
  if (!isOpen) return null;

  const currentGuide = FORENSIC_GUIDES[activeSectionId] || FORENSIC_GUIDES['ingestion'];
  const allSections = Object.values(FORENSIC_GUIDES);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Forensic Protocol & Medicolegal Guide
              </h2>
              <p className="text-xs text-slate-400">
                Peer-reviewed methodology for standard-of-care analysis & expert testimony
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

        {/* Section Navigation Tabs inside Guide */}
        <div className="px-6 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center gap-1 overflow-x-auto text-xs">
          {allSections.map((sec) => (
            <button
              key={sec.sectionId}
              onClick={() => onSelectSection(sec.sectionId)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                sec.sectionId === currentGuide.sectionId
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sec.title.split(' ')[0]} Guide
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section Hero Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900 border border-slate-700">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              Active Module Guidance
            </span>
            <h3 className="text-lg font-bold text-white mt-2">{currentGuide.title}</h3>
            <p className="text-xs text-slate-300 mt-1">{currentGuide.subtitle}</p>
            <div className="mt-3 text-xs text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
              <strong className="text-cyan-300 font-semibold">Core Objective: </strong>
              {currentGuide.coreObjective}
            </div>
          </div>

          {/* Legal Benchmark Card */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
              <Award className="w-4 h-4 text-blue-400" />
              <span>Standard of Care Legal Benchmark</span>
            </div>
            <blockquote className="text-xs text-slate-300 italic border-l-2 border-blue-500 pl-3 py-1">
              "{currentGuide.standardOfCareBenchmark}"
            </blockquote>
          </div>

          {/* Forensic Audit Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Forensic Audit Checklist</span>
            </h4>
            <div className="space-y-2">
              {currentGuide.forensicChecklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-850/60 border border-slate-800 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Traps to Avoid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Legal Pitfalls & Impeachment Traps</span>
            </h4>
            <div className="space-y-2">
              {currentGuide.legalTrapsToAvoid.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200">
                  <span className="text-rose-400 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expert Deposition Tips */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Courtroom & Deposition Tactics</span>
            </h4>
            <div className="space-y-2">
              {currentGuide.expertDepositionTips.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ForensicReview Medicolegal Protocol Engine v1.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Got it, Return to Workspace
          </button>
        </div>

      </div>
    </div>
  );
};
