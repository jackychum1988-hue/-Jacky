import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgb, OverlayElementBase } from './animation';

interface MetricCardProps extends OverlayElementBase {
  icon?: string;
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'flat';
  color?: string;
}

const trendArrows: Record<string, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

const trendColors: Record<string, string> = {
  up: '#26C281',
  down: '#FF6B6B',
  flat: '#8A8278',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  trend,
  color = '#AB47BC',
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
      <div
        style={{
          opacity: anim.opacity,
          transform: anim.transform,
          padding: '24px 36px',
          backgroundColor: `rgba(${hexToRgb(color)}, 0.15)`,
          borderRadius: 16,
          border: `1px solid rgba(${hexToRgb(color)}, 0.3)`,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          minWidth: 200,
        }}
      >
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: `rgba(${hexToRgb(color)}, 0.25)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color,
              fontWeight: 700,
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: 18,
              color: '#B8B0A8',
              fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
            }}
          >
            {label}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              style={{
                fontSize: 44,
                fontWeight: 800,
                color,
                fontFamily: '"SF Mono", "JetBrains Mono", monospace',
                lineHeight: 1,
              }}
            >
              {value}
            </span>
            {trend && (
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: trendColors[trend],
                  fontFamily: 'monospace',
                }}
              >
                {trendArrows[trend]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
