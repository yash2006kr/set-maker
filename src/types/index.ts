export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'numerical';

export interface OptionItem {
  id: string;
  label: string; // "A", "B", "C", "D", etc.
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  stem: string;
  marks: number;
  options?: OptionItem[]; // For MCQ
  answerExplanation?: string;
  correctAnswerText?: string; // For numerical / short
}

export interface ExamSection {
  id: string;
  title: string; // e.g. "PART - A (Objective Type)"
  instructions: string; // e.g. "Answer all questions. Each question carries 2 marks."
  marksPerQuestion?: number;
  questions: Question[];
}

export interface ExamHeader {
  institutionName: string;
  departmentName?: string;
  examTitle: string; // e.g. "Mid-Semester Examination - Autumn 2026"
  courseCode: string; // e.g. "CS302"
  courseName: string; // e.g. "Design & Analysis of Algorithms"
  duration: string; // e.g. "3 Hours"
  date: string;
  maxMarks: number;
  generalInstructions: string[];
}

export interface ExamPaper {
  id: string;
  title: string;
  header: ExamHeader;
  sections: ExamSection[];
}

export interface AnswerKeyEntry {
  questionNumber: number;
  sectionTitle: string;
  correctAnswer: string; // e.g. "B" or answer text
  originalQuestionNumber: number;
}

export interface GeneratedSet {
  setCode: string; // "Set A", "Set B", "Set C", "Set D"
  paper: ExamPaper;
  // maps question id to { originalGlobalIndex, newGlobalIndex }
  permutationMap: Record<string, { originalIndex: number; newIndex: number }>;
  answerKeys: AnswerKeyEntry[];
}
