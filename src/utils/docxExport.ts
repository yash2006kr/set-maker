import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Footer,
  PageNumber,
} from 'docx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import type { GeneratedSet, ExamPaper, AnswerKeyEntry } from '../types';

/**
 * Strips HTML tags from rich-text strings for plain-text word export
 */
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Builds a docx Document for a single GeneratedSet
 */
export function createDocxForSet(set: GeneratedSet): Document {
  const { header } = set.paper;
  const children: (Paragraph | Table)[] = [];

  // 1. Institution Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: (header.institutionName || 'INSTITUTION NAME').toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: 'Times New Roman',
        }),
      ],
    })
  );

  if (header.departmentName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: header.departmentName,
            italics: true,
            size: 24, // 12pt
            font: 'Times New Roman',
          }),
        ],
      })
    );
  }

  // 2. Exam Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
      children: [
        new TextRun({
          text: header.examTitle || 'EXAMINATION PAPER',
          bold: true,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    })
  );

  // 3. Metadata Table (Course Code, Course Name, Duration, Max Marks, Set Code)
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Course: ', bold: true, font: 'Times New Roman', size: 22 }),
                new TextRun({
                  text: `${header.courseCode ? header.courseCode + ' - ' : ''}${header.courseName || ''}`,
                  font: 'Times New Roman',
                  size: 22,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `[ ${set.setCode.toUpperCase()} ]`,
                  bold: true,
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              spacing: { after: 120 },
              children: [
                new TextRun({ text: 'Duration: ', bold: true, font: 'Times New Roman', size: 22 }),
                new TextRun({ text: header.duration || '3 Hours', font: 'Times New Roman', size: 22 }),
                new TextRun({ text: '    Date: ', bold: true, font: 'Times New Roman', size: 22 }),
                new TextRun({ text: header.date || '', font: 'Times New Roman', size: 22 }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { after: 120 },
              children: [
                new TextRun({ text: 'Maximum Marks: ', bold: true, font: 'Times New Roman', size: 22 }),
                new TextRun({ text: String(header.maxMarks || 100), bold: true, font: 'Times New Roman', size: 22 }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: metaRows,
    })
  );

  // 4. General Instructions
  if (header.generalInstructions && header.generalInstructions.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 180, after: 60 },
        children: [
          new TextRun({
            text: 'General Instructions:',
            bold: true,
            italics: true,
            font: 'Times New Roman',
            size: 22,
          }),
        ],
      })
    );

    header.generalInstructions.forEach((inst, i) => {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          indent: { left: 360 },
          children: [
            new TextRun({
              text: `${i + 1}. ${inst}`,
              font: 'Times New Roman',
              size: 20,
            }),
          ],
        })
      );
    });
  }

  // Divider space
  children.push(
    new Paragraph({
      spacing: { before: 120, after: 120 },
      children: [],
    })
  );

  // 5. Sections and Questions
  let questionCounter = 1;

  for (const section of set.paper.sections) {
    // Section Header
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 60 },
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            underline: {},
            font: 'Times New Roman',
            size: 24,
          }),
        ],
      })
    );

    // Section Instructions
    if (section.instructions) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: section.instructions,
              italics: true,
              font: 'Times New Roman',
              size: 20,
            }),
          ],
        })
      );
    }

    // Questions in this section
    for (const question of section.questions) {
      const qNum = questionCounter++;
      const cleanStem = stripHtml(question.stem);

      // Question paragraph with marks on right
      children.push(
        new Paragraph({
          spacing: { before: 140, after: 80 },
          children: [
            new TextRun({
              text: `Q${qNum}. `,
              bold: true,
              font: 'Times New Roman',
              size: 22,
            }),
            new TextRun({
              text: cleanStem,
              font: 'Times New Roman',
              size: 22,
            }),
            new TextRun({
              text: `  [${question.marks} ${question.marks === 1 ? 'Mark' : 'Marks'}]`,
              bold: true,
              font: 'Times New Roman',
              size: 20,
            }),
          ],
        })
      );

      // MCQ Options
      if (question.type === 'mcq' && question.options && question.options.length > 0) {
        // Layout options cleanly (e.g. 2 options per line or stacked)
        for (const opt of question.options) {
          children.push(
            new Paragraph({
              spacing: { after: 60 },
              indent: { left: 720 },
              children: [
                new TextRun({
                  text: `(${opt.label}) `,
                  bold: true,
                  font: 'Times New Roman',
                  size: 21,
                }),
                new TextRun({
                  text: stripHtml(opt.text),
                  font: 'Times New Roman',
                  size: 21,
                }),
              ],
            })
          );
        }
      } else if (question.type === 'short_answer' || question.type === 'long_answer') {
        // Optional spacing / blank space for answer
        children.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [],
          })
        );
      }
    }
  }

  // Create docx document
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${header.courseCode || 'Exam'} - ${set.setCode} | Page `,
                    font: 'Times New Roman',
                    size: 18,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Times New Roman',
                    size: 18,
                  }),
                  new TextRun({
                    text: ' of ',
                    font: 'Times New Roman',
                    size: 18,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'Times New Roman',
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

/**
 * Builds an Answer Key & Permutation Cross-Reference DOCX document
 */
export function createAnswerKeyDocx(sets: GeneratedSet[], masterPaper: ExamPaper): Document {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: (masterPaper.header.institutionName || 'INSTITUTION').toUpperCase(),
          bold: true,
          size: 30,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
      children: [
        new TextRun({
          text: `EVALUATOR ANSWER KEY & CROSS-SET SHUFFLE MATRIX`,
          bold: true,
          size: 26,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  // Table header: Original Q#, Question Summary, then Set A Q# & Ans, Set B Q# & Ans...
  const tableHeaders: TableCell[] = [
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: 'Master Q#', bold: true, size: 20 })] })],
    }),
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: 'Question Snippet', bold: true, size: 20 })] })],
    }),
  ];

  for (const set of sets) {
    tableHeaders.push(
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: `${set.setCode} Q# & Key`, bold: true, size: 20 })] })],
      })
    );
  }

  const tableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: tableHeaders,
    }),
  ];

  // Flatten questions from master paper
  let masterCount = 1;
  for (const section of masterPaper.sections) {
    for (const q of section.questions) {
      const qNum = masterCount++;
      const snippet = stripHtml(q.stem).slice(0, 45) + (q.stem.length > 45 ? '...' : '');

      const cells: TableCell[] = [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: `Q${qNum}`, bold: true, size: 19 })] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: snippet, size: 19 })] })],
        }),
      ];

      for (const set of sets) {
        const perm = set.permutationMap[q.id];
        const ansEntry = set.answerKeys.find((a: AnswerKeyEntry) => a.originalQuestionNumber === qNum);
        const text = perm ? `Q${perm.newIndex}: ${ansEntry ? ansEntry.correctAnswer : 'N/A'}` : '-';

        cells.push(
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, size: 19 })] })],
          })
        );
      }

      tableRows.push(new TableRow({ children: cells }));
    }
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    })
  );

  return new Document({
    sections: [
      {
        children,
      },
    ],
  });
}

/**
 * Downloads a single GeneratedSet as a .docx file
 */
export async function downloadSetDocx(set: GeneratedSet): Promise<void> {
  const doc = createDocxForSet(set);
  const blob = await Packer.toBlob(doc);
  const filename = `${set.paper.header.courseCode || 'Exam'}_${set.setCode.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, filename);
}

/**
 * Bundles all sets and the Evaluator Answer Key matrix into a single .zip file
 */
export async function downloadAllSetsZip(sets: GeneratedSet[], masterPaper: ExamPaper): Promise<void> {
  const zip = new JSZip();

  // 1. Generate individual set DOCX files
  for (const set of sets) {
    const doc = createDocxForSet(set);
    const blob = await Packer.toBlob(doc);
    const filename = `${set.paper.header.courseCode || 'Exam'}_${set.setCode.replace(/\s+/g, '_')}.docx`;
    zip.file(filename, blob);
  }

  // 2. Generate Master Answer Key & Shuffle Matrix DOCX
  const matrixDoc = createAnswerKeyDocx(sets, masterPaper);
  const matrixBlob = await Packer.toBlob(matrixDoc);
  zip.file('Evaluator_Answer_Key_and_Shuffle_Matrix.docx', matrixBlob);

  // 3. Generate a plain text quick-reference cheat sheet
  let txtSummary = `=======================================================\n`;
  txtSummary += `${masterPaper.header.institutionName || 'EXAMINATION'}\n`;
  txtSummary += `${masterPaper.header.examTitle || 'EXAM'}\n`;
  txtSummary += `COURSE: ${masterPaper.header.courseCode} ${masterPaper.header.courseName}\n`;
  txtSummary += `GENERATED SETS: ${sets.map((s) => s.setCode).join(', ')}\n`;
  txtSummary += `=======================================================\n\n`;

  for (const set of sets) {
    txtSummary += `--- [ ${set.setCode} ANSWER KEY ] ---\n`;
    for (const key of set.answerKeys) {
      txtSummary += `Q${key.questionNumber} (Original Q${key.originalQuestionNumber}): ${key.correctAnswer}\n`;
    }
    txtSummary += `\n`;
  }

  zip.file('Answer_Keys_Quick_Reference.txt', txtSummary);

  // 4. Download Zip
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipName = `${masterPaper.header.courseCode || 'Exam'}_All_Shuffled_Sets.zip`;
  saveAs(zipBlob, zipName);
}
