import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgb, OverlayElementBase } from './animation';

interface PriceBadgeProps extends OverlayElementBase {
  value: string;
  unit?: string;
  label?: string;
  color?: string;
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({
  value,
  unit = '',
  label = '',
  color = '#FFA726',
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
  const extraScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 90, mass: 1.5 },
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
      <div
        style={{
          opacity: anim.opacity,
          transform: `${anim.transform} scale(${0.8 + extraScale * 0.2})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {label && (
          <span
            style={{
              fontSize: 24,
              color: `rgba(${hexToRgb(color)}, 0.7)`,
              fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
            }}
          >
            {label}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color,
              fontFamily: '"SF Mono", "JetBrains Mono", monospace',
              textShadow: `0 4px 20px rgba(${hexToRgb(color)}, 0.5)`,
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              style={{
                fontSize: 36,
                fontWeight: 600,
                color,
                fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
                textShadow: `0 2px 12px rgba(${hexToRgb(color)}, 0.4)`,
              }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
