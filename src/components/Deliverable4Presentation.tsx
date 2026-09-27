import React, { useState } from 'react';
import { MedicolegalCaseAnalysis } from '../types/medicolegal';
import { exportCaseToPowerPoint } from '../services/pptxService';
import { Presentation, Download, ChevronLeft, ChevronRight, Calendar, Building, Sparkles, CheckCircle2 } from 'lucide-react';

interface Deliverable4PresentationProps {
  caseData: MedicolegalCaseAnalysis;
}

export const Deliverable4Presentation: React.FC<Deliverable4PresentationProps> = ({
  caseData
}) => {
  const slides = caseData.deliverable4_presentationSlides;
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedFileName, setExportedFileName] = useState<string | null>(null);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  const handleDownloadPptx = async () => {
    try {
      setIsExporting(true);
      const fileName = await exportCaseToPowerPoint(caseData);
      setExportedFileName(fileName);
      setTimeout(() => setExportedFileName(null), 5000);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Download Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Deliverable 4 of 5
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Courtroom PowerPoint Presentation (PPT)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Features important excerpts from the medical records and the date of each note, exportable directly to Microsoft PowerPoint.
          </p>
        </div>

        {/* 1-Click PPTX Download Button */}
        <button
          onClick={handleDownloadPptx}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
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

      {exportedFileName && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Successfully generated and downloaded: <strong>{exportedFileName}</strong></span>
        </div>
      )}

      {/* Main Slide Presentation Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        
        {/* Slide Carousel Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="text-xs font-mono font-medium text-slate-600">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>

        {/* 16:9 Aspect Ratio Interactive Slide Canvas */}
        <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 p-6 sm:p-10 flex flex-col justify-between shadow-xs">
          
          {/* Slide Top Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest block">
                Evidence Exhibit Slide
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {activeSlide.slideTitle}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <Building className="w-3.5 h-3.5" />
                <span>{activeSlide.clinicOrDoctor}</span>
              </div>
            </div>

            {/* Date of the Note Badge (Required by Dr. Mohit) */}
            <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-mono font-bold text-xs sm:text-sm self-start sm:self-auto flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Date of Note: {activeSlide.dateOfNote}</span>
            </div>
          </div>

          {/* Important Excerpt from Medical Records (Required by Dr. Mohit) */}
          <div className="my-auto p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 border-l-4 border-l-blue-600">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
              Important Verbatim Excerpt from Medical Records:
            </span>
            <p className="text-base sm:text-lg font-serif italic text-slate-900 leading-relaxed">
              "{activeSlide.verbatimExcerpt}"
            </p>
          </div>

          {/* Clinical Significance Callout */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-900">Forensic Causation Significance: </strong>
              <span>{activeSlide.clinicalSignificance}</span>
            </div>
          </div>

        </div>

        {/* Thumbnail Selector Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-2.5 rounded-xl border text-left text-[11px] transition-all ${
                currentSlideIndex === idx
                  ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
              }`}
            >
              <div className="font-mono text-[10px] text-slate-400">Slide {idx + 1}</div>
              <div className="truncate font-semibold mt-0.5">{s.dateOfNote}</div>
            </button>
          ))}
        </div>

      </div>

    </div>
  );
};
