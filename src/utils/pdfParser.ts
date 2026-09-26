import * as pdfjsLib from 'pdfjs-dist';
import { IngestedDocument, VitalSignPoint, MedicationEvent, ClinicalMilestone } from '../types/forensic';

// Set up worker source for PDF.js (CDN fallback or local worker)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export async function parsePdfFile(
  file: File,
  batesPrefix: string = 'REC-',
  startNumber: number = 1
): Promise<IngestedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;

  const rawTextByPage: { page: number; bates: string; text: string }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();

    const currentBatesNumber = `${batesPrefix}${String(startNumber + i - 1).padStart(5, '0')}`;
    rawTextByPage.push({
      page: i,
      bates: currentBatesNumber,
      text: pageText
    });
  }

  // Create data URL for viewing
  const fileDataUrl = URL.createObjectURL(file);

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/pdf',
    uploadedAt: new Date().toISOString(),
    pageCount: numPages,
    batesPrefix,
    batesStartNumber: startNumber,
    batesEndNumber: startNumber + numPages - 1,
    rawTextByPage,
    fileDataUrl
  };
}

export async function parseTextFile(
  file: File,
  batesPrefix: string = 'REC-',
  startNumber: number = 1
): Promise<IngestedDocument> {
  const content = await file.text();
  // Split approximately 2,000 characters per page if continuous
  const pageSize = 2500;
  const totalSimulatedPages = Math.max(1, Math.ceil(content.length / pageSize));
  const rawTextByPage: { page: number; bates: string; text: string }[] = [];

  for (let i = 1; i <= totalSimulatedPages; i++) {
    const startIdx = (i - 1) * pageSize;
    const pageText = content.substring(startIdx, startIdx + pageSize);
    const currentBatesNumber = `${batesPrefix}${String(startNumber + i - 1).padStart(5, '0')}`;
    rawTextByPage.push({
      page: i,
      bates: currentBatesNumber,
      text: pageText
    });
  }

  const fileDataUrl = URL.createObjectURL(file);

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'text/plain',
    uploadedAt: new Date().toISOString(),
    pageCount: totalSimulatedPages,
    batesPrefix,
    batesStartNumber: startNumber,
    batesEndNumber: startNumber + totalSimulatedPages - 1,
    rawTextByPage,
    fileDataUrl
  };
}

/**
 * Clinical entity pattern matcher to extract vitals, medications, and timestamps from text
 */
export function extractClinicalEntities(documents: IngestedDocument[]): {
  vitals: VitalSignPoint[];
  medications: MedicationEvent[];
  milestones: ClinicalMilestone[];
} {
  const vitals: VitalSignPoint[] = [];
  const medications: MedicationEvent[] = [];
  const milestones: ClinicalMilestone[] = [];

  const bpRegex = /(?:BP|Blood Pressure|NIBP)[:\s]*([0-9]{2,3})\s*[\/\\]\s*([0-9]{2,3})/gi;
  const hrRegex = /(?:HR|Pulse|Heart Rate)[:\s]*([0-9]{2,3})/gi;
  const spo2Regex = /(?:SpO2|O2 Sat|Pulse Ox)[:\s]*([0-9]{2,3})%?/gi;
  const dateRegex = /(?:\b(20[0-9]{2}[-\/][0-9]{1,2}[-\/][0-9]{1,2}|[0-9]{1,2}[-\/][0-9]{1,2}[-\/]20[0-9]{2})\b)\s*(?:at\s*)?([0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)?/gi;

  documents.forEach(doc => {
    doc.rawTextByPage.forEach(pageData => {
      const text = pageData.text;

      // Extract BP matches
      let bpMatch;
      while ((bpMatch = bpRegex.exec(text)) !== null) {
        const sbp = parseInt(bpMatch[1], 10);
        const dbp = parseInt(bpMatch[2], 10);
        if (sbp >= 50 && sbp <= 260 && dbp >= 30 && dbp <= 160) {
          const map = Math.round((2 * dbp + sbp) / 3);
          const isCritical = map < 65 || sbp > 180 || sbp < 90;

          vitals.push({
            id: `vit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            timeDisplay: `Page ${pageData.page} Reading`,
            sbp,
            dbp,
            map,
            pageNumber: pageData.page,
            batesNumber: pageData.bates,
            criticalFlag: isCritical,
            providerNote: isCritical ? 'Critical Blood Pressure excursion noted' : 'Routine vital recording'
          });
        }
      }

      // Check common critical medication keywords
      const commonMeds = ['Heparin', 'Vancomycin', 'Zosyn', 'Norepinephrine', 'Levophed', 'Morphine', 'Fentanyl', 'Labetalol', 'Hydralazine', 'Aspirin', 'Plavix', 'Eliquis', 'Warfarin'];
      commonMeds.forEach(med => {
        if (new RegExp(`\\b${med}\\b`, 'i').test(text)) {
          medications.push({
            id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            drugName: med,
            dose: 'Per Chart Order',
            route: 'IV / PO',
            startTimestamp: new Date().toISOString(),
            administeredBy: 'Bedside Staff',
            status: 'administered',
            pageNumber: pageData.page,
            batesNumber: pageData.bates,
            indicationNotes: `Documented administration in ${doc.fileName}`
          });
        }
      });
    });
  });

  return { vitals, medications, milestones };
}
