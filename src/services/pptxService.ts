import pptxgenjs from 'pptxgenjs';
import { MedicolegalCaseAnalysis } from '../types/medicolegal';

export async function exportCaseToPowerPoint(caseData: MedicolegalCaseAnalysis): Promise<string> {
  const pptx = new pptxgenjs();
  pptx.layout = 'LAYOUT_16x9';

  const brandNavy = '0F294A';
  const brandBlue = '1E40AF';
  const slateDark = '1E293B';
  const slateLight = 'F8FAFC';
  const textMuted = '64748B';
  const borderLight = 'E2E8F0';

  // Slide 1: Master Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: slateLight };

  titleSlide.addText('FORENSIC MEDICICAL RECORD REVIEW & CAUSATION', {
    x: 0.8,
    y: 1.5,
    w: 11.5,
    h: 0.5,
    fontSize: 14,
    fontFace: 'Arial',
    color: brandBlue,
    bold: true,
    charSpacing: 2
  });

  titleSlide.addText(caseData.patientInfo.caseCaption, {
    x: 0.8,
    y: 2.1,
    w: 11.5,
    h: 1.2,
    fontSize: 28,
    fontFace: 'Arial',
    color: brandNavy,
    bold: true
  });

  titleSlide.addText(`Patient: ${caseData.patientInfo.patientName} | Incident Date: ${caseData.patientInfo.dateOfIncident}`, {
    x: 0.8,
    y: 3.5,
    w: 11.5,
    h: 0.4,
    fontSize: 14,
    fontFace: 'Arial',
    color: textMuted
  });

  titleSlide.addText(`Retaining Counsel: ${caseData.patientInfo.retainingCounsel || 'Counsel of Record'}`, {
    x: 0.8,
    y: 4.0,
    w: 11.5,
    h: 0.4,
    fontSize: 13,
    fontFace: 'Arial',
    color: textMuted
  });

  // Footer on Title
  titleSlide.addText('CONFIDENTIAL EXPERT CONSULTATION EXHIBIT — PREPARED FOR COURTROOM & DEPOSITION', {
    x: 0.8,
    y: 6.5,
    w: 11.5,
    h: 0.3,
    fontSize: 9,
    fontFace: 'Arial',
    color: textMuted,
    italic: true
  });

  // Slide 2: Causation Determination & Medical Opinion
  const opinionSlide = pptx.addSlide();
  opinionSlide.background = { color: 'FFFFFF' };

  opinionSlide.addText('EXPERT CAUSATION OPINION & STANDARD OF CARE', {
    x: 0.8,
    y: 0.6,
    w: 11.5,
    h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    color: brandBlue,
    bold: true
  });

  opinionSlide.addText('Formal Opinion Within A Reasonable Degree of Medical Probability', {
    x: 0.8,
    y: 1.1,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    color: brandNavy,
    bold: true
  });

  // Opinion Callout Card
  opinionSlide.addShape('roundRect' as any, {
    x: 0.8,
    y: 1.8,
    w: 11.7,
    h: 2.2,
    fill: { color: 'F1F5F9' },
    line: { color: brandBlue, width: 2 }
  });

  opinionSlide.addText(caseData.deliverable2_causation.formalMedicalOpinion, {
    x: 1.1,
    y: 2.0,
    w: 11.1,
    h: 1.8,
    fontSize: 14,
    fontFace: 'Arial',
    color: slateDark,
    bold: true,
    lineSpacing: 22
  });

  // Eggshell Skull Legal Analysis
  opinionSlide.addText('Washington Pattern Jury Instruction 30.17 (Eggshell Skull / Aggravation):', {
    x: 0.8,
    y: 4.3,
    w: 11.5,
    h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    color: brandNavy,
    bold: true
  });

  opinionSlide.addText(caseData.deliverable2_causation.eggshellSkullAnalysis, {
    x: 0.8,
    y: 4.7,
    w: 11.5,
    h: 1.6,
    fontSize: 12,
    fontFace: 'Arial',
    color: slateDark,
    lineSpacing: 18
  });

  // Slides 3 to N: Clinical Record Excerpt Slides
  const slides = caseData.deliverable4_presentationSlides;
  slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Slide Header Pill
    slide.addText(`EXHIBIT SLIDE ${idx + 1} OF ${slides.length} — MEDICAL RECORD EVIDENCE`, {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: brandBlue,
      bold: true
    });

    // Date of Note Badge (Required by Dr. Mohit)
    slide.addShape('roundRect' as any, {
      x: 9.2,
      y: 0.45,
      w: 3.3,
      h: 0.5,
      fill: { color: 'EFF6FF' },
      line: { color: brandBlue, width: 1 }
    });

    slide.addText(`DATE OF NOTE: ${s.dateOfNote}`, {
      x: 9.2,
      y: 0.48,
      w: 3.3,
      h: 0.4,
      fontSize: 11,
      fontFace: 'Arial',
      color: brandBlue,
      bold: true,
      align: 'center'
    });

    // Slide Title
    slide.addText(s.slideTitle, {
      x: 0.8,
      y: 0.9,
      w: 11.5,
      h: 0.6,
      fontSize: 20,
      fontFace: 'Arial',
      color: brandNavy,
      bold: true
    });

    // Provider / Facility Subtitle
    slide.addText(`Authoring Facility: ${s.clinicOrDoctor}`, {
      x: 0.8,
      y: 1.5,
      w: 11.5,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Arial',
      color: textMuted
    });

    // Main Quote Box: Important Verbatim Excerpt from Medical Records (Required by Dr. Mohit)
    slide.addShape('roundRect' as any, {
      x: 0.8,
      y: 2.0,
      w: 11.7,
      h: 2.8,
      fill: { color: 'F8FAFC' },
      line: { color: borderLight, width: 1.5 }
    });

    slide.addText('EXACT VERBATIM EXCERPT FROM MEDICAL RECORD:', {
      x: 1.2,
      y: 2.2,
      w: 10.9,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: brandBlue,
      bold: true
    });

    slide.addText(s.verbatimExcerpt, {
      x: 1.2,
      y: 2.6,
      w: 10.9,
      h: 1.9,
      fontSize: 15,
      fontFace: 'Georgia',
      color: brandNavy,
      italic: true,
      lineSpacing: 22
    });

    // Clinical Significance Box
    slide.addShape('roundRect' as any, {
      x: 0.8,
      y: 5.0,
      w: 11.7,
      h: 1.6,
      fill: { color: 'ECFDF5' },
      line: { color: '10B981', width: 1 }
    });

    slide.addText('FORENSIC & CLINICAL SIGNIFICANCE:', {
      x: 1.2,
      y: 5.15,
      w: 10.9,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: '047857',
      bold: true
    });

    slide.addText(s.clinicalSignificance, {
      x: 1.2,
      y: 5.45,
      w: 10.9,
      h: 1.0,
      fontSize: 13,
      fontFace: 'Arial',
      color: slateDark,
      lineSpacing: 18
    });
  });

  const fileName = `ForensicReview_${caseData.patientInfo.patientName.replace(/\s+/g, '_')}_Presentation.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
}
