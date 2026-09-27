export type StanceMode = 'DEFENSE' | 'PLAINTIFF';

export type EventCategory = 
  | 'ED_TRIAGE'
  | 'PHYSICIAN_CONSULT'
  | 'NURSING_NOTE'
  | 'IMAGING'
  | 'LAB_CRITICAL'
  | 'MEDICATION'
  | 'SURGICAL_OR'
  | 'ICU_CARE'
  | 'DISCHARGE'
  | 'ADVERSE_EVENT';

export type EventSeverity = 'normal' | 'caution' | 'critical' | 'unacknowledged';

export interface VitalSignPoint {
  id: string;
  timestamp: string; // ISO or YYYY-MM-DD HH:mm
  timeDisplay: string;
  sbp?: number;
  dbp?: number;
  map?: number;
  hr?: number;
  rr?: number;
  spo2?: number;
  temp?: number;
  providerNote?: string;
  pageNumber: number;
  batesNumber: string;
  criticalFlag?: boolean;
}

export interface MedicationEvent {
  id: string;
  drugName: string;
  dose: string;
  route: string;
  startTimestamp: string;
  stopTimestamp?: string;
  administeredBy: string;
  status: 'ordered' | 'administered' | 'delayed' | 'held' | 'missed';
  pageNumber: number;
  batesNumber: string;
  indicationNotes?: string;
}

export interface ClinicalMilestone {
  id: string;
  timestamp: string;
  timeDisplay: string;
  relativeTimeDelta?: string;
  phase?: 'PRE_ADMISSION' | 'DIAGNOSTIC_WORKUP' | 'CRITICAL_WINDOW' | 'OPERATIVE_OR' | 'POSTOP_RECOVERY' | 'DETERIORATION_ESCALATION' | 'SECONDARY_INTERVENTION' | 'DISCHARGE_OUTCOME';
  category: EventCategory;
  title: string;
  provider: string;
  providerRole?: 'ATTENDING' | 'RESIDENT' | 'FELLOW' | 'NURSE' | 'CONSULTANT' | 'ANESTHESIOLOGIST' | 'EMS' | 'HOSPITALIST';
  facilityDepartment: string;
  summary: string;
  verbatimQuote?: string;
  severity: EventSeverity;
  pageNumber: number;
  batesNumber: string;
  isLateEntry?: boolean;
  benchmarkComparison?: {
    expectedStandard: string;
    actualTime: string;
    status: 'COMPLIANT' | 'DELAYED' | 'EXCESSIVE_DELAY';
  };
  
  // Stance-specific flags
  plaintiffFlag?: {
    isBreach: boolean;
    breachCategory: 'DELAY' | 'COMMUNICATION' | 'MISDIAGNOSIS' | 'DOCUMENTATION_GAP' | 'SURGICAL_ERROR';
    argument: string;
    standardOfCareRule?: string;
  };
  defenseFlag?: {
    isDefenseAnchor: boolean;
    anchorCategory: 'DOCUMENTED_JUDGMENT' | 'INFORMED_CONSENT' | 'COMPLICATION_MANAGEMENT' | 'COMORBIDITY_MASKING';
    argument: string;
    clinicalRationale?: string;
  };
}

export interface IngestedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  pageCount: number;
  batesPrefix: string;
  batesStartNumber: number;
  batesEndNumber: number;
  rawTextByPage: { page: number; bates: string; text: string }[];
  fileDataUrl?: string; // For client-side viewing
}

export interface LegalBreachPoint {
  id: string;
  title: string;
  allegation: string;
  standardOfCareRule: string;
  deviationEvidence: string;
  proximateCausationAnalysis: string;
  contributingProviders: string[];
  batesCitations: string[];
  severity: 'CRITICAL_BREACH' | 'MAJOR_DEVIATION' | 'DOCUMENTATION_LAPSE';
}

export interface DefenseAnchorPoint {
  id: string;
  title: string;
  defenseTheme: string;
  clinicalRational: string;
  complianceWithGuidelines: string;
  preExistingConfounders: string;
  supportingDocumentation: string;
  batesCitations: string[];
  strength: 'IRONCLAD' | 'STRONG_JUDGMENT' | 'DEFENSIBLE_COMPLICATION';
}

export interface DepositionQuestion {
  id: string;
  targetedVulnerability: string;
  hostileQuestion: string;
  advisableResponseStrategy: string;
  supportingChartCitations: string[];
  stanceContext: StanceMode;
}

export interface CaseProfile {
  id: string;
  caseName: string;
  caseNumber: string;
  courtJurisdiction: string;
  patientName: string;
  patientAge: number;
  patientSex: string;
  retainingCounsel: string;
  lawFirm: string;
  retainingSide: StanceMode;
  dateOfIncident: string;
  allegationsSummary: string;
  documents: IngestedDocument[];
  vitals: VitalSignPoint[];
  medications: MedicationEvent[];
  milestones: ClinicalMilestone[];
  plaintiffBreaches: LegalBreachPoint[];
  defenseAnchors: DefenseAnchorPoint[];
  synopsisExecutive: string;
  synopsisNarrative: string;
  standardOfCareDetermination: 'MET' | 'BREACHED' | 'INCONCLUSIVE';
  causationOpinion: string;
  depositionPrep: DepositionQuestion[];
  generatedArtifacts: CaseArtifact[];
  lastModified?: string;
}

export interface CaseArtifact {
  id: string;
  title: string;
  type: 'PPTX_PRESENTATION' | 'EXPERT_REPORT_PDF' | 'SYNOPSIS_DOCUMENT' | 'TIMELINE_TABLE';
  fileName: string;
  createdAt: string;
  fileSize?: string;
  description: string;
  pageCountOrSlides: number;
}

export interface SectionGuide {
  sectionId: string;
  title: string;
  subtitle: string;
  coreObjective: string;
  forensicChecklist: string[];
  legalTrapsToAvoid: string[];
  expertDepositionTips: string[];
  standardOfCareBenchmark: string;
}
