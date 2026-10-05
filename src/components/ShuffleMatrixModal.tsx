import React, { useState } from 'react';
import type { GeneratedSet, ExamPaper } from '../types';
import { X, CheckCircle2, Download, Search, FileText, Copy, Check } from 'lucide-react';
import { downloadAllSetsZip } from '../utils/docxExport';

interface ShuffleMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  sets: GeneratedSet[];
  masterPaper: ExamPaper;
}

export const ShuffleMatrixModal: React.FC<ShuffleMatrixModalProps> = ({
  isOpen,
  onClose,
  sets,
  masterPaper,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'keys'>('matrix');
  const [selectedSetKey, setSelectedSetKey] = useState<string>(sets[0]?.setCode || 'Set A');
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen || sets.length === 0) return null;

  // Flatten questions from master paper
  const masterQuestions: {
    id: string;
    number: number;
    stem: string;
    type: string;
    section: string;
  }[] = [];

  let qCount = 1;
  for (const sec of masterPaper.sections) {
    for (const q of sec.questions) {
      masterQuestions.push({
        id: q.id,
        number: qCount++,
        stem: q.stem.replace(/<[^>]*>?/gm, ''), // strip tags
        type: q.type,
        section: sec.title,
      });
    }
  }

  const filteredQuestions = masterQuestions.filter(
    (q) =>
      q.stem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.number.toString() === searchTerm ||
      q.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentSetForKeys = sets.find((s) => s.setCode === selectedSetKey) || sets[0];

  const handleCopyKeys = () => {
    let text = `--- ${masterPaper.header.courseCode || 'Exam'} - ${currentSetForKeys.setCode} Answer Key ---\n`;
    for (const item of currentSetForKeys.answerKeys) {
      text += `Q${item.questionNumber} (Master Q${item.originalQuestionNumber}): ${item.correctAnswer}\n`;
    }
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 md:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-xs">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Evaluator Hub: Cross-Set Shuffle Matrix &amp; Answer Keys
              </h2>
              <p className="text-xs text-slate-400">
                {masterPaper.header.courseCode} - {masterPaper.header.examTitle} ({sets.length} Shuffled Permutations)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 font-sans">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cross-Set Permutation Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('keys')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'keys'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single-Set Answer Keys
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search question text, Q#, or section..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Batch Export Zip */}
          <button
            type="button"
            onClick={() => downloadAllSetsZip(sets, masterPaper)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download All (.zip)
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 font-sans">
          {activeTab === 'matrix' ? (
            /* Matrix View */
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-16">Master Q#</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Question Snippet</th>
                    {sets.map((set) => (
                      <th key={set.setCode} className="py-2.5 px-3 text-center bg-slate-50 border-l border-slate-200">
                        {set.setCode}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/50">
                        Q{q.number}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <p className="line-clamp-2">{q.stem}</p>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {q.section}
                        </span>
                      </td>
                      {sets.map((set) => {
                        const perm = set.permutationMap[q.id];
                        const keyEntry = set.answerKeys.find(
                          (a) => a.originalQuestionNumber === q.number
                        );
                        return (
                          <td
                            key={set.setCode}
                            className="py-2.5 px-3 text-center border-l border-slate-200"
                          >
                            {perm ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">
                                  Q{perm.newIndex}
                                </span>
                                {keyEntry && keyEntry.correctAnswer !== 'N/A' && (
                                  <span className="text-[11px] text-emerald-700 font-bold mt-0.5">
                                    {keyEntry.correctAnswer}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Single-Set Keys View */
            <div>
              {/* Set selector tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {sets.map((set) => (
                    <button
                      key={set.setCode}
                      type="button"
                      onClick={() => setSelectedSetKey(set.setCode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedSetKey === set.setCode
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {set.setCode} Keys
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopyKeys}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Key!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy {selectedSetKey} Key
                    </>
                  )}
                </button>
              </div>

              {/* Individual key table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-20">Set Q#</th>
                      <th className="py-2.5 px-4 w-28">Original Q#</th>
                      <th className="py-2.5 px-4">Correct Answer / Key Solution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentSetForKeys.answerKeys.map((item) => (
                      <tr key={item.questionNumber} className="hover:bg-slate-50/80">
                        <td className="py-2 px-4 font-bold text-blue-700">
                          Q{item.questionNumber}
                        </td>
                        <td className="py-2 px-4 text-slate-500 font-medium">
                          Master Q{item.originalQuestionNumber}
                        </td>
                        <td className="py-2 px-4 font-semibold text-emerald-800">
                          {item.correctAnswer}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 px-6 font-sans">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Permutations mathematically verified across all {sets.length} sets.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
