import React from 'react';
import { Scale, Sparkles, Key, Plus, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: number;
  onSelectTab: (tab: number) => void;
  patientName: string;
  hasAnalysis: boolean;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  onLoadQuinonez: () => void;
  onNewCase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  patientName,
  hasAnalysis,
  hasApiKey,
  onOpenApiKeyModal,
  onLoadQuinonez,
  onNewCase
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Clinical Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  Forensic<span className="text-blue-600">Review</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  AI Medicolegal Workstation
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                  v4.3 • Smart PDF Text Extraction Active
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium truncate max-w-xs">
                {patientName ? `Active Case: ${patientName}` : 'Awaiting Medical Records Ingestion'}
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            
            {/* 1-Click Load Real Quinonez Case */}
            <button
              onClick={onLoadQuinonez}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-xs"
              title="Load Holly Quinonez spine injury case (Live Demonstration of all 5 Deliverables)"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Load Quinonez Case (Demo)</span>
            </button>

            {/* Gemini API Key Trigger */}
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                hasApiKey 
                  ? 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100' 
                  : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
              }`}
              title="Configure Google Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>{hasApiKey ? 'Gemini Key Active' : 'Enter Gemini Key'}</span>
              {hasApiKey && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </button>

            {/* New Case Button */}
            <button
              onClick={onNewCase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Case</span>
            </button>
          </div>
        </div>

        {/* The 5 Deliverables Navigation Bar */}
        {hasAnalysis && (
          <div className="flex items-center gap-1 border-t border-slate-100 py-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => onSelectTab(1)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 1
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>1. Clinical Summary</span>
            </button>

            <button
              onClick={() => onSelectTab(2)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 2
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>2. Causation & Opinion</span>
            </button>

            <button
              onClick={() => onSelectTab(3)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 3
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>3. Timeline (Graphic & Table)</span>
            </button>

            <button
              onClick={() => onSelectTab(4)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 4
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>4. PowerPoint Deck (PPT)</span>
            </button>

            <button
              onClick={() => onSelectTab(5)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 5
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>5. Literature Support</span>
            </button>

            <button
              onClick={() => onSelectTab(6)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 6
                  ? 'bg-rose-600 text-white shadow-sm font-bold'
                  : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>6. Deposition Prep</span>
              </span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
