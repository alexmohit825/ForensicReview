export interface PatientInfo {
  patientName: string;
  patientAge?: number;
  patientSex?: string;
  dateOfIncident: string;
  caseCaption: string;
  retainingCounsel?: string;
}

export interface ImagingFinding {
  scanType: string; // e.g. "Lumbar Spine MRI (Without Contrast)"
  date: string;
  facility: string; // e.g. "TRA Medical Imaging"
  findings: string;
  nerveRootImpingement: string;
}

export interface PhysicalExamHighlight {
  date: string;
  provider: string;
  cervicalRangeOfMotion?: string;
  lumbarFindings?: string;
  neurologicalDeficits?: string;
}

// 1) Read, Analyze & Summarize Clinical Records
export interface ClinicalSummaryDeliverable {
  executiveOverview: string;
  historyOfPresentIllness: string;
  imagingFindings: ImagingFinding[];
  physicalExamHighlights: PhysicalExamHighlight[];
  treatmentCourseSummary: string;
}

// 2) Determine Causation & Formulate Opinion
export interface CausationOpinionDeliverable {
  formalMedicalOpinion: string; // "Within a reasonable degree of medical probability..."
  standardOfCareDetermination: string;
  biomechanicalCausation: string; // Force vectors, torsional annular shear
  eggshellSkullAnalysis: string; // Washington Pattern Jury Instruction 30.17 / traumatic aggravation
  prognosisAndFutureCare: string;
}

// 3) Timeline Graphic & Table Form (Clinic visits + 1-sentence description)
export interface TimelineEvent {
  date: string; // YYYY-MM-DD
  clinicVisit: string; // Clinic / Provider / Facility
  oneSentenceDescription: string; // Required: Exact 1-sentence description
  verbatimExcerpt?: string;
  significance: 'CRITICAL' | 'ROUTINE';
}

// 4) PowerPoint Presentation (Important excerpts + date of note)
export interface PresentationSlide {
  slideNumber: number;
  slideTitle: string;
  dateOfNote: string; // Date of the note
  clinicOrDoctor: string;
  verbatimExcerpt: string; // Crucial excerpt in quotes
  clinicalSignificance: string; // Why this excerpt matters
}

// 5) Literature List (5 very good quality articles supporting opinion)
export interface LiteratureArticle {
  title: string;
  authors: string;
  journal: string;
  year: number;
  keyFinding: string; // How this article supports Dr. Mohit's opinion
  relevanceToCase: string;
  pubmedUrl: string;
}

// 6) Deposition Prep & Adversarial Cross-Examination (Plaintiff vs. Defense Strategy)
export type ExpertRole = 'PLAINTIFF' | 'DEFENSE';

export interface DepositionAttackAngle {
  id: string;
  category: 'PRE_EXISTING_CONDITIONS' | 'MECHANISM_OF_INJURY' | 'OBJECTIVE_VS_SUBJECTIVE' | 'GAP_IN_CARE' | 'SURGICAL_NECESSITY' | 'CREDIBILITY_BIAS';
  opposingCounselAngle: string; // How opposing counsel will frame the attack
  likelyQuestions: string[]; // Specific traps or cross-examination questions
  recommendedResponse: string; // Scripted, bulletproof medical & legal response for Dr. Mohit
  trapToAvoid: string; // What concessions opposing counsel is trying to bait
  keyRecordCitations: string[]; // Specific dates, MRI findings, or chart notes to cite
  supportingLiterature: string; // Peer-reviewed literature or jury instruction grounding
}

export interface CaseSpecificQnA {
  id: string;
  question: string;
  role: ExpertRole;
  answer: string;
  keyEvidentiaryPoints: string[];
  crossExamTrap: string;
}

export interface DepositionPrepDeliverable {
  expertRole: ExpertRole;
  crossExaminationVulnerabilities: DepositionAttackAngle[];
  plaintiffSpecificStrategy: string;
  defenseSpecificStrategy: string;
  goldenRulesForDeposition: string[];
  mockQnAHistory?: CaseSpecificQnA[];
}

// Master Schema of Deliverables from Gemini
export interface MedicolegalCaseAnalysis {
  id: string;
  createdAt: string;
  patientInfo: PatientInfo;
  deliverable1_summary: ClinicalSummaryDeliverable;
  deliverable2_causation: CausationOpinionDeliverable;
  deliverable3_timeline: TimelineEvent[];
  deliverable4_presentationSlides: PresentationSlide[];
  deliverable5_literature: LiteratureArticle[];
  deliverable6_depositionPrep?: DepositionPrepDeliverable;
}
