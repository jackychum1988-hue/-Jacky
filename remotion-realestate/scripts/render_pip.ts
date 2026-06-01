// render_pip.ts — CLI 渲染透明背景 overlay 视频
// 用法: npx ts-node scripts/render_pip.ts config/example-timeline.json [out/overlay.webm]
// 输出: VP9 WebM with alpha channel

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: npx ts-node scripts/render_pip.ts <timeline.json> [output.webm]');
    process.exit(1);
  }

  const timelinePath = path.resolve(args[0]);
  const outputPath = path.resolve(args[1] || 'out/overlay.webm');

  if (!fs.existsSync(timelinePath)) {
    console.error(`Timeline file not found: ${timelinePath}`);
    process.exit(1);
  }

  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));

  console.log('Bundling Remotion project...');
  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, '..', 'src', 'index.ts'),
    webpackOverride: (config) => config,
  });

  console.log('Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'PipOverlay',
    inputProps: timeline,
  });

  if (!composition) {
    console.error('Composition "PipOverlay" not found. Make sure it is registered in Root.tsx.');
    process.exit(1);
  }

  console.log(`Rendering ${composition.durationInFrames} frames to ${outputPath}...`);
  console.log(`  Resolution: ${composition.width}x${composition.height}`);
  console.log(`  FPS: ${composition.fps}`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'vp9',
    outputLocation: outputPath,
    inputProps: timeline,
    imageFormat: 'png',
    transparent: true,
  });

  console.log(`Done! Output: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
