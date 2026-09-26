import React from 'react';
import { CaseProfile, StanceMode } from '../types/forensic';
import { Printer, FileDown, Scale, ShieldCheck, ShieldAlert, Award, FileText } from 'lucide-react';

interface ReportExportViewProps {
  currentCase: CaseProfile;
  stance: StanceMode;
}

export const ReportExportView: React.FC<ReportExportViewProps> = ({ currentCase, stance }) => {
  const isDefense = stance === 'DEFENSE';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Printer className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Court-Ready Expert Witness Forensic Disclosure
          </span>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-md shadow-cyan-900/30"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export to PDF</span>
        </button>
      </div>

      {/* Printable Court Document Container */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-10 max-w-4xl mx-auto border border-slate-200 font-serif leading-relaxed text-sm">
        
        {/* Formal Header / Letterhead */}
        <div className="text-center pb-6 border-b-2 border-slate-900 mb-8">
          <h1 className="text-xl font-bold uppercase tracking-widest text-slate-900 font-sans">
            Forensic Medical Expert Witness Report
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-1">
            CONFIDENTIAL ATTORNEY WORK-PRODUCT & EXPERT DISCLOSURE
          </p>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Date Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Case Legal Caption Box */}
        <div className="border border-slate-300 rounded p-4 mb-8 bg-slate-50 text-xs font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">CASE CAPTION</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{currentCase.caseName || 'In the Matter of Medical Review'}</p>
              <p className="text-slate-600 mt-1">Docket No: <span className="font-mono font-semibold">{currentCase.caseNumber || 'N/A'}</span></p>
              <p className="text-slate-600">Venue: {currentCase.courtJurisdiction || 'State / Federal Court'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold uppercase text-[10px]">RETAINING COUNSEL</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{currentCase.retainingCounsel || 'Counsel of Record'}</p>
              <p className="text-slate-600 mt-1">Retaining Side: <span className="font-bold text-slate-900">{isDefense ? 'DEFENDANT' : 'PLAINTIFF'}</span></p>
              <p className="text-slate-600">Patient: {currentCase.patientName || 'Confidential Patient'}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Retention & Scope */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-3">
            I. Statement of Retention & Forensic Scope
          </h2>
          <p className="text-slate-800 text-justify">
            I was retained by counsel representing the {isDefense ? 'Defense' : 'Plaintiff'} to conduct an objective, comprehensive forensic review of the medical records in the above-captioned matter. The purpose of this evaluation is to formulate an expert clinical opinion, based upon a reasonable degree of medical certainty, regarding whether the healthcare providers met or deviated from the applicable standard of medical care, and to evaluate the causal relationship between the care rendered and the alleged injuries.
          </p>
        </div>

        {/* Section 2: Evidentiary Records Reviewed */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-3">
            II. Evidentiary Records Reviewed
          </h2>
          <p className="text-slate-800 mb-3 text-justify">
            My opinions are predicated upon a rigorous analysis of the contemporaneous medical records provided, comprising {currentCase.documents.reduce((acc, d) => acc + d.pageCount, 0)} pages across {currentCase.documents.length} document bundles:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs font-sans text-slate-700">
            {currentCase.documents.map((doc) => (
              <li key={doc.id}>
                <strong>{doc.fileName}</strong> — Pages: {doc.pageCount} (Bates Range: {doc.batesPrefix}{String(doc.batesStartNumber).padStart(5, '0')} to {doc.batesPrefix}{String(doc.batesEndNumber).padStart(5, '0')})
              </li>
            ))}
          </ul>
        </div>

        {/* Section 3: Executive Synopsis */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-3">
            III. Executive Clinical Summary & Background
          </h2>
          <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-line">
            {currentCase.synopsisExecutive || 'Executive clinical synopsis pending entry.'}
          </p>
        </div>

        {/* Section 4: Chronological Care Narrative */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-3">
            IV. Chronological Narrative of Care & Critical Milestones
          </h2>
          <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-line mb-4">
            {currentCase.synopsisNarrative || 'Chronological narrative pending entry.'}
          </p>

          {/* Itemized Table of Key Milestones */}
          <table className="w-full text-left text-xs font-sans border border-slate-300 my-4">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">Timestamp</th>
                <th className="p-2 border-r border-slate-300">Clinical Event & Department</th>
                <th className="p-2 border-r border-slate-300">Provider</th>
                <th className="p-2">Bates Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentCase.milestones.map((m) => (
                <tr key={m.id}>
                  <td className="p-2 font-mono font-semibold border-r border-slate-200">{m.timeDisplay}</td>
                  <td className="p-2 border-r border-slate-200">
                    <strong>{m.title}</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">{m.summary}</p>
                  </td>
                  <td className="p-2 border-r border-slate-200">{m.provider}</td>
                  <td className="p-2 font-mono text-slate-700">{m.batesNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5: Standard of Care Opinion */}
        <div className="mb-8 page-break">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-3">
            V. Standard of Care Determination & Evidentiary Analysis
          </h2>
          
          <div className="p-3 bg-slate-100 border-l-4 border-slate-900 mb-4 font-sans text-xs">
            <strong>OFFICIAL EXPERT OPINION: </strong>
            It is my opinion to a reasonable degree of medical certainty that the standard of care was{' '}
            <strong className="uppercase underline">{currentCase.standardOfCareDetermination}</strong>{' '}
            by the treating medical providers.
          </div>

          {/* Stance-Specific Itemization */}
          {isDefense ? (
            <div className="space-y-4">
              <p className="text-slate-800 text-justify">
                This conclusion is substantiated by the following primary clinical pillars and documentation of sound medical judgment:
              </p>
              {currentCase.defenseAnchors.map((anchor, i) => (
                <div key={anchor.id} className="border-l-2 border-slate-300 pl-4 py-1 text-xs font-sans space-y-1">
                  <p className="font-bold text-slate-900">{i + 1}. {anchor.title} ({anchor.defenseTheme})</p>
                  <p className="text-slate-700">{anchor.clinicalRational}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Bates References: {anchor.batesCitations.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-800 text-justify">
                This breach determination is substantiated by the following deviations from prevailing standards of medical practice:
              </p>
              {currentCase.plaintiffBreaches.map((breach, i) => (
                <div key={breach.id} className="border-l-2 border-red-400 pl-4 py-1 text-xs font-sans space-y-1">
                  <p className="font-bold text-slate-900">{i + 1}. {breach.title}</p>
                  <p className="text-slate-700 italic">"{breach.allegation}"</p>
                  <p className="text-slate-700">{breach.deviationEvidence}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Bates References: {breach.batesCitations.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 6: Proximate Causation */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-sans border-b border-slate-300 pb-1 mb-3">
            VI. Proximate Causation Opinion
          </h2>
          <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-line">
            {currentCase.causationOpinion || 'Proximate causation statement pending entry.'}
          </p>
        </div>

        {/* Section 7: Formal Expert Attestation */}
        <div className="pt-8 border-t border-slate-300 text-xs font-sans space-y-6">
          <p className="text-slate-700 text-justify">
            I declare under penalty of perjury under the laws of the applicable jurisdiction that the foregoing statements and opinions are true, correct, and represent my objective professional assessment based upon the records available to me at this time. I reserve the right to amend or supplement these opinions should additional discovery or medical records be disclosed.
          </p>

          <div className="pt-8 flex justify-between items-end">
            <div>
              <div className="w-56 border-b border-slate-900 mb-1" />
              <p className="font-bold text-slate-900">A. Alex Mohit, MD, PhD</p>
              <p className="text-slate-600">Forensic Medicolegal Expert Consultant</p>
              <p className="text-slate-500">Board Certified Neurosurgeon</p>
            </div>
            <div className="text-right text-slate-500 font-mono text-[11px]">
              Executed on: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
