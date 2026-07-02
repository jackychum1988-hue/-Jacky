// RadarChart — 雷达图 (v1)
// SVG极坐标: 同心多边形网格 + N条轴线 + 数据多边形 + 端点标签
// 适用于: 楼盘多维度评分、产品综合评估、竞品对比

import React, { useRef } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface RadarDimension {
  name: string;
  value: number; // 0-100
  enName?: string;
}

interface RadarChartProps extends OverlayElementBase {
  label?: string;
  dimensions: RadarDimension[];
  color?: string;
  disableBreathing?: boolean;
}

// Polar to Cartesian
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export const RadarChart: React.FC<RadarChartProps> = ({
  label,
  dimensions,
  color = '#1A56DB',
  disableBreathing = false,
  enterAt, exitAt, animation, position, offset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anim = useOverlayAnimation(frame, fps, { enterAt, exitAt, animation });
  if (!anim.isVisible) return null;

  const posStyle = positionToStyle(position, offset);
  const localFrame = Math.max(0, frame - enterAt);
  const isExiting = anim.phase === 'exit';
  const exitP = anim.phaseProgress;

  const uid = useRef(0).current++;
  const SVG_W = 420, SVG_H = 420, CX = 210, CY = 210, MAX_R = 150;
  const N = dimensions.length;
  if (N < 3) return null;
  const angleStep = 360 / N;

  // ── Label: 0-12f ──
  const labelOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Grid rings: 10-20f ──
  const gridOpacity = interpolate(localFrame, [10, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Axis lines: 12-22f ──
  const axisSpring = spring({ frame: Math.max(0, localFrame - 12), fps, config: { damping: 20, stiffness: 80, mass: 1.0 } });
  const axisProgress = isExiting ? interpolate(exitP, [0, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : axisSpring;

  // ── Labels: 16-30f ──
  const labelOpacity2 = interpolate(localFrame, [16, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Data polygon: 18-34f scale from center ──
  const dataSpring = spring({ frame: Math.max(0, localFrame - 18), fps, config: { damping: 18, stiffness: 90, mass: 0.9 } });
  const dataProgress = isExiting ? interpolate(exitP, [0, 0.35], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(dataSpring, [0, 1], [0, 1]);

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  // Build data polygon points
  const dataPoints = dimensions.map((d, i) => {
    const r = (d.value / 100) * MAX_R * dataProgress;
    const pt = polarToCartesian(CX, CY, r, i * angleStep);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  // Build grid polygons (5 rings: 20%, 40%, 60%, 80%, 100%)
  const gridRings = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridRings.map(frac => {
    return dimensions.map((_, i) => {
      const pt = polarToCartesian(CX, CY, MAX_R * frac, i * angleStep);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  });

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: posStyle.display, justifyContent: posStyle.justifyContent,
      alignItems: posStyle.alignItems, padding: posStyle.padding,
      transform: posStyle.transform, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <div style={{
        opacity: anim.opacity,
        transform: `translateY(${floatY}px)`,
        maxWidth: posStyle.maxWidth ?? 880,
        width: '100%',
        padding: '36px 40px 32px 48px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `0 0 32px ${hexToRgba(color, 0.18)}, 0 0 72px ${hexToRgba(color, 0.06)}, inset 0 1px 0 ${hexToRgba(color, 0.15)}, inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 5, borderRadius: '0 9px 9px 0', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}` }} />

        {label && (
          <p style={{ fontSize: 36, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 16px 0', textAlign: 'center', opacity: labelOpacity * labelExit }}>
            {label}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            <defs>
              <linearGradient id={`rd-fill-${uid}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={hexToRgba(color, 0.35)} />
                <stop offset="100%" stopColor={hexToRgba(color, 0.08)} />
              </linearGradient>
            </defs>

            {/* Grid polygons */}
            {gridPolygons.map((pts, gi) => (
              <polygon key={gi} points={pts} fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth={gi === gridPolygons.length - 1 ? 1.5 : 0.8}
                opacity={gridOpacity * (0.4 + gi * 0.15)}
              />
            ))}

            {/* Axis lines */}
            {dimensions.map((_, i) => {
              const endPt = polarToCartesian(CX, CY, MAX_R, i * angleStep);
              const dashLen = Math.sqrt((endPt.x - CX) ** 2 + (endPt.y - CY) ** 2);
              return (
                <line key={i} x1={CX} y1={CY} x2={endPt.x} y2={endPt.y}
                  stroke="rgba(255,255,255,0.1)" strokeWidth={1}
                  strokeDasharray={dashLen} strokeDashoffset={(1 - axisProgress) * dashLen}
                  opacity={axisSpring}
                />
              );
            })}

            {/* Data polygon */}
            <polygon points={dataPoints} fill={`url(#rd-fill-${uid})`}
              stroke={color} strokeWidth={2.5} strokeLinejoin="round"
              opacity={dataSpring}
            />

            {/* Data points */}
            {dimensions.map((d, i) => {
              const r = (d.value / 100) * MAX_R * dataProgress;
              const pt = polarToCartesian(CX, CY, r, i * angleStep);
              return (
                <circle key={i} cx={pt.x} cy={pt.y} r={5}
                  fill={color} stroke={C.text} strokeWidth={1.5}
                  opacity={dataSpring}
                />
              );
            })}

            {/* Dimension labels at axis endpoints */}
            {dimensions.map((d, i) => {
              const pt = polarToCartesian(CX, CY, MAX_R + 28, i * angleStep);
              const angle = i * angleStep;
              // Determine text-anchor based on position
              let anchor = 'middle';
              if (angle > 10 && angle < 170) anchor = 'middle';
              else if (angle >= 170 && angle <= 190) anchor = 'middle';
              else if (angle > 190 && angle < 350) anchor = 'middle';

              return (
                <text key={i} x={pt.x} y={pt.y}
                  fill={C.textSecondary}
                  fontSize={20} fontWeight={600}
                  fontFamily={F.text}
                  textAnchor={anchor}
                  opacity={labelOpacity2}
                >
                  {d.name}
                  {d.enName && (
                    <tspan x={pt.x} dy={22} fill="rgba(255,255,255,0.4)" fontSize={16} fontWeight={400} fontFamily={F.text}>
                      {d.enName}
                    </tspan>
                  )}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Value legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, opacity: labelOpacity2 }}>
          {dimensions.slice(0, 5).map((d, i) => (
            <span key={i} style={{ fontSize: 18, fontWeight: 600, color: C.textSecondary, fontFamily: F.mono }}>
              {d.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
