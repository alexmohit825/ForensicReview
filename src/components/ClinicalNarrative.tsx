import React from 'react';
import { CaseProfile, StanceMode } from '../types/forensic';
import { SectionGuideBanner } from './SectionGuideBanner';
import { BookOpen, CheckCircle, XCircle, AlertCircle, FileEdit, Award, ShieldAlert, ShieldCheck } from 'lucide-react';

interface ClinicalNarrativeProps {
  currentCase: CaseProfile;
  stance: StanceMode;
  onOpenFullGuide: () => void;
  onUpdateCase: (updated: Partial<CaseProfile>) => void;
}

export const ClinicalNarrative: React.FC<ClinicalNarrativeProps> = ({
  currentCase,
  stance,
  onOpenFullGuide,
  onUpdateCase
}) => {
  const isDefense = stance === 'DEFENSE';

  return (
    <div className="space-y-6">
      
      {/* Quick Protocol Guide Banner */}
      <SectionGuideBanner
        sectionId="synopsis"
        onOpenFullGuide={onOpenFullGuide}
      />

      {/* Standard of Care Determination Barometer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block mb-1">
              Forensic Expert Determination
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <span>Standard of Care (SoC) Final Clinical Finding</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {(['MET', 'BREACHED', 'INCONCLUSIVE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onUpdateCase({ standardOfCareDetermination: status })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                  currentCase.standardOfCareDetermination === status
                    ? status === 'MET'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : status === 'BREACHED'
                      ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                      : 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {status === 'MET' && <CheckCircle className="w-3.5 h-3.5" />}
                {status === 'BREACHED' && <XCircle className="w-3.5 h-3.5" />}
                {status === 'INCONCLUSIVE' && <AlertCircle className="w-3.5 h-3.5" />}
                <span>STANDARD OF CARE {status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileEdit className="w-3.5 h-3.5 text-cyan-400" />
            <span>Executive Forensic Synopsis</span>
          </label>
          <textarea
            rows={4}
            value={currentCase.synopsisExecutive}
            onChange={(e) => onUpdateCase({ synopsisExecutive: e.target.value })}
            placeholder="Summarize the core clinical trajectory, presenting complaints, and definitive outcome..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Chronological Narrative */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chronological Narrative of Care & Medical Decision-Making</span>
          </label>
          <textarea
            rows={6}
            value={currentCase.synopsisNarrative}
            onChange={(e) => onUpdateCase({ synopsisNarrative: e.target.value })}
            placeholder="Synthesize the chronological course of events, clinical interventions, test results, and shift transfers..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Proximate Causation Statement */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>Proximate Causation Opinion (Reasonable Degree of Medical Certainty)</span>
          </label>
          <textarea
            rows={4}
            value={currentCase.causationOpinion}
            onChange={(e) => onUpdateCase({ causationOpinion: e.target.value })}
            placeholder="Articulate the mechanistic causal chain connecting the care rendered to the ultimate outcome, or explaining why the outcome was independent of medical management..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

      </div>

    </div>
  );
};
