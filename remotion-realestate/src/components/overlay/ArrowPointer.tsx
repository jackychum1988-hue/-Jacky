import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgb, OverlayElementBase } from './animation';

type ArrowDirection = 'up' | 'down' | 'left' | 'right';

interface ArrowPointerProps extends OverlayElementBase {
  direction?: ArrowDirection;
  color?: string;
  label?: string;
}

const arrowPaths: Record<ArrowDirection, string> = {
  right: 'M0,30 L50,30 L50,10 L90,35 L50,60 L50,40 L0,40 Z',
  left:  'M90,30 L40,30 L40,10 L0,35 L40,60 L40,40 L90,40 Z',
  down:  'M30,0 L30,50 L10,50 L35,90 L60,50 L40,50 L40,0 Z',
  up:    'M30,90 L30,40 L10,40 L35,0 L60,40 L40,40 L40,90 Z',
};

export const ArrowPointer: React.FC<ArrowPointerProps> = ({
  direction = 'right',
  color = '#FF6B6B',
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

  const isVertical = direction === 'up' || direction === 'down';

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
          transform: anim.transform,
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <svg
          width={90}
          height={90}
          viewBox="0 0 90 90"
          style={{
            filter: `drop-shadow(0 2px 8px rgba(${hexToRgb(color)}, 0.5))`,
          }}
        >
          <path d={arrowPaths[direction]} fill={color} opacity={0.9} />
        </svg>
        {label && (
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#F5F0EB',
              fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              backgroundColor: `rgba(${hexToRgb(color)}, 0.25)`,
              padding: '6px 16px',
              borderRadius: 8,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
