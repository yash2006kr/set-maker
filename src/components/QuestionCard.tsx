import React, { useState } from 'react';
import type { Question, OptionItem, QuestionType } from '../types';
import { RichTextEditor } from './RichTextEditor';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  CheckCircle,
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
      onUpdate({
        ...question,
        type: newType,
        options: [
          { id: `opt-${Date.now()}-1`, label: 'A', text: 'Option A statement', isCorrect: true },
          { id: `opt-${Date.now()}-2`, label: 'B', text: 'Option B statement', isCorrect: false },
          { id: `opt-${Date.now()}-3`, label: 'C', text: 'Option C statement', isCorrect: false },
          { id: `opt-${Date.now()}-4`, label: 'D', text: 'Option D statement', isCorrect: false },
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
      text: `Option ${newLetter} statement`,
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
    <div className="group relative border border-transparent hover:border-gray-300 rounded-lg p-3 my-2.5 transition-all bg-white/70 hover:bg-white hover:shadow-sm font-serif text-gray-900 page-break-avoid">
      {/* Question Header Bar (Controls) */}
      <div className="flex items-center justify-between gap-2 mb-2 no-print">
        <div className="flex items-center gap-2 font-sans">
          {/* Question Number Badge */}
          <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-0.5 rounded shadow-sm">
            Q{questionNumber}
          </span>

          {/* Type Selector */}
          {!readOnly && (
            <select
              value={question.type}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
              className="text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-2 py-0.5 text-gray-700 font-medium focus:ring-1 focus:ring-blue-500"
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="short_answer">Short Answer</option>
              <option value="long_answer">Long / Descriptive</option>
              <option value="numerical">Numerical / Problem</option>
            </select>
          )}

          {/* Marks input */}
          <div className="flex items-center gap-1 text-xs text-gray-600 font-medium ml-2">
            <span>Marks:</span>
            {readOnly ? (
              <span className="font-bold text-gray-900">{question.marks}</span>
            ) : (
              <input
                type="number"
                min="1"
                max="50"
                value={question.marks}
                onChange={(e) => handleMarksChange(parseInt(e.target.value) || 1)}
                className="w-12 text-center text-xs border border-gray-300 rounded px-1 py-0.5 font-bold text-gray-800"
              />
            )}
          </div>
        </div>

        {/* Action Buttons: Move Up/Down, Duplicate, Delete */}
        {!readOnly && (
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                disabled={isFirst}
                className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 rounded hover:bg-gray-100"
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
                className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 rounded hover:bg-gray-100"
                title="Move Question Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onDuplicate}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
              title="Duplicate Question"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
              title="Delete Question"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Question Stem Row */}
      <div className="flex items-start gap-2">
        <span className="font-bold text-sm md:text-base select-none shrink-0 pt-0.5">
          Q{questionNumber}.
        </span>
        <div className="flex-1 text-sm md:text-base leading-relaxed">
          {readOnly ? (
            <div
              dangerouslySetInnerHTML={{ __html: question.stem }}
              className="prose-sm max-w-none"
            />
          ) : (
            <RichTextEditor
              value={question.stem}
              onChange={handleStemChange}
              placeholder="Enter question statement here..."
              className="w-full text-sm md:text-base"
            />
          )}
        </div>
        <span className="font-bold text-xs md:text-sm text-gray-800 shrink-0 select-none pt-0.5 ml-2">
          [{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}]
        </span>
      </div>

      {/* Multiple Choice Options Grid / List */}
      {question.type === 'mcq' && question.options && (
        <div className="mt-2.5 ml-6 space-y-1.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {question.options.map((opt) => (
              <div
                key={opt.id}
                className={`flex items-center gap-2 p-1.5 rounded border transition-colors ${
                  (opt.isCorrect && highlightCorrect) || (opt.isCorrect && !readOnly)
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-transparent border-transparent hover:border-gray-200'
                }`}
              >
                {/* Correct answer toggle / indicator */}
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => setCorrectOption(opt.id)}
                    className="no-print text-gray-400 hover:text-emerald-600 transition-colors shrink-0"
                    title={opt.isCorrect ? 'Correct Answer' : 'Mark as Correct Answer'}
                  >
                    {opt.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-4 h-4" />
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
                <span className="font-bold text-xs md:text-sm text-gray-800 select-none">
                  ({opt.label})
                </span>

                {/* Option Text */}
                <div className="flex-1 text-xs md:text-sm">
                  {readOnly ? (
                    <span>{opt.text}</span>
                  ) : (
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOptionText(opt.id, e.target.value)}
                      placeholder={`Option ${opt.label} text`}
                      className="w-full px-1.5 py-0.5 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                    />
                  )}
                </div>

                {/* Delete Option button */}
                {!readOnly && question.options && question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    className="no-print opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 transition-opacity"
                    title="Remove this option"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Option Button */}
          {!readOnly && (
            <div className="pt-1 no-print">
              <button
                type="button"
                onClick={addOption}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans font-medium"
              >
                <Plus className="w-3 h-3" /> Add Choice
              </button>
            </div>
          )}
        </div>
      )}

      {/* Answer Key / Evaluation Guide collapsible for non-MCQ */}
      {question.type !== 'mcq' && (
        <div className="mt-2 ml-6 no-print">
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAnswerGuide(!showAnswerGuide)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 font-sans"
            >
              <HelpCircle className="w-3 h-3" />
              {showAnswerGuide ? 'Hide Evaluation Answer Key' : 'Add Evaluation Key / Reference'}
            </button>
          )}

          {showAnswerGuide && !readOnly && (
            <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-xs font-sans">
              <label className="block text-amber-900 font-semibold mb-1">
                Answer Key / Scoring Notes (included in evaluator matrix):
              </label>
              <input
                type="text"
                value={question.correctAnswerText || ''}
                onChange={(e) => onUpdate({ ...question, correctAnswerText: e.target.value })}
                placeholder="e.g. Expected formula, key theorem name, or final numerical result"
                className="w-full px-2 py-1 border border-amber-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
