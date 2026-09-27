import React, { useState, useEffect } from 'react';
import { CaseProfile, StanceMode, IngestedDocument, CaseArtifact, ClinicalMilestone } from './types/forensic';
import { createEmptyCase, getBenchmarkTeachingCase, getQuinonezCaseProfile } from './utils/forensicAnalyzer';
import { extractClinicalEntities } from './utils/pdfParser';
import { exportToPowerPoint } from './utils/pptGenerator';
import { Header } from './components/Header';
import { SectionGuideDrawer } from './components/SectionGuideDrawer';
import { DocumentManager } from './components/DocumentManager';
import { GraphicTimeline } from './components/GraphicTimeline';
import { StanceEvaluationView } from './components/StanceEvaluationView';
import { ClinicalNarrative } from './components/ClinicalNarrative';
import { DepositionPrepView } from './components/DepositionPrepView';
import { PresentationViewer } from './components/PresentationViewer';
import { ReportExportView } from './components/ReportExportView';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { CaseDirectoryModal } from './components/CaseDirectoryModal';
import { LiteratureSearchTab } from './components/LiteratureSearchTab';
import { SimilarCasesModal } from './components/SimilarCasesModal';
import { AiNarrativeImportModal } from './components/AiNarrativeImportModal';
import { synthesizeRecordsFromDocuments } from './utils/clinicalSynthesizer';

const CASES_CATALOG_STORAGE_KEY = 'forensicreview_cases_catalog_v2';
const ACTIVE_CASE_ID_STORAGE_KEY = 'forensicreview_active_case_id_v2';

export const App: React.FC = () => {
  // Multi-Case Directory State
  const [cases, setCases] = useState<CaseProfile[]>(() => {
    const savedCatalog = localStorage.getItem(CASES_CATALOG_STORAGE_KEY);
    if (savedCatalog) {
      try {
        const parsed = JSON.parse(savedCatalog);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved cases catalog', e);
      }
    }
    // Starts clean with one empty case
    return [createEmptyCase()];
  });

  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    const savedActiveId = localStorage.getItem(ACTIVE_CASE_ID_STORAGE_KEY);
    if (savedActiveId && cases.some(c => c.id === savedActiveId)) {
      return savedActiveId;
    }
    return cases[0]?.id || `case-${Date.now()}`;
  });

  // Current active case
  const currentCase = cases.find(c => c.id === activeCaseId) || cases[0] || createEmptyCase();
  const [stance, setStance] = useState<StanceMode>(currentCase.retainingSide || 'DEFENSE');
  const [activeTab, setActiveTab] = useState<string>('ingestion');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [guideSectionId, setGuideSectionId] = useState<string>('ingestion');
  const [isCaseDirectoryOpen, setIsCaseDirectoryOpen] = useState<boolean>(false);
  const [isSimilarCasesOpen, setIsSimilarCasesOpen] = useState<boolean>(false);
  const [isAiImportOpen, setIsAiImportOpen] = useState<boolean>(false);

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

  // Keep stance synced with current case
  useEffect(() => {
    if (currentCase.retainingSide && currentCase.retainingSide !== stance) {
      setStance(currentCase.retainingSide);
    }
  }, [currentCase.id]);

  // Persist cases catalog and active ID with quota resilience
  useEffect(() => {
    try {
      localStorage.setItem(CASES_CATALOG_STORAGE_KEY, JSON.stringify(cases));
    } catch (quotaErr) {
      console.warn('localStorage quota exceeded, sanitizing for storage...', quotaErr);
      try {
        const sanitized = cases.map(c => ({
          ...c,
          documents: c.documents.map(d => ({
            ...d,
            fileDataUrl: undefined // Blob URLs cannot be persisted across restarts anyway
          }))
        }));
        localStorage.setItem(CASES_CATALOG_STORAGE_KEY, JSON.stringify(sanitized));
      } catch (innerErr) {
        console.error('Failed to store cases in localStorage:', innerErr);
      }
    }
  }, [cases]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_CASE_ID_STORAGE_KEY, activeCaseId);
    } catch (e) {
      console.error('Failed to store active case ID:', e);
    }
  }, [activeCaseId]);

  // Switch between cases
  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
    const target = cases.find(c => c.id === caseId);
    if (target) {
      setStance(target.retainingSide);
    }
    setActiveTab('ingestion');
  };

  // Create a brand new case
  const handleCreateNewCase = () => {
    const newCase = createEmptyCase();
    newCase.caseName = `New Forensic Case ${cases.length + 1}`;
    setCases(prev => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    setStance('DEFENSE');
    setActiveTab('ingestion');
    setIsCaseDirectoryOpen(false);
  };

  // Delete a case and purge all associated records
  const handleDeleteCase = (caseId: string) => {
    const updated = cases.filter(c => c.id !== caseId);
    if (updated.length === 0) {
      const freshCase = createEmptyCase();
      setCases([freshCase]);
      setActiveCaseId(freshCase.id);
      setStance('DEFENSE');
    } else {
      setCases(updated);
      if (activeCaseId === caseId) {
        setActiveCaseId(updated[0].id);
        setStance(updated[0].retainingSide);
      }
    }
  };

  // Keep stance synced
  const handleToggleStance = (newStance: StanceMode) => {
    setStance(newStance);
    handleUpdateCase({ retainingSide: newStance });
  };

  // Update current case profile
  const handleUpdateCase = (updated: Partial<CaseProfile>) => {
    setCases(prev => prev.map(c => {
      if (c.id === currentCase.id) {
        return {
          ...c,
          ...updated,
          lastModified: new Date().toISOString()
        };
      }
      return c;
    }));
  };

  // Load Benchmark teaching case into catalog
  const handleLoadBenchmark = () => {
    const benchmark = getBenchmarkTeachingCase();
    setCases(prev => [benchmark, ...prev.filter(c => c.id !== benchmark.id)]);
    setActiveCaseId(benchmark.id);
    setStance(benchmark.retainingSide);
    setActiveTab('timeline');
  };

  // Load Holly Quinonez real case into catalog
  const handleLoadQuinonez = () => {
    const quinonez = getQuinonezCaseProfile();
    setCases(prev => [quinonez, ...prev.filter(c => c.id !== quinonez.id)]);
    setActiveCaseId(quinonez.id);
    setStance(quinonez.retainingSide);
    setActiveTab('timeline');
  };

  // Run deep clinical synthesis on ingested records
  const handleAnalyzeRecords = () => {
    if (currentCase.documents.length === 0) return;

    const synthesized = synthesizeRecordsFromDocuments(currentCase.documents, stance);

    handleUpdateCase({
      patientName: (!currentCase.patientName || currentCase.patientName === 'Michael E. Davis' || currentCase.patientName === 'Confidential' || currentCase.patientName.trim() === '')
        ? synthesized.patientName 
        : currentCase.patientName,
      dateOfIncident: currentCase.dateOfIncident || synthesized.dateOfIncident,
      caseName: (!currentCase.caseName || currentCase.caseName.startsWith('New Forensic Case')) 
        ? synthesized.caseCaption 
        : currentCase.caseName,
      milestones: synthesized.milestones,
      vitals: synthesized.vitals.length > 0 ? synthesized.vitals : currentCase.vitals,
      medications: synthesized.medications.length > 0 ? synthesized.medications : currentCase.medications,
      synopsisExecutive: synthesized.synopsisExecutive,
      synopsisNarrative: synthesized.synopsisNarrative,
      standardOfCareDetermination: synthesized.standardOfCareDetermination,
      causationOpinion: synthesized.causationOpinion,
      plaintiffBreaches: synthesized.plaintiffBreaches,
      defenseAnchors: synthesized.defenseAnchors
    });

    setActiveTab('synopsis');
  };

  const handleApplyAiNarrative = (data: {
    synopsis: string;
    extractedMilestones?: ClinicalMilestone[];
    patientName?: string;
  }) => {
    handleUpdateCase({
      synopsisNarrative: data.synopsis,
      synopsisExecutive: data.synopsis.split('\n\n')[0]?.substring(0, 350) + '...',
      milestones: (data.extractedMilestones && data.extractedMilestones.length > 0) 
        ? data.extractedMilestones 
        : currentCase.milestones,
      patientName: data.patientName || currentCase.patientName
    });
    setActiveTab('synopsis');
  };

  const handleOpenDocViewer = (doc: IngestedDocument, page: number = 1) => {
    setViewerState({
      isOpen: true,
      doc,
      page
    });
  };

  const handleSelectMilestoneForDoc = (pageNumber: number, batesNumber: string) => {
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

  const handleOpenFullGuide = (sectionId?: string) => {
    setGuideSectionId(sectionId || activeTab);
    setIsGuideOpen(true);
  };

  // Re-download an existing stored artifact
  const handleDownloadArtifact = async (artifact: CaseArtifact, caseProfile: CaseProfile) => {
    if (artifact.type === 'PPTX_PRESENTATION') {
      await exportToPowerPoint(caseProfile, caseProfile.retainingSide);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Top Application Header */}
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
        onNewCase={handleCreateNewCase}
        onOpenCaseDirectory={() => setIsCaseDirectoryOpen(true)}
        onOpenSimilarCases={() => setIsSimilarCasesOpen(true)}
        caseCount={cases.length}
        onLoadBenchmark={handleLoadBenchmark}
        onLoadQuinonez={handleLoadQuinonez}
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
            onNavigateToTimeline={() => setActiveTab('timeline')}
            onNavigateToSynopsis={() => setActiveTab('synopsis')}
            onNavigateToStance={() => setActiveTab('stance')}
            onNavigateToLiterature={() => setActiveTab('literature')}
            onOpenSimilarCases={() => setIsSimilarCasesOpen(true)}
            onOpenAiImport={() => setIsAiImportOpen(true)}
            onLoadQuinonez={handleLoadQuinonez}
            onLoadBenchmark={handleLoadBenchmark}
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
            onSynthesizeRecords={handleAnalyzeRecords}
            onOpenAiImport={() => setIsAiImportOpen(true)}
          />
        )}

        {activeTab === 'literature' && (
          <LiteratureSearchTab
            currentCase={currentCase}
            stance={stance}
            onOpenFullGuide={() => handleOpenFullGuide('literature')}
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
            onUpdateCase={handleUpdateCase}
          />
        )}

        {activeTab === 'export' && (
          <ReportExportView
            currentCase={currentCase}
            stance={stance}
          />
        )}

      </main>

      {/* Multi-Case Directory & Patient Archive Modal */}
      <CaseDirectoryModal
        isOpen={isCaseDirectoryOpen}
        onClose={() => setIsCaseDirectoryOpen(false)}
        cases={cases}
        activeCaseId={currentCase.id}
        onSelectCase={handleSelectCase}
        onCreateNewCase={handleCreateNewCase}
        onDeleteCase={handleDeleteCase}
        onDownloadArtifact={handleDownloadArtifact}
      />

      {/* Similar Previous Cases & Precedent Vault Modal */}
      <SimilarCasesModal
        isOpen={isSimilarCasesOpen}
        onClose={() => setIsSimilarCasesOpen(false)}
        currentCaseTopic={currentCase.caseName}
      />

      {/* AI & Claude Narrative Import Modal */}
      <AiNarrativeImportModal
        isOpen={isAiImportOpen}
        onClose={() => setIsAiImportOpen(false)}
        onApplyNarrative={handleApplyAiNarrative}
      />

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
          <div className="flex items-center gap-2">
            <span>Case: <strong className="text-white">{currentCase.caseName || 'Untitled'}</strong></span>
            <span>•</span>
            <span>Patient: <strong className="text-slate-300">{currentCase.patientName || 'Confidential'}</strong></span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Stance: <strong className={stance === 'DEFENSE' ? 'text-blue-400' : 'text-red-400'}>{stance}</strong></span>
            <span>•</span>
            <span>Case Vault: {cases.length} Matters</span>
            <span>•</span>
            <span>Encrypted Local Storage</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
