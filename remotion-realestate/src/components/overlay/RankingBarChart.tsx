import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import {
  useOverlayAnimation,
  positionToStyle,
  hexToRgb,
  OverlayElementBase,
} from './animation';

interface RankingItem {
  name: string;
  value: number;
  changePct?: number;
}

interface RankingBarChartProps extends OverlayElementBase {
  title: string;
  items: RankingItem[];
  unit: string;
  color?: string;
}

const BAR_HEIGHT = 52;
const BAR_GAP = 14;
const ROW_STAGGER = 15;
const MAX_BAR_WIDTH = 600;
const NAME_WIDTH = 280;
const BADGE_SIZE = 48;

export const RankingBarChart: React.FC<RankingBarChartProps> = ({
  title,
  items,
  unit,
  color = '#C8A052',
  enterAt,
  exitAt,
  animation,
  position,
  offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });

  if (!anim.isVisible || items.length === 0) return null;

  const posStyle = positionToStyle(position, offset);
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const totalHeight = items.length * (BAR_HEIGHT + BAR_GAP);

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
        }}
      >
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color,
            fontFamily: 'Georgia, "Noto Serif SC", serif',
            margin: '0 0 12px 0',
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </h2>

        <svg
          width={NAME_WIDTH + MAX_BAR_WIDTH + 140}
          height={totalHeight + 20}
          viewBox={`0 0 ${NAME_WIDTH + MAX_BAR_WIDTH + 140} ${totalHeight + 20}`}
        >
          <defs>
            <linearGradient id="bar-gold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
            <linearGradient id="bar-bronze" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B7355" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8B7355" stopOpacity={0.85} />
            </linearGradient>
          </defs>

          {items.map((item, i) => {
            const rowFrame = frame - enterAt - i * ROW_STAGGER;
            if (rowFrame < 0) return null;

            const barProgress = spring({
              frame: rowFrame,
              fps,
              config: { damping: 12, stiffness: 100 },
              durationInFrames: 30,
            });

            const barWidth = interpolate(
              barProgress,
              [0, 1],
              [0, (item.value / maxValue) * MAX_BAR_WIDTH],
            );

            const rowOpacity = interpolate(
              spring({
                frame: rowFrame,
                fps,
                config: { damping: 20, stiffness: 150 },
                durationInFrames: 15,
              }),
              [0, 1],
              [0, 1],
            );

            const valueDisplay = Math.round(
              interpolate(barProgress, [0, 1], [0, item.value]),
            );

            const y = i * (BAR_HEIGHT + BAR_GAP) + 10;
            const isTop3 = i < 3;
            const badgeFill = isTop3 ? 'url(#bar-gold)' : '#3A3530';
            const barFill = isTop3 ? 'url(#bar-gold)' : 'url(#bar-bronze)';

            return (
              <g key={item.name} opacity={rowOpacity}>
                {/* Rank badge */}
                <rect
                  x={0}
                  y={y}
                  width={BADGE_SIZE}
                  height={BAR_HEIGHT}
                  rx={10}
                  fill={badgeFill}
                />
                <text
                  x={BADGE_SIZE / 2}
                  y={y + BAR_HEIGHT / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isTop3 ? '#1A1815' : '#C8A052'}
                  fontSize={22}
                  fontWeight={800}
                  fontFamily={'"SF Mono", "JetBrains Mono", monospace'}
                >
                  {i + 1}
                </text>

                {/* Project name */}
                <text
                  x={BADGE_SIZE + 20}
                  y={y + BAR_HEIGHT / 2 + 1}
                  dominantBaseline="central"
                  fill="#F5F0E8"
                  fontSize={24}
                  fontWeight={600}
                  fontFamily={'"PingFang SC", "Microsoft YaHei", sans-serif'}
                >
                  {item.name}
                </text>

                {/* Bar */}
                <rect
                  x={BADGE_SIZE + 20 + NAME_WIDTH}
                  y={y + (BAR_HEIGHT - 24) / 2}
                  width={barWidth}
                  height={24}
                  rx={6}
                  fill={barFill}
                  opacity={0.9}
                />

                {/* Value */}
                <text
                  x={BADGE_SIZE + 20 + NAME_WIDTH + barWidth + 12}
                  y={y + BAR_HEIGHT / 2 + 1}
                  dominantBaseline="central"
                  fill={isTop3 ? color : '#C8BFA8'}
                  fontSize={26}
                  fontWeight={800}
                  fontFamily={'"SF Mono", "JetBrains Mono", monospace'}
                  opacity={barProgress}
                >
                  {valueDisplay}
                  <tspan
                    fontSize={16}
                    fontWeight={500}
                    fill="#8B7B68"
                  >
                    {' '}{unit}
                  </tspan>
                </text>

                {/* Change indicator */}
                {item.changePct !== undefined &&
                  item.changePct !== 0 &&
                  barProgress > 0.8 && (
                    <text
                      x={BADGE_SIZE + 20 + NAME_WIDTH + barWidth + 90}
                      y={y + BAR_HEIGHT / 2 + 1}
                      dominantBaseline="central"
                      fill={item.changePct > 0 ? '#C8A052' : '#6B7B8D'}
                      fontSize={20}
                      fontWeight={600}
                      fontFamily={'"SF Mono", "JetBrains Mono", monospace'}
                    >
                      {item.changePct > 0 ? '↑' : '↓'}
                      {Math.abs(item.changePct)}%
                    </text>
                  )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
