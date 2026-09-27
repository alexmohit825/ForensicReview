import React, { useState } from 'react';
import { TimelineEvent, PatientInfo } from '../types/medicolegal';
import { LineChart, Table as TableIcon, ArrowDown, Printer, Calendar } from 'lucide-react';

interface Deliverable3TimelineProps {
  timeline: TimelineEvent[];
  patientInfo?: PatientInfo;
}

export const Deliverable3Timeline: React.FC<Deliverable3TimelineProps> = ({
  timeline
}) => {
  const [viewMode, setViewMode] = useState<'BOTH' | 'GRAPHIC' | 'TABLE'>('BOTH');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredEvents = timeline.filter(ev => 
    ev.clinicVisit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.oneSentenceDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Deliverable 3 of 5
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Chronological Timeline & Encounter Table
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual flowchart with directional flow arrows (↓) and structured 3-column table with 1-sentence clinical encounter summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('BOTH')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'BOTH' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setViewMode('GRAPHIC')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'GRAPHIC' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Graphic (Arrows ↓)
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'TABLE' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table Form
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print (PDF)</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Graphic Flowchart with Dates & Connecting Arrows (↓) */}
      {(viewMode === 'GRAPHIC' || viewMode === 'BOTH') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Visual Flowchart Chain of Clinical Encounters
              </h3>
            </div>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold border border-blue-200">
              {timeline.length} Milestones (Sequential Flow ↓)
            </span>
          </div>

          <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-blue-200">
            {timeline.map((ev, index) => (
              <div key={index} className="relative group">
                
                {/* Visual Node Bullet */}
                <div className={`absolute -left-6 sm:-left-10 top-1.5 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-bold shadow-xs ${
                  ev.significance === 'CRITICAL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-400 text-white'
                }`}>
                  {index + 1}
                </div>

                {/* Event Card */}
                <div className="bg-slate-50 hover:bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>{ev.date}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-blue-900 font-semibold">{ev.clinicVisit}</span>
                    </div>
                    {ev.significance === 'CRITICAL' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 self-start sm:self-auto">
                        Critical Milestone
                      </span>
                    )}
                  </div>

                  {/* Required: Exact 1-Sentence Description */}
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                    {ev.oneSentenceDescription}
                  </p>

                  {/* Verbatim Clinical Quote */}
                  {ev.verbatimExcerpt && (
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-serif text-slate-700 italic border-l-4 border-l-blue-600">
                      "{ev.verbatimExcerpt}"
                    </div>
                  )}
                </div>

                {/* Connecting Directional Arrow (↓) */}
                {index < timeline.length - 1 && (
                  <div className="flex items-center justify-center pt-2">
                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Structured 3-Column Table Form (Clinic Visits + 1-Sentence Description) */}
      {(viewMode === 'TABLE' || viewMode === 'BOTH') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Standardized Chronological Encounter Table
              </h3>
            </div>
            <input
              type="text"
              placeholder="Filter visits, dates, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-32">Date</th>
                  <th className="py-3 px-4 w-64">Clinic Visit / Facility</th>
                  <th className="py-3 px-4">One-Sentence Description of Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEvents.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {ev.date}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {ev.clinicVisit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 leading-relaxed font-serif">
                      {ev.oneSentenceDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
