# Set-Maker: Implementation & Architecture Plan

## Executive Overview
**Set-Maker** is a web-based question paper design and multi-set generation studio. It allows educators and examiners to compose well-structured, formatted examination papers inside a Word-like A4 canvas editor, and auto-generate multiple distinct, shuffled exam sets (e.g., Set A, Set B, Set C, Set D) with non-identical question sequences, consistent formatting, automated question renumbering, and dual-format export (**PDF** and **Microsoft Word .docx**).

---

## Technical Stack & Architectural Decisions

### 1. Frontend Core
- **Framework:** **React 19 + TypeScript** with **Vite**
  - Ultra-fast development server, strict type safety for complex document state trees, and high rendering performance.
- **Styling & UI Kit:** **Tailwind CSS** + **Lucide React** (for icons)
  - Provides a desktop-grade ribbon/toolbar interface, customizable A4 page canvas, responsive layouts, and print stylesheets.
- **Drag & Drop:** `@dnd-kit/core` and `@dnd-kit/sortable`
  - Accessible, smooth drag-and-drop reordering for questions and sections within the paper canvas.

### 2. Document Model & Editing Strategy
- **Hybrid Data Model:**
  - Standard rich text editors (like raw Quill or TinyMCE) treat the entire document as a single HTML string, making structured shuffling of questions, options, and section boundaries brittle.
  - **Set-Maker approach:** A **Structured JSON Document Model** where the exam is composed of typed nodes (`ExamHeader`, `Section`, `Question`, `Option`).
  - **Inline Rich Editing:** Individual text fields (Question stem, option choices, section instructions) support rich-text formatting (bold, italics, underline, sub/superscript, bullet lists, math/symbols) via lightweight `contenteditable` or a scoped rich-text instance.

### 3. Shuffling & Multi-Set Engine
- **Algorithm:** **Fisher–Yates (Knuth) Shuffle** with uniform random distribution ($O(N)$ complexity).
- **Section-Aware Permutation:**
  - Questions are shuffled **within** their respective sections/parts (e.g., Section A MCQs remain in Section A, Section B essay questions remain in Section B).
  - Maintains structural exam integrity (marks allocation, question difficulty distribution).
- **Uniqueness Guarantee:**
  - Shuffled sequences are validated against previously generated sets. If a collision occurs (identical sequence), reshuffling is performed until all generated sets are strictly distinct.
- **Optional Option Shuffling:** Configurable toggle to shuffle MCQ options (A, B, C, D) alongside question order.
- **Shuffle Matrix & Answer Key Generator:**
  - Produces an automated mapping matrix (e.g., `Set A Q3 -> Set B Q7`) and remapped answer keys for graders.

### 4. Export Engines
- **Microsoft Word (.docx):**
  - Built using the client-side **`docx`** library.
  - Generates native Word elements: document tables (institution header and marks grid), formatted paragraphs, indented option lists, page breaks, and running headers/footers with page numbers.
- **PDF Generation:**
  - **Primary (Native Print Engine):** High-precision CSS `@page` media query stylesheet tailored for standard A4 (`210mm x 297mm`) with exact margins and clean page-break control (`break-inside: avoid` on questions).
  - **Secondary (Direct Download):** Client-side PDF export via `html2pdf.js` / `jspdf` for one-click downloading of all generated sets.

---

## Data Model Specification

```typescript
export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'numerical';

export interface OptionItem {
  id: string;
  label: string; // "A", "B", "C", "D"
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  stem: string; // rich text or formatted string
  marks: number;
  options?: OptionItem[]; // for MCQ
  answerExplanation?: string;
}

export interface ExamSection {
  id: string;
  title: string; // e.g. "PART A: Objective Questions"
  instructions: string; // e.g. "Answer all 10 questions. Each carries 1 mark."
  marksPerQuestion?: number;
  questions: Question[];
}

export interface ExamHeader {
  institutionName: string;
  examTitle: string; // e.g. "Mid-Semester Examination - Autumn 2026"
  courseCode: string; // e.g. "CS301"
  courseName: string; // e.g. "Data Structures and Algorithms"
  date: string;
  duration: string; // e.g. "3 Hours"
  maxMarks: number;
  generalInstructions: string[];
}

export interface ExamPaper {
  id: string;
  title: string;
  header: ExamHeader;
  sections: ExamSection[];
}

export interface GeneratedSet {
  setCode: string; // "Set A", "Set B", "Set C", "Set D"
  paper: ExamPaper;
  permutationMap: Record<string, { originalIndex: number; newIndex: number }>;
}
```

---

## UI/UX Blueprint

```
+------------------------------------------------------------------------------------+
|  SET-MAKER   |  [Document Title]      |  [Preview Sets] [Generate (4)] [Export v]  |
+------------------------------------------------------------------------------------+
|  FORMAT RIBBON:  [B] [I] [U] [x²] [x₂] | Font Size | [+ Section] [+ Question v]   |
+------------------------------------------------------------------------------------+
|                                                                                    |
|                  +-----------------------------------------------+                 |
|                  |                   A4 CANVAS                   |                 |
|                  |                                               |                 |
|                  |      [ INSTITUTION NAME / LOGO HEADER ]       |                 |
|                  |  Exam: Mid-Term   Course: CS101   Max: 100    |                 |
|                  |  Time: 3 Hours    Date: Oct 2026              |                 |
|                  |  -------------------------------------------  |                 |
|                  |  Instructions: ...                            |                 |
|                  |                                               |                 |
|                  |  === PART A (20 Marks) =====================  |                 |
|                  |  :: [Q1] (MCQ) [2 Marks]            [^] [v] [x]|                 |
|                  |     What is the time complexity of QuickSort? |                 |
|                  |     (A) O(n)       (B) O(n log n)             |                 |
|                  |     (C) O(n²)      (D) O(1)                   |                 |
|                  |                                               |                 |
|                  |  :: [Q2] (Short Answer) [5 Marks]   [^] [v] [x]|                 |
|                  |     Explain the concept of Virtual DOM.       |                 |
|                  |                                               |                 |
|                  |  [ + Add Question to Part A ]                 |                 |
|                  |                                               |                 |
|                  |  === PART B (80 Marks) =====================  |                 |
|                  |  ...                                          |                 |
|                  +-----------------------------------------------+                 |
|                                                                                    |
+------------------------------------------------------------------------------------+
```

---

## Implementation Roadmap & Milestones

### Milestone 1: Environment & Project Foundation
- Initialize React 19 + TypeScript + Vite project structure.
- Configure Tailwind CSS, Lucide icons, and layout utilities.
- Set up state management for the `ExamPaper` document model.
- Configure local test environment and verify build pipeline.

### Milestone 2: Document Canvas & Ribbon Toolbar
- Build the simulated A4 canvas with page dimensions, margins, and drop shadow.
- Create editable header components:
  - Institution Name & Exam Metadata (Date, Time, Max Marks, Course Code).
  - General Instructions editable bulleted list.
- Build the Word-style ribbon toolbar with text formatting toggles (Bold, Italic, Underline, Subscript, Superscript).

### Milestone 3: Question & Section Management
- Implement Section blocks (`Part A`, `Part B`, etc.) with customizable titles and instructions.
- Implement Question blocks:
  - **MCQ block:** Dynamic option builder (A, B, C, D...), add/remove options, toggle correct option.
  - **Descriptive/Short/Long Answer block:** Question stem with optional answer lines/space indicators.
- Drag-and-drop & button-based reordering (`@dnd-kit` and Up/Down arrows).
- Marks counter: Live calculation and display of total marks vs max marks.

### Milestone 4: Shuffle Engine & Multi-Set Generator
- Implement the Fisher–Yates shuffling algorithm with seed and collision avoidance.
- Section-level shuffling: Ensure questions shuffle within their allocated section.
- Option-level shuffling (toggleable).
- Set selector tab bar: Instantly switch views between Set A, Set B, Set C, and Set D.
- Automated Question Renumbering (Q1, Q2, Q3...) per set.
- Permutation Mapping & Answer Key generator matrix.

### Milestone 5: Export System (DOCX & PDF)
- **DOCX Generation:**
  - Format headers, tables, bold styling, section dividers, and indented options.
  - Implement batch export: download all sets in a zip or individual files (`Set_A.docx`, `Set_B.docx`, etc.).
- **PDF Generation & Print Stylesheet:**
  - CSS `@media print` rules ensuring clean pagination without orphan questions (`break-inside: avoid`).
  - Direct PDF export via client-side PDF renderer.

### Milestone 6: Pre-loaded Templates, Verification & UX Polish
- Include sample exam paper templates (e.g. University Engineering Exam, High School Science Test).
- JSON Import & Export for saving/loading draft question papers.
- Keyboard shortcuts for rapid question entry.
- End-to-end verification and testing.

---

## Verification & Acceptance Criteria
1. **Visual Accuracy:** Canvas looks like an authentic examination paper with clear typography and margins.
2. **Shuffle Integrity:** Generating 4 sets produces 4 mathematically distinct question sequences without modifying section structure or losing questions.
3. **Renumbering Consistency:** Each set displays sequential numbering (`1..N`) matching its shuffled order.
4. **Export Quality:**
   - Generated `.docx` opens cleanly in Microsoft Word / Google Docs with intact formatting and tables.
   - Generated `.pdf` or print preview fits pages neatly with no overlapping text or awkward page breaks.
