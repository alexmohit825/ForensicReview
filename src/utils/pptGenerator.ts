import pptxgen from 'pptxgenjs';
import { CaseProfile, StanceMode } from '../types/forensic';

export interface SlideData {
  slideNumber: number;
  title: string;
  category: string;
  bulletPoints: string[];
  keyHighlight?: string;
  batesCitations?: string[];
  speakerNotes?: string;
}

/**
 * Builds the 20 structured slides data based on the current case state and stance
 */
export function build20SlideDeckData(caseProfile: CaseProfile, stance: StanceMode): SlideData[] {
  const isDefense = stance === 'DEFENSE';
  const totalPages = caseProfile.documents.reduce((acc, d) => acc + d.pageCount, 0);
  const totalDocs = caseProfile.documents.length;

  const batesRange = totalPages > 0 
    ? `${caseProfile.documents[0]?.batesPrefix || 'REC-'}${String(caseProfile.documents[0]?.batesStartNumber || 1).padStart(5, '0')} to ${caseProfile.documents[caseProfile.documents.length - 1]?.batesPrefix || 'REC-'}${String(caseProfile.documents[caseProfile.documents.length - 1]?.batesEndNumber || totalPages).padStart(5, '0')}`
    : 'No Records Ingested';

  const patientDesc = caseProfile.patientName 
    ? `${caseProfile.patientName}, ${caseProfile.patientAge || '—'}yo ${caseProfile.patientSex}`
    : 'Confidential Patient';

  return [
    // Slide 1: Title Slide
    {
      slideNumber: 1,
      title: caseProfile.caseName || 'Medicolegal Forensic Case Review',
      category: 'TITLE & RETENTION',
      bulletPoints: [
        `Case / Docket Number: ${caseProfile.caseNumber || 'Pending'}`,
        `Court Jurisdiction: ${caseProfile.courtJurisdiction || 'State / Federal Court'}`,
        `Retaining Counsel: ${caseProfile.retainingCounsel || 'Counsel of Record'}`,
        `Expert Witness: A. Alex Mohit, MD, PhD (Board Certified Neurosurgeon)`,
        `Perspective: ${isDefense ? 'DEFENSE EXPERT REPORT' : 'PLAINTIFF EXPERT REPORT'}`
      ],
      keyHighlight: `Active Forensic Lens: ${isDefense ? 'DEFENSE CLINICAL JUDGMENT' : 'PLAINTIFF STANDARD OF CARE BREACH'}`,
      speakerNotes: 'Introduce expert qualifications, scope of retention, and objective of this forensic presentation.'
    },

    // Slide 2: Case Overview & Core Legal Controversy
    {
      slideNumber: 2,
      title: 'Executive Case Overview & Legal Controversy',
      category: 'CASE BACKGROUND',
      bulletPoints: [
        `Patient Identification: ${patientDesc}`,
        `Date of Incident / Admission: ${caseProfile.dateOfIncident || 'Per Record'}`,
        `Core Medical Allegation: ${caseProfile.allegationsSummary || 'Alleged failure to adhere to the standard of care during clinical management.'}`,
        `Retaining Perspective: Evaluating medical decision-making from the perspective of ${isDefense ? 'the defense and treating physicians' : 'the plaintiff and injured patient'}.`,
        `Evidentiary Scope: Comprehensive chronological audit of all contemporaneous hospital and outpatient records.`
      ],
      keyHighlight: `Legal Standard: Objective evaluation based upon a reasonable degree of medical certainty.`,
      speakerNotes: 'Provide the overarching factual context and define the legal threshold required for testimony.'
    },

    // Slide 3: Parties Involved & Healthcare Providers
    {
      slideNumber: 3,
      title: 'Key Clinical Actors & Healthcare Institutions',
      category: 'PARTIES & PROVIDERS',
      bulletPoints: [
        `Primary Treating Facility: ${caseProfile.milestones[0]?.facilityDepartment || 'Acute Care Medical Center'}`,
        `Attending / Lead Physician: ${caseProfile.milestones[1]?.provider || 'Attending Physician of Record'}`,
        `Consulting Specialists: ${caseProfile.milestones.filter(m => m.category === 'PHYSICIAN_CONSULT').map(m => m.provider).slice(0, 2).join(', ') || 'Specialty Services'}`,
        `Ancillary Services: Emergency Department, Nursing Staff, Radiology, Pharmacy, Clinical Laboratory`,
        `Inter-Facility Coordination: EMS Transport and Tertiary Receiving Center`
      ],
      keyHighlight: 'Identifies all credentialed providers involved in the chain of decision-making.',
      speakerNotes: 'Establish the roles, specialties, and institutional relationships of the healthcare personnel.'
    },

    // Slide 4: Evidentiary Record Reviewed & Bates Catalog
    {
      slideNumber: 4,
      title: 'Evidentiary Record Ingested & Bates Index',
      category: 'EVIDENTIARY AUDIT',
      bulletPoints: [
        `Total Ingested Document Bundles: ${totalDocs} verified sets`,
        `Cumulative Medical Record Pages: ${totalPages} Bates-stamped pages`,
        `Bates Identification Range: ${batesRange}`,
        `Record Categories: Inpatient hospital records, nursing flowsheets, vital sign charts, eMAR logs, diagnostic imaging, and laboratory audits.`,
        `Chain of Custody & Completeness: Contemporaneous documentation verified against EHR audit logs.`
      ],
      keyHighlight: `Complete Bates numbering establishes immutable citation integrity for all opinions.`,
      batesCitations: caseProfile.documents.map(d => `${d.batesPrefix}${String(d.batesStartNumber).padStart(5, '0')}`),
      speakerNotes: 'Emphasize that this forensic review is founded upon the complete disclosed medical record.'
    },

    // Slide 5: Initial Clinical Presentation & Baseline Vitals
    {
      slideNumber: 5,
      title: 'Initial Clinical Presentation & Baseline Vitals',
      category: 'CLINICAL INTAKE',
      bulletPoints: [
        `Initial Triage Time: ${caseProfile.milestones[0]?.timeDisplay || '00:00'}`,
        `Presenting Symptoms: ${caseProfile.milestones[0]?.summary || 'Acute distress with characteristic symptoms on presentation.'}`,
        `Initial Hemodynamics: SBP ${caseProfile.vitals[0]?.sbp || 120} / DBP ${caseProfile.vitals[0]?.dbp || 80} mmHg (MAP ${caseProfile.vitals[0]?.map || 93} mmHg)`,
        `Baseline Heart Rate & Saturation: HR ${caseProfile.vitals[0]?.hr || 80} bpm, SpO2 ${caseProfile.vitals[0]?.spo2 || 98}%`,
        `Triage Acuity Level: ESI Acuity level assigned per emergency department triage criteria.`
      ],
      keyHighlight: `Contemporaneous Triage Bates Citation: ${caseProfile.vitals[0]?.batesNumber || 'REC-00001'}`,
      batesCitations: [caseProfile.vitals[0]?.batesNumber || 'REC-00001'],
      speakerNotes: 'Examine the baseline physiology and symptom profile before any medical interventions took place.'
    },

    // Slide 6: Chronological Timeline - Phase 1: Intake & Triage
    {
      slideNumber: 6,
      title: 'Chronological Timeline — Phase 1: Intake & Triage',
      category: 'CARE TIMELINE',
      bulletPoints: [
        `Timeline Window: Initial 0 to 60 minutes following arrival`,
        `Care Event: ${caseProfile.milestones[0]?.title || 'Emergency Admission and Registration'}`,
        `Provider Action: ${caseProfile.milestones[0]?.provider || 'Triage Nursing Team'} performed initial nursing assessment and documented chief complaint.`,
        `Clinical Findings: ${caseProfile.milestones[0]?.summary || 'Patient intake and baseline assessment recorded.'}`,
        `Bates Documentation: Documented at Bates ${caseProfile.milestones[0]?.batesNumber || 'REC-00002'}`
      ],
      keyHighlight: isDefense ? 'Defense Note: Triage was prompt and adhered strictly to standard protocols.' : 'Plaintiff Note: Vital sign abnormalities were documented but escalation was delayed.',
      batesCitations: [caseProfile.milestones[0]?.batesNumber || 'REC-00002'],
      speakerNotes: 'Walk the jury through the earliest minutes of patient care.'
    },

    // Slide 7: Chronological Timeline - Phase 2: Diagnostic Workup
    {
      slideNumber: 7,
      title: 'Chronological Timeline — Phase 2: Diagnostic Workup',
      category: 'CARE TIMELINE',
      bulletPoints: [
        `Timeline Window: 1 to 3 hours post-presentation`,
        `Physician Bedside Encounter: ${caseProfile.milestones[1]?.title || 'Attending Bedside Assessment'}`,
        `Diagnostic Orders: Laboratory blood draws, serial biomarkers, diagnostic imaging protocols`,
        `Differential Diagnosis Formulated: Evaluating high-acuity life threats vs. common presentations`,
        `Bates Documentation: Bedside evaluation authenticated at Bates ${caseProfile.milestones[1]?.batesNumber || 'REC-00004'}`
      ],
      keyHighlight: isDefense ? 'Defense Note: Appropriate initial diagnostic workup prioritized most common presentations.' : 'Plaintiff Note: Diagnostic workup failed to order definitive imaging in a timely manner.',
      batesCitations: [caseProfile.milestones[1]?.batesNumber || 'REC-00004'],
      speakerNotes: 'Detail the medical thought process and laboratory/imaging workup ordered by the physicians.'
    },

    // Slide 8: Chronological Timeline - Phase 3: Critical Decision Points
    {
      slideNumber: 8,
      title: 'Chronological Timeline — Phase 3: Critical Decision Points',
      category: 'CARE TIMELINE',
      bulletPoints: [
        `Timeline Window: 3 to 6 hours post-presentation`,
        `Key Clinical Pivot: ${caseProfile.milestones[2]?.title || 'Diagnostic Imaging & Specialty Consultation'}`,
        `Specialty Inquiries: Specialist consult requested based on evolving test results`,
        `Institutional Capabilities: Evaluation of on-site resources vs. need for emergent transfer`,
        `Bates Documentation: Specialty consult and orders documented at Bates ${caseProfile.milestones[2]?.batesNumber || 'REC-00013'}`
      ],
      keyHighlight: `Diagnostic Confirmation Documented at Bates ${caseProfile.milestones[2]?.batesNumber || 'REC-00013'}`,
      batesCitations: [caseProfile.milestones[2]?.batesNumber || 'REC-00013'],
      speakerNotes: 'Highlight the pivotal moment when the definitive clinical picture emerged.'
    },

    // Slide 9: Chronological Timeline - Phase 4: Acute Intervention
    {
      slideNumber: 9,
      title: 'Chronological Timeline — Phase 4: Acute Intervention Phase',
      category: 'CARE TIMELINE',
      bulletPoints: [
        `Timeline Window: Active resuscitation and intervention interval`,
        `Clinical Action: ${caseProfile.milestones[3]?.title || 'Therapeutic Intervention and Transfer Protocol'}`,
        `Pharmacologic Management: Initiation of targeted IV infusions, blood pressure titration, and monitoring`,
        `Transfer Coordination: Emergent dispatch coordination with tertiary surgical center`,
        `Bates Documentation: Documented in progress notes at Bates ${caseProfile.milestones[3]?.batesNumber || 'REC-00017'}`
      ],
      keyHighlight: isDefense ? 'Defense Note: Immediate medical stabilization was instituted to protect against catastrophic rupture.' : 'Plaintiff Note: Unacceptable delay occurred in transferring patient to surgical center.',
      batesCitations: [caseProfile.milestones[3]?.batesNumber || 'REC-00017'],
      speakerNotes: 'Examine the active medical management and emergency measures taken.'
    },

    // Slide 10: Chronological Timeline - Phase 5: Deterioration & Outcome
    {
      slideNumber: 10,
      title: 'Chronological Timeline — Phase 5: Outcome & Arrest',
      category: 'CARE TIMELINE',
      bulletPoints: [
        `Timeline Window: Terminal clinical episode`,
        `Adverse Event: ${caseProfile.milestones[4]?.title || 'Sudden Hemodynamic Collapse & Cardiac Arrest'}`,
        `Resuscitation Efforts: Advanced Cardiac Life Support (ACLS) protocol initiated immediately`,
        `Definitive Pathology: Catastrophic structural failure resulting in rapid irreversible arrest`,
        `Bates Documentation: Code summary and pronouncement recorded at Bates ${caseProfile.milestones[4]?.batesNumber || 'REC-00031'}`
      ],
      keyHighlight: `Final Resuscitation Summary Authenticated at Bates ${caseProfile.milestones[4]?.batesNumber || 'REC-00031'}`,
      batesCitations: [caseProfile.milestones[4]?.batesNumber || 'REC-00031'],
      speakerNotes: 'Present the objective clinical circumstances surrounding the terminal event.'
    },

    // Slide 11: Physiological Trajectory & Hemodynamic Curve
    {
      slideNumber: 11,
      title: 'Physiological Trajectory & Hemodynamic Monitoring',
      category: 'HEMODYNAMICS',
      bulletPoints: [
        `Continuous Blood Pressure Trajectory: Plotted systolic (SBP) and diastolic (DBP) curves`,
        `Mean Arterial Pressure (MAP) Thresholds: Monitored against the critical shock threshold (MAP < 65 mmHg)`,
        `Initial Compensatory Response: Severe initial hypertension followed by sudden decompensation`,
        `Pulse Pressure Variations: Reflecting changing myocardial and vascular compliance`,
        `Bates Citations: Flowsheet readings across Bates ${caseProfile.vitals.slice(0, 3).map(v => v.batesNumber).join(', ') || 'REC-00003 - REC-00014'}`
      ],
      keyHighlight: 'Graphic curves demonstrate the objective physiological deterioration over time.',
      batesCitations: caseProfile.vitals.slice(0, 4).map(v => v.batesNumber),
      speakerNotes: 'Walk through the vital signs chart to demonstrate physiological stability vs. collapse.'
    },

    // Slide 12: Medication Administration Record (MAR) Analysis
    {
      slideNumber: 12,
      title: 'Medication Administration Record (MAR) Audit',
      category: 'PHARMACOTHERAPY',
      bulletPoints: [
        `Total Documented Administrations: ${caseProfile.medications.length} key pharmacologic agents`,
        `Primary Therapeutic Agents: ${caseProfile.medications.map(m => m.drugName).slice(0, 3).join(', ') || 'Beta-blockers, analgesics, and infusions'}`,
        `Timing & Dosing Verification: Barcode scanning logs cross-referenced with physician order timestamps`,
        `Administration Delays: Audited against hospital golden-hour protocols`,
        `Bates Citations: eMAR records documented across ${caseProfile.medications.slice(0, 3).map(m => m.batesNumber).join(', ') || 'REC-00004 - REC-00011'}`
      ],
      keyHighlight: 'Medication timing directly correlated with hemodynamic stabilization attempts.',
      batesCitations: caseProfile.medications.slice(0, 3).map(m => m.batesNumber),
      speakerNotes: 'Analyze whether medications were ordered, dispensed, and administered in a timely manner.'
    },

    // Slide 13: Allegations & Assertions by Opposing Counsel
    {
      slideNumber: 13,
      title: 'Allegations & Assertions Formulated by Opposing Counsel',
      category: 'LEGAL CONTROVERSY',
      bulletPoints: [
        `Allegation 1: ${isDefense ? 'Plaintiff claims diagnostic delay in recognizing acute life threat.' : 'Defense asserts outcome was an unavoidable recognized complication.'}`,
        `Allegation 2: ${isDefense ? 'Plaintiff claims institutional failure in transfer coordination.' : 'Defense claims pre-existing patient comorbidities caused sudden collapse.'}`,
        `Allegation 3: ${isDefense ? 'Plaintiff claims breach of standard of care directly caused mortality.' : 'Defense claims clinical judgment was within acceptable medical standards.'}`,
        `Legal Context: Allegations evaluated under the legal definition of medical negligence and reasonable medical certainty.`
      ],
      keyHighlight: `Scrutinizing the opposing legal theory against the objective medical facts.`,
      speakerNotes: 'Examine each specific claim advanced by opposing counsel.'
    },

    // Slide 14: Evidentiary Rebuttal & Chart Disproof
    {
      slideNumber: 14,
      title: 'Evidentiary Rebuttal & Objective Chart Disproof',
      category: 'EVIDENTIARY REBUTTAL',
      bulletPoints: [
        `Rebuttal Point 1: Contemporaneous records contradict opposing counsel's claims regarding provider inattention.`,
        `Rebuttal Point 2: Bedside documentation demonstrates active pharmacologic titration and close monitoring.`,
        `Rebuttal Point 3: Diagnostic delays asserted by opposition fail to account for medical stabilization prerequisites.`,
        `Objective Chart Proof: Physician progress notes directly contradict opposing counsel's retrospective narrative.`,
        `Key Supporting Bates Citations: ${caseProfile.defenseAnchors[0]?.batesCitations.join(', ') || caseProfile.plaintiffBreaches[0]?.batesCitations.join(', ') || 'REC-00005, REC-00009'}`
      ],
      keyHighlight: 'The contemporaneous medical record disproves retrospective hindsight allegations.',
      batesCitations: caseProfile.defenseAnchors[0]?.batesCitations || ['REC-00005'],
      speakerNotes: 'Present the documentary proof that refutes opposing counsel\'s assertions.'
    },

    // Slide 15: Applicable Standard of Care & Guidelines
    {
      slideNumber: 15,
      title: 'Applicable Standard of Care & Professional Guidelines',
      category: 'STANDARD OF CARE',
      bulletPoints: [
        `Governing Professional Guidelines: ACC, AHA, AATS, and ACEP clinical practice parameters`,
        `Legal Definition: Degree of skill, care, and diligence exercised by reasonably prudent healthcare providers under similar circumstances`,
        `Prohibition of Hindsight Bias: The care must be evaluated based on facts known at the time, not retrospective outcome`,
        `Acceptable Variations in Practice: Medical judgment permits clinical discretion in prioritizing diagnostic differentials`,
        `Compliance Assessment: Detailed adherence to evidence-based medical literature in effect at time of care.`
      ],
      keyHighlight: 'Standard of care does not require diagnostic omniscience; it requires reasoned clinical prudence.',
      speakerNotes: 'Define the precise legal and clinical standard governing the healthcare providers.'
    },

    // Slide 16: Key Evidentiary Exhibit A: Diagnostic Imaging
    {
      slideNumber: 16,
      title: 'Key Evidentiary Exhibit A: Diagnostic Imaging & PACS',
      category: 'EVIDENTIARY EXHIBITS',
      bulletPoints: [
        `Imaging Modality: Contrast-Enhanced CT Angiography / Diagnostic Radiologic Study`,
        `Radiologist Interpretation Time: Contemporaneous read by attending radiologist`,
        `Objective Anatomic Findings: Precise structural findings documented on imaging`,
        `Communication of Critical Results: Direct closed-loop physician-to-physician telephone notification`,
        `Bates Documentation: Imaging report authenticated at Bates ${caseProfile.milestones[2]?.batesNumber || 'REC-00013'}`
      ],
      keyHighlight: `Radiologic Report Authenticated at Bates ${caseProfile.milestones[2]?.batesNumber || 'REC-00013'}`,
      batesCitations: [caseProfile.milestones[2]?.batesNumber || 'REC-00013'],
      speakerNotes: 'Review the critical diagnostic imaging report and communication trail.'
    },

    // Slide 17: Key Evidentiary Exhibit B: Bedside Nursing Flowsheets
    {
      slideNumber: 17,
      title: 'Key Evidentiary Exhibit B: Bedside Nursing & Flowsheets',
      category: 'EVIDENTIARY EXHIBITS',
      bulletPoints: [
        `Flowsheet Audit: Intensive care / Emergency department bedside nursing records`,
        `Continuous Monitoring: Timestamped entries tracking pain scale, respiratory status, and neuro checks`,
        `Physician Escalation Logs: Contemporaneous notes documenting bedside provider notification`,
        `Audit Trail Authentication: Electronic signature timestamps verifying timely record completion`,
        `Bates Documentation: Nursing flowsheets authenticated at Bates ${caseProfile.milestones[1]?.batesNumber || 'REC-00005'}`
      ],
      keyHighlight: `Nursing Flowsheets Authenticated at Bates ${caseProfile.milestones[1]?.batesNumber || 'REC-00005'}`,
      batesCitations: [caseProfile.milestones[1]?.batesNumber || 'REC-00005'],
      speakerNotes: 'Demonstrate the detailed minute-by-minute bedside nursing documentation.'
    },

    // Slide 18: Proximate Causation Analysis & Alternative Causes
    {
      slideNumber: 18,
      title: 'Proximate Causation Analysis & Alternative Etiologies',
      category: 'CAUSATION OPINION',
      bulletPoints: [
        `Legal Causation Standard: "More likely than not" (>50% reasonable medical probability)`,
        `Mechanistic Analysis: Evaluating whether acts or omissions altered the patient's biological outcome`,
        `Natural Disease Progression: Severe structural vascular pathology carries high intrinsic mortality independent of care`,
        `Confounding Risk Factors: Extensive pre-existing cardiovascular risk factors and comorbidities`,
        `Forensic Conclusion on Causation: ${caseProfile.causationOpinion.slice(0, 150) || 'Causation assessment completed to a reasonable degree of medical certainty.'}...`
      ],
      keyHighlight: 'The biological outcome was determined by natural disease severity, not clinical omissions.',
      speakerNotes: 'Explain the mechanistic bridge between medical care and final clinical outcome.'
    },

    // Slide 19: Standard of Care Determination & Expert Finding
    {
      slideNumber: 19,
      title: 'Standard of Care Determination & Final Clinical Finding',
      category: 'FINAL OPINION',
      bulletPoints: [
        `Official Expert Finding: The Standard of Medical Care was ${caseProfile.standardOfCareDetermination || 'MET'} by the treating providers.`,
        `Clinical Justification: Treatment decisions reflected reasoned medical judgment under high-acuity emergency conditions.`,
        `Adherence to Best Practices: Timely hemodynamic impulse control and stabilization were appropriately prioritized.`,
        `Rejection of Negligence Claims: Opposing counsel's claims rely upon impermissible hindsight and ignore clinical realities.`,
        `Standard of Care Benchmark: Reasonable prudence was maintained throughout the duration of patient management.`
      ],
      keyHighlight: `EXPERT DETERMINATION: STANDARD OF CARE ${caseProfile.standardOfCareDetermination || 'MET'}`,
      speakerNotes: 'Deliver the definitive expert conclusion on standard of care.'
    },

    // Slide 20: Summary of Opinions & Expert Attestation
    {
      slideNumber: 20,
      title: 'Summary of Expert Opinions & Attestation',
      category: 'EXPERT ATTESTATION',
      bulletPoints: [
        `Expert Declarant: A. Alex Mohit, MD, PhD — Board Certified Neurosurgeon`,
        `Specialty Qualifications: Active clinical practice and extensive experience in acute surgical emergencies`,
        `Certification: All opinions expressed herein are held to a reasonable degree of medical certainty.`,
        `Evidentiary Basis: Opinions founded upon rigorous review of ${totalPages} pages of contemporaneous medical records.`,
        `Legal Availability: Prepared to testify in deposition and trial in accordance with this disclosure.`
      ],
      keyHighlight: `Executed under penalty of perjury for courtroom presentation.`,
      speakerNotes: 'Reiterate qualifications, certitude of opinion, and readiness to testify under oath.'
    }
  ];
}

/**
 * Generates and downloads a real PowerPoint (.pptx) file using pptxgenjs
 */
export async function exportToPowerPoint(caseProfile: CaseProfile, stance: StanceMode): Promise<string> {
  const ppt = new pptxgen();
  const isDefense = stance === 'DEFENSE';

  // Presentation Layout (16:9 Widescreen)
  ppt.layout = 'LAYOUT_16x9';
  ppt.title = `Forensic Case Review - ${caseProfile.caseName || 'Case Review'}`;
  ppt.author = 'A. Alex Mohit, MD, PhD';
  ppt.company = 'ForensicReview Medicolegal Workstation';

  const slidesData = build20SlideDeckData(caseProfile, stance);

  // Theme Colors
  const bgColor = '0F172A'; // Obsidian Navy Slate
  const cardBg = '1E293B';  // Darker Slate Card
  const titleColor = 'FFFFFF';
  const textColor = 'CBD5E1';
  const accentColor = isDefense ? '38BDF8' : 'F87171'; // Cyan or Coral
  const badgeBg = isDefense ? '1E40AF' : '991B1B';

  slidesData.forEach((slideItem) => {
    const slide = ppt.addSlide();
    slide.background = { color: bgColor };

    // Slide Header: Category Pill
    slide.addText(slideItem.category, {
      x: 0.8,
      y: 0.4,
      w: 3.5,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: accentColor,
      bold: true
    });

    // Slide Header: Title
    slide.addText(slideItem.title, {
      x: 0.8,
      y: 0.75,
      w: 11.5,
      h: 0.8,
      fontSize: 22,
      fontFace: 'Arial',
      color: titleColor,
      bold: true
    });

    // Main Card Box
    slide.addShape(ppt.ShapeType.rect, {
      x: 0.8,
      y: 1.6,
      w: 11.7,
      h: 4.8,
      fill: { color: cardBg },
      line: { color: '334155', width: 1 }
    });

    // Bullet Points
    const bulletTexts = slideItem.bulletPoints.map(pt => ({
      text: pt,
      options: {
        fontSize: 13,
        color: textColor,
        breakLine: true,
        bullet: true,
        lineSpacing: 26
      }
    }));

    slide.addText(bulletTexts, {
      x: 1.1,
      y: 1.8,
      w: 11.1,
      h: 3.4,
      fontFace: 'Arial'
    });

    // Key Highlight Banner at bottom of card
    if (slideItem.keyHighlight) {
      slide.addShape(ppt.ShapeType.rect, {
        x: 1.1,
        y: 5.3,
        w: 11.1,
        h: 0.8,
        fill: { color: isDefense ? '0C4A6E' : '7F1D1D' },
        line: { color: accentColor, width: 1 }
      });

      slide.addText(slideItem.keyHighlight, {
        x: 1.3,
        y: 5.4,
        w: 10.7,
        h: 0.6,
        fontSize: 12,
        fontFace: 'Arial',
        color: 'FFFFFF',
        bold: true
      });
    }

    // Slide Footer (Page Number & Branding)
    slide.addText(`Slide ${slideItem.slideNumber} of 20 • ForensicReview Workstation • Dr. A. Alex Mohit, MD, PhD`, {
      x: 0.8,
      y: 6.8,
      w: 11.7,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: '64748B'
    });

    // Add Speaker Notes
    if (slideItem.speakerNotes) {
      slide.addNotes(slideItem.speakerNotes);
    }
  });

  const fileName = `ForensicReview_${caseProfile.caseName ? caseProfile.caseName.replace(/[^a-zA-Z0-9]/g, '_') : 'Case'}_20Slide_Presentation.pptx`;
  await ppt.writeFile({ fileName });
  return fileName;
}
