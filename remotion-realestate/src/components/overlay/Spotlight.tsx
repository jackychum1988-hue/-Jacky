import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgb, OverlayElementBase } from './animation';

interface SpotlightProps extends OverlayElementBase {
  size?: number;
  color?: string;
  label?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  size = 120,
  color = '#FFA726',
  label,
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

  const isIdle = anim.opacity >= 1 && anim.transform === 'none';
  const breathe = isIdle
    ? interpolate(frame % 60, [0, 30, 60], [1, 1.06, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const ringScale = anim.transform === 'none' ? `scale(${breathe})` : anim.transform;

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
          transform: ringScale,
          width: size,
          height: size,
          borderRadius: '50%',
          border: `3px solid rgba(${hexToRgb(color)}, 0.6)`,
          boxShadow: `0 0 ${size * 0.3}px rgba(${hexToRgb(color)}, 0.25), inset 0 0 ${size * 0.2}px rgba(${hexToRgb(color)}, 0.1)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label && (
          <span
            style={{
              fontSize: size * 0.16,
              fontWeight: 700,
              color,
              fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
              textShadow: `0 1px 6px rgba(${hexToRgb(color)}, 0.5)`,
              textAlign: 'center',
              padding: '4px',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
