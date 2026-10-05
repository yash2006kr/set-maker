import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Superscript,
  Subscript,
  Plus,
  Shuffle,
  Printer,
  FileDown,
  FolderOpen,
  Save,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Download,
  Loader2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import type { ExamPaper } from '../types';
import { dsaExamPaper, physicsExamPaper, mathsExamPaper } from '../data/samplePapers';

interface RibbonToolbarProps {
  paper: ExamPaper;
  setPaper: React.Dispatch<React.SetStateAction<ExamPaper>>;
  onAddSection: () => void;
  onAddQuestion: (type: 'mcq' | 'short_answer') => void;
  onGenerateSets: () => void;
  onOpenShuffleMatrix: () => void;
  hasGeneratedSets: boolean;
  setCount: number;
  setSetCount: (n: number) => void;
  shuffleOptions: boolean;
  setShuffleOptions: (v: boolean) => void;
  onDownloadPdf: () => void;
  onPrintPdf: () => void;
  onExportDocx: () => void;
  isGeneratingPdf?: boolean;
}

export const RibbonToolbar: React.FC<RibbonToolbarProps> = ({
  paper,
  setPaper,
  onAddSection,
  onAddQuestion,
  onGenerateSets,
  onOpenShuffleMatrix,
  hasGeneratedSets,
  setCount,
  setSetCount,
  shuffleOptions,
  setShuffleOptions,
  onDownloadPdf,
  onPrintPdf,
  onExportDocx,
  isGeneratingPdf = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);

  // Apply rich text formatting to active selection
  const executeFormat = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
  };

  // Calculate paper totals
  const totalQuestions = paper.sections.reduce((acc, sec) => acc + sec.questions.length, 0);
  const calculatedMarks = paper.sections.reduce(
    (acc, sec) => acc + sec.questions.reduce((qAcc, q) => qAcc + (q.marks || 0), 0),
    0
  );
  const isMarksBalanced = calculatedMarks === paper.header.maxMarks;
  const marksDifference = paper.header.maxMarks - calculatedMarks;

  // Presets
  const loadPreset = (preset: ExamPaper) => {
    setTemplateMenuOpen(false);
    if (window.confirm(`Load template "${preset.title}"? Current edits will be replaced.`)) {
      setPaper(JSON.parse(JSON.stringify(preset)));
    }
  };

  const createBlank = () => {
    setTemplateMenuOpen(false);
    if (window.confirm('Create a new blank examination paper?')) {
      const now = Date.now();
      setPaper({
        id: `exam-${now}`,
        title: 'New Examination Paper',
        header: {
          institutionName: 'UNIVERSITY / SCHOOL NAME',
          examTitle: 'FINAL EXAMINATION - 2026',
          courseCode: 'SUB101',
          courseName: 'Subject Name',
          duration: '3 Hours',
          date: 'Date of Exam',
          maxMarks: 100,
          generalInstructions: [
            'All questions are compulsory.',
            'Read questions carefully before writing answers.',
          ],
        },
        sections: [
          {
            id: `sec-${now}`,
            title: 'SECTION A: Objective Questions',
            instructions: 'Answer all questions.',
            questions: [
              {
                id: `q-${now}`,
                type: 'mcq',
                stem: 'Sample multiple choice question stem.',
                marks: 2,
                options: [
                  { id: `opt-${now}-1`, label: 'A', text: 'First choice', isCorrect: true },
                  { id: `opt-${now}-2`, label: 'B', text: 'Second choice', isCorrect: false },
                  { id: `opt-${now}-3`, label: 'C', text: 'Third choice', isCorrect: false },
                  { id: `opt-${now}-4`, label: 'D', text: 'Fourth choice', isCorrect: false },
                ],
              },
            ],
          },
        ],
      });
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(paper, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${paper.header.courseCode || 'Exam'}_paper.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.header && imported.sections) {
          setPaper(imported);
        } else {
          alert('Invalid exam paper format.');
        }
      } catch (error) {
        console.error('Failed to parse JSON file:', error);
        alert('Failed to parse JSON file. Please ensure it is a valid SetMaker JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs no-print font-sans select-none">
      {/* Top Banner Navigation Bar */}
      <div className="px-4 py-2 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded font-black text-xs tracking-wider shadow-xs">
              SET
            </span>
            <span className="font-extrabold text-sm tracking-tight text-white">
              MAKER
            </span>
          </div>
          <span className="text-slate-400 border-l border-slate-700 pl-3 hidden md:inline text-[11px]">
            Academic Question Paper Designer &amp; Multi-Set Studio
          </span>
        </div>

        {/* Paper title preview / badge */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">
            {paper.header.courseCode || 'Exam'}:
          </span>
          <span className="truncate max-w-[240px]">
            {paper.header.examTitle || 'Mid-Term Paper'}
          </span>
        </div>

        {/* Templates Dropdown and File Actions */}
        <div className="flex items-center gap-2">
          {/* Templates Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Templates</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {templateMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800"
                onMouseLeave={() => setTemplateMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pre-built Academic Papers
                </div>
                <button
                  type="button"
                  onClick={() => loadPreset(dsaExamPaper)}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 flex flex-col text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <span className="font-semibold">CS302: Data Structures</span>
                  <span className="text-[10px] text-slate-400">100 Marks &bull; 11 Questions &bull; 3 Parts</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset(physicsExamPaper)}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 flex flex-col text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <span className="font-semibold">PHY-12: Physics Exam</span>
                  <span className="text-[10px] text-slate-400">70 Marks &bull; 9 Questions &bull; Theory</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset(mathsExamPaper)}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 flex flex-col text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <span className="font-semibold">MAT201: Engineering Math</span>
                  <span className="text-[10px] text-slate-400">50 Marks &bull; 6 Questions &bull; Algebra</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  type="button"
                  onClick={createBlank}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-semibold transition-colors"
                >
                  + Create Blank Paper
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-700 mx-0.5" />

          {/* Import/Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors border border-slate-700"
            title="Save Paper as JSON file"
          >
            <Save className="w-3 h-3 text-slate-400" /> Save JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors border border-slate-700"
            title="Load Paper from JSON file"
          >
            <FolderOpen className="w-3 h-3 text-slate-400" /> Load JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
        </div>
      </div>

      {/* Main Studio Ribbon Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50/90 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        {/* Left: Text Formatting Controls */}
        <div className="flex items-center gap-0.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => executeFormat('bold')}
            className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('italic')}
            className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('underline')}
            className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-0.5" />
          <button
            type="button"
            onClick={() => executeFormat('superscript')}
            className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
            title="Superscript"
          >
            <Superscript className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('subscript')}
            className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
            title="Subscript"
          >
            <Subscript className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center-Left: Insert Section & Question */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAddSection}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" /> + Add Section
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion('mcq')}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" /> + Add MCQ
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion('short_answer')}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" /> + Add Question
          </button>
        </div>

        {/* Center-Right: Audit Stats: Marks & Questions balance */}
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
          <span className="text-slate-500 font-medium">
            <span className="font-bold text-slate-900 font-mono">{totalQuestions}</span> Questions
          </span>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            {isMarksBalanced ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {calculatedMarks} / {paper.header.maxMarks} Marks
              </span>
            ) : (
              <span
                className="flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                title={`Calculated marks (${calculatedMarks}) do not match Max Marks (${paper.header.maxMarks})`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                {calculatedMarks} / {paper.header.maxMarks} Marks
                <span className="text-[10px] text-amber-600 font-normal">
                  ({marksDifference > 0 ? `${marksDifference} left` : `${Math.abs(marksDifference)} over`})
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Shuffling Engine & Multi-Format Export */}
        <div className="flex items-center gap-2">
          {/* Sets Count */}
          <div className="flex items-center gap-1 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
            <span className="font-medium text-slate-500">Sets:</span>
            <select
              value={setCount}
              onChange={(e) => setSetCount(parseInt(e.target.value) || 4)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="2">2 Sets (A, B)</option>
              <option value="3">3 Sets (A, B, C)</option>
              <option value="4">4 Sets (A, B, C, D)</option>
              <option value="5">5 Sets (A-E)</option>
              <option value="6">6 Sets (A-F)</option>
            </select>
          </div>

          {/* Shuffle Options Checkbox */}
          <label className="flex items-center gap-1 text-xs text-slate-700 cursor-pointer select-none bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
            <input
              type="checkbox"
              checked={shuffleOptions}
              onChange={(e) => setShuffleOptions(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-[11px] font-medium">Shuffle Choices</span>
          </label>

          {/* Generate Multi-Sets button */}
          <button
            type="button"
            onClick={onGenerateSets}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-98"
          >
            <Shuffle className="w-3.5 h-3.5" /> Generate Sets
          </button>

          {/* Cross-set Shuffle Matrix & Answer Key Button */}
          {hasGeneratedSets && (
            <button
              type="button"
              onClick={onOpenShuffleMatrix}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Open Cross-Set Shuffle Matrix & Answer Keys"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" /> Matrix &amp; Keys
            </button>
          )}

          {/* Clean PDF Download Button */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-98"
            title="Download clean A4 PDF directly (Zero watermarks, Zero localhost URL)"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Download PDF
              </>
            )}
          </button>

          {/* Clean Print / Save as PDF */}
          <button
            type="button"
            onClick={onPrintPdf}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs hover:shadow-xs transition-all"
            title="Print or Browser Save as PDF (Stripped headers & footers)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
          </button>

          {/* Export DOCX */}
          <button
            type="button"
            onClick={onExportDocx}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-98"
            title="Download Word .docx document"
          >
            <FileDown className="w-3.5 h-3.5" /> Word (.docx)
          </button>
        </div>
      </div>
    </header>
  );
};
