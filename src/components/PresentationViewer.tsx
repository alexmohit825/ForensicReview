import React, { useState, useEffect } from 'react';
import { CaseProfile, StanceMode } from '../types/forensic';
import { build20SlideDeckData, exportToPowerPoint, SlideData } from '../utils/pptGenerator';
import { 
  Presentation, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Maximize2,
  Layers,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Printer
} from 'lucide-react';

interface PresentationViewerProps {
  currentCase: CaseProfile;
  stance: StanceMode;
  onJumpToBates: (batesNumber: string) => void;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  currentCase,
  stance,
  onJumpToBates
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [slides, setSlides] = useState<SlideData[]>(() => build20SlideDeckData(currentCase, stance));
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Automatically regenerate slides whenever case records or stance changes
  useEffect(() => {
    setSlides(build20SlideDeckData(currentCase, stance));
    setLastUpdated(new Date().toLocaleTimeString());
  }, [currentCase, stance]);

  const activeSlide = slides[currentSlideIndex] || slides[0];
  const isDefense = stance === 'DEFENSE';

  const handleManualRegenerate = () => {
    setSlides(build20SlideDeckData(currentCase, stance));
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const handleDownloadPPTX = async () => {
    try {
      setIsExporting(true);
      const fileName = await exportToPowerPoint(currentCase, stance);
      setDownloadSuccess(fileName);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to export presentation', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                20-Slide Forensic Courtroom Presentation
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                16:9 Widescreen
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronized with {currentCase.documents.reduce((acc, d) => acc + d.pageCount, 0)} pages • Last rebuilt at {lastUpdated}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Re-generate Button */}
          <button
            onClick={handleManualRegenerate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Rebuild slides from latest records"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Update From Records</span>
          </button>

          {/* Download PowerPoint (.PPTX) */}
          <button
            onClick={handleDownloadPPTX}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Generating .PPTX...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PowerPoint (.pptx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>PowerPoint presentation successfully exported: <strong>{downloadSuccess}</strong></span>
          </div>
        </div>
      )}

      {/* Main Slide Stage (16:9 Aspect Ratio Container) */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden aspect-[16/9] flex flex-col justify-between p-8 sm:p-12 transition-all">
        
        {/* Slide Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                isDefense ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-red-950 text-red-300 border-red-800'
              }`}>
                {activeSlide.category}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                SLIDE {activeSlide.slideNumber} OF 20
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeSlide.batesCitations && activeSlide.batesCitations.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">Bates Links:</span>
                  {activeSlide.batesCitations.slice(0, 3).map((b, i) => (
                    <button
                      key={i}
                      onClick={() => onJumpToBates(b)}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-[10px] font-mono flex items-center gap-1 transition-colors"
                    >
                      <span>{b}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            {activeSlide.title}
          </h2>
        </div>

        {/* Slide Content Box */}
        <div className="my-6 p-6 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-inner flex-1 flex flex-col justify-between space-y-4">
          <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
            {activeSlide.bulletPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                  isDefense ? 'bg-blue-400' : 'bg-red-400'
                }`} />
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>

          {activeSlide.keyHighlight && (
            <div className={`p-3 rounded-lg border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
              isDefense
                ? 'bg-blue-950/40 border-blue-900/60 text-blue-200'
                : 'bg-red-950/40 border-red-900/60 text-red-200'
            }`}>
              {isDefense ? <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />}
              <span>{activeSlide.keyHighlight}</span>
            </div>
          )}
        </div>

        {/* Slide Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-800/80 pt-4">
          <div>
            ForensicReview • Expert Witness Presentation • Dr. A. Alex Mohit, MD, PhD
          </div>
          <div>
            Case: {currentCase.caseName || 'Matter Review'}
          </div>
        </div>

        {/* On-Slide Floating Navigation Controls */}
        <div className="absolute inset-y-0 left-2 flex items-center">
          <button
            disabled={currentSlideIndex <= 0}
            onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white disabled:opacity-20 disabled:hover:bg-slate-900 transition-colors shadow-lg"
            title="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-2 flex items-center">
          <button
            disabled={currentSlideIndex >= slides.length - 1}
            onClick={() => setCurrentSlideIndex(i => Math.min(slides.length - 1, i + 1))}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white disabled:opacity-20 disabled:hover:bg-slate-900 transition-colors shadow-lg"
            title="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Slide Thumbnails Drawer / Carousel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Slide Carousel (20 Slides)</span>
          </span>
          <span className="text-slate-400 font-mono">
            Click any thumbnail to preview
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {slides.map((s, idx) => {
            const isSelected = idx === currentSlideIndex;
            return (
              <button
                key={s.slideNumber}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`flex-shrink-0 w-36 p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-500 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                    Slide {s.slideNumber}
                  </span>
                  <span className="text-[9px] px-1 rounded bg-slate-900 text-slate-400 truncate max-w-[60px]">
                    {s.category.split(' ')[0]}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-200 line-clamp-2 leading-tight">
                  {s.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
