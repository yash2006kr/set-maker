import React from 'react';
import type { ExamSection, Question, QuestionType } from '../types';
import { QuestionCard } from './QuestionCard';
import { Plus, Trash2, ArrowUp, ArrowDown, FolderPlus } from 'lucide-react';

interface SectionBlockProps {
  section: ExamSection;
  sectionIndex: number;
  questionNumberOffset: number;
  onUpdateSection: (updated: ExamSection) => void;
  onDeleteSection: () => void;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  isFirstSection?: boolean;
  isLastSection?: boolean;
  readOnly?: boolean;
  highlightCorrect?: boolean;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  section,
  questionNumberOffset,
  onUpdateSection,
  onDeleteSection,
  onMoveSectionUp,
  onMoveSectionDown,
  isFirstSection = false,
  isLastSection = false,
  readOnly = false,
  highlightCorrect = false,
}) => {
  const totalSectionMarks = section.questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  const updateTitle = (title: string) => {
    if (readOnly) return;
    onUpdateSection({ ...section, title });
  };

  const updateInstructions = (instructions: string) => {
    if (readOnly) return;
    onUpdateSection({ ...section, instructions });
  };

  // Question CRUD within this section
  const handleUpdateQuestion = (qIndex: number, updated: Question) => {
    if (readOnly) return;
    const newQuestions = [...section.questions];
    newQuestions[qIndex] = updated;
    onUpdateSection({ ...section, questions: newQuestions });
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (readOnly) return;
    const newQuestions = section.questions.filter((_, i) => i !== qIndex);
    onUpdateSection({ ...section, questions: newQuestions });
  };

  const handleDuplicateQuestion = (qIndex: number) => {
    if (readOnly) return;
    const target = section.questions[qIndex];
    const duplicated: Question = {
      ...target,
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      options: target.options
        ? target.options.map((o) => ({
            ...o,
            id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          }))
        : undefined,
    };
    const newQuestions = [...section.questions];
    newQuestions.splice(qIndex + 1, 0, duplicated);
    onUpdateSection({ ...section, questions: newQuestions });
  };

  const handleMoveQuestion = (qIndex: number, direction: 'up' | 'down') => {
    if (readOnly) return;
    const targetIdx = direction === 'up' ? qIndex - 1 : qIndex + 1;
    if (targetIdx < 0 || targetIdx >= section.questions.length) return;

    const newQuestions = [...section.questions];
    const [moved] = newQuestions.splice(qIndex, 1);
    newQuestions.splice(targetIdx, 0, moved);
    onUpdateSection({ ...section, questions: newQuestions });
  };

  const handleAddQuestion = (type: QuestionType) => {
    if (readOnly) return;
    const newQ: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      stem:
        type === 'mcq'
          ? 'New Multiple Choice Question statement'
          : 'New Short/Descriptive Question statement',
      marks: type === 'mcq' ? 2 : 5,
      options:
        type === 'mcq'
          ? [
              { id: `opt-1-${Date.now()}`, label: 'A', text: 'Option A statement', isCorrect: true },
              { id: `opt-2-${Date.now()}`, label: 'B', text: 'Option B statement', isCorrect: false },
              { id: `opt-3-${Date.now()}`, label: 'C', text: 'Option C statement', isCorrect: false },
              { id: `opt-4-${Date.now()}`, label: 'D', text: 'Option D statement', isCorrect: false },
            ]
          : undefined,
    };
    onUpdateSection({ ...section, questions: [...section.questions, newQ] });
  };

  return (
    <div className="mb-8 border border-gray-200/80 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
      {/* Section Header Controls */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-300 no-print font-sans">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            Section Container
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {section.questions.length} Questions | Total: {totalSectionMarks} Marks
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1">
            {onMoveSectionUp && (
              <button
                type="button"
                onClick={onMoveSectionUp}
                disabled={isFirstSection}
                className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 rounded hover:bg-gray-200"
                title="Move Section Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
            {onMoveSectionDown && (
              <button
                type="button"
                onClick={onMoveSectionDown}
                disabled={isLastSection}
                className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 rounded hover:bg-gray-200"
                title="Move Section Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onDeleteSection}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 ml-1"
              title="Delete Section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Printable Section Title & Instructions */}
      <div className="text-center my-3 font-serif">
        {readOnly ? (
          <h3 className="text-base md:text-lg font-bold uppercase tracking-wide underline decoration-1 underline-offset-4">
            {section.title}
          </h3>
        ) : (
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="SECTION TITLE (e.g. PART - A: OBJECTIVE QUESTIONS)"
            className="w-full text-center text-base md:text-lg font-bold uppercase tracking-wide border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
          />
        )}

        {/* Instructions */}
        {readOnly ? (
          section.instructions && (
            <p className="text-xs md:text-sm italic text-gray-700 mt-1">
              ({section.instructions})
            </p>
          )
        ) : (
          <input
            type="text"
            value={section.instructions}
            onChange={(e) => updateInstructions(e.target.value)}
            placeholder="Section instructions (e.g. Answer all questions. Each question carries 2 marks.)"
            className="w-full text-center text-xs md:text-sm italic text-gray-700 mt-1 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
          />
        )}
      </div>

      {/* Question Cards inside this Section */}
      <div className="space-y-1 mt-4">
        {section.questions.map((question, qIdx) => (
          <QuestionCard
            key={question.id}
            question={question}
            questionNumber={questionNumberOffset + qIdx + 1}
            onUpdate={(updated) => handleUpdateQuestion(qIdx, updated)}
            onDelete={() => handleDeleteQuestion(qIdx)}
            onDuplicate={() => handleDuplicateQuestion(qIdx)}
            onMoveUp={() => handleMoveQuestion(qIdx, 'up')}
            onMoveDown={() => handleMoveQuestion(qIdx, 'down')}
            isFirst={qIdx === 0}
            isLast={qIdx === section.questions.length - 1}
            readOnly={readOnly}
            highlightCorrect={highlightCorrect}
          />
        ))}

        {section.questions.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-xs font-sans">
            No questions in this section yet. Add a question below.
          </div>
        )}
      </div>

      {/* Add Question Controls at Bottom of Section */}
      {!readOnly && (
        <div className="mt-4 pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-center gap-2 no-print font-sans">
          <button
            type="button"
            onClick={() => handleAddQuestion('mcq')}
            className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add MCQ
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestion('short_answer')}
            className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Short Answer
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestion('long_answer')}
            className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" /> Add Long Problem
          </button>
        </div>
      )}
    </div>
  );
};
