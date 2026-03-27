# CraftMind Ranch

## Overview

CraftMind Ranch is a **genetic evolution engine** for Minecraft bot species. It simulates natural selection where bots compete, breed, and specialize in farm tasks through evolutionary pressure. The system manages 8 distinct species, each with unique traits and roles, evolving over generations to become better at their assigned tasks.

**Core concept**: Bots perform farm tasks → earn fitness scores → top performers breed → offspring inherit and mutate DNA → population evolves toward optimal task performance.

## Architecture

### DNA System (`src/dna.js`)

DNA is the genetic blueprint for each bot, controlling behavior, task preferences, personality, and learning:

```javascript
{
  id: "uuid",
  speciesId: "mooshroom",
  generation: 0,
  parentIds: [],
  traits: { speed, patience, thoroughness, strength, intelligence },
  personality: { cautious, curious, stubborn, social },
  taskWeights: { "plant_wheat": 0.8, ... }, // learned preferences
  learningRate: 0.15,
  mutationRate: 0.12,
  confidence: { "harvest_wheat": 0.9 }, // per-task confidence
  createdAt: timestamp
}
```

**Key operations**:
- `createDNA(speciesId, overrides)` - Create new DNA with species defaults
- `crossoverDNA(parentA, parentB, speciesId)` - Breed two parents (random trait selection)
- `mutateDNA(dna)` - Apply random mutations to traits/personality
- `adjustTaskWeight(dna, taskId, success)` - Reinforcement learning from task outcomes
- `dnaToMarkdown(dna)` - Export as breed report

### Species Registry (`src/species.js`)

8 Minecraft-adapted species with specialized roles:

| Species | Role | Key Traits | Preferred Tasks |
|---------|------|------------|-----------------|
| 🐄 Mooshroom | Reasoning | High intelligence, patience | Crop planning, soil analysis |
| 🦆 Duck | Water | Balanced, curious | Irrigation, fishing, pond maintenance |
| 🐐 Goat | Exploration | High speed, curiosity | Terrain scouting, resource finding |
| 🐑 Shepherd | Herding | High patience, social | Animal breeding, wool collection |
| 🐴 Stallion | Hauling | High speed/strength | Item transport, chest organization |
| 🦅 Falcon | Scouting | High speed/intelligence | Aerial recon, threat detection |
| 🐗 Trufflehog | Mining | High strength/thoroughness | Mining, tunnel building |
| 🐔 Rooster | Monitoring | High caution | Threat alerts, perimeter checks |

### Evolution Pipeline (`src/evolution.js`)

The 7-step evolution cycle:

1. **Evaluate** - Score each bot's fitness from task records
2. **Cull** - Remove bots below threshold (protect minimum species)
3. **Breed** - Crossover DNA from top performers
4. **Distill** - Update behavioral weights based on task success/failure
5. **Quarantine** - Test offspring (simulated fitness)
6. **Promote** - Add successful offspring to active population
7. **Protect** - Ensure minimum population per species (immigration)

### Farm Tasks (`src/farm-tasks.js`)

43 task definitions across 8 categories:

- **Planting** (8): plant_wheat, plant_carrots, irrigate_farm, analyze_soil...
- **Harvesting** (3): harvest_wheat, harvest_carrots, harvest_fish
- **Breeding** (5): breed_animals, collect_wool, feed_animals, herd_sheep...
- **Mining** (5): mine_coal, mine_iron, mine_diamonds, dig_tunnel, quarry
- **Building** (4): build_pond, repair_canal, build_pen, plan_layout
- **Exploring** (9): explore_terrain, find_resources, scout_biome, map_area...
- **Crafting** (2): craft_bread, craft_tools
- **Organizing** (6): haul_items, organize_chests, sort_inventory...

Tasks support dependency chains (e.g., plant_wheat → harvest_wheat → craft_bread).

### Task Routing (`src/routing.js`)

Assigns tasks to best-fit species using multi-factor scoring:

```javascript
// Scoring factors:
- Category affinity (primary species gets +0.5)
- Species preferred tasks (+0.2 if match)
- Population fitness bonus (avg fitness * 0.2)
- Trait-task matching (speed vs speed criteria, etc.)
```

Returns ranked species list with confidence scores for intelligent task assignment.

### Fitness Scoring (`src/fitness.js`)

Composite fitness calculation from task records:

```javascript
fitness = avg(
  success * 0.4 +
  efficiency * 0.2 +
  quality * 0.2 +
  speed * 0.2
) * species_bonus // 1.2x for preferred tasks
```

Tracks per-category scores and builds species leaderboards.

### Population Management (`src/population.js`)

Manages ecosystem balance:

- **Caps**: Max per species (default 6)
- **Floors**: Min per species (default 1) - extinction protection
- **Diversity metric**: Average trait std dev across population
- **Immigration**: Spawns new random DNA if diversity drops
- **Snapshots**: Records generation history for analytics

### Web Dashboard (`src/dashboard.js`)

Self-contained HTML dashboard with live stats:
- Species population cards with fitness bars
- Leaderboard (top 20 bots)
- Diversity metric
- Generation history
- Auto-refreshes every 5 seconds

Run with: `node src/dashboard.js` → http://localhost:3000

## File Structure

```
craftmind-ranch/
├── src/
│   ├── index.js              # Entry point, exports, registerWithCore()
│   ├── dna.js                # DNA creation, crossover, mutation
│   ├── species.js            # 8 species definitions
│   ├── evolution.js          # EvolutionEngine class
│   ├── population.js         # Population management
│   ├── fitness.js            # Fitness calculation
│   ├── farm-tasks.js         # 43 task definitions
│   ├── routing.js            # Task-to-species assignment
│   ├── dashboard.js          # Web dashboard
│   └── ai/
│       ├── animal-agent.js       # Agent with mood, health, memory
│       ├── genetics-evaluator.js # Breeding pair evaluation
│       ├── ranch-actions.js      # Action schema (BREED, FEED, etc.)
│       ├── ranch-npcs.js         # NPC personalities
│       ├── ranch-story-gen.js    # Story generation
│       └── utils.js              # Utilities
├── data/
│   ├── default-dna/         # Species DNA templates
│   └── tasks.json           # Task categories and chains
├── examples/
│   ├── demo.js              # Standalone demo
│   └── farm-demo.js         # Population evolution demo
├── scripts/
│   └── playtest.js          # Simulated plugin test
├── tests/
│   ├── integration.test.js  # Core integration tests
│   ├── test-ai.js           # AI module tests
│   └── test-all.js          # Test runner
└── package.json
```

## State Management

### Bot State (`Population.bots`)
```javascript
Map<botId, {
  dna: DNA,
  records: Array<{taskId, timestamp, success, efficiency, quality, speed}>,
  fitness: number
}>
```

### Evolution State
```javascript
EvolutionEngine {
  quarantined: Array<{dna, records, fitness}>, // offspring awaiting test
  pendingPromotion: Array<{dna, records, fitness}>, // passed quarantine
  generation: number,
  log: Array<generation_reports>
}
```

### Population State
```javascript
Population {
  bots: Map,
  generation: number,
  history: Array<{generation, totalPopulation, diversity, speciesStats, timestamp}>
}
```

## Five High-Impact Improvements

### 1. **Task Performance Simulation**
Current: Evolution uses simulated fitness in quarantine.
Improvement: Run actual Minecraft tasks in sandbox environment.
Impact: Real evolution pressure, specialized breeds emerge faster.

### 2. **Dynamic Task Weights**
Current: Task weights only adjust through `adjustTaskWeight()`.
Improvement: Auto-adjust based on farm needs (e.g., boost planting in spring).
Impact: Adaptive population that responds to farm conditions.

### 3. **Trait Co-evolution**
Current: Traits evolve independently.
Improvement: Track trait combinations that work well together (synergy bonuses).
Impact: Emergence of specialized "builds" (speed+thoroughness scouts, etc.).

### 4. **Multi-objective Fitness**
Current: Single composite fitness score.
Improvement: Pareto front optimization (speed vs quality vs efficiency).
Impact: Diverse population with different specialization strategies.

### 5. **Experience-based Learning**
Current: Confidence updates only on success/failure.
Improvement: Track task difficulty, context, and partial success.
Impact: Smarter task assignment, faster learning curves.

## Core Integration

### Registration
```javascript
import { registerWithCore } from 'craftmind-ranch';

registerWithCore(core);
// Registers 'ranch' plugin with modules:
// - Population
// - EvolutionEngine
// - SPECIES
// - createDNA
// - calculateFitness
// - TASKS
```

### Usage Pattern
```javascript
// 1. Create population
const pop = new Population(6, 1); // max=6, min=1 per species

// 2. Spawn initial bots
for (const species of allSpecies()) {
  pop.add(createDNA(species.id));
}

// 3. Run evolution
const engine = new EvolutionEngine(pop);
await engine.evolve();

// 4. Assign tasks
const assignment = assignTask('plant_wheat', pop);
console.log(`Assigned to ${assignment.bot.dna.speciesId}`);

// 5. Record outcomes
pop.get(assignment.bot.dna.id).records.push(
  createRecord('plant_wheat', {success: true, efficiency: 0.8})
);

// 6. View dashboard
startDashboard(pop, engine.log);
```

### Extension Points
- **Custom species**: Add to `SPECIES` in `species.js`
- **Custom tasks**: Add to `TASKS` in `farm-tasks.js`
- **Fitness functions**: Override `calculateFitness()` for custom scoring
- **Evolution strategies**: Extend `EvolutionEngine` for custom selection

## Key Design Principles

1. **Modularity**: Each module (DNA, species, evolution) is independent and composable
2. **Extensibility**: Easy to add species, tasks, or fitness criteria
3. **Simulation-first**: Works without Minecraft server for testing
4. **Data-driven**: All species, tasks, and defaults are data structures
5. **Evolutionary pressure**: Survival depends on task performance, not just randomness

## Testing

```bash
npm test              # Run all tests (38 tests)
node examples/demo.js # Standalone evolution demo
node scripts/playtest.js # Simulated plugin test
npm run dashboard     # Launch web UI
```

## Dependencies

None! This is a pure JavaScript implementation with zero external dependencies. Uses only Node.js built-in modules (`crypto`, `http`, `fs`, `path`).

## License

MIT
