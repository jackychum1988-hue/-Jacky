import React, { useRef } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import {
  useOverlayAnimation,
  positionToStyle,
  hexToRgba,
  OverlayElementBase,
  F,
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

const BAR_HEIGHT = 48;
const BAR_GAP = 10;
const ROW_STAGGER = 15;
const MAX_BAR_WIDTH = 580;
const NAME_WIDTH = 240;
const BADGE_SIZE = 44;
const CHART_PADDING = 24;

// Simple unique ID counter to avoid SVG gradient ID conflicts
let uidCounter = 0;

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

  // Unique IDs for this instance to avoid gradient conflicts
  const uid = useRef(++uidCounter).current;

  if (!anim.isVisible || items.length === 0) return null;

  const posStyle = positionToStyle(position, offset);
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const svgW = NAME_WIDTH + MAX_BAR_WIDTH + 160;
  const svgH = items.length * (BAR_HEIGHT + BAR_GAP) + CHART_PADDING * 2;

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
          padding: '28px 36px',
          backgroundColor: 'rgba(10,8,6,0.38)',
          borderRadius: 16,
          border: `1px solid ${hexToRgba(color, 0.15)}`,
        }}
      >
        <h2
          style={{
            fontSize: 38,
            fontWeight: 700,
            color,
            fontFamily: F.display,
            margin: '0 0 18px 8px',
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </h2>

        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
        >
          <defs>
            <linearGradient id={`bar-gold-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
            <linearGradient id={`bar-bronze-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6B7B8D" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#8B9DAD" stopOpacity={0.75} />
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

            const y = CHART_PADDING + i * (BAR_HEIGHT + BAR_GAP);
            const isTop3 = i < 3;
            const badgeFill = isTop3
              ? `url(#bar-gold-${uid})`
              : 'rgba(90,84,70,0.60)';
            const barFill = isTop3
              ? `url(#bar-gold-${uid})`
              : `url(#bar-bronze-${uid})`;

            return (
              <g key={item.name} opacity={rowOpacity}>
                {/* Row background strip (subtle alternating) */}
                <rect
                  x={0}
                  y={y}
                  width={svgW}
                  height={BAR_HEIGHT}
                  rx={10}
                  fill={i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)'}
                />

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
                  fill={isTop3 ? '#1A1815' : '#F5F0E8'}
                  fontSize={20}
                  fontWeight={800}
                  fontFamily={F.mono}
                >
                  {i + 1}
                </text>

                {/* Project name */}
                <text
                  x={BADGE_SIZE + 16}
                  y={y + BAR_HEIGHT / 2 + 1}
                  dominantBaseline="central"
                  fill="#F5F0E8"
                  fontSize={23}
                  fontWeight={600}
                  fontFamily={F.text}
                >
                  {item.name}
                </text>

                {/* Bar */}
                <rect
                  x={BADGE_SIZE + 16 + NAME_WIDTH}
                  y={y + (BAR_HEIGHT - 26) / 2}
                  width={barWidth}
                  height={26}
                  rx={7}
                  fill={barFill}
                  opacity={0.9}
                />

                {/* Value */}
                <text
                  x={BADGE_SIZE + 16 + NAME_WIDTH + barWidth + 12}
                  y={y + BAR_HEIGHT / 2 + 1}
                  dominantBaseline="central"
                  fill={isTop3 ? color : '#C8BFA8'}
                  fontSize={24}
                  fontWeight={800}
                  fontFamily={F.mono}
                  opacity={barProgress}
                >
                  {valueDisplay}
                  <tspan fontSize={15} fontWeight={500} fill="#8B7B68">
                    {' '}{unit}
                  </tspan>
                </text>

                {/* Change indicator arrow + percentage */}
                {item.changePct !== undefined &&
                  item.changePct !== 0 &&
                  barProgress > 0.8 && (
                    <g>
                      {/* SVG arrow */}
                      <polygon
                        points={
                          item.changePct > 0
                            ? `${svgW - 90},${y + BAR_HEIGHT / 2 - 8} ${svgW - 90},${y + BAR_HEIGHT / 2 + 8} ${svgW - 78},${y + BAR_HEIGHT / 2}`
                            : `${svgW - 90},${y + BAR_HEIGHT / 2 + 8} ${svgW - 90},${y + BAR_HEIGHT / 2 - 8} ${svgW - 78},${y + BAR_HEIGHT / 2}`
                        }
                        fill={item.changePct > 0 ? color : '#6B7B8D'}
                      />
                      <text
                        x={svgW - 72}
                        y={y + BAR_HEIGHT / 2 + 1}
                        dominantBaseline="central"
                        fill={item.changePct > 0 ? color : '#6B7B8D'}
                        fontSize={19}
                        fontWeight={700}
                        fontFamily={F.mono}
                      >
                        {Math.abs(item.changePct)}%
                      </text>
                    </g>
                  )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
