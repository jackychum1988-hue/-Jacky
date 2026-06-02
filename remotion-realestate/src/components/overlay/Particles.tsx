// Particles — 透明底浮动微光粒子
// 极淡光点漂浮，增强电影感不抢文字
import React from 'react';
import { useCurrentFrame } from 'remotion';

interface Particle {
  x: number;      // 0-1 横向位置
  y: number;      // 0-1 纵向位置
  size: number;   // 1-3px
  alpha: number;  // 0.02-0.08
  speedX: number;
  speedY: number;
  phase: number;
}

// 预生成粒子（确定性伪随机）
const PARTICLE_COUNT = 18;
const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const seed = (i * 137.508 + 42) % 360;
  return {
    x: ((seed * 7) % 100) / 100,
    y: ((seed * 13) % 100) / 100,
    size: 1.5 + ((seed * 3) % 100) / 60,  // 1.5-3.2px
    alpha: 0.03 + ((seed * 5) % 100) / 1800, // 0.03-0.085
    speedX: 0.0003 + ((seed * 11) % 100) / 80000,
    speedY: 0.0005 + ((seed * 17) % 100) / 60000,
    phase: (seed * 19) % 360,
  };
});

export const Particles: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {particles.map((p, i) => {
        const px = ((p.x + Math.sin(frame * p.speedX + p.phase) * 0.15) % 1 + 1) % 1;
        const py = ((p.y + Math.cos(frame * p.speedY + p.phase) * 0.12) % 1 + 1) % 1;
        const flicker = 0.5 + 0.5 * Math.sin(frame * 0.04 + p.phase);
        const alpha = p.alpha * (0.6 + 0.4 * flicker);

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
              backgroundColor: `rgba(255,255,255,${alpha.toFixed(3)})`,
              boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,${(alpha * 0.6).toFixed(3)})`,
            }}
          />
        );
      })}
    </div>
  );
};
