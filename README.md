# Set-Maker: Web-Based Question Paper Designer & Multi-Set Studio

**Set-Maker** is a modern web application designed for academic departments, examiners, and educators to design formatted examination papers inside an A4 canvas editor and auto-generate multiple non-identical shuffled sets (Set A, Set B, Set C, Set D, etc.) with dual-format export (**Microsoft Word .docx** and print-ready **PDF**), automated question renumbering, and cross-set answer key tracking.

---

## Key Features

- **Realistic A4 Page Canvas:**
  - Standard A4 sheet formatting with exact margins, typography, and clean pagination.
  - Institution branding header, department subtitle, course code, exam title, duration, date, and maximum marks.
  - General instructions list with dynamic rule adding/editing.

- **Modular Question & Section Blocks:**
  - Group questions into parts or sections (e.g. `PART - A: Objective Type`, `PART - B: Descriptive`).
  - Supports multiple question types:
    - **Multiple Choice Questions (MCQ):** Dynamic options builder `(A)`, `(B)`, `(C)`, `(D)` with single-click correct answer indicators.
    - **Short Answer Questions**
    - **Long Problems / Derivations**
    - **Numerical Questions**
  - Inline rich text formatting for question stems (Bold, Italic, Underline, Subscript, Superscript).
  - Quick question duplication, deletion, and reordering.

- **Fisher–Yates Multi-Set Shuffling Engine:**
  - **Section-Aware Shuffling:** Questions are randomized strictly within their respective sections to preserve mark distributions and structural difficulty.
  - **MCQ Choice Randomization:** Optional toggle to also shuffle option letters `(A)`, `(B)`, `(C)`, `(D)` while preserving correct answer logic.
  - **Collision Prevention:** Verifies mathematical uniqueness across generated sets.
  - **Automated Sequential Renumbering:** Renumbers questions (`Q1..Qn`) dynamically per set.

- **Evaluator Hub: Cross-Set Shuffle Matrix & Answer Keys:**
  - Side-by-side comparative table showing where each question landed across all generated sets (e.g. Master Q1 → Set A Q3, Set B Q7).
  - Automated generation of answer keys for graders.

- **Dual-Engine Export:**
  - **Microsoft Word (.docx):** Generates native Word documents using the `docx` library with styled tables, metadata headers, option lists, and running headers/footers with page numbers.
  - **Batch Zip Export:** One-click download of all generated sets plus the evaluator answer key matrix in a `.zip` file.
  - **Print / PDF:** CSS `@page` print stylesheet formatted specifically for A4 printers and browser PDF export with orphan question avoidance (`break-inside: avoid`).

- **Paper Integrity Audit:**
  - Real-time tally of total questions and marks.
  - Visual indicator flags mark balance against maximum marks (e.g. `100 / 100 Marks (Balanced)`).

- **Project Persistence:**
  - Save and load exam projects in standard JSON format.
  - Pre-loaded templates: Computer Science (Data Structures & Algorithms) and Higher Secondary Physics.

---

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8 (with code-split chunking)
- **Styling:** Tailwind CSS v4 + Print Media Query rules
- **Icons:** Lucide React
- **Export Engines:** `docx`, `file-saver`, `jszip`

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
git clone https://github.com/yash2006kr/set-maker.git
cd set-maker
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## License
MIT
