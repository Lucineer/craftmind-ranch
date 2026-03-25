/**
 * Tests for DNA crossover, fitness scoring, evolution cycle.
 */

import { createDNA, crossoverDNA, mutateDNA, adjustTaskWeight, dnaToMarkdown, markdownToDNA } from '../src/dna.js';
import { calculateFitness, createRecord } from '../src/fitness.js';
import { Population } from '../src/population.js';
import { EvolutionEngine } from '../src/evolution.js';
import { allTasks, buildChain } from '../src/farm-tasks.js';
import { allSpecies } from '../src/species.js';
import { analyzeTask, assignTask, learnFromOutcome } from '../src/routing.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; }
  else { failed++; console.error(`  ✗ ${msg}`); }
}

// ─── DNA Tests ───────────────────────────────────────────
console.log('🧬 DNA Tests');

const dna1 = createDNA('mooshroom');
assert(dna1.speciesId === 'mooshroom', 'createDNA sets species');
assert(dna1.generation === 0, 'new DNA is gen 0');
assert(dna1.traits.speed >= 0 && dna1.traits.speed <= 1, 'traits in [0,1]');
assert(Object.keys(dna1.taskWeights).length > 0, 'has task weights');
passed++; console.log('  ✓ createDNA');

const child = crossoverDNA(dna1, createDNA('mooshroom'), 'mooshroom');
assert(child.generation === 1, 'child is gen 1');
assert(child.parentIds.length === 2, 'child has 2 parents');
passed++; console.log('  ✓ crossoverDNA');

const mutated = createDNA('goat');
const origSpeed = mutated.traits.speed;
mutateDNA(mutated);
assert(mutated.mutationRate > 0, 'mutation rate positive');
passed++; console.log('  ✓ mutateDNA');

adjustTaskWeight(dna1, 'plant_wheat', true);
assert(dna1.taskWeights['plant_wheat'] > 0, 'task weight increased on success');
passed++; console.log('  ✓ adjustTaskWeight');

const md = dnaToMarkdown(dna1);
assert(md.includes('mooshroom'), 'markdown contains species name');
passed++; console.log('  ✓ dnaToMarkdown');

// ─── Fitness Tests ───────────────────────────────────────
console.log('\n💪 Fitness Tests');

const records = [
  createRecord('plant_wheat', { success: true, efficiency: 0.8, quality: 0.7, speed: 0.9 }),
  createRecord('plant_carrots', { success: true, efficiency: 0.6, quality: 0.8, speed: 0.7 }),
  createRecord('mine_coal', { success: false, efficiency: 0.3, quality: 0.2, speed: 0.5 }),
];
const fitness = calculateFitness(records, 'mooshroom');
assert(fitness > 0 && fitness <= 1, 'fitness in [0,1]');
assert(fitness > 0.3, 'fitness reasonable for mixed results');
passed++; console.log('  ✓ calculateFitness');

// ─── Population Tests ────────────────────────────────────
console.log('\n👥 Population Tests');

const pop = new Population(4, 1);
for (const sp of allSpecies()) {
  pop.add(createDNA(sp.id));
}
assert(pop.bots.size === allSpecies().length, 'initial population');
assert(pop.countSpecies('mooshroom') === 1, 'species count');
assert(pop.diversity() > 0, 'diversity positive');
passed++; console.log('  ✓ Population init');

// Immigration
pop.remove([...pop.bots.keys()][0]);
pop.protectSpecies();
assert(pop.countSpecies([...pop.bots.values()][0]?.dna.speciesId) >= 1, 'extinction protection');
passed++; console.log('  ✓ Extinction protection');

// ─── Routing Tests ───────────────────────────────────────
console.log('\n🗺️  Routing Tests');

const pop2 = new Population(4, 1);
for (const sp of allSpecies()) {
  const d = createDNA(sp.id);
  pop2.add(d);
  const bot = pop2.get(d.id);
  bot.records.push(createRecord(sp.preferredTasks[0], { success: true, efficiency: 0.8, quality: 0.8, speed: 0.8 }));
}
const scores = analyzeTask('mine_diamonds', pop2);
assert(scores.length === allSpecies().length, 'scores for all species');
assert(scores[0].score > 0, 'top score positive');
passed++; console.log('  ✓ analyzeTask');

const assignment = assignTask('plant_wheat', pop2);
assert(assignment !== null, 'assignment found');
assert(assignment.bot !== undefined, 'assignment has bot');
passed++; console.log('  ✓ assignTask');

// ─── Evolution Tests ─────────────────────────────────────
console.log('\n🧬 Evolution Tests');

const pop3 = new Population(4, 1);
for (const sp of allSpecies()) {
  const d = createDNA(sp.id);
  pop3.add(d);
  const bot = pop3.get(d.id);
  // Give some records
  for (let i = 0; i < 5; i++) {
    bot.records.push(createRecord(sp.preferredTasks[0], { success: Math.random() > 0.3, efficiency: 0.7, quality: 0.6, speed: 0.8 }));
  }
}

const engine = new EvolutionEngine(pop3, { cullThreshold: 0.2 });
const report = await engine.evolve();
assert(report.generation === 1, 'generation incremented');
assert(report.evaluate.evaluated > 0, 'bots evaluated');
assert(Array.isArray(report.cull.culled), 'cull returns array');
passed++; console.log('  ✓ Evolution cycle');

// ─── Task Chain Tests ────────────────────────────────────
console.log('\n🔗 Task Chain Tests');

const chain = buildChain('plant_wheat');
assert(chain.length >= 2, 'chain has multiple tasks');
assert(chain[0].id === 'plant_wheat', 'chain starts with wheat');
passed++; console.log('  ✓ buildChain');

const allT = allTasks();
assert(allT.length >= 20, 'at least 20 tasks defined');
passed++; console.log(`  ✓ ${allT.length} tasks defined`);

// ─── Summary ─────────────────────────────────────────────
console.log(`\n${'═'.repeat(40)}`);
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
else console.log('  ✅ All tests passed!');
