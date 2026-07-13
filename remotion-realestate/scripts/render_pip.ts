// render_pip.ts — CLI 渲染 overlay 视频（纯视频，无音频）
// 用法: npx tsx scripts/render_pip.ts config/example-timeline.json [out/overlay.mov]
// 输出: .mov → ProRes 4444 alpha / .webm → VP9 WebM alpha

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv: string[]) {
  const result: { timeline?: string; output?: string } = {};
  for (const arg of argv) {
    if (!result.timeline) {
      result.timeline = arg;
    } else if (!result.output) {
      result.output = arg;
    }
  }
  return result;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed.timeline) {
    console.error('Usage: npx tsx scripts/render_pip.ts <timeline.json> [output.mov]');
    process.exit(1);
  }

  const timelinePath = path.resolve(parsed.timeline);
  const outputPath = path.resolve(parsed.output || 'out/overlay.mov');

  if (!fs.existsSync(timelinePath)) {
    console.error(`Timeline file not found: ${timelinePath}`);
    process.exit(1);
  }

  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf-8'));

  console.log('Bundling Remotion project...');
  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, 'render_entry.tsx'),
     webpackOverride: (config) => ({
       ...config,
       cache: false,
     }),
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

  const ext = path.extname(outputPath).toLowerCase();
  const isMov = ext === '.mov';

  if (isMov) {
    console.log('  Codec: ProRes 4444 + Alpha (yuva444p10le) — video only');
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
  } else {
    console.log('  Codec: VP9 WebM + Alpha');
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'vp9',
      outputLocation: outputPath,
      inputProps: timeline,
      imageFormat: 'png',
    });
  }

  console.log(`Done! Output: ${outputPath}`);

  // Strip silent PCM audio — Remotion ProRes always writes it, 剪映 treats it as corruption
  if (isMov) {
    try {
      const tmpPath = outputPath.replace(/\.mov$/i, '-clean.mov');
      console.log('  Stripping silent PCM audio...');
      execSync(`ffmpeg -i "${outputPath}" -c:v copy -an "${tmpPath}" -y`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      // Retry rename — Windows may hold file lock briefly after ffmpeg exits
      let renamed = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          if (attempt > 0) {
            // Wait before retry (200ms, 400ms, 800ms, 1600ms)
            await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt - 1)));
          }
          // Remove original if it exists (may fail if still locked)
          try { fs.unlinkSync(outputPath); } catch {}
          fs.renameSync(tmpPath, outputPath);
          renamed = true;
          break;
        } catch {}
      }
      if (renamed) {
        console.log('  Audio: ✅ stripped');
      } else {
        console.warn(`  Audio: ⚠️  PCM strip rename failed — clean file at ${tmpPath}`);
      }
    } catch {
      console.warn('  ⚠️  Failed to strip PCM — ffmpeg may not be available');
    }
  }

  // Verify output
  try {
    const probe = execSync(`ffprobe -v quiet -show_streams "${outputPath}"`, { encoding: 'utf-8' });
    const hasAlpha = probe.includes('yuva444');
    const hasAudioStream = probe.includes('Audio');
    console.log(`  Alpha: ${hasAlpha ? '✅ yuva444' : '❌ missing'}`);
    console.log(`  Audio: ${hasAudioStream ? '❌ PCM detected' : '✅ none'}`);
  } catch {
    console.log('  (ffprobe not available — skip verification)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
