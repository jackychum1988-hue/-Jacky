// ROICard — 投资回报卡 (v1)
// 结构: 标签 → 投资额(大字) → 回报行 → 三列KPI汇总
// 适用于: 投资回报分析、租金回报率、回本周期、收益对比

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat, settleBounce } from './animation';
import { ICON_MAP } from './iconMap';

interface ROIReturn {
  label: string;
  value: string;
  period?: string;
}

interface ROISummary {
  totalReturn: string;
  annualRate: string;
  paybackYears: string;
}

interface ROICardProps extends OverlayElementBase {
  label?: string;
  investment: string;
  returns: ROIReturn[];
  summary: ROISummary;
  color?: string;
  /** Disable Apple-style idle breathing/float/settle when true */
  disableBreathing?: boolean;
}

// Parse "180万" → { num: 180, suffix: "万" }
function parseValue(v: string): { num: number; suffix: string; isText: boolean } {
  const m = v.match(/^([\d,.]+)\s*(.*)$/);
  if (m) return { num: parseFloat(m[1].replace(/,/g, '')), suffix: m[2], isText: false };
  return { num: 0, suffix: v, isText: true };
}

function formatCounted(num: number, orig: string): string {
  const m = orig.match(/^([\d,.]+)\s*(.*)$/);
  if (!m) return orig;
  const decimals = m[1].includes('.') ? m[1].split('.')[1].length : 0;
  const formatted = num.toFixed(decimals);
  if (m[1].includes(',')) {
    const parts = formatted.split('.');
    parts[0] = parseInt(parts[0]).toLocaleString('en-US');
    return parts.join('.') + m[2];
  }
  return formatted + m[2];
}

export const ROICard: React.FC<ROICardProps> = ({
  label,
  investment,
  returns,
  summary,
  color = '#F5A623',
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

  // ── Label: 0-12f ──
  const labelOpacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExit = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Investment amount: 6-20f, with settle bounce ──
  const invSpring = spring({ frame: Math.max(0, localFrame - 6), fps, config: { damping: 24, stiffness: 75, mass: 1.1 } });
  const invScale = isExiting
    ? interpolate(exitP, [0.4, 0.8], [1, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(invSpring, [0, 1], [0.9, 1]);
  const invSettle = disableBreathing ? { scale: 1, active: false } : settleBounce(Math.max(0, localFrame - 6), fps, 28);
  const invFinalScale = invScale * (invSettle.active ? invSettle.scale : 1);

  // Investment count-up
  const invParsed = parseValue(investment);
  const countSpring = spring({ frame: Math.max(0, localFrame - 6), fps, config: { damping: 10, stiffness: 80, mass: 0.6 } });
  const countProgress = isExiting ? interpolate(exitP, [0, 0.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : countSpring;
  const invDisplay = invParsed.isText ? investment : formatCounted(interpolate(countProgress, [0, 1], [0, invParsed.num]), investment);
  const invOpacity = isExiting ? interpolate(exitP, [0.3, 0.7], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : invSpring;

  // ── Return rows: 14f + i*8 stagger ──
  // ── Summary divider: after last return row ──
  const dividerDelay = 22 + (returns.length - 1) * 8;
  const dividerFrame = Math.max(0, localFrame - dividerDelay);
  const dividerSpring = spring({ frame: dividerFrame, fps, config: { damping: 14, stiffness: 100, mass: 0.7 } });
  const dividerWidth = isExiting
    ? interpolate(exitP, [0, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(dividerSpring, [0, 1], [0, 100]);

  // ── Summary KPI grid: 28f + (returns.length-1)*8 ──
  const summaryDelay = 28 + (returns.length - 1) * 8;
  const summaryFrame = Math.max(0, localFrame - summaryDelay);
  const summarySpring = spring({ frame: summaryFrame, fps, config: { damping: 18, stiffness: 90, mass: 1.0 } });
  const summaryOpacity = isExiting
    ? interpolate(exitP, [0, 0.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(summarySpring, [0, 1], [0, 1]);

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.5, 0.022);

  // Summary KPI data
  const kpis = [
    { label: '总回报', value: summary.totalReturn, enLabel: 'Total Return' },
    { label: '年化率', value: summary.annualRate, enLabel: 'Annual Rate' },
    { label: '回本', value: summary.paybackYears, enLabel: 'Payback' },
  ];

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
        boxShadow: `
          0 0 32px ${hexToRgba(color, 0.18)},
          0 0 72px ${hexToRgba(color, 0.06)},
          inset 0 1px 0 ${hexToRgba(color, 0.15)},
          inset 0 -1px 0 rgba(0,0,0,0.3)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Left accent bar */}
        <div style={{
          position: 'absolute',
          left: 0, top: 9, bottom: 9,
          width: 5, borderRadius: '0 9px 9px 0',
          backgroundColor: color,
          boxShadow: `0 0 8px ${hexToRgba(color, 0.5)}, 0 0 18px ${hexToRgba(color, 0.2)}`,
        }} />

        {/* Label */}
        {label && (
          <p style={{
            fontSize: 36, fontWeight: 600, color, fontFamily: F.text,
            letterSpacing: '0.08em', lineHeight: 1.3,
            textShadow: textDepth(0.3), margin: '0 0 16px 0',
            opacity: labelOpacity * labelExit,
            textAlign: 'center',
          }}>
            {label}
          </p>
        )}

        {/* Investment amount */}
        <div style={{
          textAlign: 'center',
          opacity: invOpacity,
          transform: `scale(${invFinalScale})`,
          marginBottom: 24,
        }}>
          <p style={{
            fontSize: 64,
            fontWeight: 900,
            color,
            fontFamily: F.mono,
            margin: 0,
            lineHeight: 1,
            textShadow: `0 0 48px ${hexToRgba(color, 0.5)}, 0 0 96px ${hexToRgba(color, 0.2)}`,
          }}>
            {invDisplay}
          </p>
        </div>

        {/* Return rows */}
        {returns.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {returns.map((r, ri) => {
              const itemDelay = 14 + ri * 8;
              const itemFrame = Math.max(0, localFrame - itemDelay);
              const itemSpring = spring({ frame: itemFrame, fps, config: { damping: 22, stiffness: 85, mass: 1.1 } });
              const itemOpacity = isExiting
                ? interpolate(exitP, [(returns.length - 1 - ri) * 0.04, (returns.length - 1 - ri) * 0.04 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(itemSpring, [0, 1], [0, 1]);
              const itemX = isExiting
                ? interpolate(exitP, [(returns.length - 1 - ri) * 0.04, (returns.length - 1 - ri) * 0.04 + 0.2], [0, 30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : interpolate(itemSpring, [0, 1], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

              return (
                <div key={ri} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: RADIUS.panel,
                  opacity: itemOpacity,
                  transform: `translateX(${itemX}px)`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 26, fontWeight: 500, color: C.textSecondary, fontFamily: F.text }}>
                      {r.label}
                    </span>
                    {r.period && (
                      <span style={{ fontSize: 20, fontWeight: 400, color: 'rgba(255,255,255,0.35)', fontFamily: F.text }}>
                        {r.period}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: F.mono,
                    textShadow: textDepth(0.15),
                  }}>
                    {r.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div style={{
          width: '100%', height: 1,
          background: `linear-gradient(to right, transparent, ${hexToRgba(color, 0.4)}, transparent)`,
          marginBottom: 20,
          transform: `scaleX(${dividerWidth / 100})`,
          transformOrigin: 'center',
        }} />

        {/* Summary KPI grid */}
        <div style={{
          display: 'flex', justifyContent: 'space-around', gap: 12,
          opacity: summaryOpacity,
        }}>
          {kpis.map((kpi, ki) => (
            <div key={ki} style={{
              textAlign: 'center',
              flex: 1,
              padding: '12px 8px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: RADIUS.panel,
              border: `1px solid ${hexToRgba(color, 0.15)}`,
            }}>
              <p style={{
                fontSize: 32,
                fontWeight: 900,
                color,
                fontFamily: F.mono,
                margin: '0 0 6px 0',
                lineHeight: 1,
                textShadow: `0 0 20px ${hexToRgba(color, 0.3)}`,
              }}>
                {kpi.value}
              </p>
              <p style={{
                fontSize: 22,
                fontWeight: 600,
                color: C.textSecondary,
                fontFamily: F.text,
                margin: 0,
                lineHeight: 1.2,
              }}>
                {kpi.label}
              </p>
              <p style={{
                fontSize: 16,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: F.text,
                letterSpacing: '0.1em',
                margin: '2px 0 0 0',
              }}>
                {kpi.enLabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
