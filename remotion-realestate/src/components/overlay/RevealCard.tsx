// RevealCard — BigNumber 模式 (zhuzige)
// 超大数字 + 单位 + 中英标签
// 复用: Reveal 场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, OverlayElementBase } from './animation';

interface RevealCardProps extends OverlayElementBase {
  label: string;
  number: string;
  unit: string;
  sublabel?: string;
  enLabel?: string;
  color?: string;
}

export const RevealCard: React.FC<RevealCardProps> = ({
  label,
  number,
  unit,
  sublabel,
  enLabel,
  color = '#F5A623',
  enterAt,
  exitAt,
  animation,
  position,
  offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);

  const localFrame = Math.max(0, frame - enterAt);
  const springIn = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 90, mass: 0.9 },
  });
  const numSpring = spring({
    frame: Math.max(0, localFrame - 6),
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.6 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: posStyle.display,
        justifyContent: posStyle.justifyContent,
        alignItems: posStyle.alignItems,
        padding: posStyle.padding,
        transform: posStyle.transform,
        pointerEvents: 'none',
      }}
    >
      <div style={{ opacity: anim.opacity }}>
        <p
          style={{
            fontSize: 28,
            fontWeight: 600,
            color,
            fontFamily: F.text,
            margin: '0 0 8px 0',
          }}
        >
          {label}
          {enLabel && (
            <span style={{ fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', marginLeft: 10 }}>
              {enLabel}
            </span>
          )}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span
            style={{
              fontSize: 120,
              fontWeight: 900,
              color,
              fontFamily: F.mono,
              textShadow: `0 0 60px ${hexToRgba(color, 0.7)}, 0 0 120px ${hexToRgba(color, 0.3)}`,
              lineHeight: 1,
              transform: `scale(${0.8 + numSpring * 0.2})`,
            }}
          >
            {number}
          </span>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: C.text,
              fontFamily: F.display,
              textShadow: `0 0 24px ${hexToRgba(color, 0.4)}`,
            }}
          >
            {unit}
          </span>
        </div>
        {sublabel && (
          <p
            style={{
              fontSize: 36,
              color: C.textSecondary,
              fontFamily: F.text,
              fontWeight: 500,
              margin: '16px 0 0 0',
            }}
          >
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
};
