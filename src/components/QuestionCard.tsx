import React, { useState } from 'react';
import type { Question, OptionItem, QuestionType } from '../types';
import { RichTextEditor } from './RichTextEditor';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  CheckCircle2,
  Circle,
  Plus,
  HelpCircle,
  Check,
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onUpdate: (updated: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  readOnly?: boolean;
  highlightCorrect?: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  readOnly = false,
  highlightCorrect = false,
}) => {
  const [showAnswerGuide, setShowAnswerGuide] = useState(false);

  const handleTypeChange = (newType: QuestionType) => {
    if (readOnly) return;
    if (newType === 'mcq' && (!question.options || question.options.length === 0)) {
      const now = Date.now();
      onUpdate({
        ...question,
        type: newType,
        options: [
          { id: `opt-${now}-1`, label: 'A', text: 'First choice', isCorrect: true },
          { id: `opt-${now}-2`, label: 'B', text: 'Second choice', isCorrect: false },
          { id: `opt-${now}-3`, label: 'C', text: 'Third choice', isCorrect: false },
          { id: `opt-${now}-4`, label: 'D', text: 'Fourth choice', isCorrect: false },
        ],
      });
    } else {
      onUpdate({ ...question, type: newType });
    }
  };

  const handleStemChange = (stem: string) => {
    if (readOnly) return;
    onUpdate({ ...question, stem });
  };

  const handleMarksChange = (marks: number) => {
    if (readOnly) return;
    onUpdate({ ...question, marks: Math.max(1, marks) });
  };

  // Option handlers for MCQ
  const updateOptionText = (optionId: string, text: string) => {
    if (readOnly || !question.options) return;
    const newOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    onUpdate({ ...question, options: newOptions });
  };

  const setCorrectOption = (optionId: string) => {
    if (readOnly || !question.options) return;
    const newOptions = question.options.map((opt) => ({
      ...opt,
      isCorrect: opt.id === optionId,
    }));
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    if (readOnly || !question.options) return;
    const nextIdx = question.options.length;
    const newLetter = OPTION_LETTERS[nextIdx] || String.fromCharCode(65 + nextIdx);
    const newOpt: OptionItem = {
      id: `opt-${Date.now()}-${nextIdx}`,
      label: newLetter,
      text: `Option ${newLetter} text`,
      isCorrect: false,
    };
    onUpdate({ ...question, options: [...question.options, newOpt] });
  };

  const removeOption = (optionId: string) => {
    if (readOnly || !question.options || question.options.length <= 2) return;
    const filtered = question.options.filter((opt) => opt.id !== optionId);
    // Re-index labels
    const reindexed = filtered.map((opt, idx) => ({
      ...opt,
      label: OPTION_LETTERS[idx] || String.fromCharCode(65 + idx),
    }));
    // Ensure at least one is marked correct if the removed one was correct
    if (!reindexed.some((o) => o.isCorrect) && reindexed.length > 0) {
      reindexed[0].isCorrect = true;
    }
    onUpdate({ ...question, options: reindexed });
  };

  return (
    <div className="group/card relative border border-transparent hover:border-slate-300 rounded-lg p-3 my-2.5 transition-all bg-white/60 hover:bg-white hover:shadow-sm font-serif text-slate-900 page-break-avoid question-card-item">
      {/* Question Header Bar (Interactive controls hidden on print) */}
      <div className="flex items-center justify-between gap-2 mb-2 no-print font-sans">
        <div className="flex items-center gap-2">
          {/* Question Number Badge */}
          <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded shadow-2xs">
            Q{questionNumber}
          </span>

          {/* Type Selector */}
          {!readOnly && (
            <select
              value={question.type}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
              className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md px-2 py-0.5 text-slate-700 font-semibold focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="short_answer">Short Answer</option>
              <option value="long_answer">Long / Descriptive</option>
              <option value="numerical">Numerical / Problem</option>
            </select>
          )}

          {/* Marks Input */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium ml-1">
            <span>Marks:</span>
            {readOnly ? (
              <span className="font-bold text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                {question.marks}
              </span>
            ) : (
              <input
                type="number"
                min="1"
                max="50"
                value={question.marks}
                onChange={(e) => handleMarksChange(parseInt(e.target.value) || 1)}
                className="w-12 text-center text-xs border border-slate-300 rounded px-1 py-0.5 font-bold text-slate-800 bg-white"
              />
            )}
          </div>
        </div>

        {/* Action Buttons: Move Up/Down, Duplicate, Delete */}
        {!readOnly && (
          <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                disabled={isFirst}
                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 rounded hover:bg-slate-200 transition-colors"
                title="Move Question Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                disabled={isLast}
                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 rounded hover:bg-slate-200 transition-colors"
                title="Move Question Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onDuplicate}
              className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
              title="Duplicate Question"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-slate-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
              title="Delete Question"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Question Stem Row */}
      <div className="flex items-start gap-2.5">
        <span className="font-bold text-sm md:text-base select-none shrink-0 pt-0.5 text-slate-900">
          Q{questionNumber}.
        </span>
        <div className="flex-1 text-sm md:text-base leading-relaxed text-slate-900">
          {readOnly ? (
            <div
              dangerouslySetInnerHTML={{ __html: question.stem }}
              className="prose-sm max-w-none text-slate-900"
            />
          ) : (
            <RichTextEditor
              value={question.stem}
              onChange={handleStemChange}
              placeholder="Enter question statement here..."
              className="w-full text-sm md:text-base min-h-[32px]"
            />
          )}
        </div>
        <span className="font-bold text-xs md:text-sm text-slate-800 shrink-0 select-none pt-0.5 ml-2 font-serif">
          [{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}]
        </span>
      </div>

      {/* Multiple Choice Options Grid / List */}
      {question.type === 'mcq' && question.options && (
        <div className="mt-2.5 ml-6 space-y-1.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {question.options.map((opt) => {
              const isMarkedCorrect = opt.isCorrect;
              const shouldShowHighlight =
                (isMarkedCorrect && highlightCorrect) || (isMarkedCorrect && !readOnly);

              return (
                <div
                  key={opt.id}
                  className={`group/opt flex items-center gap-2 p-1.5 rounded-lg border transition-all ${
                    shouldShowHighlight
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs'
                      : 'bg-transparent border-transparent hover:border-slate-200'
                  }`}
                >
                  {/* Correct answer toggle / indicator */}
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={() => setCorrectOption(opt.id)}
                      className="no-print text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                      title={opt.isCorrect ? 'Correct Answer (Click to change)' : 'Mark as Correct Answer'}
                    >
                      {opt.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4 hover:stroke-slate-500" />
                      )}
                    </button>
                  ) : (
                    highlightCorrect &&
                    opt.isCorrect && (
                      <span className="no-print text-emerald-600 font-sans text-xs flex items-center gap-0.5 font-bold">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )
                  )}

                  {/* Option Letter Label (A), (B)... */}
                  <span className="font-bold text-xs md:text-sm text-slate-900 select-none font-serif">
                    ({opt.label})
                  </span>

                  {/* Option Text */}
                  <div className="flex-1 text-xs md:text-sm">
                    {readOnly ? (
                      <span className="text-slate-900">{opt.text}</span>
                    ) : (
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateOptionText(opt.id, e.target.value)}
                        placeholder={`Option ${opt.label} text`}
                        className="w-full px-1.5 py-0.5 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none bg-transparent rounded-sm text-slate-900"
                      />
                    )}
                  </div>

                  {/* Delete Option button */}
                  {!readOnly && question.options && question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(opt.id)}
                      className="no-print opacity-0 group-hover/opt:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition-all rounded"
                      title="Remove this option"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Option Button */}
          {!readOnly && (
            <div className="pt-1 no-print">
              <button
                type="button"
                onClick={addOption}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans font-semibold px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Choice
              </button>
            </div>
          )}
        </div>
      )}

      {/* Answer Key / Evaluation Guide collapsible for non-MCQ */}
      {question.type !== 'mcq' && (
        <div className="mt-2 ml-6 no-print font-sans">
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAnswerGuide(!showAnswerGuide)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 font-medium transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              {showAnswerGuide ? 'Hide Evaluation Answer Key' : 'Add Evaluation Key / Reference'}
            </button>
          )}

          {showAnswerGuide && !readOnly && (
            <div className="mt-1.5 p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
              <label className="block text-amber-900 font-semibold mb-1">
                Answer Key / Scoring Reference (tracked in cross-set matrix):
              </label>
              <input
                type="text"
                value={question.correctAnswerText || ''}
                onChange={(e) => onUpdate({ ...question, correctAnswerText: e.target.value })}
                placeholder="e.g. Expected formula, key theorem name, or final numerical result"
                className="w-full px-2.5 py-1.5 border border-amber-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
