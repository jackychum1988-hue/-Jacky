// PipOverlay — JSON 驱动画中画 overlay 场景
// 读取时间线配置，渲染带透明背景的 overlay 动效序列
// 输出透明通道 WebM，直接叠放到口播素材上

import React from 'react';
import { z } from 'zod';
import { AbsoluteFill } from 'remotion';
import { overlayComponentMap } from '../components/overlay';

// ====== Schema ======

const elementSchema = z.object({
  type: z.string(),
  enterAt: z.number().min(0),
  exitAt: z.number().min(0),
  animation: z.string(),
  position: z.string(),
  offset: z.object({ x: z.number(), y: z.number() }).optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});

export const PipOverlaySchema = z.object({
  elements: z.array(elementSchema),
  width: z.number().default(1920),
  height: z.number().default(1080),
  fps: z.number().default(30),
  durationInFrames: z.number().min(30),
});

type Props = z.infer<typeof PipOverlaySchema>;

// ====== Component ======

export const PipOverlay: React.FC<Props> = ({ elements }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {elements.map((el, i) => {
        const Component = overlayComponentMap[el.type];
        if (!Component) {
          console.warn(`[PipOverlay] Unknown component type: "${el.type}"`);
          return null;
        }

        return (
          <Component
            key={`${el.type}-${i}`}
            {...el.props}
            enterAt={el.enterAt}
            exitAt={el.exitAt}
            animation={el.animation}
            position={el.position}
            offset={el.offset}
          />
        );
      })}
    </AbsoluteFill>
  );
};
