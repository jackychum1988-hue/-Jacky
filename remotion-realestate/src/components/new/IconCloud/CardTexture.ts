// BadgeTexture.ts — 圆形楼盘图标徽章
import { CanvasTexture, LinearFilter } from 'three';

const SIZE = 128;
const RADIUS = SIZE / 2;

// 区域配色
const districtColors: Record<string, string> = {
  '東區': '#5b9bd5',
  '石岐': '#c8a050',
  '西區': '#4aad8c',
  '南區': '#5a9a7a',
  '翠亨': '#4a80b8',
  '三鄉': '#7a9a50',
  '坦洲': '#8a70b0',
  '市區': '#6a88a0',
  '南頭': '#6a7898',
  '火炬': '#c88060',
  '古鎮': '#8a9a60',
  '港口': '#5a8898',
};

function colorFor(district: string): string {
  return districtColors[district] || '#6a88a0';
}

export function createBadgeTexture(project: {
  name: string;
  district: string;
}): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  const base = colorFor(project.district);

  // 柔光背景圆
  ctx.beginPath();
  ctx.arc(RADIUS, RADIUS, RADIUS - 2, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(RADIUS - 15, RADIUS - 15, 5, RADIUS, RADIUS, RADIUS - 2);
  grad.addColorStop(0, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.7, base + '30');
  grad.addColorStop(1, base + '15');
  ctx.fillStyle = grad;
  ctx.fill();

  // 边框
  ctx.beginPath();
  ctx.arc(RADIUS, RADIUS, RADIUS - 2, 0, Math.PI * 2);
  ctx.strokeStyle = base + '55';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 项目名 — 截断过长的名字
  ctx.fillStyle = '#2c3e50';
  const name = project.name.length > 5 ? project.name.slice(0, 5) + '…' : project.name;
  ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, RADIUS, RADIUS);

  // 区域标签
  ctx.fillStyle = '#7a8b9a';
  ctx.font = '12px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(project.district, RADIUS, RADIUS + 18);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
}
