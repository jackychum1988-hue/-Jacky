#!/usr/bin/env node
/**
 * 批量生成中山楼盘 AI 建筑外观图
 * 使用 Pollinations.ai (免费，无需 API Key)
 *
 * 用法: node scripts/generate_project_images.mjs [--force]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'project-images');
const FORCE = process.argv.includes('--force');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const PROJECTS = [
  // 1-18 original
  ['江山和鸣', '石岐'],
  ['保利琅悦', '東區'],
  ['囍滙·Central Peak', '東區'],
  ['御宸', '石岐'],
  ['建华龙湖·香山颂', '石岐'],
  ['遠洋天著', '南區'],
  ['中山108天寓', '東區'],
  ['華潤仁恒公園四季2期', '西區'],
  ['幸福匯', '西區'],
  ['展睿·江樾灣', '石岐'],
  ['錦繡海灣城', '翠亨'],
  ['華發觀山水', '三鄉'],
  ['佳境康城', '坦洲'],
  ['錦繡國際花城', '坦洲'],
  ['雅居樂·萬象郡', '三鄉'],
  ['中澳春城', '坦洲'],
  ['港航匯', '市區'],
  ['海雅繽紛城', '南頭'],
  // 19-38 new
  ['保利香山瑧悦府', '東區'],
  ['朗詩金鐘湖壹號', '東區'],
  ['華發學府壹號', '石岐'],
  ['金鷹半山花園', '石岐'],
  ['華立富華薈', '西區'],
  ['懿臻山', '南區'],
  ['碧桂園·鳳凰城', '南區'],
  ['招商臻灣府', '翠亨'],
  ['中山粵海城', '翠亨'],
  ['中興智慧城·懿禧府', '翠亨'],
  ['保利天匯·熙岸', '翠亨'],
  ['雅居樂灣際壹號', '翠亨'],
  ['御峰香林', '火炬'],
  ['火炬建發·望江台', '火炬'],
  ['東方名都', '火炬'],
  ['逸駿半島', '坦洲'],
  ['優越香格里', '坦洲'],
  ['保利·和光塵樾', '古鎮'],
  ['星晨·君悅灣', '港口'],
  ['鉑灣半島', '南頭'],
];

function sanitize(name) {
  return name.replace(/[·\s/\\]/g, '-');
}

async function generateImage(name, district) {
  const prompt = [
    `modern residential building exterior architectural rendering,`,
    `Zhongshan China ${district} district, high-rise condominium,`,
    `glass and steel facade, sunny day, professional real estate photography,`,
    `wide angle, photorealistic, no text no watermark`,
  ].join(' ');
  const seed = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 100000;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  if (buffer.length < 500) throw new Error('Response too small');
  return buffer;
}

async function main() {
  const total = PROJECTS.length;
  let success = 0;
  const failed = [];

  for (let i = 0; i < total; i++) {
    const [name, district] = PROJECTS[i];
    const filename = `${String(i + 1).padStart(2, '0')}_${sanitize(name)}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(filepath) && !FORCE) {
      console.log(`[${i + 1}/${total}] ${name} — skipped (exists)`);
      success++;
      continue;
    }

    console.log(`[${i + 1}/${total}] ${name} (${district}) — generating...`);
    try {
      const imgData = await generateImage(name, district);
      fs.writeFileSync(filepath, imgData);
      console.log(`  OK (${(imgData.length / 1024).toFixed(0)}KB)`);
      success++;
    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
      failed.push(name);
    }

    // Rate limit: 2s between requests
    if (i < total - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\nDone. ${success}/${total} succeeded.`);
  if (failed.length) {
    console.log(`Failed (${failed.length}):`);
    failed.forEach(f => console.log(`  - ${f}`));
  }

  // Write mapping JSON
  const mapping = {};
  for (let i = 0; i < total; i++) {
    const [name] = PROJECTS[i];
    const filename = `${String(i + 1).padStart(2, '0')}_${sanitize(name)}.png`;
    mapping[name] = `/project-images/${filename}`;
  }
  const mappingPath = path.resolve(OUTPUT_DIR, '..', 'project-image-map.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`Mapping saved to ${mappingPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
