import {
  CaseProfile,
  ClinicalMilestone,
  LegalBreachPoint,
  DefenseAnchorPoint,
  DepositionQuestion,
  VitalSignPoint,
  MedicationEvent,
  StanceMode
} from '../types/forensic';

export function createEmptyCase(): CaseProfile {
  return {
    id: `case-${Date.now()}`,
    caseName: 'Untitled Forensic Case',
    caseNumber: '',
    courtJurisdiction: '',
    patientName: '',
    patientAge: 0,
    patientSex: 'Unknown',
    retainingCounsel: '',
    lawFirm: '',
    retainingSide: 'DEFENSE',
    dateOfIncident: new Date().toISOString().split('T')[0],
    allegationsSummary: '',
    documents: [],
    vitals: [],
    medications: [],
    milestones: [],
    plaintiffBreaches: [],
    defenseAnchors: [],
    synopsisExecutive: '',
    synopsisNarrative: '',
    standardOfCareDetermination: 'INCONCLUSIVE',
    causationOpinion: '',
    depositionPrep: [],
    generatedArtifacts: [],
    lastModified: new Date().toISOString()
  };
}

/**
 * High-fidelity benchmark teaching case (Thoracic Aortic Dissection)
 * Only loaded when explicitly triggered by the user via "Load Benchmark Reference Case".
 */
export function getBenchmarkTeachingCase(): CaseProfile {
  const vitals: VitalSignPoint[] = [
    {
      id: 'v-1',
      timestamp: '2024-03-12T07:15:00',
      timeDisplay: '07:15',
      sbp: 188,
      dbp: 112,
      map: 137,
      hr: 98,
      rr: 22,
      spo2: 97,
      temp: 98.4,
      providerNote: 'Triage presentation: acute tearing retrosternal chest pain radiating to interscapular region.',
      pageNumber: 3,
      batesNumber: 'REC-00003',
      criticalFlag: true
    },
    {
      id: 'v-2',
      timestamp: '2024-03-12T08:30:00',
      timeDisplay: '08:30',
      sbp: 176,
      dbp: 104,
      map: 128,
      hr: 92,
      rr: 20,
      spo2: 98,
      temp: 98.6,
      providerNote: 'Post IV Morphine 4mg; pain persistent 8/10.',
      pageNumber: 5,
      batesNumber: 'REC-00005',
      criticalFlag: true
    },
    {
      id: 'v-3',
      timestamp: '2024-03-12T10:15:00',
      timeDisplay: '10:15',
      sbp: 164,
      dbp: 98,
      map: 120,
      hr: 88,
      rr: 18,
      spo2: 99,
      temp: 98.6,
      providerNote: 'Pending CT Angiogram chest/abdomen.',
      pageNumber: 8,
      batesNumber: 'REC-00008',
      criticalFlag: false
    },
    {
      id: 'v-4',
      timestamp: '2024-03-12T13:40:00',
      timeDisplay: '13:40',
      sbp: 142,
      dbp: 86,
      map: 105,
      hr: 76,
      rr: 18,
      spo2: 98,
      temp: 98.8,
      providerNote: 'CT completed: DeBakey Type I / Stanford Type A Dissection identified with ascending involvement.',
      pageNumber: 14,
      batesNumber: 'REC-00014',
      criticalFlag: true
    },
    {
      id: 'v-5',
      timestamp: '2024-03-12T16:20:00',
      timeDisplay: '16:20',
      sbp: 98,
      dbp: 58,
      map: 71,
      hr: 114,
      rr: 26,
      spo2: 93,
      temp: 99.1,
      providerNote: 'Sudden hypotension and tachycardia; transfer to tertiary center delayed due to bed availability.',
      pageNumber: 22,
      batesNumber: 'REC-00022',
      criticalFlag: true
    },
    {
      id: 'v-6',
      timestamp: '2024-03-12T18:05:00',
      timeDisplay: '18:05',
      sbp: 64,
      dbp: 38,
      map: 47,
      hr: 132,
      rr: 32,
      spo2: 86,
      temp: 97.9,
      providerNote: 'Cardiac tamponade suspected; emergent pericardiocentesis attempted.',
      pageNumber: 29,
      batesNumber: 'REC-00029',
      criticalFlag: true
    }
  ];

  const medications: MedicationEvent[] = [
    {
      id: 'm-1',
      drugName: 'Morphine Sulfate',
      dose: '4 mg IV',
      route: 'IV Push',
      startTimestamp: '2024-03-12T07:45:00',
      administeredBy: 'RN S. Jenkins',
      status: 'administered',
      pageNumber: 4,
      batesNumber: 'REC-00004',
      indicationNotes: 'Severe retrosternal tearing pain'
    },
    {
      id: 'm-2',
      drugName: 'Labetalol IV',
      dose: '20 mg IV bolus',
      route: 'IV Push',
      startTimestamp: '2024-03-12T08:10:00',
      administeredBy: 'RN S. Jenkins',
      status: 'administered',
      pageNumber: 5,
      batesNumber: 'REC-00005',
      indicationNotes: 'Antihypertensive impulse control for suspected acute aortic syndrome'
    },
    {
      id: 'm-3',
      drugName: 'Esmolol Infusion',
      dose: '50 mcg/kg/min drip',
      route: 'Continuous IV',
      startTimestamp: '2024-03-12T09:20:00',
      stopTimestamp: '2024-03-12T16:30:00',
      administeredBy: 'RN M. Vance',
      status: 'administered',
      pageNumber: 7,
      batesNumber: 'REC-00007',
      indicationNotes: 'Heart rate target < 60 bpm and SBP 100-120 mmHg'
    },
    {
      id: 'm-4',
      drugName: 'Nitroprusside Drip',
      dose: '0.5 mcg/kg/min',
      route: 'Continuous IV',
      startTimestamp: '2024-03-12T11:00:00',
      administeredBy: 'RN M. Vance',
      status: 'delayed',
      pageNumber: 11,
      batesNumber: 'REC-00011',
      indicationNotes: 'Pharmacy compounding delay of 85 minutes from physician order'
    }
  ];

  const milestones: ClinicalMilestone[] = [
    {
      id: 'ms-1',
      timestamp: '2024-03-12T07:10:00',
      timeDisplay: '07:10 AM',
      relativeTimeDelta: 'T+0 (Admission)',
      phase: 'PRE_ADMISSION',
      category: 'ED_TRIAGE',
      title: 'Emergency Department Triage & Presentation',
      provider: 'Triage RN K. Patel, BSN, RN',
      providerRole: 'NURSE',
      facilityDepartment: 'St. Jude Community Hospital Emergency Dept.',
      summary: '58-year-old male arrives via private auto with sudden-onset tearing interscapular thoracic back pain radiating to mid-abdomen. Triage vitals: SBP 188/112 mmHg, HR 98 bpm.',
      verbatimQuote: 'Patient reports sudden severe tearing retrosternal pain radiating straight through to shoulder blades starting 06:30 while at rest. Describes pain as 10/10 ripping quality. Diaphoretic. SBP 188/112. Placed on cardiac monitor.',
      severity: 'critical',
      pageNumber: 2,
      batesNumber: 'REC-00002',
      benchmarkComparison: {
        expectedStandard: 'Triage acuity assignment within 10 minutes of arrival',
        actualTime: '4 minutes',
        status: 'COMPLIANT'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'COMMUNICATION',
        argument: 'Triage nurse correctly assigned ESI Acuity Level 2, but fail-safe protocol to alert attending physician within 15 minutes was not activated.',
        standardOfCareRule: 'ESI Level 2 patients require immediate physician bedside evaluation within 15-30 minutes.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Triage nurse promptly documented hallmark symptom triad (tearing pain, interscapular radiation, severe hypertension) and immediately placed patient on telemetry.',
        clinicalRationale: 'Contemporaneous triage assessment adheres strictly to Emergency Nursing Association (ENA) protocols.'
      }
    },
    {
      id: 'ms-2',
      timestamp: '2024-03-12T07:55:00',
      timeDisplay: '07:55 AM',
      relativeTimeDelta: '+45 min',
      phase: 'DIAGNOSTIC_WORKUP',
      category: 'PHYSICIAN_CONSULT',
      title: 'Attending Emergency Physician Bedside Evaluation & Initial Plan',
      provider: 'Dr. Raymond Holt, MD (Emergency Medicine)',
      providerRole: 'ATTENDING',
      facilityDepartment: 'ED Acute Care Bay 4',
      summary: 'Initial physician evaluation. Differential diagnosis formulated: Acute Coronary Syndrome (ACS) vs. Musculoskeletal Thoracic Spasm vs. Acute Aortic Syndrome. ECG demonstrates sinus rhythm with nonspecific ST abnormalities; serial troponins negative (<0.01). Ordered portable CXR, Aspirin 324 mg, and IV Labetalol 20 mg.',
      verbatimQuote: '58yo male with severe back and chest discomfort. ECG without STEMI criteria. Differential includes ACS, thoracic radiculopathy, dissecting thoracic aneurysm. Initiating ASA 324mg, IV Labetalol 20mg for BP control. Troponin drawn.',
      severity: 'caution',
      pageNumber: 4,
      batesNumber: 'REC-00004',
      benchmarkComparison: {
        expectedStandard: 'Emergency physician bedside evaluation within 30 min of arrival',
        actualTime: '45 minutes',
        status: 'DELAYED'
      },
      plaintiffFlag: {
        isBreach: true,
        breachCategory: 'MISDIAGNOSIS',
        argument: 'Failure to order immediate STAT CT Angiogram of chest upon presentation. Physician anchored prematurely on ACS despite classic tearing pain and uncalibrated hypertension, giving Aspirin which increased bleeding risks.',
        standardOfCareRule: 'AHA/ACC Guidelines: Patients presenting with tearing thoracic pain radiating to the back with severe refractory hypertension require immediate definitive aortic imaging (CTA or TEE) within 60 minutes.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'ACS is statistically 50 times more common than aortic dissection in this demographic. Physician appropriately prioritized ruling out ischemic myocardial infarction while simultaneously administering IV Labetalol to lower dP/dt sheer stress.',
        clinicalRationale: 'Reasoned clinical judgment: Dual-branching differential diagnosis pursued with prompt impulse control initiation.'
      }
    },
    {
      id: 'ms-3',
      timestamp: '2024-03-12T11:30:00',
      timeDisplay: '11:30 AM',
      relativeTimeDelta: '+3h 35 min',
      phase: 'CRITICAL_WINDOW',
      category: 'IMAGING',
      title: 'CT Angiogram Chest/Abdomen Ordered & Executed',
      provider: 'Dr. Raymond Holt, MD / Dr. Elaine Wu, MD (Diagnostic Radiology)',
      providerRole: 'CONSULTANT',
      facilityDepartment: 'Diagnostic Imaging / Multi-slice CT Scanner 2',
      summary: 'Contrast-enhanced CT Angiography of the chest, abdomen, and pelvis completed 3 hours and 35 minutes after initial arrival. Radiologist urgent finding: Acute Stanford Type A aortic dissection extending from aortic root to bilateral common iliacs with true lumen collapse.',
      verbatimQuote: 'CRITICAL VALUE CALLED TO DR. HOLT AT 11:34 AM: Extensive acute Stanford Type A dissection flap originating in ascending aorta 1.2 cm above sinotubular junction. Pericardial trace effusion noted. Surgical emergency.',
      severity: 'critical',
      pageNumber: 13,
      batesNumber: 'REC-00013',
      benchmarkComparison: {
        expectedStandard: 'Definitive aortic imaging completed < 60 minutes from suspicion',
        actualTime: '215 minutes (3h 35m)',
        status: 'EXCESSIVE_DELAY'
      },
      plaintiffFlag: {
        isBreach: true,
        breachCategory: 'DELAY',
        argument: 'Unreasonable 3.5-hour delay in ordering CTA for hallmark clinical catastrophe. The delay permitted continuous retrograde progression of the intimal tear toward the aortic valve and pericardial reflection.',
        standardOfCareRule: 'Standard of care requires emergent CTA acquisition without waiting for non-critical routine laboratory panels.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'COMPLICATION_MANAGEMENT',
        argument: 'Patient presented with severe chronic renal insufficiency (baseline Serum Creatinine 2.1 mg/dL). Physician appropriately administered pre-contrast hydration to mitigate irreversible acute tubular necrosis.',
        clinicalRationale: 'Balancing contrast-induced nephropathy risk against diagnostic urgency in an evolving clinical picture.'
      }
    },
    {
      id: 'ms-4',
      timestamp: '2024-03-12T13:15:00',
      timeDisplay: '01:15 PM',
      relativeTimeDelta: '+1h 45 min',
      phase: 'OPERATIVE_OR',
      category: 'PHYSICIAN_CONSULT',
      title: 'Cardiothoracic Surgery Consult & Emergency Transfer Coordination',
      provider: 'Dr. Marcus Vance, MD (Cardiothoracic Surgery Consult)',
      providerRole: 'ATTENDING',
      facilityDepartment: 'Surgical Consult Desk / Patient Transfer Center',
      summary: 'On-call cardiothoracic surgeon evaluates imaging remotely. Community hospital does not possess on-site perfusionist or cardiopulmonary bypass capabilities. Emergent transfer requested to University Medical Center (42 miles). Air transport requested; bed dispatch delayed 2 hours 45 minutes.',
      verbatimQuote: 'Reviewed CTA with Dr. Holt. Stanford Type A requires emergent median sternotomy and hemiarch repair. No cardiopulmonary bypass team available at St. Jude today. Transfer to University Hospital cardiothoracic surgical suite requested STAT.',
      severity: 'critical',
      pageNumber: 17,
      batesNumber: 'REC-00017',
      benchmarkComparison: {
        expectedStandard: 'Inter-facility transfer dispatch < 30 minutes for surgical emergencies',
        actualTime: '165 minutes (2h 45m)',
        status: 'EXCESSIVE_DELAY'
      },
      plaintiffFlag: {
        isBreach: true,
        breachCategory: 'COMMUNICATION',
        argument: 'The facility failed to implement an immediate bypass transfer protocol, leaving the patient stranded in a non-surgical community ED for over 2.5 hours while awaiting administrative bed clearance.',
        standardOfCareRule: 'Critical access facilities must maintain automatic direct-to-OR transfer agreements for surgical emergencies.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Emergency physician immediately recognized facility surgical limitations, arranged air transport, and aggressively titrated dual IV beta-blockers (Esmolol + Nitroprusside) to maintain systolic pressure 100-110 mmHg.',
        clinicalRationale: 'Aggressive medical impulse control is the gold-standard stabilizing protocol while surgical transfer is pending.'
      }
    },
    {
      id: 'ms-5',
      timestamp: '2024-03-12T18:25:00',
      timeDisplay: '06:25 PM',
      relativeTimeDelta: '+5h 10 min',
      phase: 'DETERIORATION_ESCALATION',
      category: 'ADVERSE_EVENT',
      title: 'Hemodynamic Rupture, Cardiac Tamponade & PEA Arrest',
      provider: 'Dr. Raymond Holt, MD / Emergency Code Blue Resuscitation Team',
      providerRole: 'ATTENDING',
      facilityDepartment: 'ED Trauma Resuscitation Suite 1',
      summary: 'Patient suffered acute catastrophic decompensation: sudden profound hypotension (BP 50/palpable), severe bradycardia, electromechanical dissociation (PEA arrest). Bedside ultrasound confirmed massive hemopericardium and acute cardiac tamponade from retrograde aortic root rupture. Resuscitation unsuccessful; death pronounced at 18:52.',
      verbatimQuote: 'CODE BLUE called 18:25. Patient unresponsive, pulseless. FAST exam reveals massive acute pericardial fluid with right ventricular collapse consistent with root rupture into pericardium. Emergent pericardiocentesis yielded 180cc gross blood. Resuscitation terminated 18:52.',
      severity: 'critical',
      pageNumber: 31,
      batesNumber: 'REC-00031',
      benchmarkComparison: {
        expectedStandard: 'Definitive surgical repair prior to intrapericardial extravasation',
        actualTime: 'Rupture at T+11h 15m from initial onset',
        status: 'EXCESSIVE_DELAY'
      },
      plaintiffFlag: {
        isBreach: true,
        breachCategory: 'DELAY',
        argument: 'Direct proximate causation: Stanford Type A dissection carries an acknowledged mortality rate increasing by 1-2% per hour of delay. Timely intervention within 90 minutes would have resulted in an operative survival probability exceeding 75%.',
        standardOfCareRule: 'Causation established: Diagnostic delay directly led to preventable intrapericardial rupture.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'COMORBIDITY_MASKING',
        argument: 'Stanford Type A dissection carries an inherent baseline mortality of 30-50% regardless of surgical timing. Autopsy confirmed extensive cystic medial necrosis and pre-existing 5.8cm ascending aortic aneurysm, predisposing to spontaneous rupture regardless of intervention speed.',
        clinicalRationale: 'Rupture was an inevitable consequence of extensive pre-existing connective tissue degeneration.'
      }
    }
  ];

  const plaintiffBreaches: LegalBreachPoint[] = [
    {
      id: 'br-1',
      title: 'Failure to Timely Diagnose Acute Aortic Syndrome (Diagnostic Delay)',
      allegation: 'The attending emergency physician deviated from the standard of care by failing to order an immediate contrast-enhanced CTA of the chest upon evaluating classic ripping retrosternal pain radiating to the back accompanied by severe refractory hypertension.',
      standardOfCareRule: 'In patients presenting with sudden-onset tearing or ripping thoracic pain and severe hypertension, prevailing guidelines (AHA/ACC/AATS) mandate rapid diagnostic imaging via CTA or TEE within 60-90 minutes of presentation.',
      deviationEvidence: 'CT Angiography was not ordered until 11:15 (4 hours post-arrival), despite negative serial troponins and uncalibrated pain.',
      proximateCausationAnalysis: 'Stanford Type A dissection carries a documented mortality rate increasing 1% to 2% for every hour intervention is delayed. The 4-hour delay directly deprived the patient of emergent surgical aortic graft repair prior to intrapericardial rupture.',
      contributingProviders: ['Dr. Raymond Holt, MD (Emergency Medicine)', 'St. Jude Community Hospital Emergency Dept.'],
      batesCitations: ['REC-00004', 'REC-00013', 'REC-00015'],
      severity: 'CRITICAL_BREACH'
    },
    {
      id: 'br-2',
      title: 'Delayed Emergent Surgical Inter-Facility Transfer Protocol',
      allegation: 'Failure of the emergency facility to execute STAT emergent air transport protocol immediately upon radiologic confirmation of ascending aortic dissection.',
      standardOfCareRule: 'Community facilities lacking emergent cardiopulmonary bypass capabilities must have automatic immediate transfer dispatch protocols for surgical aortic emergencies without awaiting secondary non-critical administrative approvals.',
      deviationEvidence: 'Transfer request was placed on standby for 165 minutes awaiting receiving hospital bed confirmation rather than dispatching emergent critical care transport directly to the receiving operating theater.',
      proximateCausationAnalysis: 'The 165-minute transport delay allowed progressive retrograde dissection into the pericardial reflection, precipitating fatal cardiac tamponade in the community ED.',
      contributingProviders: ['St. Jude Community Hospital Patient Transfer Coordinator', 'Dr. Raymond Holt, MD'],
      batesCitations: ['REC-00017', 'REC-00022'],
      severity: 'CRITICAL_BREACH'
    }
  ];

  const defenseAnchors: DefenseAnchorPoint[] = [
    {
      id: 'da-1',
      title: 'Appropriate Differential Diagnosis Prioritization and Impulse Control',
      defenseTheme: 'Reasoned Clinical Judgment in High-Acuity Emergency Setting',
      clinicalRational: 'ACS presents with identical retrosternal distress and occurs with a statistical frequency 50 times greater than Type A dissection. The attending physician timely administered IV labetalol and esmolol, adhering strictly to the primary goal of medical management: heart rate and dP/dt impulse control.',
      complianceWithGuidelines: 'Met 2022 ACC/AHA Guidelines for aortic management by maintaining target systolic blood pressure and heart rate < 60 bpm with dual IV beta-blockade.',
      preExistingConfounders: 'Patient possessed longstanding untreated hypertension, severe baseline renal insufficiency (Cr 2.1 mg/dL), and a 40 pack-year smoking history, significantly elevating baseline operative and dissection mortality.',
      supportingDocumentation: 'Emergency Physician bedside progress note at 08:30 explicitly outlines impulse control therapy and renal-protective lab coordination.',
      batesCitations: ['REC-00005', 'REC-00007', 'REC-00010'],
      strength: 'STRONG_JUDGMENT'
    },
    {
      id: 'da-2',
      title: 'High Inherent Natural Mortality of Stanford Type A Dissection',
      defenseTheme: 'Lack of Proximate Causation / High Mortality Independent of Care',
      clinicalRational: 'Ascending aortic dissection with root involvement carries a spontaneous catastrophic rupture rate of 40-50% within 24 hours regardless of surgical intervention. Operative mortality alone at tertiary centers ranges between 15-25%.',
      complianceWithGuidelines: 'The timing of rupture was idiosyncratic and driven by intrinsic medial degenerations of the aortic wall (cystic medial necrosis) rather than any act or omission by the emergency physician.',
      preExistingConfounders: 'Post-mortem pathology documented extensive adventitial thinning and pre-existing ascending aneurysm of 5.8 cm.',
      supportingDocumentation: 'Autopsy report notes extensive structural connective tissue degeneration of the aortic root.',
      batesCitations: ['REC-00031', 'REC-00035'],
      strength: 'DEFENSIBLE_COMPLICATION'
    }
  ];

  const depositionPrep: DepositionQuestion[] = [
    {
      id: 'dq-1',
      targetedVulnerability: 'Why was CT Angiography delayed for 3.5 hours after presentation?',
      hostileQuestion: 'Doctor, isn\'t it true that if you had ordered the CT scan at 07:30 instead of 11:15, this patient would have been on the helicopter and in the operating room before his aorta ruptured?',
      advisableResponseStrategy: 'Do not speculate or accept the false timing premise. Re-anchor on the evolving clinical picture: The patient required immediate hemodynamic stabilization and impulse control first. Administering contrast before achieving blood pressure control and evaluating renal status can induce acute tubular necrosis and hemodynamic collapse.',
      supportingChartCitations: ['REC-00005', 'REC-00009', 'REC-00013'],
      stanceContext: 'DEFENSE'
    },
    {
      id: 'dq-2',
      targetedVulnerability: 'Did the emergency physician breach the standard of care by ruling out ACS first?',
      hostileQuestion: 'Doctor, isn\'t "ripping pain radiating to the back" the classic hallmark textbook presentation of an aortic dissection, not an acute myocardial infarction?',
      advisableResponseStrategy: 'Confirm that back pain occurs in dissection, but firmly establish that ACS is 50 times more common. A reasonably prudent physician must evaluate both concurrently while prioritizing emergent beta-blockade, which treats both conditions simultaneously.',
      supportingChartCitations: ['REC-00004', 'REC-00006'],
      stanceContext: 'DEFENSE'
    },
    {
      id: 'dq-3',
      targetedVulnerability: 'Was the transfer delay a failure of hospital systems?',
      hostileQuestion: 'Isn\'t it a fact that while this man was bleeding into his pericardial sac, the hospital spent nearly three hours making telephone calls trying to find an open bed instead of transferring him immediately as a life-or-death emergency?',
      advisableResponseStrategy: 'Highlight the objective reality of regional trauma networks: A patient cannot be dispatched via air ambulance to a facility without an available surgical team and an accepting cardiothoracic surgeon standing by in the OR. Transfer protocols were initiated promptly.',
      supportingChartCitations: ['REC-00017', 'REC-00021'],
      stanceContext: 'DEFENSE'
    }
  ];

  return {
    id: 'case-demo-aortic',
    caseName: 'Estate of M. Davis v. St. Jude Regional Medical Center & Holt, MD',
    caseNumber: '24-CV-08942-MDL',
    courtJurisdiction: 'Superior Court of Washington, King County',
    patientName: 'Michael E. Davis',
    patientAge: 58,
    patientSex: 'Male',
    retainingCounsel: 'Williamson, Mercer & Chen, LLP',
    lawFirm: 'Mercer Healthcare Litigation Practice Group',
    retainingSide: 'DEFENSE',
    dateOfIncident: '2024-03-12',
    allegationsSummary: 'Alleged wrongful death resulting from failure to timely diagnose and surgically treat Stanford Type A Aortic Dissection in a 58-year-old male presenting with acute chest and interscapular back pain.',
    documents: [
      {
        id: 'doc-demo-1',
        fileName: 'St_Jude_Hospital_Complete_EHR_Record.pdf',
        fileSize: 4210000,
        fileType: 'application/pdf',
        uploadedAt: '2024-04-10T14:30:00Z',
        pageCount: 36,
        batesPrefix: 'REC-',
        batesStartNumber: 1,
        batesEndNumber: 36,
        rawTextByPage: [
          { page: 2, bates: 'REC-00002', text: 'ED Triage Assessment: 58yo male with acute tearing chest pain radiating to interscapular space. BP 188/112, HR 98.' },
          { page: 4, bates: 'REC-00004', text: 'Physician Initial Note: Differential includes ACS vs Thoracic Dissection. Troponin negative. Morphine and labetalol ordered.' },
          { page: 13, bates: 'REC-00013', text: 'CTA Report: Acute Stanford Type A dissection from aortic root through iliac bifurcations.' },
          { page: 17, bates: 'REC-00017', text: 'Cardiothoracic Consult Note: Facility lacks on-site bypass. Transfer initiated to University Medical Center.' },
          { page: 31, bates: 'REC-00031', text: 'Code Resuscitation Summary: Sudden arrest with PEA. Pericardial tamponade confirmed on bedside echo. Pronounced 18:52.' }
        ]
      }
    ],
    vitals,
    medications,
    milestones,
    plaintiffBreaches,
    defenseAnchors,
    synopsisExecutive: 'This forensic medicolegal review evaluates the care provided to Michael E. Davis, a 58-year-old male who presented to St. Jude Community Hospital on March 12, 2024, at 07:10 with severe tearing chest and back pain. The patient was diagnosed with a Stanford Type A Aortic Dissection at 13:40 following CT Angiography. While awaiting inter-facility air transfer to a tertiary surgical center, the patient experienced intrapericardial rupture and died of acute cardiac tamponade at 18:52.',
    synopsisNarrative: 'The patient presented with classic symptoms concerning for Acute Aortic Syndrome alongside severe hypertension (188/112 mmHg). The emergency physician instituted IV beta-blockade (Labetalol and Esmolol) to achieve target heart rate and impulse control. A 3.5-hour interval elapsed prior to diagnostic CT Angiography, influenced by initial ACS workup and point-of-care renal function verification. Following radiologic diagnosis, immediate transfer was sought, but delayed by regional bed coordination constraints. Acute hemodynamic collapse occurred prior to transport.',
    standardOfCareDetermination: 'MET',
    causationOpinion: 'Based upon a reasonable degree of medical certainty, the attending emergency physician complied with prevailing standard of care by initiating immediate pharmacologic impulse control therapy with IV beta-blockers, mitigating wall stress. The catastrophic rupture was the consequence of pre-existing cystic medial necrosis and extensive ascending aortic structural disease rather than a deviation from the acceptable standard of medical care.',
    depositionPrep,
    generatedArtifacts: [
      {
        id: 'art-demo-1',
        title: '20-Slide Forensic Courtroom Presentation (Stanford Type A Dissection)',
        type: 'PPTX_PRESENTATION',
        fileName: 'ForensicReview_Estate_of_M__Davis_20Slide_Presentation.pptx',
        createdAt: new Date().toISOString(),
        fileSize: '1.2 MB',
        description: 'Complete 20-slide courtroom presentation with hemodynamic curves and opposing counsel disproof.',
        pageCountOrSlides: 20
      }
    ],
    lastModified: new Date().toISOString()
  };
}

/**
 * Real Landmark Personal Injury / Neurosurgical Causation Case
 * Holly Quinonez (DOB: 05/21/1984) — Traumatic MVA "Lit-Up" Lumbar HNP & Cervical Radiculopathy
 * Synthesizes Quin_summary, Quin_dep (10 defense challenges), and Quin_lit (Clark et al. 2020).
 */
export function getQuinonezCaseProfile(): CaseProfile {
  const milestones: ClinicalMilestone[] = [
    {
      id: 'quin-ms-1',
      timestamp: '2020-06-15T14:30:00Z',
      timeDisplay: '14:30',
      relativeTimeDelta: 'Traumatic Collision',
      phase: 'PRE_ADMISSION',
      category: 'ED_TRIAGE',
      title: 'Motor Vehicle Collision: Rear-End Impact (~25 mph)',
      provider: 'First Responders / Patient History',
      providerRole: 'EMS',
      facilityDepartment: 'Incident Scene',
      summary: 'Restrained driver rear-ended at ~25 mph without braking while attempting to parallel park. Head turned to right and right arm behind passenger seat, causing severe asymmetric torsional loading across cervical and lumbosacral spine.',
      verbatimQuote: '"She reported immediate-onset neck pain… continued neck pain, L shoulder/clavicle pain and R middle finger pain. All cervical movements are restricted and painful particularly turning to the R side."',
      severity: 'caution',
      pageNumber: 1,
      batesNumber: 'REC-00001',
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Contemporaneous immediate symptom onset establishes acute temporal relationship.'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'DELAY',
        argument: 'Clear traumatic mechanism with asymmetric rotation causing disc shear.'
      }
    },
    {
      id: 'quin-ms-2',
      timestamp: '2020-06-23T10:15:00Z',
      timeDisplay: '10:15',
      relativeTimeDelta: '+8 Days',
      phase: 'DIAGNOSTIC_WORKUP',
      category: 'PHYSICIAN_CONSULT',
      title: 'Franciscan Medical Group: Acute Post-Collision Evaluation',
      provider: 'Primary Care Physician',
      providerRole: 'ATTENDING',
      facilityDepartment: 'Outpatient Clinic',
      summary: 'Immediate post-collision clinical examination documents acute neck pain, left clavicle tenderness, right middle finger swelling, tingling radiating down left arm, and severe limitation in cervical range of motion.',
      verbatimQuote: '"She has mild tingling down her neck on the L side to her arm. Severely restricted cervical range of motion in all directions with L sided neck pain."',
      severity: 'normal',
      pageNumber: 5,
      batesNumber: 'REC-00005',
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Confirms acute cervical strain with objective radicular features within one week of collision.'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'COMMUNICATION',
        argument: 'Objective radicular deficits documented contemporaneously with no prior history.'
      }
    },
    {
      id: 'quin-ms-3',
      timestamp: '2021-11-29T11:00:00Z',
      timeDisplay: '11:00',
      relativeTimeDelta: '+1y 5m',
      phase: 'CRITICAL_WINDOW',
      category: 'SURGICAL_OR',
      title: 'Genesis Interventional Spine: L5-S1 Interlaminar ESI & MBBs',
      provider: 'Interventional Pain Physician',
      providerRole: 'CONSULTANT',
      facilityDepartment: 'Interventional Spine Suite',
      summary: 'Patient underwent extensive conservative therapy (PT, chiropractic, massage, NSAIDs, muscle relaxants) followed by fluoroscopically-guided L5-S1 ESI and facet MBBs.',
      verbatimQuote: '"She reports having 2 weeks of relief… but pain returned to baseline. Pain prevents her from sitting longer than 10 minutes."',
      severity: 'caution',
      pageNumber: 18,
      batesNumber: 'REC-00018',
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'COMPLICATION_MANAGEMENT',
        argument: 'Temporary relief confirms accurate target localization and proves the structural pain generator.'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'DELAY',
        argument: 'Short-lived steroid response confirms unyielding mechanical nerve root compression.'
      }
    },
    {
      id: 'quin-ms-4',
      timestamp: '2022-11-08T09:30:00Z',
      timeDisplay: '09:30',
      relativeTimeDelta: '+11 Months',
      phase: 'DIAGNOSTIC_WORKUP',
      category: 'LAB_CRITICAL',
      title: 'EMA Electrodiagnostic Study: Confirmed Right L5 Radiculopathy',
      provider: 'Electromyographer / Neurologist',
      providerRole: 'CONSULTANT',
      facilityDepartment: 'Neurophysiology Lab',
      summary: 'Comprehensive Nerve Conduction Studies and Needle Electromyography (NCS/EMG) perform objective electrophysiological assessment of lower extremities.',
      verbatimQuote: '"Abnormal study. Right subacute L5 radiculopathy. No evidence of left radiculopathy or peripheral neuropathy."',
      severity: 'critical',
      pageNumber: 24,
      batesNumber: 'REC-00024',
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Objective, independent neurophysiologic corroboration of right L5 root impairment.'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'MISDIAGNOSIS',
        argument: 'Disproves defense claim of subjective symptom exaggeration or non-organic etiology.'
      }
    },
    {
      id: 'quin-ms-5',
      timestamp: '2023-02-07T08:45:00Z',
      timeDisplay: '08:45',
      relativeTimeDelta: '+3 Months',
      phase: 'DIAGNOSTIC_WORKUP',
      category: 'IMAGING',
      title: 'TRA Medical Imaging: Lumbar Spine MRI (L5-S1 Disc Protrusion)',
      provider: 'Staff Radiologist',
      providerRole: 'CONSULTANT',
      facilityDepartment: 'Diagnostic Radiology',
      summary: 'High-field MRI of the lumbar spine reveals small right-sided L5-S1 posterolateral/foraminal disc protrusion with direct impingement of the right L5 nerve root.',
      verbatimQuote: '"Small right-sided L5–S1 posterolateral/foraminal disc protrusion. This results in impingement of the right L5 nerve root. Moderate right and mild left neuroforaminal stenosis at L5–S1."',
      severity: 'caution',
      pageNumber: 31,
      batesNumber: 'REC-00031',
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Direct anatomical correlation between MRI nerve root impingement and EMG radiculopathy.'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'DOCUMENTATION_GAP',
        argument: 'Objective nerve root contact satisfies definitive surgical indication criteria.'
      }
    },
    {
      id: 'quin-ms-6',
      timestamp: '2023-02-07T09:15:00Z',
      timeDisplay: '09:15',
      relativeTimeDelta: '+30 Minutes',
      phase: 'DIAGNOSTIC_WORKUP',
      category: 'IMAGING',
      title: 'TRA Medical Imaging: Cervical Spine MRI (Foraminal Stenosis)',
      provider: 'Staff Radiologist',
      providerRole: 'CONSULTANT',
      facilityDepartment: 'Diagnostic Radiology',
      summary: 'Concurrent cervical spine MRI reveals multi-level degenerative disc disease and facet arthropathy with severe right C3-C4 and moderate C5-C6 foraminal stenosis.',
      verbatimQuote: '"Severe neuroforaminal stenosis at the right C3–C4 level. Moderate right C5–C6 neuroforaminal stenosis. Degenerative disc disease and facet arthropathy."',
      severity: 'caution',
      pageNumber: 33,
      batesNumber: 'REC-00033',
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Pre-existing asymptomatic stenosis rendered symptomatic ("lit up") by torsional collision force.'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'DOCUMENTATION_GAP',
        argument: 'Zero pre-collision cervical treatment across 7 years of prior records.'
      }
    },
    {
      id: 'quin-ms-7',
      timestamp: '2023-04-19T13:00:00Z',
      timeDisplay: '13:00',
      relativeTimeDelta: '+2 Months',
      phase: 'CRITICAL_WINDOW',
      category: 'PHYSICIAN_CONSULT',
      title: 'NeoSpine Comprehensive Neurosurgical Consult (Dr. Alex Mohit)',
      provider: 'Dr. A. Alex Mohit (Board-Certified Neurosurgeon)',
      providerRole: 'ATTENDING',
      facilityDepartment: 'Neurosurgery Outpatient Clinic',
      summary: 'Comprehensive neurosurgical evaluation by Dr. Alex Mohit. Patient reports chronic low back pain radiating into right hip, anterior thigh, and foot arch, with severe functional limitations (sitting < 10 mins). Confirms lumbar HNP at L5-S1 and cervical spondylosis with radiculopathy failing 3 years of structured nonoperative care.',
      verbatimQuote: '"She gets sharp stabbing pain in her neck with rotation… shooting pain down her spine with flexion. She feels weakness in her right anterior thigh and tingling in her right foot at her arch."',
      severity: 'normal',
      pageNumber: 42,
      batesNumber: 'REC-00042',
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Treatment decisions predicated strictly on objective neurological findings and clinical failure.'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'DELAY',
        argument: 'Nonoperative care properly exhausted over 34 months before surgical recommendation.'
      }
    },
    {
      id: 'quin-ms-8',
      timestamp: '2023-05-18T10:30:00Z',
      timeDisplay: '10:30',
      relativeTimeDelta: '+1 Month',
      phase: 'CRITICAL_WINDOW',
      category: 'SURGICAL_OR',
      title: 'NeoSpine Right L5-S1 Transforaminal ESI (Diagnostic Pinpointing)',
      provider: 'NeoSpine Interventional Team',
      providerRole: 'CONSULTANT',
      facilityDepartment: 'Procedure Suite',
      summary: 'Targeted right L5-S1 transforaminal epidural steroid injection performed. Confirms temporary relief of concordant radicular symptoms, definitively establishing the L5 nerve root as the primary surgical pain generator.',
      verbatimQuote: '"Targeted right L5–S1 TFESI performed under fluoroscopy. Patient experienced temporary concordant relief, confirming pain generator."',
      severity: 'normal',
      pageNumber: 47,
      batesNumber: 'REC-00047',
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'COMPLICATION_MANAGEMENT',
        argument: 'Confirms structural target before proceeding with operative discectomy.'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'COMMUNICATION',
        argument: 'Diagnostic precision complies with gold-standard spine surgical workup.'
      }
    },
    {
      id: 'quin-ms-9',
      timestamp: '2023-06-21T14:00:00Z',
      timeDisplay: '14:00',
      relativeTimeDelta: '+1 Month',
      phase: 'OPERATIVE_OR',
      category: 'PHYSICIAN_CONSULT',
      title: 'NeoSpine Definitive Surgical Recommendation (Dr. Alex Mohit)',
      provider: 'Dr. A. Alex Mohit (Board-Certified Neurosurgeon)',
      providerRole: 'ATTENDING',
      facilityDepartment: 'Neurosurgery Outpatient Clinic',
      summary: 'Following return of disabling radicular pain, Dr. Mohit reviews surgical indications with patient. Recommends right L5-S1 lumbar microdiscectomy and C5-C6 cervical disc replacement. Patient consents to intervention.',
      verbatimQuote: '"She understands all these issues and would like to go ahead with a right-sided L5–S1 lumbar microdiscectomy and C5–6 disc replacement."',
      severity: 'caution',
      pageNumber: 52,
      batesNumber: 'REC-00052',
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'INFORMED_CONSENT',
        argument: 'Evidence-based surgery supported by Clark et al. 2020 and EANS disc herniation guidelines.'
      },
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'SURGICAL_ERROR',
        argument: 'Surgery is medically reasonable, necessary, and proximately caused by the 6/15/2020 collision.'
      }
    }
  ];

  const depositionPrep: DepositionQuestion[] = [
    {
      id: 'quin-dep-1',
      targetedVulnerability: 'Preexisting / degenerative conditions not caused by the collision',
      hostileQuestion: 'Doctor, isn’t it true that lumbar spondylosis and foraminal stenosis are chronic degenerative conditions that existed long before June 15, 2020?',
      advisableResponseStrategy: 'Emphasize that the patient was completely asymptomatic prior to collision across 7 years of records (2013-2020). The collision activated ("lit up") previously silent pathology. Rear-end impact at 25 mph while twisted produced asymmetric disc shear.',
      supportingChartCitations: ['REC-00001 (Franciscan Initial Note)', 'REC-00031 (TRA Lumbar MRI)', 'REC-00024 (EMA EMG)'],
      stanceContext: 'PLAINTIFF'
    },
    {
      id: 'quin-dep-2',
      targetedVulnerability: 'Subjective pain complaints and alleged symptom exaggeration',
      hostileQuestion: 'Doctor, aren’t you relying entirely on Ms. Quinonez’s subjective complaints of pain, which could easily be exaggerated for litigation?',
      advisableResponseStrategy: 'Counter that opinions are grounded in objective triad: 1) MRI showing right L5 nerve root impingement, 2) EMG proving right subacute L5 radiculopathy, and 3) anatomical dermatomal concordance across 3+ years.',
      supportingChartCitations: ['REC-00024 (EMA EMG: Abnormal Right L5 radiculopathy)', 'REC-00031 (TRA MRI: nerve root impingement)'],
      stanceContext: 'PLAINTIFF'
    },
    {
      id: 'quin-dep-3',
      targetedVulnerability: 'Small size of disc protrusion on MRI',
      hostileQuestion: 'The radiologist specifically characterized the L5-S1 protrusion as "small." Doesn’t a small protrusion rule out surgical necessity?',
      advisableResponseStrategy: 'Size does not determine clinical significance—nerve root contact and functional impairment do. The MRI explicitly stated "results in impingement of the right L5 nerve root," and EMG confirmed functional nerve injury.',
      supportingChartCitations: ['REC-00031 (TRA Lumbar MRI)', 'REC-00024 (EMA EMG)'],
      stanceContext: 'PLAINTIFF'
    },
    {
      id: 'quin-dep-4',
      targetedVulnerability: 'Degenerative cervical foraminal stenosis',
      hostileQuestion: 'Isn’t cervical foraminal stenosis simply age-related wear-and-tear having nothing to do with a car accident?',
      advisableResponseStrategy: 'She had immediate cervical symptoms documented on 6/23/2020. The collision mechanism (rear-end while head rotated to right) is classic for cervical facet and foraminal shear. Degeneration does not preclude traumatic activation.',
      supportingChartCitations: ['REC-00005 (Franciscan 6/23/2020)', 'REC-00033 (TRA Cervical MRI)'],
      stanceContext: 'PLAINTIFF'
    },
    {
      id: 'quin-dep-5',
      targetedVulnerability: 'Temporary relief with injections used to argue surgery is unnecessary',
      hostileQuestion: 'If Ms. Quinonez got relief from her injections, why wouldn’t you just continue with non-surgical conservative injections?',
      advisableResponseStrategy: 'Temporary 2-week relief definitively confirms the anatomical pain generator, but its short duration proves structural mechanical nerve compression rather than reversible inflammation. After 3 years of failed conservative care, surgery is the guideline-concordant standard.',
      supportingChartCitations: ['REC-00018 (Genesis ESI)', 'REC-00047 (NeoSpine TFESI)', 'Clark et al. J Gen Intern Med 2020'],
      stanceContext: 'PLAINTIFF'
    },
    {
      id: 'quin-dep-6',
      targetedVulnerability: 'Widespread symptoms (headaches, foot swelling, sleep disturbance)',
      hostileQuestion: 'Doctor, aren’t her headaches, ocular migraines, and foot swelling completely unrelated to a lumbar disc herniation?',
      advisableResponseStrategy: 'Chronic spine pain syndromes produce well-documented secondary cascades: cervical pathology causes cervicogenic headaches, while antalgic gait from L5 radiculopathy causes asymmetric lower-extremity stress and kinetic chain dysfunction.',
      supportingChartCitations: ['REC-00042 (NeoSpine Consult)', 'REC-00005 (Franciscan Initial Note)'],
      stanceContext: 'PLAINTIFF'
    },
    {
      id: 'quin-dep-7',
      targetedVulnerability: 'Low-speed 25 mph collision with no immediate ER visit',
      hostileQuestion: 'This was a minor 25 mph collision where she didn’t even go to the Emergency Room. How can you claim it caused severe spine injuries?',
      advisableResponseStrategy: 'She was twisted to the right with her arm behind the passenger seat, drastically multiplying torsional disc loading. Spine soft-tissue and disc injuries frequently evolve over 24-72 hours as inflammatory cascades develop.',
      supportingChartCitations: ['REC-00001 (Collision Narrative)', 'REC-00005 (Franciscan 6/23/2020)'],
      stanceContext: 'PLAINTIFF'
    },
    {
      id: 'quin-dep-8',
      targetedVulnerability: 'Reliance on patient self-reporting',
      hostileQuestion: 'Doctor, how can you be sure she didn’t have back pain before June 2020 when you weren’t her doctor back then?',
      advisableResponseStrategy: 'Exhaustive review of MultiCare, CHI Franciscan, and Franciscan Medical Group records spanning 2013 to 2020 confirms zero prior complaints, zero work restrictions, and zero treatment for cervical or lumbar radiculopathy.',
      supportingChartCitations: ['Prior Medical Records 2013-2020 Audit (Exhibit B)'],
      stanceContext: 'PLAINTIFF'
    },
    {
      id: 'quin-dep-9',
      targetedVulnerability: 'Causation standard ("More probable than not")',
      hostileQuestion: 'Isn’t it merely speculative to say the car accident caused this specific disc herniation 3 years later?',
      advisableResponseStrategy: 'Causation is grounded in the legal standard of reasonable medical probability (>50%): acute symptom onset, bio-mechanically concordant torsional mechanism, objective imaging and EMG verification, and continuous 3-year treatment bridge.',
      supportingChartCitations: ['REC-00001', 'REC-00024', 'REC-00031', 'REC-00052'],
      stanceContext: 'PLAINTIFF'
    },
    {
      id: 'quin-dep-10',
      targetedVulnerability: 'Excessive surgical recommendation (Microdiscectomy & Disc Replacement)',
      hostileQuestion: 'Isn’t recommending both a lumbar microdiscectomy and a cervical disc replacement excessive and aggressive for this patient?',
      advisableResponseStrategy: 'Both procedures are standard of care after documented exhaustion of 34 months of conservative therapy (PT, chiropractic, medications, MBBs, TFESI) in a patient with progressive neurological impairment unable to sit >10 minutes.',
      supportingChartCitations: ['Clark et al. J Gen Intern Med 2020', 'EANS Lumbar Disc Guidelines', 'REC-00052'],
      stanceContext: 'PLAINTIFF'
    }
  ];

  const synopsisNarrative = `MEDICAL SYNOPSIS & CAUSATION SUPPORT
Comprehensive synthesis of medical records and declarations for Holly Quinonez (DOB: 05/21/1984)

1. BACKGROUND AND COLLISION SUMMARY
On June 15, 2020, Ms. Quinonez was a restrained driver who was rear-ended while attempting to parallel park. Her head was turned to the right and her right arm was behind the passenger seat. The striking vehicle impacted her at approximately 25 mph without braking, causing immediate symptoms.
Quoted record evidence:
“She reported immediate-onset neck pain… continued neck pain, L shoulder/clavicle pain and R middle finger pain.” “All cervical movements are restricted and painful particularly turning to the R side.”
These acute findings establish a clear temporal relationship between the collision and the onset of cervical and upper-extremity symptoms.

2. EARLY POST-COLLISION FINDINGS (JUNE 2020)
Franciscan Medical Group – 6/23/2020
• Immediate neck pain, left clavicle pain, right finger swelling
• Tingling radiating down the neck into the arm
• Severe restriction of cervical ROM
• Pain with cervical flexion and right rotation
• Difficulty grasping and lifting
Quoted record evidence:
“She has mild tingling down her neck on the L side to her arm.” “Severely restricted cervical range of motion in all directions with L sided neck pain.”
These findings support acute cervical strain with radicular features.

3. PERSISTENT SYMPTOMS (2020–2023)
Across MultiCare, Genesis, and NeoSpine records, Ms. Quinonez consistently reported:
• Chronic low back pain radiating into right hip, anterior thigh, and knee
• Tingling in right foot arch
• Neck pain with rotation; shooting pain down spine with flexion
• Daily headaches and ocular migraines
• Functional incapacity: inability to sit longer than 10 minutes
Quoted record evidence:
“Pain prevents her from sitting longer than 10 minutes.” “She gets sharp stabbing pain in her neck with rotation… shooting pain down her spine with flexion.” “She feels weakness in her right anterior thigh and tingling in her right foot at her arch.”

4. OBJECTIVE IMAGING FINDINGS
TRA MRI – 2/7/2023 (Lumbar Spine)
• Small right-sided L5–S1 posterolateral/foraminal disc protrusion
• Direct impingement of the right L5 nerve root
• Moderate right and mild left neuroforaminal stenosis at L5–S1
Quoted record evidence: “This results in impingement of the right L5 nerve root.”

TRA MRI – 2/7/2023 (Cervical Spine)
• Degenerative disc disease and facet arthropathy
• Severe right C3–C4 neuroforaminal stenosis
• Moderate right C5–C6 neuroforaminal stenosis
Quoted record evidence: “Severe neuroforaminal stenosis at the right C3–C4 level.”

5. ELECTRODIAGNOSTIC FINDINGS
EMA NCS/EMG – 11/8/2022
• Abnormal study confirming Right subacute L5 radiculopathy
• Zero evidence of left radiculopathy or peripheral neuropathy
Quoted record evidence: “Abnormal study. Right subacute L5 radiculopathy.”
This provides objective electrophysiologic confirmation of lumbar nerve root compression matching the L5–S1 disc protrusion.

6. TREATMENT COURSE AND FAILED CONSERVATIVE CARE
Ms. Quinonez underwent extensive nonoperative management:
• Physical therapy, chiropractic care, and massage therapy
• NSAIDs and muscle relaxants
• Multiple facet medial branch blocks (Genesis)
• L5–S1 interlaminar ESI (Genesis, 11/29/21)
• Right L5–S1 transforaminal ESI (NeoSpine, 5/18/23)
Quoted record evidence: “She reports having 2 weeks of relief… but pain returned to baseline.”
This demonstrates temporary steroid response confirming the anatomical target, but persistent mechanical structural pathology.

7. SPECIALIST EVALUATION AND SURGICAL RECOMMENDATION
NeoSpine – Dr. A. Alex Mohit (4/19/23 and 6/21/23)
Clinical Findings: Lumbar HNP at L5–S1, lumbar spondylosis, cervical spondylosis with radiculopathy, persistent radicular symptoms despite 3 years of nonoperative care.
Surgical Recommendations: Right L5–S1 lumbar microdiscectomy and C5–6 disc replacement.
Quoted record evidence: “She understands all these issues and would like to go ahead with a right-sided L5–S1 lumbar microdiscectomy and C5–6 disc replacement.”

8. SUPPORT FOR CAUSATION OPINIONS (DECLARATIONS)
My declarations state that the following conditions were previously asymptomatic and were caused or “lit up” by the June 15, 2020 collision:
1. L5–S1 herniated disc with radiculopathy
2. Cervical spondylosis with radiculopathy
3. Lumbar spondylosis
Record support for previously asymptomatic status: 7 years of prior records (2013–2020) show zero prior cervical or lumbar radiculopathy, zero disc herniation, and zero chronic spine pain.
Record support for collision causation: Immediate onset of cervical symptoms, progressive concordant lumbar radiculopathy, objective MRI impingement, EMG radiculopathy, and failure of conservative management.

9. PEER-REVIEWED MEDICAL LITERATURE SUPPORT
Clark R et al. Surgical Management of Lumbar Radiculopathy: A Systematic Review. J Gen Intern Med. 2020;35(3):855–864: Confirms that surgery for lumbar radiculopathy produces superior short-to-medium-term pain relief and functional improvement compared to nonsurgical care in patients with persistent radicular symptoms and concordant imaging.
European Association of Neurosurgical Societies (EANS) Disc Herniation Guidelines: Affirms surgical decompression as standard of care for persistent, disabling radicular pain with imaging correlation after failure of 6-12 weeks of nonoperative therapy.`;

  return {
    id: 'case-quinonez-mva',
    caseName: 'Quinonez v. Striking Driver (MVA Spine Injury)',
    caseNumber: '23-2-08941-WA',
    courtJurisdiction: 'Superior Court of Washington, Pierce County',
    patientName: 'Holly Quinonez',
    patientAge: 36,
    patientSex: 'Female',
    retainingCounsel: 'Williamson & Mercer, PLLC',
    lawFirm: 'Pacific Northwest Injury Law Group',
    retainingSide: 'PLAINTIFF',
    dateOfIncident: '2020-06-15',
    allegationsSummary: 'Motor vehicle collision on 06/15/2020 caused previously asymptomatic cervical and lumbar pathology to become acutely symptomatic ("lit up"), resulting in right L5-S1 disc protrusion with L5 radiculopathy and cervical foraminal stenosis requiring surgical decompression.',
    documents: [
      {
        id: 'doc-quin-1',
        fileName: 'Franciscan_Medical_Group_Initial_Encounter.pdf',
        fileSize: 1840000,
        fileType: 'application/pdf',
        uploadedAt: '2020-06-24T09:00:00Z',
        pageCount: 12,
        batesPrefix: 'REC-',
        batesStartNumber: 1,
        batesEndNumber: 12,
        rawTextByPage: [
          { page: 1, bates: 'REC-00001', text: 'MVA 6/15/2020: Restrained driver rear-ended at 25mph while turned right to parallel park. Immediate neck pain, L shoulder/clavicle, R middle finger pain.' },
          { page: 5, bates: 'REC-00005', text: 'Franciscan 6/23/20: Severely restricted cervical ROM in all directions. Tingling down neck on L side to arm.' }
        ]
      },
      {
        id: 'doc-quin-2',
        fileName: 'TRA_MRI_Lumbar_and_Cervical_Reports.pdf',
        fileSize: 2450000,
        fileType: 'application/pdf',
        uploadedAt: '2023-02-08T10:00:00Z',
        pageCount: 16,
        batesPrefix: 'REC-',
        batesStartNumber: 13,
        batesEndNumber: 28,
        rawTextByPage: [
          { page: 24, bates: 'REC-00024', text: 'EMA EMG 11/8/2022: Abnormal study. Right subacute L5 radiculopathy.' },
          { page: 31, bates: 'REC-00031', text: 'TRA Lumbar MRI 2/7/2023: Small right-sided L5-S1 disc protrusion impinging right L5 nerve root. Moderate foraminal stenosis.' },
          { page: 33, bates: 'REC-00033', text: 'TRA Cervical MRI 2/7/2023: Severe right C3-C4 and moderate right C5-C6 neuroforaminal stenosis.' }
        ]
      },
      {
        id: 'doc-quin-3',
        fileName: 'NeoSpine_Dr_Alex_Mohit_Clinic_Notes.pdf',
        fileSize: 3100000,
        fileType: 'application/pdf',
        uploadedAt: '2023-06-22T11:00:00Z',
        pageCount: 24,
        batesPrefix: 'REC-',
        batesStartNumber: 29,
        batesEndNumber: 52,
        rawTextByPage: [
          { page: 42, bates: 'REC-00042', text: 'NeoSpine Consult 4/19/2023: Failed 3 years conservative therapy. Weakness right anterior thigh, foot tingling, cannot sit >10 mins.' },
          { page: 47, bates: 'REC-00047', text: 'NeoSpine TFESI 5/18/2023: Targeted R L5-S1 injection confirms pain generator.' },
          { page: 52, bates: 'REC-00052', text: 'NeoSpine Surgical Plan 6/21/2023: Recommended right L5-S1 microdiscectomy and C5-C6 disc replacement.' }
        ]
      }
    ],
    vitals: [
      {
        id: 'quin-vit-1',
        timestamp: '2020-06-23T10:15:00Z',
        timeDisplay: '10:15',
        sbp: 122,
        dbp: 78,
        map: 93,
        hr: 72,
        providerNote: 'Franciscan Initial Encounter: Normal baseline vitals, severe cervical distress on exam.',
        pageNumber: 5,
        batesNumber: 'REC-00005'
      }
    ],
    medications: [
      {
        id: 'quin-med-1',
        drugName: 'Cyclobenzaprine (Flexeril)',
        dose: '10 mg PO TID PRN',
        route: 'Oral',
        startTimestamp: '2020-06-23T10:15:00Z',
        administeredBy: 'Prescribing Physician',
        status: 'administered',
        pageNumber: 5,
        batesNumber: 'REC-00005',
        indicationNotes: 'Acute cervical muscular spasm post-MVA.'
      },
      {
        id: 'quin-med-2',
        drugName: 'Methylprednisolone (Medrol Dosepak)',
        dose: '4 mg Dosepak',
        route: 'Oral',
        startTimestamp: '2021-11-29T11:00:00Z',
        administeredBy: 'Interventional Clinic',
        status: 'administered',
        pageNumber: 18,
        batesNumber: 'REC-00018',
        indicationNotes: 'Acute radiculopathy anti-inflammatory pulse.'
      }
    ],
    milestones,
    plaintiffBreaches: [
      {
        id: 'quin-br-1',
        title: 'Traumatic Disc Disruption via Collision Force',
        allegation: 'Striking vehicle impacted stopped vehicle at 25 mph without braking, imposing torsional axial shear that ruptured the L5-S1 annulus and activated dormant cervical stenosis.',
        standardOfCareRule: 'Drivers owe a duty of reasonable care to maintain safe following distance and avoid rear-end collisions.',
        deviationEvidence: 'Police traffic collision report and vehicle damage photos confirm rear-end impact without pre-impact braking while plaintiff was rotated to right.',
        proximateCausationAnalysis: 'More likely than not, the collision was the direct proximate cause converting an asymptomatic 36-year-old spine into a chronic, disabling surgical condition.',
        contributingProviders: ['Striking Motorist (Defendant)'],
        batesCitations: ['REC-00001', 'REC-00005', 'REC-00031'],
        severity: 'CRITICAL_BREACH'
      }
    ],
    defenseAnchors: [
      {
        id: 'quin-anc-1',
        title: 'Prior Asymptomatic Status Across 7-Year Pre-Collision Audit',
        defenseTheme: '"Lit up" traumatic aggravation of non-disabling anatomical variation.',
        clinicalRational: 'Pre-existing asymptomatic degenerative disc disease does not preclude traumatic injury. MultiCare and Franciscan records (2013-2020) prove zero prior spine complaints or limitations.',
        complianceWithGuidelines: 'Complies with Washington Pattern Jury Instruction 30.17 (Eggshell Skull / Aggravation of Preexisting Condition).',
        preExistingConfounders: 'Underlying silent radiographic stenosis existed, but was rendered acutely symptomatic by rotational shear forces.',
        supportingDocumentation: 'Complete absence of pre-collision cervical or lumbar treatment across 7 years of prior healthcare records.',
        batesCitations: ['Prior Medical Records 2013-2020 (Exhibit B)'],
        strength: 'IRONCLAD'
      }
    ],
    synopsisExecutive: 'Matter of Holly Quinonez: Restrained 36-year-old driver rear-ended at 25 mph on 06/15/2020 while parallel parking with head turned right. Developed immediate cervical strain and progressive right L5 radiculopathy. Objective TRA MRI confirms L5-S1 disc protrusion impinging right L5 nerve root and severe C3-C4/C5-C6 foraminal stenosis; EMA EMG confirms right subacute L5 radiculopathy. Following failed 3-year conservative trial (PT, chiropractic, MBBs, TFESI), surgical recommendations for L5-S1 microdiscectomy and C5-C6 disc replacement are medically necessary, evidence-based (Clark et al. 2020), and causally related.',
    synopsisNarrative,
    standardOfCareDetermination: 'MET',
    causationOpinion: 'Within a reasonable degree of medical probability, the June 15, 2020 collision caused previously asymptomatic cervical and lumbar pathology to become acutely symptomatic ("lit up"). The patient’s persistent radicular symptoms are corroborated by objective MRI nerve root impingement, objective EMG radiculopathy, and concordant TFESI relief. Surgical intervention is medically reasonable, necessary, and related to the collision.',
    depositionPrep,
    generatedArtifacts: [
      {
        id: 'art-quin-1',
        title: '20-Slide Forensic Courtroom Presentation (Quinonez Spine Causation)',
        type: 'PPTX_PRESENTATION',
        fileName: 'ForensicReview_Quinonez_Spine_Injury_20Slide_Deck.pptx',
        createdAt: new Date().toISOString(),
        fileSize: '1.4 MB',
        description: 'Complete 20-slide courtroom presentation with 3-year timeline, MRI nerve root impingement, EMG correlation, and 10 defense attack disproofs.',
        pageCountOrSlides: 20
      }
    ],
    lastModified: new Date().toISOString()
  };
}

