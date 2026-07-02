// MatrixCard — 四象限矩阵卡 (v1)
// 结构: 标签 → 2×2 Grid + SVG十字轴 + 轴标签
// 适用于: 风险vs回报、价格vs品质、SWOT分析

import React, { useRef } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface MatrixQuadrant {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  label: string;
  items: string[];
  enLabel?: string;
}

interface MatrixCardProps extends OverlayElementBase {
  label?: string;
  xAxis: { low: string; high: string };
  yAxis: { low: string; high: string };
  quadrants: MatrixQuadrant[];
  color?: string;
  disableBreathing?: boolean;
}

export const MatrixCard: React.FC<MatrixCardProps> = ({
  label,
  xAxis,
  yAxis,
  quadrants,
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

  // ── Label: 0-12f ──
  const labelOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Axis lines: 6-18f (stroke-dashoffset) ──
  const axisSpring = spring({ frame: Math.max(0, localFrame - 6), fps, config: { damping: 20, stiffness: 80, mass: 1.0 } });
  const axisProgress = isExiting ? interpolate(exitP, [0, 0.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : axisSpring;

  // ── Axis labels: 10-22f ──
  const axisLabelOpacity = interpolate(localFrame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  const SVG_W = 400, SVG_H = 400, CX = 200, CY = 200;

  const posMap: Record<string, { top: number; left: number }> = {
    'top-left':     { top: 0,   left: 0 },
    'top-right':    { top: 0,   left: 1 },
    'bottom-left':  { top: 1,   left: 0 },
    'bottom-right': { top: 1,   left: 1 },
  };

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
        padding: '36px 44px 32px 52px',
        backgroundColor: 'rgba(10,8,6,0.55)',
        borderRadius: 18,
        border: `1.5px solid ${hexToRgba(color, 0.45)}`,
        boxShadow: `0 0 32px ${hexToRgba(color, 0.18)}, 0 0 72px ${hexToRgba(color, 0.06)}, inset 0 1px 0 ${hexToRgba(color, 0.15)}, inset 0 -1px 0 rgba(0,0,0,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 5, borderRadius: '0 9px 9px 0', backgroundColor: color, boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}` }} />

        {label && (
          <p style={{ fontSize: 36, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 20px 0', opacity: labelOpacity * labelExit }}>
            {label}
          </p>
        )}

        {/* 2×2 Quadrant Grid with SVG axis overlay */}
        <div style={{ position: 'relative', width: '100%' }}>
          {/* SVG cross axis */}
          <svg width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
            <defs>
              <linearGradient id={`mx-h-${uid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor={hexToRgba(color, 0.3)} />
                <stop offset="80%" stopColor={hexToRgba(color, 0.3)} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id={`mx-v-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor={hexToRgba(color, 0.3)} />
                <stop offset="80%" stopColor={hexToRgba(color, 0.3)} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* Vertical axis */}
            <line x1={CX} y1={0} x2={CX} y2={SVG_H} stroke={`url(#mx-v-${uid})`} strokeWidth={2}
              strokeDasharray={SVG_H} strokeDashoffset={(1 - axisProgress) * SVG_H} />
            {/* Horizontal axis */}
            <line x1={0} y1={CY} x2={SVG_W} y2={CY} stroke={`url(#mx-h-${uid})`} strokeWidth={2}
              strokeDasharray={SVG_W} strokeDashoffset={(1 - axisProgress) * SVG_W} />
            {/* Y-axis labels */}
            <text x={CX - 12} y={18} fill="rgba(255,255,255,0.5)" fontSize={20} fontFamily={F.text} textAnchor="end" opacity={axisLabelOpacity}>{yAxis.high}</text>
            <text x={CX - 12} y={SVG_H - 14} fill="rgba(255,255,255,0.5)" fontSize={20} fontFamily={F.text} textAnchor="end" opacity={axisLabelOpacity}>{yAxis.low}</text>
            {/* X-axis labels */}
            <text x={18} y={CY - 12} fill="rgba(255,255,255,0.5)" fontSize={20} fontFamily={F.text} textAnchor="start" opacity={axisLabelOpacity}>{xAxis.low}</text>
            <text x={SVG_W - 18} y={CY - 12} fill="rgba(255,255,255,0.5)" fontSize={20} fontFamily={F.text} textAnchor="end" opacity={axisLabelOpacity}>{xAxis.high}</text>
          </svg>

          {/* Quadrant grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', minHeight: SVG_H, position: 'relative', zIndex: 1 }}>
            {quadrants.map((q, qi) => {
              const pos = posMap[q.position];
              if (!pos) return null;
              const qDelay = 14 + qi * 6;
              const qFrame = Math.max(0, localFrame - qDelay);
              const qSpring = spring({ frame: qFrame, fps, config: { damping: 24, stiffness: 75, mass: 1.2 } });
              const qOpacity = isExiting
                ? interpolate(exitP, [(quadrants.length - 1 - qi) * 0.05, (quadrants.length - 1 - qi) * 0.05 + 0.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(qSpring, [0, 1], [0, 1]);
              const qScale = isExiting
                ? interpolate(exitP, [(quadrants.length - 1 - qi) * 0.04, (quadrants.length - 1 - qi) * 0.04 + 0.15], [1, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(qSpring, [0, 1], [0.96, 1]);

              return (
                <div key={qi} style={{
                  padding: '16px 12px',
                  opacity: qOpacity,
                  transform: `scale(${qScale})`,
                  display: 'flex', flexDirection: 'column',
                }}>
                  <p style={{
                    fontSize: 24, fontWeight: 700, color, fontFamily: F.text,
                    margin: '0 0 8px 0', lineHeight: 1.2,
                    textShadow: `0 0 12px ${hexToRgba(color, 0.3)}`,
                  }}>
                    {q.label}
                  </p>
                  {q.enLabel && (
                    <p style={{ fontSize: enFontSize(24), fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em', margin: '0 0 8px 0' }}>
                      {q.enLabel}
                    </p>
                  )}
                  {q.items.map((item, ii) => {
                    const iDelay = qDelay + 4 + ii * 4;
                    const iFrame = Math.max(0, localFrame - iDelay);
                    const iOpacity = interpolate(iFrame, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    return (
                      <div key={ii} style={{ display: 'flex', alignItems: 'baseline', gap: 6, opacity: iOpacity, marginBottom: 4 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: hexToRgba(color, 0.5), flexShrink: 0, marginTop: 7 }} />
                        <span style={{ fontSize: 20, color: C.textSecondary, fontFamily: F.text, lineHeight: 1.4 }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
