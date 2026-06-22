// RevealCard — BigNumber 模式 (zhuzige)
// v11: Apple spring upgrade + idle breathing + number settle bounce + exit choreography
// 超大数字 + 单位 + 中英标签

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, textDepth, breathingScale, idleFloat, settleBounce, OverlayElementBase } from './animation';

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
  const isExiting = anim.phase === 'exit';
  const exitP = anim.phaseProgress;

  // ── Apple breathing springs (v11: unified slow, no overshoot) ──
  const containerSpring = spring({
    frame: localFrame, fps,
    config: { damping: 28, stiffness: 70, mass: 1.3 },
  });
  const containerScale = isExiting
    ? interpolate(exitP, [0, 1], [1, 0.97], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(containerSpring, [0, 1], [0.97, 1]);

  // Number: enters 6f after container, with Apple breathing
  const numSpring = spring({
    frame: Math.max(0, localFrame - 6), fps,
    config: { damping: 24, stiffness: 75, mass: 1.1 },
  });
  const numScale = isExiting
    ? interpolate(exitP, [0.05, 0.35], [1, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(numSpring, [0, 1], [0.88, 1]);

  // Number settle bounce: tiny 1→1.03→1 overshoot after spring peaks
  const settle = settleBounce(localFrame - 6, fps, 28);
  const finalNumScale = numScale * (settle.active ? settle.scale : 1);

  // Label: enters with container
  const labelOpacity = isExiting
    ? interpolate(exitP, [0.4, 0.8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : containerSpring;

  // Unit: enters 8f after number, exits fast
  const unitOpacity = isExiting
    ? interpolate(exitP, [0.1, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(containerSpring, [0, 1], [0, 1]);

  // Sublabel: enters 16f after container, exits first
  const sublabelOpacity = isExiting
    ? interpolate(exitP, [0, 0.25], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(localFrame - 16, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Idle breathing ──
  const floatY = idleFloat(frame, 1.8, 0.022); // ~4.7s cycle, 1.8px amplitude
  const numberBreath = breathingScale(frame);

  // ── Exit overlay fade for container ──
  const exitContainerOpacity = isExiting
    ? interpolate(exitP, [0.5, 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

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
        overflow: 'hidden',
      }}
    >
      <div style={{
        opacity: anim.opacity * exitContainerOpacity,
        transform: `scale(${containerScale}) translateY(${floatY}px)`,
        maxWidth: posStyle.maxWidth,
      }}>
        {/* Label */}
        <p
          style={{
            fontSize: 36,
            fontWeight: 600,
            color,
            fontFamily: F.text,
            letterSpacing: '0.08em',
            lineHeight: 1.3,
            textShadow: textDepth(0.3),
            margin: '0 0 12px 0',
            opacity: labelOpacity,
          }}
        >
          {label}
          {enLabel && (
            <span style={{
              fontSize: 24, fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.1em', marginLeft: 12,
            }}>
              {enLabel}
            </span>
          )}
        </p>

        {/* Number + Unit */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span
            style={{
              fontSize: 120,
              fontWeight: 900,
              color,
              fontFamily: F.mono,
              textShadow: `0 0 60px ${hexToRgba(color, 0.55)}, 0 0 120px ${hexToRgba(color, 0.2)}`,
              lineHeight: 1,
              transform: `scale(${finalNumScale * numberBreath})`,
              display: 'inline-block',
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
              textShadow: `0 0 24px ${hexToRgba(color, 0.3)}`,
              opacity: unitOpacity,
              transform: `scale(${breathingScale(frame)})`,
            }}
          >
            {unit}
          </span>
        </div>

        {/* Sublabel */}
        {sublabel && (
          <p
            style={{
              fontSize: 36,
              color: C.textSecondary,
              fontFamily: F.text,
              fontWeight: 500,
              margin: '16px 0 0 0',
              opacity: sublabelOpacity,
              transform: `scale(${breathingScale(frame)})`,
            }}
          >
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
};
