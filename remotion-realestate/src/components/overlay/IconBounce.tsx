import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgb, OverlayElementBase } from './animation';

const defaultPaths: Record<string, string> = {
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  circle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  bolt: 'M13 3L4 14h5l-1 7 9-11h-5l1-7z',
};

interface IconBounceProps extends OverlayElementBase {
  icon?: string;
  color?: string;
  size?: number;
}

export const IconBounce: React.FC<IconBounceProps> = ({
  icon = 'star',
  color = '#C8A052',
  size = 60,
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
  const extraBounce = spring({
    frame: localFrame,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  const isIdle = anim.opacity >= 1 && anim.transform === 'none';
  const microBounce = isIdle
    ? interpolate(frame % 45, [0, 22, 45], [1, 1.04, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const bScale = anim.transform === 'none' ? microBounce * (0.5 + extraBounce * 0.5) : 1;
  const pathD = defaultPaths[icon] || icon;

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
          transform: `scale(${bScale})`,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          style={{
            filter: `drop-shadow(0 2px 8px rgba(${hexToRgb(color)}, 0.5))`,
          }}
        >
          <path d={pathD} fill={color} opacity={0.9} />
        </svg>
      </div>
    </div>
  );
};
