import React, { useState, useRef, useEffect } from 'react';
import { IngestedDocument, CaseProfile } from '../types/forensic';
import { parsePdfFile, parseTextFile, parseImageFile } from '../utils/pdfParser';
import { extractFilesFromDataTransfer, getFileCategory } from '../utils/fileExtractor';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Layers, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Eye, 
  FolderOpen, 
  FolderPlus, 
  Image as ImageIcon, 
  Presentation, 
  AlertTriangle, 
  LineChart, 
  BookOpen, 
  Scale, 
  Library, 
  Gavel, 
  ArrowRight,
  FileCheck 
} from 'lucide-react';

interface DocumentManagerProps {
  currentCase: CaseProfile;
  onUpdateCase: (updated: Partial<CaseProfile>) => void;
  onAnalyzeRecords: () => void;
  onSelectDocumentForView: (doc: IngestedDocument, page?: number) => void;
  onNavigateToPresentation?: () => void;
  onNavigateToTimeline?: () => void;
  onNavigateToSynopsis?: () => void;
  onNavigateToStance?: () => void;
  onNavigateToLiterature?: () => void;
  onOpenSimilarCases?: () => void;
  onOpenAiImport?: () => void;
  onLoadQuinonez?: () => void;
  onLoadBenchmark?: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  currentCase,
  onUpdateCase,
  onAnalyzeRecords,
  onSelectDocumentForView,
  onNavigateToPresentation,
  onNavigateToTimeline,
  onNavigateToSynopsis,
  onNavigateToStance,
  onNavigateToLiterature,
  onOpenSimilarCases,
  onOpenAiImport,
  onLoadQuinonez,
  onLoadBenchmark
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [batesPrefix, setBatesPrefix] = useState<string>('REC-');
  const [batesStart, setBatesStart] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    details?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Global window drag prevention so dropping slightly outside does not navigate window
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const processFilesList = async (files: File[]) => {
    if (!files || files.length === 0) {
      setFeedbackBanner({
        type: 'warning',
        message: 'No readable files found in the dropped selection.',
        details: 'Ensure the folder or selection contains PDF, text, or image files.'
      });
      return;
    }

    setIsProcessing(true);
    setFeedbackBanner(null);

    const newDocs: IngestedDocument[] = [];
    const skippedFiles: string[] = [];
    let currentStart = batesStart + (currentCase.documents.reduce((acc, d) => acc + d.pageCount, 0));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProcessStatus(`Ingesting record ${i + 1} of ${files.length}: ${file.name}...`);

      const category = getFileCategory(file);

      try {
        let doc: IngestedDocument;

        if (category === 'pdf') {
          doc = await parsePdfFile(file, batesPrefix, currentStart);
        } else if (category === 'image') {
          doc = await parseImageFile(file, batesPrefix, currentStart);
        } else if (category === 'text') {
          doc = await parseTextFile(file, batesPrefix, currentStart);
        } else {
          // Unsupported or binary non-media file
          skippedFiles.push(file.name);
          continue;
        }

        newDocs.push(doc);
        currentStart += doc.pageCount;
      } catch (fileErr) {
        console.warn(`Error processing file ${file.name}:`, fileErr);
        skippedFiles.push(`${file.name} (error reading file)`);
      }
    }

    if (newDocs.length > 0) {
      const updatedDocs = [...currentCase.documents, ...newDocs];
      onUpdateCase({ documents: updatedDocs });

      const totalNewPages = newDocs.reduce((acc, d) => acc + d.pageCount, 0);
      setFeedbackBanner({
        type: skippedFiles.length > 0 ? 'warning' : 'success',
        message: `Successfully ingested ${newDocs.length} record${newDocs.length > 1 ? 's' : ''} (${totalNewPages} total page${totalNewPages > 1 ? 's' : ''}).`,
        details: skippedFiles.length > 0 ? `Note: ${skippedFiles.length} item(s) skipped: ${skippedFiles.join(', ')}` : undefined
      });
    } else {
      setFeedbackBanner({
        type: 'error',
        message: 'No files could be parsed.',
        details: skippedFiles.length > 0 ? `Skipped items: ${skippedFiles.join(', ')}` : 'Please ensure valid PDF, image, or text files are selected.'
      });
    }

    setIsProcessing(false);
    setProcessStatus('');
    setIsDragging(false);

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      processFilesList(filesArray);
    }
  };

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      processFilesList(filesArray);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsProcessing(true);
    setProcessStatus('Unpacking dropped items and directory hierarchy...');

    try {
      const extracted = await extractFilesFromDataTransfer(e.dataTransfer);
      await processFilesList(extracted);
    } catch (err) {
      console.error('Directory drop extraction failed:', err);
      // Fallback to simple files list
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFilesList(Array.from(e.dataTransfer.files));
      } else {
        setIsProcessing(false);
        setFeedbackBanner({
          type: 'error',
          message: 'Failed to read dropped files.',
          details: String(err)
        });
      }
    }
  };

  const handleRemoveDoc = (id: string) => {
    const filtered = currentCase.documents.filter(d => d.id !== id);
    onUpdateCase({ documents: filtered });
  };

  const totalPages = currentCase.documents.reduce((acc, d) => acc + d.pageCount, 0);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Slide Deck Alert Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-900/40 text-blue-400 border border-blue-700/60">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-2">
              Automated 20-Slide Forensic Presentation Active
            </span>
            <p className="text-[11px] text-slate-300">
              Ingesting or editing records here automatically synchronizes the 20-slide courtroom PowerPoint deck.
            </p>
          </div>
        </div>

        {onNavigateToPresentation && (
          <button
            onClick={onNavigateToPresentation}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>View 20-Slide Deck</span>
            <Presentation className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Case Dossier Metadata Header Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <span>Case Dossier & Retaining Retention Metadata</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Case Caption / Matter Name</label>
            <input
              type="text"
              value={currentCase.caseName}
              onChange={(e) => onUpdateCase({ caseName: e.target.value })}
              placeholder="e.g. Estate of John Doe v. Memorial Hospital, et al."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Case / Docket Number</label>
            <input
              type="text"
              value={currentCase.caseNumber}
              onChange={(e) => onUpdateCase({ caseNumber: e.target.value })}
              placeholder="e.g. 24-CV-10842-WA"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Jurisdiction / Court</label>
            <input
              type="text"
              value={currentCase.courtJurisdiction}
              onChange={(e) => onUpdateCase({ courtJurisdiction: e.target.value })}
              placeholder="e.g. Superior Court of Washington, King County"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Retaining Counsel / Law Firm</label>
            <input
              type="text"
              value={currentCase.retainingCounsel}
              onChange={(e) => onUpdateCase({ retainingCounsel: e.target.value })}
              placeholder="e.g. Williamson & Mercer, LLP"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Patient Name</label>
            <input
              type="text"
              value={currentCase.patientName}
              onChange={(e) => onUpdateCase({ patientName: e.target.value })}
              placeholder="e.g. Michael E. Davis"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Incident Date / Admission Date</label>
            <input
              type="date"
              value={currentCase.dateOfIncident}
              onChange={(e) => onUpdateCase({ dateOfIncident: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Real-time Status / Feedback Banner */}
      {feedbackBanner && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs transition-all ${
          feedbackBanner.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
            : feedbackBanner.type === 'warning'
            ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
            : 'bg-red-950/40 border-red-700/60 text-red-300'
        }`}>
          {feedbackBanner.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : feedbackBanner.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold">{feedbackBanner.message}</p>
            {feedbackBanner.details && (
              <p className="text-[11px] opacity-90 mt-1">{feedbackBanner.details}</p>
            )}
          </div>
          <button 
            onClick={() => setFeedbackBanner(null)}
            className="text-slate-400 hover:text-white text-xs font-mono px-1.5 py-0.5 rounded hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ingestion & Bates Stamping Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Dropzone */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Ingest Medical Records (Files, Folders & Images)</span>
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Bates Prefix:</span>
                <input
                  type="text"
                  value={batesPrefix}
                  onChange={(e) => setBatesPrefix(e.target.value.toUpperCase())}
                  className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-center font-mono text-cyan-400"
                />
                <span className="text-slate-400">Start #:</span>
                <input
                  type="number"
                  value={batesStart}
                  onChange={(e) => setBatesStart(parseInt(e.target.value, 10) || 1)}
                  className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-center font-mono text-cyan-400"
                />
              </div>
            </div>

            {/* Drag and Drop Surface */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-cyan-400 bg-cyan-950/40 ring-4 ring-cyan-500/20 scale-[1.01]' 
                  : 'border-slate-700 hover:border-cyan-500 bg-slate-950/60'
              }`}
            >
              {/* Hidden File Input (Multiple Files & Images) */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md,.text,.rtf,.csv,.log,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.gif"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Hidden Folder Input (Directory Traversal) */}
              <input
                ref={folderInputRef}
                type="file"
                // @ts-ignore
                webkitdirectory="true"
                directory="true"
                multiple
                onChange={handleFolderUpload}
                className="hidden"
              />

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                isDragging 
                  ? 'bg-cyan-500 text-slate-950' 
                  : 'bg-slate-800 text-cyan-400 border border-slate-700'
              }`}>
                <Upload className="w-7 h-7" />
              </div>

              <p className="text-sm font-bold text-slate-100 text-center">
                {isDragging ? 'Release files or folders to ingest immediately...' : 'Drag and drop patient records, folders, or images here'}
              </p>
              
              <p className="text-xs text-slate-400 mt-1 text-center max-w-lg">
                Drop entire patient folders, hospital charts (PDF), operative notes, clinical photos (PNG/JPG), EMS runs, or labs
              </p>

              {/* Action Buttons for Explorer Picker */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Choose Files / Images</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold shadow-md transition-colors"
                >
                  <FolderPlus className="w-4 h-4 text-cyan-400" />
                  <span>Choose Case Folder</span>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Folders Auto-Unpacked</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Images & Photos Supported</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Bates Stamped</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Auto Slide Sync</span>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4 p-3.5 rounded-lg bg-cyan-950/60 border border-cyan-800/80 flex items-center gap-3 text-xs text-cyan-300 shadow-lg">
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
              <div className="flex-1 truncate">
                <span className="font-bold">Processing Ingestion: </span>
                <span>{processStatus || 'Parsing pages and assigning Bates stamps...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Ingestion Summary & Analysis Trigger */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Evidentiary Bundle Status</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">Total Ingested Records</span>
                <span className="font-mono font-bold text-white text-sm">
                  {currentCase.documents.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">Cumulative Page Count</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {totalPages} pages
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400">Bates Stamped Range</span>
                <span className="font-mono text-slate-300 text-xs truncate max-w-[180px] text-right">
                  {totalPages > 0 
                    ? `${batesPrefix}${String(batesStart).padStart(5, '0')} — ${batesPrefix}${String(batesStart + totalPages - 1).padStart(5, '0')}`
                    : 'Awaiting Files'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={onAnalyzeRecords}
              disabled={currentCase.documents.length === 0}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                currentCase.documents.length > 0
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Extract Entities & Build Forensic Timeline</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Updates multi-track hemodynamic chart, MAR timeline, and 20-slide presentation
            </p>

            {currentCase.documents.length === 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block text-center">
                  Or load verified forensic case dossiers:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {onLoadQuinonez && (
                    <button
                      type="button"
                      onClick={onLoadQuinonez}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/70 text-emerald-300 text-xs font-semibold shadow-sm transition-colors text-center"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Load Quinonez Case (MVA Spine Injury)</span>
                    </button>
                  )}
                  {onLoadBenchmark && (
                    <button
                      type="button"
                      onClick={onLoadBenchmark}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700/70 text-amber-300 text-xs font-semibold shadow-sm transition-colors text-center"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>Load Aortic Dissection Reference Case</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Flagship Medicolegal Action Center */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Forensic Analysis & Legal Deliverables Command Center
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select an automated medicolegal workstation workflow once medical records are ingested.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onOpenAiImport && (
              <button
                type="button"
                onClick={onOpenAiImport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-semibold shadow-sm transition-colors"
                title="Paste chronology, summary, or transcript from Claude or external AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Paste Claude / AI Chronology</span>
              </button>
            )}
            {currentCase.documents.length === 0 && (
              <span className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-md font-mono">
                Records Required for Timeline Analysis
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Action 1: Graphical Timeline with Dates & Arrows */}
          <div className="bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 rounded-xl p-4 flex flex-col justify-between transition-all group hover:bg-slate-900/80">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 group-hover:scale-105 transition-transform">
                  <LineChart className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  Dates & Arrows
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                Graphical Timeline (Dates & Arrows)
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Generates a forensic chain of events with calendar dates, military times, and directional flow arrows (↓). Highlights treatment intervals and critical delays. Printable directly to courtroom PDF exhibit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onAnalyzeRecords();
                  if (onNavigateToTimeline) onNavigateToTimeline();
                }}
                disabled={currentCase.documents.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate & View Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action 2: Case Synopsis & Narrative Chronology */}
          <div className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-4 flex flex-col justify-between transition-all group hover:bg-slate-900/80">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                  Paragraph / Table
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                Case Synopsis & Narrative Chronology
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Produces dual-mode synopsis: continuous executive narrative prose for case briefing and itemized chronology table for trial exhibits. Printable to formal PDF.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onAnalyzeRecords();
                  if (onNavigateToSynopsis) onNavigateToSynopsis();
                }}
                disabled={currentCase.documents.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Case Synopsis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action 3: Medical Opinion & Standard of Care */}
          <div className="bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 rounded-xl p-4 flex flex-col justify-between transition-all group hover:bg-slate-900/80">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60 group-hover:scale-105 transition-transform">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
                  Duty • Breach • Causation
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                Medical Opinion & Standard of Care
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Synthesize standard of care determination (MET vs. BREACHED vs. INCONCLUSIVE), 4-part legal test evaluation, and proximate causation analysis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onAnalyzeRecords();
                  if (onNavigateToStance) onNavigateToStance();
                }}
                disabled={currentCase.documents.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Medical Opinion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action 4: Similar Cases Search Box */}
          <div className="bg-slate-950/70 border border-slate-800 hover:border-purple-500/60 rounded-xl p-4 flex flex-col justify-between transition-all group hover:bg-slate-900/80">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-800/60 group-hover:scale-105 transition-transform">
                  <Gavel className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                  Precedent Vault
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                Similar Previous Cases Search
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Search precedent medical malpractice cases, defense & plaintiff verdicts, standard of care benchmarks, and judicial case briefs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={onOpenSimilarCases}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Similar Precedents</span>
              </button>
            </div>
          </div>

          {/* Action 5: Medical Literature Search */}
          <div className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4 flex flex-col justify-between transition-all group hover:bg-slate-900/80">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/60 group-hover:scale-105 transition-transform">
                  <Library className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50">
                  Live PubMed API
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Medical Literature & Guidelines
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Perform live NCBI PubMed searches for clinical practice guidelines, trial studies, and standard of care consensus papers tailored to the matter.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={onNavigateToLiterature}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Library className="w-3.5 h-3.5" />
                <span>Search Case Literature</span>
              </button>
            </div>
          </div>

          {/* Action 6: 20-Slide Presentation Deck */}
          <div className="bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-4 flex flex-col justify-between transition-all group hover:bg-slate-900/80">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 group-hover:scale-105 transition-transform">
                  <Presentation className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                  Courtroom PPTX
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                20-Slide Courtroom Presentation
              </h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Review and export the auto-generated 20-slide visual slide deck with case timeline, standard of care critique, and Bates citations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={onNavigateToPresentation}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Open Presentation Deck</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Ingested Documents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Ingested Document Index ({currentCase.documents.length})
            </h3>
          </div>

          {currentCase.documents.length > 0 && (
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search file name or Bates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>

        {currentCase.documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <FileText className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-300">No medical records ingested yet.</p>
            <p className="text-slate-400 mt-1 max-w-md mx-auto">
              Drag and drop patient records, folders, or images above, or click "Choose Files / Images" or "Choose Case Folder" to begin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Type & File Name</th>
                  <th className="p-3">Pages</th>
                  <th className="p-3">Bates Number Range</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Ingestion Time</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentCase.documents
                  .filter(d => d.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((doc) => {
                    const isImg = doc.fileType.startsWith('image/');
                    const isPdf = doc.fileType === 'application/pdf' || doc.fileName.endsWith('.pdf');

                    return (
                      <tr key={doc.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="p-3 font-medium text-white flex items-center gap-2">
                          {isImg ? (
                            <div className="p-1 rounded bg-purple-950/60 border border-purple-800 text-purple-400" title="Image Exhibit">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                          ) : isPdf ? (
                            <div className="p-1 rounded bg-red-950/60 border border-red-800 text-red-400" title="PDF Record">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="p-1 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-400" title="Text Record">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="truncate max-w-xs">{doc.fileName}</span>
                          {isImg && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                              IMAGE
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-300">{doc.pageCount} pg{doc.pageCount > 1 ? 's' : ''}</td>
                        <td className="p-3 font-mono text-cyan-400">
                          {doc.batesPrefix}{String(doc.batesStartNumber).padStart(5, '0')} — {doc.batesPrefix}{String(doc.batesEndNumber).padStart(5, '0')}
                        </td>
                        <td className="p-3 text-slate-400">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                        <td className="p-3 text-slate-400">{new Date(doc.uploadedAt).toLocaleTimeString()}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => onSelectDocumentForView(doc, 1)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Bates</span>
                          </button>
                          <button
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 text-[11px] transition-colors"
                            title="Remove document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
