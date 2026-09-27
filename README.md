# ForensicReview — AI Medicolegal Workstation

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini 2.5 Pro](https://img.shields.io/badge/Google%20Gemini-2.5%20Pro-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Proprietary%202026-blue.svg)]()

> Designed and engineered for **Dr. A. Alex Mohit, MD, PhD** — Board-Certified Neurosurgeon & Forensic Medicolegal Expert.

---

## 🏛 Purpose & Architecture

**ForensicReview** is an AI-powered medicolegal workstation built to read, analyze, and synthesize complex medical record bundles into 5 courtroom deliverables:

1. **Clinical Records Summary:** Comprehensive executive clinical overview, HPI, objective diagnostic imaging scans (MRI/CT/EMG), physical exams, and treatment course.
2. **Causation Determination & Opinion:** Formal sworn medical probability opinion, Washington Pattern Jury Instruction 30.17 (Eggshell Skull / Aggravation of Asymptomatic Pre-Existing Anatomy), and biomechanical annular shear forces.
3. **Timeline (Graphic Flowchart & Table):** Chronological encounter sequence with downward arrows ($\downarrow$) and standardized 3-column table (`[Date]` | `[Clinic Visit / Facility]` | `[One-Sentence Description of Visit]`).
4. **PowerPoint Presentation (.pptx):** Evidence slide deck featuring crucial verbatim medical record excerpts in quotation marks, date of the note, authoring doctor, and 1-click `.pptx` download.
5. **Literature Support List:** 5 curated, peer-reviewed clinical articles directly substantiating the causation opinion, with key finding callouts and direct PubMed links.

---

## ⚡ Deployment & Privacy

* **Runs on GitHub Pages, Cloudflare Pages, or Local Browser:** The application is a static client-side SPA. Assets are built into `/dist`.
* **Zero Intermediary Server / HIPAA Isolation:** Medical records travel directly via encrypted HTTPS from your browser to Google Gemini's zero-retention enterprise API endpoint.
* **Local API Key Storage:** Your Gemini API key (`AQ...` or `AIza...`) is saved strictly in your private browser `localStorage` on your machine.
