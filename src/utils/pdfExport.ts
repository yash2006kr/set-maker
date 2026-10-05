import html2pdf from 'html2pdf.js';
import type { ExamPaper } from '../types';

/**
 * Downloads the given DOM element as a high-quality, clean A4 PDF file.
 * This completely avoids browser print headers/footers (zero localhost URL, zero title watermark).
 */
export async function downloadPaperAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const sanitizedFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const opt = {
    margin: [10, 12, 12, 12] as [number, number, number, number],
    filename: sanitizedFilename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4',
      orientation: 'portrait' as const,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      avoid: ['.page-break-avoid', '.question-card-item', '.exam-header-block'],
    },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF with html2pdf:', error);
    // Fallback: trigger sanitized browser print if html2pdf fails
    printCleanPaper(sanitizedFilename.replace(/\.pdf$/, ''));
  }
}

/**
 * Prints the exam paper using the browser print dialog with sanitized document title
 * and CSS margin: 0 to suppress browser default headers (date, website title) and
 * footers (localhost URL).
 */
export function printCleanPaper(cleanTitle: string): void {
  const originalTitle = document.title;
  try {
    document.title = cleanTitle;
    window.print();
  } finally {
    // Restore original title after a short delay so print preview picks up cleanTitle
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  }
}

/**
 * Helper to build a clean exam filename
 */
export function getExamFilename(paper: ExamPaper, setCode: string, ext = 'pdf'): string {
  const code = (paper.header.courseCode || 'Exam').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const set = setCode.trim().replace(/\s+/g, '_');
  const exam = (paper.header.examTitle || 'Paper')
    .trim()
    .slice(0, 30)
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${code}_${exam}_${set}.${ext}`;
}
