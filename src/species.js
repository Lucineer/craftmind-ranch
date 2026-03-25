/**
 * CraftMind Ranch — Species Registry
 * 8 Minecraft-adapted farm agent species, each with unique traits and roles.
 */

export const SPECIES = {
  mooshroom: {
    id: 'mooshroom',
    name: 'Mooshroom',
    emoji: '🐄',
    role: 'reasoning',
    description: 'Plans crop rotations, analyzes soil health, and optimizes farm layouts.',
    traits: { speed: 0.4, patience: 0.9, thoroughness: 0.95, strength: 0.3, intelligence: 0.95 },
    capabilities: ['crop_rotation', 'soil_analysis', 'farm_planning', 'yield_prediction'],
    preferredTasks: ['plant_wheat', 'plant_carrots', 'plant_potatoes', 'analyze_soil', 'plan_layout'],
    personality: { cautious: 0.8, curious: 0.7, stubborn: 0.6, social: 0.4 },
  },
  duck: {
    id: 'duck',
    name: 'Duck',
    emoji: '🦆',
    role: 'water',
    description: 'Manages water flow, irrigation channels, and fishing ponds.',
    traits: { speed: 0.6, patience: 0.7, thoroughness: 0.6, strength: 0.3, intelligence: 0.7 },
    capabilities: ['irrigation', 'water_flow', 'fishing', 'pond_maintenance', 'flood_control'],
    preferredTasks: ['irrigate_farm', 'build_pond', 'harvest_fish', 'repair_canal'],
    personality: { cautious: 0.5, curious: 0.8, stubborn: 0.3, social: 0.7 },
  },
  goat: {
    id: 'goat',
    name: 'Goat',
    emoji: '🐐',
    role: 'exploration',
    description: 'Scouts terrain, finds resources, and is the pathfinding expert.',
    traits: { speed: 0.9, patience: 0.5, thoroughness: 0.7, strength: 0.5, intelligence: 0.7 },
    capabilities: ['terrain_scouting', 'resource_location', 'pathfinding', 'cave_exploration'],
    preferredTasks: ['explore_terrain', 'find_resources', 'map_area', 'scout_biome'],
    personality: { cautious: 0.3, curious: 0.95, stubborn: 0.7, social: 0.4 },
  },
  shepherd: {
    id: 'shepherd',
    name: 'Shepherd',
    emoji: '🐑',
    role: 'herding',
    description: 'Manages animal pens, breeding programs, and wool collection.',
    traits: { speed: 0.5, patience: 0.85, thoroughness: 0.8, strength: 0.5, intelligence: 0.7 },
    capabilities: ['animal_herding', 'breeding', 'wool_collection', 'pen_management', 'health_check'],
    preferredTasks: ['breed_animals', 'collect_wool', 'herd_sheep', 'feed_animals', 'check_pen'],
    personality: { cautious: 0.7, curious: 0.4, stubborn: 0.5, social: 0.9 },
  },
  stallion: {
    id: 'stallion',
    name: 'Stallion',
    emoji: '🐴',
    role: 'hauling',
    description: 'Transports items, organizes chests, and manages inventory.',
    traits: { speed: 0.95, patience: 0.4, thoroughness: 0.5, strength: 0.9, intelligence: 0.5 },
    capabilities: ['item_transport', 'chest_organization', 'inventory_management', 'bulk_hauling'],
    preferredTasks: ['haul_items', 'organize_chests', 'sort_inventory', 'deliver_supplies'],
    personality: { cautious: 0.4, curious: 0.5, stubborn: 0.8, social: 0.5 },
  },
  falcon: {
    id: 'falcon',
    name: 'Falcon',
    emoji: '🦅',
    role: 'scouting',
    description: 'Aerial reconnaissance, maps terrain, and spots threats from above.',
    traits: { speed: 0.95, patience: 0.3, thoroughness: 0.6, strength: 0.3, intelligence: 0.85 },
    capabilities: ['aerial_recon', 'terrain_mapping', 'threat_detection', 'waypoint_planning'],
    preferredTasks: ['scout_from_above', 'map_terrain', 'spot_threats', 'find_structures'],
    personality: { cautious: 0.6, curious: 0.9, stubborn: 0.2, social: 0.3 },
  },
  trufflehog: {
    id: 'trufflehog',
    name: 'Trufflehog',
    emoji: '🐗',
    role: 'mining',
    description: 'Finds underground resources and mines efficiently.',
    traits: { speed: 0.6, patience: 0.8, thoroughness: 0.9, strength: 0.85, intelligence: 0.6 },
    capabilities: ['mining', 'resource_extraction', 'tunnel_building', 'ore_detection'],
    preferredTasks: ['mine_coal', 'mine_iron', 'mine_diamonds', 'dig_tunnel', 'quarry'],
    personality: { cautious: 0.6, curious: 0.7, stubborn: 0.9, social: 0.3 },
  },
  rooster: {
    id: 'rooster',
    name: 'Rooster',
    emoji: '🐔',
    role: 'monitoring',
    description: 'Wakes at dawn, alerts to threats, and manages time-based routines.',
    traits: { speed: 0.7, patience: 0.6, thoroughness: 0.7, strength: 0.3, intelligence: 0.8 },
    capabilities: ['threat_alert', 'time_management', 'dawn_routine', 'perimeter_check'],
    preferredTasks: ['patrol_perimeter', 'alert_threats', 'morning_routine', 'check_time'],
    personality: { cautious: 0.8, curious: 0.6, stubborn: 0.7, social: 0.6 },
  },
};

export function getSpecies(id) {
  return SPECIES[id] ?? null;
}

export function allSpecies() {
  return Object.values(SPECIES);
}
