// render_ranking.ts — CLI for rendering weekly ranking overlay video
// Usage: npx ts-node scripts/render_ranking.ts <timeline.json> [output.mov]
// Example: npx ts-node scripts/render_ranking.ts ../zs-ranking-agent/output/timeline-latest.json out/zhongshan-ranking.mov

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(
      'Usage: npx ts-node scripts/render_ranking.ts <timeline.json> [output.mov]',
    );
    console.error(
      'Example: npx ts-node scripts/render_ranking.ts ../zs-ranking-agent/output/timeline-latest.json out/zhongshan-ranking.mov',
    );
    process.exit(1);
  }

  const timelinePath = path.resolve(args[0]);
  const defaultOutput = `out/zhongshan-ranking-${new Date().toISOString().slice(0, 10)}.mov`;
  const outputPath = path.resolve(args[1] || defaultOutput);

  if (!fs.existsSync(timelinePath)) {
    console.error(`Timeline file not found: ${timelinePath}`);
    process.exit(1);
  }

  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));

  console.log('Bundling Remotion project...');
  const bundleLocation = await bundle({
    entryPoint: path.resolve(process.cwd(), 'src', 'index.ts'),
    webpackOverride: (config) => config,
  });

  console.log('Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'PipOverlay',
    inputProps: timeline,
  });

  if (!composition) {
    console.error('Composition "PipOverlay" not found.');
    process.exit(1);
  }

  console.log(
    `Rendering ${composition.durationInFrames} frames to ${outputPath}...`,
  );
  console.log(`  Resolution: ${composition.width}x${composition.height}`);
  console.log(`  FPS: ${composition.fps}`);
  console.log(
    `  Duration: ${(composition.durationInFrames / composition.fps).toFixed(1)}s`,
  );

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'prores',
    proResProfile: '4444',
    pixelFormat: 'yuva444p10le',
    outputLocation: outputPath,
    inputProps: timeline,
    imageFormat: 'png',
  });

  console.log(`Done! Output: ${outputPath}`);
  const stats = fs.statSync(outputPath);
  console.log(`  File size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
