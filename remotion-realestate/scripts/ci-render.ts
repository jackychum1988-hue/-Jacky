// CI render script — no CLI args, paths hardcoded for GitHub Actions
// Run: npx tsx scripts/ci-render.ts (from remotion-realestate/)
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const TIMELINE_PATH = path.resolve('..', 'zs-ranking-agent', 'output', 'timeline-latest.json');
const OUTPUT_PATH = path.resolve('out', `zhongshan-ranking-${new Date().toISOString().slice(0, 10)}.mov`);

async function main() {
  if (!fs.existsSync(TIMELINE_PATH)) {
    console.error(`Timeline not found: ${TIMELINE_PATH}`);
    process.exit(1);
  }

  const timeline = JSON.parse(fs.readFileSync(TIMELINE_PATH, 'utf-8'));
  console.log(`Timeline: ${TIMELINE_PATH} (${timeline.elements?.length || 0} elements)`);
  console.log(`Output: ${OUTPUT_PATH}`);

  console.log('Bundling...');
  const bundleLocation = await bundle({
    entryPoint: path.resolve('src', 'index.ts'),
    webpackOverride: (config) => config,
  });

  console.log('Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'PipOverlay',
    inputProps: timeline,
  });

  if (!composition) {
    console.error('Composition PipOverlay not found!');
    process.exit(1);
  }

  console.log(`Render: ${composition.width}x${composition.height}, ${composition.durationInFrames}frames @${composition.fps}fps`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'prores',
    proResProfile: '4444',
    pixelFormat: 'yuva444p10le',
    outputLocation: OUTPUT_PATH,
    inputProps: timeline,
    imageFormat: 'png',
  });

  const sizeMB = (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`Done: ${OUTPUT_PATH} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
