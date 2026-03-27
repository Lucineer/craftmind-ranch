/**
 * Experiment runner — test evolution hypotheses with controlled trials.
 * Pre-defined experiments to analyze evolutionary dynamics.
 */

import { SimulationRunner, SimulationConfig } from './simulation.js';
import { Dashboard } from './visualization.js';

/**
 * Store experiment results and metadata.
 */
export class ExperimentResults {
  constructor(experimentId, config) {
    this.experimentId = experimentId;
    this.config = config;
    this.trials = [];
    this.summary = null;
    this.completedAt = null;
  }

  addTrial(result) {
    this.trials.push(result);
  }

  calculateSummary() {
    if (this.trials.length === 0) return null;

    const firstTrial = this.trials[0];
    const numGenerations = firstTrial.generations.length;
    const metricsPerTrial = this.trials.map(trial => ({
      finalBestFitness: trial.generations[trial.generations.length - 1]?.bestFitness || 0,
      finalAvgFitness: trial.generations[trial.generations.length - 1]?.avgFitness || 0,
      finalDiversity: trial.generations[trial.generations.length - 1]?.diversity || 0,
      generationsToConvergence: this.calculateConvergenceRate(trial),
      traitDistribution: trial.summary?.traitDistribution || {},
    }));

    this.summary = {
      experimentId: this.experimentId,
      numTrials: this.trials.length,
      avgBestFitness: this.average(metricsPerTrial.map(m => m.finalBestFitness)),
      stdBestFitness: this.stdDev(metricsPerTrial.map(m => m.finalBestFitness)),
      avgAvgFitness: this.average(metricsPerTrial.map(m => m.finalAvgFitness)),
      avgDiversity: this.average(metricsPerTrial.map(m => m.finalDiversity)),
      avgGenerationsToConvergence: this.average(metricsPerTrial.map(m => m.generationsToConvergence)),
      finalTraitDistribution: this.averageTraitDistributions(metricsPerTrial.map(m => m.traitDistribution)),
    };

    this.completedAt = Date.now();
    return this.summary;
  }

  calculateConvergenceRate(trial) {
    // Find generation where fitness improvement plateaus (< 1% improvement over 5 generations)
    const gens = trial.generations;
    for (let i = 5; i < gens.length; i++) {
      const recent = gens.slice(i - 5, i);
      const improvement = (recent[recent.length - 1].bestFitness - recent[0].bestFitness) / recent[0].bestFitness;
      if (improvement < 0.01) return i;
    }
    return gens.length;
  }

  average(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  stdDev(values) {
    const avg = this.average(values);
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }

  averageTraitDistributions(distributions) {
    if (distributions.length === 0) return {};

    const result = {};
    const traits = Object.keys(distributions[0] || {});

    for (const trait of traits) {
      const values = distributions.map(d => d[trait]);
      if (values.every(v => v)) {
        result[trait] = {
          avg: this.average(values.map(v => v.avg)),
          std: this.average(values.map(v => v.std)),
          min: Math.min(...values.map(v => v.min)),
          max: Math.max(...values.map(v => v.max)),
        };
      }
    }

    return result;
  }

  toJSON() {
    return {
      experimentId: this.experimentId,
      config: this.config,
      summary: this.summary,
      numTrials: this.trials.length,
      completedAt: this.completedAt,
    };
  }
}

/**
 * Experiment runner for controlled evolution trials.
 */
export class ExperimentRunner {
  constructor() {
    this.experiments = new Map();
    this.results = new Map();
    this.registerDefaultExperiments();
  }

  /**
   * Register the 4 default experiments.
   */
  registerDefaultExperiments() {
    this.registerExperiment('mutation_rate_adaptation', {
      name: 'Mutation Rate Adaptation',
      description: 'Does higher mutation rate lead to faster adaptation?',
      hypothesis: 'Populations with higher mutation rates will adapt faster to task environments.',
      variables: ['mutationRate'],
      trials: 5,
      variants: [
        { mutationRate: 0.05, name: 'Low (5%)' },
        { mutationRate: 0.15, name: 'Medium (15%)' },
        { mutationRate: 0.30, name: 'High (30%)' },
      ],
      config: {
        populationSize: 24,
        generations: 30,
        tasksPerCycle: 5,
      },
    });

    this.registerExperiment('population_size_optimization', {
      name: 'Population Size Optimization',
      description: 'What population size is optimal for farm tasks?',
      hypothesis: 'There is an optimal population size that balances diversity and computational efficiency.',
      variables: ['populationSize'],
      trials: 5,
      variants: [
        { populationSize: 12, name: 'Small (12)' },
        { populationSize: 24, name: 'Medium (24)' },
        { populationSize: 48, name: 'Large (48)' },
      ],
      config: {
        generations: 40,
        tasksPerCycle: 5,
      },
    });

    this.registerExperiment('sexual_selection', {
      name: 'Sexual Selection',
      description: 'Does sexual selection (trait preference) improve outcomes?',
      hypothesis: 'Bots that prefer mates with complementary traits will produce better offspring.',
      variables: ['selectionStrategy'],
      trials: 5,
      variants: [
        { selectionStrategy: 'random', name: 'Random Mating' },
        { selectionStrategy: 'fitness', name: 'Fitness-Based' },
        { selectionStrategy: 'trait_complement', name: 'Trait Complement' },
      ],
      config: {
        populationSize: 24,
        generations: 35,
        tasksPerCycle: 5,
      },
    });

    this.registerExperiment('altruism_vs_selfish', {
      name: 'Altruism vs Selfish',
      description: 'Can altruistic bots outcompete selfish bots?',
      hypothesis: 'Bots with altruistic traits (high social, high patience) will form stable cooperative populations.',
      variables: ['personality'],
      trials: 5,
      variants: [
        { personality: 'selfish', name: 'Selfish (low social, low patience)' },
        { personality: 'neutral', name: 'Neutral (balanced)' },
        { personality: 'altruistic', name: 'Altruistic (high social, high patience)' },
      ],
      config: {
        populationSize: 24,
        generations: 40,
        tasksPerCycle: 5,
      },
    });
  }

  /**
   * Register a custom experiment.
   */
  registerExperiment(id, config) {
    this.experiments.set(id, {
      id,
      ...config,
    });
  }

  /**
   * List all available experiments.
   */
  listExperiments() {
    return [...this.experiments.values()].map(exp => ({
      id: exp.id,
      name: exp.name,
      description: exp.description,
      numVariants: exp.variants?.length || 0,
      trialsPerVariant: exp.trials || 1,
    }));
  }

  /**
   * Run a specific experiment.
   */
  async run(experimentId, options = {}) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Unknown experiment: ${experimentId}`);
    }

    console.log(`🔬 Running experiment: ${experiment.name}`);
    console.log(`   ${experiment.description}`);
    console.log(`   Hypothesis: ${experiment.hypothesis}`);
    console.log('');

    const results = [];
    const dashboard = new Dashboard();

    // Run each variant
    for (const variant of experiment.variants) {
      console.log(`\n🧪 Testing variant: ${variant.name}`);

      const variantResults = [];
      const config = this.applyVariant(experiment.config, variant);

      // Run multiple trials for statistical significance
      for (let trial = 1; trial <= experiment.trials; trial++) {
        console.log(`   Trial ${trial}/${experiment.trials}...`);

        const runner = new SimulationRunner(new SimulationConfig(config));
        const result = await runner.run();
        variantResults.push(result);
      }

      // Calculate variant summary
      const variantSummary = this.summarizeVariant(variantResults);
      results.push({
        variant: variant.name,
        summary: variantSummary,
        trials: variantResults,
      });

      console.log(`   → Best Fitness: ${(variantSummary.avgBestFitness * 100).toFixed(1)}% ± ${(variantSummary.stdBestFitness * 100).toFixed(1)}%`);
    }

    // Store results
    const expResults = new ExperimentResults(experimentId, experiment);
    for (const result of results) {
      for (const trial of result.trials) {
        expResults.addTrial(trial);
      }
    }
    expResults.calculateSummary();
    this.results.set(experimentId, expResults);

    // Display comparison
    console.log('\n📊 Results Summary:');
    console.log(dashboard.renderExperimentComparison(results));

    return expResults;
  }

  /**
   * Apply variant configuration to base config.
   */
  applyVariant(baseConfig, variant) {
    const config = { ...baseConfig };

    // Handle different experiment types
    if (variant.mutationRate !== undefined) {
      // Apply mutation rate override via custom DNA creation
      config.mutationRateOverride = variant.mutationRate;
    }

    if (variant.populationSize !== undefined) {
      config.populationSize = variant.populationSize;
    }

    if (variant.selectionStrategy !== undefined) {
      config.selectionStrategy = variant.selectionStrategy;
    }

    if (variant.personality !== undefined) {
      config.personalityBias = variant.personality;
    }

    return config;
  }

  /**
   * Summarize results for a single variant.
   */
  summarizeVariant(trials) {
    if (trials.length === 0) return {};

    const finalGenData = trials.map(t => t.generations[t.generations.length - 1]);

    return {
      avgBestFitness: this.average(finalGenData.map(g => g.bestFitness)),
      stdBestFitness: this.stdDev(finalGenData.map(g => g.bestFitness)),
      avgAvgFitness: this.average(finalGenData.map(g => g.avgFitness)),
      avgDiversity: this.average(finalGenData.map(g => g.diversity)),
      avgPopulation: this.average(finalGenData.map(g => g.population)),
    };
  }

  /**
   * Compare results between experiments.
   */
  compare(experimentIds) {
    const comparisons = [];

    for (const id of experimentIds) {
      const results = this.results.get(id);
      if (results && results.summary) {
        comparisons.push({
          experimentId: id,
          summary: results.summary,
        });
      }
    }

    return comparisons;
  }

  /**
   * Get results for a specific experiment.
   */
  getResults(experimentId) {
    return this.results.get(experimentId);
  }

  /**
   * Export all results as JSON.
   */
  exportResults() {
    const output = {};

    for (const [id, results] of this.results.entries()) {
      output[id] = results.toJSON();
    }

    return JSON.stringify(output, null, 2);
  }

  /**
   * Statistical utility functions.
   */
  average(values) {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  stdDev(values) {
    if (values.length === 0) return 0;
    const avg = this.average(values);
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }

  /**
   * Perform t-test between two groups of results.
   */
  tTest(groupA, groupB) {
    const nA = groupA.length;
    const nB = groupB.length;
    const meanA = this.average(groupA);
    const meanB = this.average(groupB);
    const varA = this.stdDev(groupA) ** 2;
    const varB = this.stdDev(groupB) ** 2;

    const pooledStd = Math.sqrt(((nA - 1) * varA + (nB - 1) * varB) / (nA + nB - 2));
    const tStat = (meanA - meanB) / (pooledStd * Math.sqrt(1 / nA + 1 / nB));

    return {
      tStatistic: tStat,
      meanA,
      meanB,
      significant: Math.abs(tStat) > 2.0, // Rough threshold for p < 0.05
    };
  }
}

/**
 * Extend Dashboard to render experiment comparisons.
 */
Dashboard.prototype.renderExperimentComparison = function(results) {
  const lines = [];
  lines.push('┌' + '─'.repeat(70) + '┐');
  lines.push('│' + 'Experiment Results Comparison'.padEnd(70) + '│');
  lines.push('├' + '─'.repeat(70) + '┤');

  // Header
  lines.push('│' + 'Variant'.padEnd(25) + '│ Best Fitness │ Avg Fitness │ Diversity │ Population │'.padEnd(45) + '│');

  lines.push('├' + '─'.repeat(25) + '┼' + '─'.repeat(13) + '┼' + '─'.repeat(13) + '┼' + '─'.repeat(11) + '┼' + '─'.repeat(12) + '│');

  // Data rows
  for (const result of results) {
    const s = result.summary;
    lines.push('│' + result.variant.padEnd(25) + '│');
    lines.push(`  ${(s.avgBestFitness * 100).toFixed(1)}% ± ${(s.stdBestFitness * 100).toFixed(1)}% │`);
    lines.push(`  ${(s.avgAvgFitness * 100).toFixed(1).padEnd(11)}% │`);
    lines.push(`  ${(s.avgDiversity * 100).toFixed(1).padEnd(9)}% │`);
    lines.push(`  ${s.avgPopulation.toFixed(0).padEnd(10)} │`);
  }

  lines.push('└' + '─'.repeat(70) + '┘');

  return lines.join('\n');
};

/**
 * CLI entry point for running experiments.
 */
export async function runFromCLI(args = process.argv) {
  const runner = new ExperimentRunner();

  // Parse arguments
  let experimentId = null;
  let listOnly = false;

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--list' || arg === '-l') {
      listOnly = true;
    } else if (arg.startsWith('--exp=')) {
      experimentId = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
CraftMind Ranch Experiment Runner

Usage: node src/experiments.js [options]

Options:
  --list, -l           List all available experiments
  --exp=<id>           Run specific experiment by ID
  --help, -h           Show this help

Available Experiments:
  - mutation_rate_adaptation
  - population_size_optimization
  - sexual_selection
  - altruism_vs_selfish

Examples:
  node src/experiments.js --list
  node src/experiments.js --exp=mutation_rate_adaptation
      `);
      process.exit(0);
    }
  }

  // List experiments
  if (listOnly) {
    console.log('🔬 Available Experiments:\n');
    for (const exp of runner.listExperiments()) {
      console.log(`  ${exp.id}`);
      console.log(`    Name: ${exp.name}`);
      console.log(`    Description: ${exp.description}`);
      console.log(`    Variants: ${exp.numVariants} × ${exp.trialsPerVariant} trials`);
      console.log('');
    }
    return;
  }

  // Run specific experiment or default
  const targetExp = experimentId || 'mutation_rate_adaptation';
  console.log(`🧪 Running experiment: ${targetExp}\n`);

  try {
    const results = await runner.run(targetExp);
    console.log('\n✅ Experiment complete!');
    console.log('\n💾 To save results:');
    console.log(`   const results = runner.getResults('${targetExp}');`);
    console.log(`   console.log(results.toJSON());`);
  } catch (error) {
    console.error(`❌ Error running experiment: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFromCLI().catch(console.error);
}
