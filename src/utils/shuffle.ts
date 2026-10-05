import type { ExamPaper, GeneratedSet, Question, OptionItem, AnswerKeyEntry } from '../types';

/**
 * Fisher-Yates (Knuth) unbiased array shuffle
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Shuffles MCQ options and updates their labels to (A), (B), (C), (D)...
 * while preserving the correct answer indicator.
 */
function shuffleOptionsList(options: OptionItem[]): OptionItem[] {
  if (!options || options.length <= 1) return options;
  const shuffled = fisherYatesShuffle(options);
  return shuffled.map((opt, idx) => ({
    ...opt,
    label: OPTION_LETTERS[idx] || String.fromCharCode(65 + idx),
  }));
}

/**
 * Builds the original question numbering map (1-indexed global number)
 */
export function getOriginalQuestionNumberMap(masterPaper: ExamPaper): Map<string, number> {
  const map = new Map<string, number>();
  let count = 1;
  for (const sec of masterPaper.sections) {
    for (const q of sec.questions) {
      map.set(q.id, count++);
    }
  }
  return map;
}

/**
 * Generates N shuffled sets from a master ExamPaper with:
 * - Fisher-Yates shuffling within each section
 * - Optional option shuffling (A/B/C/D)
 * - Strict uniqueness validation
 * - Remapped answer keys and permutation tracking
 */
export function generateShuffledSets(
  masterPaper: ExamPaper,
  setCount: number = 4,
  shuffleOptions: boolean = true
): GeneratedSet[] {
  const originalQMap = getOriginalQuestionNumberMap(masterPaper);
  const existingSignatures = new Set<string>();
  const setLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const generatedSets: GeneratedSet[] = [];

  for (let setIdx = 0; setIdx < setCount; setIdx++) {
    const setCode = `Set ${setLetters[setIdx] || String.fromCharCode(65 + setIdx)}`;
    let shuffledSections = masterPaper.sections;
    let signature = '';
    let attempts = 0;

    // Retry shuffle until a unique ordering is achieved (or max attempts reached)
    do {
      attempts++;
      shuffledSections = masterPaper.sections.map((section) => {
        let questions: Question[];
        if (section.questions.length > 1) {
          questions = fisherYatesShuffle(section.questions);
        } else {
          questions = [...section.questions];
        }

        // Shuffle options if requested
        if (shuffleOptions) {
          questions = questions.map((q) => {
            if (q.type === 'mcq' && q.options && q.options.length > 1) {
              return {
                ...q,
                options: shuffleOptionsList(q.options),
              };
            }
            return q;
          });
        }

        return {
          ...section,
          questions,
        };
      });

      signature = shuffledSections
        .map((s) => s.questions.map((q) => q.id).join(','))
        .join('||');
    } while (existingSignatures.has(signature) && attempts < 50);

    existingSignatures.add(signature);

    // Build permutation map and answer key
    const permutationMap: Record<string, { originalIndex: number; newIndex: number }> = {};
    const answerKeys: AnswerKeyEntry[] = [];
    let globalQNum = 1;

    for (const section of shuffledSections) {
      for (const question of section.questions) {
        const origNum = originalQMap.get(question.id) || globalQNum;
        permutationMap[question.id] = {
          originalIndex: origNum,
          newIndex: globalQNum,
        };

        // Determine answer key representation
        let ansText = 'N/A';
        if (question.type === 'mcq' && question.options) {
          const correctOpt = question.options.find((o) => o.isCorrect);
          if (correctOpt) {
            ansText = `(${correctOpt.label}) ${correctOpt.text}`;
          }
        } else if (question.correctAnswerText) {
          ansText = question.correctAnswerText;
        }

        answerKeys.push({
          questionNumber: globalQNum,
          sectionTitle: section.title,
          correctAnswer: ansText,
          originalQuestionNumber: origNum,
        });

        globalQNum++;
      }
    }

    const setPaper: ExamPaper = {
      ...masterPaper,
      sections: shuffledSections,
    };

    generatedSets.push({
      setCode,
      paper: setPaper,
      permutationMap,
      answerKeys,
    });
  }

  return generatedSets;
}
