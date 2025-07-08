// scripts/extractStages.js
// Usage (from project root): node scripts/extractStages.js
// Reads index.html, finds the global <defs> section and every <g id="stage-N-graphics"> … </g>
// block, then writes js/stages/stageN.svg with defs + that group wrapped in a full <svg>.

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'index.html');
const OUT_DIR = path.join(__dirname, '..', 'js', 'stages');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const html = fs.readFileSync(SRC, 'utf8');

const defsMatch = html.match(/<defs>([\s\S]*?)<\/defs>/i);
if (!defsMatch) {
  console.error('⚠️  No <defs> section found – aborting');
  process.exit(1);
}
const defsContent = defsMatch[0]; // includes <defs> wrapper

// Regex to capture each stage group
const stageRegex = /<g id="stage-(\d+)-graphics"[\s\S]*?<\/g>/gi;
let match;
let count = 0;
while ((match = stageRegex.exec(html)) !== null) {
  const fullGroup = match[0];
  const stageNum = match[1];
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280">\n` +
              `${defsContent}\n` +
              `${fullGroup}\n` +
              `</svg>`;
  const outPath = path.join(OUT_DIR, `stage${stageNum}.svg`);
  fs.writeFileSync(outPath, svg, 'utf8');
  count++;
}

console.log(`✅ Extracted ${count} stage SVG files into js/stages/`);