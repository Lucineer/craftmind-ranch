/**
 * Evolution engine — the heart of CraftMind Ranch.
 * Cycle: Evaluate → Cull → Breed → Distill → Quarantine → Promote
 */

import { calculateFitness } from './fitness.js';
import { crossoverDNA, mutateDNA, adjustTaskWeight } from './dna.js';

export class EvolutionEngine {
  constructor(population, config = {}) {
    this.population = population;
    this.cullThreshold = config.cullThreshold ?? 0.3;
    this.quarantineThreshold = config.quarantineThreshold ?? 0.8;
    this.generation = 0;
    this.log = [];
  }

  /** Run one full evolution cycle. */
  async evolve() {
    this.generation++;
    const report = { generation: this.generation, timestamp: Date.now() };

    // 1. Evaluate
    report.evaluate = this.evaluate();
    this.population.snapshot();

    // 2. Cull
    report.cull = this.cull();

    // 3. Breed
    report.breed = this.breed();

    // 4. Distill (adjust weights based on records)
    report.distill = this.distill();

    // 5. Quarantine (test new offspring)
    report.quarantine = this.quarantine();

    // 6. Promote (add quarantined bots to active)
    report.promote = this.promote();

    // 7. Protect species from extinction
    report.immigration = this.population.protectSpecies();

    this.log.push(report);
    return report;
  }

  /** Step 1: Evaluate — score each bot's fitness. */
  evaluate() {
    let evaluated = 0;
    for (const bot of this.population.bots.values()) {
      bot.fitness = calculateFitness(bot.records, bot.dna.speciesId);
      evaluated++;
    }
    return { evaluated };
  }

  /** Step 2: Cull — remove bots below fitness threshold (but protect minimum). */
  cull() {
    const culled = [];
    for (const [botId, bot] of this.population.bots.entries()) {
      if (bot.fitness < this.cullThreshold) {
        const speciesCount = this.population.countSpecies(bot.dna.speciesId);
        if (speciesCount > 1) { // Don't cull last of species
          this.population.remove(botId);
          culled.push({ botId, species: bot.dna.speciesId, fitness: bot.fitness });
        }
      }
    }
    return { culled };
  }

  /** Step 3: Breed — crossover DNA from top performers. */
  breed() {
    const offspring = [];
    const ranked = this.population.ranked();
    if (ranked.length < 2) return { offspring };

    // Pair top performers
    const parents = ranked.slice(0, Math.min(ranked.length, 4));

    for (let i = 0; i < parents.length - 1; i++) {
      const parentA = parents[i];
      const parentB = parents[i + 1];
      const childDNA = crossoverDNA(parentA.dna, parentB.dna, parentA.dna.speciesId);
      mutateDNA(childDNA);

      // Store in quarantine (not yet active)
      this.quarantined = this.quarantined ?? [];
      this.quarantined.push({ dna: childDNA, records: [], fitness: 0 });
      offspring.push({ species: childDNA.speciesId, parentIds: childDNA.parentIds });
    }

    return { offspring };
  }

  /** Step 4: Distill — update behavioral weights based on successful actions. */
  distill() {
    let adjusted = 0;
    for (const bot of this.population.bots.values()) {
      for (const record of bot.records) {
        adjustTaskWeight(bot.dna, record.taskId, record.success);
        adjusted++;
      }
    }
    return { adjusted };
  }

  /** Step 5: Quarantine — test new offspring (simulated). */
  quarantine() {
    if (!this.quarantined?.length) return { tested: 0, passed: 0 };

    let passed = 0;
    const survivors = [];

    for (const child of this.quarantined) {
      // Simulate: compare to average parent fitness
      const parentIds = child.dna.parentIds;
      let parentAvgFitness = 0;
      let parentCount = 0;

      for (const pid of parentIds) {
        const parent = this.population.get(pid);
        if (parent) {
          parentAvgFitness += parent.fitness;
          parentCount++;
        }
      }
      parentAvgFitness = parentCount > 0 ? parentAvgFitness / parentCount : 0.3;

      // Simulate some task performance for the child
      const simulatedFitness = parentAvgFitness + (Math.random() - 0.4) * 0.2;
      child.fitness = Math.min(1, Math.max(0, simulatedFitness));

      // Pass quarantine if fitness >= 80% of parent avg
      if (parentAvgFitness > 0 && child.fitness >= parentAvgFitness * this.quarantineThreshold) {
        survivors.push(child);
        passed++;
      }
    }

    this.quarantined = [];
    this.pendingPromotion = survivors;
    return { tested: this.quarantined.length + survivors.length, passed };
  }

  /** Step 6: Promote — add successful offspring to active population. */
  promote() {
    const promoted = [];
    if (!this.pendingPromotion?.length) return { promoted };

    for (const child of this.pendingPromotion) {
      if (this.population.add(child.dna)) {
        this.population.get(child.dna.id).fitness = child.fitness;
        promoted.push({ species: child.dna.speciesId, fitness: child.fitness });
      }
    }

    this.pendingPromotion = [];
    return { promoted };
  }

  /** Start automatic evolution cycle. */
  start(intervalMs = 60000) {
    this._timer = setInterval(() => this.evolve().catch(console.error), intervalMs);
    return this._timer;
  }

  /** Stop automatic cycle. */
  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}
