/**
 * CraftMind Ranch — entry point.
 */

export { SPECIES, getSpecies, allSpecies } from './species.js';
export { createDNA, cloneDNA, crossoverDNA, mutateDNA, adjustTaskWeight, dnaToMarkdown } from './dna.js';
export { calculateFitness, createRecord, categoryScores, buildLeaderboard } from './fitness.js';
export { Population } from './population.js';
export { EvolutionEngine } from './evolution.js';
export { TASKS, getTask, allTasks, getTasksByCategory, buildChain } from './farm-tasks.js';
export { analyzeTask, assignTask, learnFromOutcome } from './routing.js';
export { startDashboard } from './dashboard.js';
