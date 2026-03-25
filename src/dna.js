/**
 * DNA — genetic blueprint for each bot.
 * DNA is a simple JSON object that controls behavior, task weights, personality, and learning.
 */

import { getSpecies } from './species.js';

/** Create a DNA for a given species, optionally seeded with custom overrides. */
export function createDNA(speciesId, overrides = {}) {
  const species = getSpecies(speciesId);
  if (!species) throw new Error(`Unknown species: ${speciesId}`);

  return {
    id: crypto.randomUUID(),
    speciesId,
    generation: 0,
    parentIds: [],
    traits: { ...species.traits },
    personality: { ...species.personality },
    taskWeights: Object.fromEntries(
      species.preferredTasks.map(t => [t, Math.random() * 0.3 + 0.7])
    ),
    learningRate: 0.1 + Math.random() * 0.2,
    mutationRate: 0.1 + Math.random() * 0.15,
    confidence: {},               // taskId → confidence 0..1
    createdAt: Date.now(),
    ...overrides,
  };
}

/** Deep clone a DNA object. */
export function cloneDNA(dna) {
  return JSON.parse(JSON.stringify(dna));
}

/** Crossover two parent DNAs to produce a child. */
export function crossoverDNA(parentA, parentB, childSpeciesId) {
  const pick = (a, b) => Math.random() < 0.5 ? a : b;

  const child = createDNA(childSpeciesId, {
    generation: Math.max(parentA.generation, parentB.generation) + 1,
    parentIds: [parentA.id, parentB.id],
    traits: {
      speed: pick(parentA.traits.speed, parentB.traits.speed),
      patience: pick(parentA.traits.patience, parentB.traits.patience),
      thoroughness: pick(parentA.traits.thoroughness, parentB.traits.thoroughness),
      strength: pick(parentA.traits.strength, parentB.traits.strength),
      intelligence: pick(parentA.traits.intelligence, parentB.traits.intelligence),
    },
    personality: {
      cautious: pick(parentA.personality.cautious, parentB.personality.cautious),
      curious: pick(parentA.personality.curious, parentB.personality.curious),
      stubborn: pick(parentA.personality.stubborn, parentB.personality.stubborn),
      social: pick(parentA.personality.social, parentB.personality.social),
    },
    learningRate: pick(parentA.learningRate, parentB.learningRate),
    mutationRate: (parentA.mutationRate + parentB.mutationRate) / 2,
    confidence: mergeConfidence(parentA.confidence, parentB.confidence),
    taskWeights: mergeTaskWeights(parentA.taskWeights, parentB.taskWeights),
  });

  return child;
}

/** Apply mutations to a DNA in-place. */
export function mutateDNA(dna) {
  const m = dna.mutationRate;

  // Mutate traits
  for (const key of Object.keys(dna.traits)) {
    if (Math.random() < m) {
      dna.traits[key] = clamp(dna.traits[key] + (Math.random() - 0.5) * 0.2);
    }
  }

  // Mutate personality
  for (const key of Object.keys(dna.personality)) {
    if (Math.random() < m) {
      dna.personality[key] = clamp(dna.personality[key] + (Math.random() - 0.5) * 0.2);
    }
  }

  // Mutate mutation rate itself (bounded)
  if (Math.random() < m * 0.5) {
    dna.mutationRate = clamp(dna.mutationRate + (Math.random() - 0.5) * 0.05, 0.01, 0.5);
  }

  // Mutate learning rate
  if (Math.random() < m * 0.5) {
    dna.learningRate = clamp(dna.learningRate + (Math.random() - 0.5) * 0.05, 0.01, 0.5);
  }

  return dna;
}

/** Adjust task weight after a success or failure (distillation step). */
export function adjustTaskWeight(dna, taskId, success) {
  const w = dna.taskWeights[taskId] ?? 0.5;
  const lr = dna.learningRate;
  dna.taskWeights[taskId] = success
    ? clamp(w + lr * 0.1)
    : clamp(w - lr * 0.2);

  // Confidence
  const c = dna.confidence[taskId] ?? 0.5;
  dna.confidence[taskId] = success
    ? clamp(c + lr * 0.15)
    : clamp(c - lr * 0.2);

  return dna;
}

// --- Helpers ---

function clamp(v, min = 0, max = 1) {
  return Math.round(Math.min(max, Math.max(min, v)) * 1000) / 1000;
}

function mergeConfidence(a, b) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const out = {};
  for (const k of keys) {
    out[k] = clamp(((a?.[k] ?? 0.5) + (b?.[k] ?? 0.5)) / 2);
  }
  return out;
}

function mergeTaskWeights(a, b) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const out = {};
  for (const k of keys) {
    out[k] = clamp(((a?.[k] ?? 0.5) + (b?.[k] ?? 0.5)) / 2);
  }
  return out;
}

/** Serialize DNA to a breed.md-style markdown string. */
export function dnaToMarkdown(dna) {
  const lines = [
    `# 🧬 ${dna.speciesId} — Gen ${dna.generation}`,
    '',
    `**Parents:** ${dna.parentIds.length ? dna.parentIds.join(', ') : 'None (founder)'}`,
    `**Mutation Rate:** ${dna.mutationRate}`,
    `**Learning Rate:** ${dna.learningRate}`,
    '',
    '## Traits',
    ...Object.entries(dna.traits).map(([k, v]) => `- ${k}: ${bar(v)} ${v.toFixed(3)}`),
    '',
    '## Personality',
    ...Object.entries(dna.personality).map(([k, v]) => `- ${k}: ${bar(v)} ${v.toFixed(3)}`),
    '',
    '## Task Weights',
    ...Object.entries(dna.taskWeights).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v.toFixed(3)}`),
  ];
  return lines.join('\n');
}

function bar(v, width = 10) {
  const filled = Math.round(v * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

/** Parse breed.md back to DNA partial (for manual editing). */
export function markdownToDNA(md) {
  const partial = {};
  const traitMatch = md.matchAll(/- (\w+): [█░]+ ([\d.]+)/g);
  for (const [, key, val] of traitMatch) {
    partial[key] = parseFloat(val);
  }
  return partial;
}
