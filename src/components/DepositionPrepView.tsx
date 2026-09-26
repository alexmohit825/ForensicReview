import React, { useState } from 'react';
import { CaseProfile, StanceMode, DepositionQuestion } from '../types/forensic';
import { SectionGuideBanner } from './SectionGuideBanner';
import { 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  ChevronRight, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface DepositionPrepViewProps {
  currentCase: CaseProfile;
  stance: StanceMode;
  onOpenFullGuide: () => void;
  onJumpToBates: (batesNumber: string) => void;
  onUpdateCase: (updated: Partial<CaseProfile>) => void;
}

export const DepositionPrepView: React.FC<DepositionPrepViewProps> = ({
  currentCase,
  stance,
  onOpenFullGuide,
  onJumpToBates,
  onUpdateCase
}) => {
  const isDefense = stance === 'DEFENSE';

  return (
    <div className="space-y-6">
      
      {/* Quick Protocol Guide Banner */}
      <SectionGuideBanner
        sectionId="deposition"
        onOpenFullGuide={onOpenFullGuide}
      />

      {/* Hero Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Hostile Deposition & Cross-Examination Attack Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Anticipating opposing counsel's sharpest impeachment vectors and preparing documentary chart defenses
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
          <strong className="text-amber-400 font-semibold">Simulation Stance Context: </strong>
          {isDefense ? (
            <span>
              You are testifying for the <strong>DEFENSE</strong>. The questions below simulate aggressive interrogation by <strong>PLAINTIFF'S COUNSEL</strong> attempting to establish negligence, diagnostic delay, and lack of urgency.
            </span>
          ) : (
            <span>
              You are testifying for the <strong>PLAINTIFF</strong>. The questions below simulate sharp defense questioning designed to establish non-negligent known complications, confounding comorbidities, and alternative causes of death.
            </span>
          )}
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-4">
        {currentCase.depositionPrep.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
            No deposition prep questions generated yet. Ingest records and run analysis.
          </div>
        ) : (
          currentCase.depositionPrep.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-800/60 rounded-xl p-5 shadow-lg space-y-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Targeted Vulnerability: <span className="text-white">{item.targetedVulnerability}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {item.supportingChartCitations.map((bates, i) => (
                    <button
                      key={i}
                      onClick={() => onJumpToBates(bates)}
                      className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-cyan-400 font-mono text-[11px] border border-slate-800 transition-colors flex items-center gap-1"
                    >
                      <span>{bates}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Hostile Question Box */}
              <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-900/50 text-xs">
                <span className="text-[10px] uppercase font-bold text-red-400 block mb-1">
                  Opposing Counsel Cross-Examination Question
                </span>
                <p className="text-red-200 font-serif text-sm italic leading-relaxed">
                  "{item.hostileQuestion}"
                </p>
              </div>

              {/* Recommended Rebuttal Strategy */}
              <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  Advisable Expert Witness Response Strategy
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {item.advisableResponseStrategy}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
