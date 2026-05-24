// CloudSystem.tsx — 球形图标云，Fibonacci 球面均匀分布
import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { FloatingCard } from './FloatingCard';
import { PROJECTS } from './projectData';
import type { Texture } from 'three';

const FPS = 30;
const DURATION_SEC = 12;
const TOTAL_FRAMES = FPS * DURATION_SEC;
const ENTRANCE_FRAMES = 60;
const SPHERE_RADIUS = 3.0;        // 球体半径，38卡适配
const CARD_W = 0.78;              // 卡片宽度（38卡密度适配）
const CARD_H = 0.52;              // 卡片高度（保持宽高比）
const FULL_ROLLS = 0.6;           // 12秒内滚动的圈数

// 18个点 Fibonacci 球面分布
interface CardState {
  project: (typeof PROJECTS)[number];
  initX: number;
  initY: number;
  initZ: number;
  floatPhase: number;
  floatPeriod: number;
  floatAmp: number;
}

const phi_golden = Math.PI * (3 - Math.sqrt(5));

function buildCardStates(): CardState[] {
  const N = PROJECTS.length;
  const states: CardState[] = [];

  for (let i = 0; i < N; i++) {
    // Fibonacci sphere: y from 1 (top) to -1 (bottom)
    const yn = 1 - (i / (N - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - yn * yn);
    const theta = phi_golden * i;

    states.push({
      project: PROJECTS[i],
      initX: Math.cos(theta) * radiusAtY * SPHERE_RADIUS,
      initY: yn * SPHERE_RADIUS,
      initZ: Math.sin(theta) * radiusAtY * SPHERE_RADIUS,
      floatPhase: Math.random() * Math.PI * 2,
      floatPeriod: 90 + Math.random() * 120,
      floatAmp: 0.04 + Math.random() * 0.1,
    });
  }
  return states;
}

interface CloudSystemProps {
  textures: Map<number, Texture | null>;
}

export const CloudSystem: React.FC<CloudSystemProps> = ({ textures }) => {
  const frame = useCurrentFrame();

  const cardStates = useMemo(() => buildCardStates(), []);

  // 入场缓入
  const easeIn = (t: number) => 1 - Math.pow(1 - t, 3);

  const rawRoll = (frame / TOTAL_FRAMES) * Math.PI * 2 * FULL_ROLLS;
  const rollAngle = frame < ENTRANCE_FRAMES
    ? rawRoll * easeIn(frame / ENTRANCE_FRAMES)
    : rawRoll;

  // 入场透明度
  const entranceOpacity = frame < ENTRANCE_FRAMES
    ? frame / ENTRANCE_FRAMES
    : 1;

  return (
    <group
      rotation={[
        rollAngle,            // X轴为主：球体滚向屏幕
        rollAngle * 0.25,     // Y轴微量：增加视觉层次
        0,
      ]}
    >
      {cardStates.map((card, idx) => {
        // 基础位置（球面坐标）
        const { initX, initY, initZ } = card;

        // 微小径向浮动
        const floatR = Math.sin(
          (frame / card.floatPeriod) * Math.PI * 2 + card.floatPhase,
        ) * card.floatAmp;

        const dist = Math.sqrt(initX * initX + initY * initY + initZ * initZ) || 1;
        const nx = initX / dist;
        const ny = initY / dist;
        const nz = initZ / dist;

        const x = initX + nx * floatR;
        const y = initY + ny * floatR;
        const z = initZ + nz * floatR;

        // 卡片朝外（法线沿径向向外）
        const rotY = Math.atan2(x, z);
        const horizR = Math.sqrt(x * x + z * z);
        const rotX = -Math.atan2(y, horizR);

        const texture = textures.get(card.project.id) ?? null;

        return (
          <FloatingCard
            key={idx}
            texture={texture}
            position={[x, y, z]}
            rotationY={rotY}
            rotationX={rotX}
            width={CARD_W}
            height={CARD_H}
            opacity={entranceOpacity}
          />
        );
      })}
    </group>
  );
};
