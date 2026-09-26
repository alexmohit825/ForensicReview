# ForensicReview — Medicolegal Forensic & Standard of Care Workstation

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary%202026-blue.svg)]()

> Designed and engineered for **Dr. A. Alex Mohit, MD, PhD** — Board-Certified Neurosurgeon & Forensic Medicolegal Expert.

---

## 🏛 Overview & Purpose

**ForensicReview** is a specialized PC workstation application built to analyze complex, unstructured medical record bundles (PDFs, text dictations, nursing flowsheets, telemetry strips, EHR exports) for medicolegal casework.

The system addresses the primary challenge faced by medical expert witnesses: untangling thousands of unindexed, out-of-order hospital pages into an objective, chronological, evidentiary timeline, determining whether the **Standard of Care (SoC)** was met, and formulating unassailable expert witness opinions.

---

## ⚖️ The "Stance Pivot" (Dual-Perspective Forensic Engine)

ForensicReview features a prominent, tactile bi-modal stance switch:

```
                          ┌──────────────────────────────┐
                          │   Ingested Medical Record    │
                          │   (Multi-Bundle Bates Set)   │
                          └──────────────┬───────────────┘
                                         │
                      ┌──────────────────┴──────────────────┐
                      ▼                                     ▼
           [PLAINTIFF EXPERT LENS]                [DEFENSE EXPERT LENS]
      • Standard of Care Deviations          • Reasoned Clinical Judgment
      • Failure-to-Rescue & Delays           • Recognized Known Complications
      • Unaddressed Critical Values          • Confounding Comorbidities
      • Protocol Violations / Gaps           • Prevailing Guideline Compliance
      • Proximate Causation to Harm          • Alternative Non-Negligent Causes
```

When toggled:
* **Defense Mode:** Emphasizes documented clinical judgment, signed informed consents, pre-existing patient disease, and adherence to prevailing practice guidelines.
* **Plaintiff Mode:** Highlights departures from prevailing medical guidelines, delays in escalation, diagnostic anchoring errors, and direct proximate causation links to patient harm.

---

## 📊 Core Architectural Features

### 1. Multi-Track Graphic & Chart Timeline
* **Track 1 (Hemodynamics Curve):** Plotted systolic blood pressure (SBP), diastolic blood pressure (DBP), pulse pressure envelope, and Mean Arterial Pressure (MAP) with visual dashed warning thresholds for shock ($MAP < 65\text{ mmHg}$) and hypertensive crisis ($SBP > 180\text{ mmHg}$).
* **Track 2 (Medication Administration Record - MAR):** Gantt bars depicting ordered vs. administered timestamps, blackout intervals, delayed antibiotics, and titration curves.
* **Track 3 (Clinical Milestones):** Triage, bedside physician evaluations, diagnostic imaging reads, OR incisions, and transfers.
* **Track 4 (Medicolegal Stance Layer):** Red breach diamonds (Plaintiff) or Blue clinical judgment shields (Defense) pinned to exact moments in time.

### 2. Synchronized Bates Split-Screen Inspector
* Every milestone, vital sign reading, and legal allegation links directly to its underlying **Bates-numbered document page** (e.g. `REC-00014`).
* 1-click drill-down opens the document viewer directly on the cited page.

### 3. Interactive Section-by-Section Forensic Protocol Guide
* Built-in, toggleable guide drawer and collapsible quick-tip ribbons across every section:
  1. **Medical Record Ingestion & Bates Verification Guide**
  2. **Multi-Track Graphic & Chart Timeline Guide**
  3. **Medication Administration Record (MAR) Forensic Guide**
  4. **Dual-Stance Pivot & Legal Argumentation Guide**
  5. **Standard of Care Opinion & Synopsis Guide**
  6. **Hostile Deposition & Cross-Examination Simulator Guide**

### 4. Adversarial Deposition / Cross-Examination Simulator
* Generates the hostile attack matrix opposing counsel will deploy during deposition or trial.
* Provides strategic rebuttal phrasing and exact documentary citations to defend expert opinions.

### 5. Court-Ready Expert Disclosure Export
* Exports a formatted, formal Rule 26 style expert witness report with case caption, legal qualifications, itemized record index, standard of care findings, and Dr. Mohit's signature block.
* Native browser print stylesheet (`@media print`) enables clean export to PDF or physical court exhibits.

---

## 🔒 Confidentiality & Zero Data Retention

* **Local Browser / PC Execution:** All PDF parsing, text extraction, Bates stamping, and local storage execute strictly on the user's workstation.
* **Zero Sandbox Filler on Boot:** Boots into a pristine, unpopulated state ready for immediate case ingestion.
* **Benchmark Reference Case Included:** Optional 1-click load of a high-acuity teaching file (*Acute Stanford Type A Thoracic Aortic Dissection*) for demonstrations and forensic methodology training.

---

## 🚀 Quickstart & Local Development

### Prerequisites
* Node.js v20+ or v24+
* npm v10+

### Installation & Launch
```bash
# Clone the repository
git clone https://github.com/alexmohit825/ForensicReview.git
cd ForensicReview

# Install dependencies
npm install

# Launch local development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 📄 License & Attribution

Copyright © 2026 **A. Alex Mohit, MD, PhD**. All Rights Reserved.  
Proprietary medicolegal software system.
