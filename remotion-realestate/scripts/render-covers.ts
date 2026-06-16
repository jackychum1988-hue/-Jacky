// remotion-realestate/scripts/render-covers.ts
// 批量渲染封面脚本 — 从 JSON 配置生成所有封面 PNG
//
// 用法:
//   npx tsx scripts/render-covers.ts config/covers-batch-example.json

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CoverJob {
  stillId: 'CoverSundip' | 'CoverData' | 'CoverOpinion' | 'CoverWarning';
  output: string;
  props: Record<string, unknown>;
}

interface BatchConfig {
  outputDir: string;
  covers: CoverJob[];
}

function renderCover(job: CoverJob, outputDir: string): void {
  const propsJson = JSON.stringify(job.props).replace(/"/g, '\\"');
  const outputPath = path.join(outputDir, job.output);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const cmd = `npx remotion still ${job.stillId} "${outputPath}" --props="${propsJson}"`;
  console.log(`\n▶ Rendering: ${job.stillId} → ${job.output}`);

  try {
    execSync(cmd, {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    });
    console.log(`  ✓ Done`);
  } catch (err) {
    console.error(`  ✗ Failed: ${(err as Error).message}`);
  }
}

function main(): void {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error('Usage: npx tsx scripts/render-covers.ts <config.json>');
    process.exit(1);
  }

  const config: BatchConfig = JSON.parse(
    fs.readFileSync(path.resolve(configPath), 'utf-8')
  );

  console.log(`Output dir: ${config.outputDir}`);
  console.log(`Total covers: ${config.covers.length}`);

  for (const job of config.covers) {
    renderCover(job, config.outputDir);
  }

  console.log(`\n✓ All covers rendered to ${config.outputDir}`);
}

main();
