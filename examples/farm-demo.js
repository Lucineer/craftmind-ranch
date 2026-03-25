/**
 * Farm demo — spawn an initial population and run a few evolution cycles.
 */

import { createDNA, crossoverDNA, mutateDNA, dnaToMarkdown } from '../src/dna.js';
import { Population } from '../src/population.js';
import { EvolutionEngine } from '../src/evolution.js';
import { allSpecies, allTasks } from '../src/index.js';
import { createRecord } from '../src/fitness.js';

// 1. Create population
const pop = new Population(6, 1);

// 2. Spawn initial bots (2 per species)
const species = allSpecies();
for (const sp of species) {
  pop.add(createDNA(sp.id));
  pop.add(createDNA(sp.id));
}

console.log('🌾 CraftMind Ranch — Farm Demo');
console.log(`   Initial population: ${pop.bots.size} bots across ${species.length} species\n`);

// 3. Simulate some task records for each bot
for (const bot of pop.bots.values()) {
  const tasks = allTasks().filter(t => t.category === ['planting','mining','exploring','breeding'][Math.floor(Math.random()*4)]);
  const assignedTasks = tasks.slice(0, 3 + Math.floor(Math.random() * 5));

  for (const task of assignedTasks) {
    const success = Math.random() > 0.3;
    bot.records.push(createRecord(task.id, {
      success,
      efficiency: success ? 0.5 + Math.random() * 0.5 : Math.random() * 0.4,
      quality: success ? 0.4 + Math.random() * 0.6 : Math.random() * 0.3,
      speed: 0.3 + Math.random() * 0.7,
    }));
  }
}

// 4. Run evolution cycles
const engine = new EvolutionEngine(pop, { cullThreshold: 0.3 });

for (let i = 0; i < 5; i++) {
  const report = await engine.evolve();
  const stats = pop.stats();

  console.log(`═══ Generation ${report.generation} ═══`);
  console.log(`  Evaluated: ${report.evaluate.evaluated}`);
  console.log(`  Culled:    ${report.cull.culled.length}`);
  console.log(`  Offspring: ${report.breed.offspring.length}`);
  console.log(`  Promoted:  ${report.promote.promoted.length}`);

  for (const [sid, s] of Object.entries(stats)) {
    const sp = species.find(x => x.id === sid);
    console.log(`  ${sp.emoji} ${sid.padEnd(12)} pop=${s.count}  avg_fitness=${(s.avgFitness * 100).toFixed(1)}%  best=${(s.maxFitness * 100).toFixed(1)}%`);
  }
  console.log(`  Diversity: ${(pop.diversity() * 100).toFixed(1)}%\n`);

  // Simulate more records after each cycle
  for (const bot of pop.bots.values()) {
    const tasks = allTasks();
    const count = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < count; j++) {
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      const success = bot.fitness > 0.5 ? Math.random() > 0.2 : Math.random() > 0.5;
      bot.records.push(createRecord(task.id, {
        success,
        efficiency: success ? 0.4 + Math.random() * 0.6 : Math.random() * 0.3,
        quality: success ? 0.3 + Math.random() * 0.7 : Math.random() * 0.3,
        speed: 0.3 + Math.random() * 0.7,
      }));
    }
  }
}

// 5. Show a sample DNA
const ranked = pop.ranked();
if (ranked.length) {
  const best = ranked[0];
  const sp = species.find(x => x.id === best.dna.speciesId);
  console.log(`\n🧬 Best bot (${sp.emoji} ${best.dna.speciesId}, Gen ${best.dna.generation}, Fitness ${(best.fitness * 100).toFixed(1)}%):`);
  console.log(dnaToMarkdown(best.dna));
}

console.log('\n✅ Demo complete. Run "node src/dashboard.js" for the web UI.');
