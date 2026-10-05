import React from 'react';
import type { GeneratedSet, ExamPaper } from '../types';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Eye,
  Archive,
  Layers,
  FileDown,
} from 'lucide-react';
import { downloadSetDocx, downloadAllSetsZip } from '../utils/docxExport';

interface SetTabsBarProps {
  sets: GeneratedSet[];
  activeSetIndex: number; // -1 for Master Draft, 0 for Set A, 1 for Set B, etc.
  onSelectSet: (index: number) => void;
  onOpenShuffleMatrix: () => void;
  showCorrectAnswers: boolean;
  setShowCorrectAnswers: (v: boolean) => void;
  masterPaper: ExamPaper;
  onDownloadCurrentSetPdf: () => void;
}

export const SetTabsBar: React.FC<SetTabsBarProps> = ({
  sets,
  activeSetIndex,
  onSelectSet,
  onOpenShuffleMatrix,
  showCorrectAnswers,
  setShowCorrectAnswers,
  masterPaper,
  onDownloadCurrentSetPdf,
}) => {
  if (sets.length === 0) return null;

  const currentSet = activeSetIndex >= 0 ? sets[activeSetIndex] : null;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 shadow-2xs no-print font-sans">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Set Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {/* Master Paper Tab */}
          <button
            type="button"
            onClick={() => onSelectSet(-1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeSetIndex === -1
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Master Template (Edit)
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Shuffled Sets Tabs */}
          {sets.map((set, idx) => {
            const isActive = activeSetIndex === idx;
            return (
              <button
                key={set.setCode}
                type="button"
                onClick={() => onSelectSet(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50/80 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{set.setCode}</span>
              </button>
            );
          })}

          {/* Matrix & Keys Tab */}
          <button
            type="button"
            onClick={onOpenShuffleMatrix}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors ml-1 border border-indigo-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" /> Cross-Set Matrix &amp; Keys
          </button>
        </div>

        {/* Action Controls for Current View */}
        <div className="flex items-center gap-2">
          {currentSet && (
            <>
              {/* Highlight Correct Options Toggle */}
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg px-2.5 py-1 transition-colors hover:bg-emerald-100">
                <input
                  type="checkbox"
                  checked={showCorrectAnswers}
                  onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-bold text-[11px]">Show Answers</span>
              </label>

              {/* Download Current Set PDF */}
              <button
                type="button"
                onClick={onDownloadCurrentSetPdf}
                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title={`Download ${currentSet.setCode} as clean PDF`}
              >
                <Download className="w-3 h-3 text-red-600" /> {currentSet.setCode} (PDF)
              </button>

              {/* Download Current Set Docx */}
              <button
                type="button"
                onClick={() => downloadSetDocx(currentSet)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title={`Download ${currentSet.setCode} as Word .docx`}
              >
                <FileDown className="w-3 h-3 text-emerald-600" /> {currentSet.setCode} (.docx)
              </button>
            </>
          )}

          {/* Download All Sets Zip */}
          <button
            type="button"
            onClick={() => downloadAllSetsZip(sets, masterPaper)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            title="Download all sets + Evaluator matrix in a single ZIP"
          >
            <Archive className="w-3.5 h-3.5" /> Batch Zip
          </button>
        </div>
      </div>
    </div>
  );
};
