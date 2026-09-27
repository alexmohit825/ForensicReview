import React from 'react';
import { ClinicalSummaryDeliverable, PatientInfo } from '../types/medicolegal';
import { FileText, Activity, Layers, Stethoscope, Printer, CheckCircle2 } from 'lucide-react';

interface Deliverable1SummaryProps {
  summary: ClinicalSummaryDeliverable;
  patientInfo?: PatientInfo;
}

export const Deliverable1Summary: React.FC<Deliverable1SummaryProps> = ({
  summary
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Deliverable 1 of 5
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Clinical Records Summary & Diagnostic Synthesis
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive neurosurgical synthesis of patient records, diagnostic imaging scans, and physical examination findings.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Summary (PDF)</span>
        </button>
      </div>

      {/* Executive Overview Card */}
      <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Executive Clinical Overview</span>
        </h3>
        <p className="text-sm text-slate-800 leading-relaxed font-serif">
          {summary.executiveOverview}
        </p>
      </div>

      {/* HPI & Clinical Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* History of Present Illness */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>History of Present Illness (HPI) & Onset</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {summary.historyOfPresentIllness}
          </p>
        </div>

        {/* Treatment Course Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Conservative Care Course & Surgical Failure</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {summary.treatmentCourseSummary}
          </p>
        </div>

      </div>

      {/* Objective Diagnostic Imaging Scans */}
      {summary.imagingFindings && summary.imagingFindings.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Objective Diagnostic Imaging & Electrodiagnostic Studies</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {summary.imagingFindings.map((img, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-900 text-sm">{img.scanType}</span>
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 self-start sm:self-auto">
                    {img.date} — {img.facility}
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  <strong className="text-slate-900">Radiographic Findings:</strong> {img.findings}
                </p>
                {img.nerveRootImpingement && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
                    <strong>Nerve Root Impingement / Radicular Correlate:</strong> {img.nerveRootImpingement}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Serial Physical Examination Findings */}
      {summary.physicalExamHighlights && summary.physicalExamHighlights.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Serial Objective Physical Examination Highlights</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.physicalExamHighlights.map((exam, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900">{exam.date}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{exam.provider}</span>
                </div>
                {exam.cervicalRangeOfMotion && (
                  <div>
                    <span className="font-semibold text-slate-800 block">Cervical ROM:</span>
                    <span className="text-slate-600">{exam.cervicalRangeOfMotion}</span>
                  </div>
                )}
                {exam.lumbarFindings && (
                  <div>
                    <span className="font-semibold text-slate-800 block">Lumbar Signs:</span>
                    <span className="text-slate-600">{exam.lumbarFindings}</span>
                  </div>
                )}
                {exam.neurologicalDeficits && (
                  <div>
                    <span className="font-semibold text-red-800 block">Neurological Deficit:</span>
                    <span className="text-red-700">{exam.neurologicalDeficits}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
