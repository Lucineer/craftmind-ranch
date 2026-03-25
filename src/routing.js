/**
 * Routing — assign tasks to the best-fit species.
 */

import { allSpecies } from './species.js';
import { getTask } from './farm-tasks.js';

/** Keyword → category mapping for simple task analysis. */
const KEYWORD_CATEGORIES = {
  plant: 'planting', harvest: 'harvesting', grow: 'planting',
  breed: 'breeding', wool: 'breeding', animal: 'breeding', sheep: 'breeding', pen: 'breeding',
  mine: 'mining', dig: 'mining', coal: 'mining', iron: 'mining', diamond: 'mining', quarry: 'mining', tunnel: 'mining',
  build: 'building', pond: 'building', canal: 'building', fence: 'building',
  explore: 'exploring', scout: 'exploring', map: 'exploring', find: 'exploring', patrol: 'exploring',
  craft: 'crafting', bread: 'crafting', tool: 'crafting',
  haul: 'organizing', chest: 'organizing', inventory: 'organizing', sort: 'organizing', deliver: 'organizing', morning: 'organizing',
  water: 'planting', irrigate: 'planting', fish: 'harvesting',
  soil: 'planting', wheat: 'planting', carrot: 'planting', potato: 'planting',
};

/** Category → species affinity. */
const CATEGORY_AFFINITY = {
  planting: ['mooshroom', 'duck'],
  harvesting: ['mooshroom', 'shepherd'],
  breeding: ['shepherd'],
  mining: ['trufflehog'],
  building: ['mooshroom', 'duck'],
  exploring: ['goat', 'falcon'],
  crafting: ['stallion'],
  organizing: ['stallion', 'rooster'],
};

/** Analyze a task description and determine the best species to assign. */
export function analyzeTask(taskId, population) {
  const task = getTask(taskId);
  const category = task?.category ?? guessCategory(taskId);

  const speciesList = allSpecies();
  const scores = [];

  for (const sp of speciesList) {
    let score = 0;

    // Category affinity (base score)
    const affinity = CATEGORY_AFFINITY[category] ?? [];
    if (affinity.includes(sp.id)) score += 0.4;
    if (affinity[0] === sp.id) score += 0.1; // Primary species gets extra

    // Species preferred tasks
    if (task && sp.preferredTasks.includes(taskId)) score += 0.2;

    // Population fitness bonus
    const bots = population.getBySpecies(sp.id);
    if (bots.length > 0) {
      const avgFitness = bots.reduce((s, b) => s + b.fitness, 0) / bots.length;
      score += avgFitness * 0.2;
    }

    // Trait-task matching
    if (task) {
      for (const criteria of task.scoringCriteria) {
        if (criteria === 'speed') score += sp.traits.speed * 0.05;
        if (criteria === 'thoroughness') score += sp.traits.thoroughness * 0.05;
        if (criteria === 'quality') score += sp.traits.intelligence * 0.05;
        if (criteria === 'yield') score += sp.traits.strength * 0.05;
      }
    }

    scores.push({ speciesId: sp.id, score });
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  return scores;
}

/** Assign task to the best available bot. */
export function assignTask(taskId, population) {
  const scores = analyzeTask(taskId, population);

  for (const { speciesId } of scores) {
    const bots = population.getBySpecies(speciesId);
    // Pick highest fitness bot
    bots.sort((a, b) => b.fitness - a.fitness);
    for (const bot of bots) {
      // Check confidence
      const confidence = bot.dna.confidence[taskId] ?? 0.5;
      if (confidence > 0.2) {
        return { bot, speciesId, confidence, scores };
      }
    }
  }

  // Fallback: any bot
  const ranked = population.ranked();
  if (ranked.length > 0) {
    return { bot: ranked[0], speciesId: ranked[0].dna.speciesId, confidence: 0.1, scores };
  }

  return null;
}

/** Learn from assignment outcome: update confidence. */
export function learnFromOutcome(bot, taskId, success) {
  const c = bot.dna.confidence[taskId] ?? 0.5;
  const lr = bot.dna.learningRate;
  bot.dna.confidence[taskId] = Math.min(1, Math.max(0, c + (success ? lr * 0.1 : -lr * 0.2)));
}

function guessCategory(taskId) {
  const lower = taskId.toLowerCase();
  for (const [keyword, cat] of Object.entries(KEYWORD_CATEGORIES)) {
    if (lower.includes(keyword)) return cat;
  }
  return 'organizing';
}
