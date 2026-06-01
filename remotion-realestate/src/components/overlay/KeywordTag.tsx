import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgb, OverlayElementBase } from './animation';

interface KeywordTagProps extends OverlayElementBase {
  text: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<string, number> = { sm: 28, md: 40, lg: 56 };

export const KeywordTag: React.FC<KeywordTagProps> = ({
  text,
  color = '#5599FF',
  size = 'md',
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

  const fontSize = sizeMap[size];
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
      <div
        style={{
          opacity: anim.opacity,
          transform: anim.transform,
          padding: `${fontSize * 0.4}px ${fontSize * 1.2}px`,
          backgroundColor: `rgba(${hexToRgb(color)}, 0.22)`,
          borderRadius: fontSize * 0.3,
          border: `1px solid rgba(${hexToRgb(color)}, 0.4)`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 700,
            color,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Noto Sans SC", sans-serif',
            textShadow: `0 2px 12px rgba(${hexToRgb(color)}, 0.4)`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
