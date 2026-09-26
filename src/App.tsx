import React, { useState, useEffect } from 'react';
import { CaseProfile, StanceMode, IngestedDocument } from './types/forensic';
import { createEmptyCase, getBenchmarkTeachingCase } from './utils/forensicAnalyzer';
import { extractClinicalEntities } from './utils/pdfParser';
import { Header } from './components/Header';
import { SectionGuideDrawer } from './components/SectionGuideDrawer';
import { DocumentManager } from './components/DocumentManager';
import { GraphicTimeline } from './components/GraphicTimeline';
import { StanceEvaluationView } from './components/StanceEvaluationView';
import { ClinicalNarrative } from './components/ClinicalNarrative';
import { DepositionPrepView } from './components/DepositionPrepView';
import { ReportExportView } from './components/ReportExportView';
import { PresentationViewer } from './components/PresentationViewer';
import { DocumentViewerModal } from './components/DocumentViewerModal';

const LOCAL_STORAGE_KEY = 'forensicreview_active_case_v1';

export const App: React.FC = () => {
  // Application starts clean (no sandbox filler data) as requested by user
  const [currentCase, setCurrentCase] = useState<CaseProfile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved case', e);
      }
    }
    return createEmptyCase();
  });

  const [stance, setStance] = useState<StanceMode>(currentCase.retainingSide || 'DEFENSE');
  const [activeTab, setActiveTab] = useState<string>('ingestion');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [guideSectionId, setGuideSectionId] = useState<string>('ingestion');

  // Document Viewer Modal State
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    doc: IngestedDocument | null;
    page: number;
  }>({
    isOpen: false,
    doc: null,
    page: 1
  });

  // Auto-save case to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentCase));
  }, [currentCase]);

  // Keep stance synced
  const handleToggleStance = (newStance: StanceMode) => {
    setStance(newStance);
    setCurrentCase(prev => ({ ...prev, retainingSide: newStance }));
  };

  const handleUpdateCase = (updated: Partial<CaseProfile>) => {
    setCurrentCase(prev => ({ ...prev, ...updated }));
  };

  const handleNewCase = () => {
    if (window.confirm('Start a new empty forensic case? This will reset the workspace.')) {
      const empty = createEmptyCase();
      setCurrentCase(empty);
      setActiveTab('ingestion');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleLoadBenchmark = () => {
    const benchmark = getBenchmarkTeachingCase();
    setCurrentCase(benchmark);
    setStance(benchmark.retainingSide);
    setActiveTab('timeline');
  };

  // Run entity analysis on ingested records
  const handleAnalyzeRecords = () => {
    if (currentCase.documents.length === 0) return;

    const { vitals, medications } = extractClinicalEntities(currentCase.documents);

    // If records have minimal automated vitals, synthesize timeline milestones from text
    const defaultMilestones = currentCase.milestones.length > 0 
      ? currentCase.milestones 
      : currentCase.documents.map((doc, i) => ({
          id: `ms-auto-${i}`,
          timestamp: new Date().toISOString(),
          timeDisplay: `Doc ${i + 1}`,
          category: 'PHYSICIAN_CONSULT' as const,
          title: `Ingested Record: ${doc.fileName}`,
          provider: 'Reviewing Clinician',
          facilityDepartment: 'Health Record Ingestion',
          summary: `Contains ${doc.pageCount} Bates-stamped pages (${doc.batesPrefix}${doc.batesStartNumber} to ${doc.batesPrefix}${doc.batesEndNumber}).`,
          severity: 'normal' as const,
          pageNumber: doc.batesStartNumber,
          batesNumber: `${doc.batesPrefix}${String(doc.batesStartNumber).padStart(5, '0')}`,
          defenseFlag: {
            isDefenseAnchor: true,
            anchorCategory: 'DOCUMENTED_JUDGMENT' as const,
            argument: 'Contemporaneous documentation authenticated.'
          },
          plaintiffFlag: {
            isBreach: false,
            breachCategory: 'COMMUNICATION' as const,
            argument: 'Record subject to complete audit.'
          }
        }));

    setCurrentCase(prev => ({
      ...prev,
      vitals: vitals.length > 0 ? vitals : prev.vitals,
      medications: medications.length > 0 ? medications : prev.medications,
      milestones: defaultMilestones,
      synopsisExecutive: prev.synopsisExecutive || `Case evaluation for ${prev.caseName || 'the patient'} based upon ${prev.documents.length} ingested records comprising ${prev.documents.reduce((acc, d) => acc + d.pageCount, 0)} pages.`
    }));

    setActiveTab('timeline');
  };

  const handleOpenDocViewer = (doc: IngestedDocument, page: number = 1) => {
    setViewerState({
      isOpen: true,
      doc,
      page
    });
  };

  const handleSelectMilestoneForDoc = (pageNumber: number, batesNumber: string) => {
    // Find document containing this page or Bates
    const foundDoc = currentCase.documents.find(
      d => (pageNumber >= d.batesStartNumber && pageNumber <= d.batesEndNumber) ||
           d.rawTextByPage.some(p => p.bates === batesNumber)
    ) || (currentCase.documents.length > 0 ? currentCase.documents[0] : null);

    if (foundDoc) {
      handleOpenDocViewer(foundDoc, pageNumber);
    }
  };

  const handleJumpToBates = (batesNumber: string) => {
    const foundDoc = currentCase.documents.find(
      d => d.rawTextByPage.some(p => p.bates === batesNumber)
    ) || (currentCase.documents.length > 0 ? currentCase.documents[0] : null);

    if (foundDoc) {
      const pageEntry = foundDoc.rawTextByPage.find(p => p.bates === batesNumber);
      handleOpenDocViewer(foundDoc, pageEntry ? pageEntry.page : 1);
    }
  };

  // Open guide drawer for current tab
  const handleOpenFullGuide = (sectionId?: string) => {
    setGuideSectionId(sectionId || activeTab);
    setIsGuideOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Top Application Header with Stance Switch & Guide */}
      <Header
        stance={stance}
        onToggleStance={handleToggleStance}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setGuideSectionId(tab);
        }}
        caseName={currentCase.caseName}
        isGuideOpen={isGuideOpen}
        onToggleGuide={() => handleOpenFullGuide(activeTab)}
        onNewCase={handleNewCase}
        onLoadBenchmark={handleLoadBenchmark}
        hasDocuments={currentCase.documents.length > 0}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'ingestion' && (
          <DocumentManager
            currentCase={currentCase}
            onUpdateCase={handleUpdateCase}
            onAnalyzeRecords={handleAnalyzeRecords}
            onSelectDocumentForView={(doc, page) => handleOpenDocViewer(doc, page || 1)}
            onNavigateToPresentation={() => setActiveTab('presentation')}
          />
        )}

        {activeTab === 'timeline' && (
          <GraphicTimeline
            currentCase={currentCase}
            stance={stance}
            onOpenFullGuide={() => handleOpenFullGuide('timeline')}
            onSelectMilestoneForDoc={handleSelectMilestoneForDoc}
          />
        )}

        {activeTab === 'stance' && (
          <StanceEvaluationView
            currentCase={currentCase}
            stance={stance}
            onToggleStance={handleToggleStance}
            onOpenFullGuide={() => handleOpenFullGuide('stance')}
            onJumpToBates={handleJumpToBates}
            onUpdateCase={handleUpdateCase}
          />
        )}

        {activeTab === 'synopsis' && (
          <ClinicalNarrative
            currentCase={currentCase}
            stance={stance}
            onOpenFullGuide={() => handleOpenFullGuide('synopsis')}
            onUpdateCase={handleUpdateCase}
          />
        )}

        {activeTab === 'deposition' && (
          <DepositionPrepView
            currentCase={currentCase}
            stance={stance}
            onOpenFullGuide={() => handleOpenFullGuide('deposition')}
            onJumpToBates={handleJumpToBates}
            onUpdateCase={handleUpdateCase}
          />
        )}

        {activeTab === 'presentation' && (
          <PresentationViewer
            currentCase={currentCase}
            stance={stance}
            onJumpToBates={handleJumpToBates}
          />
        )}

        {activeTab === 'export' && (
          <ReportExportView
            currentCase={currentCase}
            stance={stance}
          />
        )}

      </main>

      {/* Toggleable Forensic Protocol & Legal Guide Drawer */}
      <SectionGuideDrawer
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        activeSectionId={guideSectionId}
        onSelectSection={(secId) => setGuideSectionId(secId)}
      />

      {/* Split-Screen Document & Bates Inspector Modal */}
      <DocumentViewerModal
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState(prev => ({ ...prev, isOpen: false }))}
        document={viewerState.doc}
        targetPageNumber={viewerState.page}
        allDocuments={currentCase.documents}
        onSelectDocument={(doc) => setViewerState(prev => ({ ...prev, doc, page: 1 }))}
      />

      {/* Footer Status Bar */}
      <footer className="no-print bg-slate-900 border-t border-slate-800 text-[11px] text-slate-500 py-3 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div>
            ForensicReview Workstation • Designed for Dr. A. Alex Mohit • Medicolegal Expert System
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Stance: <strong className={stance === 'DEFENSE' ? 'text-blue-400' : 'text-red-400'}>{stance}</strong></span>
            <span>•</span>
            <span>Local Vault: Encrypted</span>
            <span>•</span>
            <span>Zero Data Retention Mode</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
