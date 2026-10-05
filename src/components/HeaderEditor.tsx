import React from 'react';
import type { ExamHeader } from '../types';
import { Plus, Trash2, Calendar, Clock, Award, BookOpen, Sparkles } from 'lucide-react';

interface HeaderEditorProps {
  header: ExamHeader;
  onChange: (updated: ExamHeader) => void;
  setCodeLabel?: string;
  readOnly?: boolean;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({
  header,
  onChange,
  setCodeLabel = 'MASTER TEMPLATE',
  readOnly = false,
}) => {
  const updateField = <K extends keyof ExamHeader>(key: K, value: ExamHeader[K]) => {
    if (readOnly) return;
    onChange({
      ...header,
      [key]: value,
    });
  };

  const updateInstruction = (index: number, text: string) => {
    if (readOnly) return;
    const newInstructions = [...header.generalInstructions];
    newInstructions[index] = text;
    onChange({ ...header, generalInstructions: newInstructions });
  };

  const addInstruction = () => {
    if (readOnly) return;
    onChange({
      ...header,
      generalInstructions: [...header.generalInstructions, 'New examination rule or instruction.'],
    });
  };

  const removeInstruction = (index: number) => {
    if (readOnly) return;
    const newInstructions = header.generalInstructions.filter((_, i) => i !== index);
    onChange({ ...header, generalInstructions: newInstructions });
  };

  const isMaster = setCodeLabel.toUpperCase().includes('MASTER');

  return (
    <div className="exam-header-block page-break-avoid border-b-2 border-slate-900 pb-5 mb-6 text-slate-900 font-serif">
      {/* Top Banner Row: Confidential Mark & Set Code Badge */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-sans font-bold tracking-widest text-slate-500 uppercase">
            Confidential / Official Examination
          </span>
          {!readOnly && (
            <span className="no-print text-[10px] font-sans font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Live Editor
            </span>
          )}
        </div>

        {/* Set Badge */}
        <div
          className={`font-sans font-extrabold px-3 py-1 rounded text-xs tracking-wider uppercase shadow-xs transition-colors ${
            isMaster
              ? 'bg-slate-900 text-white'
              : 'bg-blue-700 text-white ring-1 ring-blue-800'
          }`}
        >
          {setCodeLabel}
        </div>
      </div>

      {/* Institution Name */}
      <div className="text-center mb-1">
        {readOnly ? (
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-slate-950 font-serif">
            {header.institutionName || 'INSTITUTION / UNIVERSITY NAME'}
          </h1>
        ) : (
          <input
            type="text"
            value={header.institutionName}
            onChange={(e) => updateField('institutionName', e.target.value)}
            placeholder="INSTITUTION / UNIVERSITY NAME"
            className="w-full text-center text-xl md:text-2xl font-bold uppercase tracking-wide border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-blue-50/20 focus:outline-none transition-all bg-transparent rounded-sm py-0.5"
          />
        )}
      </div>

      {/* Department Name */}
      <div className="text-center mb-2">
        {readOnly ? (
          <p className="text-sm italic text-slate-700 font-serif">{header.departmentName}</p>
        ) : (
          <input
            type="text"
            value={header.departmentName || ''}
            onChange={(e) => updateField('departmentName', e.target.value)}
            placeholder="Department / Faculty / School (e.g. Department of Computer Science)"
            className="w-full text-center text-sm italic text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-blue-50/20 focus:outline-none transition-all bg-transparent rounded-sm py-0.5"
          />
        )}
      </div>

      {/* Exam Title */}
      <div className="text-center mb-4">
        {readOnly ? (
          <h2 className="text-lg md:text-xl font-bold tracking-normal uppercase underline decoration-1 underline-offset-4 text-slate-900 font-serif">
            {header.examTitle}
          </h2>
        ) : (
          <input
            type="text"
            value={header.examTitle}
            onChange={(e) => updateField('examTitle', e.target.value)}
            placeholder="EXAMINATION TITLE (e.g. MID-SEMESTER EXAMINATION - 2026)"
            className="w-full text-center text-lg md:text-xl font-bold tracking-normal uppercase border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-blue-50/20 focus:outline-none transition-all bg-transparent rounded-sm py-0.5"
          />
        )}
      </div>

      {/* Exam Metadata Grid (Academic 4-box layout) */}
      <div className="border-t border-b border-slate-900 py-2.5 my-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-sm bg-slate-50/40 print:bg-transparent px-2.5 rounded-sm print:px-0">
        {/* Course Code & Name */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-500 shrink-0 no-print" />
          <span className="font-bold text-slate-900 shrink-0">Course:</span>
          {readOnly ? (
            <span className="text-slate-800 font-medium">
              {header.courseCode ? `${header.courseCode} - ` : ''}
              {header.courseName}
            </span>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <input
                type="text"
                value={header.courseCode}
                onChange={(e) => updateField('courseCode', e.target.value)}
                placeholder="Code (CS302)"
                className="w-24 px-1.5 py-0.5 border border-slate-300 rounded font-semibold text-xs focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <span className="text-slate-400 font-sans">-</span>
              <input
                type="text"
                value={header.courseName}
                onChange={(e) => updateField('courseName', e.target.value)}
                placeholder="Course Name"
                className="flex-1 min-w-0 px-1.5 py-0.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          )}
        </div>

        {/* Max Marks */}
        <div className="flex items-center justify-start md:justify-end gap-2">
          <Award className="w-4 h-4 text-slate-500 shrink-0 no-print" />
          <span className="font-bold text-slate-900">Maximum Marks:</span>
          {readOnly ? (
            <span className="font-bold text-slate-950 font-sans bg-slate-100 px-2 py-0.5 rounded print:bg-transparent print:p-0">
              {header.maxMarks}
            </span>
          ) : (
            <input
              type="number"
              value={header.maxMarks}
              onChange={(e) => updateField('maxMarks', parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-0.5 border border-slate-300 rounded font-bold text-center text-xs focus:ring-1 focus:ring-blue-500 bg-white"
            />
          )}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500 shrink-0 no-print" />
          <span className="font-bold text-slate-900">Duration:</span>
          {readOnly ? (
            <span className="text-slate-800">{header.duration}</span>
          ) : (
            <input
              type="text"
              value={header.duration}
              onChange={(e) => updateField('duration', e.target.value)}
              placeholder="e.g. 3 Hours"
              className="w-32 px-1.5 py-0.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white"
            />
          )}
        </div>

        {/* Date */}
        <div className="flex items-center justify-start md:justify-end gap-2">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0 no-print" />
          <span className="font-bold text-slate-900">Date:</span>
          {readOnly ? (
            <span className="text-slate-800">{header.date}</span>
          ) : (
            <input
              type="text"
              value={header.date}
              onChange={(e) => updateField('date', e.target.value)}
              placeholder="e.g. 14th October 2026"
              className="w-40 px-1.5 py-0.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 bg-white"
            />
          )}
        </div>
      </div>

      {/* General Instructions Section */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 italic">
            General Instructions:
          </h3>
          {!readOnly && (
            <button
              type="button"
              onClick={addInstruction}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans font-semibold no-print transition-colors px-2 py-0.5 rounded hover:bg-blue-50"
            >
              <Plus className="w-3 h-3" /> Add Rule
            </button>
          )}
        </div>

        <ol className="list-decimal list-outside ml-5 text-xs text-slate-800 space-y-1 leading-relaxed">
          {header.generalInstructions.map((instruction, idx) => (
            <li key={idx} className="group/rule pl-1">
              <div className="flex items-center justify-between gap-2">
                {readOnly ? (
                  <span>{instruction}</span>
                ) : (
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => updateInstruction(idx, e.target.value)}
                    className="flex-1 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-blue-50/20 focus:outline-none bg-transparent py-0.5 rounded-sm"
                  />
                )}
                {!readOnly && header.generalInstructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(idx)}
                    className="opacity-0 group-hover/rule:opacity-100 text-slate-400 hover:text-red-600 p-0.5 no-print transition-all rounded"
                    title="Remove rule"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
