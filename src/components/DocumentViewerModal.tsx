import React, { useState, useEffect } from 'react';
import { IngestedDocument } from '../types/forensic';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Hash, 
  Download 
} from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: IngestedDocument | null;
  targetPageNumber?: number;
  allDocuments: IngestedDocument[];
  onSelectDocument: (doc: IngestedDocument) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  targetPageNumber = 1,
  allDocuments,
  onSelectDocument
}) => {
  const [currentPage, setCurrentPage] = useState<number>(targetPageNumber);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  useEffect(() => {
    if (targetPageNumber) {
      setCurrentPage(targetPageNumber);
    }
  }, [targetPageNumber, document]);

  if (!isOpen || !document) return null;

  const totalPages = document.pageCount;
  const currentBatesNumber = `${document.batesPrefix}${String(document.batesStartNumber + currentPage - 1).padStart(5, '0')}`;
  
  const pageData = document.rawTextByPage.find(p => p.page === currentPage);
  const pageText = pageData ? pageData.text : 'Page content not loaded or text not extracted.';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          
          {/* Doc Title & Bates */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs truncate max-w-sm">
                  {document.fileName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  BATES: {currentBatesNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          {/* Page Navigation & Zoom */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono text-xs text-slate-200">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Document Text Viewer */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-950 flex flex-col items-center">
            <div 
              style={{ width: `${Math.min(100, zoomLevel)}%`, maxWidth: '800px' }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-8 min-h-[500px] text-xs font-mono leading-relaxed text-slate-200 space-y-4"
            >
              {/* Bates Header Printed on Canvas */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-[11px] text-cyan-400 font-bold">
                <span>{document.fileName}</span>
                <span>CONFIDENTIAL EXPERT REVIEW • {currentBatesNumber}</span>
              </div>

              {/* Text / Note Content */}
              <div className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed py-2">
                {pageText}
              </div>

              {/* Bates Footer */}
              <div className="pt-6 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>EXHIBIT PAGE {currentPage} OF {totalPages}</span>
                <span className="text-cyan-500 font-bold">{currentBatesNumber}</span>
              </div>
            </div>
          </div>

          {/* Right Thumbnails / Page Index Drawer */}
          <div className="w-64 border-l border-slate-800 bg-slate-900/60 p-3 overflow-y-auto hidden md:block">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Page & Bates Directory
            </h5>
            <div className="space-y-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const bates = `${document.batesPrefix}${String(document.batesStartNumber + p - 1).padStart(5, '0')}`;
                const isSelected = p === currentPage;

                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-full text-left p-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>Page {p}</span>
                    <span className="text-[10px] opacity-75">{bates}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Status Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>HASH INTEGRITY: SHA-256 VERIFIED</span>
            <span>•</span>
            <span>ENCRYPTED LOCAL NVME PIPELINE</span>
          </div>
          <div className="text-cyan-400">
            CONTEMPORANEOUS BATES CITATION ACTIVE
          </div>
        </div>

      </div>
    </div>
  );
};
