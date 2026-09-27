import React, { useState } from 'react';
import { 
  CaseProfile, 
  ClinicalMilestone, 
  StanceMode,
  EventCategory,
  EventSeverity
} from '../types/forensic';
import { SectionGuideBanner } from './SectionGuideBanner';
import { 
  Clock, 
  Milestone, 
  AlertCircle, 
  AlertTriangle,
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Search,
  Filter,
  Eye,
  Printer,
  Table as TableIcon,
  GitCommit,
  User,
  Building,
  Quote,
  Scale,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  Timer,
  FileCheck
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
  const [timelineMode, setTimelineMode] = useState<'GRAPHIC' | 'TABLE'>('GRAPHIC');
  const [filterStance, setFilterStance] = useState<'ALL' | 'DEFENSE' | 'PLAINTIFF' | 'CRITICAL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPhase, setFilterPhase] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [compareBothStances, setCompareBothStances] = useState<boolean>(false);

  const isDefenseStance = stance === 'DEFENSE';

  // Phases of care
  const phases = [
    { id: 'ALL', label: 'All Phases' },
    { id: 'PRE_ADMISSION', label: 'I. Presentation & Triage' },
    { id: 'DIAGNOSTIC_WORKUP', label: 'II. Diagnostic Evaluation' },
    { id: 'CRITICAL_WINDOW', label: 'III. Critical Window' },
    { id: 'OPERATIVE_OR', label: 'IV. Surgical / OR Course' },
    { id: 'DETERIORATION_ESCALATION', label: 'V. Escalation & Deterioration' },
    { id: 'SECONDARY_INTERVENTION', label: 'VI. Secondary Rescue' },
    { id: 'DISCHARGE_OUTCOME', label: 'VII. Outcome & Prognosis' }
  ];

  // Filtered milestones
  const filteredMilestones = currentCase.milestones.filter(m => {
    // Stance filter
    if (filterStance === 'DEFENSE' && !m.defenseFlag?.isDefenseAnchor) return false;
    if (filterStance === 'PLAINTIFF' && !m.plaintiffFlag?.isBreach) return false;
    if (filterStance === 'CRITICAL' && m.severity !== 'critical') return false;

    // Category filter
    if (filterCategory !== 'ALL' && m.category !== filterCategory) return false;

    // Phase filter
    if (filterPhase !== 'ALL' && m.phase !== filterPhase) return false;

    // Search filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchSummary = m.summary.toLowerCase().includes(q);
      const matchQuote = m.verbatimQuote?.toLowerCase().includes(q) || false;
      const matchProvider = m.provider.toLowerCase().includes(q);
      const matchBates = m.batesNumber.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchQuote && !matchProvider && !matchBates) {
        return false;
      }
    }

    return true;
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

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'SURGICAL_OR':
        return { label: 'Surgical OR', bg: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'IMAGING':
        return { label: 'Diagnostic Imaging', bg: 'bg-indigo-950 text-indigo-300 border-indigo-800' };
      case 'PHYSICIAN_CONSULT':
        return { label: 'Physician Consult', bg: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      case 'ED_TRIAGE':
        return { label: 'ED Triage', bg: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'ADVERSE_EVENT':
        return { label: 'Adverse Event', bg: 'bg-red-950 text-red-300 border-red-800' };
      case 'LAB_CRITICAL':
        return { label: 'Critical Lab', bg: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'ICU_CARE':
        return { label: 'ICU Care', bg: 'bg-teal-950 text-teal-300 border-teal-800' };
      default:
        return { label: cat.replace('_', ' '), bg: 'bg-slate-900 text-slate-300 border-slate-700' };
    }
  };

  const getSeverityIndicator = (sev: EventSeverity) => {
    switch (sev) {
      case 'critical':
        return { ring: 'ring-red-500 bg-red-500', text: 'Critical', bg: 'bg-red-950/80 text-red-300 border-red-800' };
      case 'caution':
        return { ring: 'ring-amber-500 bg-amber-500', text: 'Caution', bg: 'bg-amber-950/80 text-amber-300 border-amber-800' };
      default:
        return { ring: 'ring-cyan-500 bg-cyan-500', text: 'Standard', bg: 'bg-slate-900 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Protocol Guide Banner */}
      <SectionGuideBanner
        sectionId="timeline"
        onOpenFullGuide={onOpenFullGuide}
      />

      {/* Top Courtroom Chronology Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* View Switcher: Interactive Graphic Flow vs Courtroom Table */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimelineMode('GRAPHIC')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timelineMode === 'GRAPHIC'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Interactive Graphic Chronology</span>
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
              <span>Courtroom Exhibit Table</span>
            </button>
          </div>

          {/* Stance Filter Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStance('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterStance === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events ({currentCase.milestones.length})
            </button>
            <button
              onClick={() => setFilterStance('DEFENSE')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                filterStance === 'DEFENSE'
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700 font-semibold'
                  : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Defense Anchors</span>
            </button>
            <button
              onClick={() => setFilterStance('PLAINTIFF')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                filterStance === 'PLAINTIFF'
                  ? 'bg-red-900/60 text-red-300 border border-red-700 font-semibold'
                  : 'text-slate-400 hover:text-red-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Plaintiff Breaches</span>
            </button>
            <button
              onClick={() => setFilterStance('CRITICAL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                filterStance === 'CRITICAL'
                  ? 'bg-amber-900/60 text-amber-300 border border-amber-700 font-semibold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Critical Alerts</span>
            </button>
          </div>
        </div>

        {/* Dual Stance Side-by-Side Toggle & Print Actions */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 hover:border-slate-700">
            <input
              type="checkbox"
              checked={compareBothStances}
              onChange={(e) => setCompareBothStances(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Side-by-Side Dual Stance Lens</span>
          </label>

          {timelineMode === 'GRAPHIC' ? (
            <button
              onClick={handlePrintGraphic}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-colors"
              title="Print Chronological Event Stream"
            >
              <Printer className="w-4 h-4" />
              <span>Print Timeline</span>
            </button>
          ) : (
            <button
              onClick={handlePrintTable}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-colors"
              title="Print Itemized Legal Table Exhibit"
            >
              <Printer className="w-4 h-4" />
              <span>Print Exhibit Table</span>
            </button>
          )}
        </div>

      </div>

      {/* Clinical Phase Navigation Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Care Epochs:</span>
          </span>
          {phases.map((ph) => {
            const isSelected = filterPhase === ph.id;
            return (
              <button
                key={ph.id}
                onClick={() => setFilterPhase(ph.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/60'
                }`}
              >
                {ph.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Search & Facet Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search clinical facts, quotes, providers, Bates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Event Categories</option>
            <option value="PHYSICIAN_CONSULT">Physician Consults & Orders</option>
            <option value="IMAGING">Diagnostic Imaging (CT, MRI, X-ray)</option>
            <option value="SURGICAL_OR">Surgical OR & Procedures</option>
            <option value="ED_TRIAGE">ED Triage & Presentation</option>
            <option value="ADVERSE_EVENT">Adverse Events & Arrest</option>
            <option value="LAB_CRITICAL">Critical Laboratory Panels</option>
            <option value="ICU_CARE">ICU Care & Monitoring</option>
          </select>
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-400 font-mono text-[11px]">
          <span>Displaying: <strong className="text-white">{filteredMilestones.length}</strong> of {currentCase.milestones.length} Events</span>
          <span>Bates Authenticated</span>
        </div>
      </div>

      {/* Main Timeline View Canvas */}
      {timelineMode === 'GRAPHIC' ? (
        
        /* ---------------- GRAPHIC CANVAS: VISUAL CHRONOLOGY STREAM ---------------- */
        <div className="print-graphic-target">
          {/* Courtroom Print Header (Visible only when printed) */}
          <div className="hidden print:block mb-6 pb-4 border-b-2 border-black text-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight">
                  Courtroom Chronological Event Exhibit & Standard of Care Audit
                </h1>
                <p className="text-sm mt-1 text-gray-700">
                  Matter: <strong>{currentCase.caseName || 'Forensic Medical Review'}</strong> | Docket: {currentCase.caseNumber || 'N/A'}
                </p>
              </div>
              <div className="text-right text-xs font-mono text-gray-600">
                <div>Retaining Stance: <strong>{stance}</strong></div>
                <div>Prepared by: Dr. A. Alex Mohit</div>
                <div>Confidential Attorney Work Product / Rule 26 Exhibit</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Interactive Chronological Event Stream */}
          <div className="lg:col-span-2 space-y-6">
            
            {filteredMilestones.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
                <Milestone className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className="font-semibold text-slate-300">No clinical events match the active filter criteria.</p>
                <p className="text-slate-400 mt-1">
                  Adjust your search keyword, category, or legal stance filter above.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-8 before:absolute before:top-0 before:bottom-0 before:-left-[2px] before:w-[2px] before:bg-gradient-to-b before:from-cyan-500 before:via-blue-600 before:to-slate-800">
                {filteredMilestones.map((m, index) => {
                  const catBadge = getCategoryBadge(m.category);
                  const sev = getSeverityIndicator(m.severity);
                  const isSelected = selectedMilestone?.id === m.id;
                  const isBreach = m.plaintiffFlag?.isBreach;
                  const isAnchor = m.defenseFlag?.isDefenseAnchor;

                  return (
                    <div 
                      key={m.id} 
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedMilestone(m)}
                    >
                      {/* Timeline Node Point on Left Spine */}
                      <div className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 border-slate-950 transition-all ${
                        isBreach 
                          ? 'bg-red-500 ring-4 ring-red-500/20' 
                          : isAnchor 
                          ? 'bg-blue-500 ring-4 ring-blue-500/20' 
                          : 'bg-cyan-500 ring-4 ring-cyan-500/20'
                      } ${isSelected ? 'scale-125 ring-8 ring-cyan-500/30' : ''}`} />

                      {/* Event Fact Card */}
                      <div className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all ${
                        isSelected 
                          ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-950/50' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}>
                        
                        {/* Top Metadata Header: Timestamp, Time Delta, Category */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
                          
                          {/* Time & Delta */}
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-xs flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                              <Clock className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{m.timeDisplay || m.timestamp}</span>
                            </span>

                            {m.relativeTimeDelta && (
                              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                                <Timer className="w-3 h-3 text-cyan-400" />
                                <span>{m.relativeTimeDelta}</span>
                              </span>
                            )}
                          </div>

                          {/* Category & Bates Pin */}
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${catBadge.bg}`}>
                              {catBadge.label}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectMilestoneForDoc(m.pageNumber, m.batesNumber);
                              }}
                              className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-cyan-400 font-mono text-[11px] font-bold border border-cyan-900/60 transition-colors flex items-center gap-1"
                              title="Click to view underlying source record page"
                            >
                              <span>{m.batesNumber}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>

                        </div>

                        {/* Title & Clinician Attribution */}
                        <div className="mb-3">
                          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <span>{m.title}</span>
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1 text-slate-300">
                              <User className="w-3.5 h-3.5 text-cyan-400" />
                              <strong className="text-white">{m.provider}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-slate-500" />
                              <span>{m.facilityDepartment}</span>
                            </span>
                          </div>
                        </div>

                        {/* Objective Clinical Fact Summary */}
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                          {m.summary}
                        </p>

                        {/* Verbatim Record Excerpt Box */}
                        {m.verbatimQuote && (
                          <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                            <Quote className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5 opacity-80" />
                            <div className="text-[11px] font-mono text-slate-300 italic leading-relaxed">
                              "{m.verbatimQuote}"
                              <span className="not-italic block mt-1 text-[10px] text-cyan-400 font-bold">
                                — Contemporaneous Chart Note • Bates {m.batesNumber} p. {m.pageNumber}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Standard of Care Delay Benchmark Comparison */}
                        {m.benchmarkComparison && (
                          <div className={`mb-3 p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono ${
                            m.benchmarkComparison.status === 'COMPLIANT'
                              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                              : m.benchmarkComparison.status === 'DELAYED'
                              ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                              : 'bg-red-950/30 border-red-800/60 text-red-300'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Timer className="w-3.5 h-3.5" />
                              <span>Standard: <strong>{m.benchmarkComparison.expectedStandard}</strong></span>
                            </div>
                            <div>
                              <span>Actual: <strong>{m.benchmarkComparison.actualTime}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* Dual-Stance Legal Analysis Callouts */}
                        <div className="pt-3 border-t border-slate-800/80 space-y-2.5 text-xs">
                          
                          {/* DEFENSE LENS */}
                          {(isDefenseStance || compareBothStances) && m.defenseFlag?.isDefenseAnchor && (
                            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold flex items-center gap-1.5 text-blue-400">
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>Defense Anchor: {m.defenseFlag.anchorCategory.replace('_', ' ')}</span>
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 font-mono">
                                  STANDARD OF CARE MET
                                </span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-blue-100">
                                {m.defenseFlag.argument}
                              </p>
                              {m.defenseFlag.clinicalRationale && (
                                <p className="text-[10px] text-blue-300/80 mt-1 italic">
                                  Clinical Rationale: {m.defenseFlag.clinicalRationale}
                                </p>
                              )}
                            </div>
                          )}

                          {/* PLAINTIFF LENS */}
                          {(!isDefenseStance || compareBothStances) && m.plaintiffFlag?.isBreach && (
                            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold flex items-center gap-1.5 text-red-400">
                                  <ShieldAlert className="w-4 h-4" />
                                  <span>Plaintiff Breach: {m.plaintiffFlag.breachCategory.replace('_', ' ')}</span>
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-900/60 text-red-300 font-mono">
                                  STANDARD DEVIATION
                                </span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-red-100">
                                {m.plaintiffFlag.argument}
                              </p>
                              {m.plaintiffFlag.standardOfCareRule && (
                                <p className="text-[10px] text-red-300/80 mt-1 italic">
                                  Benchmark Rule: {m.plaintiffFlag.standardOfCareRule}
                                </p>
                              )}
                            </div>
                          )}

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Right Col: Deep Dive Forensic Event Inspector */}
          <div className="space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl sticky top-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Forensic Fact Inspector
                  </h4>
                </div>
                {selectedMilestone && (
                  <span className="font-mono text-[11px] text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    {selectedMilestone.batesNumber}
                  </span>
                )}
              </div>

              {selectedMilestone ? (
                <div className="space-y-4 text-xs">
                  
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Event Heading & Timing
                    </span>
                    <h5 className="font-bold text-white text-sm">
                      {selectedMilestone.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1 text-slate-400 font-mono text-[11px]">
                      <span>{selectedMilestone.timeDisplay}</span>
                      {selectedMilestone.relativeTimeDelta && (
                        <span>• Delta: <strong className="text-cyan-400">{selectedMilestone.relativeTimeDelta}</strong></span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Responsible Clinician
                    </span>
                    <p className="font-semibold text-slate-200">
                      {selectedMilestone.provider}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Department: {selectedMilestone.facilityDepartment}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Objective Chart Evidence
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedMilestone.summary}
                    </p>
                  </div>

                  {selectedMilestone.verbatimQuote && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                        Verbatim Record Citation
                      </span>
                      <p className="font-mono text-[11px] text-slate-200 italic leading-relaxed">
                        "{selectedMilestone.verbatimQuote}"
                      </p>
                    </div>
                  )}

                  {/* Benchmark Delay Check */}
                  {selectedMilestone.benchmarkComparison && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Standard of Care Timing Audit
                      </span>
                      <p className="text-[11px] text-slate-300">
                        Benchmark: <strong className="text-white">{selectedMilestone.benchmarkComparison.expectedStandard}</strong>
                      </p>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Actual Recorded: <strong className={
                          selectedMilestone.benchmarkComparison.status === 'COMPLIANT' 
                            ? 'text-emerald-400' 
                            : 'text-red-400'
                        }>{selectedMilestone.benchmarkComparison.actualTime}</strong>
                      </p>
                    </div>
                  )}

                  {/* Action: Open exact Bates page */}
                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onSelectMilestoneForDoc(selectedMilestone.pageNumber, selectedMilestone.batesNumber)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Inspect Source Record at Bates {selectedMilestone.batesNumber}</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Select any event card on the timeline to inspect verbatim quotes, standard of care benchmarks, and Bates pins.
                </div>
              )}

            </div>

          </div>

        </div>
        </div>

      ) : (

        /* ---------------- TABLE VIEW: COURTROOM EXHIBIT TABLE ---------------- */
        <div className="print-table-target bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Courtroom Print Header (Visible only when printed) */}
          <div className="hidden print:block p-4 mb-4 border-b-2 border-black text-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight">
                  Itemized Courtroom Chronological Event Exhibit & Standard of Care Audit
                </h1>
                <p className="text-sm mt-1 text-gray-700">
                  Matter: <strong>{currentCase.caseName || 'Forensic Medical Review'}</strong> | Docket: {currentCase.caseNumber || 'N/A'}
                </p>
              </div>
              <div className="text-right text-xs font-mono text-gray-600">
                <div>Retaining Stance: <strong>{stance}</strong></div>
                <div>Prepared by: Dr. A. Alex Mohit</div>
                <div>Rule 26 Medical Expert Disclosures</div>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Courtroom Chronological Event Exhibit ({filteredMilestones.length} Events)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Itemized trial timeline formatted with Bates pin-cites and dual legal stance determinations
              </p>
            </div>
            <span className="font-mono text-[10px] text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              FORMAL RULE 26 DISCLOSURE READY
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3 w-32">Date / Time (T+)</th>
                  <th className="p-3 w-40">Phase & Category</th>
                  <th className="p-3 w-48">Responsible Clinician</th>
                  <th className="p-3 min-w-[280px]">Clinical Event & Verbatim Record Quote</th>
                  <th className="p-3 min-w-[280px]">Standard of Care / Legal Stance Analysis</th>
                  <th className="p-3 w-32 text-right">Bates Pin-Cite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMilestones.map((m) => {
                  const cat = getCategoryBadge(m.category);
                  const isBreach = m.plaintiffFlag?.isBreach;
                  const isAnchor = m.defenseFlag?.isDefenseAnchor;

                  return (
                    <tr 
                      key={m.id} 
                      className={`hover:bg-slate-850/60 transition-colors ${
                        isBreach && !isDefenseStance ? 'bg-red-950/10' : isAnchor && isDefenseStance ? 'bg-blue-950/10' : ''
                      }`}
                    >
                      {/* Timestamp & Delta */}
                      <td className="p-3 align-top font-mono">
                        <div className="font-bold text-white text-xs">{m.timeDisplay || m.timestamp}</div>
                        {m.relativeTimeDelta && (
                          <div className="text-[10px] text-cyan-400 font-bold mt-0.5">{m.relativeTimeDelta}</div>
                        )}
                      </td>

                      {/* Phase & Category */}
                      <td className="p-3 align-top">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${cat.bg}`}>
                          {cat.label}
                        </span>
                        {m.phase && (
                          <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                            {m.phase.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      {/* Provider & Facility */}
                      <td className="p-3 align-top">
                        <strong className="text-white block">{m.provider}</strong>
                        <span className="text-[11px] text-slate-400">{m.facilityDepartment}</span>
                      </td>

                      {/* Narrative & Quote */}
                      <td className="p-3 align-top space-y-1.5">
                        <strong className="text-slate-100 block text-xs">{m.title}</strong>
                        <p className="text-slate-300 leading-relaxed text-[11px]">{m.summary}</p>
                        {m.verbatimQuote && (
                          <blockquote className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-cyan-300 italic">
                            "{m.verbatimQuote}"
                          </blockquote>
                        )}
                      </td>

                      {/* Legal Stance Analysis */}
                      <td className="p-3 align-top space-y-1.5">
                        {isDefenseStance || compareBothStances ? (
                          m.defenseFlag?.isDefenseAnchor ? (
                            <div className="p-2 rounded bg-blue-950/40 border border-blue-900/60 text-[11px] text-blue-200">
                              <strong className="text-blue-400 block text-[10px] uppercase font-bold">
                                Defense Anchor ({m.defenseFlag.anchorCategory.replace('_', ' ')})
                              </strong>
                              <p className="mt-0.5">{m.defenseFlag.argument}</p>
                            </div>
                          ) : null
                        ) : null}

                        {!isDefenseStance || compareBothStances ? (
                          m.plaintiffFlag?.isBreach ? (
                            <div className="p-2 rounded bg-red-950/40 border border-red-900/60 text-[11px] text-red-200">
                              <strong className="text-red-400 block text-[10px] uppercase font-bold">
                                Plaintiff Breach ({m.plaintiffFlag.breachCategory.replace('_', ' ')})
                              </strong>
                              <p className="mt-0.5">{m.plaintiffFlag.argument}</p>
                            </div>
                          ) : null
                        ) : null}
                      </td>

                      {/* Bates Pin */}
                      <td className="p-3 align-top text-right">
                        <button
                          onClick={() => onSelectMilestoneForDoc(m.pageNumber, m.batesNumber)}
                          className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-cyan-400 font-mono text-xs font-bold border border-cyan-800/80 transition-colors inline-flex items-center gap-1"
                          title="Click to view underlying source record page"
                        >
                          <span>{m.batesNumber}</span>
                          <Eye className="w-3 h-3" />
                        </button>
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                          Page {m.pageNumber}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      )}

    </div>
  );
};
