import React, { useState } from 'react';
import { FORENSIC_GUIDES } from '../data/forensicGuides';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, ExternalLink } from 'lucide-react';

interface SectionGuideBannerProps {
  sectionId: string;
  onOpenFullGuide: () => void;
}

export const SectionGuideBanner: React.FC<SectionGuideBannerProps> = ({
  sectionId,
  onOpenFullGuide
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const guide = FORENSIC_GUIDES[sectionId] || FORENSIC_GUIDES['ingestion'];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl mb-6 overflow-hidden transition-all duration-200">
      <div className="p-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">{guide.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                PROTOCOL GUIDE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xl">
              {guide.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFullGuide}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-900/50 transition-colors"
          >
            <span>Full Forensic Checklist</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse Quick Tips' : 'Expand Quick Tips'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-950/40 text-xs space-y-3">
          <div className="text-slate-300 leading-relaxed">
            <strong className="text-slate-100 font-semibold">Standard of Care Rule: </strong>
            <span className="italic text-slate-300">{guide.standardOfCareBenchmark}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Top Priority Check
              </span>
              <span className="text-slate-300 text-[11px] leading-relaxed">
                {guide.forensicChecklist[0]}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                Critical Pitfall to Guard Against
              </span>
              <span className="text-slate-300 text-[11px] leading-relaxed">
                {guide.legalTrapsToAvoid[0]}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
