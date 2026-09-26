import React, { useState } from 'react';
import { CaseProfile, CaseArtifact, StanceMode } from '../types/forensic';
import { 
  Folder, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Calendar, 
  FileText, 
  Presentation, 
  Scale, 
  Download, 
  Search, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  FolderOpen,
  Layers,
  ArrowRight,
  HardDrive
} from 'lucide-react';

interface CaseDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: CaseProfile[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onCreateNewCase: () => void;
  onDeleteCase: (caseId: string) => void;
  onDownloadArtifact?: (artifact: CaseArtifact, caseProfile: CaseProfile) => void;
}

export const CaseDirectoryModal: React.FC<CaseDirectoryModalProps> = ({
  isOpen,
  onClose,
  cases,
  activeCaseId,
  onSelectCase,
  onCreateNewCase,
  onDeleteCase,
  onDownloadArtifact
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedArtifactCaseId, setExpandedArtifactCaseId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCases = cases.filter(c => 
    c.caseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Physician Forensic Case Directory & Patient Archives
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                  {cases.length} Active Matters
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Switch seamlessly between active forensic reviews • All generated PPTs & records isolated by case
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCreateNewCase}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Case</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Storage Status Ribbon */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by case name, patient, or docket number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Local Encrypted Multi-Case Storage Active</span>
          </div>
        </div>

        {/* Cases List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredCases.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-400">
              <Folder className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="font-semibold text-slate-300">No cases match your search.</p>
              <p className="text-slate-500 mt-1">Click "Create New Case" above to start a clean case.</p>
            </div>
          ) : (
            filteredCases.map((c) => {
              const isActive = c.id === activeCaseId;
              const isDefense = c.retainingSide === 'DEFENSE';
              const totalPages = c.documents.reduce((acc, d) => acc + d.pageCount, 0);
              const artifacts = c.generatedArtifacts || [];
              const isArtifactsExpanded = expandedArtifactCaseId === c.id;

              return (
                <div
                  key={c.id}
                  className={`rounded-xl border transition-all p-5 shadow-lg ${
                    isActive
                      ? 'bg-slate-900/90 border-cyan-500 ring-2 ring-cyan-500/20'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Case Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                          isDefense
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-red-950 text-red-300 border-red-800'
                        }`}>
                          {isDefense ? 'DEFENSE EXPERT' : 'PLAINTIFF EXPERT'}
                        </span>

                        {isActive && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-cyan-400" />
                            <span>CURRENTLY ACTIVE</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-mono">
                          Docket: {c.caseNumber || 'Unassigned'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white">
                        {c.caseName || 'Untitled Matter'}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-400 font-mono flex-wrap">
                        <span>Patient: <strong className="text-slate-200">{c.patientName || 'Confidential'}</strong></span>
                        <span>•</span>
                        <span>Counsel: <strong className="text-slate-200">{c.retainingCounsel || 'N/A'}</strong></span>
                        <span>•</span>
                        <span>Records: <strong className="text-cyan-400">{c.documents.length} files ({totalPages} pgs)</strong></span>
                        <span>•</span>
                        <span>Artifacts: <strong className="text-amber-400">{artifacts.length} generated</strong></span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* View Artifacts Toggle */}
                      {artifacts.length > 0 && (
                        <button
                          onClick={() => setExpandedArtifactCaseId(isArtifactsExpanded ? null : c.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Presentation className="w-3.5 h-3.5" />
                          <span>{artifacts.length} Artifacts</span>
                        </button>
                      )}

                      {/* Switch to this case button */}
                      {!isActive ? (
                        <button
                          onClick={() => {
                            onSelectCase(c.id);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-900/30 transition-colors"
                        >
                          <span>Switch to Case</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs text-cyan-400 font-semibold px-2">
                          Active Workspace
                        </span>
                      )}

                      {/* Delete / Purge Case Button */}
                      <button
                        onClick={() => {
                          if (window.confirm(`PERMANENT CASE PURGE:\n\nAre you sure you want to permanently delete case:\n"${c.caseName}"?\n\nThis will completely erase all ${totalPages} pages of medical records, Bates indexes, timelines, and ${artifacts.length} generated presentations associated with this patient.`)) {
                            onDeleteCase(c.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 transition-colors"
                        title="Delete Case & Permanently Purge All Medical Records"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Patient Artifacts Drawer */}
                  {isArtifactsExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/60 -mx-5 -mb-5 p-4 rounded-b-xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Stored Patient Presentations & Case Exhibits
                      </span>
                      <div className="space-y-1.5">
                        {artifacts.map((art) => (
                          <div
                            key={art.id}
                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <Presentation className="w-4 h-4 text-cyan-400" />
                              <div>
                                <span className="font-semibold text-white block">{art.title}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {art.fileName} • {art.pageCountOrSlides} slides • Generated {new Date(art.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {onDownloadArtifact && (
                              <button
                                onClick={() => onDownloadArtifact(art, c)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] border border-slate-700 flex items-center gap-1 transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>FORENSIC DIRECTORY VAULT • ISOLATED MULTI-CASE PERSISTENCE</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
};
