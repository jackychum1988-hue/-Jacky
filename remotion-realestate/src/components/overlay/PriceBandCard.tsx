// PriceBandCard — 价格带卡 (v1)
// CSS水平弹性条: 各段宽度 ∞ 价格跨度
// 适用于: 价格区间分布、楼盘档次分布、预算层级

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, enFontSize, idleFloat } from './animation';

interface PriceBand {
  range: string; // "200-300" or "300+"
  label: string;
  items: string[];
  enLabel?: string;
  color?: string;
}

interface PriceBandCardProps extends OverlayElementBase {
  label?: string;
  bands: PriceBand[];
  unit?: string;
  color?: string;
  disableBreathing?: boolean;
}

// Parse "200-300" → { min: 200, max: 300 }, "300+" → { min: 300, max: null }
function parseRange(r: string): { min: number; max: number | null; isOpen: boolean } {
  const cleaned = r.replace(/[^0-9\-]/g, '');
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    return { min: parseFloat(parts[0]), max: parseFloat(parts[1]), isOpen: false };
  }
  const num = parseFloat(cleaned);
  if (isNaN(num)) return { min: 0, max: null, isOpen: true };
  return { min: num, max: null, isOpen: true };
}

const BAND_COLORS = ['#10B981', '#06B6D4', '#1A56DB', '#8B5CF6', '#F5A623', '#FF4136'];

export const PriceBandCard: React.FC<PriceBandCardProps> = ({
  label,
  bands,
  unit = '万',
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
  const labelOpacityVal = interpolate(localFrame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelExitVal = isExiting ? interpolate(exitP, [0.5, 0.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.4, 0.022);

  // Calculate proportional widths
  const parsed = bands.map(b => parseRange(b.range));
  const minAll = Math.min(...parsed.map(p => p.min));
  const maxAll = Math.max(...parsed.map(p => p.max ?? p.min * 1.5));
  const totalSpan = maxAll - minAll || 1;
  const widths = parsed.map(p => {
    if (p.isOpen) return 20; // "300+" gets fixed minimum
    return Math.max(15, ((p.max! - p.min) / totalSpan) * 100);
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
          <p style={{ fontSize: 36, fontWeight: 600, color, fontFamily: F.text, letterSpacing: '0.08em', textShadow: textDepth(0.3), margin: '0 0 20px 0', textAlign: 'center', opacity: labelOpacityVal * labelExitVal }}>
            {label}
          </p>
        )}

        {/* Band bars */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
          {bands.map((b, bi) => {
            const barDelay = 8 + bi * 8;
            const barFrame = Math.max(0, localFrame - barDelay);
            const barSpringVal = spring({ frame: barFrame, fps, config: { damping: 12, stiffness: 100, mass: 0.8 } });
            const barWidth = isExiting
              ? interpolate(exitP, [(bands.length - 1 - bi) * 0.04, (bands.length - 1 - bi) * 0.04 + 0.2], [widths[bi], 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(barSpringVal, [0, 1], [0, widths[bi]]);
            const barOpacity = isExiting
              ? interpolate(exitP, [(bands.length - 1 - bi) * 0.03, (bands.length - 1 - bi) * 0.03 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(barSpringVal, [0, 1], [0, 1]);

            const bColor = b.color || BAND_COLORS[bi % BAND_COLORS.length];

            return (
              <div key={bi} style={{
                flex: `${widths[bi]} 0 0`,
                minWidth: 0,
                opacity: barOpacity,
              }}>
                {/* Range label above bar */}
                <p style={{
                  fontSize: 20, fontWeight: 700, color: bColor,
                  fontFamily: F.mono, margin: '0 0 4px 0', textAlign: 'center',
                  textShadow: `0 0 8px ${hexToRgba(bColor, 0.3)}`,
                }}>
                  {b.range}{unit}
                </p>

                {/* Bar */}
                <div style={{
                  height: 32,
                  borderRadius: 4,
                  background: `linear-gradient(to bottom, ${hexToRgba(bColor, 0.3)}, ${bColor})`,
                  boxShadow: `0 0 16px ${hexToRgba(bColor, 0.3)}`,
                  width: `${barWidth}%`,
                  minWidth: barWidth > 5 ? undefined : 0,
                  margin: '0 auto',
                }} />

                {/* Band label + items below bar */}
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <p style={{
                    fontSize: 22, fontWeight: 600, color: bColor,
                    fontFamily: F.text, margin: '0 0 4px 0',
                  }}>
                    {b.label}
                  </p>
                  {b.enLabel && (
                    <p style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontFamily: F.text, letterSpacing: '0.1em', margin: '0 0 4px 0' }}>
                      {b.enLabel}
                    </p>
                  )}
                  {b.items.map((item, ii) => {
                    const iDelay = barDelay + 6 + ii * 4;
                    const iFrame = Math.max(0, localFrame - iDelay);
                    const iOpacity = interpolate(iFrame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    return (
                      <p key={ii} style={{ fontSize: 16, color: C.textSecondary, fontFamily: F.text, margin: '2px 0', opacity: iOpacity }}>
                        {item}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
