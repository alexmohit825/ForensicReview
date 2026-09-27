import React from 'react';
import { CausationOpinionDeliverable, PatientInfo } from '../types/medicolegal';
import { Scale, ShieldAlert, Award, FileCheck, CheckCircle2, Printer } from 'lucide-react';

interface Deliverable2CausationProps {
  causation: CausationOpinionDeliverable;
  patientInfo: PatientInfo;
}

export const Deliverable2Causation: React.FC<Deliverable2CausationProps> = ({
  causation,
  patientInfo
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Deliverable 2 of 5
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Causation Determination & Forensic Medical Opinion
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Forensic analysis of proximate causation, Washington eggshell skull doctrine, and medical necessity.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Opinion (PDF)</span>
        </button>
      </div>

      {/* Formal Sworn Medical Opinion Banner */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/40 rounded-2xl border-2 border-blue-600 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Award className="w-5 h-5 text-blue-600" />
          <span>Expert Witness Medical Opinion Statement</span>
        </div>
        
        <blockquote className="text-base sm:text-lg font-serif font-bold text-slate-900 leading-relaxed pl-4 border-l-4 border-blue-600 italic">
          "{causation.formalMedicalOpinion}"
        </blockquote>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Standard of Care: {causation.standardOfCareDetermination}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
            Standard: Reasonable Degree of Medical Probability (&gt;50%)
          </span>
        </div>
      </div>

      {/* Eggshell Skull & Biomechanics 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Washington Eggshell Skull Law & Pre-Existing Aggravation */}
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>Washington WPI 30.17 (Eggshell Skull / Aggravation)</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Activation of Asymptomatic Pre-Existing Anatomy
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {causation.eggshellSkullAnalysis}
          </p>
        </div>

        {/* Biomechanical Causation Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-900 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>Collision Biomechanics & Annular Tear Forces</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            Rotational Shear & Axial Torque Mechanism
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {causation.biomechanicalCausation}
          </p>
        </div>

      </div>

      {/* Prognosis, Future Care & Damages Card */}
      {causation.prognosisAndFutureCare && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Future Medical Necessity, Surgical Plan & Prognosis</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {causation.prognosisAndFutureCare}
          </p>
        </div>
      )}

      {/* Expert Attestation Signature Block */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-900 block text-sm">A. Alex Mohit, MD, PhD</span>
          <span>Board-Certified Neurosurgeon & Complex Spine Specialist</span>
          <div className="text-[11px] text-slate-400 mt-1">
            Attestation: Prepared pursuant to ER 702 and applicable Federal / Washington Evidence Rules.
          </div>
        </div>
        <div className="text-right font-mono text-[11px] text-slate-500">
          <div>Case ID: {patientInfo.caseCaption}</div>
          <div>Date: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

    </div>
  );
};
