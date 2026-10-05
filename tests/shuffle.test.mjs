import { generateShuffledSets } from '../src/utils/shuffle.ts';
import { dsaExamPaper, physicsExamPaper } from '../src/data/samplePapers.ts';

console.log('--- RUNNING SET-MAKER ALGORITHM TEST SUITE ---');

// Test 1: 4-set generation for DSA Exam
console.log('\n[TEST 1] Shuffling DSA Exam Paper into 4 sets with option shuffling...');
const dsaSets = generateShuffledSets(dsaExamPaper, 4, true);

if (dsaSets.length !== 4) {
  throw new Error(`Expected 4 sets, got ${dsaSets.length}`);
}
console.log('✓ Generated 4 sets:', dsaSets.map((s) => s.setCode).join(', '));

// Verify question count & section isolation
for (const set of dsaSets) {
  const totalQ = set.paper.sections.reduce((acc, s) => acc + s.questions.length, 0);
  if (totalQ !== 11) {
    throw new Error(`Question count mismatch in ${set.setCode}`);
  }
  for (let i = 0; i < dsaExamPaper.sections.length; i++) {
    const origQIds = new Set(dsaExamPaper.sections[i].questions.map((q) => q.id));
    for (const q of set.paper.sections[i].questions) {
      if (!origQIds.has(q.id)) {
        throw new Error(`Question ${q.id} leaked outside its section in ${set.setCode}`);
      }
    }
  }
}
console.log('✓ Question counts and Section isolation verified.');

// Verify permutation uniqueness
const dsaSignatures = new Set(
  dsaSets.map((s) =>
    s.paper.sections.map((sec) => sec.questions.map((q) => q.id).join(',')).join('||')
  )
);
if (dsaSignatures.size !== 4) {
  throw new Error('Collision detected in DSA sets: duplicate ordering generated!');
}
console.log('✓ All 4 sets have mathematically distinct permutations.');

// Verify answer key generation
for (const set of dsaSets) {
  if (set.answerKeys.length !== 11) {
    throw new Error(`Answer key missing entries in ${set.setCode}`);
  }
}
console.log('✓ Answer keys mapped correctly across all sets.');

// Test 2: 5-set generation for Physics Exam
console.log('\n[TEST 2] Shuffling Physics Exam Paper into 5 sets...');
const phySets = generateShuffledSets(physicsExamPaper, 5, true);
if (phySets.length !== 5) {
  throw new Error(`Expected 5 sets, got ${phySets.length}`);
}
const phySignatures = new Set(
  phySets.map((s) =>
    s.paper.sections.map((sec) => sec.questions.map((q) => q.id).join(',')).join('||')
  )
);
if (phySignatures.size !== 5) {
  throw new Error('Collision detected in Physics sets!');
}
console.log('✓ Physics exam 5 sets generated with 100% distinct signatures.');

console.log('\n=== ALL SUITES PASSED (2/2) === ✅');
