import type { ExamPaper } from '../types';

export const dsaExamPaper: ExamPaper = {
  id: 'dsa-midterm-2026',
  title: 'Data Structures & Algorithms Mid-Term Exam',
  header: {
    institutionName: 'Department of Computer Science & Engineering',
    departmentName: 'School of Computing and Information Technology',
    examTitle: 'MID-SEMESTER EXAMINATION - AUTUMN 2026',
    courseCode: 'CS302',
    courseName: 'Data Structures and Algorithms',
    duration: '3 Hours',
    date: '14th October 2026',
    maxMarks: 100,
    generalInstructions: [
      'Read all questions carefully before answering.',
      'Section A is compulsory and carries 20 marks.',
      'Answer any four questions from Section B (10 marks each).',
      'Answer any two questions from Section C (20 marks each).',
      'Programmable calculators and mobile phones are strictly prohibited.',
      'Assume suitable data wherever necessary and state your assumptions clearly.',
    ],
  },
  sections: [
    {
      id: 'sec-a',
      title: 'PART - A: Objective & Conceptual Questions',
      instructions: 'Answer all 5 questions. Each question carries 4 marks.',
      marksPerQuestion: 4,
      questions: [
        {
          id: 'q-dsa-1',
          type: 'mcq',
          stem: 'What is the worst-case time complexity of searching an element in a balanced AVL tree with <i>n</i> nodes?',
          marks: 4,
          options: [
            { id: 'opt-1-1', label: 'A', text: 'O(1)', isCorrect: false },
            { id: 'opt-1-2', label: 'B', text: 'O(log n)', isCorrect: true },
            { id: 'opt-1-3', label: 'C', text: 'O(n)', isCorrect: false },
            { id: 'opt-1-4', label: 'D', text: 'O(n log n)', isCorrect: false },
          ],
        },
        {
          id: 'q-dsa-2',
          type: 'mcq',
          stem: 'Which fundamental data structure is primarily utilized to implement Breadth-First Search (BFS) graph traversal?',
          marks: 4,
          options: [
            { id: 'opt-2-1', label: 'A', text: 'Stack (LIFO)', isCorrect: false },
            { id: 'opt-2-2', label: 'B', text: 'Queue (FIFO)', isCorrect: true },
            { id: 'opt-2-3', label: 'C', text: 'Binary Search Tree', isCorrect: false },
            { id: 'opt-2-4', label: 'D', text: 'Disjoint Set (Union-Find)', isCorrect: false },
          ],
        },
        {
          id: 'q-dsa-3',
          type: 'mcq',
          stem: 'What is the worst-case time complexity of QuickSort when the pivot chosen at each partitioning step is the extreme (minimum or maximum) element?',
          marks: 4,
          options: [
            { id: 'opt-3-1', label: 'A', text: 'O(n log n)', isCorrect: false },
            { id: 'opt-3-2', label: 'B', text: 'O(n²)', isCorrect: true },
            { id: 'opt-3-3', label: 'C', text: 'O(n)', isCorrect: false },
            { id: 'opt-3-4', label: 'D', text: 'O(log n)', isCorrect: false },
          ],
        },
        {
          id: 'q-dsa-4',
          type: 'mcq',
          stem: 'In a Min-Heap of <i>n</i> distinct elements, at which position is the minimum element guaranteed to reside?',
          marks: 4,
          options: [
            { id: 'opt-4-1', label: 'A', text: 'At the root node (index 0 / 1)', isCorrect: true },
            { id: 'opt-4-2', label: 'B', text: 'At the leftmost leaf node', isCorrect: false },
            { id: 'opt-4-3', label: 'C', text: 'At index n - 1', isCorrect: false },
            { id: 'opt-4-4', label: 'D', text: 'At any internal node at depth 1', isCorrect: false },
          ],
        },
        {
          id: 'q-dsa-5',
          type: 'mcq',
          stem: 'A hash table with 10 slots (indices 0–9) employs linear probing with hash function h(k) = k mod 10. After inserting keys 23, 43, and 13 in order, which index will key 13 occupy?',
          marks: 4,
          options: [
            { id: 'opt-5-1', label: 'A', text: 'Slot 3', isCorrect: false },
            { id: 'opt-5-2', label: 'B', text: 'Slot 4', isCorrect: false },
            { id: 'opt-5-3', label: 'C', text: 'Slot 5', isCorrect: true },
            { id: 'opt-5-4', label: 'D', text: 'Slot 6', isCorrect: false },
          ],
        },
      ],
    },
    {
      id: 'sec-b',
      title: 'PART - B: Analytical & Design Problems',
      instructions: 'Answer any 4 questions. Each question carries 10 marks.',
      marksPerQuestion: 10,
      questions: [
        {
          id: 'q-dsa-6',
          type: 'short_answer',
          stem: 'Explain Dijkstra’s single-source shortest path algorithm. Illustrate how edge relaxation works and analyze its time complexity using an adjacency list and a binary min-heap priority queue.',
          marks: 10,
          correctAnswerText: 'Standard Dijkstra with min-heap has O((V + E) log V) time complexity.',
        },
        {
          id: 'q-dsa-7',
          type: 'short_answer',
          stem: 'Differentiate between B-Trees and B+ Trees. Why are B+ Trees overwhelmingly preferred for disk-based database storage and block indexing?',
          marks: 10,
          correctAnswerText: 'B+ trees store data pointers exclusively in leaf nodes linked sequentially for range queries.',
        },
        {
          id: 'q-dsa-8',
          type: 'short_answer',
          stem: 'Construct a Red-Black Tree by sequentially inserting the values: [10, 20, 30, 15, 25, 5]. Illustrate the recoloring and rotation steps (Left-Rotate / Right-Rotate) necessary to restore Red-Black properties.',
          marks: 10,
        },
        {
          id: 'q-dsa-9',
          type: 'short_answer',
          stem: 'Describe how cycle detection in a Directed Graph is achieved using Depth First Search (DFS) with three-state vertex coloring (WHITE, GRAY, BLACK). State the condition that indicates a back edge.',
          marks: 10,
        },
      ],
    },
    {
      id: 'sec-c',
      title: 'PART - C: Advanced Algorithmic Synthesis',
      instructions: 'Answer any 2 questions. Each question carries 20 marks.',
      marksPerQuestion: 20,
      questions: [
        {
          id: 'q-dsa-10',
          type: 'long_answer',
          stem: 'Formulate the 0/1 Knapsack Problem using Dynamic Programming. Given capacity W = 8 and items with weights w = [2, 3, 4, 5] and values v = [3, 4, 5, 6], construct the DP table and trace the optimal subset of selected items.',
          marks: 20,
        },
        {
          id: 'q-dsa-11',
          type: 'long_answer',
          stem: 'State the Master Theorem for divide-and-conquer recurrences: T(n) = aT(n/b) + f(n). Apply it to analyze the exact asymptotic bounds of: (i) T(n) = 4T(n/2) + n², (ii) T(n) = 2T(n/2) + n log n.',
          marks: 20,
        },
      ],
    },
  ],
};

export const physicsExamPaper: ExamPaper = {
  id: 'physics-final-2026',
  title: 'Higher Secondary Physics Examination',
  header: {
    institutionName: 'ST. XAVIER SENIOR SECONDARY SCHOOL',
    departmentName: 'Department of Physics & Applied Sciences',
    examTitle: 'ANNUAL BOARD PREPARATORY EXAMINATION - 2026',
    courseCode: 'PHY-12',
    courseName: 'Physics (Theory)',
    duration: '3 Hours',
    date: '18th November 2026',
    maxMarks: 70,
    generalInstructions: [
      'All questions are compulsory.',
      'Section A contains 4 multiple choice questions of 1 mark each.',
      'Section B contains 3 short answer questions of 2 marks each.',
      'Section C contains 2 long derivation questions of 5 marks each.',
      'Use of log tables and physical constants is permitted.',
    ],
  },
  sections: [
    {
      id: 'sec-phy-a',
      title: 'SECTION A: Multiple Choice Questions',
      instructions: 'Each question carries 1 mark. Select the most appropriate option.',
      marksPerQuestion: 1,
      questions: [
        {
          id: 'q-phy-1',
          type: 'mcq',
          stem: 'The electric flux through a Gaussian surface enclosing an electric dipole of dipole moment p is:',
          marks: 1,
          options: [
            { id: 'p1', label: 'A', text: 'Zero', isCorrect: true },
            { id: 'p2', label: 'B', text: 'p / ε₀', isCorrect: false },
            { id: 'p3', label: 'C', text: '2p / ε₀', isCorrect: false },
            { id: 'p4', label: 'D', text: 'Infinite', isCorrect: false },
          ],
        },
        {
          id: 'q-phy-2',
          type: 'mcq',
          stem: 'The magnetic force acting on a charged particle moving parallel to a uniform magnetic field is:',
          marks: 1,
          options: [
            { id: 'p2-1', label: 'A', text: 'qvB', isCorrect: false },
            { id: 'p2-2', label: 'B', text: 'qvB / 2', isCorrect: false },
            { id: 'p2-3', label: 'C', text: 'Zero', isCorrect: true },
            { id: 'p2-4', label: 'D', text: '-qvB', isCorrect: false },
          ],
        },
        {
          id: 'q-phy-3',
          type: 'mcq',
          stem: 'Lenz’s law of electromagnetic induction is a direct consequence of the law of conservation of:',
          marks: 1,
          options: [
            { id: 'p3-1', label: 'A', text: 'Electric Charge', isCorrect: false },
            { id: 'p3-2', label: 'B', text: 'Energy', isCorrect: true },
            { id: 'p3-3', label: 'C', text: 'Linear Momentum', isCorrect: false },
            { id: 'p3-4', label: 'D', text: 'Magnetic Flux', isCorrect: false },
          ],
        },
        {
          id: 'q-phy-4',
          type: 'mcq',
          stem: 'In a purely inductive alternating current circuit, the phase difference between current and voltage is:',
          marks: 1,
          options: [
            { id: 'p4-1', label: 'A', text: 'Current leads voltage by π/2', isCorrect: false },
            { id: 'p4-2', label: 'B', text: 'Current lags voltage by π/2', isCorrect: true },
            { id: 'p4-3', label: 'C', text: 'Current and voltage are in phase', isCorrect: false },
            { id: 'p4-4', label: 'D', text: 'Current lags voltage by π', isCorrect: false },
          ],
        },
      ],
    },
    {
      id: 'sec-phy-b',
      title: 'SECTION B: Short Answer Questions',
      instructions: 'Answer all questions. Each question carries 2 marks.',
      marksPerQuestion: 2,
      questions: [
        {
          id: 'q-phy-5',
          type: 'short_answer',
          stem: 'State Gauss’s theorem in electrostatics. Write its mathematical expression for an arbitrary closed surface.',
          marks: 2,
        },
        {
          id: 'q-phy-6',
          type: 'short_answer',
          stem: 'Define temperature coefficient of resistivity. How does the resistivity of a semiconductor vary with temperature?',
          marks: 2,
        },
        {
          id: 'q-phy-7',
          type: 'short_answer',
          stem: 'What is displacement current? Why did Maxwell introduce this concept into Ampère’s circuital law?',
          marks: 2,
        },
      ],
    },
    {
      id: 'sec-phy-c',
      title: 'SECTION C: Long Answer Derivations',
      instructions: 'Answer all questions. Each question carries 5 marks.',
      marksPerQuestion: 5,
      questions: [
        {
          id: 'q-phy-8',
          type: 'long_answer',
          stem: 'Derive an expression for the capacitance of a parallel plate capacitor with a dielectric slab of thickness t (t < d) introduced between the plates.',
          marks: 5,
        },
        {
          id: 'q-phy-9',
          type: 'long_answer',
          stem: 'Using Biot-Savart Law, derive the magnetic field on the axial line of a circular current-carrying coil of radius R at a distance x from its center.',
          marks: 5,
        },
      ],
    },
  ],
};
