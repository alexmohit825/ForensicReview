import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Clipboard, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Bot,
  AlertCircle
} from 'lucide-react';
import { ClinicalMilestone } from '../types/forensic';

interface AiNarrativeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNarrative: (data: {
    synopsis: string;
    extractedMilestones?: ClinicalMilestone[];
    patientName?: string;
  }) => void;
}

export const AiNarrativeImportModal: React.FC<AiNarrativeImportModalProps> = ({
  isOpen,
  onClose,
  onApplyNarrative
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawText(text);
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  const handleProcessImport = () => {
    if (!rawText.trim()) return;

    setIsProcessing(true);
    setStatusMessage('Parsing clinical chronology and extracting timeline milestones...');

    setTimeout(() => {
      // 1. Extract Patient Name if present
      const nameMatch = rawText.match(/(?:Patient\s*Name|Patient|Matter of|Re:)[:\s]+([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+)/i);
      const patientName = nameMatch ? nameMatch[1].trim() : undefined;

      // 2. Extract timestamped milestones from bullet points or numbered lists
      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      const milestones: ClinicalMilestone[] = [];

      const timeRegex = /(?:(\d{1,2}:\d{2}\s*(?:AM|PM|hrs)?)|(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{2}-\d{2}))/i;

      lines.forEach((line, idx) => {
        const match = line.match(timeRegex);
        // Look for lines that describe clinical events
        if (match && line.length > 25 && milestones.length < 30) {
          const timeFound = match[0];
          const cleanSummary = line.replace(/^[-*•\d.)\s]+/, '').trim();

          const isCritical = /critical|delayed|hypotension|code|arrest|tear|bleed|perforation|failure|shock/i.test(line);

          milestones.push({
            id: `ms-import-${idx}`,
            timestamp: `2024-10-14T${String(8 + Math.min(14, milestones.length)).padStart(2, '0')}:00:00Z`,
            timeDisplay: timeFound,
            relativeTimeDelta: idx === 0 ? 'Initial Presentation' : `+${milestones.length * 45}m`,
            category: /imaging|ct|mri|x-ray/i.test(line) ? 'IMAGING' 
              : /surgery|operative|procedure|incision/i.test(line) ? 'SURGICAL_OR'
              : /lab|troponin|lactic|wbc/i.test(line) ? 'LAB_CRITICAL'
              : /triage|ems|ed|arrival/i.test(line) ? 'ED_TRIAGE'
              : 'PHYSICIAN_CONSULT',
            title: cleanSummary.split(/[:—–-]/)[0]?.substring(0, 45) || 'Documented Clinical Event',
            provider: 'Reviewing Clinician',
            providerRole: 'ATTENDING',
            facilityDepartment: 'Clinical Service',
            summary: cleanSummary,
            verbatimQuote: `"${cleanSummary.substring(0, 180)}"`,
            severity: isCritical ? 'critical' : 'normal',
            pageNumber: idx + 1,
            batesNumber: `REC-${String(idx + 1).padStart(5, '0')}`,
            defenseFlag: {
              isDefenseAnchor: !isCritical,
              anchorCategory: 'DOCUMENTED_JUDGMENT',
              argument: 'Clinical evaluation contemporaneous with chart documentation.'
            },
            plaintiffFlag: {
              isBreach: isCritical,
              breachCategory: 'DELAY',
              argument: isCritical ? 'Potential standard of care deviation subject to legal audit.' : 'Documented care.'
            }
          });
        }
      });

      onApplyNarrative({
        synopsis: rawText,
        extractedMilestones: milestones.length > 0 ? milestones : undefined,
        patientName
      });

      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Paste Claude or External AI Chronology
              </h2>
              <p className="text-xs text-slate-400">
                Instantly turn Claude or LLM transcripts into directional flowcharts, 20-slide presentations & PDF exhibits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Full Synergy with Claude & External AI</span>
            </p>
            <p className="text-slate-400">
              If you drag records into Claude or any LLM and ask for a chronology, simply paste Claude's response below. ForensicReview will parse the dates, times, and events into the **interactive directional timeline with arrows ($\downarrow$)**, the **20-slide PowerPoint deck**, the **Rule 26 court report**, and the **formal case synopsis**.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Paste Narrative / Chronology Text
            </label>
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste from Clipboard</span>
            </button>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste your case synopsis, Claude response, or clinical summary here... (e.g. 'Patient presented on 10/14 at 07:15 with chest pain... At 09:30 CT angiography was performed...')"
            rows={12}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-4 text-xs text-slate-200 font-mono focus:outline-none transition-colors leading-relaxed"
          />

          {rawText.length > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{rawText.length} characters • {rawText.split('\n').length} lines</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Ready to parse
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleProcessImport}
            disabled={!rawText.trim() || isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white shadow-lg transition-all"
          >
            <span>{isProcessing ? statusMessage || 'Processing...' : 'Ingest & Build Forensic Timeline'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
