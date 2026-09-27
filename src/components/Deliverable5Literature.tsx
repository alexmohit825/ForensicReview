import React from 'react';
import { LiteratureArticle, PatientInfo } from '../types/medicolegal';
import { ExternalLink, Award, CheckCircle2, Printer } from 'lucide-react';

interface Deliverable5LiteratureProps {
  literature: LiteratureArticle[];
  patientInfo?: PatientInfo;
}

export const Deliverable5Literature: React.FC<Deliverable5LiteratureProps> = ({
  literature
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Deliverable 5 of 5
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Peer-Reviewed Literature Support (Top 5 Articles)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Curated list of 5 high-impact, peer-reviewed clinical articles directly substantiating your causation opinion and surgical standard of care.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Literature Packet (PDF)</span>
        </button>
      </div>

      {/* 5 Literature Cards */}
      <div className="space-y-4">
        {literature.slice(0, 5).map((art, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all space-y-4">
            
            {/* Top Row: Article Number & Journal Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  #{idx + 1}
                </span>
                <span className="font-bold text-blue-900 text-sm">
                  {art.journal} ({art.year})
                </span>
              </div>

              {art.pubmedUrl && (
                <a
                  href={art.pubmedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold self-start sm:self-auto"
                >
                  <span>View on PubMed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Title & Authors */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {art.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {art.authors}
              </p>
            </div>

            {/* Key Finding Callout (How it supports Dr. Mohit's opinion) */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold uppercase tracking-wider text-[10px]">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Key Medical Finding Supporting Opinion:</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-serif">
                {art.keyFinding}
              </p>
            </div>

            {/* Relevance to Case */}
            {art.relevanceToCase && (
              <div className="flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Direct Case Relevance: </strong>
                  <span>{art.relevanceToCase}</span>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
};
