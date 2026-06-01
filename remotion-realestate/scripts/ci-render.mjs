// CI render script — reads timeline JSON and renders via Remotion API
// No import.meta — pure CommonJS-compatible
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const timelinePath = process.argv[2] || '../zs-ranking-agent/output/timeline-latest.json';
const outName = process.argv[3] || `out/zhongshan-ranking-${new Date().toISOString().slice(0, 10)}.mov`;

if (!fs.existsSync(timelinePath)) {
  console.error(`Timeline not found: ${timelinePath}`);
  process.exit(1);
}

const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));
const absTimeline = path.resolve(timelinePath);
const absOutput = path.resolve(outName);

console.log(`Timeline: ${absTimeline}`);
console.log(`Output: ${absOutput}`);

const bundleLocation = await bundle({
  entryPoint: path.resolve('src', 'index.ts'),
  webpackOverride: (config) => config,
});

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: 'PipOverlay',
  inputProps: timeline,
});

if (!composition) {
  console.error('Composition PipOverlay not found');
  process.exit(1);
}

console.log(`Rendering ${composition.durationInFrames}frames ${composition.width}x${composition.height} @${composition.fps}fps`);

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: 'prores',
  proResProfile: '4444',
  pixelFormat: 'yuva444p10le',
  outputLocation: absOutput,
  inputProps: timeline,
  imageFormat: 'png',
});

console.log(`Done: ${absOutput} (${(fs.statSync(absOutput).size / 1024 / 1024).toFixed(1)} MB)`);
