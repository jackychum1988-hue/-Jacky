// ColoredAmbience — 彩色局部氛围光 + 浮动粒子 (v9)
// 在卡片内部渲染同色系径向渐变光 + 6-8 个超小型彩色浮动粒子
// 给白色标题文字增加 premium 氛围感，不抢文字
// 内部装饰组件，不继承 OverlayElementBase

import React from 'react';
import { useCurrentFrame } from 'remotion';
import { hexToRgba } from './animation';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  speedX: number;
  speedY: number;
  phase: number;
}

interface ColoredAmbienceProps {
  color: string;
  particleCount?: number;
  glowAlpha?: number;
  particleAlpha?: number;
}

const DEFAULT_COUNT = 6;
const DEFAULT_GLOW_ALPHA = 0.008;
const DEFAULT_PARTICLE_ALPHA = 0.04;

const generateParticles = (count: number): Particle[] =>
  Array.from({ length: count }, (_, i) => {
    const seed = (i * 137.508 + 42) % 360;
    return {
      x: 0.3 + ((seed * 7) % 100) / 250,
      y: 0.2 + ((seed * 13) % 100) / 250,
      size: 1.0 + ((seed * 3) % 100) / 120,
      baseAlpha: 0.04 + ((seed * 5) % 100) / 2500,
      speedX: 0.02 + ((seed * 11) % 100) / 3000,
      speedY: 0.025 + ((seed * 17) % 100) / 2500,
      phase: (seed * 19) % 360,
    };
  });

const PARTICLE_CACHE = new Map<number, Particle[]>();

const getParticles = (count: number): Particle[] => {
  if (!PARTICLE_CACHE.has(count)) {
    PARTICLE_CACHE.set(count, generateParticles(count));
  }
  return PARTICLE_CACHE.get(count)!;
};

export const ColoredAmbience: React.FC<ColoredAmbienceProps> = ({
  color,
  particleCount = DEFAULT_COUNT,
  glowAlpha = DEFAULT_GLOW_ALPHA,
  particleAlpha = DEFAULT_PARTICLE_ALPHA,
}) => {
  const frame = useCurrentFrame();
  const particles = getParticles(Math.min(particleCount, 12));

  // 氛围光呼吸 (~8s 周期)
  const breathingGlow = glowAlpha * (0.7 + 0.3 * Math.sin(frame * 0.025));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* 彩色径向渐变光 — 极度扩散，无可见光圈 */}
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse at 50% 50%, ${hexToRgba(color, breathingGlow)} 0%, ${hexToRgba(color, breathingGlow * 0.3)} 35%, transparent 70%)`,
        }}
      />

      {/* 彩色浮动微粒子 */}
      {particles.map((p, i) => {
        const driftX = Math.sin(frame * p.speedX + p.phase) * 0.08;
        const driftY = Math.cos(frame * p.speedY + p.phase) * 0.06;
        const px = p.x + driftX;
        const py = p.y + driftY;
        const flicker = 0.5 + 0.5 * Math.sin(frame * 0.05 + p.phase);
        const alpha = p.baseAlpha * (particleAlpha / DEFAULT_PARTICLE_ALPHA) * (0.6 + 0.4 * flicker);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${px * 100}%`,
              top: `${py * 100}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: hexToRgba(color, alpha),
              boxShadow: `0 0 ${p.size * 2}px ${hexToRgba(color, alpha * 0.6)}`,
            }}
          />
        );
      })}
    </div>
  );
};
