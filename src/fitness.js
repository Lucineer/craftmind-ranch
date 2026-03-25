/**
 * Fitness scoring — how well is each bot doing at its farm tasks?
 */

import { allSpecies } from './species.js';

/** A single performance record. */
export function createRecord(taskId, metrics = {}) {
  return { taskId, timestamp: Date.now(), ...metrics };
}

/** Calculate composite fitness from a bot's task records. */
export function calculateFitness(records, speciesId) {
  if (!records.length) return 0.0;

  const species = allSpecies().find(s => s.id === speciesId);
  const preferred = new Set(species?.preferredTasks ?? []);

  let score = 0;
  let weightedCount = 0;

  for (const r of records) {
    // Base score from success rate and efficiency
    const success = r.success ? 1 : 0;
    const efficiency = r.efficiency ?? 0.5;
    const quality = r.quality ?? 0.5;
    const speed = r.speed ?? 0.5;

    let taskScore = (success * 0.4 + efficiency * 0.2 + quality * 0.2 + speed * 0.2);

    // Species bonus: preferred tasks score higher
    if (preferred.has(r.taskId)) {
      taskScore *= 1.2;
    }

    score += taskScore;
    weightedCount++;
  }

  return weightedCount > 0 ? Math.min(1, score / weightedCount) : 0;
}

/** Per-category scoring. */
export function categoryScores(records) {
  const categories = {
    planting: [], harvesting: [], breeding: [], mining: [],
    building: [], exploring: [], crafting: [], organizing: [],
  };

  for (const r of records) {
    const cat = categorize(r.taskId);
    if (cat) categories[cat].push(r);
  }

  const scores = {};
  for (const [cat, recs] of Object.entries(categories)) {
    if (recs.length === 0) {
      scores[cat] = null;
    } else {
      const successes = recs.filter(r => r.success).length;
      scores[cat] = successes / recs.length;
    }
  }
  return scores;
}

/** Build a leaderboard per species. */
export function buildLeaderboard(bots) {
  // bots: [{ dna, records, fitness }]
  const leaderboard = {};

  for (const bot of bots) {
    const sid = bot.dna.speciesId;
    if (!leaderboard[sid]) leaderboard[sid] = [];
    leaderboard[sid].push({
      botId: bot.dna.id,
      generation: bot.dna.generation,
      fitness: bot.fitness,
      taskCount: bot.records.length,
    });
  }

  // Sort each species by fitness descending
  for (const sid of Object.keys(leaderboard)) {
    leaderboard[sid].sort((a, b) => b.fitness - a.fitness);
  }

  return leaderboard;
}

// --- Helpers ---

const TASK_CATEGORIES = {
  plant_wheat: 'planting', plant_carrots: 'planting', plant_potatoes: 'planting',
  plant_sugar_cane: 'planting', plant_melon: 'planting', plant_pumpkin: 'planting',
  harvest_wheat: 'harvesting', harvest_carrots: 'harvesting', harvest_fish: 'harvesting',
  breed_animals: 'breeding', collect_wool: 'breeding', feed_animals: 'breeding',
  mine_coal: 'mining', mine_iron: 'mining', mine_diamonds: 'mining', dig_tunnel: 'mining', quarry: 'mining',
  build_pond: 'building', repair_canal: 'building', build_pen: 'building',
  explore_terrain: 'exploring', find_resources: 'exploring', scout_biome: 'exploring',
  craft_bread: 'crafting', craft_tools: 'crafting',
  haul_items: 'organizing', organize_chests: 'organizing', sort_inventory: 'organizing',
  // extras
  irrigate_farm: 'planting', analyze_soil: 'planting', plan_layout: 'building',
  herd_sheep: 'breeding', check_pen: 'breeding', map_area: 'exploring',
  map_terrain: 'exploring', find_structures: 'exploring',
  scout_from_above: 'exploring', spot_threats: 'exploring',
  deliver_supplies: 'organizing', patrol_perimeter: 'exploring',
  alert_threats: 'exploring', morning_routine: 'organizing', check_time: 'organizing',
};

function categorize(taskId) {
  return TASK_CATEGORIES[taskId] ?? null;
}
