// CloudSystem.tsx — 球形图标云，Fibonacci 球面均匀分布，平滑旋转
import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { FloatingCard } from './FloatingCard';
import { PROJECTS } from './projectData';
import type { Texture } from 'three';

const FPS = 30;
const DURATION_SEC = 12;
const TOTAL_FRAMES = FPS * DURATION_SEC;
const ENTRANCE_FRAMES = 50;
const SPHERE_RADIUS = 3.0;
const BADGE_SIZE = 0.34;         // 圆形徽章尺寸
const FULL_ROLLS = 0.45;         // 12秒内 Y 轴圈数（更慢更平滑）

interface BadgeState {
  project: (typeof PROJECTS)[number];
  x: number;
  y: number;
  z: number;
}

const phi_golden = Math.PI * (3 - Math.sqrt(5));

function buildBadgeStates(): BadgeState[] {
  const N = PROJECTS.length;
  const states: BadgeState[] = [];

  for (let i = 0; i < N; i++) {
    const yn = 1 - (i / (N - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - yn * yn);
    const theta = phi_golden * i;

    states.push({
      project: PROJECTS[i],
      x: Math.cos(theta) * radiusAtY * SPHERE_RADIUS,
      y: yn * SPHERE_RADIUS,
      z: Math.sin(theta) * radiusAtY * SPHERE_RADIUS,
    });
  }
  return states;
}

interface CloudSystemProps {
  textures: Map<number, Texture | null>;
}

export const CloudSystem: React.FC<CloudSystemProps> = ({ textures }) => {
  const frame = useCurrentFrame();

  const badgeStates = useMemo(() => buildBadgeStates(), []);

  // 纯 Y 轴平滑旋转
  const progress = frame / TOTAL_FRAMES;
  const angleY = progress * Math.PI * 2 * FULL_ROLLS;

  // 入场淡入
  const entranceOpacity = frame < ENTRANCE_FRAMES
    ? frame / ENTRANCE_FRAMES
    : 1;

  return (
    <group rotation={[0, angleY, 0]}>
      {badgeStates.map((badge, idx) => {
        const texture = textures.get(badge.project.id) ?? null;

        // 徽章始终面向相机（billboard）
        // 因为只绕 Y 轴旋转，用 atan2(x, z) 让徽章朝外
        const rotY = Math.atan2(badge.x, badge.z);

        return (
          <FloatingCard
            key={idx}
            texture={texture}
            position={[badge.x, badge.y, badge.z]}
            rotationY={rotY}
            rotationX={0}
            width={BADGE_SIZE}
            height={BADGE_SIZE}
            opacity={entranceOpacity}
          />
        );
      })}
    </group>
  );
};
