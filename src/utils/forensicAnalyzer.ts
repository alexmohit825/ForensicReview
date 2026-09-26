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
    depositionPrep: []
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
      timeDisplay: '07:10',
      category: 'ED_TRIAGE',
      title: 'Emergency Department Presentation',
      provider: 'Triage RN K. Patel',
      facilityDepartment: 'St. Jude Community Hospital ED',
      summary: '58-year-old male arrives via private auto with sudden-onset ripping interscapular back pain. Blood pressure 188/112 mmHg.',
      severity: 'critical',
      pageNumber: 2,
      batesNumber: 'REC-00002',
      plaintiffFlag: {
        isBreach: false,
        breachCategory: 'COMMUNICATION',
        argument: 'Triage properly assigned ESI Level 2, but provider did not evaluate for 45 minutes.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Triage timely documented full symptom profile and immediately initiated ECG protocol.'
      }
    },
    {
      id: 'ms-2',
      timestamp: '2024-03-12T07:55:00',
      timeDisplay: '07:55',
      category: 'PHYSICIAN_CONSULT',
      title: 'Attending Emergency Physician Bedside Evaluation',
      provider: 'Dr. Raymond Holt, MD (Emergency Medicine)',
      facilityDepartment: 'ED Acute Care Bay 4',
      summary: 'Initial differential diagnosis: Acute Coronary Syndrome (ACS) vs. Musculoskeletal Thoracic Spasm. ECG shows nonspecific ST changes; Troponin I negative (<0.01). Ordered Chest X-Ray and aspirin 324 mg.',
      severity: 'caution',
      pageNumber: 4,
      batesNumber: 'REC-00004',
      plaintiffFlag: {
        isBreach: true,
        breachCategory: 'MISDIAGNOSIS',
        argument: 'Failure to order immediate STAT CT Angiogram despite classic tearing/ripping pain radiation and severe hypertension, anchoring prematurely on ACS.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'ACS is 50-fold more prevalent than aortic dissection; physician appropriately ruled out ACS first with serial troponins and initiated beta-blocker labetalol.'
      }
    },
    {
      id: 'ms-3',
      timestamp: '2024-03-12T11:30:00',
      timeDisplay: '11:30',
      category: 'IMAGING',
      title: 'CT Angiogram Chest/Abdomen Ordered & Performed',
      provider: 'Dr. Raymond Holt, MD / Radiologist Dr. Elaine Wu, MD',
      facilityDepartment: 'CT Scanner 2',
      summary: 'CT Angiography completed 3 hours and 35 minutes after initial arrival. Findings: Acute Stanford Type A aortic dissection extending from aortic root to iliac bifurcation with true lumen compression.',
      severity: 'critical',
      pageNumber: 13,
      batesNumber: 'REC-00013',
      plaintiffFlag: {
        isBreach: true,
        breachCategory: 'DELAY',
        argument: 'Unreasonable 3.5-hour delay in ordering diagnostic CTA for a hallmark clinical presentation of acute aortic catastrophe.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'COMPLICATION_MANAGEMENT',
        argument: 'Patient renal insufficiency (Serum Cr 2.1 mg/dL) required point-of-care lab verification and IV hydration protocol prior to iodinated contrast load.'
      }
    },
    {
      id: 'ms-4',
      timestamp: '2024-03-12T13:15:00',
      timeDisplay: '13:15',
      category: 'PHYSICIAN_CONSULT',
      title: 'Cardiothoracic Surgery Consult & Transfer Request',
      provider: 'Dr. Marcus Vance, MD (Cardiothoracic Surgery)',
      facilityDepartment: 'Surgical Consult / Transfer Desk',
      summary: 'Community hospital lacks on-site perfusionist and emergency cardiopulmonary bypass team. Transfer request initiated to University Medical Center (42 miles away). Bed transfer delayed 2 hours 45 minutes.',
      severity: 'critical',
      pageNumber: 17,
      batesNumber: 'REC-00017',
      plaintiffFlag: {
        isBreach: true,
        breachCategory: 'COMMUNICATION',
        argument: 'Community hospital failed to maintain transfer agreements for emergent surgical dissections, leading to catastrophic delay.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'DOCUMENTED_JUDGMENT',
        argument: 'Attending physician promptly recognized institutional limitations and coordinated air transfer; bed delay was due to receiving facility ICU saturation.'
      }
    },
    {
      id: 'ms-5',
      timestamp: '2024-03-12T18:25:00',
      timeDisplay: '18:25',
      category: 'ADVERSE_EVENT',
      title: 'Hemodynamic Rupture & Cardiac Arrest',
      provider: 'Dr. Raymond Holt, MD / Code Team',
      facilityDepartment: 'ED Resuscitation Room 1',
      summary: 'Patient developed sudden hypotension, bradycardia, and PEA arrest secondary to retrograde aortic root rupture and hemopericardium / acute cardiac tamponade. Resuscitation unsuccessful; pronounced at 18:52.',
      severity: 'critical',
      pageNumber: 31,
      batesNumber: 'REC-00031',
      plaintiffFlag: {
        isBreach: true,
        breachCategory: 'DELAY',
        argument: 'Direct proximate causation: Each hour of delay in Stanford Type A repair increases mortality by 1-2% per hour. Timely diagnosis within 90 minutes would have resulted in >75% surgical survival probability.'
      },
      defenseFlag: {
        isDefenseAnchor: true,
        anchorCategory: 'COMORBIDITY_MASKING',
        argument: 'Stanford Type A dissection has a 30-day baseline mortality of 30-50% even with immediate repair. Retrograde root rupture occurred during active impulse control therapy.'
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
    depositionPrep
  };
}
