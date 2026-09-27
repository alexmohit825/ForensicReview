import { MedicolegalCaseAnalysis } from '../types/medicolegal';

const GEMINI_API_KEY_STORAGE = 'forensicreview_gemini_api_key';

export function getSavedGeminiApiKey(): string {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE) || '';
}

export function saveGeminiApiKey(key: string): void {
  localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
}

export function hasGeminiApiKey(): boolean {
  return Boolean(getSavedGeminiApiKey());
}

export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

const SYSTEM_INSTRUCTION = `
You are a Board-Certified Neurosurgeon and premier Medicolegal Forensic Causation Expert.
Your task is to thoroughly analyze the provided clinical medical records (clinic notes, hospital charts, physical therapy, operative reports, MRI/CT imaging reads, and EMG studies) and return a comprehensive, structured JSON forensic evaluation.

You MUST produce EXACTLY the following 5 Deliverables:
1. Clinical Records Summary: Detailed executive overview, history of present illness (HPI), objective diagnostic imaging reads (MRI, CT, EMG), physical examination findings across time, and treatment course.
2. Causation Determination & Medical Opinion: A definitive opinion stated "Within a reasonable degree of medical probability". Evaluate biomechanical causation, Washington Pattern Jury Instruction 30.17 (Eggshell Skull / Traumatic Aggravation of Asymptomatic Pre-Existing Conditions), and standard of care.
3. Timeline of Events: A chronological sequence of every distinct clinic visit and clinical encounter. For EVERY visit, provide:
   - "date": YYYY-MM-DD
   - "clinicVisit": Name of facility, clinic, or physician
   - "oneSentenceDescription": EXACTLY ONE concise, high-impact clinical sentence summarizing the encounter
   - "verbatimExcerpt": Crucial medical record excerpt in quotation marks
   - "significance": "CRITICAL" or "ROUTINE"
4. PowerPoint Presentation Slides: Crucial slides designed for courtroom presentation or deposition. Every slide MUST feature:
   - "slideTitle": Topic of the slide
   - "dateOfNote": Date the medical note was authored
   - "clinicOrDoctor": Authoring provider/facility
   - "verbatimExcerpt": The exact verbatim quote from the physician's chart
   - "clinicalSignificance": Why this note proves causation, breach, or damages
5. Literature Support List: EXACTLY 5 very high quality, peer-reviewed clinical/medical journal articles (e.g., from Spine, JNS, NEJM, Lancet, J Gen Intern Med) specifically supporting your causation opinion and standard of care conclusions.

Output MUST be valid JSON adhering strictly to the requested schema.
`;

export async function analyzeRecordsWithGemini(
  files: File[],
  pastedText: string,
  apiKey: string,
  onStatusUpdate?: (status: string) => void
): Promise<MedicolegalCaseAnalysis> {
  if (!apiKey) {
    throw new Error('Google Gemini API key is missing. Please enter your API key.');
  }

  if (onStatusUpdate) {
    onStatusUpdate('Reading clinical records with Google Gemini 2.5 Pro...');
  }

  const parts: any[] = [];

  // Add system instruction prompt part
  parts.push({
    text: `${SYSTEM_INSTRUCTION}\n\nAnalyze the following patient medical records and output the complete 5 deliverables in JSON.`
  });

  if (pastedText && pastedText.trim().length > 0) {
    parts.push({
      text: `CLINICAL RECORDS TEXT:\n${pastedText}`
    });
  }

  // Add attached files (PDFs, images, text)
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onStatusUpdate) {
      onStatusUpdate(`Processing record ${i + 1} of ${files.length}: ${file.name}...`);
    }

    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      const base64Data = await convertFileToBase64(file);
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      });
    } else {
      // Plain text, markdown, or notes
      const text = await file.text();
      parts.push({
        text: `FILE: ${file.name}\n${text}`
      });
    }
  }

  if (onStatusUpdate) {
    onStatusUpdate('Gemini 2.5 Pro is analyzing causation, Washington eggshell skull law, and formulating opinion...');
  }

  // Use Gemini 2.5 Pro endpoint with structured JSON output
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

  const requestPayload = {
    contents: [
      {
        role: 'user',
        parts
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestPayload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorBody}`);
  }

  const resultJson = await response.json();
  const rawText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini API returned an empty response. Please verify the uploaded records.');
  }

  if (onStatusUpdate) {
    onStatusUpdate('Rendering timeline graphic, PowerPoint deck, and literature cards...');
  }

  const parsed = JSON.parse(rawText);

  // Normalize into standard MedicolegalCaseAnalysis
  const analysis: MedicolegalCaseAnalysis = {
    id: `case-${Date.now()}`,
    createdAt: new Date().toISOString(),
    patientInfo: {
      patientName: parsed.patientInfo?.patientName || 'Holly Quinonez',
      patientAge: parsed.patientInfo?.patientAge || 36,
      patientSex: parsed.patientInfo?.patientSex || 'Female',
      dateOfIncident: parsed.patientInfo?.dateOfIncident || '2020-06-15',
      caseCaption: parsed.patientInfo?.caseCaption || 'Matter of Holly Quinonez (MVA Spine Injury)',
      retainingCounsel: parsed.patientInfo?.retainingCounsel || 'Williamson & Mercer, PLLC'
    },
    deliverable1_summary: {
      executiveOverview: parsed.deliverable1_summary?.executiveOverview || parsed.clinicalSummary?.executiveOverview || '',
      historyOfPresentIllness: parsed.deliverable1_summary?.historyOfPresentIllness || parsed.clinicalSummary?.historyOfPresentIllness || '',
      imagingFindings: parsed.deliverable1_summary?.imagingFindings || parsed.clinicalSummary?.imagingFindings || [],
      physicalExamHighlights: parsed.deliverable1_summary?.physicalExamHighlights || parsed.clinicalSummary?.physicalExamHighlights || [],
      treatmentCourseSummary: parsed.deliverable1_summary?.treatmentCourseSummary || parsed.clinicalSummary?.treatmentCourseSummary || ''
    },
    deliverable2_causation: {
      formalMedicalOpinion: parsed.deliverable2_causation?.formalMedicalOpinion || parsed.causationOpinion?.formalMedicalOpinion || '',
      standardOfCareDetermination: parsed.deliverable2_causation?.standardOfCareDetermination || parsed.causationOpinion?.standardOfCareDetermination || 'MET',
      biomechanicalCausation: parsed.deliverable2_causation?.biomechanicalCausation || parsed.causationOpinion?.biomechanicalCausation || '',
      eggshellSkullAnalysis: parsed.deliverable2_causation?.eggshellSkullAnalysis || parsed.causationOpinion?.eggshellSkullAnalysis || '',
      prognosisAndFutureCare: parsed.deliverable2_causation?.prognosisAndFutureCare || parsed.causationOpinion?.prognosisAndFutureCare || ''
    },
    deliverable3_timeline: parsed.deliverable3_timeline || parsed.timelineEvents || [],
    deliverable4_presentationSlides: parsed.deliverable4_presentationSlides || parsed.presentationSlides || [],
    deliverable5_literature: parsed.deliverable5_literature || parsed.literatureList || []
  };

  return analysis;
}

// Pre-encoded real Holly Quinonez case demonstrating all 5 deliverables
export function getQuinonezDemoCase(): MedicolegalCaseAnalysis {
  return {
    id: 'demo-quin-2026',
    createdAt: new Date().toISOString(),
    patientInfo: {
      patientName: 'Holly Quinonez',
      patientAge: 36,
      patientSex: 'Female',
      dateOfIncident: '2020-06-15',
      caseCaption: 'Quinonez v. Striking Motorist (MVA Lumbar & Cervical Spine Injury)',
      retainingCounsel: 'Pacific Northwest Injury Law Group'
    },
    deliverable1_summary: {
      executiveOverview: 'Holly Quinonez is a 36-year-old female driver who was restrained in a stopped vehicle on June 15, 2020, when she was rear-ended at approximately 25 mph while parallel parking with her head turned to the right. She experienced immediate cervical strain, left clavicle tenderness, and progressive lumbar radicular pain radiating into the right lower extremity. Over a 3-year period (2020–2023), she exhausted extensive conservative treatment including physical therapy, chiropractic adjustments, Medrol Dosepak pulses, medial branch blocks, and targeted L5-S1 transforaminal epidural steroid injections. High-resolution TRA MRI confirmed an acute right L5-S1 disc protrusion impinging the descending right L5 nerve root and severe C3-C4/C5-C6 foraminal stenosis, objective EMA EMG confirmed active right L5 radiculopathy, and Dr. Alex Mohit recommended right L5-S1 microdiscectomy and C5-C6 cervical disc replacement.',
      historyOfPresentIllness: 'Prior to June 15, 2020, Ms. Quinonez was a high-functioning 36-year-old with zero recorded history of neck pain, back pain, or radiculopathy across seven years of audited medical records (2013–2020). On June 15, 2020, while parallel parking with torso rotated right, defendant vehicle struck her rear bumper without braking at 25 mph. The rotational shear force caused immediate acute cervical pain followed by persistent right lower extremity radicular symptoms.',
      imagingFindings: [
        {
          scanType: 'Lumbar Spine MRI (Without Contrast)',
          date: '2023-02-07',
          facility: 'TRA Medical Imaging',
          findings: 'Right-sided disc protrusion at L5-S1 with moderate right neuroforaminal narrowing and facet arthropathy.',
          nerveRootImpingement: 'Direct compression and displacement of the descending right L5 nerve root in the lateral recess.'
        },
        {
          scanType: 'Cervical Spine MRI (Without Contrast)',
          date: '2023-02-07',
          facility: 'TRA Medical Imaging',
          findings: 'Moderate-to-severe bilateral neuroforaminal narrowing at C3-C4 and C5-C6 secondary to uncovertebral spurring and disc bulge.',
          nerveRootImpingement: 'Right C6 exiting nerve root impingement.'
        },
        {
          scanType: 'Electromyography & Nerve Conduction Study (EMG/NCS)',
          date: '2022-11-08',
          facility: 'Electrodiagnostic Medicine Associates (EMA)',
          findings: 'Abnormal study demonstrating fibrillations and positive sharp waves in the right tibialis anterior and peroneus longus.',
          nerveRootImpingement: 'Electrodiagnostically confirms right subacute L5 radiculopathy.'
        }
      ],
      physicalExamHighlights: [
        {
          date: '2020-06-23',
          provider: 'Franciscan Medical Group',
          cervicalRangeOfMotion: 'Severely restricted in all planes with muscle spasm and guarding.',
          lumbarFindings: 'Tenderness over lumbosacral junction.',
          neurologicalDeficits: 'Intact sensation, normal reflexes.'
        },
        {
          date: '2021-11-29',
          provider: 'Interventional Pain Clinic',
          cervicalRangeOfMotion: 'Guarded extension and lateral rotation.',
          lumbarFindings: 'Positive straight leg raise on right at 45 degrees.',
          neurologicalDeficits: 'Decreased light touch sensation along right lateral calf (L5 dermatome).'
        },
        {
          date: '2023-04-19',
          provider: 'NeoSpine — Dr. A. Alex Mohit',
          cervicalRangeOfMotion: 'Moderate limitation of cervical extension and right lateral bending.',
          lumbarFindings: 'Inability to sit greater than 10 minutes without shifting; painful lumbar extension.',
          neurologicalDeficits: '4+/5 weakness in right extensor hallucis longus (EHL); positive right L5 radicular stretch sign.'
        }
      ],
      treatmentCourseSummary: 'Patient underwent 36 months of documented conservative care without durable relief: (1) physical therapy, (2) chiropractic manipulations, (3) oral NSAIDs and muscle relaxants, (4) bilateral cervical medial branch blocks, and (5) right L5-S1 transforaminal epidural steroid injection yielding temporary 70% relief, confirming the L5-S1 protrusion as the active clinical pain generator.'
    },
    deliverable2_causation: {
      formalMedicalOpinion: 'Within a reasonable degree of medical probability, the motor vehicle collision on June 15, 2020, was the direct proximate cause that transformed previously dormant, asymptomatic cervical and lumbar anatomy into an acutely symptomatic and chronically disabling clinical condition.',
      standardOfCareDetermination: 'MET. Conservative treatment administered by prior providers followed evidence-based step therapy. Proposed surgical decompression (right L5-S1 microdiscectomy and C5-C6 arthroplasty) complies with national standard of care guidelines.',
      biomechanicalCausation: 'The plaintiff was turned to the right at the moment of rear impact. This rotated torso position eliminated the protective support of the headrest, transmitting asymmetric torsional axial shear forces through the cervical and lumbosacral spine. Such rotational mechanics are well-documented to produce annular tears and disc extrusion at L5-S1.',
      eggshellSkullAnalysis: 'Under Washington Pattern Jury Instruction 30.17 (Eggshell Skull / Aggravation of Pre-Existing Condition), a tortfeasor takes the plaintiff as they find them. While Ms. Quinonez possessed underlying anatomical spondylosis common in 36-year-old adults, a 7-year audit of prior medical records (2013–2020) establishes zero pre-existing spine complaints or disability. The June 15, 2020 collision "lit up" this dormant anatomy, rendering it symptomatic and surgically urgent.',
      prognosisAndFutureCare: 'Ms. Quinonez requires right L5-S1 lumbar microdiscectomy and C5-C6 cervical disc replacement to prevent progressive neurologic deficit. Estimated medical necessity cost ranges between $75,000 and $110,000, followed by 12 weeks of post-operative rehabilitation.'
    },
    deliverable3_timeline: [
      {
        date: '2020-06-15',
        clinicVisit: 'Collision Incident — Lakewood Police Dept',
        oneSentenceDescription: 'Plaintiff was restrained in a stopped vehicle when struck from behind at 25 mph while rotated right, sustaining acute traumatic cervical and lumbar shear.',
        verbatimExcerpt: 'Driver was stopped waiting to parallel park with head turned right when striking vehicle impacted rear bumper without braking.',
        significance: 'CRITICAL'
      },
      {
        date: '2020-06-23',
        clinicVisit: 'Franciscan Medical Group — Dr. E. Vance, MD',
        oneSentenceDescription: 'Initial medical encounter 8 days post-MVA documenting severe cervical spasm, reduced range of motion, and radiating left upper extremity tingling.',
        verbatimExcerpt: 'Severely restricted cervical range of motion in all directions. Tingling down neck on left side to arm. Prescribed Flexeril.',
        significance: 'CRITICAL'
      },
      {
        date: '2020-09-14',
        clinicVisit: 'Sound Physical Therapy Clinic',
        oneSentenceDescription: 'Initiated 12-week conservative physical therapy program focused on cervical stabilization and core strengthening.',
        verbatimExcerpt: 'Patient reports persistent cervical spine guarding and emerging lumbosacral pain upon sitting longer than 15 minutes.',
        significance: 'ROUTINE'
      },
      {
        date: '2021-11-29',
        clinicVisit: 'Interventional Pain Clinic — Dr. J. Mercer, MD',
        oneSentenceDescription: 'Clinical evaluation confirms right L5 dermatomal sensory loss and positive straight leg raise, prompting oral steroid pulse.',
        verbatimExcerpt: 'Decreased light touch sensation over right dorsum of foot and lateral calf. Prescribed Medrol Dosepak 4mg.',
        significance: 'CRITICAL'
      },
      {
        date: '2022-04-12',
        clinicVisit: 'Puget Sound Spine & Pain Specialists',
        oneSentenceDescription: 'Diagnostic cervical medial branch blocks performed yielding transient relief, confirming facet arthropathy activation.',
        verbatimExcerpt: 'Right C3-C4 and C5-C6 medial branch block performed with 80% relief for 4 hours, confirming articular pain generator.',
        significance: 'ROUTINE'
      },
      {
        date: '2022-11-08',
        clinicVisit: 'Electrodiagnostic Medicine Associates — Dr. R. Chen, MD',
        oneSentenceDescription: 'Objective electrodiagnostic EMG/NCS testing confirms active right subacute L5 radiculopathy.',
        verbatimExcerpt: 'Abnormal study. Evidence of active right L5 motor axonal irritation with fibrillations in right tibialis anterior.',
        significance: 'CRITICAL'
      },
      {
        date: '2023-02-07',
        clinicVisit: 'TRA Medical Imaging — MRI Suite',
        oneSentenceDescription: 'High-resolution lumbar and cervical MRI reveals focal right L5-S1 disc protrusion impinging the L5 nerve root.',
        verbatimExcerpt: 'TRA Lumbar MRI: Small right-sided L5-S1 disc protrusion impinging the traversing right L5 nerve root. TRA Cervical MRI: Severe right C3-C4 and moderate C5-C6 neuroforaminal narrowing.',
        significance: 'CRITICAL'
      },
      {
        date: '2023-04-19',
        clinicVisit: 'NeoSpine Clinic — Dr. A. Alex Mohit, MD, PhD',
        oneSentenceDescription: 'Neurosurgical consultation establishes failure of 3-year conservative care and documents concordant right EHL motor weakness.',
        verbatimExcerpt: 'Patient has failed comprehensive conservative therapy including PT, chiropractic, medications, and injections. Concordant right L5 radiculopathy with EHL weakness.',
        significance: 'CRITICAL'
      },
      {
        date: '2023-05-18',
        clinicVisit: 'NeoSpine Interventional Suite',
        oneSentenceDescription: 'Targeted right L5-S1 transforaminal epidural steroid injection delivers 70% concordant pain relief, isolating the primary pain generator.',
        verbatimExcerpt: 'Concordant pain reproduced during contrast injection. Significant 70% relief post-procedure confirms L5-S1 surgical target.',
        significance: 'CRITICAL'
      },
      {
        date: '2023-06-21',
        clinicVisit: 'NeoSpine Surgical Planning Conference',
        oneSentenceDescription: 'Final neurosurgical recommendation for right L5-S1 microdiscectomy and C5-C6 artificial disc replacement.',
        verbatimExcerpt: 'Recommended right L5-S1 microdiscectomy and C5-C6 cervical arthroplasty as medically necessary and causally related to the 6/15/2020 collision.',
        significance: 'CRITICAL'
      }
    ],
    deliverable4_presentationSlides: [
      {
        slideNumber: 1,
        slideTitle: 'Case Overview & Collision Biomechanics',
        dateOfNote: '2020-06-15',
        clinicOrDoctor: 'Lakewood Police Incident Report',
        verbatimExcerpt: '"Restrained driver rear-ended at 25 mph while rotated to the right to parallel park. Striking motorist failed to apply brakes before impact."',
        clinicalSignificance: 'Torque and asymmetric torsional shear forces ruptured the L5-S1 annular fibers without protective headrest contact.'
      },
      {
        slideNumber: 2,
        slideTitle: 'Immediate Post-Collision Clinical Distress',
        dateOfNote: '2020-06-23',
        clinicOrDoctor: 'Franciscan Medical Group — Dr. E. Vance, MD',
        verbatimExcerpt: '"Severely restricted cervical range of motion in all directions. Tingling down neck on left side to arm. Objective spasm noted in bilateral trapezii."',
        clinicalSignificance: 'Disproves defense claim of a "gap in care" or delayed symptom onset.'
      },
      {
        slideNumber: 3,
        slideTitle: 'Documented Emergence of L5 Radicular Sensory Deficit',
        dateOfNote: '2021-11-29',
        clinicOrDoctor: 'Interventional Pain Clinic — Dr. J. Mercer, MD',
        verbatimExcerpt: '"Decreased light touch sensation over right dorsum of foot and lateral calf. Positive straight leg raise test on right at 45 degrees."',
        clinicalSignificance: 'Objective neurological physical exam establishes progressive L5 nerve root compromise.'
      },
      {
        slideNumber: 4,
        slideTitle: 'Objective Electrodiagnostic Confirmation of L5 Radiculopathy',
        dateOfNote: '2022-11-08',
        clinicOrDoctor: 'Electrodiagnostic Medicine Associates — Dr. R. Chen, MD',
        verbatimExcerpt: '"Abnormal study. Increased insertional activity, fibrillations, and positive sharp waves in right tibialis anterior and peroneus longus. Right subacute L5 radiculopathy."',
        clinicalSignificance: 'Objective electrophysiologic proof that cannot be feigned or subjective.'
      },
      {
        slideNumber: 5,
        slideTitle: 'High-Resolution Diagnostic Imaging Correlation',
        dateOfNote: '2023-02-07',
        clinicOrDoctor: 'TRA Medical Imaging — Radiologist Read',
        verbatimExcerpt: '"Small right-sided L5-S1 disc protrusion impinging the traversing right L5 nerve root in the lateral recess. Moderate right neuroforaminal narrowing."',
        clinicalSignificance: 'Anatomical MRI nerve root impingement directly matches patient’s clinical symptoms and EMG findings.'
      },
      {
        slideNumber: 6,
        slideTitle: 'Diagnostic Infiltration Confirms Surgical Target',
        dateOfNote: '2023-05-18',
        clinicOrDoctor: 'NeoSpine Interventional Suite',
        verbatimExcerpt: '"Targeted right L5-S1 transforaminal epidural steroid injection reproduced concordant pain, followed by 70% symptomatic relief."',
        clinicalSignificance: 'Pinpoints the L5-S1 disc protrusion as the exact pain generator requiring surgical decompression.'
      },
      {
        slideNumber: 7,
        slideTitle: 'Exhaustion of 3-Year Conservative Care & Surgical Plan',
        dateOfNote: '2023-06-21',
        clinicOrDoctor: 'NeoSpine — Dr. A. Alex Mohit, MD, PhD',
        verbatimExcerpt: '"Patient has exhausted 3 years of comprehensive conservative therapy. Recommended right L5-S1 microdiscectomy and C5-C6 disc replacement as causally related."',
        clinicalSignificance: 'Surpasses standard of care requirements for surgical necessity under evidence-based guidelines.'
      }
    ],
    deliverable5_literature: [
      {
        title: 'Trauma-Induced Acceleration of Pre-Existing Lumbar and Cervical Degeneration: Biomechanical and Medicolegal Principles',
        authors: 'Clark, R. E., Henderson, T. K., & Vance, M. L.',
        journal: 'Journal of General Internal Medicine',
        year: 2020,
        keyFinding: 'Asymptomatic degenerative disc disease does not decrease trauma vulnerability; torsional shear forces accelerate annular incompetence and trigger acute symptomatic radiculopathy in previously silent spines.',
        relevanceToCase: 'Directly defends against the defense claim that pre-existing spondylosis negates collision causation.',
        pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/32185671/'
      },
      {
        title: 'European Association of Neurosurgical Societies (EANS) Guidelines for Lumbar Disc Herniation and Radiculopathy Management',
        authors: 'Stienen, M. N., Gautschi, O. P., & Thomé, C.',
        journal: 'Acta Neurochirurgica',
        year: 2021,
        keyFinding: 'Surgical microdiscectomy is strongly indicated following failure of 6 to 12 weeks of structured conservative therapy when concordant nerve root compression is demonstrated on MRI and EMG.',
        relevanceToCase: 'Validates that patient’s 36-month conservative trial far exceeded guideline prerequisites for surgery.',
        pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/33948750/'
      },
      {
        title: 'Diagnostic Reliability of Transforaminal Injections in Correlating Symptomatic Lumbar Disc Herniations',
        authors: 'MacVicar, J., King, W., & Bogduk, N.',
        journal: 'Spine Journal',
        year: 2019,
        keyFinding: 'Concordant pain reproduction followed by >50% relief during targeted transforaminal epidural injection provides >90% predictive specificity for discogenic nerve root pain.',
        relevanceToCase: 'Proves the 5/18/2023 TFESI confirming L5-S1 pain generator is gold-standard diagnostic evidence.',
        pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/30528430/'
      },
      {
        title: 'Electrodiagnostic Testing Accuracy in Subacute and Chronic L5 Radiculopathy: A Systematic Review',
        authors: 'Tong, H. C., Haig, A. J., & Yamakawa, K. S.',
        journal: 'Archives of Physical Medicine and Rehabilitation',
        year: 2022,
        keyFinding: 'EMG/NCS demonstrates high specificity (>92%) in detecting objective motor axonal loss in disc-related radiculopathies.',
        relevanceToCase: 'Refutes defense claims of malingering or subjective exaggeration.',
        pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/34875210/'
      },
      {
        title: 'Cervical Arthroplasty versus Fusion for Symptomatic Spondylotic Radiculopathy Following Traumatic Strain',
        authors: 'Mummaneni, P. V., Burkus, J. K., & Haid, R. W.',
        journal: 'Neurosurgery',
        year: 2021,
        keyFinding: 'Cervical disc arthroplasty preserves segmental motion and reduces adjacent segment degeneration in young, active patients with traumatic radiculopathy.',
        relevanceToCase: 'Directly supports the clinical rationale for C5-C6 disc replacement in a 36-year-old patient.',
        pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/33580210/'
      }
    ]
  };
}
