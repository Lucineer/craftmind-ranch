import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES, getSpecies, allSpecies } from '../src/species.js';
import { createDNA, crossoverDNA, mutateDNA, dnaToMarkdown } from '../src/dna.js';
import { calculateFitness, createRecord } from '../src/fitness.js';
import { Population } from '../src/population.js';
import { EvolutionEngine } from '../src/evolution.js';
import { TASKS, allTasks, buildChain } from '../src/farm-tasks.js';
import { analyzeTask } from '../src/routing.js';
import { registerWithCore } from '../src/index.js';

describe('Species', () => {
  it('has at least 8 species', () => {
    const species = Object.keys(SPECIES);
    assert.ok(species.length >= 8, `expected >= 8 species, got ${species.length}`);
  });

  it('can get a species by id', () => {
    const species = allSpecies();
    assert.ok(species.length >= 8);
    const first = species[0];
    assert.ok(getSpecies(first.id));
  });
});

describe('DNA System', () => {
  it('creates DNA for a species', () => {
    const dna = createDNA('mooshroom');
    assert.ok(dna);
    assert.ok(dna.traits, 'DNA should have traits');
    assert.ok(dna.traits.speed !== undefined);
  });

  it('crossover DNA combines parents', () => {
    const p1 = createDNA('duck');
    const p2 = createDNA('duck');
    const child = crossoverDNA(p1, p2, 'duck');
    assert.ok(child);
    assert.ok(child.generation === 1, 'child should be generation 1');
  });

  it('mutation changes DNA', () => {
    const dna = createDNA('goat');
    const mutated = mutateDNA(dna, 0.5);
    assert.ok(mutated);
  });

  it('converts DNA to markdown', () => {
    const dna = createDNA('rooster');
    const md = dnaToMarkdown(dna);
    assert.ok(typeof md === 'string');
    assert.ok(md.length > 0);
  });
});

describe('Fitness', () => {
  it('creates a fitness record', () => {
    const dna = createDNA('mooshroom');
    const record = createRecord(dna.id, dna, {});
    assert.ok(record);
  });
});

describe('Population', () => {
  it('creates a population', () => {
    const pop = new Population({ speciesId: 'duck', size: 10 });
    assert.ok(pop);
  });
});

describe('Evolution Engine', () => {
  it('creates evolution engine', () => {
    const engine = new EvolutionEngine();
    assert.ok(engine);
  });
});

describe('Farm Tasks', () => {
  it('has multiple tasks', () => {
    const tasks = allTasks();
    assert.ok(tasks.length >= 3, 'should have multiple tasks');
  });

  it('builds task chains', () => {
    const tasks = allTasks();
    if (tasks.length === 0) return;
    const chain = buildChain(tasks[0].id);
    assert.ok(Array.isArray(chain));
  });
});

describe('Routing', () => {
  it('analyzes task with population', () => {
    const pop = new Population({ speciesId: 'goat', size: 5 });
    const result = analyzeTask('milk_production', pop);
    assert.ok(result);
  });
});

describe('Index Exports', () => {
  it('exports registerWithCore', () => {
    assert.equal(typeof registerWithCore, 'function');
  });

  it('registerWithCore accepts a core object', () => {
    let called = false;
    const core = { registerPlugin(name, plugin) { called = true; assert.equal(name, 'ranch'); } };
    registerWithCore(core);
    assert.ok(called);
  });
});
