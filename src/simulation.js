/**
 * Simulation runner — headless evolution without Minecraft.
 * Run evolution simulations with configurable parameters and track results.
 */

import { Population } from './population.js';
import { EvolutionEngine } from './evolution.js';
import { allSpecies, createDNA } from './dna.js';
import { createRecord } from './fitness.js';
import { allTasks } from './farm-tasks.js';

/**
 * Simulate task performance for a bot based on their traits and task requirements.
 * Returns a performance record with success, efficiency, quality, and speed metrics.
 */
function simulateTaskPerformance(bot, task) {
  const traits = bot.dna.traits;
  const criteria = task.scoringCriteria || [];

  // Calculate performance metrics based on trait matching
  let successProb = 0.5;
  let efficiency = 0.5;
  let quality = 0.5;
  let speed = 0.5;

  for (const criterion of criteria) {
    const traitValue = traits[criterion] || 0.5;

    if (criterion === 'speed') {
      speed = traitValue + (Math.random() - 0.5) * 0.2;
      efficiency += traitValue * 0.3;
    } else if (criterion === 'yield') {
      quality += traitValue * 0.3;
      efficiency += traitValue * 0.2;
    } else if (criterion === 'quality') {
      quality = traitValue + (Math.random() - 0.5) * 0.2;
      successProb += traitValue * 0.2;
    } else if (criterion === 'thoroughness') {
      quality += traitValue * 0.3;
      speed -= traitValue * 0.1;
    } else if (criterion === 'efficiency') {
      efficiency = traitValue + (Math.random() - 0.5) * 0.2;
    }
  }

  // Normalize values
  efficiency = Math.min(1, Math.max(0, efficiency));
  quality = Math.min(1, Math.max(0, quality));
  speed = Math.min(1, Math.max(0, speed));

  // Determine success based on probability and task weight
  const taskWeight = bot.dna.taskWeights[task.id] || 0.5;
  const adjustedSuccessProb = successProb + taskWeight * 0.3;
  const success = Math.random() < adjustedSuccessProb;

  return {
    taskId: task.id,
    timestamp: Date.now(),
    success,
    efficiency: success ? efficiency : efficiency * 0.3,
    quality: success ? quality : quality * 0.2,
    speed: success ? speed : speed * 0.5,
  };
}

/**
 * Run a simulated task cycle for all bots in the population.
 * Each bot attempts multiple tasks based on their species preferences.
 */
function runTaskCycle(population, tasksPerBot = 5) {
  const tasks = allTasks();

  for (const bot of population.bots.values()) {
    // Select tasks based on bot's task weights
    const weightedTasks = [];
    for (const task of tasks) {
      const weight = bot.dna.taskWeights[task.id] || 0.5;
      weightedTasks.push({ task, weight });
    }

    // Sort by weight and pick top tasks
    weightedTasks.sort((a, b) => b.weight - a.weight);
    const selectedTasks = weightedTasks.slice(0, tasksPerBot);

    // Simulate performance for each selected task
    for (const { task } of selectedTasks) {
      const record = simulateTaskPerformance(bot, task);
      bot.records.push(record);
    }
  }
}

/**
 * Simulation configuration.
 */
export class SimulationConfig {
  constructor({
    populationSize = 20,
    generations = 50,
    maxPerSpecies = 6,
    minPerSpecies = 1,
    tasksPerCycle = 5,
    cullThreshold = 0.3,
    quarantineThreshold = 0.8,
    seed = Date.now(),
  } = {}) {
    this.populationSize = populationSize;
    this.generations = generations;
    this.maxPerSpecies = maxPerSpecies;
    this.minPerSpecies = minPerSpecies;
    this.tasksPerCycle = tasksPerCycle;
    this.cullThreshold = cullThreshold;
    this.quarantineThreshold = quarantineThreshold;
    this.seed = seed;
  }
}

/**
 * Simulation runner for headless evolution experiments.
 */
export class SimulationRunner {
  constructor(config = new SimulationConfig()) {
    this.config = config;
    this.population = null;
    this.engine = null;
    this.results = {
      generations: [],
      finalPopulation: null,
      summary: null,
    };
  }

  /**
   * Initialize the population with random DNA across all species.
   */
  initializePopulation() {
    this.population = new Population(
      this.config.maxPerSpecies,
      this.config.minPerSpecies
    );

    const species = allSpecies();
    let botsCreated = 0;

    // Distribute bots across species
    while (botsCreated < this.config.populationSize) {
      for (const sp of species) {
        if (botsCreated >= this.config.populationSize) break;
        if (this.population.countSpecies(sp.id) < this.config.maxPerSpecies) {
          const dna = createDNA(sp.id);
          this.population.add(dna);
          botsCreated++;
        }
      }
    }

    return this.population;
  }

  /**
   * Run the complete simulation.
   */
  async run() {
    this.initializePopulation();

    this.engine = new EvolutionEngine(this.population, {
      cullThreshold: this.config.cullThreshold,
      quarantineThreshold: this.config.quarantineThreshold,
    });

    console.log(`🧬 Starting simulation: ${this.config.populationSize} bots, ${this.config.generations} generations`);

    for (let gen = 1; gen <= this.config.generations; gen++) {
      // Run task cycle
      runTaskCycle(this.population, this.config.tasksPerCycle);

      // Run evolution
      const report = await this.engine.evolve();

      // Record generation stats
      const genStats = {
        generation: gen,
        population: this.population.bots.size,
        bestFitness: this.population.ranked()[0]?.fitness || 0,
        avgFitness: this.calculateAvgFitness(),
        diversity: this.population.diversity(),
        speciesStats: this.population.stats(),
        topBot: this.population.ranked()[0] || null,
      };

      this.results.generations.push(genStats);

      // Progress indicator
      if (gen % 10 === 0 || gen === this.config.generations) {
        console.log(`  Gen ${gen}: Pop=${genStats.population}, Best=${(genStats.bestFitness * 100).toFixed(1)}%, Avg=${(genStats.avgFitness * 100).toFixed(1)}%, Div=${(genStats.diversity * 100).toFixed(1)}%`);
      }
    }

    // Final summary
    this.results.finalPopulation = this.population.bots.size;
    this.results.summary = this.generateSummary();

    console.log('✅ Simulation complete!');
    return this.results;
  }

  /**
   * Calculate average fitness across population.
   */
  calculateAvgFitness() {
    if (this.population.bots.size === 0) return 0;
    const total = [...this.population.bots.values()].reduce((sum, b) => sum + b.fitness, 0);
    return total / this.population.bots.size;
  }

  /**
   * Generate summary statistics.
   */
  generateSummary() {
    const ranked = this.population.ranked();
    const speciesStats = this.population.stats();

    return {
      totalGenerations: this.config.generations,
      finalPopulation: this.population.bots.size,
      bestFitness: ranked[0]?.fitness || 0,
      avgFitness: this.calculateAvgFitness(),
      diversity: this.population.diversity(),
      speciesSummary: Object.entries(speciesStats).map(([id, stats]) => ({
        species: id,
        population: stats.count,
        avgFitness: stats.avgFitness,
        maxFitness: stats.maxFitness,
      })),
      traitDistribution: this.calculateTraitDistribution(),
    };
  }

  /**
   * Calculate average trait values across population.
   */
  calculateTraitDistribution() {
    const traitKeys = ['speed', 'patience', 'thoroughness', 'strength', 'intelligence'];
    const distribution = {};

    for (const key of traitKeys) {
      const values = [...this.population.bots.values()].map(b => b.dna.traits[key]);
      distribution[key] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        std: Math.sqrt(values.reduce((sum, v) => sum + (v - (values.reduce((a, b) => a + b, 0) / values.length)) ** 2, 0) / values.length),
      };
    }

    return distribution;
  }

  /**
   * Export results as JSON.
   */
  toJSON() {
    return JSON.stringify(this.results, null, 2);
  }

  /**
   * Get generation-by-generation data for charts.
   */
  getGenerationData() {
    return this.results.generations.map(gen => ({
      generation: gen.generation,
      best_fitness: gen.bestFitness,
      avg_fitness: gen.avgFitness,
      diversity: gen.diversity,
      population: gen.population,
      trait_distribution: this.getTraitDistributionForGen(gen),
    }));
  }

  /**
   * Get trait distribution for a specific generation.
   */
  getTraitDistributionForGen(gen) {
    const traitKeys = ['speed', 'patience', 'thoroughness', 'strength', 'intelligence'];
    const distribution = {};

    for (const [species, stats] of Object.entries(gen.speciesStats)) {
      // This is simplified - in real implementation we'd track per-generation traits
      distribution[species] = {
        count: stats.count,
        avgFitness: stats.avgFitness,
      };
    }

    return distribution;
  }
}

/**
 * CLI entry point for running simulations.
 */
export async function runFromCLI(args = process.argv) {
  const config = {};

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--pop=')) {
      config.populationSize = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--gen=')) {
      config.generations = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--max-species=')) {
      config.maxPerSpecies = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--min-species=')) {
      config.minPerSpecies = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--tasks=')) {
      config.tasksPerCycle = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--cull=')) {
      config.cullThreshold = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--quarantine=')) {
      config.quarantineThreshold = parseFloat(arg.split('=')[1]);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
CraftMind Ranch Simulation Runner

Usage: node src/simulation.js [options]

Options:
  --pop=N           Population size (default: 20)
  --gen=N           Number of generations (default: 50)
  --max-species=N   Max bots per species (default: 6)
  --min-species=N   Min bots per species (default: 1)
  --tasks=N         Tasks per cycle per bot (default: 5)
  --cull=N          Cull threshold 0-1 (default: 0.3)
  --quarantine=N    Quarantine threshold 0-1 (default: 0.8)
  --help, -h        Show this help

Example:
  node src/simulation.js --pop=30 --gen=100 --tasks=10
      `);
      process.exit(0);
    }
  }

  const runner = new SimulationRunner(new SimulationConfig(config));
  const results = await runner.run();

  // Output JSON results
  console.log('\n📊 Results (JSON):');
  console.log(runner.toJSON());

  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFromCLI().catch(console.error);
}
