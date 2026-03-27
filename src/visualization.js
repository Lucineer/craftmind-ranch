/**
 * Visualization dashboard — ASCII art charts and console graphics.
 * Generate visual representations of evolution data for console output.
 */

/**
 * Dashboard class for rendering ASCII art visualizations.
 */
export class Dashboard {
  constructor(options = {}) {
    this.width = options.width || 80;
    this.height = options.height || 20;
    this.barChar = options.barChar || '█';
    this.emptyChar = options.emptyChar || '░';
  }

  /**
   * Render a horizontal bar chart.
   */
  renderHorizontalBar(label, value, max, width = 40) {
    const filled = Math.round((value / max) * width);
    const bar = this.barChar.repeat(filled) + this.emptyChar.repeat(width - filled);
    const pct = ((value / max) * 100).toFixed(1);
    return `${label.padEnd(20)} [${bar}] ${pct}%`;
  }

  /**
   * Render a vertical bar chart (column chart).
   */
  renderVerticalBars(data, labels, height = 10) {
    const max = Math.max(...data);
    const lines = [];

    for (let y = height; y >= 0; y--) {
      const line = [];
      for (let i = 0; i < data.length; i++) {
        const barHeight = Math.round((data[i] / max) * height);
        if (y === 0) {
          line.push('─'.repeat(3));
        } else if (y <= barHeight) {
          line.push(this.barChar.repeat(3));
        } else {
          line.push(' '.repeat(3));
        }
      }
      lines.push(line.join(' '));
    }

    // Add labels
    const labelLine = labels.map(l => l.padEnd(3)).join(' ');
    lines.push(labelLine);

    return lines.join('\n');
  }

  /**
   * Render fitness evolution chart over generations.
   */
  renderFitnessChart(generations, options = {}) {
    const {
      showBest = true,
      showAvg = true,
      showPopulation = false,
      width = 60,
      height = 12,
    } = options;

    if (!generations || generations.length === 0) {
      return 'No data to display';
    }

    const bestFitness = generations.map(g => g.best_fitness ?? g.bestFitness ?? 0);
    const avgFitness = generations.map(g => g.avg_fitness ?? g.avgFitness ?? 0);
    const population = generations.map(g => g.population ?? 0);

    const maxFitness = 1.0;
    const lines = [];

    // Header
    lines.push('📈 Fitness Evolution');
    lines.push('─'.repeat(width + 10));

    // Chart
    for (let y = height; y >= 0; y--) {
      const line = [` ${(y / height * 100).toFixed(0).padStart(3)}% `];

      for (let x = 0; x < generations.length; x++) {
        let char = ' ';

        if (showBest && y <= Math.round(bestFitness[x] * height)) {
          char = '█'; // Best fitness
        } else if (showAvg && y <= Math.round(avgFitness[x] * height)) {
          char = '▓'; // Avg fitness
        }

        line.push(char);
      }

      lines.push(line.join(''));
    }

    // X-axis
    lines.push('      ' + '─'.repeat(generations.length));
    const genLabel = 'Gen';
    lines.push(`      ${genLabel} 1 → ${generations.length}`);

    // Legend
    const legend = [];
    if (showBest) legend.push('█ Best');
    if (showAvg) legend.push('▓ Avg');
    lines.push(`      Legend: ${legend.join(' | ')}`);

    return lines.join('\n');
  }

  /**
   * Render trait distribution as histogram.
   */
  renderTraits(traitDistribution, options = {}) {
    const {
      width = 50,
      showAll = true,
    } = options;

    if (!traitDistribution) {
      return 'No trait data available';
    }

    const lines = [];
    lines.push('📊 Trait Distribution');
    lines.push('─'.repeat(width + 30));

    for (const [trait, stats] of Object.entries(traitDistribution)) {
      lines.push('');
      lines.push(`${trait.toUpperCase().padEnd(12)}`);
      lines.push(this.renderHorizontalBar('  Min', stats.min, 1.0, width));
      lines.push(this.renderHorizontalBar('  Max', stats.max, 1.0, width));
      lines.push(this.renderHorizontalBar('  Avg', stats.avg, 1.0, width));
      lines.push(`             Std Dev: ${stats.std.toFixed(3)}`);
    }

    return lines.join('\n');
  }

  /**
   * Render species population chart.
   */
  renderSpeciesStats(speciesStats, showEmoji = true) {
    const lines = [];
    lines.push('🐾 Species Statistics');
    lines.push('─'.repeat(50));

    const emojis = {
      mooshroom: '🐄', duck: '🦆', goat: '🐐', shepherd: '🐑',
      stallion: '🐴', falcon: '🦅', trufflehog: '🐗', rooster: '🐔'
    };

    for (const [species, stats] of Object.entries(speciesStats)) {
      const emoji = showEmoji ? (emojis[species] || '?') + ' ' : '';
      const fitnessBar = this.renderHorizontalBar(
        `${emoji}${species}`,
        stats.avgFitness,
        1.0,
        30
      );
      lines.push(fitnessBar);
      lines.push(`  └─ Population: ${stats.count} | Best: ${(stats.maxFitness * 100).toFixed(1)}%`);
    }

    return lines.join('\n');
  }

  /**
   * Render leaderboard of top bots.
   */
  renderLeaderboard(bots, limit = 10, showEmoji = true) {
    const lines = [];
    lines.push('🏆 Leaderboard');
    lines.push('─'.repeat(60));

    const emojis = {
      mooshroom: '🐄', duck: '🦆', goat: '🐐', shepherd: '🐑',
      stallion: '🐴', falcon: '🦅', trufflehog: '🐗', rooster: '🐔'
    };

    const sorted = bots.slice(0, limit);

    for (let i = 0; i < sorted.length; i++) {
      const bot = sorted[i];
      const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${(i + 1).toString().padStart(2)}.`;
      const emoji = showEmoji ? (emojis[bot.dna?.speciesId] || '?') + ' ' : '';
      const fitness = (bot.fitness * 100).toFixed(1);
      const gen = bot.dna?.generation ?? 0;

      lines.push(`${rank} ${emoji}${bot.dna?.speciesId || 'unknown'} | Gen ${gen} | Fitness: ${fitness}%`);
    }

    return lines.join('\n');
  }

  /**
   * Compare two populations side by side.
   */
  renderComparison(control, experimental, metrics = ['fitness', 'diversity']) {
    const lines = [];
    lines.push('🔬 Population Comparison');
    lines.push('─'.repeat(70));
    lines.push(`Control vs Experimental`);
    lines.push('');

    const controlData = this.extractMetrics(control);
    const experimentalData = this.extractMetrics(experimental);

    for (const metric of metrics) {
      const controlVal = controlData[metric] ?? 0;
      const expVal = experimentalData[metric] ?? 0;

      lines.push(metric.toUpperCase().padEnd(15));
      lines.push(`  Control:     ${this.renderHorizontalBar('', controlVal, 1.0, 30)}`);
      lines.push(`  Experimental:${this.renderHorizontalBar('', expVal, 1.0, 30)}`);

      const diff = ((expVal - controlVal) / (controlVal || 1) * 100).toFixed(1);
      const sign = diff > 0 ? '+' : '';
      lines.push(`  Difference:  ${sign}${diff}%`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Extract key metrics from population data.
   */
  extractMetrics(population) {
    if (!population) return {};

    const bots = population.bots ?
      [...population.bots.values()] :
      (population.ranked ? population.ranked() : []);

    if (bots.length === 0) return {};

    return {
      fitness: bots.reduce((sum, b) => sum + (b.fitness || 0), 0) / bots.length,
      diversity: population.diversity ? population.diversity() : population.diversity ?? 0,
      population: bots.length,
    };
  }

  /**
   * Render a complete dashboard with multiple panels.
   */
  renderDashboard(data, options = {}) {
    const {
      showFitness = true,
      showTraits = true,
      showSpecies = true,
      showLeaderboard = true,
    } = options;

    const panels = [];

    if (showFitness && data.generations) {
      panels.push(this.renderFitnessChart(data.generations));
      panels.push('');
    }

    if (showTraits && data.trait_distribution) {
      panels.push(this.renderTraits(data.trait_distribution));
      panels.push('');
    }

    if (showSpecies && data.species_stats) {
      panels.push(this.renderSpeciesStats(data.species_stats));
      panels.push('');
    }

    if (showLeaderboard && data.leaderboard) {
      panels.push(this.renderLeaderboard(data.leaderboard));
      panels.push('');
    }

    return panels.join('\n');
  }

  /**
   * Render in Minecraft book format (for in-game display).
   */
  renderMinecraftBook(data, title = 'Evolution Report') {
    const lines = [];
    lines.push(`§l${title}§r\n`);
    lines.push('§7━━━━━━━━━━━━━§r\n');

    if (data.generations) {
      const latest = data.generations[data.generations.length - 1];
      lines.push(`§6Generation:§r ${latest.generation}\n`);
      lines.push(`§6Best Fitness:§r §a${(latest.best_fitness * 100).toFixed(1)}%§r\n`);
      lines.push(`§6Avg Fitness:§r §a${(latest.avg_fitness * 100).toFixed(1)}%§r\n`);
      lines.push(`§6Diversity:§r §b${(latest.diversity * 100).toFixed(1)}%§r\n`);
    }

    if (data.species_stats) {
      lines.push(`\n§lSpecies:§r\n`);
      for (const [species, stats] of Object.entries(data.species_stats)) {
        lines.push(`  ${species}: ${stats.count} bots, §e${(stats.avgFitness * 100).toFixed(0)}%§r avg\n`);
      }
    }

    if (data.leaderboard && data.leaderboard.length > 0) {
      lines.push(`\n§lTop Bot:§r\n`);
      const top = data.leaderboard[0];
      lines.push(`  ${top.dna?.speciesId} - §a${(top.fitness * 100).toFixed(1)}%§r\n`);
    }

    return lines.join('');
  }

  /**
   * Render in Minecraft chat format (short messages).
   */
  renderMinecraftChat(data) {
    const messages = [];

    if (data.generations) {
      const latest = data.generations[data.generations.length - 1];
      messages.push(`§6[Evolution]§r Gen ${latest.generation}: Best §a${(latest.best_fitness * 100).toFixed(0)}%§r, Avg §e${(latest.avg_fitness * 100).toFixed(0)}%§r`);
    }

    if (data.species_stats) {
      const topSpecies = Object.entries(data.species_stats)
        .sort((a, b) => b[1].avgFitness - a[1].avgFitness)[0];
      if (topSpecies) {
        messages.push(`§6[Species]§r ${topSpecies[0]} leading at §a${(topSpecies[1].avgFitness * 100).toFixed(0)}%§r`);
      }
    }

    return messages;
  }
}

/**
 * Quick render function for fitness evolution.
 */
export function renderFitnessChart(data, options = {}) {
  const dashboard = new Dashboard(options);
  return dashboard.renderFitnessChart(data, options);
}

/**
 * Quick render function for trait distribution.
 */
export function renderTraits(data, options = {}) {
  const dashboard = new Dashboard(options);
  return dashboard.renderTraits(data, options);
}

/**
 * Quick render function for species comparison.
 */
export function renderComparison(control, experimental, options = {}) {
  const dashboard = new Dashboard(options);
  return dashboard.renderComparison(control, experimental);
}
