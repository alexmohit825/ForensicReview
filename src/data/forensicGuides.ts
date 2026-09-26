import { SectionGuide } from '../types/forensic';

export const FORENSIC_GUIDES: Record<string, SectionGuide> = {
  ingestion: {
    sectionId: 'ingestion',
    title: 'Medical Record Ingestion & Bates Verification Guide',
    subtitle: 'Forensic integrity, completeness audits, and document chronology',
    coreObjective: 'Ingest raw hospital, clinic, EMS, and ancillary records, establishing a continuous Bates-numbered evidentiary record without chronological gaps or missing pages.',
    forensicChecklist: [
      'Verify Bates numbering continuity: confirm no missing page numbers in disclosure bundles.',
      'Check EHR Audit Trail availability: ensure delayed late entries (>24h post-event) are identified.',
      'Correlate multi-facility records: match EMS run sheets, transfer facility notes, and receiving ICU charts.',
      'Audit handwritten vs. transcribed dictated notes for timestamp discrepancies.',
      'Ensure diagnostic imaging reports are cross-checked against actual radiology PACS read times.'
    ],
    legalTrapsToAvoid: [
      'Relying solely on summary discharge paperwork rather than raw bedside nursing flow sheets.',
      'Failing to note missing telemetry strips or fetal heart monitor tracings in initial review.',
      'Assuming recorded dictation dates match the actual bedside patient encounter time.',
      'Overlooking unsigned verbal physician orders that were never authenticated.'
    ],
    expertDepositionTips: [
      'Always refer to the exact Bates stamp range when asked if you reviewed the complete chart.',
      'If opposing counsel claims a record is missing, state clearly whether it was in the disclosed bundle provided by retaining counsel.',
      'Maintain an itemized list of records reviewed as an inviolable appendix to your Rule 26 report.'
    ],
    standardOfCareBenchmark: 'An expert medical opinion must be predicated upon a complete, unredacted examination of the contemporaneous medical record, including nursing flowsheets, telemetry, and laboratory audits.'
  },

  timeline: {
    sectionId: 'timeline',
    title: 'Multi-Track Graphic & Chart Timeline Guide',
    subtitle: 'Synchronized hemodynamic visualization, failure-to-rescue analysis, and provider notification',
    coreObjective: 'Visually correlate continuous physiological deterioration (vitals, labs) with discrete physician orders, nursing interventions, and delays in escalation.',
    forensicChecklist: [
      'Map Mean Arterial Pressure (MAP) and Systolic BP against clinical collapse thresholds (MAP < 65 mmHg).',
      'Pinpoint exact minute of provider notification versus minute of bedside arrival.',
      'Trace shock progression: correlate tachycardia, tachypnea, and lactic acidosis with fluid resuscitation.',
      'Identify "Failure-to-Rescue" windows: time elapsed between first abnormal sign and definitive therapy.',
      'Correlate nurse shift changes (typically 07:00 and 19:00) with communication handoff gaps.'
    ],
    legalTrapsToAvoid: [
      'Hindsight Bias: Attributing catastrophic collapse to a single isolated vital sign without reviewing overall trend.',
      'Equating normal automated machine vitals with true hemodynamic stability if clinical exam showed distress.',
      'Overlooking physician bedside documentation of acceptable compensatory physiological variations.',
      'Failing to verify whether the attending physician was actually notified of bedside nursing alerts.'
    ],
    expertDepositionTips: [
      'Use the timeline graphics to show the jury the objective countdown clock between warning signs and intervention.',
      'If defending: highlight stable intervals where conservative watchful waiting was standard, evidence-based care.',
      'If plaintiff: highlight the exact hour the trajectory became irreversible and therapy was withheld.'
    ],
    standardOfCareBenchmark: 'Standard of care mandates timely recognition of abnormal physiological trends and rapid escalation to senior decision-makers within an acceptable therapeutic window.'
  },

  mar: {
    sectionId: 'mar',
    title: 'Medication Administration Record (MAR) Forensic Guide',
    subtitle: 'Dosing verification, timing deviations, blackout intervals, and reversal agents',
    coreObjective: 'Scrutinize medication order times against actual bedside barcode administration scans, identifying delayed antibiotics, anticoagulation lapses, or sedation overdoses.',
    forensicChecklist: [
      'Verify "Time Ordered" vs. "Time Administered" delta (especially broad-spectrum sepsis antibiotics, target < 1 hour).',
      'Check therapeutic heparin/anticoagulation monitoring: PTT / Anti-Xa titration delays.',
      'Audit opioid and sedative co-administration leading to respiratory depression or unmonitored sedation.',
      'Confirm administration of reversal agents (Narcan, Flumazenil, Protamine, Andexxa, Kcentra) and timing.',
      'Identify missed or held doses without documented physician rationale in the progress notes.'
    ],
    legalTrapsToAvoid: [
      'Assuming an order entered in the EHR was immediately given to the patient.',
      'Ignoring pharmacy dispensing delays that were outside the bedside nurse\'s control.',
      'Failing to check whether a held dose was clinically indicated due to sudden hypotension or bleeding risk.',
      'Confusing static scheduled medication times with dynamic PRN (as-needed) rescue doses.'
    ],
    expertDepositionTips: [
      'Reference barcode medication scanning logs (eMAR) to verify exact minute-level administration.',
      'Tie medication timing directly to hemodynamic response on the vital signs chart.',
      'Demonstrate whether medication delays directly altered patient survival or organ preservation.'
    ],
    standardOfCareBenchmark: 'Critical medications in emergent conditions (severe sepsis, acute coronary syndrome, intracranial hemorrhage) require administration strictly within protocolized golden-hour windows.'
  },

  stance: {
    sectionId: 'stance',
    title: 'Dual-Stance Pivot & Legal Argumentation Guide',
    subtitle: 'Structuring unassailable arguments for Defense or Plaintiff retaining counsel',
    coreObjective: 'Dynamically re-weight the case analysis between identifying standard-of-care breaches (Plaintiff) and substantiating reasoned clinical judgment (Defense).',
    forensicChecklist: [
      'Plaintiff Lens: Establish Duty, Breach, Proximate Cause, and Resulting Injury with >50% medical probability.',
      'Plaintiff Lens: Isolate missed red flags, critical value delays, and violations of written hospital policies.',
      'Defense Lens: Document that the adverse event was an unavoidable, recognized complication disclosed in informed consent.',
      'Defense Lens: Emphasize confounding comorbidities, atypical clinical presentations, and alternative etiologies.',
      'Both Lenses: Ensure all arguments are grounded in the prevailing clinical guidelines in effect at the time of care.'
    ],
    legalTrapsToAvoid: [
      'Advocacy Bias: Do not cross the line from objective forensic medical expert to biased partisan advocate.',
      'Adopting theories that cannot survive Daubert/Frye judicial gatekeeping or peer-reviewed literature scrutiny.',
      'Plaintiff: Claiming negligence solely because a bad outcome occurred (res ipsa loquitur rarely applies in complex medicine).',
      'Defense: Defending the indefensible when documented hospital protocol was plainly violated without rationale.'
    ],
    expertDepositionTips: [
      'Always acknowledge undisputed facts readily; credibility with the jury is built on absolute candor.',
      'When opposing counsel asks if medicine is an exact science, emphasize clinical judgment and evolving presentations.',
      'Frame your opinion around "what a reasonably prudent physician would have done under similar circumstances."'
    ],
    standardOfCareBenchmark: 'The Standard of Care does not require perfection or optimal outcome; it requires that degree of skill, care, and diligence normally exercised by reasonably prudent healthcare providers under similar circumstances.'
  },

  synopsis: {
    sectionId: 'synopsis',
    title: 'Standard of Care Opinion & Synopsis Guide',
    subtitle: 'Drafting court-admissible expert witness reports and Rule 26 disclosures',
    coreObjective: 'Synthesize the entire evidentiary corpus into a structured, highly persuasive expert witness report with unambiguous findings on standard of care and proximate causation.',
    forensicChecklist: [
      'State your qualifications, specialty certification, and active clinical practice during the relevant timeframe.',
      'Provide a succinct executive summary before diving into the day-by-day chronological narrative.',
      'Frame standard-of-care opinions clearly: "It is my opinion to a reasonable degree of medical certainty that..."',
      'Address the causation bridge: explain mechanistically how the breach caused the specific harm, or why it did not.',
      'Provide exact Bates-stamped record citations for every clinical assertion made in the report.'
    ],
    legalTrapsToAvoid: [
      'Using speculative language such as "could have," "possibly," or "might have" (must meet "more likely than not" >50%).',
      'Failing to define the standard of care before declaring it breached.',
      'Ignoring unfavorable evidence in the chart—opposing counsel will exploit unaddressed facts in cross-examination.',
      'Expressing opinions outside your medical specialty or clinical scope of practice.'
    ],
    expertDepositionTips: [
      'Write your report as if the jury will read every word—avoid unnecessary arcane jargon without plain-English definitions.',
      'Ensure every conclusion is tied to a verifiable document page in your timeline.',
      'Re-read your own prior published peer-reviewed papers to prevent contradictions during cross-examination.'
    ],
    standardOfCareBenchmark: 'Expert testimony must be based upon sufficient facts or data, the product of reliable principles and methods reliably applied to the facts of the case.'
  },

  deposition: {
    sectionId: 'deposition',
    title: 'Hostile Cross-Examination & Deposition Simulator Guide',
    subtitle: 'Preparing bulletproof answers against opposing counsel attack vectors',
    coreObjective: 'Anticipate hostile lines of questioning, trap hypotheticals, and record impeachment vectors, preparing devastatingly clear factual rebuttals backed by chart evidence.',
    forensicChecklist: [
      'Identify the top 5 weakest links in your case narrative and formulate documentary defenses.',
      'Prepare for the "Isn\'t it possible?" trap question (always redirect to "probable within reasonable medical certainty").',
      'Review all prior deposition transcripts and publications for potential impeachment citations.',
      'Practice concise, direct answers: "Yes," "No," or direct factual answer without unprompted elaboration.',
      'Anchor every answer in the objective contemporaneous record rather than memory or speculation.'
    ],
    legalTrapsToAvoid: [
      'Arguing with opposing counsel or showing visible irritation.',
      'Accepting a false or loaded factual premise embedded in opposing counsel\'s hypothetical question.',
      'Volunteering unsolicited opinions or expanding beyond the exact question asked.',
      'Guessing when asked about a specific note—insist on seeing the Bates-stamped document before answering.'
    ],
    expertDepositionTips: [
      'Pause 3 seconds before answering to allow retaining counsel time to formulate objections.',
      'If asked: "Doctor, did you look at the whole record?", answer: "I thoroughly reviewed all records provided to me in Exhibit A."',
      'Never allow opposing counsel to put words in your mouth; rephrase and correct inaccurate restatements immediately.'
    ],
    standardOfCareBenchmark: 'The credible expert witness remains calm, dispassionate, and unshakeably anchored in the contemporaneous medical facts.'
  }
};
