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
  FileCheck,
  Table as TableIcon,
  AlignLeft,
  Scale,
  Sparkles,
  Calendar,
  Clock,
  User,
  Quote
} from 'lucide-react';

interface ClinicalNarrativeProps {
  currentCase: CaseProfile;
  stance: StanceMode;
  onOpenFullGuide: () => void;
  onUpdateCase: (updated: Partial<CaseProfile>) => void;
  onSynthesizeRecords?: () => void;
  onOpenAiImport?: () => void;
}

export const ClinicalNarrative: React.FC<ClinicalNarrativeProps> = ({
  currentCase,
  stance,
  onOpenFullGuide,
  onUpdateCase,
  onSynthesizeRecords,
  onOpenAiImport
}) => {
  const [synopsisViewMode, setSynopsisViewMode] = useState<'PARAGRAPH' | 'TABLE'>('PARAGRAPH');
  const isDefense = stance === 'DEFENSE';

  const handlePrintSynopsis = () => {
    document.body.classList.add('printing-synopsis');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-synopsis');
    }, 100);
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Protocol Guide Banner */}
      <SectionGuideBanner
        sectionId="synopsis"
        onOpenFullGuide={onOpenFullGuide}
      />

      {/* Top Action Bar for Synopsis & View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60 shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Case Synopsis & Standard of Care Evaluation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Formulate definitive expert opinions to a reasonable degree of medical certainty
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Paragraph vs Table */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSynopsisViewMode('PARAGRAPH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                synopsisViewMode === 'PARAGRAPH'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Paragraph Form</span>
            </button>

            <button
              onClick={() => setSynopsisViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                synopsisViewMode === 'TABLE'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table Chronology Format</span>
            </button>
          </div>

          {/* Re-Synthesize from Ingested Records Button */}
          {onSynthesizeRecords && (
            <button
              onClick={onSynthesizeRecords}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-colors flex-shrink-0"
              title="Run deep clinical NLP extraction across all ingested records"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Re-Synthesize Records</span>
            </button>
          )}

          {/* Paste Claude / AI Narrative Button */}
          {onOpenAiImport && (
            <button
              onClick={onOpenAiImport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-semibold shadow-sm transition-colors flex-shrink-0"
              title="Paste narrative or chronology from Claude or external AI"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Paste Claude Narrative</span>
            </button>
          )}

          {/* Independent Print to PDF Button */}
          <button
            onClick={handlePrintSynopsis}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-colors flex-shrink-0"
            title="Print or Save Synopsis & Standard of Care Report to PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print Synopsis to PDF</span>
          </button>
        </div>
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

          <div className="flex flex-wrap items-center gap-2">
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

        {/* Narrative / Paragraph Mode vs Table Chronology Mode */}
        {synopsisViewMode === 'PARAGRAPH' ? (
          
          /* ================= PARAGRAPH PROSE FORM ================= */
          <div className="mt-6 space-y-6">
            
            {/* Executive Summary Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileEdit className="w-3.5 h-3.5 text-cyan-400" />
                <span>I. Executive Clinical Synopsis (Continuous Paragraph Form)</span>
              </label>
              <textarea
                rows={4}
                value={currentCase.synopsisExecutive}
                onChange={(e) => onUpdateCase({ synopsisExecutive: e.target.value })}
                placeholder="Summarize the core clinical trajectory, presenting complaints, and definitive outcome in continuous prose..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Chronological Care Narrative Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>II. Chronological Care Narrative & Decision-Making</span>
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                <span>III. Proximate Causation Opinion (Reasonable Degree of Medical Certainty)</span>
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

        ) : (

          /* ================= TABLE CHRONOLOGY FORMAT ================= */
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-cyan-400" />
                <span>Itemized Clinical Chronology Table ({currentCase.milestones.length} Events)</span>
              </h4>
              <span className="text-[11px] font-mono text-cyan-400">
                Print-ready legal chronology format
              </span>
            </div>

            {currentCase.milestones.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No clinical events parsed yet. Ingest records or load reference case to populate chronology table.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3 w-32">Date / Time (T+)</th>
                      <th className="p-3 w-40">Clinician & Dept</th>
                      <th className="p-3">Clinical Care Event & Record Quote</th>
                      <th className="p-3 w-64">Standard of Care Evaluation</th>
                      <th className="p-3 w-28 text-right">Bates Pin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {currentCase.milestones.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3 align-top font-mono">
                          <strong className="text-white block">{m.timeDisplay || m.timestamp}</strong>
                          {m.relativeTimeDelta && (
                            <span className="text-[10px] text-cyan-400">{m.relativeTimeDelta}</span>
                          )}
                        </td>
                        <td className="p-3 align-top">
                          <strong className="text-slate-200 block">{m.provider}</strong>
                          <span className="text-[11px] text-slate-400">{m.facilityDepartment}</span>
                        </td>
                        <td className="p-3 align-top space-y-1">
                          <strong className="text-white block text-xs">{m.title}</strong>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{m.summary}</p>
                          {m.verbatimQuote && (
                            <p className="font-mono text-[10px] text-cyan-300 italic bg-slate-950 p-1.5 rounded border border-slate-800">
                              "{m.verbatimQuote}"
                            </p>
                          )}
                        </td>
                        <td className="p-3 align-top text-[11px]">
                          {isDefense ? (
                            m.defenseFlag?.isDefenseAnchor ? (
                              <div className="text-blue-300">
                                <strong className="text-blue-400 block text-[10px] uppercase">
                                  Defense Anchor ({m.defenseFlag.anchorCategory.replace('_', ' ')})
                                </strong>
                                <p className="mt-0.5">{m.defenseFlag.argument}</p>
                              </div>
                            ) : (
                              <span className="text-slate-500">Documented clinical care</span>
                            )
                          ) : (
                            m.plaintiffFlag?.isBreach ? (
                              <div className="text-red-300">
                                <strong className="text-red-400 block text-[10px] uppercase">
                                  Breach: {m.plaintiffFlag.breachCategory.replace('_', ' ')}
                                </strong>
                                <p className="mt-0.5">{m.plaintiffFlag.argument}</p>
                              </div>
                            ) : (
                              <span className="text-slate-500">Standard of care maintained</span>
                            )
                          )}
                        </td>
                        <td className="p-3 align-top text-right font-mono text-cyan-400 font-bold">
                          {m.batesNumber}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        )}

      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE INDEPENDENT SYNOPSIS DOCUMENT (Rendered Only During Print)       */}
      {/* ========================================================================= */}
      <div className="hidden print:block print-synopsis-target bg-white text-slate-900 p-8 font-serif leading-relaxed text-sm">
        {/* Letterhead */}
        <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
          <h1 className="text-lg font-bold uppercase tracking-widest text-slate-900 font-sans">
            Forensic Clinical Synopsis & Standard of Care Determination
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
              <p className="text-slate-600 mt-1">Retaining Stance: <span className="font-bold text-slate-900">{isDefense ? 'DEFENSE EXPERT' : 'PLAINTIFF EXPERT'}</span></p>
              <p className="text-slate-600">Patient: {currentCase.patientName || 'Confidential Patient'}</p>
            </div>
          </div>
        </div>

        {/* Standard of Care Banner */}
        <div className="p-3 bg-slate-100 border-l-4 border-slate-900 mb-6 font-sans text-xs">
          <strong>STANDARD OF CARE DETERMINATION: </strong>
          Based upon my education, clinical training, board certification in neurological surgery, and review of all contemporaneous records to a reasonable degree of medical certainty, it is my expert opinion that the standard of care was{' '}
          <strong className="uppercase underline font-bold">{currentCase.standardOfCareDetermination}</strong>{' '}
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

        {/* Itemized Table if Selected */}
        {synopsisViewMode === 'TABLE' && currentCase.milestones.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-2">
              III. Itemized Event Chronology Table
            </h2>
            <table className="w-full text-left text-[10px] font-sans border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="p-2 w-28">Date / Time</th>
                  <th className="p-2 w-32">Provider & Dept</th>
                  <th className="p-2">Clinical Care Event</th>
                  <th className="p-2 w-48">Standard of Care Analysis</th>
                  <th className="p-2 w-20 text-right">Bates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentCase.milestones.map((m) => (
                  <tr key={m.id}>
                    <td className="p-2 align-top font-mono font-bold">{m.timeDisplay || m.timestamp}</td>
                    <td className="p-2 align-top">{m.provider}</td>
                    <td className="p-2 align-top">{m.summary}</td>
                    <td className="p-2 align-top">{isDefense ? m.defenseFlag?.argument : m.plaintiffFlag?.argument}</td>
                    <td className="p-2 align-top text-right font-mono font-bold">{m.batesNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Proximate Causation */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-2">
            IV. Proximate Causation Analysis
          </h2>
          <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-line text-xs">
            {currentCase.causationOpinion || 'Proximate causation analysis pending.'}
          </p>
        </div>

        {/* Signature & Formal Attestation */}
        <div className="pt-6 border-t-2 border-slate-400 text-xs font-sans">
          <p className="italic text-slate-600 mb-6">
            "I declare under penalty of perjury under the laws of this jurisdiction that the foregoing opinions are rendered to a reasonable degree of medical certainty based upon the evidentiary records authenticated to date."
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="font-bold text-slate-900">A. Alex Mohit, MD, PhD</p>
              <p className="text-slate-600">Board-Certified Neurological Surgeon</p>
              <p className="text-slate-500 font-mono text-[10px]">Active Medical Licensure • Medicolegal Expert Forensic Consultant</p>
            </div>
            <div className="w-48 border-b border-slate-900 text-right pb-1 text-[11px] font-mono text-slate-500">
              Signature / Date
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
