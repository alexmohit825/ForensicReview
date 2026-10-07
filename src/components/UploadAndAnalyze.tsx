import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, ArrowRight, Shield, UserCheck } from 'lucide-react';
import { ExpertRole } from '../types/medicolegal';

interface UploadAndAnalyzeProps {
  onAnalyze: (files: File[], text: string, role: ExpertRole) => Promise<void>;
  isLoading: boolean;
  statusMessage: string;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
}

export const UploadAndAnalyze: React.FC<UploadAndAnalyzeProps> = ({
  onAnalyze,
  isLoading,
  statusMessage,
  hasApiKey,
  onOpenApiKeyModal
}) => {
  const [selectedRole, setSelectedRole] = useState<ExpertRole>('PLAINTIFF');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const chosen = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...chosen]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasApiKey) {
      onOpenApiKeyModal();
      return;
    }
    if (selectedFiles.length === 0 && !pastedText.trim()) {
      return;
    }
    await onAnalyze(selectedFiles, pastedText, selectedRole);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      
      {/* Welcome & Directive Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Multimodal Frontier Reasoning Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Forensic Record Review & Causation
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Drop clinical charts, operative notes, and radiology reads. Google Gemini AI reads the records to deliver your comprehensive forensic deliverables in seconds.
        </p>
      </div>

      {/* Main Ingestion Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Retained Expert Role Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              1. Select Your Retained Expert Role
            </label>
            <span className="text-xs text-slate-500 font-medium">
              Calibrates causation theory, WPI 30.17 analysis & deposition prep
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Plaintiff Option */}
            <button
              type="button"
              onClick={() => setSelectedRole('PLAINTIFF')}
              className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3.5 ${
                selectedRole === 'PLAINTIFF'
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500/30'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className={`p-2.5 rounded-lg ${selectedRole === 'PLAINTIFF' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${selectedRole === 'PLAINTIFF' ? 'text-blue-900' : 'text-slate-800'}`}>
                    Plaintiff Expert (Injured Party)
                  </span>
                  {selectedRole === 'PLAINTIFF' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Prove collision causation, traumatic aggravation of asymptomatic pre-existing spine degeneration under WPI 30.17 Eggshell doctrine, and counter defense attacks.
                </p>
              </div>
            </button>

            {/* Defense Option */}
            <button
              type="button"
              onClick={() => setSelectedRole('DEFENSE')}
              className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3.5 ${
                selectedRole === 'DEFENSE'
                  ? 'border-slate-800 bg-slate-100 shadow-sm ring-1 ring-slate-700/30'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className={`p-2.5 rounded-lg ${selectedRole === 'DEFENSE' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${selectedRole === 'DEFENSE' ? 'text-slate-900' : 'text-slate-800'}`}>
                    Defense Expert (Retaining Insurer / Counsel)
                  </span>
                  {selectedRole === 'DEFENSE' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-white">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Highlight chronic natural degenerative spondylosis, minor delta-V mechanics, treatment gaps, lack of objective neurological deficit, and counter plaintiff claims.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            2. Drop Patient Records & Scans
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Upload className="w-7 h-7" />
            </div>

            <p className="text-sm font-bold text-slate-900 text-center">
              {isDragging ? 'Release records to upload...' : 'Click to select or drag and drop patient medical records (PDF)'}
            </p>
            <p className="text-xs text-slate-500 mt-1 text-center">
              Upload multi-page PDFs (e.g. Farthing.pdf), hospital charts, MRI/CT scans, operative notes, or clinical photos
            </p>

            <button
              type="button"
              className="mt-4 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs hover:bg-slate-50"
            >
              Browse Computer Files
            </button>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Selected Case Records ({selectedFiles.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="text-slate-400 hover:text-red-600 font-bold ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Paste Fallback */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Or Paste Clinic Notes / Summary Text
          </label>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste raw doctor notes, HPI, MRI impressions, or prior clinical summaries here..."
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || (selectedFiles.length === 0 && !pastedText.trim())}
            className={`w-full py-4 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white shadow-md transition-all ${
              isLoading || (selectedFiles.length === 0 && !pastedText.trim())
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : selectedRole === 'PLAINTIFF'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 hover:scale-[1.005]'
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/25 hover:scale-[1.005]'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>{statusMessage || 'Analyzing records with Gemini AI...'}</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  Analyze Records as {selectedRole === 'PLAINTIFF' ? 'Plaintiff Expert' : 'Defense Expert'}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

