// remotion-realestate/src/components/new/IconCloud/CardTexture.ts
import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter } from 'three';

const CANVAS_W = 400;
const CANVAS_H = 280;
const RADIUS = 14;
const IMAGE_H = CANVAS_H * 0.62;
const TEXT_H = CANVAS_H - IMAGE_H;

// 图片缓存
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) return Promise.resolve(imageCache.get(url)!);
  return new Promise((resolve, reject) => {
    const img = new Image();
    // data URI 不需要 crossOrigin，否则会报错
    if (!url.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => { imageCache.set(url, img); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function createCardTexture(project: {
  name: string;
  district: string;
  tag: string;
  imageUrl: string;
}): Promise<CanvasTexture> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d')!;

  // 1. 玻璃态半透白底
  roundRect(ctx, 0, 0, CANVAS_W, CANVAS_H, RADIUS);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fill();

  // 2. 尝试加载楼盘图片
  if (project.imageUrl) {
    try {
      const img = await loadImage(project.imageUrl);
      ctx.save();
      roundRect(ctx, 1, 1, CANVAS_W - 2, IMAGE_H, RADIUS);
      ctx.clip();
      // Scale image to cover the image area
      const scale = Math.max((CANVAS_W - 2) / img.width, IMAGE_H / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (CANVAS_W - 2 - dw) / 2;
      const dy = (IMAGE_H - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    } catch {
      // fallback: 淡蓝色占位
      roundRect(ctx, 1, 1, CANVAS_W - 2, IMAGE_H, RADIUS);
      ctx.fillStyle = 'rgba(180, 200, 220, 0.25)';
      ctx.fill();
    }
  } else {
    // no imageUrl: placeholder
    roundRect(ctx, 1, 1, CANVAS_W - 2, IMAGE_H, RADIUS);
    ctx.fillStyle = 'rgba(180, 200, 220, 0.25)';
    ctx.fill();
  }

  // 3. 下半部文字区域 — 加一条淡分隔线
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, IMAGE_H);
  ctx.lineTo(CANVAS_W - 16, IMAGE_H);
  ctx.stroke();

  // 4. 项目名
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 17px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(project.name, 16, IMAGE_H + 26);

  // 5. 区域 + 标签
  ctx.fillStyle = '#7a8b9a';
  ctx.font = '13px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(`${project.district} · ${project.tag}`, 16, IMAGE_H + 48);

  // 6. 边框
  roundRect(ctx, 0.5, 0.5, CANVAS_W - 1, CANVAS_H - 1, RADIUS);
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  return texture;
}
