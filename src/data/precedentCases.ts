/**
 * Medicolegal Precedent Cases & Verdict Vault
 * Comprehensive index of landmark medical malpractice precedents, standard of care benchmarks,
 * and historical case rulings for comparative forensic analysis.
 */

export interface PrecedentCase {
  id: string;
  caption: string;
  docketNumber: string;
  jurisdiction: string;
  specialty: 'NEUROSURGERY' | 'SPINE_SURGERY' | 'EMERGENCY_MEDICINE' | 'CARDIOTHORACIC' | 'GENERAL_SURGERY' | 'CRITICAL_CARE';
  clinicalCondition: string;
  allegationType: 'DIAGNOSTIC_DELAY' | 'SURGICAL_COMPLICATION' | 'FAILURE_TO_MONITOR' | 'INFORMED_CONSENT' | 'COMMUNICATION_BREAKDOWN';
  synopsis: string;
  standardOfCareBenchmark: string;
  plaintiffTheory: string;
  defenseTheme: string;
  outcomeDetermination: 'DEFENSE_VERDICT' | 'PLAINTIFF_VERDICT' | 'CONFIDENTIAL_SETTLEMENT' | 'DISMISSED_SUMMARY_JUDGMENT';
  verdictAmount?: string;
  relevanceKeywords: string[];
  keyLegalTakeaway: string;
}

export const PRECEDENT_CASES: PrecedentCase[] = [
  {
    id: 'prec-1',
    caption: 'Estate of Henderson v. St. Luke’s Memorial Hospital, et al.',
    docketNumber: '21-CV-04921-WA',
    jurisdiction: 'Superior Court of Washington (King County)',
    specialty: 'EMERGENCY_MEDICINE',
    clinicalCondition: 'Acute Stanford Type A Aortic Dissection',
    allegationType: 'DIAGNOSTIC_DELAY',
    synopsis: '52-year-old male presented to community ED with sudden severe interscapular ripping back pain and SBP 195/110. Attending anchored on Acute Coronary Syndrome; delayed CTA for 4.2 hours. Patient sustained retrograde root rupture and cardiac tamponade in ED prior to transfer.',
    standardOfCareBenchmark: 'ACC/AHA Guidelines require definitive contrast imaging (CTA or TEE) within 60-90 minutes of acute aortic syndrome suspicion, with concurrent impulse control (< 120 mmHg, HR < 60).',
    plaintiffTheory: 'Unreasonable 4-hour delay in ordering CTA directly caused fatal intrapericardial rupture. Each hour of delay increases Type A mortality by 1-2%; timely repair yields > 75% surgical survival.',
    defenseTheme: 'ACS is statistically 50x more prevalent; physician exercised reasoned clinical judgment in evaluating ischemic myocardium first. Autopsy revealed extensive pre-existing cystic medial necrosis.',
    outcomeDetermination: 'PLAINTIFF_VERDICT',
    verdictAmount: '$4,250,000 Verdict',
    relevanceKeywords: ['aortic', 'dissection', 'tearing pain', 'hypertension', 'CTA delay', 'cardiac tamponade', 'emergency medicine'],
    keyLegalTakeaway: 'Anchoring prematurely on ACS in the presence of classic "ripping" back pain and severe refractory hypertension constitutes a defenseless standard of care breach when CTA is available on-site.'
  },
  {
    id: 'prec-2',
    caption: 'Kaufman v. Northwest Spine Institute & Dr. Bradley, MD',
    docketNumber: '19-CV-11048-OR',
    jurisdiction: 'Multnomah County Circuit Court, Oregon',
    specialty: 'SPINE_SURGERY',
    clinicalCondition: 'Acute Cauda Equina Syndrome secondary to L4-L5 Herniation',
    allegationType: 'DIAGNOSTIC_DELAY',
    synopsis: '44-year-old female developed urinary retention and bilateral saddle paresthesias 3 days following an L4-L5 microdiscectomy. On-call spine surgeon advised waiting until morning office hours (14-hour delay) rather than ordering STAT emergent lumbar MRI and decompression.',
    standardOfCareBenchmark: 'Emergent decompression within 24 hours of autonomic bowel/bladder dysfunction onset is mandated to prevent permanent neurogenic bladder and fecal incontinence.',
    plaintiffTheory: 'Failure to perform emergent midnight decompression deprived plaintiff of statistical opportunity for sphincter recovery, resulting in permanent bilateral neurogenic bladder requiring self-catheterization.',
    defenseTheme: 'Patient had incomplete cauda equina syndrome with preexisting radiculopathy; post-op voiding difficulty was initially consistent with transient urinary retention secondary to narcotics and anesthesia.',
    outcomeDetermination: 'CONFIDENTIAL_SETTLEMENT',
    verdictAmount: '$2,800,000 Settlement',
    relevanceKeywords: ['cauda equina', 'urinary retention', 'saddle anesthesia', 'microdiscectomy', 'spine surgery', 'decompression timing'],
    keyLegalTakeaway: 'New onset urinary retention in a postoperative spine patient is a surgical emergency until proven otherwise by emergent MRI; triage telephone deferral is indefensible.'
  },
  {
    id: 'prec-3',
    caption: 'Vargas v. Bayfront Neurosurgical Associates, LLC',
    docketNumber: '20-CA-08832-CA',
    jurisdiction: 'San Francisco County Superior Court, California',
    specialty: 'NEUROSURGERY',
    clinicalCondition: 'Incidental Dural Tear & Pseudomeningocele',
    allegationType: 'SURGICAL_COMPLICATION',
    synopsis: '61-year-old underwent multi-level L3-S1 laminectomy complicated by a 4mm dural tear during flavectomy. Surgeon performed direct 5-0 Prolene primary repair with DuraSeal and 48 hours flat bed rest. Patient subsequently developed positional headache and revision repair.',
    standardOfCareBenchmark: 'Incidental durotomy is a recognized non-negligent complication (3-14% incidence in revision/stenosis spine surgery). Standard of care requires prompt primary repair and watertight closure.',
    plaintiffTheory: 'Surgeon used excessive traction and failed to achieve watertight closure, leading to persistent cerebrospinal fluid leak and subsequent surgical re-exploration.',
    defenseTheme: 'Dural tear was an unavoidable technical complication in a severely stenotic spinal canal; surgeon followed standard operating procedure: primary suture repair, sealant bolster, Valsalva test, and lumbar drain.',
    outcomeDetermination: 'DEFENSE_VERDICT',
    verdictAmount: 'Defense Verdict (Zero Damages)',
    relevanceKeywords: ['dural tear', 'durotomy', 'CSF leak', 'pseudomeningocele', 'laminectomy', 'clinical judgment', 'informed consent'],
    keyLegalTakeaway: 'A known surgical complication that is promptly recognized, documented, and repaired in accordance with published neurosurgical standards does NOT constitute medical negligence.'
  },
  {
    id: 'prec-4',
    caption: 'Reynolds v. Regional Trauma Center & On-Call Neurosurgeon',
    docketNumber: '22-CV-01459-CO',
    jurisdiction: 'Denver District Court, Colorado',
    specialty: 'NEUROSURGERY',
    clinicalCondition: 'Expanding Acute Epidural Hematoma',
    allegationType: 'FAILURE_TO_MONITOR',
    synopsis: '29-year-old sustained temporal bone fracture in motor vehicle collision. Initial GCS 14; 2-hour observation showed GCS decline to 10 with unilateral pupillary sluggishness. Repeated head CT was delayed 110 minutes while awaiting ICU bed transfer.',
    standardOfCareBenchmark: 'Brain Trauma Foundation Guidelines: Any neurological deterioration (GCS drop >= 2 points or pupillary change) in a cranial trauma patient requires immediate repeat non-contrast head CT within 20-30 minutes.',
    plaintiffTheory: 'Lucid interval followed by rapid GCS deterioration represented classic expanding arterial epidural hematoma. The 110-minute scan delay caused transtentorial uncal herniation and irreversible hemiplegia.',
    defenseTheme: 'Patient was acutely intoxicated with blood alcohol 0.22 g/dL, confounding neurological examinations and masking intracranial progression.',
    outcomeDetermination: 'PLAINTIFF_VERDICT',
    verdictAmount: '$6,850,000 Verdict',
    relevanceKeywords: ['epidural hematoma', 'lucid interval', 'GCS decline', 'uncal herniation', 'cranial trauma', 'failure to monitor'],
    keyLegalTakeaway: 'Intoxication cannot be used as an excuse for failing to repeat neuroimaging when objective pupillary asymmetry or GCS decline occurs.'
  },
  {
    id: 'prec-5',
    caption: 'Chen v. Metro Health Orthopedic & Spine Surgery Center',
    docketNumber: '23-CV-09941-TX',
    jurisdiction: 'Harris County District Court, Texas',
    specialty: 'SPINE_SURGERY',
    clinicalCondition: 'Cervical Spondylotic Myelopathy & Post-Op C5 Nerve Root Palsy',
    allegationType: 'SURGICAL_COMPLICATION',
    synopsis: '55-year-old male underwent anterior cervical discectomy and fusion (ACDF) C4-C7. Postoperatively, patient developed unilateral deltoid and biceps weakness (C5 palsy 2/5 strength). Sued alleging improper nerve root retraction.',
    standardOfCareBenchmark: 'Postoperative C5 palsy occurs in 4-8% of cervical decompressions due to nerve root tethering from spinal cord dorsal drift. Complete recovery occurs spontaneously in > 80% of cases with physical therapy.',
    plaintiffTheory: 'Surgical error and excessive traction with nerve root hook during foraminotomy caused permanent motor impairment in dominant right arm.',
    defenseTheme: 'Surgical technique was pristine; intraoperative neuromonitoring showed no motor evoked potential loss. C5 palsy is a well-documented physiological reperfusion and cord expansion phenomenon.',
    outcomeDetermination: 'DISMISSED_SUMMARY_JUDGMENT',
    verdictAmount: 'Dismissed on Summary Judgment',
    relevanceKeywords: ['ACDF', 'C5 palsy', 'cervical myelopathy', 'nerve root', 'neuromonitoring', 'spine surgery', 'spontaneous recovery'],
    keyLegalTakeaway: 'Summary judgment granted when defense expert demonstrates complication is an inherent physiological consequence of cord repositioning rather than mechanical trauma.'
  },
  {
    id: 'prec-6',
    caption: 'Miller v. Valley Community Hospital & Intensivist Group',
    docketNumber: '22-CV-07712-PA',
    jurisdiction: 'Philadelphia Court of Common Pleas, Pennsylvania',
    specialty: 'CRITICAL_CARE',
    clinicalCondition: 'Septic Shock secondary to Postoperative Peritonitis',
    allegationType: 'DIAGNOSTIC_DELAY',
    synopsis: '68-year-old on post-op day 3 following bowel resection developed fever 39.1C, tachycardia 128 bpm, and lactate 4.2 mmol/L. Broad-spectrum antibiotics and fluid boluses were delayed 5.5 hours awaiting surgical attending call back.',
    standardOfCareBenchmark: 'Surviving Sepsis Campaign: Mandates administration of broad-spectrum IV antimicrobials within 1 hour of recognition of sepsis or septic shock.',
    plaintiffTheory: 'Violation of the mandatory 1-hour sepsis bundle directly caused refractory septic shock, multi-organ failure, and death.',
    defenseTheme: 'Patient had fulminant preexisting ischemic colitis and acute tubular necrosis with severe cardiopulmonary frailty; sepsis progression was refractory to all standard therapies.',
    outcomeDetermination: 'PLAINTIFF_VERDICT',
    verdictAmount: '$3,400,000 Verdict',
    relevanceKeywords: ['septic shock', 'surviving sepsis', '1-hour bundle', 'peritonitis', 'delayed antibiotics', 'critical care'],
    keyLegalTakeaway: 'Failure to comply with standardized hospital 1-hour sepsis resuscitation protocols is nearly impossible to defend when lactate and hemodynamic instability are documented.'
  }
];

/**
 * Search precedent cases by keyword, diagnosis, specialty, or allegation
 */
export function searchPrecedentCases(searchTerm: string): PrecedentCase[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return PRECEDENT_CASES;
  }

  const query = searchTerm.toLowerCase().trim();
  return PRECEDENT_CASES.filter(c => {
    const matchCaption = c.caption.toLowerCase().includes(query);
    const matchCondition = c.clinicalCondition.toLowerCase().includes(query);
    const matchSynopsis = c.synopsis.toLowerCase().includes(query);
    const matchSpecialty = c.specialty.toLowerCase().includes(query);
    const matchKeywords = c.relevanceKeywords.some(k => k.toLowerCase().includes(query));
    const matchBenchmark = c.standardOfCareBenchmark.toLowerCase().includes(query);
    const matchTakeaway = c.keyLegalTakeaway.toLowerCase().includes(query);

    return (
      matchCaption || 
      matchCondition || 
      matchSynopsis || 
      matchSpecialty || 
      matchKeywords || 
      matchBenchmark || 
      matchTakeaway
    );
  });
}
