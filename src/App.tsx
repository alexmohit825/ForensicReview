import React, { useState, useEffect } from 'react';
import { MedicolegalCaseAnalysis } from './types/medicolegal';
import { 
  analyzeRecordsWithGemini, 
  getQuinonezDemoCase, 
  getSavedGeminiApiKey, 
  hasGeminiApiKey 
} from './services/geminiService';
import { Navbar } from './components/Navbar';
import { UploadAndAnalyze } from './components/UploadAndAnalyze';
import { Deliverable1Summary } from './components/Deliverable1Summary';
import { Deliverable2Causation } from './components/Deliverable2Causation';
import { Deliverable3Timeline } from './components/Deliverable3Timeline';
import { Deliverable4Presentation } from './components/Deliverable4Presentation';
import { Deliverable5Literature } from './components/Deliverable5Literature';
import { Deliverable6DepositionPrep } from './components/Deliverable6DepositionPrep';
import { ApiKeyModal } from './components/ApiKeyModal';

const ACTIVE_ANALYSIS_STORAGE_KEY = 'forensicreview_active_analysis_v4';

export const App: React.FC = () => {
  const [caseAnalysis, setCaseAnalysis] = useState<MedicolegalCaseAnalysis | null>(() => {
    const saved = localStorage.getItem(ACTIVE_ANALYSIS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved case analysis', e);
      }
    }
    // Default to the pre-loaded Quinonez demonstration case so the user immediately sees the 5 deliverables!
    return getQuinonezDemoCase();
  });

  const [activeTab, setActiveTab] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => hasGeminiApiKey());

  // Save active analysis to localStorage
  useEffect(() => {
    if (caseAnalysis) {
      try {
        localStorage.setItem(ACTIVE_ANALYSIS_STORAGE_KEY, JSON.stringify(caseAnalysis));
      } catch (e) {
        console.warn('Could not save case analysis to localStorage', e);
      }
    }
  }, [caseAnalysis]);

  const handleAnalyzeRecords = async (files: File[], text: string) => {
    const apiKey = getSavedGeminiApiKey();
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      const result = await analyzeRecordsWithGemini(files, text, apiKey, (msg) => {
        setStatusMessage(msg);
      });
      setCaseAnalysis(result);
      setActiveTab(1);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      alert(err.message || 'Failed to analyze records with Gemini. Please check your API key and connection.');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleLoadQuinonez = () => {
    const demo = getQuinonezDemoCase();
    setCaseAnalysis(demo);
    setActiveTab(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewCase = () => {
    setCaseAnalysis(null);
    localStorage.removeItem(ACTIVE_ANALYSIS_STORAGE_KEY);
    setActiveTab(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      
      {/* Light Theme Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        patientName={caseAnalysis?.patientInfo.patientName || ''}
        hasAnalysis={Boolean(caseAnalysis)}
        hasApiKey={hasApiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onLoadQuinonez={handleLoadQuinonez}
        onNewCase={handleNewCase}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* If no analysis, show Upload & Ingestion Screen */}
        {!caseAnalysis && (
          <UploadAndAnalyze
            onAnalyze={handleAnalyzeRecords}
            isLoading={isLoading}
            statusMessage={statusMessage}
            onLoadQuinonez={handleLoadQuinonez}
            hasApiKey={hasApiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        )}

        {/* When Analysis is Loaded, Render the 5 Deliverables */}
        {caseAnalysis && (
          <div>
            {activeTab === 1 && (
              <Deliverable1Summary
                summary={caseAnalysis.deliverable1_summary}
                patientInfo={caseAnalysis.patientInfo}
              />
            )}

            {activeTab === 2 && (
              <Deliverable2Causation
                causation={caseAnalysis.deliverable2_causation}
                patientInfo={caseAnalysis.patientInfo}
              />
            )}

            {activeTab === 3 && (
              <Deliverable3Timeline
                timeline={caseAnalysis.deliverable3_timeline}
                patientInfo={caseAnalysis.patientInfo}
              />
            )}

            {activeTab === 4 && (
              <Deliverable4Presentation
                caseData={caseAnalysis}
              />
            )}

            {activeTab === 5 && (
              <Deliverable5Literature
                literature={caseAnalysis.deliverable5_literature}
                patientInfo={caseAnalysis.patientInfo}
              />
            )}

            {activeTab === 6 && (
              <Deliverable6DepositionPrep
                caseData={caseAnalysis}
                onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                hasApiKey={hasApiKey}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium text-slate-700">ForensicReview — AI Medicolegal Workstation for Dr. A. Alex Mohit</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Powered by Google Gemini Multimodal Long-Context Engine. Confidential Medical Peer-Review.
          </p>
        </div>
      </footer>

      {/* Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaved={() => setHasApiKey(hasGeminiApiKey())}
      />

    </div>
  );
};

export default App;
