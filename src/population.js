/**
 * Population management — keep the ecosystem balanced.
 */

import { allSpecies } from './species.js';
import { createDNA } from './dna.js';

export class Population {
  constructor(maxPerSpecies = 6, minPerSpecies = 1) {
    this.maxPerSpecies = maxPerSpecies;
    this.minPerSpecies = minPerSpecies;
    this.bots = new Map(); // botId → { dna, records, fitness }
    this.generation = 0;
    this.history = [];
  }

  /** Add a bot to the population. */
  add(dna) {
    const count = this.countSpecies(dna.speciesId);
    if (count >= this.maxPerSpecies) return false;
    this.bots.set(dna.id, { dna, records: [], fitness: 0 });
    return true;
  }

  /** Remove a bot by ID. */
  remove(botId) {
    return this.bots.delete(botId);
  }

  /** Get bot by ID. */
  get(botId) {
    return this.bots.get(botId) ?? null;
  }

  /** Count bots for a species. */
  countSpecies(speciesId) {
    let n = 0;
    for (const b of this.bots.values()) {
      if (b.dna.speciesId === speciesId) n++;
    }
    return n;
  }

  /** Get all bots for a species. */
  getBySpecies(speciesId) {
    return [...this.bots.values()].filter(b => b.dna.speciesId === speciesId);
  }

  /** Get all bots sorted by fitness. */
  ranked() {
    return [...this.bots.values()].sort((a, b) => b.fitness - a.fitness);
  }

  /** Species population stats. */
  stats() {
    const s = {};
    for (const sp of allSpecies()) {
      const bots = this.getBySpecies(sp.id);
      const avgFitness = bots.length ? bots.reduce((sum, b) => sum + b.fitness, 0) / bots.length : 0;
      s[sp.id] = {
        count: bots.length,
        avgFitness,
        maxFitness: bots.length ? Math.max(...bots.map(b => b.fitness)) : 0,
      };
    }
    return s;
  }

  /** Diversity metric: average trait std dev across population. */
  diversity() {
    if (this.bots.size < 2) return 1.0;
    const bots = [...this.bots.values()];
    const traitKeys = ['speed', 'patience', 'thoroughness', 'strength', 'intelligence'];
    let totalDev = 0;

    for (const key of traitKeys) {
      const vals = bots.map(b => b.dna.traits[key]);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / vals.length;
      totalDev += Math.sqrt(variance);
    }

    return totalDev / traitKeys.length;
  }

  /** Immigration: spawn new random DNA if diversity drops below threshold. */
  immigrate(speciesId) {
    if (this.countSpecies(speciesId) >= this.minPerSpecies) return null;
    const dna = createDNA(speciesId);
    this.add(dna);
    return dna;
  }

  /** Ensure minimum population for all species (extinction protection). */
  protectSpecies() {
    const immigrants = [];
    for (const sp of allSpecies()) {
      while (this.countSpecies(sp.id) < this.minPerSpecies) {
        const dna = this.immigrate(sp.id);
        if (dna) immigrants.push(dna);
        else break;
      }
    }
    return immigrants;
  }

  /** Snapshot current state for history. */
  snapshot() {
    const snap = {
      generation: this.generation,
      totalPopulation: this.bots.size,
      diversity: this.diversity(),
      speciesStats: this.stats(),
      timestamp: Date.now(),
    };
    this.history.push(snap);
    return snap;
  }

  /** Get population history. */
  getHistory() {
    return this.history;
  }
}
