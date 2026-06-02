// StatCard — 数据统计网格卡 (zhuzige)
// 横向排列多个关键数据，逐个弹性入场
// 复用: 数据展示场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, OverlayElementBase } from './animation';
import { ICON_MAP } from './iconMap';

interface StatItem {
  icon?: string;
  value: string;
  label: string;
  enLabel?: string;
}

interface StatCardProps extends OverlayElementBase {
  stats: StatItem[];
  columns?: number;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  stats,
  columns = 3,
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
  const gridCols = Math.min(columns, stats.length);

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
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: 24,
          width: '90%',
          maxWidth: 880,
        }}
      >
        {stats.map((stat, i) => {
          const localFrame = Math.max(0, frame - enterAt - i * 8);
          const s = spring({
            frame: localFrame,
            fps,
            config: { damping: 14, stiffness: 110, mass: 0.8 },
          });
          const scale = interpolate(s, [0, 1], [0.7, 1]);
          const opacity = interpolate(s, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '28px 16px',
                backgroundColor: hexToRgba(color, 0.08),
                borderRadius: 14,
                border: `1px solid ${hexToRgba(color, 0.25)}`,
                opacity,
                transform: `scale(${scale})`,
              }}
            >
              {stat.icon && ICON_MAP[stat.icon] && (
                <div style={{ marginBottom: 4 }}>
                  {React.createElement(ICON_MAP[stat.icon], { size: 36, color, strokeWidth: 2 })}
                </div>
              )}
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: C.text,
                  fontFamily: F.mono,
                  lineHeight: 1,
                  textShadow: `0 0 28px ${hexToRgba(color, 0.5)}`,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: C.textSecondary,
                  fontFamily: F.text,
                  lineHeight: 1.3,
                  textAlign: 'center',
                }}
              >
                {stat.label}
              </span>
              {stat.enLabel && (
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: F.text,
                    letterSpacing: '0.1em',
                    lineHeight: 1.2,
                    textAlign: 'center',
                  }}
                >
                  {stat.enLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
