// FeatureGrid — 特性图标网格卡 (zhuzige)
// 图标 + 标签的网格布局，快速展示楼盘/产品特性
// 复用: 特性速览场景

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, hexToRgba, C, F, OverlayElementBase } from './animation';
import { ICON_MAP } from './iconMap';

interface FeatureItem {
  icon: string;
  label: string;
  enLabel?: string;
}

interface FeatureGridProps extends OverlayElementBase {
  items: FeatureItem[];
  columns?: number;
  color?: string;
  title?: string;
  enTitle?: string;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  items,
  columns = 3,
  color = '#10B981',
  title,
  enTitle,
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
  const gridCols = Math.min(columns, items.length);

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
      <div style={{ opacity: anim.opacity, width: '90%', maxWidth: 880 }}>
        {title && (
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: C.text,
              fontFamily: F.display,
              lineHeight: 1.2,
              margin: '0 0 6px 0',
              textShadow: `0 0 24px ${hexToRgba(color, 0.4)}`,
            }}
          >
            {title}
          </h2>
        )}
        {enTitle && (
          <p
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: F.text,
              letterSpacing: '0.1em',
              margin: '0 0 28px 0',
            }}
          >
            {enTitle}
          </p>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: 20,
          }}
        >
          {items.map((item, i) => {
            const localFrame = Math.max(0, frame - enterAt - i * 10);
            const s = spring({
              frame: localFrame,
              fps,
              config: { damping: 18, stiffness: 100, mass: 0.9 },
            });
            const itemOpacity = interpolate(s, [0, 1], [0, 1]);
            const y = interpolate(s, [0, 1], [30, 0]);

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  padding: '28px 16px',
                  backgroundColor: hexToRgba(color, 0.06),
                  borderRadius: 14,
                  border: `1.5px solid ${hexToRgba(color, 0.2)}`,
                  opacity: itemOpacity,
                  transform: `translateY(${y}px)`,
                }}
              >
                {ICON_MAP[item.icon] && (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      backgroundColor: hexToRgba(color, 0.18),
                      border: `2px solid ${hexToRgba(color, 0.4)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {React.createElement(ICON_MAP[item.icon], { size: 34, color: '#FFFFFF', strokeWidth: 2 })}
                  </div>
                )}
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: C.text,
                    fontFamily: F.text,
                    lineHeight: 1.3,
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </span>
                {item.enLabel && (
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: F.text,
                      letterSpacing: '0.1em',
                      textAlign: 'center',
                    }}
                  >
                    {item.enLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
