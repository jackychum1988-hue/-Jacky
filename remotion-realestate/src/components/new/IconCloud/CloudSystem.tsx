import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { FloatingCard } from './FloatingCard';
import { PROJECTS, LAYERS, LAYER_CONFIG, type ProjectData } from './projectData';
import type { Texture } from 'three';

const FPS = 30;
const DURATION_SEC = 12;
const TOTAL_FRAMES = FPS * DURATION_SEC;
const ENTRANCE_FRAMES = 60; // 2秒入场
const TOTAL_ROTATION = (270 / 180) * Math.PI; // 270度 total rotation (radians)

// 为每个项目分配轨道参数
interface CardState {
  project: ProjectData;
  layerIndex: number;
  orbitRadius: number;
  cardWidth: number;
  cardHeight: number;
  angleOffset: number;    // 初始角度偏移
  yBase: number;          // 基础高度
  floatPhase: number;     // 浮动相位 (0-2π)
  floatPeriod: number;    // 浮动周期 (帧)
  floatAmp: number;       // 浮动振幅
}

function buildCardStates(textures: Map<number, Texture | null>): CardState[] {
  const states: CardState[] = [];

  for (let layerIdx = 0; layerIdx < 3; layerIdx++) {
    const indices = [LAYERS.inner, LAYERS.middle, LAYERS.outer][layerIdx];
    const config = LAYER_CONFIG[layerIdx];
    const count = indices.length;

    for (let i = 0; i < count; i++) {
      const projectIdx = indices[i];
      states.push({
        project: PROJECTS[projectIdx],
        layerIndex: layerIdx,
        orbitRadius: config.radius,
        cardWidth: config.cardWidth,
        cardHeight: config.cardHeight,
        angleOffset: (i / count) * Math.PI * 2 + (layerIdx * 0.5), // 层间错开
        yBase: config.yRange[0] + (i / (count - 1)) * (config.yRange[1] - config.yRange[0]),
        floatPhase: Math.random() * Math.PI * 2,
        floatPeriod: 90 + Math.random() * 120, // 3-7秒周期
        floatAmp: 0.05 + Math.random() * 0.15,
      });
    }
  }
  return states;
}

interface CloudSystemProps {
  textures: Map<number, Texture | null>;
}

export const CloudSystem: React.FC<CloudSystemProps> = ({ textures }) => {
  const frame = useCurrentFrame();

  // Use useMemo with a stable seed so card states don't re-randomize every render
  const cardStates = useMemo(() => buildCardStates(textures), [textures]);

  // 全局旋转角度（带入场缓入 ease-out cubic）
  const globalAngle = (() => {
    const raw = (frame / TOTAL_FRAMES) * TOTAL_ROTATION;
    if (frame < ENTRANCE_FRAMES) {
      const t = frame / ENTRANCE_FRAMES;
      // ease-out cubic: raw * (1 - (1-t)^3)
      return raw * (1 - Math.pow(1 - t, 3));
    }
    return raw;
  })();

  // 入场透明度 (fade in over 2 seconds)
  const entranceOpacity = frame < ENTRANCE_FRAMES
    ? frame / ENTRANCE_FRAMES
    : 1;

  return (
    <group>
      {cardStates.map((card, idx) => {
        // 当前角度 = 全局旋转 * 层速度倍率 + 偏移
        const speedMult = LAYER_CONFIG[card.layerIndex].speedMultiplier;
        const angle = globalAngle * speedMult + card.angleOffset;

        // 3D 位置（绕Y轴圆周运动）
        const x = Math.cos(angle) * card.orbitRadius;
        const z = Math.sin(angle) * card.orbitRadius;

        // 垂直浮动（sin波，每张卡独立相位和周期）
        const floatOffset = Math.sin(
          (frame / card.floatPeriod) * Math.PI * 2 + card.floatPhase,
        ) * card.floatAmp;
        const y = card.yBase + floatOffset;

        // 卡片Y轴旋转：让卡片始终面向轨道切线方向
        // 垂直于圆心方向 = 面向切线 = -angle + π/2
        const rotationY = -angle + Math.PI / 2;

        // 远层卡片稍透明，加深景深感
        const depthOpacity = card.layerIndex === 0 ? 1 : card.layerIndex === 1 ? 0.85 : 0.7;
        const opacity = entranceOpacity * depthOpacity;

        const texture = textures.get(card.project.id) ?? null;

        return (
          <FloatingCard
            key={idx}
            texture={texture}
            position={[x, y, z]}
            rotationY={rotationY}
            width={card.cardWidth}
            height={card.cardHeight}
            opacity={opacity}
          />
        );
      })}
    </group>
  );
};
