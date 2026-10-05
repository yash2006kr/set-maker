import React, { useState } from 'react';
import type { GeneratedSet, ExamPaper } from '../types';
import { X, CheckCircle2, Download, Search, FileText } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gray-900 text-white p-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Evaluator Hub: Cross-Set Shuffle Matrix & Answer Keys
              </h2>
              <p className="text-xs text-gray-400">
                {masterPaper.header.courseCode} - {masterPaper.header.examTitle} ({sets.length} Shuffled Sets)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-gray-200 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'matrix'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cross-Set Permutation Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('keys')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'keys'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single-Set Answer Keys
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search question text or Q#..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Batch Export Zip */}
          <button
            type="button"
            onClick={() => downloadAllSetsZip(sets, masterPaper)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download All Sets + Key (.zip)
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'matrix' ? (
            /* Matrix View */
            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-16">Master Q#</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Question Snippet</th>
                    {sets.map((set) => (
                      <th key={set.setCode} className="py-2.5 px-3 text-center bg-gray-50 border-l border-gray-200">
                        {set.setCode}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQuestions.map((q) => {
                    return (
                      <tr key={q.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900 bg-gray-50/50">
                          Q{q.number}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700">
                          <p className="line-clamp-2">{q.stem}</p>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">
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
                              className="py-2.5 px-3 text-center border-l border-gray-200"
                            >
                              {perm ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                                    Q{perm.newIndex}
                                  </span>
                                  {keyEntry && keyEntry.correctAnswer !== 'N/A' && (
                                    <span className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                                      {keyEntry.correctAnswer}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Single-Set Keys View */
            <div>
              {/* Set selector tabs */}
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                {sets.map((set) => (
                  <button
                    key={set.setCode}
                    type="button"
                    onClick={() => setSelectedSetKey(set.setCode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedSetKey === set.setCode
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {set.setCode} Keys
                  </button>
                ))}
              </div>

              {/* Individual key table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-20">Set Q#</th>
                      <th className="py-2.5 px-4 w-28">Original Q#</th>
                      <th className="py-2.5 px-4">Correct Answer / Key Solution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentSetForKeys.answerKeys.map((item) => (
                      <tr key={item.questionNumber} className="hover:bg-gray-50">
                        <td className="py-2 px-4 font-bold text-blue-700">
                          Q{item.questionNumber}
                        </td>
                        <td className="py-2 px-4 text-gray-500 font-medium">
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
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500 px-6">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Permutations verified unique across all {sets.length} sets.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
