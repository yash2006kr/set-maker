import React, { useRef } from 'react';
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
  CheckCircle,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import type { ExamPaper } from '../types';
import { dsaExamPaper, physicsExamPaper } from '../data/samplePapers';

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
  onPrintPdf: () => void;
  onExportDocx: () => void;
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
  onPrintPdf,
  onExportDocx,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Presets
  const loadPreset = (preset: ExamPaper) => {
    if (window.confirm(`Load template "${preset.title}"? Current edits will be replaced.`)) {
      setPaper(JSON.parse(JSON.stringify(preset)));
    }
  };

  const createBlank = () => {
    if (window.confirm('Create a new blank examination paper?')) {
      setPaper({
        id: `exam-${Date.now()}`,
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
            id: `sec-${Date.now()}`,
            title: 'SECTION A: Objective Questions',
            instructions: 'Answer all questions.',
            questions: [
              {
                id: `q-${Date.now()}`,
                type: 'mcq',
                stem: 'Sample multiple choice question stem.',
                marks: 2,
                options: [
                  { id: '1', label: 'A', text: 'First choice', isCorrect: true },
                  { id: '2', label: 'B', text: 'Second choice', isCorrect: false },
                  { id: '3', label: 'C', text: 'Third choice', isCorrect: false },
                  { id: '4', label: 'D', text: 'Fourth choice', isCorrect: false },
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
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs no-print font-sans">
      {/* Top Banner Bar */}
      <div className="px-4 py-2 bg-gray-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-black tracking-normal">SET</span>
            MAKER
          </span>
          <span className="text-gray-400 border-l border-gray-700 pl-2 hidden sm:inline">
            Web-Based Question Paper Designer & Multi-Set Studio
          </span>
        </div>

        {/* Templates and File IO */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-[11px] hidden md:inline">Sample Templates:</span>
          <button
            type="button"
            onClick={() => loadPreset(dsaExamPaper)}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-[11px] transition-colors"
          >
            DSA Mid-Term
          </button>
          <button
            type="button"
            onClick={() => loadPreset(physicsExamPaper)}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-[11px] transition-colors"
          >
            Physics Exam
          </button>
          <button
            type="button"
            onClick={createBlank}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-[11px] transition-colors"
          >
            Blank Paper
          </button>

          <div className="h-4 w-px bg-gray-700 mx-1" />

          {/* Import/Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[11px] flex items-center gap-1 transition-colors"
            title="Save Paper as JSON file"
          >
            <Save className="w-3 h-3" /> Save JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[11px] flex items-center gap-1 transition-colors"
            title="Load Paper from JSON file"
          >
            <FolderOpen className="w-3 h-3" /> Load JSON
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

      {/* Main Ribbon / Action Toolbar */}
      <div className="px-4 py-2.5 bg-gray-50 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
        {/* Left: Text Formatting Controls */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-2xs">
          <button
            type="button"
            onClick={() => executeFormat('bold')}
            className="p-1.5 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('italic')}
            className="p-1.5 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('underline')}
            className="p-1.5 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-gray-200 mx-0.5" />
          <button
            type="button"
            onClick={() => executeFormat('superscript')}
            className="p-1.5 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            title="Superscript"
          >
            <Superscript className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeFormat('subscript')}
            className="p-1.5 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
            title="Subscript"
          >
            <Subscript className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Insert Section & Question */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAddSection}
            className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" /> + Add Section
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion('mcq')}
            className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" /> + Add MCQ
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion('short_answer')}
            className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" /> + Add Question
          </button>
        </div>

        {/* Audit Stats: Marks & Questions balance */}
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 text-xs">
          <span className="text-gray-500 font-medium">
            <span className="font-bold text-gray-900">{totalQuestions}</span> Questions
          </span>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1">
            {isMarksBalanced ? (
              <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle className="w-3.5 h-3.5" />
                {calculatedMarks} / {paper.header.maxMarks} Marks
              </span>
            ) : (
              <span
                className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded"
                title={`Calculated marks (${calculatedMarks}) do not match Max Marks (${paper.header.maxMarks})`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {calculatedMarks} / {paper.header.maxMarks} Marks
              </span>
            )}
          </div>
        </div>

        {/* Right: Shuffling & Export Actions */}
        <div className="flex items-center gap-2">
          {/* Sets count select */}
          <div className="flex items-center gap-1 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg px-2 py-1">
            <span className="font-medium text-gray-500">Sets:</span>
            <select
              value={setCount}
              onChange={(e) => setSetCount(parseInt(e.target.value) || 4)}
              className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="2">2 Sets (A, B)</option>
              <option value="3">3 Sets (A, B, C)</option>
              <option value="4">4 Sets (A, B, C, D)</option>
              <option value="5">5 Sets (A-E)</option>
              <option value="6">6 Sets (A-F)</option>
            </select>
          </div>

          {/* Shuffle Options Checkbox */}
          <label className="flex items-center gap-1 text-xs text-gray-700 cursor-pointer select-none bg-white border border-gray-300 rounded-lg px-2 py-1">
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
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" /> Generate Sets
          </button>

          {/* Cross-set Shuffle Matrix & Answer Key Button */}
          {hasGeneratedSets && (
            <button
              type="button"
              onClick={onOpenShuffleMatrix}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Open Cross-Set Shuffle Matrix & Answer Keys"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Matrix & Keys
            </button>
          )}

          {/* Print/PDF */}
          <button
            type="button"
            onClick={onPrintPdf}
            className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" /> Print/PDF
          </button>

          {/* Export DOCX */}
          <button
            type="button"
            onClick={onExportDocx}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            title="Download Word .docx document"
          >
            <FileDown className="w-3.5 h-3.5" /> Word (.docx)
          </button>
        </div>
      </div>
    </header>
  );
};
