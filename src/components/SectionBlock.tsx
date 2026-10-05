import React from 'react';
import type { ExamSection, Question, QuestionType } from '../types';
import { QuestionCard } from './QuestionCard';
import { Plus, Trash2, ArrowUp, ArrowDown, BookOpen } from 'lucide-react';

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

function generateSuffix(index: number): string {
  return `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;
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
    const uniqueSuffix = generateSuffix(qIndex);
    const duplicated: Question = {
      ...target,
      id: `q-${uniqueSuffix}`,
      options: target.options
        ? target.options.map((o, oIdx) => ({
            ...o,
            id: `opt-${uniqueSuffix}-${oIdx}`,
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
    const uniqueSuffix = generateSuffix(section.questions.length);
    const newQ: Question = {
      id: `q-${uniqueSuffix}`,
      type,
      stem:
        type === 'mcq'
          ? 'New Multiple Choice Question statement'
          : 'New Short/Descriptive Question statement',
      marks: type === 'mcq' ? 2 : 5,
      options:
        type === 'mcq'
          ? [
              { id: `opt-1-${uniqueSuffix}`, label: 'A', text: 'Option A statement', isCorrect: true },
              { id: `opt-2-${uniqueSuffix}`, label: 'B', text: 'Option B statement', isCorrect: false },
              { id: `opt-3-${uniqueSuffix}`, label: 'C', text: 'Option C statement', isCorrect: false },
              { id: `opt-4-${uniqueSuffix}`, label: 'D', text: 'Option D statement', isCorrect: false },
            ]
          : undefined,
    };
    onUpdateSection({ ...section, questions: [...section.questions, newQ] });
  };

  return (
    <div className="mb-8 border border-slate-200/90 rounded-xl p-3.5 md:p-4 bg-slate-50/40 hover:bg-slate-50/70 transition-colors print:border-none print:bg-transparent print:p-0 print:m-0 print:mb-6 section-header-block">
      {/* Section Header Controls (Hidden in Print) */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 no-print font-sans">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Section
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {section.questions.length} Questions &bull; Total: <span className="font-bold text-slate-800">{totalSectionMarks} Marks</span>
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            {onMoveSectionUp && (
              <button
                type="button"
                onClick={onMoveSectionUp}
                disabled={isFirstSection}
                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 rounded hover:bg-slate-100 transition-colors"
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
                className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 rounded hover:bg-slate-100 transition-colors"
                title="Move Section Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onDeleteSection}
              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors ml-0.5"
              title="Delete Section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Printable Section Title & Instructions */}
      <div className="text-center my-3 font-serif page-break-avoid">
        {readOnly ? (
          <h3 className="text-base md:text-lg font-bold uppercase tracking-wide underline decoration-1 underline-offset-4 text-slate-950 font-serif">
            {section.title}
          </h3>
        ) : (
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="SECTION TITLE (e.g. PART - A: OBJECTIVE QUESTIONS)"
            className="w-full text-center text-base md:text-lg font-bold uppercase tracking-wide border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-blue-50/20 focus:outline-none bg-transparent rounded-sm py-0.5"
          />
        )}

        {/* Section Instructions */}
        {readOnly ? (
          section.instructions && (
            <p className="text-xs md:text-sm italic text-slate-700 mt-1 font-serif">
              ({section.instructions})
            </p>
          )
        ) : (
          <input
            type="text"
            value={section.instructions}
            onChange={(e) => updateInstructions(e.target.value)}
            placeholder="Section instructions (e.g. Answer all questions. Each question carries 2 marks.)"
            className="w-full text-center text-xs md:text-sm italic text-slate-700 mt-1 border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-blue-50/20 focus:outline-none bg-transparent rounded-sm py-0.5"
          />
        )}
      </div>

      {/* Question Cards inside this Section */}
      <div className="space-y-1.5 mt-4">
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
          <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs font-sans no-print">
            No questions in this section yet. Add a question below.
          </div>
        )}
      </div>

      {/* Add Question Controls at Bottom of Section */}
      {!readOnly && (
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2 no-print font-sans">
          <button
            type="button"
            onClick={() => handleAddQuestion('mcq')}
            className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> + Add MCQ
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestion('short_answer')}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Short Answer
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestion('long_answer')}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Long Problem
          </button>
        </div>
      )}
    </div>
  );
};
