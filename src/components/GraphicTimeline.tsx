import React, { useState } from 'react';
import { 
  CaseProfile, 
  ClinicalMilestone, 
  MedicationEvent, 
  VitalSignPoint, 
  StanceMode 
} from '../types/forensic';
import { VitalsChart } from './VitalsChart';
import { SectionGuideBanner } from './SectionGuideBanner';
import { 
  Clock, 
  Pill, 
  Milestone, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  ChevronRight, 
  Filter,
  Eye,
  Activity,
  Layers,
  Sparkles,
  Printer,
  Table as TableIcon,
  LineChart as ChartIcon
} from 'lucide-react';

interface GraphicTimelineProps {
  currentCase: CaseProfile;
  stance: StanceMode;
  onOpenFullGuide: () => void;
  onSelectMilestoneForDoc: (page: number, bates: string) => void;
}

export const GraphicTimeline: React.FC<GraphicTimelineProps> = ({
  currentCase,
  stance,
  onOpenFullGuide,
  onSelectMilestoneForDoc
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<ClinicalMilestone | null>(
    currentCase.milestones.length > 0 ? currentCase.milestones[0] : null
  );
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [timelineMode, setTimelineMode] = useState<'GRAPHIC' | 'TABLE'>('GRAPHIC');

  const isDefense = stance === 'DEFENSE';

  const filteredMilestones = currentCase.milestones.filter(m => {
    if (filterCategory === 'ALL') return true;
    return m.category === filterCategory;
  });

  const handlePrintGraphic = () => {
    document.body.classList.add('printing-graphic');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-graphic');
    }, 100);
  };

  const handlePrintTable = () => {
    document.body.classList.add('printing-table');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-table');
    }, 100);
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Protocol Guide Banner */}
      <SectionGuideBanner
        sectionId="timeline"
        onOpenFullGuide={onOpenFullGuide}
      />

      {/* Top Action & Mode Switch Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimelineMode('GRAPHIC')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timelineMode === 'GRAPHIC'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChartIcon className="w-3.5 h-3.5" />
              <span>Graphic & Chart Canvas</span>
            </button>
            <button
              onClick={() => setTimelineMode('TABLE')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timelineMode === 'TABLE'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Itemized Table View</span>
            </button>
          </div>
        </div>

        {/* Independent Print Buttons */}
        <div className="flex items-center gap-2">
          {timelineMode === 'GRAPHIC' ? (
            <button
              onClick={handlePrintGraphic}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-colors"
              title="Print Graphic Timeline and Hemodynamic Curve independently"
            >
              <Printer className="w-4 h-4" />
              <span>Print Graphic Timeline</span>
            </button>
          ) : (
            <button
              onClick={handlePrintTable}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-colors"
              title="Print Chronological Table independently"
            >
              <Printer className="w-4 h-4" />
              <span>Print Timeline Table</span>
            </button>
          )}
        </div>
      </div>

      {timelineMode === 'GRAPHIC' ? (
        /* GRAPHIC CANVAS VIEW */
        <>
          {/* TRACK 1: Graphical Hemodynamic Chart */}
          <VitalsChart
            vitals={currentCase.vitals}
            onSelectReading={(v) => onSelectMilestoneForDoc(v.pageNumber, v.batesNumber)}
          />

          {/* TRACK 2: Medication Administration Record (MAR) Graphic Track */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Medication Administration Record (MAR) Chrono-Gantt
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                  {currentCase.medications.length} Administered Agents
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Bar Code Administration & Titration Laps
              </span>
            </div>

            {currentCase.medications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No medication administrations parsed yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentCase.medications.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${
                        med.status === 'delayed'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        <Pill className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{med.drugName}</span>
                          <span className="font-mono text-[11px] text-slate-400">{med.dose}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {med.route}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {med.indicationNotes || 'Administered per standing protocol'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">ADMINISTERED BY</span>
                        <span className="text-[11px] font-mono text-slate-300">{med.administeredBy}</span>
                      </div>

                      <button
                        onClick={() => onSelectMilestoneForDoc(med.pageNumber, med.batesNumber)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-[11px] border border-slate-700 transition-colors flex items-center gap-1"
                      >
                        <span>{med.batesNumber}</span>
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRACK 3 & 4: Clinical Milestones & Stance-Weighted Evidentiary Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Milestone Sequence Cards */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Milestone className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Clinical Care Events & Interventions ({filteredMilestones.length})
                  </h4>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALL">All Event Categories</option>
                    <option value="ED_TRIAGE">ED Triage</option>
                    <option value="PHYSICIAN_CONSULT">Physician Consults</option>
                    <option value="IMAGING">Diagnostic Imaging</option>
                    <option value="SURGICAL_OR">Surgical OR</option>
                    <option value="ADVERSE_EVENT">Adverse Events</option>
                  </select>
                </div>
              </div>

              {filteredMilestones.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No clinical milestones in the timeline yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {filteredMilestones.map((m) => {
                    const isSelected = selectedMilestone?.id === m.id;
                    const stanceFlag = isDefense ? m.defenseFlag : m.plaintiffFlag;

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMilestone(m)}
                        className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? isDefense 
                              ? 'bg-blue-950/30 border-blue-600 shadow-md shadow-blue-950/40' 
                              : 'bg-red-950/30 border-red-600 shadow-md shadow-red-950/40'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Timeline Node Pip */}
                        <div className={`absolute -left-[23px] top-4.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                          m.severity === 'critical'
                            ? 'bg-red-500 ring-2 ring-red-900/50'
                            : m.severity === 'caution'
                            ? 'bg-amber-400'
                            : 'bg-cyan-500'
                        }`} />

                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-xs text-cyan-400">
                                {m.timeDisplay}
                              </span>
                              <span className="text-[10px] px-2 py-0.2 rounded-md font-mono bg-slate-800 text-slate-300 uppercase">
                                {m.category.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-400">• {m.provider}</span>
                            </div>

                            <h5 className="text-xs font-bold text-white">{m.title}</h5>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {m.summary}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectMilestoneForDoc(m.pageNumber, m.batesNumber);
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] border border-slate-700 flex items-center gap-1 transition-colors"
                            >
                              <span>{m.batesNumber}</span>
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Stance-Weighted Forensic Annotation Bar */}
                        {stanceFlag && (
                          <div className={`mt-3 p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                            isDefense
                              ? 'bg-blue-950/40 border-blue-900/60 text-blue-200'
                              : 'bg-red-950/40 border-red-900/60 text-red-200'
                          }`}>
                            {isDefense ? (
                              <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-semibold block text-[11px] uppercase tracking-wider">
                                {isDefense ? 'DEFENSE CLINICAL ANCHOR' : 'PLAINTIFF BREACH IDENTIFICATION'}
                              </span>
                              <span className="text-[11px] leading-relaxed opacity-95">
                                {stanceFlag.argument}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 1 Col: Event Inspector & Bates Anchor Detail */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-4 pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Evidentiary Node Inspector</span>
                </h4>

                {selectedMilestone ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">EVENT TIMESTAMP</span>
                      <span className="font-mono font-bold text-cyan-400 text-sm">{selectedMilestone.timestamp}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">PROVIDER & LOCATION</span>
                      <p className="font-semibold text-white">{selectedMilestone.provider}</p>
                      <p className="text-slate-400">{selectedMilestone.facilityDepartment}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">CLINICAL SUMMARY</span>
                      <p className="text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {selectedMilestone.summary}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono block">BATES VERIFICATION</span>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-300">Document Page: {selectedMilestone.pageNumber}</span>
                        <span className="font-bold text-cyan-400">{selectedMilestone.batesNumber}</span>
                      </div>
                    </div>

                    {/* Stance Perspective Breakdown */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Opposing Stance Perspectives
                      </span>
                      
                      <div className="space-y-2">
                        {selectedMilestone.plaintiffFlag && (
                          <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/40 text-[11px] text-red-300">
                            <strong className="text-red-400 block mb-0.5">Plaintiff Breach Argument:</strong>
                            {selectedMilestone.plaintiffFlag.argument}
                          </div>
                        )}

                        {selectedMilestone.defenseFlag && (
                          <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/40 text-[11px] text-blue-300">
                            <strong className="text-blue-400 block mb-0.5">Defense Clinical Justification:</strong>
                            {selectedMilestone.defenseFlag.argument}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Select any milestone on the timeline to inspect details.</p>
                )}
              </div>

              {selectedMilestone && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => onSelectMilestoneForDoc(selectedMilestone.pageNumber, selectedMilestone.batesNumber)}
                    className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Jump to Page {selectedMilestone.pageNumber} ({selectedMilestone.batesNumber})</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </>
      ) : (
        /* CHRONOLOGICAL TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-cyan-400" />
                <span>Chronological Medical Record Table Ledger ({currentCase.milestones.length} Events)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Itemized minute-by-minute care progression cross-referenced with exact Bates numbers
              </p>
            </div>
            <button
              onClick={handlePrintTable}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Table</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Setting / Dept</th>
                  <th className="p-3">Clinical Care Event</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Stance Evaluation</th>
                  <th className="p-3 text-right">Bates Citation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentCase.milestones.map((m) => {
                  const flag = isDefense ? m.defenseFlag : m.plaintiffFlag;
                  return (
                    <tr key={m.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {m.timeDisplay}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {m.facilityDepartment}
                      </td>
                      <td className="p-3">
                        <strong className="text-white block">{m.title}</strong>
                        <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{m.summary}</p>
                      </td>
                      <td className="p-3 text-slate-300 whitespace-nowrap font-medium">
                        {m.provider}
                      </td>
                      <td className="p-3">
                        {flag ? (
                          <div className={`p-1.5 rounded text-[11px] border ${
                            isDefense 
                              ? 'bg-blue-950/30 text-blue-300 border-blue-800/60' 
                              : 'bg-red-950/30 text-red-300 border-red-800/60'
                          }`}>
                            <span className="font-bold block uppercase text-[9px]">
                              {isDefense ? 'Defense Anchor' : 'Plaintiff Breach'}
                            </span>
                            {flag.argument}
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[10px]">Standard Care</span>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectMilestoneForDoc(m.pageNumber, m.batesNumber)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] border border-slate-700 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{m.batesNumber}</span>
                          <Eye className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE INDEPENDENT GRAPHIC TIMELINE (Rendered Only During Print)        */}
      {/* ========================================================================= */}
      <div className="hidden print:block print-graphic-target bg-white text-slate-900 p-8 font-sans">
        <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
          <h1 className="text-lg font-bold uppercase tracking-widest text-slate-900">
            Forensic Chronological Timeline Exhibit (Graphic & Hemodynamic Trajectory)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            EVIDENTIARY EXHIBIT • CASE: {currentCase.caseName || 'CONFIDENTIAL MATTER'}
          </p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Docket No: {currentCase.caseNumber || 'N/A'} • Retaining Side: {isDefense ? 'DEFENSE' : 'PLAINTIFF'}
          </p>
        </div>

        {/* Graphic Vitals Chart Embedded in Print */}
        <div className="border border-slate-300 rounded p-4 mb-6">
          <h2 className="text-xs font-bold uppercase text-slate-800 mb-2">
            Hemodynamic Vital Signs & Shock Trajectory Curve
          </h2>
          <VitalsChart
            vitals={currentCase.vitals}
            onSelectReading={() => {}}
          />
        </div>

        {/* MAR Summary in Print */}
        <div className="border border-slate-300 rounded p-4 mb-6">
          <h2 className="text-xs font-bold uppercase text-slate-800 mb-2">
            Medication Administration Record (MAR) Chrono-Summary
          </h2>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2">Medication</th>
                <th className="p-2">Dose / Route</th>
                <th className="p-2">Administered By</th>
                <th className="p-2">Status</th>
                <th className="p-2">Bates Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentCase.medications.map(m => (
                <tr key={m.id}>
                  <td className="p-2 font-bold">{m.drugName}</td>
                  <td className="p-2">{m.dose} ({m.route})</td>
                  <td className="p-2">{m.administeredBy}</td>
                  <td className="p-2 uppercase font-mono">{m.status}</td>
                  <td className="p-2 font-mono">{m.batesNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attestation */}
        <div className="pt-4 border-t border-slate-300 text-xs flex justify-between items-end">
          <div>
            <p className="font-bold text-slate-900">A. Alex Mohit, MD, PhD</p>
            <p className="text-slate-600">Forensic Expert Consultant • Board Certified Neurosurgeon</p>
          </div>
          <div className="text-right text-slate-500 font-mono text-[10px]">
            Generated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE INDEPENDENT TABLE TIMELINE (Rendered Only During Print)          */}
      {/* ========================================================================= */}
      <div className="hidden print:block print-table-target bg-white text-slate-900 p-8 font-sans">
        <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
          <h1 className="text-lg font-bold uppercase tracking-widest text-slate-900">
            Chronological Care Events & Standard of Care Ledger
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            ITEMIZED COURT EXHIBIT • MATTER: {currentCase.caseName || 'CONFIDENTIAL MATTER'}
          </p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Docket No: {currentCase.caseNumber || 'N/A'} • Retaining Side: {isDefense ? 'DEFENSE' : 'PLAINTIFF'}
          </p>
        </div>

        <table className="w-full text-left text-xs border border-slate-300">
          <thead className="bg-slate-100 border-b border-slate-300">
            <tr>
              <th className="p-2 border-r border-slate-300">Timestamp</th>
              <th className="p-2 border-r border-slate-300">Setting / Dept</th>
              <th className="p-2 border-r border-slate-300">Clinical Event & Documentation</th>
              <th className="p-2 border-r border-slate-300">Provider</th>
              <th className="p-2 border-r border-slate-300">Forensic Stance Opinion</th>
              <th className="p-2">Bates Citation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currentCase.milestones.map((m) => {
              const flag = isDefense ? m.defenseFlag : m.plaintiffFlag;
              return (
                <tr key={m.id}>
                  <td className="p-2 font-mono font-bold border-r border-slate-200">{m.timeDisplay}</td>
                  <td className="p-2 border-r border-slate-200">{m.facilityDepartment}</td>
                  <td className="p-2 border-r border-slate-200">
                    <strong>{m.title}</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">{m.summary}</p>
                  </td>
                  <td className="p-2 border-r border-slate-200">{m.provider}</td>
                  <td className="p-2 border-r border-slate-200">
                    {flag ? (
                      <span className="text-[11px] text-slate-800">
                        <strong>[{isDefense ? 'DEFENSE' : 'PLAINTIFF'}]: </strong>
                        {flag.argument}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Standard care observed</span>
                    )}
                  </td>
                  <td className="p-2 font-mono font-bold text-slate-800">{m.batesNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Attestation */}
        <div className="pt-6 border-t border-slate-300 text-xs flex justify-between items-end mt-6">
          <div>
            <p className="font-bold text-slate-900">A. Alex Mohit, MD, PhD</p>
            <p className="text-slate-600">Forensic Expert Consultant • Board Certified Neurosurgeon</p>
          </div>
          <div className="text-right text-slate-500 font-mono text-[10px]">
            Generated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

    </div>
  );
};
