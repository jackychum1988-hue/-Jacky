// CI render — with detailed step-by-step logging for debugging
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const TIMELINE = path.resolve('..', 'zs-ranking-agent', 'output', 'timeline-latest.json');
const OUT = path.resolve('out', `zhongshan-ranking-${new Date().toISOString().slice(0, 10)}.mov`);

function log(msg: string) { console.log(`[ci-render] ${msg}`); }

async function main() {
  log(`Node ${process.version}, cwd: ${process.cwd()}`);
  log(`Timeline path: ${TIMELINE}`);

  if (!fs.existsSync(TIMELINE)) {
    log(`FATAL: timeline not found`);
    process.exit(1);
  }

  const timeline = JSON.parse(fs.readFileSync(TIMELINE, 'utf-8'));
  log(`Timeline loaded: ${timeline.elements?.length || 0} elements, ${timeline.durationInFrames} frames`);

  log('Step 1/4: Bundling...');
  let bundleLocation: string;
  try {
    bundleLocation = await bundle({
      entryPoint: 'src/index.ts',
      webpackOverride: (config: any) => config,
      onProgress: (p: number) => { if (p % 25 === 0) log(`  bundle ${p}%`); },
    });
    log(`Bundle done: ${bundleLocation}`);
  } catch (e: any) {
    log(`BUNDLE FAILED: ${e.message}`);
    log(e.stack);
    process.exit(1);
  }

  log('Step 2/4: Selecting composition...');
  let composition: any;
  try {
    composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'PipOverlay',
      inputProps: timeline,
    });
  } catch (e: any) {
    log(`SELECT COMPOSITION FAILED: ${e.message}`);
    log(e.stack);
    process.exit(1);
  }

  if (!composition) {
    log('FATAL: Composition PipOverlay not found');
    process.exit(1);
  }
  log(`Composition: ${composition.width}x${composition.height}, ${composition.durationInFrames}f @${composition.fps}fps`);

  log('Step 3/4: Rendering...');
  try {
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'prores',
      proResProfile: '4444',
      pixelFormat: 'yuva444p10le',
      outputLocation: OUT,
      inputProps: timeline,
      imageFormat: 'png',
      onProgress: ({ progress }: { progress: number }) => {
        if (Math.round(progress * 100) % 10 === 0) log(`  render ${Math.round(progress * 100)}%`);
      },
    });
  } catch (e: any) {
    log(`RENDER FAILED: ${e.message}`);
    log(`Frame: ${e.frame}, chunk: ${e.chunk}`);
    log(e.stack);
    process.exit(1);
  }

  log('Step 4/4: Verifying...');
  if (!fs.existsSync(OUT)) {
    log('FATAL: output file not created');
    process.exit(1);
  }
  const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
  log(`SUCCESS: ${OUT} (${sizeMB} MB)`);
}

main().catch((e: any) => {
  console.error('[ci-render] UNHANDLED ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
});
