// ClimaxCard — PunchLineBox 模式 (zhuzige)
// 弹性入场 + 光晕脉动 + 中英对照
// 复用: Climax 场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textGlow, breathingScale, OverlayElementBase } from './animation';
import { PunchLineBox } from '../new/PunchLineBox';
import { ColoredAmbience } from './ColoredAmbience';

interface ClimaxCardProps extends OverlayElementBase {
  label?: string;
  text: string;
  enText?: string;
  color?: string;
  author?: string;
}

export const ClimaxCard: React.FC<ClimaxCardProps> = ({
  label,
  text,
  enText,
  color = '#C0392B',
  author,
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
      <div style={{ opacity: anim.opacity, display: 'flex', flexDirection: 'column', gap: 20, transform: `scale(${breathingScale(frame)})` }}>
        <ColoredAmbience color={color} />
        {/* Label: 彩色小字标注 */}
        {label && (
          <p style={{
            fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
            letterSpacing: '0.08em', lineHeight: 1.3,
            textShadow: textGlow(color, 0.3), margin: 0,
          }}>
            {label}
          </p>
        )}
        <PunchLineBox color={color} fontSize={68}>
          {text}
        </PunchLineBox>
        {enText && (
          <p
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: F.text,
              letterSpacing: '0.1em',
              lineHeight: 1.2,
              margin: 0,
              maxWidth: 880,
            }}
          >
            {enText}
          </p>
        )}
        {author && (
          <p
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: F.text,
              letterSpacing: '0.05em',
              margin: '18px 0 0 0',
            }}
          >
            — {author}
          </p>
        )}
      </div>
    </div>
  );
};
