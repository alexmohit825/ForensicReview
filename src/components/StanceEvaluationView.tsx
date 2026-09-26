import React, { useState } from 'react';
import { 
  CaseProfile, 
  StanceMode, 
  LegalBreachPoint, 
  DefenseAnchorPoint 
} from '../types/forensic';
import { SectionGuideBanner } from './SectionGuideBanner';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Scale, 
  Plus, 
  FileText, 
  Award, 
  AlertTriangle, 
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  BookmarkCheck,
  Building
} from 'lucide-react';

interface StanceEvaluationViewProps {
  currentCase: CaseProfile;
  stance: StanceMode;
  onToggleStance: (newStance: StanceMode) => void;
  onOpenFullGuide: () => void;
  onJumpToBates: (batesNumber: string) => void;
  onUpdateCase: (updated: Partial<CaseProfile>) => void;
}

export const StanceEvaluationView: React.FC<StanceEvaluationViewProps> = ({
  currentCase,
  stance,
  onToggleStance,
  onOpenFullGuide,
  onJumpToBates,
  onUpdateCase
}) => {
  const isDefense = stance === 'DEFENSE';

  return (
    <div className="space-y-6">
      
      {/* Quick Protocol Guide Banner */}
      <SectionGuideBanner
        sectionId="stance"
        onOpenFullGuide={onOpenFullGuide}
      />

      {/* Mode Banner & Stance Rationale */}
      <div className={`p-6 rounded-xl border transition-all duration-300 shadow-xl ${
        isDefense
          ? 'bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border-blue-800/60'
          : 'bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border-red-800/60'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl border ${
              isDefense 
                ? 'bg-blue-900/40 text-blue-400 border-blue-700/60' 
                : 'bg-red-900/40 text-red-400 border-red-700/60'
            }`}>
              {isDefense ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isDefense ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-red-950 text-red-300 border border-red-800'
                }`}>
                  Active Expert Assignment
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {isDefense ? 'Retained by Defense Counsel' : 'Retained by Plaintiff Counsel'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                {isDefense 
                  ? 'Defense Evidentiary Anchors & Clinical Judgment Matrix' 
                  : 'Plaintiff Standard of Care Breach & Causation Matrix'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {isDefense
                  ? 'Emphasizes documented clinical judgment, prevailing guideline adherence, recognized known surgical complications, and pre-existing patient confounders.'
                  : 'Emphasizes deviations from prevailing standard of care, missed diagnostic opportunities, communication failures, and direct proximate causation links to damages.'}
              </p>
            </div>
          </div>

          {/* Quick Perspective Toggle */}
          <div className="flex-shrink-0 flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => onToggleStance('DEFENSE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isDefense ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Defense Lens
            </button>
            <button
              onClick={() => onToggleStance('PLAINTIFF')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isDefense ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Plaintiff Lens
            </button>
          </div>
        </div>
      </div>

      {/* Content Stream: Defense vs Plaintiff */}
      {isDefense ? (
        /* DEFENSE ANCHORS */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Primary Defense Pillars ({currentCase.defenseAnchors.length})</span>
            </h3>
          </div>

          {currentCase.defenseAnchors.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
              No defense anchor points synthesized yet. Ingest records and run analysis.
            </div>
          ) : (
            <div className="space-y-4">
              {currentCase.defenseAnchors.map((anchor) => (
                <div
                  key={anchor.id}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-800/80 rounded-xl p-5 shadow-lg space-y-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                          {anchor.strength.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Theme: {anchor.defenseTheme}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{anchor.title}</h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {anchor.batesCitations.map((bates, i) => (
                        <button
                          key={i}
                          onClick={() => onJumpToBates(bates)}
                          className="px-2 py-1 rounded bg-slate-950 hover:bg-blue-950 text-blue-300 font-mono text-[11px] border border-slate-800 hover:border-blue-700 transition-colors flex items-center gap-1"
                        >
                          <span>{bates}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deep Clinical Defense Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">
                        Documented Clinical Judgment Rationale
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {anchor.clinicalRational}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                        Prevailing Guideline Compliance
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {anchor.complianceWithGuidelines}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                        Pre-Existing Confounders & Atypical Presentation
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {anchor.preExistingConfounders}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">
                        Supporting Record Documentation
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {anchor.supportingDocumentation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* PLAINTIFF BREACHES */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Identified Standard of Care Deviations ({currentCase.plaintiffBreaches.length})</span>
            </h3>
          </div>

          {currentCase.plaintiffBreaches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
              No plaintiff breach points identified yet. Ingest records and run analysis.
            </div>
          ) : (
            <div className="space-y-4">
              {currentCase.plaintiffBreaches.map((breach) => (
                <div
                  key={breach.id}
                  className="bg-slate-900 border border-slate-800 hover:border-red-800/80 rounded-xl p-5 shadow-lg space-y-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-mono">
                          {breach.severity.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Target: {breach.contributingProviders.join(', ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{breach.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 italic">
                        "{breach.allegation}"
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {breach.batesCitations.map((bates, i) => (
                        <button
                          key={i}
                          onClick={() => onJumpToBates(bates)}
                          className="px-2 py-1 rounded bg-slate-950 hover:bg-red-950 text-red-300 font-mono text-[11px] border border-slate-800 hover:border-red-700 transition-colors flex items-center gap-1"
                        >
                          <span>{bates}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deep Tort Breach Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                        1. Applicable Standard of Care
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {breach.standardOfCareRule}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                        2. Factual Evidence of Breach
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {breach.deviationEvidence}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                        3. Proximate Causation to Harm
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {breach.proximateCausationAnalysis}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
