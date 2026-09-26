import React, { useState } from 'react';
import { CaseProfile, StanceMode } from '../types/forensic';
import { SectionGuideBanner } from './SectionGuideBanner';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileEdit, 
  Award, 
  Printer, 
  ShieldCheck, 
  ShieldAlert,
  FileCheck
} from 'lucide-react';

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
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const isDefense = stance === 'DEFENSE';

  const handlePrintSynopsis = () => {
    setIsPrinting(true);
    document.body.classList.add('printing-synopsis');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-synopsis');
      setIsPrinting(false);
    }, 100);
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Protocol Guide Banner */}
      <SectionGuideBanner
        sectionId="synopsis"
        onOpenFullGuide={onOpenFullGuide}
      />

      {/* Top Action Bar for Synopsis */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Clinical Synopsis & Standard of Care Evaluation
            </h3>
            <p className="text-xs text-slate-400">
              Formulate definitive opinions to a reasonable degree of medical certainty
            </p>
          </div>
        </div>

        {/* Independent Print Button */}
        <button
          onClick={handlePrintSynopsis}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-colors"
          title="Print Synopsis and Standard of Care determination independently"
        >
          <Printer className="w-4 h-4" />
          <span>Print Synopsis Independently</span>
        </button>
      </div>

      {/* Standard of Care Determination Barometer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block mb-1">
              Forensic Expert Determination
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <span>Standard of Care (SoC) Clinical Finding</span>
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

        {/* Executive Summary Input */}
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

        {/* Chronological Narrative Input */}
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

        {/* Proximate Causation Input */}
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

      {/* ========================================================================= */}
      {/* PRINTABLE INDEPENDENT SYNOPSIS DOCUMENT (Rendered Only During Print)       */}
      {/* ========================================================================= */}
      <div className="hidden print:block print-synopsis-target bg-white text-slate-900 p-8 font-serif leading-relaxed text-sm">
        {/* Letterhead */}
        <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
          <h1 className="text-lg font-bold uppercase tracking-widest text-slate-900 font-sans">
            Forensic Clinical Synopsis & Standard of Care Finding
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            EXPERT MEDICAL DISCLOSURE • PREPARED BY A. ALEX MOHIT, MD, PhD
          </p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Date Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Case Caption */}
        <div className="border border-slate-300 rounded p-3 mb-6 bg-slate-50 text-xs font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-slate-900 text-sm">{currentCase.caseName || 'In the Matter of Medical Review'}</p>
              <p className="text-slate-600 mt-1">Docket No: <span className="font-mono font-semibold">{currentCase.caseNumber || 'N/A'}</span></p>
              <p className="text-slate-600">Venue: {currentCase.courtJurisdiction || 'State / Federal Court'}</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{currentCase.retainingCounsel || 'Counsel of Record'}</p>
              <p className="text-slate-600 mt-1">Retaining Stance: <span className="font-bold text-slate-900">{isDefense ? 'DEFENSE' : 'PLAINTIFF'}</span></p>
              <p className="text-slate-600">Patient: {currentCase.patientName || 'Confidential Patient'}</p>
            </div>
          </div>
        </div>

        {/* Standard of Care Banner */}
        <div className="p-3 bg-slate-100 border-l-4 border-slate-900 mb-6 font-sans text-xs">
          <strong>STANDARD OF CARE FINDING: </strong>
          Based upon a reasonable degree of medical certainty, it is my expert opinion that the standard of care was{' '}
          <strong className="uppercase underline">{currentCase.standardOfCareDetermination}</strong>{' '}
          by the treating healthcare providers.
        </div>

        {/* Executive Summary */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-2">
            I. Executive Clinical Synopsis
          </h2>
          <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-line text-xs">
            {currentCase.synopsisExecutive || 'Executive synopsis pending.'}
          </p>
        </div>

        {/* Chronological Narrative */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-2">
            II. Chronological Care Narrative & Decision-Making
          </h2>
          <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-line text-xs">
            {currentCase.synopsisNarrative || 'Chronological narrative pending.'}
          </p>
        </div>

        {/* Proximate Causation */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-2">
            III. Proximate Causation Assessment
          </h2>
          <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-line text-xs">
            {currentCase.causationOpinion || 'Proximate causation opinion pending.'}
          </p>
        </div>

        {/* Attestation Signature */}
        <div className="pt-6 border-t border-slate-300 text-xs font-sans flex justify-between items-end">
          <div>
            <div className="w-56 border-b border-slate-900 mb-1" />
            <p className="font-bold text-slate-900">A. Alex Mohit, MD, PhD</p>
            <p className="text-slate-600">Forensic Medicolegal Consultant • Board Certified Neurosurgeon</p>
          </div>
          <div className="text-right text-slate-500 font-mono text-[10px]">
            Executed on: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

    </div>
  );
};
