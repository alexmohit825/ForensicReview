# ForensicReview — Medicolegal Forensic & Standard of Care Workstation

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Electron](https://img.shields.io/badge/Electron-44.4-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/License-Proprietary%202026-blue.svg)]()

> Designed and engineered for **Dr. A. Alex Mohit, MD, PhD** — Board-Certified Neurosurgeon & Forensic Medicolegal Expert.

---

## 🏛 Overview & Purpose

**ForensicReview** is a specialized PC workstation application built to analyze complex, unstructured medical record bundles (PDFs, text dictations, nursing flowsheets, telemetry strips, EHR exports) for medicolegal casework.

The system addresses the primary challenge faced by medical expert witnesses: untangling thousands of unindexed, out-of-order hospital pages into an objective, chronological, evidentiary timeline, determining whether the **Standard of Care (SoC)** was met, and formulating unassailable expert witness opinions.

---

## 📁 Multi-Case Directory & Patient Artifact Archives

ForensicReview enables managing multiple active legal cases simultaneously while keeping all patient files completely isolated:
* **Physician Case Directory:** Switch between active matters with a single click. Each case preserves its own independent medical records, Bates stamping, hemodynamic charts, legal opinions, and generated presentations.
* **Patient Artifact Archive:** Every 20-slide PowerPoint (`.pptx`), formal expert disclosure, and itemized timeline table generated is archived directly under the patient's case profile with version timestamps and instant re-download buttons.
* **Complete Case Purge:** When a case is closed or settled, 1-click **"Delete Case & Permanently Purge"** removes all associated medical records, parsed pages, Bates indexes, and presentations with zero residual trace of patient PHI.

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

## 🖨️ Independent Exhibit Printing

Print individual sections completely independently without exporting the full master report:
1. **Independent Clinical Synopsis & SoC Opinion:** Prints the case caption, standard of care finding, executive summary, chronological narrative, causation opinion, and Dr. Mohit's signature attestation.
2. **Independent Graphic Timeline:** Prints the high-contrast Hemodynamic Trajectory Curve (SBP, DBP, MAP, HR, shock thresholds) and MAR summary table.
3. **Independent Timeline Table:** Prints an itemized minute-by-minute chronological care ledger table cross-referenced with exact Bates numbers.

---

## 📊 Core Architectural Features

### 1. Multi-Track Graphic & Chart Timeline
* **Track 1 (Hemodynamics Curve):** Plotted systolic blood pressure (SBP), diastolic blood pressure (DBP), pulse pressure envelope, and Mean Arterial Pressure (MAP) with visual dashed warning thresholds for shock ($MAP < 65\text{ mmHg}$) and hypertensive crisis ($SBP > 180\text{ mmHg}$).
* **Track 2 (Medication Administration Record - MAR):** Gantt bars depicting ordered vs. administered timestamps, blackout intervals, delayed antibiotics, and titration curves.
* **Track 3 (Clinical Milestones):** Triage, bedside physician evaluations, diagnostic imaging reads, OR incisions, and transfers.
* **Track 4 (Medicolegal Stance Layer):** Red breach diamonds (Plaintiff) or Blue clinical judgment shields (Defense) pinned to exact moments in time.

### 2. 20-Slide Courtroom PowerPoint Presentation
* Generates an automated, courtroom-ready 16:9 widescreen PowerPoint deck with clinical milestones, vital curves, opposing counsel assertions, chart rebuttals, standard of care findings, and speaker notes.
* Real-time auto-synchronization whenever new records are entered into the app.

### 3. Synchronized Bates Split-Screen Inspector
* Every milestone, vital sign reading, and legal allegation links directly to its underlying **Bates-numbered document page** (e.g. `REC-00014`).
* 1-click drill-down opens the document viewer directly on the cited page.

---

## 🔒 Confidentiality & Zero Data Retention

* **Local Browser / PC Execution:** All PDF parsing, text extraction, Bates stamping, and local storage execute strictly on your workstation.
* **Zero Cloud Data Exposure:** Medical records never leave your local NVMe drive.
* **White Box Taskbar Icon:** Windows AppUserModelID registered for clean taskbar pinning.

---

## 🚀 Launching the Standalone Desktop Application

* Double-click the **`ForensicReview`** shortcut on your Windows Desktop or launch via the pinned Taskbar icon.
* Or launch via terminal:
  ```powershell
  npm run desktop --prefix C:\Users\mohal\Documents\antigravity\ForensicReview
  ```

---

## 📄 License & Attribution

Copyright © 2026 **A. Alex Mohit, MD, PhD**. All Rights Reserved.  
Proprietary medicolegal software system.
