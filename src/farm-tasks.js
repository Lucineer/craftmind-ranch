/**
 * Farm task definitions.
 */

export const TASK_CATEGORIES = [
  'planting', 'harvesting', 'breeding', 'mining',
  'building', 'exploring', 'crafting', 'organizing',
];

export const TASKS = {
  // Planting
  plant_wheat: {
    id: 'plant_wheat', category: 'planting', name: 'Plant Wheat',
    description: 'Till soil and plant wheat seeds.',
    preconditions: ['has_hoe', 'has_wheat_seeds'],
    requiredItems: { wheat_seeds: 1 },
    outcome: { wheat_planted: 1 },
    scoringCriteria: ['speed', 'yield'],
    chains: ['harvest_wheat', 'craft_bread'],
  },
  plant_carrots: {
    id: 'plant_carrots', category: 'planting', name: 'Plant Carrots',
    preconditions: ['has_hoe'], requiredItems: { carrot: 1 },
    outcome: { carrots_planted: 1 }, scoringCriteria: ['speed', 'yield'], chains: ['harvest_carrots'],
  },
  plant_potatoes: {
    id: 'plant_potatoes', category: 'planting', name: 'Plant Potatoes',
    preconditions: ['has_hoe'], requiredItems: { potato: 1 },
    outcome: { potatoes_planted: 1 }, scoringCriteria: ['speed', 'yield'], chains: ['harvest_potatoes'],
  },
  plant_sugar_cane: {
    id: 'plant_sugar_cane', category: 'planting', name: 'Plant Sugar Cane',
    preconditions: ['near_water'], requiredItems: { sugar_cane: 1 },
    outcome: { sugar_cane_planted: 1 }, scoringCriteria: ['speed'], chains: [],
  },
  plant_melon: {
    id: 'plant_melon', category: 'planting', name: 'Plant Melon',
    preconditions: ['has_hoe'], requiredItems: { melon_seeds: 1 },
    outcome: { melon_planted: 1 }, scoringCriteria: ['speed', 'yield'], chains: [],
  },
  plant_pumpkin: {
    id: 'plant_pumpkin', category: 'planting', name: 'Plant Pumpkin',
    preconditions: ['has_hoe'], requiredItems: { pumpkin_seeds: 1 },
    outcome: { pumpkin_planted: 1 }, scoringCriteria: ['speed', 'yield'], chains: [],
  },

  // Harvesting
  harvest_wheat: {
    id: 'harvest_wheat', category: 'harvesting', name: 'Harvest Wheat',
    preconditions: ['wheat_grown'], requiredItems: {},
    outcome: { wheat: 1, wheat_seeds: 1 }, scoringCriteria: ['speed', 'yield'], chains: ['craft_bread', 'plant_wheat'],
  },
  harvest_carrots: {
    id: 'harvest_carrots', category: 'harvesting', name: 'Harvest Carrots',
    preconditions: ['carrots_grown'], requiredItems: {},
    outcome: { carrot: 2 }, scoringCriteria: ['speed', 'yield'], chains: ['plant_carrots'],
  },
  harvest_fish: {
    id: 'harvest_fish', category: 'harvesting', name: 'Harvest Fish',
    preconditions: ['near_water', 'has_fishing_rod'], requiredItems: { fishing_rod: 1 },
    outcome: { fish: 1 }, scoringCriteria: ['speed'], chains: [],
  },

  // Breeding
  breed_animals: {
    id: 'breed_animals', category: 'breeding', name: 'Breed Animals',
    preconditions: ['has_animals', 'has_food'], requiredItems: { wheat: 2 },
    outcome: { baby_animal: 1 }, scoringCriteria: ['quality'], chains: [],
  },
  collect_wool: {
    id: 'collect_wool', category: 'breeding', name: 'Collect Wool',
    preconditions: ['has_sheep', 'has_shears'], requiredItems: { shears: 1 },
    outcome: { wool: 1 }, scoringCriteria: ['speed'], chains: ['craft_bread'],
  },
  feed_animals: {
    id: 'feed_animals', category: 'breeding', name: 'Feed Animals',
    preconditions: ['has_animals', 'has_food'], requiredItems: { wheat: 1 },
    outcome: { animals_fed: 1 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  herd_sheep: {
    id: 'herd_sheep', category: 'breeding', name: 'Herd Sheep',
    preconditions: ['has_sheep'], requiredItems: {},
    outcome: { sheep_herded: 1 }, scoringCriteria: ['quality'], chains: [],
  },

  // Mining
  mine_coal: {
    id: 'mine_coal', category: 'mining', name: 'Mine Coal',
    preconditions: ['has_pickaxe', 'underground'], requiredItems: { pickaxe: 1 },
    outcome: { coal: 1 }, scoringCriteria: ['speed', 'yield'], chains: [],
  },
  mine_iron: {
    id: 'mine_iron', category: 'mining', name: 'Mine Iron',
    preconditions: ['has_pickaxe', 'underground'], requiredItems: { stone_pickaxe: 1 },
    outcome: { iron_ore: 1 }, scoringCriteria: ['speed', 'yield'], chains: ['craft_tools'],
  },
  mine_diamonds: {
    id: 'mine_diamonds', category: 'mining', name: 'Mine Diamonds',
    preconditions: ['has_pickaxe', 'deep_underground'], requiredItems: { iron_pickaxe: 1 },
    outcome: { diamond: 1 }, scoringCriteria: ['quality'], chains: ['craft_tools'],
  },
  dig_tunnel: {
    id: 'dig_tunnel', category: 'mining', name: 'Dig Tunnel',
    preconditions: ['has_pickaxe'], requiredItems: { pickaxe: 1 },
    outcome: { tunnel_length: 10 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  quarry: {
    id: 'quarry', category: 'mining', name: 'Quarry',
    preconditions: ['has_pickaxe'], requiredItems: { pickaxe: 1 },
    outcome: { cobblestone: 64, random_ore: 1 }, scoringCriteria: ['yield'], chains: [],
  },

  // Building
  build_pond: {
    id: 'build_pond', category: 'building', name: 'Build Pond',
    preconditions: ['has_shovel'], requiredItems: { shovel: 1, water_bucket: 1 },
    outcome: { pond_built: 1 }, scoringCriteria: ['quality'], chains: ['harvest_fish'],
  },
  repair_canal: {
    id: 'repair_canal', category: 'building', name: 'Repair Canal',
    preconditions: ['has_canal'], requiredItems: { dirt: 4 },
    outcome: { canal_repaired: 1 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  build_pen: {
    id: 'build_pen', category: 'building', name: 'Build Pen',
    preconditions: ['has_fence'], requiredItems: { fence: 8, fence_gate: 1 },
    outcome: { pen_built: 1 }, scoringCriteria: ['quality'], chains: ['breed_animals'],
  },

  // Exploring
  explore_terrain: {
    id: 'explore_terrain', category: 'exploring', name: 'Explore Terrain',
    preconditions: [], requiredItems: {},
    outcome: { chunks_explored: 4 }, scoringCriteria: ['thoroughness'], chains: ['find_resources'],
  },
  find_resources: {
    id: 'find_resources', category: 'exploring', name: 'Find Resources',
    preconditions: [], requiredItems: {},
    outcome: { resource_found: 1 }, scoringCriteria: ['quality'], chains: [],
  },
  scout_biome: {
    id: 'scout_biome', category: 'exploring', name: 'Scout Biome',
    preconditions: [], requiredItems: {},
    outcome: { biome_mapped: 1 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  map_area: {
    id: 'map_area', category: 'exploring', name: 'Map Area',
    preconditions: [], requiredItems: {},
    outcome: { area_mapped: 1 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  scout_from_above: {
    id: 'scout_from_above', category: 'exploring', name: 'Scout From Above',
    preconditions: ['has_elytra_or_creative'], requiredItems: {},
    outcome: { area_scanned: 1 }, scoringCriteria: ['thoroughness'], chains: ['find_resources'],
  },
  spot_threats: {
    id: 'spot_threats', category: 'exploring', name: 'Spot Threats',
    preconditions: [], requiredItems: {},
    outcome: { threats_identified: 1 }, scoringCriteria: ['quality'], chains: [],
  },
  find_structures: {
    id: 'find_structures', category: 'exploring', name: 'Find Structures',
    preconditions: [], requiredItems: {},
    outcome: { structure_found: 1 }, scoringCriteria: ['quality'], chains: [],
  },

  // Crafting
  craft_bread: {
    id: 'craft_bread', category: 'crafting', name: 'Craft Bread',
    preconditions: ['has_wheat'], requiredItems: { wheat: 3 },
    outcome: { bread: 1 }, scoringCriteria: ['speed'], chains: [],
  },
  craft_tools: {
    id: 'craft_tools', category: 'crafting', name: 'Craft Tools',
    preconditions: ['has_materials'], requiredItems: { stick: 2, cobblestone_or_iron: 3 },
    outcome: { tool: 1 }, scoringCriteria: ['quality'], chains: [],
  },

  // Organizing
  haul_items: {
    id: 'haul_items', category: 'organizing', name: 'Haul Items',
    preconditions: ['has_items_to_move'], requiredItems: {},
    outcome: { items_hauled: 1 }, scoringCriteria: ['speed', 'efficiency'], chains: [],
  },
  organize_chests: {
    id: 'organize_chests', category: 'organizing', name: 'Organize Chests',
    preconditions: ['has_chests'], requiredItems: {},
    outcome: { chests_organized: 1 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  sort_inventory: {
    id: 'sort_inventory', category: 'organizing', name: 'Sort Inventory',
    preconditions: [], requiredItems: {},
    outcome: { inventory_sorted: 1 }, scoringCriteria: ['efficiency'], chains: [],
  },

  // Special tasks
  irrigate_farm: {
    id: 'irrigate_farm', category: 'planting', name: 'Irrigate Farm',
    preconditions: ['has_water_source'], requiredItems: { water_bucket: 1 },
    outcome: { farmland_irrigated: 1 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  analyze_soil: {
    id: 'analyze_soil', category: 'planting', name: 'Analyze Soil',
    preconditions: [], requiredItems: {},
    outcome: { soil_analyzed: 1 }, scoringCriteria: ['quality'], chains: ['plant_wheat'],
  },
  plan_layout: {
    id: 'plan_layout', category: 'building', name: 'Plan Layout',
    preconditions: [], requiredItems: {},
    outcome: { layout_planned: 1 }, scoringCriteria: ['quality'], chains: [],
  },
  check_pen: {
    id: 'check_pen', category: 'breeding', name: 'Check Pen',
    preconditions: ['has_pen'], requiredItems: {},
    outcome: { pen_checked: 1 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  map_terrain: {
    id: 'map_terrain', category: 'exploring', name: 'Map Terrain',
    preconditions: [], requiredItems: {},
    outcome: { terrain_mapped: 1 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  deliver_supplies: {
    id: 'deliver_supplies', category: 'organizing', name: 'Deliver Supplies',
    preconditions: ['has_items'], requiredItems: {},
    outcome: { supplies_delivered: 1 }, scoringCriteria: ['speed'], chains: [],
  },
  patrol_perimeter: {
    id: 'patrol_perimeter', category: 'exploring', name: 'Patrol Perimeter',
    preconditions: [], requiredItems: {},
    outcome: { perimeter_patrolled: 1 }, scoringCriteria: ['thoroughness'], chains: ['spot_threats'],
  },
  alert_threats: {
    id: 'alert_threats', category: 'exploring', name: 'Alert Threats',
    preconditions: ['threat_detected'], requiredItems: {},
    outcome: { alerts_sent: 1 }, scoringCriteria: ['quality'], chains: [],
  },
  morning_routine: {
    id: 'morning_routine', category: 'organizing', name: 'Morning Routine',
    preconditions: ['is_dawn'], requiredItems: {},
    outcome: { routine_complete: 1 }, scoringCriteria: ['thoroughness'], chains: [],
  },
  check_time: {
    id: 'check_time', category: 'organizing', name: 'Check Time',
    preconditions: [], requiredItems: {},
    outcome: { time_checked: 1 }, scoringCriteria: ['speed'], chains: [],
  },
};

export function getTask(taskId) {
  return TASKS[taskId] ?? null;
}

export function getTasksByCategory(category) {
  return Object.values(TASKS).filter(t => t.category === category);
}

export function allTasks() {
  return Object.values(TASKS);
}

/** Build task chains starting from a given task. */
export function buildChain(taskId, visited = new Set()) {
  if (visited.has(taskId)) return [];
  visited.add(taskId);
  const task = getTask(taskId);
  if (!task) return [];
  const result = [task];
  for (const next of task.chains) {
    result.push(...buildChain(next, visited));
  }
  return result;
}
