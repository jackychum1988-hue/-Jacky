// FormulaCard — 公式推导卡 (v1)
// 结构: 标签 → 步骤逐行（表达式 + 解释 + 结果）→ 结果高亮
// 适用于: 计算公式、投资回报、税费拆解、面积换算

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useOverlayAnimation, positionToStyle, C, F, textDepth, hexToRgba, OverlayElementBase, RADIUS, idleFloat } from './animation';

interface FormulaStep {
  expression: string;
  explanation: string;
  result?: string;
  highlight?: boolean;
}

interface FormulaCardProps extends OverlayElementBase {
  label?: string;
  steps: FormulaStep[];
  color?: string;
  /** Disable Apple-style idle breathing/float when true */
  disableBreathing?: boolean;
}

// Parse "180万" → { num: 180, suffix: "万" }, skip if text
function parseNum(v: string): { num: number; suffix: string; isText: boolean } {
  const m = v.match(/^([\d,.]+)\s*(.*)$/);
  if (m) return { num: parseFloat(m[1].replace(/,/g, '')), suffix: m[2], isText: false };
  return { num: 0, suffix: v, isText: true };
}

function formatNum(num: number, orig: string): string {
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

export const FormulaCard: React.FC<FormulaCardProps> = ({
  label,
  steps,
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

  // ── Result highlight (if any step has result): 28f+ after last step ──
  const lastStepEnd = 8 + (steps.length - 1) * 10 + 14;

  // ── Idle float ──
  const floatY = disableBreathing ? 0 : idleFloat(frame, 1.5, 0.022);

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
            textShadow: textDepth(0.3), margin: '0 0 20px 0',
            opacity: labelOpacity * labelExit,
          }}>
            {label}
          </p>
        )}

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {steps.map((step, si) => {
            const itemDelay = 8 + si * 10;
            const itemFrame = Math.max(0, localFrame - itemDelay);
            const itemSpring = spring({ frame: itemFrame, fps, config: { damping: 22, stiffness: 85, mass: 1.1 } });
            const slideX = isExiting
              ? interpolate(exitP, [(steps.length - 1 - si) * 0.05, (steps.length - 1 - si) * 0.05 + 0.25], [0, 60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(itemSpring, [0, 1], [60, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const itemOpacity = isExiting
              ? interpolate(exitP, [(steps.length - 1 - si) * 0.04, (steps.length - 1 - si) * 0.04 + 0.15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : interpolate(itemSpring, [0, 1], [0, 1]);

            // Number counting for result
            const countDelay = itemDelay + 4;
            const countFrame = Math.max(0, localFrame - countDelay);
            const countSpring = spring({ frame: countFrame, fps, config: { damping: 10, stiffness: 80, mass: 0.6 } });
            const countProgress = isExiting ? interpolate(exitP, [0, 0.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : countSpring;

            const parsed = step.result ? parseNum(step.result) : { num: 0, suffix: '', isText: true };
            const displayResult = step.result
              ? (parsed.isText ? step.result : formatNum(interpolate(countProgress, [0, 1], [0, parsed.num]), step.result))
              : undefined;

            // Expression highlight glow (if step has highlight)
            const expressionGlow = step.highlight
              ? 1 + Math.sin(frame * 0.06) * 0.15
              : 1;

            return (
              <div key={si} style={{
                display: 'flex', alignItems: 'baseline', gap: 16,
                opacity: itemOpacity,
                transform: `translateX(${slideX}px)`,
                padding: step.highlight ? '12px 16px' : '0 0',
                backgroundColor: step.highlight ? hexToRgba(color, 0.08) : 'transparent',
                borderRadius: step.highlight ? RADIUS.panel : 0,
                border: step.highlight ? `1px solid ${hexToRgba(color, 0.2)}` : 'none',
              }}>
                {/* Expression */}
                <span style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: step.highlight ? color : C.text,
                  fontFamily: F.mono,
                  lineHeight: 1.3,
                  textShadow: step.highlight ? `0 0 20px ${hexToRgba(color, 0.45 * expressionGlow)}` : textDepth(0.15),
                  minWidth: 80,
                }}>
                  {step.expression}
                </span>

                {/* Equals sign */}
                {step.result && (
                  <span style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: F.mono,
                  }}>
                    =
                  </span>
                )}

                {/* Result value (with counting) */}
                {displayResult && (
                  <span style={{
                    fontSize: 36,
                    fontWeight: 900,
                    color,
                    fontFamily: F.mono,
                    textShadow: `0 0 28px ${hexToRgba(color, 0.5)}`,
                    lineHeight: 1,
                  }}>
                    {displayResult}
                  </span>
                )}

                {/* Separator */}
                {(step.explanation || step.result) && (
                  <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 20 }}>|</span>
                )}

                {/* Explanation */}
                <span style={{
                  fontSize: 26,
                  fontWeight: 400,
                  color: C.textSecondary,
                  fontFamily: F.text,
                  lineHeight: 1.5,
                  flex: 1,
                }}>
                  {step.explanation}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
