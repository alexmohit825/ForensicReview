import React, { useState, useRef } from 'react';
import { IngestedDocument, CaseProfile } from '../types/forensic';
import { parsePdfFile, parseTextFile, extractClinicalEntities } from '../utils/pdfParser';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Hash, 
  Layers, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Eye, 
  ShieldCheck,
  Building,
  User,
  Calendar,
  FileCheck,
  FolderOpen,
  Presentation
} from 'lucide-react';

interface DocumentManagerProps {
  currentCase: CaseProfile;
  onUpdateCase: (updated: Partial<CaseProfile>) => void;
  onAnalyzeRecords: () => void;
  onSelectDocumentForView: (doc: IngestedDocument, page?: number) => void;
  onNavigateToPresentation?: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  currentCase,
  onUpdateCase,
  onAnalyzeRecords,
  onSelectDocumentForView,
  onNavigateToPresentation
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [batesPrefix, setBatesPrefix] = useState<string>('REC-');
  const [batesStart, setBatesStart] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newDocs: IngestedDocument[] = [];
    let currentStart = batesStart + (currentCase.documents.reduce((acc, d) => acc + d.pageCount, 0));

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let doc: IngestedDocument;

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          doc = await parsePdfFile(file, batesPrefix, currentStart);
        } else {
          doc = await parseTextFile(file, batesPrefix, currentStart);
        }

        newDocs.push(doc);
        currentStart += doc.pageCount;
      }

      const updatedDocs = [...currentCase.documents, ...newDocs];
      onUpdateCase({ documents: updatedDocs });
    } catch (err) {
      console.error('Document ingestion error:', err);
    } finally {
      setIsProcessing(false);
      setIsDragging(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
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

      {/* Ingestion & Bates Stamping Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Dropzone */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Ingest Medical Records (Drag & Drop or Choose Files)</span>
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
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-cyan-400 bg-cyan-950/40 ring-4 ring-cyan-500/20' 
                  : 'border-slate-700 hover:border-cyan-500 bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md,.text"
                onChange={handleFileUpload}
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
                {isDragging ? 'Release files to ingest immediately...' : 'Drag and drop patient records (PDF, text, EHR) here'}
              </p>
              
              <p className="text-xs text-slate-400 mt-1 text-center">
                Hospital charts, operative notes, nursing flowsheets, EMS runs, or laboratory panels
              </p>

              {/* Explicit Choose Files from Explorer Button */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Choose Files from Explorer</span>
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Direct Client-Side Ingestion</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Auto Continuous Bates Stamping</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Auto Slide Sync</span>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 flex items-center gap-3 text-xs text-cyan-300 animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span>Parsing document pages, assigning Bates stamps, and updating presentation...</span>
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
                <span className="text-slate-400">Total Ingested Documents</span>
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
                <span className="font-mono text-slate-300 text-xs">
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
              Drag and drop patient records above, or click "Choose Files from Explorer" to begin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">File Name</th>
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
                  .map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="p-3 font-medium text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="truncate max-w-xs">{doc.fileName}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{doc.pageCount} pgs</td>
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
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
