import { useState, useRef } from 'react';
import type { ExamPaper, ExamSection, GeneratedSet } from './types';
import { dsaExamPaper } from './data/samplePapers';
import { RibbonToolbar } from './components/RibbonToolbar';
import { SetTabsBar } from './components/SetTabsBar';
import { HeaderEditor } from './components/HeaderEditor';
import { SectionBlock } from './components/SectionBlock';
import { ShuffleMatrixModal } from './components/ShuffleMatrixModal';
import { generateShuffledSets } from './utils/shuffle';
import { downloadSetDocx } from './utils/docxExport';
import { downloadPaperAsPdf, printCleanPaper, getExamFilename } from './utils/pdfExport';
import { Plus, CheckCircle2, Info, ArrowLeft } from 'lucide-react';

export function App() {
  const [paper, setPaper] = useState<ExamPaper>(dsaExamPaper);
  const [generatedSets, setGeneratedSets] = useState<GeneratedSet[]>([]);
  const [activeSetIndex, setActiveSetIndex] = useState<number>(-1); // -1: Master draft, 0..N: Shuffled sets
  const [setCount, setSetCount] = useState<number>(4);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [isShuffleMatrixOpen, setIsShuffleMatrixOpen] = useState<boolean>(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Section operations on master paper
  const handleAddSection = () => {
    const newSecNum = paper.sections.length + 1;
    const now = Date.now();
    const newSection: ExamSection = {
      id: `sec-${now}`,
      title: `PART - ${String.fromCharCode(64 + newSecNum)}: New Section`,
      instructions: 'Answer all questions in this section.',
      questions: [
        {
          id: `q-${now}`,
          type: 'mcq',
          stem: 'Sample multiple choice question stem.',
          marks: 2,
          options: [
            { id: `opt-1-${now}`, label: 'A', text: 'Option A statement', isCorrect: true },
            { id: `opt-2-${now}`, label: 'B', text: 'Option B statement', isCorrect: false },
            { id: `opt-3-${now}`, label: 'C', text: 'Option C statement', isCorrect: false },
            { id: `opt-4-${now}`, label: 'D', text: 'Option D statement', isCorrect: false },
          ],
        },
      ],
    };
    setPaper({
      ...paper,
      sections: [...paper.sections, newSection],
    });
    // Invalidate generated sets on master structure change
    if (generatedSets.length > 0) {
      setGeneratedSets([]);
      setActiveSetIndex(-1);
      showToast('Master paper updated. Re-generate sets when ready.');
    }
  };

  const handleUpdateSection = (index: number, updated: ExamSection) => {
    const newSections = [...paper.sections];
    newSections[index] = updated;
    setPaper({ ...paper, sections: newSections });
  };

  const handleDeleteSection = (index: number) => {
    if (paper.sections.length <= 1) {
      alert('An exam paper must contain at least one section.');
      return;
    }
    if (window.confirm('Delete this entire section and its questions?')) {
      const newSections = paper.sections.filter((_, i) => i !== index);
      setPaper({ ...paper, sections: newSections });
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= paper.sections.length) return;
    const newSections = [...paper.sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIdx, 0, moved);
    setPaper({ ...paper, sections: newSections });
  };

  const handleAddQuestion = (type: 'mcq' | 'short_answer') => {
    if (paper.sections.length === 0) {
      handleAddSection();
      return;
    }
    const lastSectionIdx = paper.sections.length - 1;
    const lastSection = paper.sections[lastSectionIdx];
    const now = Date.now();
    const newQ = {
      id: `q-${now}`,
      type,
      stem: type === 'mcq' ? 'New multiple choice question stem.' : 'New descriptive question stem.',
      marks: type === 'mcq' ? 2 : 5,
      options:
        type === 'mcq'
          ? [
              { id: `opt-1-${now}`, label: 'A', text: 'Choice 1', isCorrect: true },
              { id: `opt-2-${now}`, label: 'B', text: 'Choice 2', isCorrect: false },
              { id: `opt-3-${now}`, label: 'C', text: 'Choice 3', isCorrect: false },
              { id: `opt-4-${now}`, label: 'D', text: 'Choice 4', isCorrect: false },
            ]
          : undefined,
    };
    const updatedSec = {
      ...lastSection,
      questions: [...lastSection.questions, newQ],
    };
    handleUpdateSection(lastSectionIdx, updatedSec);
  };

  // Generate Multi-Sets using Fisher-Yates
  const handleGenerateSets = () => {
    const totalQ = paper.sections.reduce((acc, s) => acc + s.questions.length, 0);
    if (totalQ === 0) {
      alert('Please add at least one question before generating sets.');
      return;
    }
    const sets = generateShuffledSets(paper, setCount, shuffleOptions);
    setGeneratedSets(sets);
    setActiveSetIndex(0); // Switch to Set A view
    showToast(`Successfully generated ${setCount} unique shuffled sets (Set A to Set ${sets[sets.length - 1].setCode.split(' ')[1]})!`);
  };

  // Active view: either master paper or a generated set
  const currentPaper = activeSetIndex >= 0 && generatedSets[activeSetIndex]
    ? generatedSets[activeSetIndex].paper
    : paper;

  const currentSetCode = activeSetIndex >= 0 && generatedSets[activeSetIndex]
    ? generatedSets[activeSetIndex].setCode
    : 'MASTER TEMPLATE';

  const isReadOnly = activeSetIndex >= 0;

  // Precalculate section question number offsets for pure consecutive numbering across sections
  const sectionOffsets = currentPaper.sections.reduce<number[]>((acc, _sec, idx) => {
    if (idx === 0) return [0];
    const prevCount = acc[idx - 1] + currentPaper.sections[idx - 1].questions.length;
    return [...acc, prevCount];
  }, []);

  // Direct clean PDF download (No watermarks, No localhost URL)
  const handleDownloadPdf = async () => {
    if (!canvasRef.current) return;
    setIsGeneratingPdf(true);
    showToast(`Generating clean A4 PDF for ${currentSetCode}...`);

    try {
      const filename = getExamFilename(currentPaper, currentSetCode, 'pdf');
      await downloadPaperAsPdf(canvasRef.current, filename);
      showToast(`Downloaded clean PDF: ${filename}`);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('Opening clean print preview...');
      handlePrintPdf();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Clean Browser Print / Save as PDF (Stripped headers & footers)
  const handlePrintPdf = () => {
    const cleanTitle = getExamFilename(currentPaper, currentSetCode, '').replace(/\.$/, '');
    printCleanPaper(cleanTitle);
  };

  // Word (.docx) export
  const handleExportDocx = () => {
    if (activeSetIndex >= 0 && generatedSets[activeSetIndex]) {
      downloadSetDocx(generatedSets[activeSetIndex]);
    } else {
      // Export master paper
      const masterSet: GeneratedSet = {
        setCode: 'Master Set',
        paper,
        permutationMap: {},
        answerKeys: [],
      };
      downloadSetDocx(masterSet);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      {/* Top Ribbon & Format Toolbar */}
      <RibbonToolbar
        paper={paper}
        setPaper={setPaper}
        onAddSection={handleAddSection}
        onAddQuestion={handleAddQuestion}
        onGenerateSets={handleGenerateSets}
        onOpenShuffleMatrix={() => setIsShuffleMatrixOpen(true)}
        hasGeneratedSets={generatedSets.length > 0}
        setCount={setCount}
        setSetCount={setSetCount}
        shuffleOptions={shuffleOptions}
        setShuffleOptions={setShuffleOptions}
        onDownloadPdf={handleDownloadPdf}
        onPrintPdf={handlePrintPdf}
        onExportDocx={handleExportDocx}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Set Tabs (when sets are generated) */}
      <SetTabsBar
        sets={generatedSets}
        activeSetIndex={activeSetIndex}
        onSelectSet={setActiveSetIndex}
        onOpenShuffleMatrix={() => setIsShuffleMatrixOpen(true)}
        showCorrectAnswers={showCorrectAnswers}
        setShowCorrectAnswers={setShowCorrectAnswers}
        masterPaper={paper}
        onDownloadCurrentSetPdf={handleDownloadPdf}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 no-print border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Read-Only Notice when viewing a Generated Set */}
      {isReadOnly && (
        <div className="bg-blue-50/90 border-b border-blue-200 py-2 px-4 text-center text-xs text-blue-900 font-medium no-print flex items-center justify-center gap-2 shadow-2xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Viewing permutation: <strong className="text-blue-950 font-bold">{currentSetCode}</strong>.
            Questions and choices are shuffled according to Fisher–Yates.
          </span>
          <button
            type="button"
            onClick={() => setActiveSetIndex(-1)}
            className="ml-2 px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Master Template
          </button>
        </div>
      )}

      {/* Main Canvas Workspace */}
      <main className="flex-1 py-8 px-2 sm:px-4 md:px-8 overflow-y-auto">
        <div
          ref={canvasRef}
          className="a4-canvas-container a4-page"
        >
          {/* Header & Exam Metadata */}
          <HeaderEditor
            header={currentPaper.header}
            onChange={(updatedHeader) => setPaper({ ...paper, header: updatedHeader })}
            setCodeLabel={currentSetCode}
            readOnly={isReadOnly}
          />

          {/* Sections List */}
          {currentPaper.sections.map((section, sIdx) => {
            const offset = sectionOffsets[sIdx] || 0;

            return (
              <SectionBlock
                key={section.id}
                section={section}
                sectionIndex={sIdx}
                questionNumberOffset={offset}
                onUpdateSection={(updatedSec) => handleUpdateSection(sIdx, updatedSec)}
                onDeleteSection={() => handleDeleteSection(sIdx)}
                onMoveSectionUp={() => handleMoveSection(sIdx, 'up')}
                onMoveSectionDown={() => handleMoveSection(sIdx, 'down')}
                isFirstSection={sIdx === 0}
                isLastSection={sIdx === currentPaper.sections.length - 1}
                readOnly={isReadOnly}
                highlightCorrect={showCorrectAnswers}
              />
            );
          })}

          {/* Canvas Bottom Action: Add Section */}
          {!isReadOnly && (
            <div className="text-center pt-5 pb-3 border-t border-dashed border-slate-300 no-print">
              <button
                type="button"
                onClick={handleAddSection}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all"
              >
                <Plus className="w-4 h-4 text-blue-600" /> + Add Another Section (Part)
              </button>
            </div>
          )}

          {/* Page Footer / End of Paper mark */}
          <div className="mt-12 text-center text-xs text-slate-500 font-serif border-t border-slate-200 pt-4 tracking-wider select-none">
            *** END OF EXAMINATION PAPER ***
          </div>
        </div>
      </main>

      {/* Evaluator Shuffle Matrix Modal */}
      <ShuffleMatrixModal
        isOpen={isShuffleMatrixOpen}
        onClose={() => setIsShuffleMatrixOpen(false)}
        sets={generatedSets}
        masterPaper={paper}
      />
    </div>
  );
}

export default App;
