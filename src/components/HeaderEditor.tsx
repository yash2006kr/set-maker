import React from 'react';
import type { ExamHeader } from '../types';
import { Plus, Trash2, Calendar, Clock, Award, BookOpen } from 'lucide-react';

interface HeaderEditorProps {
  header: ExamHeader;
  onChange: (updated: ExamHeader) => void;
  setCodeLabel?: string;
  readOnly?: boolean;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({
  header,
  onChange,
  setCodeLabel = 'MASTER PAPER',
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
      generalInstructions: [...header.generalInstructions, 'New examination instruction.'],
    });
  };

  const removeInstruction = (index: number) => {
    if (readOnly) return;
    const newInstructions = header.generalInstructions.filter((_, i) => i !== index);
    onChange({ ...header, generalInstructions: newInstructions });
  };

  return (
    <div className="border-b-2 border-gray-900 pb-5 mb-6 text-gray-900 font-serif">
      {/* Top Set Badge */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs uppercase tracking-wider text-gray-500 font-sans font-semibold">
          Examination Paper Template
        </span>
        <div className="bg-gray-900 text-white font-sans font-bold px-3 py-1 rounded text-xs tracking-wider uppercase shadow-sm">
          {setCodeLabel}
        </div>
      </div>

      {/* Institution Name */}
      <div className="text-center mb-1">
        {readOnly ? (
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide">
            {header.institutionName}
          </h1>
        ) : (
          <input
            type="text"
            value={header.institutionName}
            onChange={(e) => updateField('institutionName', e.target.value)}
            placeholder="INSTITUTION / UNIVERSITY NAME"
            className="w-full text-center text-xl md:text-2xl font-bold uppercase tracking-wide border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
          />
        )}
      </div>

      {/* Department Name */}
      <div className="text-center mb-2">
        {readOnly ? (
          <p className="text-sm italic text-gray-700">{header.departmentName}</p>
        ) : (
          <input
            type="text"
            value={header.departmentName || ''}
            onChange={(e) => updateField('departmentName', e.target.value)}
            placeholder="Department / Faculty / School Name"
            className="w-full text-center text-sm italic text-gray-700 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
          />
        )}
      </div>

      {/* Exam Title */}
      <div className="text-center mb-4">
        {readOnly ? (
          <h2 className="text-lg md:text-xl font-bold tracking-normal uppercase underline decoration-1 underline-offset-4">
            {header.examTitle}
          </h2>
        ) : (
          <input
            type="text"
            value={header.examTitle}
            onChange={(e) => updateField('examTitle', e.target.value)}
            placeholder="EXAMINATION TITLE (e.g. MID-SEMESTER EXAMINATION - 2026)"
            className="w-full text-center text-lg md:text-xl font-bold tracking-normal uppercase border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
          />
        )}
      </div>

      {/* Exam Metadata Grid */}
      <div className="border-t border-b border-gray-800 py-2.5 my-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {/* Course Code & Name */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gray-600 shrink-0 no-print" />
          <span className="font-bold">Course:</span>
          {readOnly ? (
            <span>
              {header.courseCode ? `${header.courseCode} - ` : ''}
              {header.courseName}
            </span>
          ) : (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={header.courseCode}
                onChange={(e) => updateField('courseCode', e.target.value)}
                placeholder="Code (CS302)"
                className="w-24 px-1 py-0.5 border border-gray-200 rounded font-semibold text-xs focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="text"
                value={header.courseName}
                onChange={(e) => updateField('courseName', e.target.value)}
                placeholder="Course Name"
                className="flex-1 px-1 py-0.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Max Marks */}
        <div className="flex items-center justify-start md:justify-end gap-2">
          <Award className="w-4 h-4 text-gray-600 shrink-0 no-print" />
          <span className="font-bold">Maximum Marks:</span>
          {readOnly ? (
            <span className="font-bold">{header.maxMarks}</span>
          ) : (
            <input
              type="number"
              value={header.maxMarks}
              onChange={(e) => updateField('maxMarks', parseInt(e.target.value) || 0)}
              className="w-16 px-1.5 py-0.5 border border-gray-200 rounded font-bold text-center text-xs focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600 shrink-0 no-print" />
          <span className="font-bold">Duration:</span>
          {readOnly ? (
            <span>{header.duration}</span>
          ) : (
            <input
              type="text"
              value={header.duration}
              onChange={(e) => updateField('duration', e.target.value)}
              placeholder="3 Hours"
              className="w-32 px-1 py-0.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Date */}
        <div className="flex items-center justify-start md:justify-end gap-2">
          <Calendar className="w-4 h-4 text-gray-600 shrink-0 no-print" />
          <span className="font-bold">Date:</span>
          {readOnly ? (
            <span>{header.date}</span>
          ) : (
            <input
              type="text"
              value={header.date}
              onChange={(e) => updateField('date', e.target.value)}
              placeholder="e.g. 14th October 2026"
              className="w-40 px-1 py-0.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      {/* General Instructions Section */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 italic">
            General Instructions:
          </h3>
          {!readOnly && (
            <button
              type="button"
              onClick={addInstruction}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans font-medium no-print transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Rule
            </button>
          )}
        </div>

        <ol className="list-decimal list-outside ml-5 text-xs text-gray-800 space-y-1">
          {header.generalInstructions.map((instruction, idx) => (
            <li key={idx} className="group">
              <div className="flex items-center justify-between gap-2">
                {readOnly ? (
                  <span>{instruction}</span>
                ) : (
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => updateInstruction(idx, e.target.value)}
                    className="flex-1 border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none bg-transparent py-0.5"
                  />
                )}
                {!readOnly && header.generalInstructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(idx)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 no-print transition-opacity"
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
