# 🌾 CraftMind Ranch

> *Self-evolving Minecraft bot species that compete, breed, and specialize in farm tasks through natural selection.*

```
     ╔══════════════════════════════════════════╗
     ║   🌾 CRAFTMIND RANCH 🌾                ║
     ║   Where evolution meets agriculture     ║
     ╠══════════════════════════════════════════╣
     ║                                        ║
     ║   🐄  🦆  🐐  🐑  🐴  🦅  🐗  🐔     ║
     ║   M   D   G   Sh  St  F   T   R       ║
     ║                                        ║
     ║   🌾🌱🥕🌽🍄🎃  🎣  ⛏️💎  📦        ║
     ║                                        ║
     ║   Gen ████████████░░░░░░░░  7         ║
     ║   Fit ██████████████░░░░░  0.72       ║
     ║   Div ██████████░░░░░░░░░  0.58       ║
     ║                                        ║
     ╚══════════════════════════════════════════╝
```

## What Is This?

CraftMind Ranch is a Node.js simulation of an evolving ecosystem of Minecraft farm bots. Eight "species" of AI agents — each inspired by farm animals — compete, breed, and specialize through simulated natural selection. Over generations, they get better at farming tasks like planting crops, mining resources, breeding animals, and organizing chests.

It's inspired by [AI Ranch](https://github.com/SuperInstance/ai-ranch), adapted from API agents to Minecraft farm bots.

## 🐄 Species Catalog

| Species | Role | Specialty | Emoji |
|---------|------|-----------|-------|
| **Mooshroom** | Reasoning | Crop rotation, soil analysis, farm planning | 🐄 |
| **Duck** | Water | Irrigation, water flow, fishing ponds | 🦆 |
| **Goat** | Exploration | Terrain scouting, resource finding, pathfinding | 🐐 |
| **Shepherd** | Herding | Animal pens, breeding programs, wool collection | 🐑 |
| **Stallion** | Hauling | Item transport, chest organization, inventory | 🐴 |
| **Falcon** | Scouting | Aerial reconnaissance, terrain mapping | 🦅 |
| **Trufflehog** | Mining | Underground resources, efficient mining | 🐗 |
| **Rooster** | Monitoring | Dawn routines, threat alerts, time management | 🐔 |

## 🧬 How Evolution Works

```
  ┌──────────┐     ┌────────┐     ┌────────┐
  │ Evaluate │────▶│  Cull  │────▶│ Breed  │
  └──────────┘     └────────┘     └────────┘
       ▲                                │
       │          ┌──────────┐    ┌─────┴──────┐
       │          │  Promote │◀───│Quarantine  │
       │          └──────────┘    └────────────┘
       │               ▲
       │          ┌────┴──────┐
       └──────────┤  Distill  │
                  └───────────┘
```

1. **Evaluate** — Score each bot's fitness based on task performance
2. **Cull** — Remove bots below fitness threshold (0.3)
3. **Breed** — Crossover DNA from top performers with mutation
4. **Distill** — Update behavioral weights from successful actions
5. **Quarantine** — Test offspring (must pass 80% of parent's fitness)
6. **Promote** — Add successful offspring to active population

Each bot has a **DNA** — a JSON config controlling traits, task weights, personality, and learning rate. DNA is inherited with crossover and mutation, just like real genetics.

## 🧬 DNA Format

Each bot's behavior is defined by its DNA:

```json
{
  "speciesId": "mooshroom",
  "generation": 3,
  "traits": {
    "speed": 0.45,
    "patience": 0.92,
    "thoroughness": 0.88,
    "strength": 0.35,
    "intelligence": 0.95
  },
  "taskWeights": {
    "plant_wheat": 0.92,
    "analyze_soil": 0.87
  },
  "learningRate": 0.15,
  "mutationRate": 0.12
}
```

DNA can also be exported as **breed.md** markdown configs in `data/default-dna/`.

## 🚀 Quick Start

```bash
# Clone and run the demo
git clone https://github.com/CedarBeach2019/craftmind-ranch.git
cd craftmind-ranch
node examples/farm-demo.js

# Run tests
node tests/test-all.js

# Start the web dashboard
node src/dashboard.js
# → Open http://localhost:3000
```

## 📊 Web Dashboard

Start the dashboard to see your ranch evolve in real-time:

- Species panels with trait bars and fitness scores
- Population charts per species
- Leaderboard of top-performing bots
- Evolution history timeline
- Auto-refreshes every 5 seconds

## 📁 Project Structure

```
craftmind-ranch/
├── src/
│   ├── index.js          # Main exports
│   ├── species.js        # 8 farm species definitions
│   ├── dna.js            # DNA system (create, crossover, mutate, breed.md)
│   ├── evolution.js      # Evolution engine (6-step cycle)
│   ├── fitness.js        # Task performance scoring
│   ├── routing.js        # Task assignment & species matching
│   ├── farm-tasks.js     # 35+ farm task definitions
│   ├── population.js     # Population management & diversity
│   └── dashboard.js      # Web dashboard (HTML)
├── data/
│   ├── default-dna/      # breed.md configs for all 8 species
│   └── tasks.json        # Task definitions by category
├── examples/
│   └── farm-demo.js      # Interactive demo
├── tests/
│   └── test-all.js       # Full test suite
├── README.md
├── LICENSE               # MIT
└── package.json
```

## 🎮 The Vibe

This isn't scripted automation. It's an ecosystem that breathes. Bots get better by surviving. Bad farmers get culled. Good farmers breed and pass on their genes. Over generations, you'll see Mooshrooms that plan perfect crop rotations, Trufflehogs that find diamonds faster, and Roosters that never miss a dawn patrol.

Like watching evolution happen in fast-forward. 🌾

## License

MIT — see [LICENSE](LICENSE).
