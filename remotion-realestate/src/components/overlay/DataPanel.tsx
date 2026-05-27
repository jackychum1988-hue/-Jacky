import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useOverlayAnimation, positionToStyle, useTypewriterProgress, hexToRgb, OverlayElementBase } from './animation';

interface DataPanelProps extends OverlayElementBase {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}

export const DataPanel: React.FC<DataPanelProps> = ({
  title,
  value,
  subtitle,
  color = '#26C281',
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

  const isTypewriter = animation === 'typewriter';
  const titleProgress = isTypewriter ? useTypewriterProgress(frame, enterAt, title.length, 2) : title.length;
  const displayedTitle = title.slice(0, titleProgress);

  const valueDelay = isTypewriter ? enterAt + title.length * 2 + 10 : enterAt;
  const valueLocal = Math.max(0, frame - valueDelay);
  const valueOpacity = isTypewriter ? Math.min(1, valueLocal / 15) : 1;

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
          padding: '32px 48px',
          backgroundColor: `rgba(${hexToRgb(color)}, 0.16)`,
          borderRadius: 20,
          border: `1px solid rgba(${hexToRgb(color)}, 0.35)`,
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minWidth: 260,
          maxWidth: 480,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: `rgba(${hexToRgb(color)}, 0.85)`,
            fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          {displayedTitle}
          {isTypewriter && titleProgress < title.length && (
            <span style={{ opacity: frame % 15 < 7 ? 1 : 0, color }}>|</span>
          )}
        </span>
        <span
          style={{
            fontSize: 64,
            fontWeight: 800,
            color,
            fontFamily: '"SF Mono", "JetBrains Mono", monospace',
            textShadow: `0 3px 16px rgba(${hexToRgb(color)}, 0.45)`,
            lineHeight: 1.1,
            opacity: valueOpacity,
          }}
        >
          {value}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: 22,
              color: '#B8B0A8',
              fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
              opacity: valueOpacity,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
