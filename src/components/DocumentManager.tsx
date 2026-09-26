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
  FileCheck
} from 'lucide-react';

interface DocumentManagerProps {
  currentCase: CaseProfile;
  onUpdateCase: (updated: Partial<CaseProfile>) => void;
  onAnalyzeRecords: () => void;
  onSelectDocumentForView: (doc: IngestedDocument, page?: number) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  currentCase,
  onUpdateCase,
  onAnalyzeRecords,
  onSelectDocumentForView
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batesPrefix, setBatesPrefix] = useState<string>('REC-');
  const [batesStart, setBatesStart] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveDoc = (id: string) => {
    const filtered = currentCase.documents.filter(d => d.id !== id);
    onUpdateCase({ documents: filtered });
  };

  const totalPages = currentCase.documents.reduce((acc, d) => acc + d.pageCount, 0);

  return (
    <div className="space-y-6">
      
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
        
        {/* Upload Zone */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Ingest Medical Record Bundle (PDF, Text, EHR Exports)</span>
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

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md,.text"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-cyan-950 text-slate-300 group-hover:text-cyan-400 border border-slate-700 group-hover:border-cyan-700 flex items-center justify-center mb-3 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200 text-center">
                Click to select or drag and drop medical record files here
              </p>
              <p className="text-xs text-slate-400 mt-1 text-center">
                PDF hospital bundles, EMS run sheets, nursing flowsheets, surgical dictations, and EHR text exports
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Auto Client-Side OCR/Parsing</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Continuous Bates Stamping</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Zero Cloud Data Retention</span>
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 flex items-center gap-3 text-xs text-cyan-300 animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span>Parsing document pages and indexing Bates timestamps...</span>
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
              Generates multi-track hemodynamic chart, MAR timeline, and dual-stance legal arguments
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
              Upload patient hospital records above, or click "Load Reference Case" in the top bar to inspect a completed forensic case.
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
