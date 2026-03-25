/**
 * Web dashboard — serves a self-contained HTML page with live stats.
 */

import http from 'node:http';

export function startDashboard(population, evolutionLog, port = 3000) {
  const server = http.createServer((req, res) => {
    if (req.url === '/api/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const stats = population.stats();
      const ranked = population.ranked();
      res.end(JSON.stringify({
        generation: population.generation,
        totalPopulation: population.bots.size,
        diversity: population.diversity(),
        speciesStats: stats,
        leaderboard: ranked.slice(0, 20).map(b => ({
          id: b.dna.id.slice(0, 8),
          species: b.dna.speciesId,
          gen: b.dna.generation,
          fitness: b.fitness,
          tasks: b.records.length,
        })),
        history: population.getHistory(),
      }));
      return;
    }

    // Serve HTML
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html());
  });

  server.listen(port, () => {
    console.log(`🌾 CraftMind Ranch Dashboard → http://localhost:${port}`);
  });

  return server;
}

function html() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>🌾 CraftMind Ranch</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#1a1a2e;color:#eee;padding:1rem}
h1{text-align:center;font-size:2rem;margin:1rem 0}
h1 span{font-size:1rem;color:#888}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.card{background:#16213e;border-radius:12px;padding:1rem;border:1px solid #0f3460}
.card h3{margin-bottom:.5rem;font-size:1.1rem}
.bar{height:8px;background:#0f3460;border-radius:4px;margin:4px 0;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width .5s}
.fitness{color:#e94560;font-weight:bold;font-size:1.2rem}
.species-emoji{font-size:2rem}
.meta{text-align:center;padding:.5rem;background:#16213e;border-radius:8px;margin:1rem 0;font-size:1.2rem}
#log{background:#16213e;border-radius:12px;padding:1rem;margin-top:1rem;max-height:300px;overflow-y:auto;font-family:monospace;font-size:.85rem}
table{width:100%;border-collapse:collapse;margin-top:.5rem}
th,td{text-align:left;padding:4px 8px;border-bottom:1px solid #0f3460}
th{color:#e94560}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.alive{animation:pulse 2s infinite}
</style>
</head>
<body>
<h1>🌾 CraftMind Ranch <span id="gen">Gen 0</span></h1>
<div class="meta">
  Population: <strong id="pop">0</strong> | Diversity: <strong id="div">0%</strong>
</div>
<div class="grid" id="species"></div>
<h2 style="margin-top:1.5rem">🏆 Leaderboard</h2>
<table id="leaderboard"><thead><tr><th>Bot</th><th>Species</th><th>Gen</th><th>Fitness</th><th>Tasks</th></tr></thead><tbody></tbody></table>
<div id="log"></div>
<script>
const $ = id => document.getElementById(id);
function bar(color, pct) {
  return \`<div class="bar"><div class="bar-fill" style="width:\${pct}%;background:\${color}"></div></div>\`;
}
const COLORS = {
  mooshroom:'#e74c3c', duck:'#3498db', goat:'#2ecc71', shepherd:'#f39c12',
  stallion:'#9b59b6', falcon:'#1abc9c', trufflehog:'#e67e22', rooster:'#e91e63'
};
const EMOJIS = {
  mooshroom:'🐄', duck:'🦆', goat:'🐐', shepherd:'🐑',
  stallion:'🐴', falcon:'🦅', trufflehog:'🐗', rooster:'🐔'
};
async function refresh() {
  const d = await fetch('/api/stats').then(r=>r.json());
  $('gen').textContent = 'Gen ' + d.generation;
  $('pop').textContent = d.totalPopulation;
  $('div').textContent = (d.diversity * 100).toFixed(1) + '%';

  let html = '';
  for (const [sid, s] of Object.entries(d.speciesStats)) {
    html += \`<div class="card">
      <div class="species-emoji">\${EMOJIS[sid]||'?'}</div>
      <h3>\${sid}</h3>
      <div>Population: <strong>\${s.count}</strong></div>
      <div>Avg Fitness: <span class="fitness">\${(s.avgFitness*100).toFixed(1)}%</span></div>
      \${bar(COLORS[sid]||'#888', s.avgFitness*100)}
      <div>Best: \${(s.maxFitness*100).toFixed(1)}%</div>
    </div>\`;
  }
  $('species').innerHTML = html;

  let rows = '';
  for (const b of d.leaderboard) {
    rows += \`<tr><td>\${b.id}</td><td>\${EMOJIS[b.species]||''} \${b.species}</td><td>\${b.gen}</td><td>\${(b.fitness*100).toFixed(1)}%</td><td>\${b.tasks}</td></tr>\`;
  }
  $('leaderboard').querySelector('tbody').innerHTML = rows;

  if (d.history?.length) {
    const latest = d.history[d.history.length-1];
    $('log').innerHTML = '<strong>Latest cycle:</strong> Pop=' + latest.totalPopulation + ' Div=' + (latest.diversity*100).toFixed(1) + '%';
  }
}
refresh();
setInterval(refresh, 5000);
</script>
</body>
</html>`;
}
