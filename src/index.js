/**
 * CraftMind Ranch — entry point.
 */

import { SPECIES } from './species.js';
import { createDNA } from './dna.js';
import { calculateFitness } from './fitness.js';
import { Population } from './population.js';
import { EvolutionEngine } from './evolution.js';
import { TASKS } from './farm-tasks.js';

export { SPECIES, getSpecies, allSpecies } from './species.js';
export { createDNA, cloneDNA, crossoverDNA, mutateDNA, adjustTaskWeight, dnaToMarkdown } from './dna.js';
export { calculateFitness, createRecord, categoryScores, buildLeaderboard } from './fitness.js';
export { Population } from './population.js';
export { EvolutionEngine } from './evolution.js';
export { TASKS, getTask, allTasks, getTasksByCategory, buildChain } from './farm-tasks.js';
export { analyzeTask, assignTask, learnFromOutcome } from './routing.js';
export { startDashboard } from './dashboard.js';
export { SimulationRunner, SimulationConfig, runFromCLI as runSimulationCLI } from './simulation.js';
export { Dashboard, renderFitnessChart, renderTraits, renderComparison } from './visualization.js';
export { ExperimentRunner, ExperimentResults, runFromCLI as runExperimentsCLI } from './experiments.js';

/**
 * Register ranch features with CraftMind Core.
 * @param {object} core - Core instance with registerPlugin()
 */
export function registerWithCore(core) {
  core.registerPlugin('ranch', {
    name: 'CraftMind Ranch',
    version: '1.0.0',
    modules: { Population, EvolutionEngine, SPECIES, createDNA, calculateFitness, TASKS },
  });
}
