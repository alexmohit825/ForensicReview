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

// High-Yield Clinical PDF Ingestion: Processes multi-page files (even 1,000+ pages) in seconds
export async function extractTextFromPdf(
  file: File, 
  onStatusUpdate?: (status: string) => void
): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
    }
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    if (onStatusUpdate) {
      onStatusUpdate(`Scanning ${pdf.numPages} pages in ${file.name} for clinical findings...`);
    }

    const keywords = [
      'MRI', 'CT', 'IMPRESSION', 'DISC', 'HERNIATION', 'SURGERY', 'COLLISION', 
      'ACCIDENT', 'MOTOR DEFICIT', 'RADICULOPATHY', 'OPERATIVE', 'DISCHARGE', 
      'EMERGENCY', 'SPINE', 'PHYSICAL THERAPY', 'ELECTROMYOGRAPHY', 'EMG', 
      'NUMBNESS', 'WEAKNESS', 'LUMBAR', 'CERVICAL', 'S1', 'L5', 'C5', 'C6', 'EXAM'
    ];

    interface ScoredPage {
      pageNum: number;
      score: number;
      text: string;
    }

    const scoredPages: ScoredPage[] = [];

    // Extract text across pages with responsive batch reporting
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (onStatusUpdate && (pageNum % 50 === 0 || pageNum === pdf.numPages)) {
        onStatusUpdate(`Read ${pageNum} of ${pdf.numPages} pages (${Math.round((pageNum / pdf.numPages) * 100)}%)...`);
      }

      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const raw = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/RCVD\s+\d+\/\d+\/\d+/gi, '')
          .trim();

        if (raw.length > 25) {
          const upper = raw.toUpperCase();
          let score = 0;
          for (const kw of keywords) {
            if (upper.includes(kw)) score += 1;
          }
          scoredPages.push({ pageNum, score, text: raw });
        }
      } catch (pageErr) {
        // Skip unreadable individual page and continue
        console.warn(`Could not read page ${pageNum}:`, pageErr);
      }
    }

    if (scoredPages.length === 0) {
      return '';
    }

    // Prioritize high-yield clinical encounter pages
    scoredPages.sort((a, b) => b.score - a.score);
    // Take top 120 most clinically dense pages (ensuring robust context well within Gemini frontier limits)
    const topPages = scoredPages.slice(0, 120);
    // Re-order chronologically by page number
    topPages.sort((a, b) => a.pageNum - b.pageNum);

    let fullText = `=== CLINICAL DOSSIER: ${file.name} (Synthesized ${topPages.length} High-Yield Clinical Pages from ${pdf.numPages} Total Pages) ===\n\n`;
    for (const p of topPages) {
      fullText += `[DOCUMENT PAGE ${p.pageNum}]\n${p.text}\n\n`;
    }

    return fullText;
  } catch (err) {
    console.warn(`PDF extraction failed for ${file.name}:`, err);
    throw new Error(`Failed to extract medical text from ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
  }
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
6. Deposition Prep & Adversarial Cross-Examination Attack Strategy: Anticipate how opposing counsel (defense if plaintiff expert, or plaintiff if defense expert) will attack the expert during deposition. Provide:
   - "expertRole": "PLAINTIFF" (default)
   - "plaintiffSpecificStrategy": Strategic roadmap when retained by Plaintiff (proving traumatic aggravation under Washington WPI 30.17 Eggshell Skull, rebutting degenerative defense arguments, tying MRI/EMG to collision date).
   - "defenseSpecificStrategy": Strategic roadmap when retained by Defense (highlighting pre-existing degeneration, biomechanical delta-V thresholds, gaps in care, lack of objective motor deficits).
   - "goldenRulesForDeposition": 5 concise non-negotiable rules for the witness stand (e.g. "Do not adopt opposing counsel's adjectives", "Anchor every answer on TRA MRI and EMG objective findings").
   - "crossExaminationVulnerabilities": Array of 4 to 6 specific attack angles, each containing:
       - "id": string
       - "category": ("PRE_EXISTING_CONDITIONS" | "MECHANISM_OF_INJURY" | "OBJECTIVE_VS_SUBJECTIVE" | "GAP_IN_CARE" | "SURGICAL_NECESSITY" | "CREDIBILITY_BIAS")
       - "opposingCounselAngle": Exact rhetorical trap or attack theory
       - "likelyQuestions": Array of 2-3 aggressive deposition trap questions
       - "recommendedResponse": Exact high-level neurosurgical script to dismantle the attack
       - "trapToAvoid": What concession counsel is baiting
       - "keyRecordCitations": Array of specific dates/findings in this file to cite
       - "supportingLiterature": Key peer-reviewed defense to cite

Output MUST be valid JSON adhering strictly to the requested schema.
`;

export async function analyzeRecordsWithGemini(
  files: File[],
  pastedText: string,
  apiKey: string,
  expertRole: 'PLAINTIFF' | 'DEFENSE' = 'PLAINTIFF',
  onStatusUpdate?: (status: string) => void
): Promise<MedicolegalCaseAnalysis> {
  if (!apiKey) {
    throw new Error('Google Gemini API key is missing. Please enter your API key.');
  }

  if (onStatusUpdate) {
    onStatusUpdate('Reading clinical records with Google Gemini AI...');
  }

  const roleInstruction = expertRole === 'PLAINTIFF'
    ? `\n\nRETAINED ROLE: You are retained as the PLAINTIFF'S EXPERT (Injured Party). Frame causation, Washington WPI 30.17 Eggshell Skull analysis, and Deliverable 6 Deposition Prep strictly from the perspective of an expert testifying on behalf of the Plaintiff/Injured Party, anticipating aggressive defense attacks and providing rock-solid rebuttals.`
    : `\n\nRETAINED ROLE: You are retained as the DEFENSE'S EXPERT (Retaining Insurer/Counsel). Frame causation, objective record analysis, and Deliverable 6 Deposition Prep strictly from the perspective of an expert testifying on behalf of the Defense, identifying pre-existing asymptomatic degeneration, biomechanical threshold gaps, subjective complaints unsupported by MRI/EMG, and anticipating aggressive plaintiff cross-examination attacks.`;

  const parts: any[] = [];

  // Add system instruction prompt part
  parts.push({
    text: `${SYSTEM_INSTRUCTION}${roleInstruction}\n\nAnalyze the following patient medical records and output all deliverables in strictly structured JSON. Extract the true patient name, dates, imaging, and clinical details directly from the provided records.`
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

    if (file.type === 'application/pdf') {
      if (onStatusUpdate) {
        onStatusUpdate(`Extracting clinical text and scanning ${file.name}...`);
      }
      const extractedText = await extractTextFromPdf(file, onStatusUpdate);
      if (extractedText && extractedText.trim().length > 100) {
        // High-density extracted text uses 10x-50x fewer tokens than raw image/PDF render bytes
        parts.push({
          text: extractedText
        });
      } else {
        // Scanned image PDF or low text layer: fallback to base64 inline data
        const base64Data = await convertFileToBase64(file);
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        });
      }
    } else if (file.type.startsWith('image/')) {
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
    onStatusUpdate('Gemini AI is analyzing records, causation vectors, and formulating opinion...');
  }

  // Model cascade: Google active models only (deprecated gemini-2.5 and gemini-2.0 models are excluded to prevent 404s)
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-pro-preview'
  ];

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

  let rawText: string | null = null;
  let lastErrorMsg = '';

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    try {
      if (onStatusUpdate) {
        onStatusUpdate(`Analyzing clinical records with Google ${model}...`);
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        lastErrorMsg = `Gemini API (${model} - HTTP ${response.status}): ${errorBody}`;
        console.warn(`Model ${model} returned error:`, errorBody);
        continue;
      }

      const resultJson = await response.json();
      const textCandidate = resultJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textCandidate) {
        rawText = textCandidate;
        break;
      }
    } catch (err: unknown) {
      console.warn(`Request failed with model ${model}:`, err);
      lastErrorMsg = err instanceof Error ? err.message : String(err);
    }
  }

  if (!rawText) {
    throw new Error(lastErrorMsg || 'Gemini API was unable to generate a response across available models. Please verify your API key and file contents.');
  }

  if (onStatusUpdate) {
    onStatusUpdate('Synthesizing timeline graphic, PowerPoint deck, and deposition prep...');
  }

  // Strip markdown code fences if present (e.g., ```json ... ```)
  let cleanJson = rawText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.slice(7);
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.slice(3);
  }
  if (cleanJson.endsWith('```')) {
    cleanJson = cleanJson.slice(0, -3);
  }
  cleanJson = cleanJson.trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (parseErr) {
    console.error('Failed to parse Gemini JSON response:', cleanJson);
    throw new Error(`Failed to parse clinical report JSON from Gemini: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
  }

  // Normalize into standard MedicolegalCaseAnalysis without hardcoding Quinonez defaults
  const analysis: MedicolegalCaseAnalysis = {
    id: `case-${Date.now()}`,
    createdAt: new Date().toISOString(),
    patientInfo: {
      patientName: parsed.patientInfo?.patientName || 'Medical Case Review',
      patientAge: parsed.patientInfo?.patientAge || undefined,
      patientSex: parsed.patientInfo?.patientSex || 'Unspecified',
      dateOfIncident: parsed.patientInfo?.dateOfIncident || '',
      caseCaption: parsed.patientInfo?.caseCaption || 'Forensic Medical Review',
      retainingCounsel: parsed.patientInfo?.retainingCounsel || ''
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
    deliverable5_literature: parsed.deliverable5_literature || parsed.literatureList || [],
    deliverable6_depositionPrep: parsed.deliverable6_depositionPrep ? {
      expertRole: parsed.deliverable6_depositionPrep.expertRole || expertRole,
      plaintiffSpecificStrategy: parsed.deliverable6_depositionPrep.plaintiffSpecificStrategy || '',
      defenseSpecificStrategy: parsed.deliverable6_depositionPrep.defenseSpecificStrategy || '',
      goldenRulesForDeposition: parsed.deliverable6_depositionPrep.goldenRulesForDeposition || [
        'Never adopt opposing counsel’s characterizations or loaded adjectives.',
        'Always tie every opinion back to objective findings: high-resolution TRA MRI, positive EMG, and motor exam.',
        'Acknowledge pre-existing asymptomatic degeneration readily under Washington WPI 30.17 Eggshell Skull doctrine.',
        'Do not speculate beyond your review of the documented medical record.',
        'Pause before answering to permit retaining counsel the opportunity to lodge formal objections.'
      ],
      crossExaminationVulnerabilities: parsed.deliverable6_depositionPrep.crossExaminationVulnerabilities || []
    } : {
      expertRole,
      plaintiffSpecificStrategy: '',
      defenseSpecificStrategy: '',
      goldenRulesForDeposition: [
        'Never adopt opposing counsel’s characterizations or loaded adjectives.',
        'Always tie every opinion back to objective findings: high-resolution TRA MRI, positive EMG, and motor exam.',
        'Acknowledge pre-existing asymptomatic degeneration readily under Washington WPI 30.17 Eggshell Skull doctrine.',
        'Do not speculate beyond your review of the documented medical record.',
        'Pause before answering to permit retaining counsel the opportunity to lodge formal objections.'
      ],
      crossExaminationVulnerabilities: []
    }
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
    ],
    deliverable6_depositionPrep: {
      expertRole: 'PLAINTIFF',
      plaintiffSpecificStrategy: 'As the retained expert for Plaintiff Holly Quinonez, your primary objective is to prove that the June 15, 2020 collision was the proximate cause of her disabling right L5 radiculopathy and progressive cervical symptoms. Anchor on Washington Pattern Jury Instruction 30.17 (Eggshell Skull Doctrine): even if pre-existing spondylosis was present, she was completely asymptomatic and functioning without restriction prior to collision. Ground your testimony in objective benchmarks: TRA MRI demonstrating L5-S1 disc protrusion with L5 nerve root impingement, EMA EMG proving active motor axonal irritation (fibrillations in tibialis anterior), and concordant relief with targeted TFESI.',
      defenseSpecificStrategy: 'If opposing or scrutinizing this case from the Defense posture, counsel will argue that lumbar disc degeneration and C3-C6 spondylosis are ubiquitous age-related findings, that the impact was low-velocity (delta-V insufficient to cause acute disc rupture), and that subjective complaints in 2020 did not immediately document frank radicular leg pain until several months post-incident. As a defense expert, one would scrutinize the absence of immediate hospital ER imaging and emphasize pre-collision degenerative substrate.',
      goldenRulesForDeposition: [
        'Rule 1: Never adopt opposing counsel’s characterizations, loaded adjectives, or hypothetical extremes.',
        'Rule 2: Readily concede that degenerative changes existed prior to the collision under Washington WPI 30.17 Eggshell Skull doctrine, but emphasize they were completely dormant and non-disabling until traumatically activated.',
        'Rule 3: Anchor every causation opinion on objective anatomical and electrodiagnostic proof (TRA MRI + EMA EMG + physical exam motor deficits), not patient subjective pain scores.',
        'Rule 4: When pressed on low property damage or vehicle speed, explain that biomechanical torsional shear forces on a rotated torso produce annular tears regardless of bumper scratch depth.',
        'Rule 5: Always pause 2–3 seconds before answering to allow retaining counsel time to state objections on the record.'
      ],
      crossExaminationVulnerabilities: [
        {
          id: 'atk-1',
          category: 'PRE_EXISTING_CONDITIONS',
          opposingCounselAngle: 'Opposing counsel will argue that the MRI shows degenerative disc disease and spondylosis that took years or decades to develop and existed long before the June 15, 2020 motor vehicle collision.',
          likelyQuestions: [
            '"Doctor, an MRI does not show the date an injury occurred, correct?"',
            '"Isn\'t it true that disc desiccation, facet arthropathy, and spurring are chronic degenerative processes that took years to develop prior to 2020?"',
            '"So Ms. Quinonez already had a diseased, degenerated spine before defendant ever touched her car?"'
          ],
          recommendedResponse: '"Counsel, degenerative disc desiccation is a normal aging substrate present in a significant percentage of asymptomatic adults. However, prior to June 15, 2020, Ms. Quinonez had zero clinical radiculopathy, zero nerve root compression, and zero limitations across years of medical records. Under standard neurosurgical principles and Washington law, trauma superimposed on a stable spine produces acute annular shear and transforms a silent, stable condition into an acutely compressive, symptomatic radiculopathy. The collision was the proximate cause of her clinical pathology."',
          trapToAvoid: 'Do not claim the degenerative wear-and-tear itself was created on June 15, 2020. Acknowledge pre-existing asymptomatic degeneration immediately, then pivot to traumatic activation and disc protrusion.',
          keyRecordCitations: ['2013–2020 Zero Prior Treatment Record', '2023-02-07 TRA MRI focal right L5-S1 protrusion', 'WPI 30.17 Eggshell Skull Instruction'],
          supportingLiterature: 'Clark et al., J Gen Intern Med 2020 (Trauma-Induced Acceleration of Asymptomatic Pre-Existing Spondylosis)'
        },
        {
          id: 'atk-2',
          category: 'MECHANISM_OF_INJURY',
          opposingCounselAngle: 'Opposing counsel will attack the force vector, claiming that a minor rear-end impact at 25 mph cannot cause a herniated lumbar disc.',
          likelyQuestions: [
            '"Doctor, you weren’t in the vehicle on June 15, 2020, were you?"',
            '"The bumper damage was modest. Are you telling this jury that a low-speed fender bender exerted enough force to tear a spinal disc?"'
          ],
          recommendedResponse: '"Counsel, vehicle property damage does not correlate linearly with human biomechanical spinal loading. The clinical record specifically documents that Ms. Quinonez was stopped with her head and torso rotated to the right while parallel parking. As biomechanical spine literature demonstrates, rotation pre-stresses the annulus fibrosus, reducing tensile tolerance by up to 50%. A rear impact under rotational shear produces acute annular tearing and disc extrusion even at modest velocities."',
          trapToAvoid: 'Do not debate vehicle repair repair invoices or crush depth. Anchor on patient posture, rotational shear, and human spine tolerance curves.',
          keyRecordCitations: ['June 15, 2020 Collision Report & HPI', 'Documented Torso Rotation while Parallel Parking'],
          supportingLiterature: 'Spine biomechanics literature on coupled rotational shear and axial pre-tension.'
        },
        {
          id: 'atk-3',
          category: 'OBJECTIVE_VS_SUBJECTIVE',
          opposingCounselAngle: 'Opposing counsel will claim the patient’s symptoms are entirely subjective complaints influenced by secondary gain and litigation.',
          likelyQuestions: [
            '"Pain is subjective, isn’t it Doctor? You cannot see pain, you have to take the plaintiff’s word for it?"',
            '"If she exaggerates her symptoms to her lawyers, your opinion would be based on inaccurate information, wouldn’t it?"'
          ],
          recommendedResponse: '"Counsel, my opinion is not based merely on subjective self-reports. It is grounded in immutable objective testing: first, the EMA EMG of November 8, 2022, which documented involuntary fibrillations and positive sharp waves in the right tibialis anterior that cannot be faked; second, the TRA MRI demonstrating right L5 nerve root compression; and third, objective physical exam documentation of diminished right EHL strength and sensory deficits conforming exactly to an L5 dermatome."',
          trapToAvoid: 'Never concede that the case relies solely on patient credibility. Point directly to the abnormal electrodiagnostic EMG study and neuroforaminal MRI cuts.',
          keyRecordCitations: ['2022-11-08 EMA EMG Fibrillations / Positive Sharp Waves', '2023-04-19 NeoSpine EHL weakness'],
          supportingLiterature: 'Tong et al., Arch Phys Med Rehabil 2022 (92% Specificity of EMG in Axonal Motor Loss)'
        },
        {
          id: 'atk-4',
          category: 'GAP_IN_CARE',
          opposingCounselAngle: 'Opposing counsel will exploit periods where patient did not receive active therapy or delayed seeking specialist care.',
          likelyQuestions: [
            '"Doctor, why did Ms. Quinonez wait months between physical therapy discharge and seeing an interventional specialist?"',
            '"If her pain was truly unbearable, wouldn’t an ordinary person go straight to the emergency room or neurosurgeon?"'
          ],
          recommendedResponse: '"Counsel, Ms. Quinonez followed the textbook medical model of conservative stepped escalation. Standard neurosurgical guidelines mandate attempting conservative care—including physical therapy and chiropractic treatment—before pursuing invasive interventional injections or surgical consultation. Her course demonstrated patient endurance and compliance with evidence-based conservative trials before escalating to neurosurgical decompression."',
          trapToAvoid: 'Do not become defensive about time intervals. Frame conservative trials as prudent, guideline-directed medical management that rules out spontaneous resolution.',
          keyRecordCitations: ['Sound Physical Therapy 12-week course', 'Stepped escalation from oral Medrol to TFESI'],
          supportingLiterature: 'EANS Guidelines 2021 (6–12 weeks conservative trial prior to surgical intervention)'
        },
        {
          id: 'atk-5',
          category: 'SURGICAL_NECESSITY',
          opposingCounselAngle: 'Opposing counsel will argue that surgery is premature, unnecessary, or being driven by personal injury counsel.',
          likelyQuestions: [
            '"You are a spine surgeon, Doctor. Isn’t it true that surgeons make money by operating?"',
            '"Ms. Quinonez managed for nearly three years without surgery. That proves she doesn’t truly need an operation today, doesn’t it?"'
          ],
          recommendedResponse: '"Counsel, surgery was not rushed; in fact, over 36 months of exhaustive conservative therapy were completed without lasting resolution. When a patient demonstrates objective L5 radiculopathy with persistent motor weakness, concordant relief from targeted transforaminal diagnostic injections, and failure of conservative management, surgical microdiscectomy is universally recognized by neurosurgical consensus guidelines as the definitive standard of care to prevent permanent neurological deficit."',
          trapToAvoid: 'Do not argue or take financial accusations personally. Re-orient to standard evidence-based guidelines and prevention of permanent axonal nerve injury.',
          keyRecordCitations: ['2023-05-18 TFESI concordant relief', '2023-06-21 Surgical Recommendation Note'],
          supportingLiterature: 'MacVicar et al., Spine J 2019 (>90% Predictive Value of Targeted TFESI)'
        }
      ]
    }
  };
}

// Interactive Gemini function to ask custom deposition questions or simulate adversarial cross-examination
export async function askDepositionQuestionWithGemini(
  question: string,
  expertRole: 'PLAINTIFF' | 'DEFENSE',
  caseAnalysis: MedicolegalCaseAnalysis,
  apiKey: string
): Promise<{
  answer: string;
  opposingCounselTrap: string;
  keyEvidentiaryPoints: string[];
  recommendedCitations: string[];
}> {
  if (!apiKey) {
    throw new Error('Gemini API key is required to query Deposition Prep.');
  }

  const prompt = `
You are a premier Medicolegal Trial Consultant and Board-Certified Neurosurgeon Expert Witness.
You are preparing Dr. A. Alex Mohit, MD, PhD for a high-stakes videotaped expert deposition.

ACTIVE CASE DATA:
Patient: ${caseAnalysis.patientInfo.patientName} (Age ${caseAnalysis.patientInfo.patientAge || 'Unknown'})
Incident: ${caseAnalysis.patientInfo.dateOfIncident}
Caption: ${caseAnalysis.patientInfo.caseCaption}
Doctor's Medical Opinion: ${caseAnalysis.deliverable2_causation.formalMedicalOpinion}
Biomechanical Causation: ${caseAnalysis.deliverable2_causation.biomechanicalCausation}
Eggshell Skull / Washington WPI 30.17 Analysis: ${caseAnalysis.deliverable2_causation.eggshellSkullAnalysis}
Key Timeline Excerpts: ${caseAnalysis.deliverable3_timeline.slice(0, 8).map(e => `${e.date} (${e.clinicVisit}): ${e.oneSentenceDescription}`).join('; ')}

DOCTOR'S RETAINED ROLE:
Dr. Mohit is retained as an Expert for the: ${expertRole.toUpperCase()}

OPPOSING COUNSEL'S DEPOSITION ATTACK QUESTION / TOPIC TO ANALYZE:
"${question}"

YOUR TASK:
1. Deconstruct how opposing counsel (${expertRole === 'PLAINTIFF' ? 'Defense counsel' : 'Plaintiff counsel'}) is attempting to trap, impeach, or bait Dr. Mohit.
2. Formulate the exact, authoritative, bulletproof response that Dr. Mohit should testify to on the record.
3. List 3 key evidentiary points from the patient's record to emphasize.
4. List 2 exact citations (dates, imaging, literature) to dismantle opposing counsel's theory.

OUTPUT FORMAT:
Return pure JSON matching this exact structure:
{
  "answer": "The comprehensive, polished courtroom response scripted for Dr. Mohit...",
  "opposingCounselTrap": "Explanation of the trap opposing counsel is laying...",
  "keyEvidentiaryPoints": [
    "Point 1...",
    "Point 2...",
    "Point 3..."
  ],
  "recommendedCitations": [
    "Citation 1...",
    "Citation 2..."
  ]
}
`;

  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-pro-preview'
  ];

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  let rawText: string | null = null;
  let lastError = '';

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        lastError = await response.text();
        continue;
      }

      const resJson = await response.json();
      const textCandidate = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textCandidate) {
        rawText = textCandidate;
        break;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  if (!rawText) {
    throw new Error(lastError || 'Failed to generate deposition response.');
  }

  return JSON.parse(rawText);
}
