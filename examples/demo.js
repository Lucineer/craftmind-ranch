// ═══════════════════════════════════════════════════════════════
// CraftMind Ranch — Demo
// ═══════════════════════════════════════════════════════════════

import { SPECIES, getSpecies, allSpecies } from '../src/species.js';
import { createDNA, mutateDNA, crossoverDNA, dnaToMarkdown } from '../src/dna.js';
import { calculateFitness } from '../src/fitness.js';
import { Population } from '../src/population.js';
import { EvolutionEngine } from '../src/evolution.js';
import { TASKS, getTasksByCategory, buildChain } from '../src/farm-tasks.js';
import { analyzeTask, assignTask } from '../src/routing.js';

console.log(`
🌾 CraftMind Ranch — Evolution Demo
══════════════════════════════════════════
`);

// Species catalog
const species = allSpecies();
console.log(`🐾 Species: ${species.length} available`);
for (const sp of species) {
  console.log(`   ${sp.id.padEnd(12)} ${sp.name}`);
}

// DNA creation & breeding
const parent1 = createDNA('goat');
const parent2 = createDNA('goat');
const child = crossoverDNA(parent1, parent2, 'goat');
const mutated = mutateDNA(child);
console.log(`\n🧬 Breeding Demo (Goat):`);
console.log(`   Parent 1: gen ${parent1.generation}, speed=${parent1.traits.speed.toFixed(2)}`);
console.log(`   Parent 2: gen ${parent2.generation}, speed=${parent2.traits.speed.toFixed(2)}`);
console.log(`   Child:    gen ${child.generation}, speed=${child.traits.speed.toFixed(2)}`);
console.log(`   Mutated:  speed=${mutated.traits.speed.toFixed(2)}`);

// Fitness
const fitness = calculateFitness(mutated);
console.log(`\n💪 Fitness: ${typeof fitness === 'number' ? (fitness * 100).toFixed(1) + '%' : JSON.stringify(fitness)}`);

// Population
const pop = new Population(20);
console.log(`\n👥 Population: max ${pop.maxPerSpecies} per species`);

// Tasks
const taskKeys = Object.keys(TASKS);
console.log(`\n📋 Tasks: ${taskKeys.length} defined`);

// Task chain
const chain = buildChain('harvesting');
console.log(`\n🔗 Task chain (harvesting): ${chain.length} steps`);
for (const step of chain.slice(0, 5)) {
  console.log(`   → ${step.name || step.id || step}`);
}

// DNA to markdown
console.log(`\n📄 DNA Report:`);
console.log(dnaToMarkdown(mutated).split('\n').slice(0, 5).join('\n'));

console.log('\n✨ Demo complete!');
