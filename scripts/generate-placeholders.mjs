// Generates neutral placeholder images (hairline pattern) for each project's
// design/ and completion/ folders, plus the default Open Graph image.
// Run with `npm run placeholders`.
// SVGs are rasterised to PNG so astro:assets can build responsive srcsets.
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');

const tones = [
  '#E6E7EA',
  '#E4E6E8',
  '#E8E8EB',
  '#E5E7E9',
  '#E7E8EA',
  '#E4E5E9',
  '#E8E9EB',
  '#E5E6E9',
];

const slugs = [
  'peridot-monogram',
  'opus-2016',
  'taman-nilam',
  'dato-ng',
  'tss-tnb-sepang',
  'mr-kwa-kk-bungalow',
  'charlton-martin',
  'madoc-zb-showroom',
  'sbc-office',
  'sce-office',
  'sirim-hq',
  'vista-bangi',
  'alamsari-semi-d-house',
  'birch-apartment',
  'federal-hill-superlink-house',
  'inti',
];

// Design-stage renders are 16:10, completion photos 4:3.
const variants = [
  { file: 'design/01.png', width: 2000, height: 1250 },
  { file: 'design/02.png', width: 2000, height: 1250 },
  { file: 'completion/01.png', width: 2000, height: 1500 },
  { file: 'completion/02.png', width: 2000, height: 1500 },
  { file: 'completion/03.png', width: 2000, height: 1500 },
];

// Shift a hex colour slightly so gallery images read as distinct frames.
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, v + amount)));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function hairlineSvg(width, height, bg, step = 28, line = 2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <pattern id="h" width="${step}" height="${height}" patternUnits="userSpaceOnUse">
      <rect width="${line}" height="${height}" fill="#2B2A7A" fill-opacity="0.07"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect width="100%" height="100%" fill="url(#h)"/>
</svg>`;
}

function ogSvg() {
  const rects = Array.from({ length: 16 }, (_, i) => {
    const size = 520 - 28 * i;
    const xy = 300 - size / 2;
    return `<rect x="${xy}" y="${xy}" width="${size}" height="${size}" rx="${Math.round(size * 0.28)}" transform="rotate(${5 * i} 300 300)"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#2B2A7A"/>
  <g transform="translate(700 -40) scale(1.2)" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1">${rects}</g>
</svg>`;
}

async function writePng(path, svg) {
  if (existsSync(path) && !force) return;
  await mkdir(dirname(path), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(path);
  console.log('wrote', path.replace(root + '/', ''));
}

for (const [n, slug] of slugs.entries()) {
  const bg = tones[n % tones.length];
  for (const [i, v] of variants.entries()) {
    const out = join(root, 'src/assets/projects', slug, v.file);
    await writePng(out, hairlineSvg(v.width, v.height, i === 2 ? bg : shade(bg, i % 2 ? -3 : 3)));
  }
}

await writePng(join(root, 'public/og-default.png'), ogSvg());
await writeFile(join(root, 'src/assets/projects/.gitkeep'), '');
