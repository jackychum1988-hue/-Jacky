import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import {
  useOverlayAnimation,
  positionToStyle,
  hexToRgb,
  OverlayElementBase,
} from './animation';

interface ChangeItem {
  name: string;
  priceBefore: number;
  priceAfter: number;
  changePct: number;
}

interface RankingChangeListProps extends OverlayElementBase {
  title: string;
  items: ChangeItem[];
  color?: string;
}

const ROW_STAGGER = 15;

export const RankingChangeList: React.FC<RankingChangeListProps> = ({
  title,
  items,
  color = '#10B981',
  enterAt,
  exitAt,
  animation,
  position,
  offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });
  const rgb = hexToRgb(color);

  if (!anim.isVisible || items.length === 0) return null;

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
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          width: 920,
        }}
      >
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color,
            fontFamily: 'Georgia, "Noto Serif SC", serif',
            margin: '0 0 8px 0',
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </h2>

        {items.map((item, i) => {
          const rowFrame = frame - enterAt - i * ROW_STAGGER;
          if (rowFrame < 0) return null;

          const rowSpring = spring({
            frame: rowFrame,
            fps,
            config: { damping: 15, stiffness: 120 },
            durationInFrames: 20,
          });
          const rowX = interpolate(rowSpring, [0, 1], [-30, 0]);
          const isUp = item.changePct > 0;
          const arrowColor = isUp ? '#C8A052' : '#6B7B8D';
          const priceDisplay = Math.round(
            interpolate(rowSpring, [0, 1], [item.priceBefore, item.priceAfter]),
          );

          return (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 24px',
                backgroundColor: 'rgba(14,12,10,0.78)',
                borderRadius: 12,
                opacity: rowSpring,
                transform: `translateX(${rowX}px)`,
              }}
            >
              {/* Arrow direction — SVG */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  {isUp ? (
                    <polygon points="12,4 6,16 18,16" fill={arrowColor} />
                  ) : (
                    <polygon points="12,20 6,8 18,8" fill={arrowColor} />
                  )}
                </svg>
              </div>

              {/* Project name */}
              <span
                style={{
                  flex: '0 0 220px',
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#F5F0E8',
                  fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                }}
              >
                {item.name}
              </span>

              {/* Price: old → new */}
              <div
                style={{
                  flex: '0 0 260px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    color: '#8B7B68',
                    textDecoration: 'line-through',
                    fontFamily: '"SF Mono", monospace',
                  }}
                >
                  {item.priceBefore.toLocaleString()}
                </span>
                <span style={{ fontSize: 14, color: '#5A5550' }}>→</span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#F5F0E8',
                    fontFamily: '"SF Mono", monospace',
                  }}
                >
                  {priceDisplay.toLocaleString()}
                </span>
                <span style={{ fontSize: 14, color: '#8B7B68' }}>元/㎡</span>
              </div>

              {/* Change bar + percentage */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    height: 8,
                    width: `${Math.min(Math.abs(item.changePct) * 8, 200)}px`,
                    backgroundColor: arrowColor,
                    borderRadius: 4,
                    transform: `scaleX(${rowSpring})`,
                    transformOrigin: isUp ? 'left' : 'right',
                    marginLeft: isUp ? 0 : 'auto',
                    opacity: 0.7,
                  }}
                />
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: arrowColor,
                    fontFamily: '"SF Mono", monospace',
                    minWidth: 80,
                    textAlign: 'right',
                  }}
                >
                  {item.changePct > 0 ? '+' : ''}
                  {item.changePct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
