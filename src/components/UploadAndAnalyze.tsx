import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, ArrowRight } from 'lucide-react';

interface UploadAndAnalyzeProps {
  onAnalyze: (files: File[], text: string) => Promise<void>;
  isLoading: boolean;
  statusMessage: string;
  onLoadQuinonez: () => void;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
}

export const UploadAndAnalyze: React.FC<UploadAndAnalyzeProps> = ({
  onAnalyze,
  isLoading,
  statusMessage,
  onLoadQuinonez,
  hasApiKey,
  onOpenApiKeyModal
}) => {
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
    await onAnalyze(selectedFiles, pastedText);
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
          Drop clinical charts, operative notes, and radiology reads. Google Gemini 2.5 Pro reads the records to deliver your 5 courtroom deliverables in seconds.
        </p>
      </div>

      {/* Main Ingestion Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Drag and Drop Zone */}
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
            {isDragging ? 'Release records to upload...' : 'Click to select or drag and drop patient medical records'}
          </p>
          <p className="text-xs text-slate-500 mt-1 text-center">
            Upload hospital charts, MRI/CT radiology scans (PDF), physical therapy notes, or clinical photos
          </p>

          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs hover:bg-slate-50"
          >
            Browse Computer Files
          </button>
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
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 hover:scale-[1.005]'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>{statusMessage || 'Analyzing records with Gemini 2.5 Pro...'}</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Clinical Records with Gemini 2.5 Pro</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>

      </form>

      {/* Demo Benchmark Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Instant Demonstration: Holly Quinonez MVA Spine Injury Case
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            See the full 5 deliverables pre-generated with Traumatic L5-S1 disc rupture, 10-event timeline, PowerPoint deck, and literature.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadQuinonez}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Load Live Demo (Instant)</span>
        </button>
      </div>

    </div>
  );
};
