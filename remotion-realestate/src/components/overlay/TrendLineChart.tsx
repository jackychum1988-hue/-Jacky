import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import {
  useOverlayAnimation,
  positionToStyle,
  hexToRgb,
  OverlayElementBase,
} from './animation';

interface TrendLineChartProps extends OverlayElementBase {
  weeks: string[];
  prices: number[];
  title?: string;
  color?: string;
}

const CHART_W = 420;
const CHART_H = 220;
const PAD = { top: 20, right: 16, bottom: 32, left: 60 };

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  weeks,
  prices,
  title,
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
  const rgb = hexToRgb(color);

  if (!anim.isVisible || prices.length < 2) return null;

  const posStyle = positionToStyle(position, offset);
  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;

  const minPrice = Math.min(...prices) * 0.9;
  const maxPrice = Math.max(...prices) * 1.1;
  const priceRange = maxPrice - minPrice || 1;

  // Generate SVG path
  const linePath = prices
    .map((p, i) => {
      const x = PAD.left + (i / (prices.length - 1)) * plotW;
      const y =
        PAD.top + plotH - ((p - minPrice) / priceRange) * plotH;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  const lastX = PAD.left + plotW;
  const lastY =
    PAD.top +
    plotH -
    ((prices[prices.length - 1] - minPrice) / priceRange) * plotH;

  const areaPath = `${linePath} L${PAD.left + plotW},${PAD.top + plotH} L${PAD.left},${PAD.top + plotH} Z`;

  const pathLength = 800;
  const drawProgress = spring({
    frame: frame - enterAt - 10,
    fps,
    config: { damping: 20, stiffness: 80 },
    durationInFrames: 60,
  });

  const yTicks = 4;
  const yStep = priceRange / (yTicks + 1);

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
          padding: '24px 28px',
          backgroundColor: 'rgba(14,12,10,0.82)',
          borderRadius: 16,
          border: `1.5px solid rgba(${rgb},0.20)`,
        }}
      >
        {title && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color,
              fontFamily: 'Georgia, "Noto Serif SC", serif',
              marginBottom: 12,
            }}
          >
            {title}
          </div>
        )}

        <svg
          width={CHART_W}
          height={CHART_H}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        >
          <defs>
            <linearGradient id="area-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: yTicks }, (_, i) => {
            const y =
              PAD.top +
              plotH -
              (((i + 1) * yStep) / priceRange) * plotH;
            const label = Math.round(minPrice + (i + 1) * yStep);
            return (
              <g key={i} opacity={0.2}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={CHART_W - PAD.right}
                  y2={y}
                  stroke="#5A5550"
                  strokeWidth={0.5}
                />
                <text
                  x={PAD.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#8B7B68"
                  fontSize={12}
                  fontFamily={'"SF Mono", monospace'}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {weeks.map((w, i) => {
            const x = PAD.left + (i / (weeks.length - 1)) * plotW;
            return (
              <text
                key={i}
                x={x}
                y={CHART_H - 8}
                textAnchor="middle"
                fill="#8B7B68"
                fontSize={13}
                fontFamily={'"SF Mono", monospace'}
              >
                {w}
              </text>
            );
          })}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#area-fill)"
            opacity={interpolate(drawProgress, [0, 1], [0, 1])}
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={interpolate(
              drawProgress,
              [0, 1],
              [pathLength, 0],
            )}
          />

          {/* End dot */}
          {drawProgress > 0.85 && (
            <circle
              cx={lastX}
              cy={lastY}
              r={6}
              fill={color}
              opacity={interpolate(
                spring({
                  frame: frame - enterAt - 70,
                  fps,
                  config: { damping: 10, stiffness: 150 },
                  durationInFrames: 15,
                }),
                [0, 1],
                [0, 1],
              )}
            />
          )}

          {/* Current value label */}
          {drawProgress > 0.8 && (
            <text
              x={lastX}
              y={lastY - 14}
              textAnchor="end"
              fill={color}
              fontSize={15}
              fontWeight={700}
              fontFamily={'"SF Mono", monospace'}
            >
              {prices[prices.length - 1].toLocaleString()} 元/㎡
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};
